import { ShoppingCart } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { groupIngredients } from "@/lib/shoppingList";
import { useIngredientCatalog } from "@/hooks/useIngredientCatalog";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import type { RecipeComponent, RecipeIngredient } from "@/types/recipe";

interface Props {
  open: boolean;
  onClose: () => void;
  components: (RecipeComponent & { recipe_ingredients: RecipeIngredient[] })[];
}

export function RecipeShoppingList({ open, onClose, components }: Props) {
  const { t } = useTranslation();
  const { data: catalog = [] } = useIngredientCatalog();

  const allIngredients = components.flatMap((c) => c.recipe_ingredients);
  const items = groupIngredients(allIngredients, catalog, i18n.language);

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto rounded-t-2xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            {t("shoppingList.title")}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            {t("shoppingList.empty")}
          </p>
        ) : (
          <ul className="space-y-0 divide-y divide-border/50">
            {items.map((item) => {
              const showAliases =
                item.aliases.length > 1 ||
                (item.aliases.length === 1 && item.aliases[0] !== item.label);

              return (
                <li key={item.key} className="flex items-baseline gap-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm text-foreground">
                      {item.label}
                    </span>
                    {showAliases && (
                      <span className="text-xs text-muted-foreground ml-1.5 truncate">
                        ({item.aliases.join(", ")})
                      </span>
                    )}
                  </div>
                  <div className="text-sm tabular-nums text-right shrink-0 text-foreground">
                    {item.totalsByUnit.map((u, i) => (
                      <span key={i}>
                        {i > 0 && <span className="text-muted-foreground"> + </span>}
                        {u.total != null ? u.total : ""}
                        {u.unit ? ` ${u.unit}` : ""}
                      </span>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </SheetContent>
    </Sheet>
  );
}
