

## Plan: Export recipe to PDF

### Approach
Use the browser's native `window.print()` with a print-specific stylesheet. This avoids adding heavy PDF libraries, keeps the bundle small, and produces high-quality output. We'll create a hidden "print view" component that renders the full recipe in a clean, print-friendly layout, then trigger `window.print()`.

### Changes

**1. New file: `src/lib/exportRecipePdf.ts`**
- Function `exportRecipeToPdf(recipe: RecipeWithComponents)` that:
  - Creates a new window/iframe with a self-contained HTML document
  - Renders recipe title, category, origin, chips (servings, times, difficulty, temperature, mold)
  - Ingredients grouped by component in a clean table
  - Steps grouped by component, numbered
  - Notes section
  - Styled with inline CSS for print (no color backgrounds, clean typography, proper page breaks)
  - Calls `window.print()` on the new window, then closes it

**2. Edit: `src/pages/RecipeDetail.tsx`**
- Import `exportRecipeToPdf` and `FileText` icon
- Add a new button next to the existing JSON export button with a `FileText` icon
- On click, call `exportRecipeToPdf(recipe)` and show toast

### PDF layout
- Header: title + category badge + "Probada" if tested
- Meta row: servings, prep/bake/rest times, difficulty, temperature, mold
- Origin block (if any): chef, book, URL
- Per component: ingredient table (qty | unit | name) + numbered steps
- Notes at the bottom
- Footer: "Exportado desde Pizca" + date
- CSS: `@media print` with `page-break-inside: avoid` on component blocks

### No new dependencies needed.

