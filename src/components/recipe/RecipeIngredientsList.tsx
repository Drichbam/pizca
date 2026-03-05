import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecipeComponent, RecipeIngredient } from "@/types/recipe";

interface Props {
  components: (RecipeComponent & { recipe_ingredients: RecipeIngredient[] })[];
}

export function RecipeIngredientsList({ components }: Props) {
  const sorted = [...components].sort((a, b) => a.sort_order - b.sort_order);

  if (!sorted.length) {
    return <p className="text-sm text-muted-foreground">Sin ingredientes.</p>;
  }

  // Single unnamed component — flat list
  if (sorted.length === 1 && !sorted[0].name) {
    const ingredients = [...sorted[0].recipe_ingredients].sort((a, b) => a.sort_order - b.sort_order);
    return (
      <ul className="space-y-2">
        {ingredients.map((ing) => (
          <IngredientRow key={ing.id} ingredient={ing} />
        ))}
      </ul>
    );
  }

  return (
    <div className="space-y-3">
      {sorted.map((comp) => (
        <ComponentSection key={comp.id} component={comp} />
      ))}
    </div>
  );
}

function ComponentSection({ component }: { component: RecipeComponent & { recipe_ingredients: RecipeIngredient[] } }) {
  const [open, setOpen] = useState(true);
  const ingredients = [...component.recipe_ingredients].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="bg-card rounded-xl shadow-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 p-4 text-left hover:bg-muted/50 transition-colors"
      >
        {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        <span className="font-semibold text-foreground text-sm">{component.name || "Ingredientes"}</span>
        <span className="text-xs text-muted-foreground ml-auto">{ingredients.length}</span>
      </button>
      {open && (
        <ul className="px-4 pb-4 space-y-1.5">
          {ingredients.map((ing) => (
            <IngredientRow key={ing.id} ingredient={ing} />
          ))}
        </ul>
      )}
    </div>
  );
}

function IngredientRow({ ingredient }: { ingredient: RecipeIngredient }) {
  return (
    <li className="flex items-baseline gap-2 text-sm">
      <span className="font-medium text-foreground min-w-[4rem] text-right tabular-nums">
        {ingredient.quantity != null ? ingredient.quantity : ""}
        {ingredient.unit ? ` ${ingredient.unit}` : ""}
      </span>
      <span className="text-foreground">{ingredient.display_name}</span>
    </li>
  );
}
