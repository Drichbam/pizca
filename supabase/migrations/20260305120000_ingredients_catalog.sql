-- ═══════════════════════════════════════════════════════════════════
-- Fase 3: Catálogo de ingredientes + FK en tablas relacionadas
-- ═══════════════════════════════════════════════════════════════════

-- 1. Crear tabla de catálogo canónico de ingredientes
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ingredients (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_name TEXT UNIQUE NOT NULL,
  category       TEXT NOT NULL DEFAULT 'other',
  translations   JSONB NOT NULL DEFAULT '{}',
  aliases        JSONB NOT NULL DEFAULT '{}',
  off_category   TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sin RLS: tabla pública de solo lectura compartida entre usuarios
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ingredients_select_all"
  ON public.ingredients FOR SELECT
  USING (true);

-- Solo admins pueden insertar/actualizar (sin política = bloqueado para usuarios)

-- 2. Renombrar recipe_ingredients.name → display_name
-- ────────────────────────────────────────────────────────────────────
ALTER TABLE public.recipe_ingredients
  RENAME COLUMN name TO display_name;

-- 3. Añadir ingredient_id FK nullable a recipe_ingredients
-- ────────────────────────────────────────────────────────────────────
ALTER TABLE public.recipe_ingredients
  ADD COLUMN IF NOT EXISTS ingredient_id UUID
    REFERENCES public.ingredients(id) ON DELETE SET NULL;

-- 4. Añadir ingredient_id FK nullable a ingredient_prices
-- ────────────────────────────────────────────────────────────────────
ALTER TABLE public.ingredient_prices
  ADD COLUMN IF NOT EXISTS ingredient_id UUID
    REFERENCES public.ingredients(id) ON DELETE SET NULL;

-- 5. Añadir ingredient_id FK nullable a shopping_list_items
-- ────────────────────────────────────────────────────────────────────
ALTER TABLE public.shopping_list_items
  ADD COLUMN IF NOT EXISTS ingredient_id UUID
    REFERENCES public.ingredients(id) ON DELETE SET NULL;

-- 6. Índices para acelerar búsquedas frecuentes
-- ────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS ingredients_canonical_name_idx
  ON public.ingredients (canonical_name);

CREATE INDEX IF NOT EXISTS ingredients_category_idx
  ON public.ingredients (category);

CREATE INDEX IF NOT EXISTS recipe_ingredients_ingredient_id_idx
  ON public.recipe_ingredients (ingredient_id);

CREATE INDEX IF NOT EXISTS ingredient_prices_ingredient_id_idx
  ON public.ingredient_prices (ingredient_id);
