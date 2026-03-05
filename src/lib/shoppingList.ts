import type { RecipeIngredient, Ingredient } from "@/types/recipe";

export interface ShoppingItem {
  key: string;
  ingredient_id: string | null;
  label: string;
  aliases: string[];
  totalsByUnit: { unit: string | null; total: number | null }[];
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function groupIngredients(
  ingredients: RecipeIngredient[],
  catalog: Ingredient[],
  lang: string
): ShoppingItem[] {
  const catalogMap = new Map<string, Ingredient>(catalog.map((i) => [i.id, i]));
  const groups = new Map<string, {
    ingredient_id: string | null;
    displayNames: Set<string>;
    label: string;
    quantitiesByUnit: Map<string | null, number | null>;
  }>();

  for (const ing of ingredients) {
    const key = ing.ingredient_id
      ? `id:${ing.ingredient_id}`
      : `raw:${normalize(ing.display_name)}`;

    if (!groups.has(key)) {
      let label = ing.display_name;
      if (ing.ingredient_id) {
        const cat = catalogMap.get(ing.ingredient_id);
        if (cat) {
          const t = (cat.translations as Record<string, string>) || {};
          label = t[lang] || t["es"] || t["fr"] || t["en"] || ing.display_name;
        }
      }
      groups.set(key, {
        ingredient_id: ing.ingredient_id ?? null,
        displayNames: new Set([ing.display_name]),
        label,
        quantitiesByUnit: new Map(),
      });
    } else {
      groups.get(key)!.displayNames.add(ing.display_name);
    }

    const group = groups.get(key)!;
    const unit = ing.unit ?? null;
    if (ing.quantity == null) {
      if (!group.quantitiesByUnit.has(unit)) group.quantitiesByUnit.set(unit, null);
    } else {
      const prev = group.quantitiesByUnit.get(unit);
      group.quantitiesByUnit.set(unit, (prev ?? 0) + Number(ing.quantity));
    }
  }

  return Array.from(groups.entries()).map(([key, g]) => ({
    key,
    ingredient_id: g.ingredient_id,
    label: g.label,
    aliases: Array.from(g.displayNames).filter((d) => d !== g.label),
    totalsByUnit: Array.from(g.quantitiesByUnit.entries()).map(([unit, total]) => ({ unit, total })),
  }));
}
