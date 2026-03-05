import type { Ingredient } from "@/types/recipe";

/**
 * Normalize a string for matching: lowercase, remove accents, trim extra spaces.
 */
function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function normEq(a: string, b: string): boolean {
  return normalize(a) === normalize(b);
}

function normIncludes(haystack: string, needle: string): boolean {
  return normalize(haystack).includes(normalize(needle));
}

/**
 * Try to find the matching ingredient_id for a display_name string.
 *
 * Strategy (in order):
 *  1. Exact match against any translation (es/fr/en)
 *  2. Exact match against any alias (any language)
 *  3. Fuzzy: any translation or alias *contains* the normalized display_name
 *  4. Fuzzy: the normalized display_name *contains* any translation or alias
 *
 * Returns the ingredient id or null if nothing matches.
 */
export function matchIngredient(
  displayName: string,
  catalog: Ingredient[]
): string | null {
  if (!displayName.trim()) return null;

  const normName = normalize(displayName);

  // ── Pass 1: exact match on translations ──────────────────────────
  for (const ing of catalog) {
    const t = ing.translations as Record<string, string>;
    for (const lang of ["es", "fr", "en"]) {
      if (t[lang] && normEq(t[lang], displayName)) return ing.id;
    }
  }

  // ── Pass 2: exact match on aliases ───────────────────────────────
  for (const ing of catalog) {
    const aliases = ing.aliases as Record<string, string[]>;
    for (const lang of Object.keys(aliases)) {
      const list: string[] = aliases[lang] || [];
      for (const alias of list) {
        if (normEq(alias, displayName)) return ing.id;
      }
    }
  }

  // ── Pass 3: translation/alias contains the display_name ──────────
  for (const ing of catalog) {
    const t = ing.translations as Record<string, string>;
    for (const lang of ["es", "fr", "en"]) {
      if (t[lang] && normIncludes(t[lang], displayName)) return ing.id;
    }
    const aliases = ing.aliases as Record<string, string[]>;
    for (const lang of Object.keys(aliases)) {
      for (const alias of (aliases[lang] || []) as string[]) {
        if (normIncludes(alias, displayName)) return ing.id;
      }
    }
  }

  // ── Pass 4: display_name contains a translation or alias ─────────
  for (const ing of catalog) {
    const t = ing.translations as Record<string, string>;
    for (const lang of ["es", "fr", "en"]) {
      const val = t[lang];
      if (val && val.length >= 4 && normIncludes(displayName, val)) return ing.id;
    }
    const aliases = ing.aliases as Record<string, string[]>;
    for (const lang of Object.keys(aliases)) {
      for (const alias of (aliases[lang] || []) as string[]) {
        if (alias.length >= 4 && normIncludes(displayName, alias)) return ing.id;
      }
    }
  }

  return null;
}

/**
 * Enrich a list of ingredient insert objects with ingredient_id
 * by running matchIngredient on each display_name.
 */
export function enrichWithIngredientIds<T extends { display_name: string }>(
  ingredients: T[],
  catalog: Ingredient[]
): (T & { ingredient_id: string | null })[] {
  return ingredients.map((ing) => ({
    ...ing,
    ingredient_id: matchIngredient(ing.display_name, catalog),
  }));
}
