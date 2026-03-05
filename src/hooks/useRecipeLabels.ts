import { useTranslation } from "react-i18next";
import type { RecipeCategory, RecipeDifficulty } from "@/types/recipe";

export function useRecipeLabels() {
  const { t } = useTranslation();

  const getCategoryLabel = (category: RecipeCategory): string =>
    t(`categories.${category}`);

  const getDifficultyLabel = (difficulty: RecipeDifficulty): string =>
    t(`difficulty.${difficulty}`);

  return { getCategoryLabel, getDifficultyLabel };
}
