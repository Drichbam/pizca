# Estado de implementación del catálogo de ingredientes

> Actualizado: 2026-03-06

---

## 1. Schema de base de datos

### Tabla `ingredients` (catálogo canónico)

Creada desde el panel de Lovable Cloud — **no existe migración SQL** en `supabase/migrations/`.

```
id             UUID PK
canonical_name TEXT UNIQUE NOT NULL   -- slug: "butter", "flour-wheat-all-purpose"
category       TEXT NOT NULL DEFAULT 'other'
translations   JSONB NOT NULL DEFAULT '{}'   -- {"es": "mantequilla", "fr": "beurre", "en": "butter"}
aliases        JSONB NOT NULL DEFAULT '{}'   -- {"fr": ["beurre doux"], "es": ["manteca"]}
off_category   TEXT NULL              -- categoria Open Food Facts para matching
created_at     TIMESTAMPTZ NOT NULL
```

- Sin RLS: tabla pública de solo lectura compartida entre usuarios
- **Sin seed**: la tabla existe en BD pero está vacía

### Tabla `recipe_ingredients`

Definida en `20260304084142_*.sql`. Contiene:

```
id           UUID PK
component_id UUID FK → recipe_components (NOT NULL)
display_name TEXT NOT NULL        -- texto original del chef ("beurre doux"), siempre se preserva
ingredient_id UUID FK → ingredients NULL  -- vínculo al catálogo canónico, nullable
quantity     DECIMAL NULL
unit         ingredient_unit ENUM NULL
sort_order   INT NOT NULL DEFAULT 0
```

### Tabla `ingredient_prices`

Definida en `20260304084142_*.sql`. Contiene:

```
id              UUID PK
user_id         UUID FK → auth.users (NOT NULL)
ingredient_name TEXT NOT NULL     -- nombre libre escrito por el usuario
ingredient_id   UUID FK → ingredients NULL  -- vínculo al catálogo, nullable
brand           TEXT NULL
supermarket     TEXT NULL
price           DECIMAL NOT NULL
package_size    DECIMAL NULL
package_unit    ingredient_unit ENUM NULL
is_default      BOOLEAN DEFAULT false
created_at, updated_at TIMESTAMPTZ
```

- **Nota**: el campo `source` (manual/scanner/open_prices) que figura en el PRD **no está en la migración ni en types.ts** — no está implementado.

---

## 2. Tipos TypeScript

`src/types/recipe.ts` — todos los tipos derivan de `Database` (generado por Lovable):

```typescript
export type Ingredient     = Database["public"]["Tables"]["ingredients"]["Row"];
export type RecipeIngredient = Database["public"]["Tables"]["recipe_ingredients"]["Row"];
// + Recipe, RecipeComponent, RecipeStep, RecipePlanning, RecipeNote,
//   RecipeVariant, RecipeScaleFactor, Tag, RecipeTag
// + Enums: RecipeCategory, RecipeDifficulty, IngredientUnit
```

`RecipeWithComponents` — tipo compuesto para cargar receta completa:
```typescript
type RecipeWithComponents = Recipe & {
  recipe_components: (RecipeComponent & {
    recipe_ingredients: RecipeIngredient[];
    recipe_steps: RecipeStep[];
  })[];
  recipe_planning: RecipePlanning[];
  recipe_notes: RecipeNote[];
  recipe_variants: RecipeVariant[];
  recipe_scale_factors: RecipeScaleFactor[];
  recipe_tags?: (RecipeTag & { tags: Tag })[];
};
```

**Pendiente**: `CATEGORY_LABELS` y `DIFFICULTY_LABELS` están hardcodeados en `types/recipe.ts` — deberían usar `t('key')` de react-i18next pero aún no migrados.

---

## 3. Hooks implementados

### `useIngredientCatalog` (`src/hooks/useIngredientCatalog.ts`)

- Carga toda la tabla `ingredients` con `staleTime: 1h`
- Exporta `findMatchingIngredientIds(search, catalog)`: busca en `translations` y `aliases` (todos los idiomas), con normalización NFD y match bidireccional por inclusión

```typescript
// Ejemplo de uso
const { data: catalog } = useIngredientCatalog();
const ids = findMatchingIngredientIds("mantequilla", catalog);
```

### `useOpenFoodFactsProduct` (`src/hooks/useOpenFoodFacts.ts`)

- Fetch por código de barras a `world.openfoodfacts.org/api/v2/product/{barcode}.json`
- Parsea `product_name`, `brands`, `quantity` (con regex para separar número y unidad)
- Retorna: `{ name, brand, package_size, package_unit }`
- Cache: 1h | Solo activo si barcode >= 8 chars | 1 retry

### `useOpenFoodFactsSearch` (`src/hooks/useOpenFoodFactsSearch.ts`)

- Búsqueda por texto a `openfoodfacts.org/cgi/search.pl`
- Retorna hasta 5 resultados: `{ barcode, name, brand }[]`
- Cache: 10min | Solo activo si query >= 3 chars

### `useOpenPricesProduct` (`src/hooks/useOpenPrices.ts`)

- Fetch a `prices.openfoodfacts.org/api/v1/prices?product_code={barcode}`
- Filtra por España (country_code = "ES") si hay >= 2 resultados españoles; si no, usa todos
- Calcula: `count`, `avgPrice`, `latestPrice`, `latestDate`, `currency`, `isSpainOnly`
- Cache: 30min | 1 retry

---

## 4. Lógica de matching (`src/lib/ingredientMatcher.ts`)

`enrichWithIngredientIds(ingredients)`: toma una lista de `{id, display_name}`, descarga el catálogo, y actualiza `ingredient_id` en `recipe_ingredients` via Supabase.

Estrategia:
1. **Exacto normalizado**: `normalize(translation) === normalize(displayName)`
2. **Fuzzy**: inclusión parcial en ambas direcciones
3. Si no hay match: `ingredient_id` queda `NULL`

`normalize(s)` = lowercase + NFD strip de acentos + trim

---

## 5. Brechas críticas

| # | Problema | Impacto |
|---|---|---|
| 1 | **Sin seed de datos** | Catálogo vacío — el matching nunca encuentra nada |
| 2 | **Sin migración SQL de `ingredients`** | El schema no es reproducible fuera de Lovable Cloud |
| 3 | **`enrichWithIngredientIds` no se invoca** | Existe la lógica pero no hay punto de entrada activo en importación ni creación |
| 4 | **Sin UI de vinculación manual** | Ingredientes con `ingredient_id = NULL` no tienen forma de vincularse desde la app |
| 5 | **Campo `source` no implementado** | `ingredient_prices` no tiene el campo `source` (manual/scanner/open_prices) que figura en el PRD |
| 6 | **`CATEGORY_LABELS`/`DIFFICULTY_LABELS` hardcodeados** | No usan i18n, violan la regla de cero strings hardcodeadas |
