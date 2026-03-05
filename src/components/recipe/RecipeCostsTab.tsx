import { useMemo } from "react";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { RecipeWithComponents } from "@/types/recipe";
import type { Database } from "@/integrations/supabase/types";
import { useTranslation } from "react-i18next";

type IngredientPrice = Database["public"]["Tables"]["ingredient_prices"]["Row"];

interface Props {
  recipe: RecipeWithComponents;
  onAddPrice?: (ingredientName: string) => void;
}

export function RecipeCostsTab({ recipe, onAddPrice }: Props) {
  const { t } = useTranslation();
  const { data: prices } = useQuery({
    queryKey: ["ingredient_prices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ingredient_prices")
        .select("*")
        .order("ingredient_name");
      if (error) throw error;
      return data as IngredientPrice[];
    },
  });

  const components = [...(recipe.recipe_components || [])].sort((a, b) => a.sort_order - b.sort_order);

  const costData = useMemo(() => {
    if (!prices) return null;

    const priceMap = new Map<string, IngredientPrice>();
    for (const p of prices) {
      const key = p.ingredient_name.toLowerCase().trim();
      if (!priceMap.has(key) || p.is_default) {
        priceMap.set(key, p);
      }
    }

    let grandTotal = 0;
    let allPriced = true;

    const comps = components.map((comp) => {
      const ingredients = [...(comp.recipe_ingredients || [])].sort((a, b) => a.sort_order - b.sort_order);
      let compTotal = 0;
      let compAllPriced = true;

      const items = ingredients.map((ing) => {
        const key = ing.display_name.toLowerCase().trim();
        const price = priceMap.get(key);
        let cost: number | null = null;

        if (price && ing.quantity != null && price.package_size && price.package_size > 0) {
          cost = (ing.quantity / price.package_size) * price.price;
          compTotal += cost;
        } else {
          compAllPriced = false;
        }

        return {
          ingredient: ing,
          price,
          cost,
        };
      });

      if (!compAllPriced) allPriced = false;
      grandTotal += compTotal;

      return { component: comp, items, total: compTotal, allPriced: compAllPriced };
    });

    return { comps, grandTotal, allPriced };
  }, [components, prices]);

  const servings = recipe.servings || 1;

  if (!costData) {
    return <p className="text-sm text-muted-foreground">{t("costs.loading")}</p>;
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-card rounded-xl p-4 shadow-card grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground">{t("costs.totalCost")}</p>
          <p className="text-2xl font-bold text-primary tabular-nums">
            {costData.grandTotal.toFixed(2)} €
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t("costs.perServing", { count: servings })}</p>
          <p className="text-2xl font-bold text-foreground tabular-nums">
            {(costData.grandTotal / servings).toFixed(2)} €
          </p>
        </div>
        {!costData.allPriced && (
          <p className="col-span-2 text-xs text-muted-foreground">
            {t("costs.partialWarning")}
          </p>
        )}
      </div>

      {/* Per component */}
      {costData.comps.map(({ component, items, total }) => {
        if (!items.length) return null;
        return (
          <div key={component.id} className="bg-card rounded-xl shadow-card overflow-hidden">
            {component.name && (
              <div className="px-4 pt-3 pb-1 flex items-center justify-between">
                <p className="font-semibold text-foreground text-sm">{component.name}</p>
                <span className="text-xs font-medium text-primary tabular-nums">{total.toFixed(2)} €</span>
              </div>
            )}
            <div className="px-4 pb-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b border-border">
                    <th className="text-left py-1.5 font-medium">{t("costs.colIngredient")}</th>
                    <th className="text-right py-1.5 font-medium w-16">{t("costs.colQty")}</th>
                    <th className="text-right py-1.5 font-medium w-20">{t("costs.colCost")}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(({ ingredient, cost }) => (
                    <tr key={ingredient.id} className="border-b border-border/50 last:border-0">
                      <td className="py-1.5 text-foreground">{ingredient.display_name}</td>
                      <td className="py-1.5 text-right tabular-nums text-muted-foreground">
                        {ingredient.quantity != null ? `${ingredient.quantity} ${ingredient.unit || ""}` : "QS"}
                      </td>
                      <td className="py-1.5 text-right tabular-nums">
                        {cost != null ? (
                          <span className="font-medium text-foreground">{cost.toFixed(2)} €</span>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-muted-foreground hover:text-primary"
                            onClick={() => onAddPrice?.(ingredient.display_name)}
                          >
                            <HelpCircle className="h-3 w-3 mr-1" />?
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
