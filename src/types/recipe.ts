import { Database } from "@/integrations/supabase/types";

export type Recipe = Database["public"]["Tables"]["recipes"]["Row"];
export type Ingredient = Database["public"]["Tables"]["ingredients"]["Row"];
export type RecipeInsert = Database["public"]["Tables"]["recipes"]["Insert"];
export type RecipeComponent = Database["public"]["Tables"]["recipe_components"]["Row"];
export type RecipeIngredient = Database["public"]["Tables"]["recipe_ingredients"]["Row"];
export type RecipeStep = Database["public"]["Tables"]["recipe_steps"]["Row"];
export type RecipePlanning = Database["public"]["Tables"]["recipe_planning"]["Row"];
export type RecipeNote = Database["public"]["Tables"]["recipe_notes"]["Row"];
export type RecipeVariant = Database["public"]["Tables"]["recipe_variants"]["Row"];
export type RecipeScaleFactor = Database["public"]["Tables"]["recipe_scale_factors"]["Row"];
export type Tag = Database["public"]["Tables"]["tags"]["Row"];
export type RecipeTag = Database["public"]["Tables"]["recipe_tags"]["Row"];

export type RecipeCategory = Database["public"]["Enums"]["recipe_category"];
export type RecipeDifficulty = Database["public"]["Enums"]["recipe_difficulty"];
export type IngredientUnit = Database["public"]["Enums"]["ingredient_unit"];

export const CATEGORY_LABELS: Record<RecipeCategory, string> = {
  tartes: "Tartes",
  entremets: "Entremets",
  biscuits: "Biscuits",
  "gâteaux": "Gâteaux",
  "pâtes-de-base": "Pâtes de base",
  "crèmes-de-base": "Crèmes de base",
  mousses: "Mousses",
  "glaces-sorbets": "Glaces & Sorbets",
  viennoiserie: "Viennoiserie",
  confiserie: "Confiserie",
  autre: "Autre",
};

export const CATEGORY_COLORS: Record<RecipeCategory, string> = {
  tartes: "bg-amber-100 text-amber-800",
  entremets: "bg-rose-100 text-rose-800",
  biscuits: "bg-yellow-100 text-yellow-800",
  "gâteaux": "bg-orange-100 text-orange-800",
  "pâtes-de-base": "bg-stone-100 text-stone-700",
  "crèmes-de-base": "bg-sky-100 text-sky-800",
  mousses: "bg-pink-100 text-pink-800",
  "glaces-sorbets": "bg-cyan-100 text-cyan-800",
  viennoiserie: "bg-amber-50 text-amber-700",
  confiserie: "bg-purple-100 text-purple-800",
  autre: "bg-muted text-muted-foreground",
};

export const DIFFICULTY_LABELS: Record<RecipeDifficulty, string> = {
  basico: "Básico",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
  experto: "Experto",
};

export const DIFFICULTY_ICONS: Record<RecipeDifficulty, number> = {
  basico: 1,
  intermedio: 2,
  avanzado: 3,
  experto: 4,
};

export type RecipeWithComponents = Recipe & {
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
