import { Cake, Clock, Star, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { Recipe } from "@/types/recipe";
import { CATEGORY_COLORS } from "@/types/recipe";
import { useTranslation } from "react-i18next";
import { useRecipeLabels } from "@/hooks/useRecipeLabels";

interface RecipeCardProps {
  recipe: Recipe;
}

const DIFFICULTY_STARS: Record<string, number> = {
  basico: 1,
  intermedio: 2,
  avanzado: 3,
  experto: 4,
};

export function RecipeCard({ recipe }: RecipeCardProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getCategoryLabel, getDifficultyLabel } = useRecipeLabels();
  const totalTime = (recipe.prep_time_min || 0) + (recipe.bake_time_min || 0);

  return (
    <button
      onClick={() => navigate(`/receta/${recipe.id}`)}
      className="bg-card rounded-xl shadow-card hover:shadow-elevated transition-all duration-200 overflow-hidden text-left w-full group"
    >
      {/* Photo */}
      <div className="aspect-[4/3] bg-secondary relative overflow-hidden">
        {recipe.photo_url ? (
          <img
            src={recipe.photo_url}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Cake className="h-12 w-12 text-primary/30" />
          </div>
        )}
        {recipe.tested && (
          <div className="absolute top-2 right-2 bg-success text-success-foreground text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {t("recipeDetail.tested")}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {recipe.title}
        </h3>

        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", CATEGORY_COLORS[recipe.category])}>
            {getCategoryLabel(recipe.category)}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {totalTime > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {totalTime} min
            </span>
          )}
          {recipe.difficulty && (
            <span className="flex items-center gap-1">
              {Array.from({ length: DIFFICULTY_STARS[recipe.difficulty] || 1 }).map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-primary text-primary" />
              ))}
              <span className="ml-0.5">{getDifficultyLabel(recipe.difficulty)}</span>
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
