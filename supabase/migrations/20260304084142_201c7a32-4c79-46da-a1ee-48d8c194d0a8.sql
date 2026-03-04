
-- ==========================================
-- ENUMS
-- ==========================================
CREATE TYPE public.recipe_category AS ENUM (
  'tartes','entremets','biscuits','gâteaux','pâtes-de-base',
  'crèmes-de-base','mousses','glaces-sorbets','viennoiserie','confiserie','autre'
);

CREATE TYPE public.recipe_difficulty AS ENUM ('basico','intermedio','avanzado','experto');

CREATE TYPE public.ingredient_unit AS ENUM ('g','kg','ml','cl','dl','l','pcs','QS','cc','cs','pincée');

-- ==========================================
-- HELPER: updated_at trigger function
-- ==========================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ==========================================
-- 1. RECIPES
-- ==========================================
CREATE TABLE public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  photo_url TEXT,
  category public.recipe_category NOT NULL DEFAULT 'autre',
  subcategory TEXT,
  servings INT,
  mold TEXT,
  prep_time_min INT,
  bake_time_min INT,
  rest_time_min INT,
  total_active_min INT,
  temperature INT,
  difficulty public.recipe_difficulty DEFAULT 'basico',
  planning_days INT,
  origin_chef TEXT,
  origin_url TEXT,
  origin_book TEXT,
  tested BOOLEAN DEFAULT false,
  test_notes TEXT,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, slug)
);

ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own recipes" ON public.recipes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recipes" ON public.recipes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recipes" ON public.recipes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own recipes" ON public.recipes FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON public.recipes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_recipes_user_id ON public.recipes(user_id);
CREATE INDEX idx_recipes_category ON public.recipes(category);

-- ==========================================
-- 2. RECIPE_COMPONENTS
-- ==========================================
CREATE TABLE public.recipe_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0
);

ALTER TABLE public.recipe_components ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own recipe_components" ON public.recipe_components FOR SELECT USING (EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own recipe_components" ON public.recipe_components FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_id AND user_id = auth.uid()));
CREATE POLICY "Users can update own recipe_components" ON public.recipe_components FOR UPDATE USING (EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete own recipe_components" ON public.recipe_components FOR DELETE USING (EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_id AND user_id = auth.uid()));
CREATE INDEX idx_recipe_components_recipe_id ON public.recipe_components(recipe_id);

-- ==========================================
-- 3. RECIPE_INGREDIENTS
-- ==========================================
CREATE TABLE public.recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID NOT NULL REFERENCES public.recipe_components(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity DECIMAL,
  unit public.ingredient_unit,
  sort_order INT NOT NULL DEFAULT 0
);

ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own recipe_ingredients" ON public.recipe_ingredients FOR SELECT USING (EXISTS (SELECT 1 FROM public.recipe_components rc JOIN public.recipes r ON r.id = rc.recipe_id WHERE rc.id = component_id AND r.user_id = auth.uid()));
CREATE POLICY "Users can insert own recipe_ingredients" ON public.recipe_ingredients FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.recipe_components rc JOIN public.recipes r ON r.id = rc.recipe_id WHERE rc.id = component_id AND r.user_id = auth.uid()));
CREATE POLICY "Users can update own recipe_ingredients" ON public.recipe_ingredients FOR UPDATE USING (EXISTS (SELECT 1 FROM public.recipe_components rc JOIN public.recipes r ON r.id = rc.recipe_id WHERE rc.id = component_id AND r.user_id = auth.uid()));
CREATE POLICY "Users can delete own recipe_ingredients" ON public.recipe_ingredients FOR DELETE USING (EXISTS (SELECT 1 FROM public.recipe_components rc JOIN public.recipes r ON r.id = rc.recipe_id WHERE rc.id = component_id AND r.user_id = auth.uid()));
CREATE INDEX idx_recipe_ingredients_component_id ON public.recipe_ingredients(component_id);

-- ==========================================
-- 4. RECIPE_STEPS
-- ==========================================
CREATE TABLE public.recipe_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID NOT NULL REFERENCES public.recipe_components(id) ON DELETE CASCADE,
  step_order INT NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  temp_c INT,
  duration_min INT,
  technical_notes TEXT,
  photo_url TEXT
);

ALTER TABLE public.recipe_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own recipe_steps" ON public.recipe_steps FOR SELECT USING (EXISTS (SELECT 1 FROM public.recipe_components rc JOIN public.recipes r ON r.id = rc.recipe_id WHERE rc.id = component_id AND r.user_id = auth.uid()));
CREATE POLICY "Users can insert own recipe_steps" ON public.recipe_steps FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.recipe_components rc JOIN public.recipes r ON r.id = rc.recipe_id WHERE rc.id = component_id AND r.user_id = auth.uid()));
CREATE POLICY "Users can update own recipe_steps" ON public.recipe_steps FOR UPDATE USING (EXISTS (SELECT 1 FROM public.recipe_components rc JOIN public.recipes r ON r.id = rc.recipe_id WHERE rc.id = component_id AND r.user_id = auth.uid()));
CREATE POLICY "Users can delete own recipe_steps" ON public.recipe_steps FOR DELETE USING (EXISTS (SELECT 1 FROM public.recipe_components rc JOIN public.recipes r ON r.id = rc.recipe_id WHERE rc.id = component_id AND r.user_id = auth.uid()));
CREATE INDEX idx_recipe_steps_component_id ON public.recipe_steps(component_id);

-- ==========================================
-- 5. RECIPE_PLANNING
-- ==========================================
CREATE TABLE public.recipe_planning (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  day_label TEXT NOT NULL,
  tasks TEXT[] NOT NULL DEFAULT '{}',
  sort_order INT NOT NULL DEFAULT 0
);

ALTER TABLE public.recipe_planning ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own recipe_planning" ON public.recipe_planning FOR SELECT USING (EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own recipe_planning" ON public.recipe_planning FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_id AND user_id = auth.uid()));
CREATE POLICY "Users can update own recipe_planning" ON public.recipe_planning FOR UPDATE USING (EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete own recipe_planning" ON public.recipe_planning FOR DELETE USING (EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_id AND user_id = auth.uid()));

-- ==========================================
-- 6. RECIPE_NOTES
-- ==========================================
CREATE TABLE public.recipe_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

ALTER TABLE public.recipe_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own recipe_notes" ON public.recipe_notes FOR SELECT USING (EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own recipe_notes" ON public.recipe_notes FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_id AND user_id = auth.uid()));
CREATE POLICY "Users can update own recipe_notes" ON public.recipe_notes FOR UPDATE USING (EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete own recipe_notes" ON public.recipe_notes FOR DELETE USING (EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_id AND user_id = auth.uid()));

-- ==========================================
-- 7. RECIPE_VARIANTS
-- ==========================================
CREATE TABLE public.recipe_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT
);

ALTER TABLE public.recipe_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own recipe_variants" ON public.recipe_variants FOR SELECT USING (EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own recipe_variants" ON public.recipe_variants FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_id AND user_id = auth.uid()));
CREATE POLICY "Users can update own recipe_variants" ON public.recipe_variants FOR UPDATE USING (EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete own recipe_variants" ON public.recipe_variants FOR DELETE USING (EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_id AND user_id = auth.uid()));

-- ==========================================
-- 8. RECIPE_SCALE_FACTORS
-- ==========================================
CREATE TABLE public.recipe_scale_factors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  reference_mold TEXT NOT NULL,
  target_mold TEXT NOT NULL,
  multiplier DECIMAL NOT NULL
);

ALTER TABLE public.recipe_scale_factors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own recipe_scale_factors" ON public.recipe_scale_factors FOR SELECT USING (EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own recipe_scale_factors" ON public.recipe_scale_factors FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_id AND user_id = auth.uid()));
CREATE POLICY "Users can update own recipe_scale_factors" ON public.recipe_scale_factors FOR UPDATE USING (EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete own recipe_scale_factors" ON public.recipe_scale_factors FOR DELETE USING (EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_id AND user_id = auth.uid()));

-- ==========================================
-- 9. TAGS + RECIPE_TAGS
-- ==========================================
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  UNIQUE(user_id, name)
);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tags" ON public.tags FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tags" ON public.tags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tags" ON public.tags FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tags" ON public.tags FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.recipe_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  UNIQUE(recipe_id, tag_id)
);

ALTER TABLE public.recipe_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own recipe_tags" ON public.recipe_tags FOR SELECT USING (EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own recipe_tags" ON public.recipe_tags FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete own recipe_tags" ON public.recipe_tags FOR DELETE USING (EXISTS (SELECT 1 FROM public.recipes WHERE id = recipe_id AND user_id = auth.uid()));

-- ==========================================
-- 10. INGREDIENT_PRICES
-- ==========================================
CREATE TABLE public.ingredient_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL,
  brand TEXT,
  supermarket TEXT,
  price DECIMAL NOT NULL,
  package_size DECIMAL,
  package_unit public.ingredient_unit,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ingredient_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own ingredient_prices" ON public.ingredient_prices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ingredient_prices" ON public.ingredient_prices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ingredient_prices" ON public.ingredient_prices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ingredient_prices" ON public.ingredient_prices FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_ingredient_prices_updated_at BEFORE UPDATE ON public.ingredient_prices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================
-- 11. SHOPPING_LISTS + ITEMS
-- ==========================================
CREATE TABLE public.shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own shopping_lists" ON public.shopping_lists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own shopping_lists" ON public.shopping_lists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own shopping_lists" ON public.shopping_lists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own shopping_lists" ON public.shopping_lists FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_shopping_lists_updated_at BEFORE UPDATE ON public.shopping_lists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.shopping_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopping_list_id UUID NOT NULL REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL,
  quantity DECIMAL,
  unit public.ingredient_unit,
  checked BOOLEAN DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0
);

ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own shopping_list_items" ON public.shopping_list_items FOR SELECT USING (EXISTS (SELECT 1 FROM public.shopping_lists WHERE id = shopping_list_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own shopping_list_items" ON public.shopping_list_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.shopping_lists WHERE id = shopping_list_id AND user_id = auth.uid()));
CREATE POLICY "Users can update own shopping_list_items" ON public.shopping_list_items FOR UPDATE USING (EXISTS (SELECT 1 FROM public.shopping_lists WHERE id = shopping_list_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete own shopping_list_items" ON public.shopping_list_items FOR DELETE USING (EXISTS (SELECT 1 FROM public.shopping_lists WHERE id = shopping_list_id AND user_id = auth.uid()));
