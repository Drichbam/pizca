import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Ingredient } from "@/types/recipe";

export function useIngredientCatalog() {
  return useQuery({
    queryKey: ["ingredient_catalog"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ingredients").select("*");
      if (error) throw error;
      return (data || []) as Ingredient[];
    },
    staleTime: 1000 * 60 * 60, // 1 hour — catalog rarely changes
  });
}

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Returns the IDs of catalog ingredients whose translations or aliases
 * contain (or are contained by) the search string.
 */
export function findMatchingIngredientIds(
  search: string,
  catalog: Ingredient[]
): string[] {
  if (!search.trim()) return [];
  const norm = normalize(search);

  return catalog
    .filter((ing) => {
      const t = ing.translations as Record<string, string>;
      const a = ing.aliases as Record<string, string[]>;

      const translationMatch = Object.values(t).some(
        (v) => normalize(v).includes(norm) || norm.includes(normalize(v))
      );
      if (translationMatch) return true;

      return Object.values(a)
        .flat()
        .some((v) => normalize(v).includes(norm) || norm.includes(normalize(v)));
    })
    .map((ing) => ing.id);
}
