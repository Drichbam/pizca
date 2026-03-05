import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIngredientCatalog } from "@/hooks/useIngredientCatalog";
import { groupIngredients } from "@/lib/shoppingList";
import type { RecipeComponent, RecipeIngredient } from "@/types/recipe";

interface Props {
  open: boolean;
  onClose: () => void;
  components: (RecipeComponent & { recipe_ingredients: RecipeIngredient[] })[];
}

export function RecipeShoppingList({ open, onClose, components }: Props) {
  const { t } = useTranslation();
  const { data: catalog = [] } = useIngredientCatalog();

  const allIngredients = components.flatMap((c) => c.recipe_ingredients || []);
  const items = groupIngredients(allIngredients, catalog, i18n.language);

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>{t("shoppingList.title")}</SheetTitle>
        </SheetHeader>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">{t("shoppingList.empty")}</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {items.map((item) => (
              <li key={item.key} className="flex items-start gap-2 text-sm">
                <span className="min-w-[6rem] text-right tabular-nums font-medium text-primary shrink-0">
                  {item.totalsByUnit.map(({ unit, total }) =>
                    total != null ? `${total} ${unit || ""}` : (unit === "QS" ? "QS" : "—")
                  ).join(" + ")}
                </span>
                <span className="text-foreground">
                  {item.label}
                  {item.aliases.length > 0 && (
                    <span className="text-muted-foreground text-xs ml-1">
                      ({t("shoppingList.also")} {item.aliases.join(", ")})
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </SheetContent>
    </Sheet>
  );
}
