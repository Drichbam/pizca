# Pizca

App de repostería para calcular costes, adaptar recetas a distintos moldes y gestionar un recetario personal con fotos.

## Stack Tecnológico

- **Frontend:** React + TypeScript (generado con Lovable)
- **Backend/DB/Auth/Storage:** Lovable Cloud (Supabase gestionado internamente por Lovable)
- **Hosting:** Lovable Cloud (deploy integrado, con opción futura de migrar a Vercel + Supabase propio)
- **Estilos:** Tailwind CSS
- **APIs externas:**
  - Open Food Facts API v2 (datos de producto por código de barras)
  - Open Prices API v1 (precios comunitarios crowdsourced)

> **Nota:** Lovable Cloud gestiona la instancia de Supabase automáticamente. No hay proyecto Supabase separado. La base de datos, auth y storage se administran desde el panel Cloud dentro de Lovable. El código sigue usando el cliente `@supabase/supabase-js` normalmente.

## Diseño

- **Primario:** `#E8784A` (naranja cálido)
- **Secundario:** `#2B4C7E` (azul oscuro)
- **Fondo:** `#FFF8F0` (crema) / `#FAFAF8` (gris cálido)
- **Éxito:** `#3DA06E` / **Error:** `#D94444`
- **Tipografía:** DM Sans (Google Fonts)
- **Bordes redondeados:** 12-16px en tarjetas, 8-10px en inputs
- **Sombras:** sutiles, `0 2px 12px rgba(0,0,0,0.06)`

## Estructura del Proyecto

```
pizca/
├── src/
│   ├── components/        # Componentes reutilizables (RecipeCard, Chip, BottomNav...)
│   ├── pages/             # Páginas principales de la app
│   ├── hooks/             # Custom hooks (useRecipes, usePrices, useMoldCalculator...)
│   ├── services/          # Lógica de APIs externas
│   │   ├── openfoodfacts.ts   # Integración Open Food Facts
│   │   ├── openprices.ts      # Integración Open Prices
│   │   └── supabase.ts        # Cliente y helpers de Supabase
│   ├── lib/               # Utilidades y helpers
│   │   ├── calculations.ts    # Fórmulas de moldes, costes, redondeo
│   │   └── constants.ts       # Colores, categorías, unidades
│   └── types/             # TypeScript interfaces y types
├── supabase/
│   └── migrations/        # Migraciones SQL de la base de datos
├── public/
├── docs/
│   └── PRD.md             # Product Requirements Document
└── CLAUDE.md              # Este archivo
```

## Modelo de Datos (Supabase / PostgreSQL)

### Tablas principales

```sql
-- Usuarios (gestionado por Supabase Auth, extendido con perfil)
profiles (id UUID PK → auth.users, display_name, avatar_url, created_at)

-- Recetas
recipes (id UUID PK, user_id FK → profiles, slug TEXT UNIQUE,
         title TEXT, description TEXT, photo_url TEXT,
         category TEXT, subcategory TEXT,
         servings INT, mold TEXT,
         prep_time_min INT, bake_time_min INT, rest_time_min INT,
         total_active_min INT, temperature INT,
         difficulty ENUM [basico, intermedio, avanzado, experto],
         planning_days INT,              -- días de antelación (J-3, J-2...)
         origin_chef TEXT, origin_url TEXT, origin_book TEXT,
         tested BOOLEAN DEFAULT false, test_notes TEXT, rating INT,
         created_at, updated_at)

-- Planning multi-día (recetas complejas tipo entremets)
recipe_planning (id UUID PK, recipe_id FK → recipes,
                 day_label TEXT,          -- "J-3", "J-2", "J-1", "Día J"
                 tasks TEXT[],            -- array de tareas del día
                 sort_order INT)

-- Componentes (agrupan ingredientes en recetas compuestas)
recipe_components (id UUID PK, recipe_id FK → recipes,
                   name TEXT,             -- "Pâte sablée", "Ganache", "" si receta simple
                   sort_order INT)

-- Ingredientes (ahora referencia componente, no receta directamente)
recipe_ingredients (id UUID PK, component_id FK → recipe_components,
                    name TEXT, quantity DECIMAL, unit TEXT,
                    sort_order INT)
-- Unidades soportadas: g, kg, ml, cl, dl, l, pcs, QS, cc, cs, pincée

-- Pasos de receta (agrupados por componente)
recipe_steps (id UUID PK, component_id FK → recipe_components,
              step_order INT, description TEXT,
              temp_c INT, duration_min INT,
              technical_notes TEXT,        -- "por qué" técnico del paso
              photo_url TEXT)

-- Variantes de receta
recipe_variants (id UUID PK, recipe_id FK → recipes,
                 name TEXT, description TEXT)

-- Factores de escala (moldes)
recipe_scale_factors (id UUID PK, recipe_id FK → recipes,
                      reference_mold TEXT,    -- "círculo 17 cm"
                      target_mold TEXT,       -- "círculo 24 cm"
                      multiplier DECIMAL)

-- Notas del chef / tips
recipe_notes (id UUID PK, recipe_id FK → recipes,
              content TEXT, sort_order INT)

-- Etiquetas
tags (id UUID PK, user_id FK → profiles, name TEXT, color TEXT)
recipe_tags (recipe_id FK, tag_id FK)

-- Precios de ingredientes
ingredient_prices (id UUID PK, user_id FK → profiles, ingredient_name TEXT,
                   brand TEXT, supermarket TEXT, price DECIMAL,
                   package_size DECIMAL, package_unit TEXT,
                   off_product_id TEXT,
                   source ENUM [manual, scanner, open_prices],
                   is_default BOOLEAN, created_at, updated_at)

-- Lista de la compra
shopping_lists (id UUID PK, user_id FK → profiles, name TEXT, created_at)
shopping_list_items (id UUID PK, list_id FK → shopping_lists,
                     ingredient_name TEXT, quantity DECIMAL, unit TEXT,
                     brand TEXT, supermarket TEXT, is_checked BOOLEAN)
```

### Importación JSON (formato Pizca)

La app soporta importación de recetas en formato JSON estructurado (ver `formato_receta.json`).
El flujo es: subir archivos .json → validar contra schema → preview editable → mapear a tablas relacionales → guardar.
Un archivo JSON = una receta. Importación por lotes soportada (múltiples archivos).
```

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado. Política base: los usuarios solo pueden ver/editar sus propios datos.

```sql
CREATE POLICY "Users can CRUD own data" ON recipes
  FOR ALL USING (auth.uid() = user_id);
-- Aplicar patrón similar a todas las tablas con user_id
```

## APIs Externas

### Open Food Facts (productos por código de barras)

```
GET https://world.openfoodfacts.org/api/v2/product/{barcode}.json
```

- **Rate limit:** 100 req/min (productos), 10 req/min (búsquedas)
- **Campos útiles:** product_name, brands, quantity (tamaño envase), categories, image_url
- **Headers requeridos:** User-Agent con nombre de la app y versión
- **Licencia:** ODbL → requiere atribución "Datos de Open Food Facts" visible en la UI
- **Fallback:** si no hay resultado, permitir entrada manual

### Open Prices (precios comunitarios)

```
GET https://prices.openfoodfacts.org/api/v1/prices?product_code={barcode}&location_osm_type=*&location_osm_id=*
```

- **Campos útiles:** price, location_osm_id, date, product_code, currency
- **Filtrar por:** country=ES para resultados españoles
- **Contribuir precios:** POST con autenticación Open Food Facts
- **Licencia:** ODbL → misma atribución requerida

## Fórmulas de Cálculo

### Calculadora de moldes (volúmenes)

```typescript
// Circular: V = π × r² × h
const volumeCircular = (diameter: number, height: number) =>
  Math.PI * Math.pow(diameter / 2, 2) * height;

// Cuadrado: V = lado² × h
const volumeSquare = (side: number, height: number) =>
  Math.pow(side, 2) * height;

// Rectangular: V = largo × ancho × h
const volumeRectangular = (length: number, width: number, height: number) =>
  length * width * height;

// Factor de escala
const scaleFactor = volumeDestino / volumeOrigen;
```

### Redondeo inteligente

```typescript
// Huevos → entero más cercano
// Harinas, azúcar → múltiplos de 5g
// Líquidos → múltiplos de 5ml
// Mantequilla → múltiplos de 10g
// Levadura → múltiplos de 0.5g
```

### Coste proporcional

```typescript
// Coste de un ingrediente en una receta
const costPerIngredient = (quantityUsed: number, packageSize: number, packagePrice: number) =>
  (quantityUsed / packageSize) * packagePrice;

// Coste total de receta = suma de costes individuales
// Coste por ración = coste total / número de raciones
```

## Convenciones de Código

- **Componentes:** PascalCase, un archivo por componente, exportar como default
- **Hooks:** camelCase con prefijo `use` (useRecipes, usePrices)
- **Servicios:** camelCase, funciones puras async
- **Types:** interfaces con prefijo descriptivo (Recipe, RecipeIngredient, IngredientPrice)
- **CSS:** Tailwind utility classes. No CSS custom excepto animaciones específicas
- **Commits:** en español, descriptivos: "Añade integración Open Food Facts con búsqueda por EAN"
- **Archivos nuevos:** crear en la carpeta correspondiente de src/, nunca en la raíz

## Reglas Importantes

1. **Mantener compatibilidad** con la estructura existente generada por Lovable
2. **No romper** funcionalidades existentes al añadir nuevas
3. **Supabase Storage** para todas las imágenes (fotos de recetas, pasos). Comprimir a max 1200px, formato WebP
4. **Testear en navegador** (npm run dev) antes de hacer commit
5. **Responsive:** la app debe funcionar en móvil (375px), tablet (768px) y escritorio (1280px+)
6. **Estados vacíos:** siempre mostrar mensaje guía + ilustración cuando no hay datos
7. **Errores:** mensajes claros en español, nunca mostrar errores técnicos al usuario
8. **Loading:** skeleton loaders para cargas de datos, nunca pantalla en blanco
9. **Accesibilidad:** labels en formularios, contraste suficiente, teclado navegable

## Comandos Útiles

```bash
npm run dev          # Servidor de desarrollo (localhost:5173)
npm run build        # Build de producción
npm run preview      # Preview del build
```

> **Deploy:** El despliegue se hace directamente desde Lovable (botón Deploy). No se necesitan comandos CLI de Supabase ni configuración de Vercel. Las tablas y migraciones se gestionan desde el panel Cloud de Lovable o pidiendo a Lovable que las cree.

## Documentación de Referencia

- PRD completa: `docs/PRD.md`
- Open Food Facts API: https://openfoodfacts.github.io/openfoodfacts-server/api/
- Open Prices API: https://prices.openfoodfacts.org/api/docs
- Lovable Cloud Docs: https://docs.lovable.dev/integrations/cloud
- Supabase Docs (referencia): https://supabase.com/docs
