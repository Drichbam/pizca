import type { RecipeIngredient, Ingredient } from "@/types/recipe";

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export interface ShoppingItem {
  key: string;
  ingredient_id: string | null;
  /** Canonical name in active language (or original display_name if unmatched) */
  label: string;
  /** All distinct display_names that belong to this group */
  aliases: string[];
  /** Quantities summed per unit */
  totalsByUnit: { unit: string | null; total: number | null }[];
}

/**
 * Group a flat list of recipe ingredients by ingredient_id (catalog-matched)
 * or by normalized display_name (unmatched). Sums quantities per unit within
 * each group and returns them sorted alphabetically.
 */
export function groupIngredients(
  ingredients: RecipeIngredient[],
  catalog: Ingredient[],
  lang: string
): ShoppingItem[] {
  const catalogMap = new Map(catalog.map((c) => [c.id, c]));
  const groups = new Map<string, ShoppingItem>();

  for (const ing of ingredients) {
    const key = ing.ingredient_id
      ? `id:${ing.ingredient_id}`
      : `raw:${normalize(ing.display_name)}`;

    if (!groups.has(key)) {
      let label = ing.display_name;
      if (ing.ingredient_id) {
        const cat = catalogMap.get(ing.ingredient_id);
        if (cat) {
          const t = cat.translations as Record<string, string>;
          label = t[lang] || t["es"] || t["fr"] || t["en"] || ing.display_name;
        }
      }
      groups.set(key, {
        key,
        ingredient_id: ing.ingredient_id,
        label,
        aliases: [],
        totalsByUnit: [],
      });
    }

    const group = groups.get(key)!;

    // Track distinct display_names (e.g. "beurre doux", "beurre noisette")
    if (!group.aliases.includes(ing.display_name)) {
      group.aliases.push(ing.display_name);
    }

    // Sum quantities per unit
    const existing = group.totalsByUnit.find((u) => u.unit === ing.unit);
    if (existing) {
      if (ing.quantity != null && existing.total != null) {
        existing.total += ing.quantity;
      } else {
        existing.total = null; // can't sum if any value is unknown
      }
    } else {
      group.totalsByUnit.push({
        unit: ing.unit,
        total: ing.quantity,
      });
    }
  }

  return Array.from(groups.values()).sort((a, b) =>
    a.label.localeCompare(b.label, lang)
  );
}
