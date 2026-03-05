import { CATEGORY_LABELS, DIFFICULTY_LABELS } from "@/types/recipe";
import type { RecipeWithComponents } from "@/types/recipe";

interface Props {
  recipe: RecipeWithComponents;
}

export function RecipeFullViewTab({ recipe }: Props) {
  const components = [...(recipe.recipe_components || [])].sort((a, b) => a.sort_order - b.sort_order);
  const notes = [...(recipe.recipe_notes || [])].sort((a, b) => a.sort_order - b.sort_order);

  const meta: string[] = [];
  if (recipe.servings) meta.push(`${recipe.servings} porciones`);
  if (recipe.prep_time_min) meta.push(`Prep ${recipe.prep_time_min}′`);
  if (recipe.bake_time_min) meta.push(`Cocción ${recipe.bake_time_min}′`);
  if (recipe.rest_time_min) meta.push(`Reposo ${recipe.rest_time_min}′`);
  if (recipe.difficulty) meta.push(DIFFICULTY_LABELS[recipe.difficulty]);
  if (recipe.temperature) meta.push(`${recipe.temperature}°C`);
  if (recipe.mold) meta.push(`Molde: ${recipe.mold}`);

  return (
    <div className="space-y-6 text-sm leading-relaxed">
      {/* Meta badges */}
      {meta.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
            {CATEGORY_LABELS[recipe.category]}
          </span>
          {recipe.tested && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-success text-success-foreground">
              ✓ Probada
            </span>
          )}
          {meta.map((m, i) => (
            <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
              {m}
            </span>
          ))}
        </div>
      )}

      {/* Origin */}
      {(recipe.origin_chef || recipe.origin_book || recipe.origin_url) && (
        <div className="bg-muted/50 border-l-2 border-muted-foreground/20 px-3 py-2 text-muted-foreground text-xs space-y-0.5">
          {recipe.origin_chef && <p>Chef: {recipe.origin_chef}</p>}
          {recipe.origin_book && <p>Libro: {recipe.origin_book}</p>}
          {recipe.origin_url && (
            <a href={recipe.origin_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Ver fuente original
            </a>
          )}
        </div>
      )}

      {/* Components: ingredients + steps */}
      {components.map((comp) => {
        const ingredients = [...comp.recipe_ingredients].sort((a, b) => a.sort_order - b.sort_order);
        const steps = [...comp.recipe_steps].sort((a, b) => a.step_order - b.step_order);

        return (
          <section key={comp.id} className="space-y-3">
            {comp.name && (
              <h3 className="text-base font-semibold border-b border-border pb-1">{comp.name}</h3>
            )}

            {ingredients.length > 0 && (
              <table className="w-full text-sm">
                <tbody>
                  {ingredients.map((ing) => (
                    <tr key={ing.id} className="border-b border-border/50">
                      <td className="py-1 pr-2 text-right w-14 tabular-nums text-muted-foreground">
                        {ing.quantity != null ? ing.quantity : ""}
                      </td>
                      <td className="py-1 pr-3 w-10 text-muted-foreground">{ing.unit || ""}</td>
                      <td className="py-1">{ing.display_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {steps.length > 0 && (
              <ol className="list-decimal list-outside pl-5 space-y-2 text-sm">
                {steps.map((s) => (
                  <li key={s.id}>
                    {s.description}
                    {s.temp_c && (
                      <span className="text-muted-foreground text-xs ml-1">({s.temp_c}°C)</span>
                    )}
                    {s.duration_min && (
                      <span className="text-muted-foreground text-xs ml-1">({s.duration_min}′)</span>
                    )}
                    {s.technical_notes && (
                      <p className="text-xs text-muted-foreground italic mt-0.5">{s.technical_notes}</p>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </section>
        );
      })}

      {/* Notes */}
      {notes.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-base font-semibold border-b border-border pb-1">Notas</h3>
          <ul className="list-disc list-outside pl-5 space-y-1 text-sm">
            {notes.map((n) => (
              <li key={n.id}>{n.content}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
