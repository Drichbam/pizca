import { supabase } from "@/integrations/supabase/client";
import type { RecipeWithComponents } from "@/types/recipe";

/** Convert a full recipe (with relations) to the Pizca JSON format */
function recipeToJson(recipe: RecipeWithComponents) {
  const components = (recipe.recipe_components || [])
    .sort((a, b) => a.sort_order - b.sort_order);

  return {
    id: recipe.slug,
    nombre: recipe.title,
    categoria: recipe.category,
    subcategoria: recipe.subcategory || null,
    origen: {
      chef_autor: recipe.origin_chef || null,
      fuente_url: recipe.origin_url || null,
      libro: recipe.origin_book || null,
    },
    porciones: recipe.servings || null,
    molde: recipe.mold || null,
    planificacion_dias: recipe.planning_days || null,
    planning: (recipe.recipe_planning || [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((p) => ({ dia: p.day_label, tareas: p.tasks })),
    tiempos: {
      preparacion_min: recipe.prep_time_min || null,
      coccion_min: recipe.bake_time_min || null,
      reposo_min: recipe.rest_time_min || null,
      total_activo_min: recipe.total_active_min || null,
    },
    dificultad: recipe.difficulty || null,
    temperatura_horno_c: recipe.temperature || null,
    componentes: components.map((c) => ({
      nombre: c.name,
      ingredientes: (c.recipe_ingredients || [])
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((ing) => ({
          cantidad: ing.quantity ?? null,
          unidad: ing.unit || null,
          ingrediente: ing.name,
        })),
    })),
    preparacion: components
      .filter((c) => (c.recipe_steps || []).length > 0)
      .map((c) => ({
        componente: c.name,
        pasos: (c.recipe_steps || [])
          .sort((a, b) => a.step_order - b.step_order)
          .map((s) => ({
            orden: s.step_order,
            descripcion: s.description,
            temp_c: s.temp_c ?? null,
            duracion_min: s.duration_min ?? null,
            notas_tecnicas: s.technical_notes || null,
          })),
      })),
    notas: (recipe.recipe_notes || [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((n) => n.content),
    variantes: (recipe.recipe_variants || []).map((v) => ({
      nombre: v.name,
      descripcion: v.description || null,
    })),
    escalado: recipe.recipe_scale_factors?.length
      ? {
          referencia: recipe.recipe_scale_factors[0].reference_mold,
          factores: recipe.recipe_scale_factors.map((sf) => ({
            molde: sf.target_mold,
            multiplicador: sf.multiplier,
          })),
        }
      : null,
    probado: recipe.tested ?? false,
    notas_prueba: recipe.test_notes || null,
    valoracion: recipe.rating || null,
  };
}

function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Export a single recipe (already loaded with components) */
export function exportRecipe(recipe: RecipeWithComponents) {
  const json = recipeToJson(recipe);
  downloadJson(json, `${recipe.slug}.json`);
}

/** Fetch full recipe by ID and export it */
export async function fetchAndExportRecipe(recipeId: string) {
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
    .eq("id", recipeId)
    .single();
  if (error || !data) throw error || new Error("Recipe not found");
  exportRecipe(data as RecipeWithComponents);
}

/** Export multiple recipes as an array in a single JSON file */
export async function exportMultipleRecipes(recipeIds: string[]) {
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
    .in("id", recipeIds);
  if (error || !data) throw error || new Error("Recipes not found");
  const jsons = (data as RecipeWithComponents[]).map(recipeToJson);
  downloadJson(jsons, `recetas-export-${Date.now()}.json`);
}
