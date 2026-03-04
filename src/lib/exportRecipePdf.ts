import { CATEGORY_LABELS, DIFFICULTY_LABELS } from "@/types/recipe";
import type { RecipeWithComponents } from "@/types/recipe";

export function exportRecipeToPdf(recipe: RecipeWithComponents) {
  const win = window.open("", "_blank");
  if (!win) return;

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

  const originParts: string[] = [];
  if (recipe.origin_chef) originParts.push(`Chef: ${recipe.origin_chef}`);
  if (recipe.origin_book) originParts.push(`Libro: ${recipe.origin_book}`);
  if (recipe.origin_url) originParts.push(`Fuente: ${recipe.origin_url}`);

  const componentsHtml = components.map((comp) => {
    const ingredients = [...comp.recipe_ingredients].sort((a, b) => a.sort_order - b.sort_order);
    const steps = [...comp.recipe_steps].sort((a, b) => a.step_order - b.step_order);

    const ingredientsHtml = ingredients.length
      ? `<table class="ingredients">
          ${ingredients.map((ing) => `<tr>
            <td class="qty">${ing.quantity != null ? ing.quantity : ""}</td>
            <td class="unit">${ing.unit || ""}</td>
            <td>${esc(ing.name)}</td>
          </tr>`).join("")}
        </table>`
      : "";

    const stepsHtml = steps.length
      ? `<ol class="steps">
          ${steps.map((s) => {
            let li = esc(s.description);
            if (s.temp_c) li += ` <span class="step-meta">(${s.temp_c}°C)</span>`;
            if (s.duration_min) li += ` <span class="step-meta">(${s.duration_min}′)</span>`;
            if (s.technical_notes) li += `<br><em class="tech-note">${esc(s.technical_notes)}</em>`;
            return `<li>${li}</li>`;
          }).join("")}
        </ol>`
      : "";

    const title = comp.name ? `<h2>${esc(comp.name)}</h2>` : "";
    return `<section class="component">${title}${ingredientsHtml}${stepsHtml}</section>`;
  }).join("");

  const notesHtml = notes.length
    ? `<section class="notes"><h2>Notas</h2><ul>${notes.map((n) => `<li>${esc(n.content)}</li>`).join("")}</ul></section>`
    : "";

  const today = new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>${esc(recipe.title)} — Pizca</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Georgia, "Times New Roman", serif; color:#1a1a1a; max-width:700px; margin:0 auto; padding:40px 24px; line-height:1.5; }
  h1 { font-size:28px; margin-bottom:4px; }
  .subtitle { color:#666; font-size:14px; margin-bottom:8px; }
  .badge { display:inline-block; background:#f3f3f3; border-radius:4px; padding:2px 8px; font-size:12px; margin-right:6px; }
  .badge-tested { background:#d4edda; color:#155724; }
  .meta { display:flex; flex-wrap:wrap; gap:6px; margin:12px 0 16px; }
  .origin { background:#f9f9f9; border-left:3px solid #ccc; padding:8px 12px; margin-bottom:16px; font-size:13px; color:#555; }
  .component { page-break-inside:avoid; margin-bottom:20px; }
  h2 { font-size:18px; border-bottom:1px solid #ddd; padding-bottom:4px; margin-bottom:8px; }
  .ingredients { width:100%; border-collapse:collapse; margin-bottom:12px; font-size:14px; }
  .ingredients td { padding:3px 6px; border-bottom:1px solid #eee; }
  .ingredients .qty { text-align:right; width:50px; font-variant-numeric:tabular-nums; }
  .ingredients .unit { width:40px; color:#888; }
  .steps { padding-left:20px; font-size:14px; margin-bottom:8px; }
  .steps li { margin-bottom:6px; }
  .step-meta { color:#888; font-size:12px; }
  .tech-note { color:#888; font-size:12px; }
  .notes { margin-top:20px; }
  .notes ul { padding-left:18px; font-size:14px; }
  .notes li { margin-bottom:4px; }
  .footer { margin-top:32px; text-align:center; font-size:11px; color:#aaa; border-top:1px solid #eee; padding-top:12px; }
  @media print {
    body { padding:20px; }
    .component { page-break-inside:avoid; }
  }
</style>
</head>
<body>
  <h1>${esc(recipe.title)}</h1>
  ${recipe.description ? `<p class="subtitle">${esc(recipe.description)}</p>` : ""}
  <div class="meta">
    <span class="badge">${CATEGORY_LABELS[recipe.category]}</span>
    ${recipe.tested ? '<span class="badge badge-tested">✓ Probada</span>' : ""}
    ${meta.map((m) => `<span class="badge">${esc(m)}</span>`).join("")}
  </div>
  ${originParts.length ? `<div class="origin">${originParts.map((o) => esc(o)).join(" · ")}</div>` : ""}
  ${componentsHtml}
  ${notesHtml}
  <div class="footer">Exportado desde Pizca · ${today}</div>
  <script>window.onload=function(){window.print();}</script>
</body>
</html>`;

  win.document.write(html);
  win.document.close();
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
