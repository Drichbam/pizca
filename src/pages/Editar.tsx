import { useParams } from "react-router-dom";
import { useRecipeDetail } from "@/hooks/useRecipes";
import { RecipeForm } from "@/components/recipe-form/RecipeForm";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Editar() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: recipe, isLoading } = useRecipeDetail(id);

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-4 max-w-3xl">
        <div className="h-8 bg-secondary rounded w-1/3 animate-pulse" />
        <div className="h-64 bg-secondary rounded-xl animate-pulse" />
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

  return <RecipeForm recipeId={id} initialRecipe={recipe} />;
}
