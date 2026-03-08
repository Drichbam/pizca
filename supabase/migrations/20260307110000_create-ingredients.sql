-- ============================================================
-- Catálogo canónico de ingredientes (multilingüe)
-- Tabla pública de solo lectura, compartida entre usuarios
-- ============================================================

CREATE TABLE public.ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  translations JSONB NOT NULL DEFAULT '{}',
  aliases JSONB NOT NULL DEFAULT '{}',
  off_category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sin RLS: lectura pública, escritura solo vía migraciones/admin
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to ingredients"
  ON public.ingredients FOR SELECT
  USING (true);

-- Añadir FK a recipe_ingredients si la columna no existe
ALTER TABLE public.recipe_ingredients
  ADD COLUMN IF NOT EXISTS ingredient_id UUID REFERENCES public.ingredients(id);

-- Añadir FK a ingredient_prices si la columna no existe
ALTER TABLE public.ingredient_prices
  ADD COLUMN IF NOT EXISTS ingredient_id UUID REFERENCES public.ingredients(id);

-- Añadir FK a shopping_list_items si la columna no existe
ALTER TABLE public.shopping_list_items
  ADD COLUMN IF NOT EXISTS ingredient_id UUID REFERENCES public.ingredients(id);
