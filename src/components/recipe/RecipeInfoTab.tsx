import { Star, CheckCircle2, XCircle, Ruler } from "lucide-react";
import type { RecipeWithComponents } from "@/types/recipe";
import { useTranslation } from "react-i18next";

interface Props {
  recipe: RecipeWithComponents;
}

export function RecipeInfoTab({ recipe }: Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Rating */}
      {recipe.rating && (
        <div className="bg-card rounded-xl p-4 shadow-card">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{t("recipeInfo.rating")}</p>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`h-5 w-5 ${s <= recipe.rating! ? "fill-primary text-primary" : "text-border"}`}
              />
            ))}
            <span className="text-sm text-muted-foreground ml-2">{recipe.rating}/5</span>
          </div>
        </div>
      )}

      {/* Tested status */}
      <div className="bg-card rounded-xl p-4 shadow-card">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{t("recipeInfo.testStatus")}</p>
        <div className="flex items-center gap-2">
          {recipe.tested ? (
            <>
              <CheckCircle2 className="h-5 w-5 text-success" />
              <span className="text-sm font-medium text-success">{t("recipeInfo.tested")}</span>
            </>
          ) : (
            <>
              <XCircle className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{t("recipeInfo.notTested")}</span>
            </>
          )}
        </div>
        {recipe.test_notes && (
          <p className="text-sm text-muted-foreground mt-2 bg-muted/50 rounded-md p-2">
            {recipe.test_notes}
          </p>
        )}
      </div>

      {/* Scale factors */}
      {recipe.recipe_scale_factors?.length > 0 && (
        <div className="bg-card rounded-xl p-4 shadow-card">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Ruler className="h-3.5 w-3.5" /> {t("recipeInfo.scaleFactors")}
          </p>
          <div className="space-y-2">
            {recipe.recipe_scale_factors.map((sf) => (
              <div key={sf.id} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{sf.reference_mold} → {sf.target_mold}</span>
                <span className="font-mono text-primary font-medium">×{sf.multiplier}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
