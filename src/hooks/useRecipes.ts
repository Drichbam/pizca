import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { RecipeWithComponents } from "@/types/recipe";

export function useRecipes() {
  return useQuery({
    queryKey: ["recipes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useRecipeDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["recipe", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select(`
          *,
          recipe_components (
            *,
            recipe_ingredients (*),
            recipe_steps (*)
          ),
          recipe_planning (*),
          recipe_notes (*),
          recipe_variants (*),
          recipe_scale_factors (*)
        `)
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as RecipeWithComponents;
    },
  });
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("recipes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
}

export function useDuplicateRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // Fetch the full recipe
      const { data: recipe, error: fetchError } = await supabase
        .from("recipes")
        .select(`
          *,
          recipe_components (
            *,
            recipe_ingredients (*),
            recipe_steps (*)
          ),
          recipe_planning (*),
          recipe_notes (*),
          recipe_variants (*),
          recipe_scale_factors (*)
        `)
        .eq("id", id)
        .single();
      if (fetchError || !recipe) throw fetchError;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Insert new recipe
      const newSlug = `${recipe.slug}-copia-${Date.now()}`;
      const { data: newRecipe, error: insertError } = await supabase
        .from("recipes")
        .insert({
          user_id: user.id,
          slug: newSlug,
          title: `${recipe.title} (copia)`,
          description: recipe.description,
          photo_url: recipe.photo_url,
          category: recipe.category,
          subcategory: recipe.subcategory,
          servings: recipe.servings,
          mold: recipe.mold,
          prep_time_min: recipe.prep_time_min,
          bake_time_min: recipe.bake_time_min,
          rest_time_min: recipe.rest_time_min,
          total_active_min: recipe.total_active_min,
          temperature: recipe.temperature,
          difficulty: recipe.difficulty,
          planning_days: recipe.planning_days,
          origin_chef: recipe.origin_chef,
          origin_url: recipe.origin_url,
          origin_book: recipe.origin_book,
        })
        .select()
        .single();
      if (insertError || !newRecipe) throw insertError;

      // Duplicate components with their ingredients and steps
      for (const comp of (recipe as any).recipe_components || []) {
        const { data: newComp } = await supabase
          .from("recipe_components")
          .insert({ recipe_id: newRecipe.id, name: comp.name, sort_order: comp.sort_order })
          .select()
          .single();
        if (!newComp) continue;

        const ingredients = (comp.recipe_ingredients || []).map((ing: any) => ({
          component_id: newComp.id,
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          sort_order: ing.sort_order,
        }));
        if (ingredients.length) await supabase.from("recipe_ingredients").insert(ingredients);

        const steps = (comp.recipe_steps || []).map((step: any) => ({
          component_id: newComp.id,
          step_order: step.step_order,
          description: step.description,
          temp_c: step.temp_c,
          duration_min: step.duration_min,
          technical_notes: step.technical_notes,
          photo_url: step.photo_url,
        }));
        if (steps.length) await supabase.from("recipe_steps").insert(steps);
      }

      return newRecipe;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
}
