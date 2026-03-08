import { supabase } from "@/integrations/supabase/client";
import type { Ingredient } from "@/types/recipe";

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function findIngredientId(displayName: string, catalog: Ingredient[]): string | null {
  const norm = normalize(displayName);
  for (const ing of catalog) {
    const t = (ing.translations as Record<string, string>) || {};
    const a = (ing.aliases as Record<string, string[]>) || {};
    if (Object.values(t).some((v) => normalize(v) === norm)) return ing.id;
    if (Object.values(a).flat().some((v) => normalize(v) === norm)) return ing.id;
  }
  // Fuzzy: partial match
  for (const ing of catalog) {
    const t = (ing.translations as Record<string, string>) || {};
    const a = (ing.aliases as Record<string, string[]>) || {};
    if (
      Object.values(t).some((v) => normalize(v).includes(norm) || norm.includes(normalize(v))) ||
      Object.values(a).flat().some((v) => normalize(v).includes(norm) || norm.includes(normalize(v)))
    ) {
      return ing.id;
    }
  }
  return null;
}

export async function enrichWithIngredientIds(
  ingredients: { id: string; name: string }[]
): Promise<void> {
  const { data: catalog } = await supabase.from("ingredients").select("*");
  if (!catalog?.length) return;

  const updates: { id: string; ingredient_id: string }[] = [];
  for (const ing of ingredients) {
    const ingredientId = findIngredientId(ing.name, catalog as Ingredient[]);
    if (ingredientId) updates.push({ id: ing.id, ingredient_id: ingredientId });
  }

  for (const update of updates) {
    await supabase
      .from("recipe_ingredients")
      .update({ ingredient_id: update.ingredient_id })
      .eq("id", update.id);
  }
}
