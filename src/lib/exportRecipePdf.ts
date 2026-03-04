import { pdf } from "@react-pdf/renderer";
import { createElement } from "react";
import { RecipePdfDocument } from "./RecipePdfDocument";
import type { RecipeWithComponents } from "@/types/recipe";

export async function exportRecipeToPdf(recipe: RecipeWithComponents): Promise<void> {
  const blob = await pdf(createElement(RecipePdfDocument, { recipe }) as any).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${recipe.title.replace(/[^a-z0-9áéíóúñü]/gi, "_")}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}
