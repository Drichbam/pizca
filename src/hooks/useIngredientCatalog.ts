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
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function findMatchingIngredientIds(search: string, catalog: Ingredient[]): string[] {
  if (!search.trim()) return [];
  const norm = normalize(search);
  return catalog
    .filter((ing) => {
      const t = (ing.translations as Record<string, string>) || {};
      const a = (ing.aliases as Record<string, string[]>) || {};
      return (
        Object.values(t).some((v) => normalize(v).includes(norm) || norm.includes(normalize(v))) ||
        Object.values(a)
          .flat()
          .some((v) => normalize(v).includes(norm) || norm.includes(normalize(v)))
      );
    })
    .map((ing) => ing.id);
}
