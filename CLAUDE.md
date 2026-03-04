# Pizca

App de repostería para calcular costes, adaptar recetas a distintos moldes y gestionar un recetario personal con fotos.

## Stack Tecnológico

- **Frontend:** React + TypeScript (generado con Lovable)
- **Backend/DB/Auth/Storage:** Lovable Cloud (Supabase gestionado internamente por Lovable)
- **Hosting:** Lovable Cloud (deploy integrado, con opción futura de migrar a Vercel + Supabase propio)
- **Estilos:** Tailwind CSS
- **i18n:** react-i18next (ver sección Internacionalización)
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
│   ├── i18n/              # Internacionalización
│   │   ├── index.ts           # Configuración react-i18next
│   │   └── locales/
│   │       ├── es.json        # Español (idioma por defecto)
│   │       ├── fr.json        # Francés
│   │       └── en.json        # Inglés
│   ├── integrations/      # Supabase client + types generados
│   ├── lib/               # Utilidades y helpers
│   │   ├── calculations.ts    # Fórmulas de moldes, costes, redondeo
│   │   ├── exportRecipe.ts    # Exportación JSON
│   │   ├── RecipePdfDocument.tsx # Generación PDF
│   │   └── utils.ts
│   └── types/             # TypeScript interfaces y types
├── supabase/
│   └── migrations/        # Migraciones SQL de la base de datos
├── public/
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
         category recipe_category, subcategory TEXT,
         servings INT, mold TEXT,
         prep_time_min INT, bake_time_min INT, rest_time_min INT,
         total_active_min INT, temperature INT,
         difficulty recipe_difficulty,
         planning_days INT,
         origin_chef TEXT, origin_url TEXT, origin_book TEXT,
         tested BOOLEAN DEFAULT false, test_notes TEXT, rating INT,
         created_at, updated_at)

-- Planning multi-día (recetas complejas tipo entremets)
recipe_planning (id UUID PK, recipe_id FK → recipes,
                 day_label TEXT, tasks TEXT[], sort_order INT)

-- Componentes (agrupan ingredientes en recetas compuestas)
recipe_components (id UUID PK, recipe_id FK → recipes,
                   name TEXT, sort_order INT)

-- Ingredientes (referencia componente + catálogo opcional)
recipe_ingredients (id UUID PK, component_id FK → recipe_components,
                    ingredient_id FK → ingredients NULLABLE,  -- vínculo al catálogo canónico
                    display_name TEXT,     -- texto original del chef ("beurre doux")
                    quantity DECIMAL, unit ingredient_unit,
                    sort_order INT)

-- Pasos de receta (agrupados por componente)
recipe_steps (id UUID PK, component_id FK → recipe_components,
              step_order INT, description TEXT,
              temp_c INT, duration_min INT,
              technical_notes TEXT, photo_url TEXT)

-- Variantes, notas, escala
recipe_variants (id UUID PK, recipe_id FK, name TEXT, description TEXT)
recipe_notes (id UUID PK, recipe_id FK, content TEXT, sort_order INT)
recipe_scale_factors (id UUID PK, recipe_id FK, reference_mold TEXT,
                      target_mold TEXT, multiplier DECIMAL)

-- Etiquetas
tags (id UUID PK, user_id FK, name TEXT, color TEXT)
recipe_tags (recipe_id FK, tag_id FK)

-- ═══ CATÁLOGO DE INGREDIENTES (canónico, multilingüe) ═══
ingredients (id UUID PK,
             canonical_name TEXT UNIQUE,   -- slug: "butter", "flour-wheat-all-purpose"
             category TEXT,                -- "dairy", "flour", "sugar", "fat", "egg", "chocolate", "fruit", "spice", "leavening", "gelatin", "liquid", "nut", "other"
             translations JSONB,           -- {"es": "mantequilla", "fr": "beurre", "en": "butter"}
             aliases JSONB,                -- {"fr": ["beurre doux", "beurre pommade"], "es": ["manteca"]}
             off_category TEXT,            -- Open Food Facts category para matching
             created_at TIMESTAMPTZ)
-- Sin RLS: tabla pública de solo lectura, compartida entre usuarios
-- Seed: ~200 ingredientes de repostería en FR/ES/EN

-- Precios de ingredientes (ahora puede vincular al catálogo)
ingredient_prices (id UUID PK, user_id FK, ingredient_name TEXT,
                   ingredient_id FK → ingredients NULLABLE,
                   brand TEXT, supermarket TEXT, price DECIMAL,
                   package_size DECIMAL, package_unit ingredient_unit,
                   is_default BOOLEAN, created_at, updated_at)

-- Lista de la compra
shopping_lists (id UUID PK, user_id FK, name TEXT, created_at)
shopping_list_items (id UUID PK, list_id FK, ingredient_name TEXT,
                     ingredient_id FK → ingredients NULLABLE,
                     quantity DECIMAL, unit ingredient_unit, checked BOOLEAN)
```

### Enums

```sql
recipe_category: tartes | entremets | biscuits | gâteaux | pâtes-de-base |
                 crèmes-de-base | mousses | glaces-sorbets | viennoiserie |
                 confiserie | autre
recipe_difficulty: basico | intermedio | avanzado | experto
ingredient_unit: g | kg | ml | cl | dl | l | pcs | QS | cc | cs | pincée
```

### Row Level Security (RLS)

Todas las tablas con `user_id` tienen RLS habilitado. Política: usuarios solo ven/editan sus propios datos. La tabla `ingredients` (catálogo) es pública de solo lectura.

### Importación JSON (formato Pizca)

La app soporta importación de recetas en formato JSON estructurado (ver `formato_receta.json`).
Flujo: subir .json → validar → preview → mapear a tablas → guardar. Un archivo = una receta. Lotes soportados.

## Internacionalización (i18n)

### Arquitectura

Dos capas independientes:

1. **UI strings (estáticas):** `react-i18next` con archivos JSON por idioma
2. **Datos dinámicos (ingredientes, categorías):** tabla `ingredients` con traducciones JSONB en Supabase

### Configuración react-i18next

```typescript
// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import es from './locales/es.json';
import fr from './locales/fr.json';
import en from './locales/en.json';

i18n.use(initReactI18next).init({
  resources: { es: { translation: es }, fr: { translation: fr }, en: { translation: en } },
  lng: 'es',                    // idioma por defecto
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
});
export default i18n;
```

### Estructura de claves (namespacing por sección)

```json
{
  "nav": { "home": "Inicio", "recipes": "Mis Recetas", "prices": "Ingredientes", "profile": "Perfil" },
  "auth": { "login": "Iniciar sesión", "register": "Crear cuenta", "email": "Email", "password": "Contraseña", "loading": "Cargando..." },
  "recipes": { "title": "Mis Recetas", "create": "Crear receta", "import": "Importar", "empty": "Aún no tienes recetas", "noResults": "Sin resultados" },
  "recipeForm": { "titleLabel": "Título", "basicInfo": "Info básica", "times": "Tiempos", "origin": "Origen", "components": "Componentes", ... },
  "recipeDetail": { "ingredients": "Ingredientes", "steps": "Pasos", "notes": "Notas", "info": "Info", "molds": "Moldes", "costs": "Costes", ... },
  "categories": { "tartes": "Tartes", "entremets": "Entremets", ... },
  "difficulty": { "basico": "Básico", "intermedio": "Intermedio", "avanzado": "Avanzado", "experto": "Experto" },
  "units": { "g": "g", "kg": "kg", ... },
  "common": { "save": "Guardar", "cancel": "Cancelar", "delete": "Eliminar", "edit": "Editar", "duplicate": "Duplicar", "confirm": "Confirmar", "error": "Error", "success": "Éxito" },
  "greeting": { "morning": "Buenos días", "afternoon": "Buenas tardes", "evening": "Buenas noches" },
  "import": { "title": "Importar Recetas", "selectFiles": "Seleccionar archivos", ... },
  "prices": { "title": "Mis Precios", "addPrice": "Añadir precio", ... }
}
```

### Reglas para UI strings

- **CERO texto hardcodeado** en componentes. Todo pasa por `t('key')` o `<Trans>`
- `CATEGORY_LABELS` y `DIFFICULTY_LABELS` en `types/recipe.ts` se reemplazan por claves i18n
- Los placeholders, tooltips, toasts, mensajes de error — todo traducido
- El idioma activo se guarda en localStorage y se puede cambiar desde Perfil
- Los datos de usuario (títulos de recetas, nombres de componentes, notas) NO se traducen — son contenido del usuario

### Uso en componentes

```tsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  return <h1>{t('recipes.title')}</h1>;
};
```

## Catálogo de Ingredientes

### Propósito

Normalizar ingredientes para: búsqueda multilingüe, agrupación en lista de compra, matching con precios, preparar i18n de datos.

### Tabla `ingredients`

```sql
CREATE TABLE public.ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_name TEXT UNIQUE NOT NULL,   -- "butter", "flour-wheat-all-purpose"
  category TEXT NOT NULL DEFAULT 'other',
  translations JSONB NOT NULL DEFAULT '{}',  -- {"es":"mantequilla","fr":"beurre","en":"butter"}
  aliases JSONB NOT NULL DEFAULT '{}',       -- {"fr":["beurre doux","beurre pommade"],"es":["manteca"]}
  off_category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Sin RLS: lectura pública, insert/update restringido (admin o seed)
```

### Vínculo con recipe_ingredients

```sql
-- Añadir columna FK nullable (no rompe datos existentes)
ALTER TABLE recipe_ingredients ADD COLUMN ingredient_id UUID REFERENCES ingredients(id);
-- Renombrar: name → display_name (texto original del chef)
ALTER TABLE recipe_ingredients RENAME COLUMN name TO display_name;
```

Estructura resultante: `recipe_ingredients.display_name` = "beurre doux" (texto del chef, se preserva siempre), `recipe_ingredients.ingredient_id` → `ingredients.canonical_name` = "butter" (vínculo semántico).

### Matching (al importar o crear receta)

Estrategia mixta:
1. **Automático**: buscar `display_name` en `translations` y `aliases` de todos los idiomas
2. **Fuzzy fallback**: normalizar (lowercase, strip accents) y buscar coincidencia parcial
3. **Manual**: ingredientes no reconocidos quedan con `ingredient_id = NULL`, el usuario puede vincularlos después desde la UI

### Seed list

~200 ingredientes de repostería organizados por categoría:
- **dairy**: beurre/mantequilla, crème/nata, lait/leche, mascarpone, fromage blanc...
- **flour**: farine/harina, fécule/maicena, poudre d'amande/harina de almendra...
- **sugar**: sucre/azúcar, sucre glace/azúcar glas, miel, sirop d'érable...
- **fat**: huile/aceite, beurre de cacao/manteca de cacao...
- **egg**: oeuf/huevo, jaune/yema, blanc/clara...
- **chocolate**: chocolat noir/chocolate negro, chocolat blanc/chocolate blanco, cacao...
- **fruit**: fraise/fresa, framboise/frambuesa, citron/limón, pomme/manzana...
- **spice**: vanille/vainilla, cannelle/canela, tonka, gingembre/jengibre...
- **leavening**: levure/levadura, bicarbonate/bicarbonato, pectine/pectina...
- **gelatin**: gélatine/gelatina, agar-agar...
- **liquid**: eau/agua, rhum/ron, Grand Marnier, café...
- **nut**: amande/almendra, noisette/avellana, noix/nuez, pistache/pistacho...

El seed se ejecuta como migración SQL con INSERT INTO ingredients.

### Búsqueda multilingüe

```sql
-- Buscar "mantequilla" encuentra butter porque translations->>'es' = 'mantequilla'
SELECT * FROM ingredients
WHERE translations->>'es' ILIKE '%mantequilla%'
   OR translations->>'fr' ILIKE '%mantequilla%'
   OR translations->>'en' ILIKE '%mantequilla%'
   OR aliases::text ILIKE '%mantequilla%';
```

En el frontend, la búsqueda de recetas por ingrediente usa el idioma activo para mostrar resultados, pero busca en todos los idiomas para encontrar coincidencias.

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
- **i18n keys:** dot-notation agrupadas por sección (nav.home, recipes.create, common.save)
- **Commits:** en español, descriptivos: "Añade integración Open Food Facts con búsqueda por EAN"
- **Archivos nuevos:** crear en la carpeta correspondiente de src/, nunca en la raíz

## Reglas Importantes

1. **Mantener compatibilidad** con la estructura existente generada por Lovable
2. **No romper** funcionalidades existentes al añadir nuevas
3. **Cero strings hardcodeadas**: todo texto visible pasa por `t('key')` de react-i18next
4. **Supabase Storage** para todas las imágenes. Comprimir a max 1200px, formato WebP
5. **Testear en navegador** (npm run dev) antes de hacer commit
6. **Responsive:** la app debe funcionar en móvil (375px), tablet (768px) y escritorio (1280px+)
7. **Estados vacíos:** siempre mostrar mensaje guía + ilustración cuando no hay datos
8. **Errores:** mensajes claros en el idioma activo, nunca mostrar errores técnicos al usuario
9. **Loading:** skeleton loaders para cargas de datos, nunca pantalla en blanco
10. **Accesibilidad:** labels en formularios, contraste suficiente, teclado navegable

## Comandos Útiles

```bash
npm run dev          # Servidor de desarrollo (localhost:5173)
npm run build        # Build de producción
npm run preview      # Preview del build
```

> **Deploy:** El despliegue se hace directamente desde Lovable (botón Deploy). No se necesitan comandos CLI de Supabase ni configuración de Vercel. Las tablas y migraciones se gestionan desde el panel Cloud de Lovable o pidiendo a Lovable que las cree.

## Documentación de Referencia

- PRD completa: `docs/PRD.md`
- Formato receta JSON: `formato_receta.json` (en project files)
- Open Food Facts API: https://openfoodfacts.github.io/openfoodfacts-server/api/
- Open Prices API: https://prices.openfoodfacts.org/api/docs
- react-i18next: https://react.i18next.com/
- Lovable Cloud Docs: https://docs.lovable.dev/integrations/cloud
- Supabase Docs: https://supabase.com/docs
