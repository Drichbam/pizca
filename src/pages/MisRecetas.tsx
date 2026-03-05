import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, Upload, Download, Tag as TagIcon, Cake } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRecipes } from "@/hooks/useRecipes";
import { useTags } from "@/hooks/useTags";
import { RecipeCard } from "@/components/RecipeCard";
import { useRecipeLabels } from "@/hooks/useRecipeLabels";
import { useIngredientCatalog, findMatchingIngredientIds } from "@/hooks/useIngredientCatalog";
import { supabase } from "@/integrations/supabase/client";
import type { RecipeCategory, RecipeDifficulty } from "@/types/recipe";
import { cn } from "@/lib/utils";
import { exportMultipleRecipes } from "@/lib/exportRecipe";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const ALL_CATEGORIES: RecipeCategory[] = [
  "tartes", "entremets", "biscuits", "gâteaux", "pâtes-de-base",
  "crèmes-de-base", "mousses", "glaces-sorbets", "viennoiserie", "confiserie", "autre",
];
const ALL_DIFFICULTIES: RecipeDifficulty[] = ["basico", "intermedio", "avanzado", "experto"];

export default function MisRecetas() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getCategoryLabel, getDifficultyLabel } = useRecipeLabels();
  const { data: recipes, isLoading } = useRecipes();
  const { data: tags } = useTags();
  const { data: catalog = [] } = useIngredientCatalog();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<RecipeCategory | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<RecipeDifficulty | null>(null);
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  // Find catalog ingredient IDs that match the search term (client-side, fast)
  const matchingIngredientIds = useMemo(
    () => (search ? findMatchingIngredientIds(search, catalog) : []),
    [search, catalog]
  );

  // Fetch recipe IDs that contain those ingredient IDs
  const { data: ingredientMatchIds } = useQuery({
    queryKey: ["recipe_ids_by_ingredient", matchingIngredientIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipe_ingredients")
        .select("component_id, recipe_components!inner(recipe_id)")
        .in("ingredient_id", matchingIngredientIds);
      if (error) throw error;
      const ids = new Set<string>();
      (data || []).forEach((r: any) => {
        if (r.recipe_components?.recipe_id) ids.add(r.recipe_components.recipe_id);
      });
      return ids;
    },
    enabled: matchingIngredientIds.length > 0,
  });

  const filtered = useMemo(() => {
    if (!recipes) return [];
    return recipes.filter((r: any) => {
      const matchesSearch =
        !search ||
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        (ingredientMatchIds?.has(r.id) ?? false);
      const matchesCategory = !categoryFilter || r.category === categoryFilter;
      const matchesDifficulty = !difficultyFilter || r.difficulty === difficultyFilter;
      const matchesTag = !tagFilter || (r.recipe_tags || []).some((rt: any) => rt.tag_id === tagFilter);
      return matchesSearch && matchesCategory && matchesDifficulty && matchesTag;
    });
  }, [recipes, search, ingredientMatchIds, categoryFilter, difficultyFilter, tagFilter]);

  return (
    <div className="animate-fade-in space-y-5 max-w-full">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground truncate">{t("recipes.title")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("recipes.count", { count: recipes?.length || 0 })}
          </p>
        </div>
        <div className="flex gap-2 shrink-0 w-full sm:w-auto justify-end">
          <Button
            variant="outline"
            onClick={async () => {
              if (!recipes?.length) return;
              try {
                await exportMultipleRecipes(recipes.map((r: any) => r.id));
                toast.success(t("recipes.exportedMany", { count: recipes.length }));
              } catch {
                toast.error(t("recipes.exportError"));
              }
            }}
            className="rounded-lg"
            size="sm"
            disabled={!recipes?.length}
          >
            <Download className="h-4 w-4" /> <span className="hidden md:inline">{t("recipes.export")}</span>
          </Button>
          <Button variant="outline" onClick={() => navigate("/importar")} className="rounded-lg" size="sm">
            <Upload className="h-4 w-4" /> <span className="hidden md:inline">{t("recipes.import")}</span>
          </Button>
          <Button onClick={() => navigate("/crear")} className="rounded-lg" size="sm">
            {t("recipes.new")}
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("recipes.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 rounded-lg"
        />
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setCategoryFilter(null)}
          className={cn(
            "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
            !categoryFilter ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
          )}
        >
          {t("recipes.all")}
        </button>
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap",
              categoryFilter === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            )}
          >
            {getCategoryLabel(cat)}
          </button>
        ))}
      </div>

      {/* Difficulty filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
        {ALL_DIFFICULTIES.map((diff) => (
          <button
            key={diff}
            onClick={() => setDifficultyFilter(difficultyFilter === diff ? null : diff)}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              difficultyFilter === diff ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            )}
          >
            {getDifficultyLabel(diff)}
          </button>
        ))}
      </div>

      {/* Tag filters */}
      {tags && tags.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <TagIcon className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setTagFilter(tagFilter === tag.id ? null : tag.id)}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border whitespace-nowrap"
              style={{
                backgroundColor: tagFilter === tag.id ? (tag.color || "#E8784A") : "transparent",
                color: tagFilter === tag.id ? "#fff" : (tag.color || "#E8784A"),
                borderColor: tag.color || "#E8784A",
              }}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-card rounded-xl shadow-card animate-pulse">
              <div className="aspect-[4/3] bg-secondary rounded-t-xl" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-secondary rounded w-3/4" />
                <div className="h-3 bg-secondary rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-xl p-12 shadow-card text-center">
          <div className="h-20 w-20 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
            {recipes?.length ? (
              <Search className="h-10 w-10 text-accent-foreground" />
            ) : (
              <Cake className="h-10 w-10 text-accent-foreground" />
            )}
          </div>
          <h3 className="font-semibold text-foreground text-lg mb-2">
            {recipes?.length ? t("recipes.noResults") : t("recipes.empty")}
          </h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            {recipes?.length ? t("recipes.noResultsHint") : t("recipes.emptyHint")}
          </p>
          {!recipes?.length && (
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate("/crear")} className="rounded-lg">
                {t("recipes.create")}
              </Button>
              <Button variant="outline" onClick={() => navigate("/importar")} className="rounded-lg">
                <Upload className="h-4 w-4 mr-1" /> {t("recipes.import")}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((recipe: any) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
