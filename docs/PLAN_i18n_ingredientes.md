# Plan de Implementación: i18n + Catálogo de Ingredientes

## Resumen

Dos features interdependientes que se implementan en 6 pasos secuenciales.
Cada paso es un commit independiente y testeable.

**Tiempo estimado:** 3-4 sesiones de Claude Code (~2h cada una)

---

## Paso 1: Instalar react-i18next y crear estructura base

**Objetivo:** Framework i18n funcionando, sin cambiar ningún componente aún.

```bash
npm install i18next react-i18next
```

Crear archivos:
- `src/i18n/index.ts` — config de i18next
- `src/i18n/locales/es.json` — archivo vacío con estructura de claves
- `src/i18n/locales/fr.json` — copia vacía
- `src/i18n/locales/en.json` — copia vacía

Inicializar en `src/main.tsx`:
```typescript
import './i18n';  // añadir antes de ReactDOM.createRoot
```

**Test:** la app carga igual que antes, sin errores en consola.

**Commit:** "Instala react-i18next y crea estructura base i18n"

---

## Paso 2: Extraer todas las UI strings a archivos de idioma

**Objetivo:** Todas las ~430 strings hardcodeadas pasan a los JSONs.

### Archivos a tocar (ordenados por impacto):

| Archivo | Strings | Prioridad |
|---------|---------|-----------|
| `pages/ImportarRecetas.tsx` | ~138 | Alta |
| `components/recipe-form/RecipeForm.tsx` | ~78 | Alta |
| `components/profile/IngredientPricesManager.tsx` | ~39 | Alta |
| `components/recipe/RecipeMoldsTab.tsx` | ~29 | Media |
| `components/recipe-form/ComponentEditor.tsx` | ~25 | Media |
| `pages/RecipeDetail.tsx` | ~24 | Media |
| `lib/RecipePdfDocument.tsx` | ~22 | Media |
| `components/profile/TagsManager.tsx` | ~22 | Media |
| `pages/Login.tsx` | ~17 | Media |
| `pages/MisRecetas.tsx` | ~12 | Media |
| `components/recipe-form/TagSelector.tsx` | ~13 | Baja |
| `components/recipe/RecipeIngredientsList.tsx` | ~5 | Baja |
| `components/recipe/RecipeStepsList.tsx` | ~5 | Baja |
| `components/recipe/RecipeInfoTab.tsx` | ~5 | Baja |
| `components/recipe/RecipeNotesTab.tsx` | ~5 | Baja |
| `components/DesktopSidebar.tsx` | ~4 | Baja |
| `components/MobileBottomNav.tsx` | ~4 | Baja |
| `pages/Index.tsx` | ~4 | Baja |

### Patrón de migración por componente:

```typescript
// ANTES:
<Button>Guardar</Button>
toast.error("Error al eliminar");
const greeting = hour < 12 ? "Buenos días" : "Buenas tardes";

// DESPUÉS:
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();

<Button>{t('common.save')}</Button>
toast.error(t('toast.deleteError'));
const greeting = hour < 12 ? t('greeting.morning') : t('greeting.afternoon');
```

### Eliminar CATEGORY_LABELS y DIFFICULTY_LABELS de types/recipe.ts:

```typescript
// ANTES (types/recipe.ts):
export const CATEGORY_LABELS: Record<RecipeCategory, string> = {
  tartes: "Tartes",
  entremets: "Entremets", ...
};

// DESPUÉS: eliminar el objeto. En componentes:
t(`category.${recipe.category}`)
t(`difficulty.${recipe.difficulty}`)
```

### Estrategia para ir rápido:

1. Primero poblar `es.json` completo con todas las claves
2. Copiar a `fr.json` y `en.json` con valores placeholder (mismos valores ES como fallback)
3. Migrar componentes uno a uno, empezando por los más grandes
4. Al final, traducir fr.json y en.json manualmente (o en una sesión separada)

**Test:** toda la app funciona en español igual que antes, pero ahora vía `t()`.
Cambiar `lng: 'fr'` en config y verificar que muestra claves sin romper.

**Commit:** "Migra todas las UI strings a react-i18next (ES/FR/EN)"

---

## Paso 3: Selector de idioma en Perfil

**Objetivo:** El usuario puede cambiar de idioma desde la pantalla de Perfil.

En `pages/Perfil.tsx`, añadir:
- Select con banderas/nombres: Español, Français, English
- Al cambiar: `i18n.changeLanguage(lang)` + `localStorage.setItem('pizca-lang', lang)`
- Al cargar: leer de localStorage (ya configurado en i18n/index.ts)

**Test:** cambiar idioma y verificar que toda la UI cambia instantáneamente.

**Commit:** "Añade selector de idioma en Perfil con persistencia en localStorage"

---

## Paso 4: Crear tabla `ingredients` y seed de ~200 ingredientes

**Objetivo:** Catálogo canónico de ingredientes en Supabase.

### Migración SQL:

```sql
-- Crear tabla catálogo
CREATE TABLE public.ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  translations JSONB NOT NULL DEFAULT '{}',
  aliases JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read ingredients" ON public.ingredients
  FOR SELECT USING (true);

CREATE INDEX idx_ingredients_canonical ON public.ingredients(canonical_name);
CREATE INDEX idx_ingredients_category ON public.ingredients(category);
-- Índice GIN para búsqueda en traducciones y aliases
CREATE INDEX idx_ingredients_translations ON public.ingredients USING GIN (translations);
CREATE INDEX idx_ingredients_aliases ON public.ingredients USING GIN (aliases);

-- Modificar recipe_ingredients: renombrar name → display_name, añadir FK
ALTER TABLE public.recipe_ingredients RENAME COLUMN name TO display_name;
ALTER TABLE public.recipe_ingredients
  ADD COLUMN ingredient_id UUID REFERENCES public.ingredients(id);

-- Modificar ingredient_prices: añadir FK
ALTER TABLE public.ingredient_prices
  ADD COLUMN ingredient_id UUID REFERENCES public.ingredients(id);
```

### Seed data (~200 ingredientes):

Generar un INSERT masivo. Ejemplo de estructura:

```sql
INSERT INTO public.ingredients (canonical_name, category, translations, aliases) VALUES
('butter', 'dairy',
  '{"es":"mantequilla","fr":"beurre","en":"butter"}',
  '{"es":["mantequilla sin sal","manteca"],"fr":["beurre doux","beurre pommade","beurre mou","beurre noisette"],"en":["unsalted butter","clarified butter"]}'),
('flour-all-purpose', 'flour',
  '{"es":"harina de trigo","fr":"farine","en":"all-purpose flour"}',
  '{"es":["harina","harina común"],"fr":["farine T55","farine de blé","farine tamisée"],"en":["plain flour","AP flour"]}'),
-- ... ~200 más
```

Categorías del seed: dairy, flour, sugar, chocolate, fruit, nut, spice, leavening, fat, egg, cream, gelatin, liquid, alcohol, colorant, thickener, other.

**Ingredientes prioritarios** (los que aparecen en las 76 recetas del PDF):
beurre, farine, sucre, oeufs, crème, lait, chocolat, cacao, poudre d'amande, vanille, gélatine, levure, sel, mascarpone, speculoos, fraises, framboises, poires, citron, pistache, rhum, café...

### Actualizar tipos TypeScript:

Añadir a `types/recipe.ts`:
```typescript
export type Ingredient = Database["public"]["Tables"]["ingredients"]["Row"];
```

Actualizar `RecipeIngredient` — el campo `name` ahora es `display_name` en la DB.

⚠ **IMPORTANTE:** Al renombrar `name` → `display_name`, hay que actualizar TODOS los componentes
que leen `recipe_ingredients.name`:
- `ComponentEditor.tsx` (formulario)
- `RecipeIngredientsList.tsx` (detalle)
- `RecipeCostsTab.tsx` (costes)
- `RecipeMoldsTab.tsx` (calculadora)
- `RecipeFullViewTab.tsx` (vista completa)
- `RecipePdfDocument.tsx` (PDF)
- `ImportarRecetas.tsx` (importador)
- `useRecipes.ts` (hook)

**Test:** la app sigue funcionando con el campo renombrado. La tabla ingredients tiene ~200 rows.

**Commit:** "Crea tabla ingredients con seed de 200 ingredientes de repostería (FR/ES/EN)"

---

## Paso 5: Auto-matching al importar y crear ingredientes

**Objetivo:** Cuando el usuario importa un JSON o añade un ingrediente manualmente,
la app intenta vincularlo automáticamente al catálogo.

### Función de matching:

```typescript
// src/lib/ingredientMatcher.ts
export async function matchIngredient(
  displayName: string,
  supabase: SupabaseClient
): Promise<{ ingredient_id: string | null; confidence: 'exact' | 'fuzzy' | 'none' }> {
  const normalized = displayName.trim().toLowerCase();

  // 1. Buscar match exacto en translations
  const { data: exactTranslation } = await supabase
    .from('ingredients')
    .select('id')
    .or(`translations->es.ilike.${normalized},translations->fr.ilike.${normalized},translations->en.ilike.${normalized}`)
    .limit(1);

  if (exactTranslation?.length) return { ingredient_id: exactTranslation[0].id, confidence: 'exact' };

  // 2. Buscar en aliases (JSONB array contains)
  // Usar función SQL custom o búsqueda client-side sobre el catálogo cacheado

  // 3. Fuzzy: Levenshtein o trigrams (puede ser con pg_trgm extension)

  return { ingredient_id: null, confidence: 'none' };
}
```

### Integrar en ImportarRecetas.tsx:

Al procesar un JSON, después de validar, correr matching para cada ingrediente.
Mostrar en el preview: icono verde (match exacto), amarillo (fuzzy), gris (sin match).

### Integrar en ComponentEditor.tsx:

Al escribir el nombre de un ingrediente, hacer search-as-you-type contra el catálogo.
Mostrar sugerencias en un dropdown (autocomplete). Al seleccionar, se fija el ingredient_id.

**Test:** importar un JSON francés → los ingredientes comunes (beurre, farine, sucre) se vinculan automáticamente.

**Commit:** "Añade auto-matching de ingredientes al importar y crear recetas"

---

## Paso 6: Búsqueda multilingüe de recetas por ingrediente

**Objetivo:** Buscar "mantequilla" encuentra recetas que tienen "beurre doux".

### Función de búsqueda:

En `useRecipes.ts`, cuando el usuario busca texto, además de buscar en `recipes.title`:

1. Buscar el término en `ingredients.translations` y `ingredients.aliases` (todos los idiomas)
2. Obtener los `ingredient_id`s que matchean
3. Buscar recetas que tienen `recipe_ingredients.ingredient_id` en esos IDs
4. Combinar con la búsqueda por título

Puede implementarse como función PostgreSQL para eficiencia:

```sql
CREATE OR REPLACE FUNCTION search_recipes_by_ingredient(
  p_user_id UUID,
  p_search_term TEXT
) RETURNS SETOF recipes AS $$
  SELECT DISTINCT r.*
  FROM recipes r
  JOIN recipe_components rc ON rc.recipe_id = r.id
  JOIN recipe_ingredients ri ON ri.component_id = rc.id
  LEFT JOIN ingredients i ON i.id = ri.ingredient_id
  WHERE r.user_id = p_user_id
  AND (
    ri.display_name ILIKE '%' || p_search_term || '%'
    OR i.translations::text ILIKE '%' || p_search_term || '%'
    OR i.aliases::text ILIKE '%' || p_search_term || '%'
  );
$$ LANGUAGE sql STABLE;
```

**Test:** crear una receta con "beurre doux" vinculado a "butter" → buscar "mantequilla" → aparece la receta.

**Commit:** "Añade búsqueda multilingüe de recetas por ingrediente"

---

## Resumen de commits

| # | Commit | Riesgo | Archivos |
|---|--------|--------|----------|
| 1 | Instala react-i18next y estructura base | Bajo | 5 nuevos |
| 2 | Migra todas las UI strings a i18n | **Alto** | ~18 archivos |
| 3 | Selector de idioma en Perfil | Bajo | 2 archivos |
| 4 | Tabla ingredients + seed + rename column | **Alto** | migración + ~10 archivos |
| 5 | Auto-matching de ingredientes | Medio | 3-4 archivos |
| 6 | Búsqueda multilingüe | Medio | 2-3 archivos |

---

## Instrucciones para Claude Code

Al iniciar sesión en Claude Code (`cd pizca && claude`), pedir:

```
Lee CLAUDE.md para entender el proyecto. Vamos a implementar i18n y catálogo
de ingredientes en 6 pasos. Empieza por el Paso 1 del plan: instalar
react-i18next y crear la estructura base. Un paso = un commit.
```

Después de cada paso, verificar en navegador (`npm run dev`) y hacer commit antes de continuar.

---

## Notas adicionales

### Sobre la migración de `name` → `display_name`

Este es el cambio más delicado. La columna se renombra en Supabase, pero los tipos
generados en `integrations/supabase/types.ts` se actualizan automáticamente por Lovable.
Si usas Claude Code directamente, necesitarás actualizar los tipos manualmente o
ejecutar la migración desde Lovable para que regenere los tipos.

**Opción segura:** crear la migración SQL como archivo, subirlo a GitHub, y ejecutarlo
desde el panel de Lovable Cloud. Así Lovable regenera `types.ts` automáticamente.

### Sobre el seed de ingredientes

El seed de ~200 ingredientes es una tarea grande pero mecánica. Claude Code puede
generar el SQL completo. Fuentes para los nombres:
- Las 76 recetas del PDF (_Desserts.pdf) ya contienen los ingredientes en francés
- La especificación `especificacion_formato_recetas.md` lista las unidades y categorías
- Open Food Facts tiene nombres multilingües que sirven de referencia

### Sobre las traducciones FR/EN de UI strings

Para el MVP, generar los JSONs de fr.json y en.json puede ser una tarea que Claude Code
haga en una pasada: tomar es.json como referencia y traducir las ~430 claves.
No necesita ser perfecto al inicio — se puede refinar después.
