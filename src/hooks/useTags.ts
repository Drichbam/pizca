import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tag } from "@/types/recipe";

export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Tag[];
    },
  });
}

export function useRecipeTags(recipeId: string | undefined) {
  return useQuery({
    queryKey: ["recipe_tags", recipeId],
    enabled: !!recipeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipe_tags")
        .select("*, tags(*)")
        .eq("recipe_id", recipeId!);
      if (error) throw error;
      return data as ({ id: string; recipe_id: string; tag_id: string; tags: Tag })[];
    },
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, color }: { name: string; color: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");
      const { data, error } = await supabase
        .from("tags")
        .insert({ name, color, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as Tag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tags").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}

export function useSetRecipeTags() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ recipeId, tagIds }: { recipeId: string; tagIds: string[] }) => {
      // Delete existing
      await supabase.from("recipe_tags").delete().eq("recipe_id", recipeId);
      // Insert new
      if (tagIds.length > 0) {
        const { error } = await supabase.from("recipe_tags").insert(
          tagIds.map(tag_id => ({ recipe_id: recipeId, tag_id }))
        );
        if (error) throw error;
      }
    },
    onSuccess: (_, { recipeId }) => {
      queryClient.invalidateQueries({ queryKey: ["recipe_tags", recipeId] });
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
}
