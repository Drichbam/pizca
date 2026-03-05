import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Thermometer, Users, ChefHat, BookOpen, Link, Pencil, Copy, Trash2, Star, Download, Ruler, Calculator, FileText, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRecipeDetail, useDeleteRecipe, useDuplicateRecipe } from "@/hooks/useRecipes";
import { CATEGORY_COLORS } from "@/types/recipe";
import { useRecipeLabels } from "@/hooks/useRecipeLabels";
import { RecipeIngredientsList } from "@/components/recipe/RecipeIngredientsList";
import { RecipeStepsList } from "@/components/recipe/RecipeStepsList";
import { RecipeNotesTab } from "@/components/recipe/RecipeNotesTab";
import { RecipeInfoTab } from "@/components/recipe/RecipeInfoTab";
import { RecipeMoldsTab } from "@/components/recipe/RecipeMoldsTab";
import { RecipeCostsTab } from "@/components/recipe/RecipeCostsTab";
import { RecipePlanningTimeline } from "@/components/recipe/RecipePlanningTimeline";
import { RecipeFullViewTab } from "@/components/recipe/RecipeFullViewTab";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { exportRecipe } from "@/lib/exportRecipe";
import { exportRecipeToPdf } from "@/lib/exportRecipePdf";
import { cn } from "@/lib/utils";
import { Cake } from "lucide-react";
import { useTranslation } from "react-i18next";

const DIFFICULTY_STARS: Record<string, number> = {
  basico: 1, intermedio: 2, avanzado: 3, experto: 4,
};

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getCategoryLabel, getDifficultyLabel } = useRecipeLabels();
  const { data: recipe, isLoading } = useRecipeDetail(id);
  const deleteRecipe = useDeleteRecipe();
  const duplicateRecipe = useDuplicateRecipe();

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-4">
        <div className="h-48 bg-secondary rounded-xl animate-pulse" />
        <div className="h-6 bg-secondary rounded w-1/2 animate-pulse" />
        <div className="h-4 bg-secondary rounded w-1/3 animate-pulse" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="animate-fade-in text-center py-12">
        <p className="text-muted-foreground">{t("recipes.notFound")}</p>
        <Button variant="outline" onClick={() => navigate("/mis-recetas")} className="mt-4 rounded-lg">
          {t("recipes.backToList")}
        </Button>
      </div>
    );
  }

  const handleDelete = () => {
    deleteRecipe.mutate(recipe.id, {
      onSuccess: () => {
        toast.success(t("recipes.deleted"));
        navigate("/mis-recetas");
      },
      onError: () => toast.error(t("recipes.deleteError")),
    });
  };

  const handleDuplicate = () => {
    duplicateRecipe.mutate(recipe.id, {
      onSuccess: (newRecipe) => {
        toast.success(t("recipes.duplicated"));
        navigate(`/receta/${newRecipe.id}`);
      },
      onError: () => toast.error(t("recipes.duplicateError")),
    });
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-3xl">
      {/* Back button */}
      <button
        onClick={() => navigate("/mis-recetas")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("recipeDetail.backTo")}
      </button>

      {/* Hero photo */}
      <div className="aspect-[16/9] bg-secondary rounded-xl overflow-hidden relative">
        {recipe.photo_url ? (
          <img src={recipe.photo_url} alt={recipe.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Cake className="h-16 w-16 text-primary/20" />
          </div>
        )}
      </div>

      {/* Title & category */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">{recipe.title}</h1>
        {recipe.description && (
          <p className="text-muted-foreground mt-1">{recipe.description}</p>
        )}
      </div>

      {/* Chips */}
      <div className="flex flex-wrap gap-2">
        <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", CATEGORY_COLORS[recipe.category])}>
          {getCategoryLabel(recipe.category)}
        </span>

        {recipe.prep_time_min && (
          <span className="text-xs bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full flex items-center gap-1">
            <Clock className="h-3 w-3" /> {t("recipeDetail.prep")} {recipe.prep_time_min}′
          </span>
        )}
        {recipe.bake_time_min && (
          <span className="text-xs bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full flex items-center gap-1">
            <Thermometer className="h-3 w-3" /> {t("recipeDetail.cooking")} {recipe.bake_time_min}′
          </span>
        )}
        {recipe.rest_time_min && (
          <span className="text-xs bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full flex items-center gap-1">
            <Clock className="h-3 w-3" /> {t("recipeDetail.rest")} {recipe.rest_time_min}′
          </span>
        )}
        {recipe.difficulty && (
          <span className="text-xs bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full flex items-center gap-1">
            {Array.from({ length: DIFFICULTY_STARS[recipe.difficulty] || 1 }).map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-primary text-primary" />
            ))}
            {getDifficultyLabel(recipe.difficulty)}
          </span>
        )}
        {recipe.servings && (
          <span className="text-xs bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full flex items-center gap-1">
            <Users className="h-3 w-3" /> {recipe.servings} {t("recipeDetail.servings")}
          </span>
        )}
        {recipe.mold && (
          <span className="text-xs bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full">
            🍰 {recipe.mold}
          </span>
        )}
        {recipe.temperature && (
          <span className="text-xs bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full flex items-center gap-1">
            <Thermometer className="h-3 w-3" /> {recipe.temperature}°C
          </span>
        )}
        {recipe.tested && (
          <span className="text-xs bg-success text-success-foreground px-2.5 py-1 rounded-full font-medium">
            ✓ {t("recipeDetail.tested")}
          </span>
        )}
        {(recipe.recipe_tags || []).map((rt: any) => (
          <span
            key={rt.id}
            className="text-xs font-medium px-2.5 py-1 rounded-full border"
            style={{ color: rt.tags?.color || "#E8784A", borderColor: rt.tags?.color || "#E8784A" }}
          >
            {rt.tags?.name}
          </span>
        ))}
      </div>

      {/* Origin info */}
      {(recipe.origin_chef || recipe.origin_book || recipe.origin_url) && (
        <div className="bg-card rounded-xl p-4 shadow-card space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("recipeDetail.origin")}</p>
          {recipe.origin_chef && (
            <p className="text-sm flex items-center gap-2">
              <ChefHat className="h-4 w-4 text-primary" /> {recipe.origin_chef}
            </p>
          )}
          {recipe.origin_book && (
            <p className="text-sm flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" /> {recipe.origin_book}
            </p>
          )}
          {recipe.origin_url && (
            <a
              href={recipe.origin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm flex items-center gap-2 text-primary hover:underline"
            >
              <Link className="h-4 w-4" /> {t("recipeDetail.sourceLink")}
            </a>
          )}
        </div>
      )}

      {/* Planning timeline */}
      {recipe.planning_days && recipe.planning_days > 0 && recipe.recipe_planning?.length > 0 && (
        <RecipePlanningTimeline planning={recipe.recipe_planning} />
      )}

      {/* Tabs */}
      <Tabs defaultValue="receta" className="w-full">
        <TabsList className="w-full grid grid-cols-5 bg-secondary rounded-lg h-10">
          <TabsTrigger value="receta" className="rounded-md text-xs">{t("recipeDetail.tabRecipe")}</TabsTrigger>
          <TabsTrigger value="ingredientes" className="rounded-md text-xs">{t("recipeDetail.tabIngredients")}</TabsTrigger>
          <TabsTrigger value="pasos" className="rounded-md text-xs">{t("recipeDetail.tabSteps")}</TabsTrigger>
          <TabsTrigger value="calculos" className="rounded-md text-xs">{t("recipeDetail.tabCalc")}</TabsTrigger>
          <TabsTrigger value="mas" className="rounded-md text-xs">{t("recipeDetail.tabMore")}</TabsTrigger>
        </TabsList>

        <TabsContent value="receta" className="mt-4">
          <RecipeFullViewTab recipe={recipe} />
        </TabsContent>
        <TabsContent value="ingredientes" className="mt-4">
          <RecipeIngredientsList components={recipe.recipe_components} />
        </TabsContent>
        <TabsContent value="pasos" className="mt-4">
          <RecipeStepsList components={recipe.recipe_components} />
        </TabsContent>
        <TabsContent value="calculos" className="mt-4">
          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Ruler className="h-4 w-4 text-primary" /> {t("recipeDetail.moldsSection")}
              </h3>
              <RecipeMoldsTab recipe={recipe} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Calculator className="h-4 w-4 text-primary" /> {t("recipeDetail.costsSection")}
              </h3>
              <RecipeCostsTab recipe={recipe} />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="mas" className="mt-4">
          <div className="space-y-8">
            <RecipeNotesTab notes={recipe.recipe_notes} variants={recipe.recipe_variants} />
            <RecipeInfoTab recipe={recipe} />
          </div>
        </TabsContent>
      </Tabs>

      {/* Action buttons */}
      <div className="flex gap-2 pt-2 pb-4">
        <Button variant="outline" className="rounded-lg flex-1" onClick={() => navigate(`/editar/${recipe.id}`)}>
          <Pencil className="h-4 w-4 mr-1.5" /> {t("recipeDetail.edit")}
        </Button>
        <Button variant="outline" className="rounded-lg flex-1" onClick={handleDuplicate} disabled={duplicateRecipe.isPending}>
          <Copy className="h-4 w-4 mr-1.5" /> {t("recipeDetail.duplicate")}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="rounded-lg">
              <Download className="h-4 w-4 mr-1.5" /> {t("recipeDetail.export")} <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={async () => {
              const toastId = toast.loading(t("recipeDetail.generatingPdf"));
              try { await exportRecipeToPdf(recipe); }
              finally { toast.dismiss(toastId); }
            }}>
              <FileText className="h-4 w-4 mr-2" /> {t("recipeDetail.exportPdf")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { exportRecipe(recipe); toast.success(t("recipes.exportedSuccess")); }}>
              <Download className="h-4 w-4 mr-2" /> {t("recipeDetail.exportJson")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="rounded-lg text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("recipeDetail.deleteTitle")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("recipeDetail.deleteDescription", { title: recipe.title })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-lg">{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {t("recipeDetail.confirmDelete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
