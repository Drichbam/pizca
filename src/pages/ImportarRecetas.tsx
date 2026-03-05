import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileJson, Check, X, AlertTriangle, ChevronLeft, RefreshCw, Download, Info, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORY_LABELS } from "@/types/recipe";
import type { RecipeCategory, RecipeDifficulty, IngredientUnit } from "@/types/recipe";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// --- JSON shape types ---
interface JsonIngredient {
  cantidad?: number | null;
  unidad?: string | null;
  ingrediente: string;
}
interface JsonComponent {
  nombre: string;
  ingredientes: JsonIngredient[];
}
interface JsonStep {
  orden?: number;
  descripcion: string;
  temp_c?: number | null;
  duracion_min?: number | null;
  notas_tecnicas?: string | null;
}
interface JsonPreparation {
  componente: string;
  pasos: JsonStep[];
}
interface JsonPlanning {
  dia: string;
  tareas: string[];
}
interface JsonVariant {
  nombre: string;
  descripcion?: string | null;
}
interface JsonScaleFactor {
  molde_referencia: string;
  molde_destino: string;
  multiplicador: number;
}
interface JsonScaleEntry {
  molde: string;
  multiplicador: number;
}
interface JsonEscalado {
  referencia: string;
  factores: JsonScaleEntry[];
}
interface JsonRecipe {
  id: string;
  nombre: string;
  categoria: string;
  componentes: JsonComponent[];
  preparacion?: JsonPreparation[];
  descripcion?: string | null;
  porciones?: number | null;
  molde?: string | null;
  // Flat time fields
  tiempo_preparacion?: number | null;
  tiempo_coccion?: number | null;
  tiempo_reposo?: number | null;
  tiempo_activo?: number | null;
  // Nested time fields (actual format)
  tiempos?: {
    preparacion_min?: number | null;
    coccion_min?: number | null;
    reposo_min?: number | null;
    total_activo_min?: number | null;
  } | null;
  temperatura?: number | null;
  temperatura_horno_c?: number | null;
  dificultad?: string | null;
  // Flat origin fields
  origen_chef?: string | null;
  origen_url?: string | null;
  origen_libro?: string | null;
  // Nested origin (actual format)
  origen?: {
    chef_autor?: string | null;
    fuente_url?: string | null;
    libro?: string | null;
  } | null;
  planning?: JsonPlanning[];
  notas?: string[];
  variantes?: JsonVariant[];
  // Both formats for escalado
  escalado?: JsonEscalado | JsonScaleFactor[] | null;
  probado?: boolean | null;
  valoracion?: number | null;
  notas_prueba?: string | null;
  subcategoria?: string | null;
  dias_planificacion?: number | null;
  planificacion_dias?: number | null;
}

// --- Validation ---
interface CorrectionItem {
  id: string;
  label: string;
  revertable: boolean;
  field?: 'categoria' | 'dificultad';
  originalValue?: string;
  correctedValue?: string;
}

interface ValidationError { file: string; errors: string[]; }
interface ParsedRecipe {
  json: JsonRecipe;
  file: string;
  selected: boolean;
  slug: string;
  totalIngredients: number;
  totalSteps: number;
  corrections: CorrectionItem[];
}

const VALID_CATEGORIES: RecipeCategory[] = [
  "tartes","entremets","biscuits","gâteaux","pâtes-de-base",
  "crèmes-de-base","mousses","glaces-sorbets","viennoiserie","confiserie","autre",
];
const VALID_DIFFICULTIES: RecipeDifficulty[] = ["basico","intermedio","avanzado","experto"];
const VALID_UNITS: IngredientUnit[] = ["g","kg","ml","cl","dl","l","pcs","QS","cc","cs","pincée"];

const CATEGORY_NORMALIZE: Record<string, RecipeCategory> = {
  "gateaux": "gâteaux",
  "gateau": "gâteaux",
  "gâteau": "gâteaux",
  "pates-de-base": "pâtes-de-base",
  "pate-de-base": "pâtes-de-base",
  "pâte-de-base": "pâtes-de-base",
  "cremes-de-base": "crèmes-de-base",
  "creme-de-base": "crèmes-de-base",
  "crème-de-base": "crèmes-de-base",
  "glaces": "glaces-sorbets",
  "sorbets": "glaces-sorbets",
  "entremet": "entremets",
  "tarte": "tartes",
  "biscuit": "biscuits",
  "mousse": "mousses",
};

const UNIT_NORMALIZE: Record<string, IngredientUnit> = {
  "gr": "g",
  "grs": "g",
  "gramos": "g",
  "grammes": "g",
  "kilogramos": "kg",
  "kilo": "kg",
  "kilos": "kg",
  "mililitros": "ml",
  "centilitros": "cl",
  "litro": "l",
  "litros": "l",
  "litres": "l",
  "litre": "l",
  "pieza": "pcs",
  "piezas": "pcs",
  "pièce": "pcs",
  "pièces": "pcs",
  "unidad": "pcs",
  "unidades": "pcs",
  "unité": "pcs",
  "unités": "pcs",
  "u": "pcs",
  "ud": "pcs",
  "cucharadita": "cc",
  "cucharaditas": "cc",
  "cdta": "cc",
  "cucharada": "cs",
  "cucharadas": "cs",
  "cda": "cs",
  "cuillère à café": "cc",
  "cuillère à soupe": "cs",
  "cas": "cs",
  "cac": "cc",
  "c.a.s": "cs",
  "c.a.c": "cc",
  "pizca": "pincée",
  "pincee": "pincée",
  "qs": "QS",
  "q.s.": "QS",
  "c/n": "QS",
  "al gusto": "QS",
};

const DIFFICULTY_NORMALIZE: Record<string, RecipeDifficulty> = {
  "básico": "basico",
  "fácil": "basico",
  "facil": "basico",
  "easy": "basico",
  "medium": "intermedio",
  "medio": "intermedio",
  "difficile": "avanzado",
  "difícil": "avanzado",
  "dificil": "avanzado",
  "hard": "avanzado",
  "expert": "experto",
};

function sanitizeRecipe(json: any): CorrectionItem[] {
  const corrections: CorrectionItem[] = [];
  let corrId = 0;

  // ── Structure normalization: build componentes from alternative formats ──
  if (!Array.isArray(json.componentes) || json.componentes.length === 0) {
    // Case 1: top-level ingredientes array → wrap in a single component
    if (Array.isArray(json.ingredientes) && json.ingredientes.length > 0) {
      json.componentes = [{ nombre: json.nombre || "", ingredientes: json.ingredientes }];
      corrections.push({
        id: `corr-${corrId++}`,
        label: `Estructura: ingredientes de nivel superior envueltos en un componente`,
        revertable: false,
      });
    }
    // Case 2: only preparacion exists → create components from preparation groups
    else if (Array.isArray(json.preparacion) && json.preparacion.length > 0) {
      json.componentes = json.preparacion.map((p: any) => ({
        nombre: p.componente || "",
        ingredientes: [],
      }));
      corrections.push({
        id: `corr-${corrId++}`,
        label: `Estructura: componentes creados a partir de la preparación (sin ingredientes)`,
        revertable: false,
      });
    }
  }

  // Case 3: componentes exist but have inline pasos → extract to preparacion
  if (Array.isArray(json.componentes)) {
    const hasInlinePasos = json.componentes.some((c: any) => Array.isArray(c.pasos) && c.pasos.length > 0);
    if (hasInlinePasos && !Array.isArray(json.preparacion)) {
      json.preparacion = json.componentes
        .filter((c: any) => Array.isArray(c.pasos) && c.pasos.length > 0)
        .map((c: any) => ({ componente: c.nombre, pasos: c.pasos }));
      corrections.push({
        id: `corr-${corrId++}`,
        label: `Estructura: pasos inline extraídos a preparación`,
        revertable: false,
      });
    }
  }

  // Auto-generate id from nombre if missing
  if (!json.id && json.nombre) {
    json.id = json.nombre.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    corrections.push({
      id: `corr-${corrId++}`,
      label: `ID generado automáticamente: "${json.id}"`,
      revertable: false,
    });
  }

  // Normalize category (case-insensitive)
  if (json.categoria) {
    const original = json.categoria;
    const catLower = json.categoria.toLowerCase().trim();
    if (CATEGORY_NORMALIZE[catLower]) {
      json.categoria = CATEGORY_NORMALIZE[catLower];
    } else if (!VALID_CATEGORIES.includes(json.categoria)) {
      const match = VALID_CATEGORIES.find(c => c.toLowerCase() === catLower);
      if (match) json.categoria = match;
    }
    if (json.categoria !== original) {
      corrections.push({
        id: `corr-${corrId++}`,
        label: `Categoría: "${original}" → "${json.categoria}"`,
        revertable: true,
        field: 'categoria',
        originalValue: original,
        correctedValue: json.categoria,
      });
    }
  }

  // Normalize difficulty
  if (json.dificultad) {
    const original = json.dificultad;
    const diffLower = json.dificultad.toLowerCase().trim();
    if (DIFFICULTY_NORMALIZE[diffLower]) {
      json.dificultad = DIFFICULTY_NORMALIZE[diffLower];
    }
    if (json.dificultad !== original) {
      corrections.push({
        id: `corr-${corrId++}`,
        label: `Dificultad: "${original}" → "${json.dificultad}"`,
        revertable: true,
        field: 'dificultad',
        originalValue: original,
        correctedValue: json.dificultad,
      });
    }
  }

  // Build set of component names referenced in preparacion
  const prepComponentNames = new Set<string>();
  if (Array.isArray(json.preparacion)) {
    for (const p of json.preparacion) {
      if (p.componente) prepComponentNames.add(p.componente);
    }
  }

  // Normalize units & filter ingredients without name, then filter empty components
  if (Array.isArray(json.componentes)) {
    let removedIngredients = 0;
    const originalCompCount = json.componentes.length;

    json.componentes = json.componentes
      .map((c: any) => {
        const originalIngs = Array.isArray(c.ingredientes) ? c.ingredientes : [];
        const filtered = originalIngs.filter((ing: any) => !!ing.ingrediente);
        removedIngredients += originalIngs.length - filtered.length;

        const mapped = filtered.map((ing: any) => {
          if (ing.unidad) {
            const originalUnit = ing.unidad;
            const uLower = originalUnit.toLowerCase().trim();
            const normalized = UNIT_NORMALIZE[uLower];
            if (normalized) {
              ing.unidad = normalized;
              if (originalUnit !== normalized) {
                corrections.push({
                  id: `corr-${corrId++}`,
                  label: `Unidad en "${ing.ingrediente}": "${originalUnit}" → "${normalized}"`,
                  revertable: false,
                });
              }
            }
          }
          return ing;
        });

        return { ...c, ingredientes: mapped };
      })
      .filter((c: any) =>
        c.ingredientes.length > 0 ||
        (Array.isArray(c.pasos) && c.pasos.length > 0) ||
        prepComponentNames.has(c.nombre) // keep if referenced by preparacion
      );

    const removedComps = originalCompCount - json.componentes.length;
    if (removedIngredients > 0) corrections.push({
      id: `corr-${corrId++}`,
      label: `${removedIngredients} ingrediente${removedIngredients > 1 ? "s" : ""} sin nombre eliminado${removedIngredients > 1 ? "s" : ""}`,
      revertable: false,
    });
    if (removedComps > 0) corrections.push({
      id: `corr-${corrId++}`,
      label: `${removedComps} componente${removedComps > 1 ? "s" : ""} vacío${removedComps > 1 ? "s" : ""} eliminado${removedComps > 1 ? "s" : ""}`,
      revertable: false,
    });
  }

  return corrections;
}

function validateRecipe(json: any, fileName: string): { errors: string[]; recipe?: ParsedRecipe } {
  const beforeShape = {
    keys: Object.keys(json || {}),
    componentesType: Array.isArray(json?.componentes) ? "array" : typeof json?.componentes,
    componentesLen: Array.isArray(json?.componentes) ? json.componentes.length : 0,
    topIngredientesLen: Array.isArray(json?.ingredientes) ? json.ingredientes.length : 0,
    preparacionLen: Array.isArray(json?.preparacion) ? json.preparacion.length : 0,
  };

  const corrections = sanitizeRecipe(json);

  const afterShape = {
    componentesType: Array.isArray(json?.componentes) ? "array" : typeof json?.componentes,
    componentesLen: Array.isArray(json?.componentes) ? json.componentes.length : 0,
    componentesDetail: Array.isArray(json?.componentes)
      ? json.componentes.map((c: any, i: number) => ({
          i,
          nombre: c?.nombre,
          ingredientes: Array.isArray(c?.ingredientes) ? c.ingredientes.length : null,
          pasosInline: Array.isArray(c?.pasos) ? c.pasos.length : null,
        }))
      : [],
    preparacionLen: Array.isArray(json?.preparacion) ? json.preparacion.length : 0,
  };

  console.groupCollapsed(`[Import Debug] ${fileName}`);
  console.info("Before sanitize", beforeShape);
  console.info("After sanitize", afterShape);
  if (corrections.length) console.info("Corrections", corrections.map(c => c.label));

  const errors: string[] = [];
  if (!json.nombre || typeof json.nombre !== "string") errors.push("Falta 'nombre'");
  if (!json.categoria || !VALID_CATEGORIES.includes(json.categoria)) errors.push(`Categoría inválida: '${json.categoria}'. Válidas: ${VALID_CATEGORIES.join(", ")}`);
  if (!json.id || typeof json.id !== "string") errors.push("Falta 'id'");
  const hasComponents = Array.isArray(json.componentes) && json.componentes.length > 0;
  const hasPrepSteps = Array.isArray(json.preparacion) && json.preparacion.some((p: any) => Array.isArray(p.pasos) && p.pasos.length > 0);

  if (!hasComponents && !hasPrepSteps) {
    errors.push("Falta al menos un componente con ingredientes o pasos");
    errors.push(`DEBUG estructura: componentes=${afterShape.componentesType}(${afterShape.componentesLen}), topIngredientes=${beforeShape.topIngredientesLen}, preparacion=${afterShape.preparacionLen}`);
  }

  // Ensure componentes array exists for prep-only recipes
  if (!hasComponents && hasPrepSteps) {
    json.componentes = json.preparacion.map((p: any) => ({
      nombre: p.componente || "",
      ingredientes: [],
    }));
  }

  if (hasComponents && json.componentes.length > 1) {
    json.componentes.forEach((c: any, i: number) => {
      if (!c.nombre) errors.push(`Componente ${i + 1}: falta 'nombre'`);
    });
  }

  if (errors.length > 0) {
    console.warn("Validation errors", errors);
    console.groupEnd();
    return { errors };
  }

  const totalIngredients = (json.componentes as JsonComponent[]).reduce((s, c) => s + c.ingredientes.length, 0);
  const totalSteps = (json.preparacion || []).reduce((s: number, p: JsonPreparation) => s + (p.pasos?.length || 0), 0);
  const slug = json.id.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  console.info("Validation OK", { slug, totalIngredients, totalSteps });
  console.groupEnd();

  return {
    errors: [],
    recipe: { json, file: fileName, selected: true, slug, totalIngredients, totalSteps, corrections },
  };
}

type DuplicateAction = "skip" | "overwrite";
type ImportPhase = "select" | "preview" | "importing" | "done";

interface ImportResult {
  slug: string;
  title: string;
  success: boolean;
  error?: string;
  action?: "imported" | "overwritten" | "skipped";
}

export default function ImportarRecetas() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<ImportPhase>("select");
  const [recipes, setRecipes] = useState<ParsedRecipe[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [duplicateSlugs, setDuplicateSlugs] = useState<Set<string>>(new Set());
  const [duplicateAction, setDuplicateAction] = useState<DuplicateAction>("skip");
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ImportResult[]>([]);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const parsed: ParsedRecipe[] = [];
    const errors: ValidationError[] = [];

    for (const file of Array.from(files)) {
      try {
        const text = await file.text();
        console.info(`[Import Debug] Reading ${file.name}`, { size: file.size, type: file.type, chars: text.length });

        // Strip JS-style comments that are outside of strings
        // Process line by line: remove only comments that appear after the last closing quote
        const cleanText = text.split('\n').map(line => {
          // Find // that is not inside a string by tracking quote state
          let inString = false;
          let escapeNext = false;
          for (let i = 0; i < line.length; i++) {
            if (escapeNext) { escapeNext = false; continue; }
            if (line[i] === '\\') { escapeNext = true; continue; }
            if (line[i] === '"') { inString = !inString; continue; }
            if (!inString && line[i] === '/' && line[i + 1] === '/') {
              return line.substring(0, i);
            }
          }
          return line;
        }).join('\n').replace(/,\s*([\]}])/g, "$1");

        const json = JSON.parse(cleanText);
        const result = validateRecipe(json, file.name);
        if (result.errors.length > 0) errors.push({ file: file.name, errors: result.errors });
        else if (result.recipe) parsed.push(result.recipe);
      } catch (err) {
        console.error(`[Import Debug] Parse failed for ${file.name}`, err);
        const reason = err instanceof Error ? err.message : "No es un archivo JSON válido";
        errors.push({ file: file.name, errors: ["No es un archivo JSON válido", `DEBUG parse: ${reason}`] });
      }
    }

    setValidationErrors(errors);
    setRecipes(parsed);

    // Check duplicates
    if (parsed.length > 0) {
      const slugs = parsed.map((r) => r.slug);
      const { data: existing } = await supabase
        .from("recipes")
        .select("slug")
        .in("slug", slugs);
      setDuplicateSlugs(new Set((existing || []).map((r) => r.slug)));
    }

    setPhase("preview");
  }, []);

  const toggleRecipe = (index: number) => {
    setRecipes((prev) => prev.map((r, i) => (i === index ? { ...r, selected: !r.selected } : r)));
  };

  const revertCorrection = (recipeIndex: number, correctionId: string) => {
    setRecipes((prev) => prev.map((r, i) => {
      if (i !== recipeIndex) return r;
      const correction = r.corrections.find(c => c.id === correctionId);
      if (!correction || !correction.revertable || !correction.field || !correction.originalValue) return r;
      
      const updatedJson = { ...r.json, [correction.field]: correction.originalValue };
      const updatedCorrections = r.corrections.filter(c => c.id !== correctionId);
      return { ...r, json: updatedJson as JsonRecipe, corrections: updatedCorrections };
    }));
  };

  const toggleAll = (selected: boolean) => {
    setRecipes((prev) => prev.map((r) => ({ ...r, selected })));
  };

  const startImport = async () => {
    const selected = recipes.filter((r) => r.selected);
    if (selected.length === 0) return;

    setPhase("importing");
    setProgress(0);
    const importResults: ImportResult[] = [];

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Error", description: "Debes iniciar sesión", variant: "destructive" });
      return;
    }

    for (let i = 0; i < selected.length; i++) {
      const r = selected[i];
      const isDuplicate = duplicateSlugs.has(r.slug);

      try {
        if (isDuplicate && duplicateAction === "skip") {
          importResults.push({ slug: r.slug, title: r.json.nombre, success: true, action: "skipped" });
          setProgress(((i + 1) / selected.length) * 100);
          continue;
        }

        if (isDuplicate && duplicateAction === "overwrite") {
          // Delete existing
          const { data: existing } = await supabase.from("recipes").select("id").eq("slug", r.slug).single();
          if (existing) await supabase.from("recipes").delete().eq("id", existing.id);
        }

        // Map difficulty
        const difficulty = VALID_DIFFICULTIES.includes(r.json.dificultad as RecipeDifficulty)
          ? (r.json.dificultad as RecipeDifficulty) : "basico";

        // Insert recipe
        const { data: newRecipe, error: recipeErr } = await supabase.from("recipes").insert({
          user_id: user.id,
          slug: r.slug,
          title: r.json.nombre,
          description: r.json.descripcion || null,
          category: r.json.categoria as RecipeCategory,
          subcategory: r.json.subcategoria || null,
          servings: r.json.porciones || null,
          mold: r.json.molde || null,
          prep_time_min: r.json.tiempo_preparacion ?? r.json.tiempos?.preparacion_min ?? null,
          bake_time_min: r.json.tiempo_coccion ?? r.json.tiempos?.coccion_min ?? null,
          rest_time_min: r.json.tiempo_reposo ?? r.json.tiempos?.reposo_min ?? null,
          total_active_min: r.json.tiempo_activo ?? r.json.tiempos?.total_activo_min ?? null,
          temperature: r.json.temperatura ?? r.json.temperatura_horno_c ?? null,
          difficulty,
          planning_days: r.json.dias_planificacion ?? r.json.planificacion_dias ?? null,
          origin_chef: r.json.origen_chef ?? r.json.origen?.chef_autor ?? null,
          origin_url: r.json.origen_url ?? r.json.origen?.fuente_url ?? null,
          origin_book: r.json.origen_libro ?? r.json.origen?.libro ?? null,
          tested: r.json.probado || false,
          rating: r.json.valoracion || null,
          test_notes: r.json.notas_prueba || null,
        }).select().single();

        if (recipeErr || !newRecipe) throw recipeErr || new Error("Insert failed");

        // Components + Ingredients
        const compMap = new Map<string, string>(); // compName -> compId
        for (let ci = 0; ci < r.json.componentes.length; ci++) {
          const comp = r.json.componentes[ci];
          const { data: newComp } = await supabase.from("recipe_components").insert({
            recipe_id: newRecipe.id, name: comp.nombre, sort_order: ci,
          }).select().single();
          if (!newComp) continue;
          compMap.set(comp.nombre, newComp.id);

          const ingredients = comp.ingredientes.map((ing, j) => ({
            component_id: newComp.id,
            display_name: ing.ingrediente,
            quantity: ing.cantidad ?? null,
            unit: (VALID_UNITS.includes(ing.unidad as IngredientUnit) ? ing.unidad : null) as IngredientUnit | null,
            sort_order: j,
          }));
          if (ingredients.length) await supabase.from("recipe_ingredients").insert(ingredients);
        }

        // Steps (from preparacion)
        if (r.json.preparacion) {
          for (const prep of r.json.preparacion) {
            if (!prep.pasos || prep.pasos.length === 0) continue;
            let compId = compMap.get(prep.componente);

            // Create fallback component if not found
            if (!compId) {
              const fallbackName = prep.componente || "";
              const { data: fallbackComp } = await supabase.from("recipe_components").insert({
                recipe_id: newRecipe.id, name: fallbackName, sort_order: compMap.size,
              }).select().single();
              if (fallbackComp) {
                compId = fallbackComp.id;
                compMap.set(fallbackName, compId);
              }
            }

            if (!compId) continue;
            const steps = prep.pasos.map((s, j) => ({
              component_id: compId!,
              step_order: s.orden ?? j,
              description: s.descripcion,
              temp_c: s.temp_c ?? null,
              duration_min: s.duracion_min ?? null,
              technical_notes: s.notas_tecnicas ?? null,
            }));
            if (steps.length) await supabase.from("recipe_steps").insert(steps);
          }
        }

        // Planning
        if (r.json.planning?.length) {
          const planning = r.json.planning.map((p, j) => ({
            recipe_id: newRecipe.id, day_label: p.dia, tasks: p.tareas, sort_order: j,
          }));
          await supabase.from("recipe_planning").insert(planning);
        }

        // Notes
        if (r.json.notas?.length) {
          const notes = r.json.notas.map((n, j) => ({
            recipe_id: newRecipe.id, content: n, sort_order: j,
          }));
          await supabase.from("recipe_notes").insert(notes);
        }

        // Variants
        if (r.json.variantes?.length) {
          const variants = r.json.variantes.map((v) => ({
            recipe_id: newRecipe.id, name: v.nombre, description: v.descripcion || null,
          }));
          await supabase.from("recipe_variants").insert(variants);
        }

        // Scale factors - handle both array format and nested object format
        const escalado = r.json.escalado;
        if (escalado) {
          let factors: { recipe_id: string; reference_mold: string; target_mold: string; multiplier: number }[] = [];
          if (Array.isArray(escalado)) {
            factors = escalado.map((s) => ({
              recipe_id: newRecipe.id,
              reference_mold: s.molde_referencia,
              target_mold: s.molde_destino,
              multiplier: s.multiplicador,
            }));
          } else if (escalado.referencia && Array.isArray(escalado.factores)) {
            factors = escalado.factores.map((f) => ({
              recipe_id: newRecipe.id,
              reference_mold: escalado.referencia,
              target_mold: f.molde,
              multiplier: f.multiplicador,
            }));
          }
          if (factors.length) await supabase.from("recipe_scale_factors").insert(factors);
        }

        importResults.push({
          slug: r.slug, title: r.json.nombre, success: true,
          action: isDuplicate ? "overwritten" : "imported",
        });
      } catch (err: any) {
        importResults.push({
          slug: r.slug, title: r.json.nombre, success: false,
          error: err?.message || "Error desconocido",
        });
      }

      setProgress(((i + 1) / selected.length) * 100);
    }

    setResults(importResults);
    setPhase("done");
  };

  const selectedCount = recipes.filter((r) => r.selected).length;
  const duplicatesInSelected = recipes.filter((r) => r.selected && duplicateSlugs.has(r.slug)).length;
  const successCount = results.filter((r) => r.success && r.action !== "skipped").length;
  const skippedCount = results.filter((r) => r.action === "skipped").length;
  const errorCount = results.filter((r) => !r.success).length;

  return (
    <div className="animate-fade-in space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/mis-recetas")} className="shrink-0">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Importar Recetas</h1>
          <p className="text-sm text-muted-foreground">Desde archivos JSON</p>
        </div>
      </div>

      {/* PHASE: SELECT FILES */}
      {phase === "select" && (
        <div className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-colors"
          >
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="font-medium text-foreground mb-1">Selecciona archivos .json</p>
            <p className="text-sm text-muted-foreground">Uno o varios archivos, cada uno con una receta</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              const example = {
                id: "mi-receta-ejemplo",
                nombre: "Mi Receta de Ejemplo",
                categoria: "tartes",
                subcategoria: "tarte-fruits",
                tags: ["ejemplo", "sencilla"],
                origen: { chef_autor: "Chef Ejemplo", fuente_url: null, libro: null },
                porciones: 8,
                molde: "Círculo 22 cm",
                planificacion_dias: 1,
                planning: [{ dia: "Día J", tareas: ["Preparar masa", "Hornear", "Montar"] }],
                tiempos: { preparacion_min: 30, coccion_min: 25, reposo_min: 60, total_activo_min: 55 },
                dificultad: "intermedio",
                temperatura_horno_c: 180,
                componentes: [
                  {
                    nombre: "Masa sablée",
                    ingredientes: [
                      { cantidad: 150, unidad: "g", ingrediente: "mantequilla" },
                      { cantidad: 250, unidad: "g", ingrediente: "harina" },
                      { cantidad: 80, unidad: "g", ingrediente: "azúcar glas" },
                      { cantidad: 1, unidad: "pcs", ingrediente: "huevo" }
                    ]
                  },
                  {
                    nombre: "Crema pastelera",
                    ingredientes: [
                      { cantidad: 500, unidad: "ml", ingrediente: "leche entera" },
                      { cantidad: 100, unidad: "g", ingrediente: "azúcar" },
                      { cantidad: 4, unidad: "pcs", ingrediente: "yemas de huevo" },
                      { cantidad: 40, unidad: "g", ingrediente: "maicena" }
                    ]
                  }
                ],
                preparacion: [
                  {
                    componente: "Masa sablée",
                    pasos: [
                      { orden: 1, descripcion: "Mezclar mantequilla pomada con azúcar glas.", temp_c: null, duracion_min: 5, notas_tecnicas: "No trabajar en exceso." },
                      { orden: 2, descripcion: "Añadir huevo y harina. Formar disco y refrigerar.", temp_c: 4, duracion_min: 60, notas_tecnicas: null }
                    ]
                  },
                  {
                    componente: "Crema pastelera",
                    pasos: [
                      { orden: 1, descripcion: "Hervir leche. Mezclar yemas, azúcar y maicena. Verter leche caliente y cocinar hasta espesar.", temp_c: 85, duracion_min: 10, notas_tecnicas: "Remover constantemente para evitar grumos." }
                    ]
                  }
                ],
                notas: ["Mejor al día siguiente.", "Se puede congelar la masa hasta 1 mes."],
                variantes: [{ nombre: "Versión chocolate", descripcion: "Sustituir 30g de harina por cacao en polvo." }],
                escalado: { referencia: "círculo 22 cm", factores: [{ molde: "círculo 28 cm", multiplicador: 1.6 }] },
                probado: true,
                notas_prueba: "Resultado excelente.",
                valoracion: 4
              };
              const blob = new Blob([JSON.stringify(example, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "receta_ejemplo.json";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Descargar formato de ejemplo
          </Button>
        </div>
      )}

      {/* PHASE: PREVIEW */}
      {phase === "preview" && (
        <div className="space-y-4">
          {/* Validation errors */}
          {validationErrors.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-destructive font-medium text-sm">
                <AlertTriangle className="h-4 w-4" />
                {validationErrors.length} archivo{validationErrors.length !== 1 ? "s" : ""} con errores
              </div>
              {validationErrors.map((ve, i) => (
                <div key={i} className="text-sm">
                  <span className="font-medium text-foreground">{ve.file}:</span>
                  <ul className="ml-4 text-muted-foreground list-disc">
                    {ve.errors.map((e, j) => <li key={j}>{e}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Valid recipes */}
          {recipes.length > 0 && (() => {
            const totalCorrections = recipes.reduce((s, r) => s + r.corrections.length, 0);
            const recipesWithCorrections = recipes.filter(r => r.corrections.length > 0).length;
            return (
            <>
              {totalCorrections > 0 && (
                <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sky-800 font-medium text-sm">
                    <Info className="h-4 w-4" />
                    {totalCorrections} corrección{totalCorrections !== 1 ? "es" : ""} automática{totalCorrections !== 1 ? "s" : ""} en {recipesWithCorrections} archivo{recipesWithCorrections !== 1 ? "s" : ""}
                  </div>
                  <div className="space-y-1">
                    {recipes.flatMap((r) =>
                      r.corrections.map((c) => (
                        <div key={`${r.file}-${c.id}`} className="flex items-center gap-2 text-xs text-sky-800">
                          <span className="text-sky-400">→</span>
                          <span className="text-muted-foreground truncate max-w-[140px]" title={r.file}>{r.file}</span>
                          <span>{c.label}</span>
                          {c.revertable && (
                            <button
                              type="button"
                              onClick={() => revertCorrection(recipes.indexOf(r), c.id)}
                              className="ml-auto text-sky-500 hover:text-sky-800 transition-colors shrink-0"
                              title="Deshacer"
                            >
                              <Undo2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                  {recipes.length} receta{recipes.length !== 1 ? "s" : ""} válida{recipes.length !== 1 ? "s" : ""}
                </p>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => toggleAll(true)}>Todas</Button>
                  <Button variant="ghost" size="sm" onClick={() => toggleAll(false)}>Ninguna</Button>
                </div>
              </div>

              <div className="space-y-2">
                {recipes.map((r, i) => {
                  const isDup = duplicateSlugs.has(r.slug);
                  return (
                    <div
                      key={i}
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-xl border transition-colors",
                        r.selected ? "bg-card border-border" : "bg-muted/50 border-transparent opacity-60"
                      )}
                    >
                      <Checkbox
                        checked={r.selected}
                        onCheckedChange={() => toggleRecipe(i)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-foreground truncate">{r.json.nombre}</span>
                          {isDup && <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 bg-amber-50">Duplicada</Badge>}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                          <span>{CATEGORY_LABELS[r.json.categoria as RecipeCategory] || r.json.categoria}</span>
                          <span>{r.json.componentes.length} comp.</span>
                          <span>{r.totalIngredients} ing.</span>
                          <span>{r.totalSteps} pasos</span>
                          {(r.json.origen_chef || r.json.origen?.chef_autor) && <span>👨‍🍳 {r.json.origen_chef || r.json.origen?.chef_autor}</span>}
                        </div>
                        {r.corrections.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {r.corrections.map((c) => (
                              <span key={c.id} className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-700">
                                🔧 {c.label}
                                {c.revertable && (
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); revertCorrection(i, c.id); }}
                                    className="ml-0.5 hover:text-sky-900 transition-colors"
                                    title="Deshacer esta corrección"
                                  >
                                    <Undo2 className="h-3 w-3" />
                                  </button>
                                )}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <FileJson className="h-5 w-5 text-muted-foreground shrink-0" />
                    </div>
                  );
                })}
              </div>

              {/* Duplicate handling */}
              {duplicatesInSelected > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                  <p className="text-sm font-medium text-amber-800">
                    {duplicatesInSelected} receta{duplicatesInSelected !== 1 ? "s" : ""} ya existe{duplicatesInSelected !== 1 ? "n" : ""}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant={duplicateAction === "skip" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDuplicateAction("skip")}
                    >
                      Saltar duplicadas
                    </Button>
                    <Button
                      variant={duplicateAction === "overwrite" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDuplicateAction("overwrite")}
                    >
                      Sobrescribir
                    </Button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => { setPhase("select"); setRecipes([]); setValidationErrors([]); }}>
                  Volver
                </Button>
                <Button onClick={startImport} disabled={selectedCount === 0} className="flex-1">
                  Importar {selectedCount} receta{selectedCount !== 1 ? "s" : ""}
                </Button>
              </div>
            </>
            );
          })()}

          {recipes.length === 0 && validationErrors.length > 0 && (
            <Button variant="outline" onClick={() => { setPhase("select"); setValidationErrors([]); }}>
              Volver a seleccionar
            </Button>
          )}
        </div>
      )}

      {/* PHASE: IMPORTING */}
      {phase === "importing" && (
        <div className="bg-card rounded-xl p-8 shadow-card text-center space-y-4">
          <RefreshCw className="h-8 w-8 mx-auto text-primary animate-spin" />
          <p className="font-medium text-foreground">Importando recetas...</p>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground">{Math.round(progress)}%</p>
        </div>
      )}

      {/* PHASE: DONE */}
      {phase === "done" && (
        <div className="space-y-4">
          <div className="bg-card rounded-xl p-6 shadow-card space-y-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center",
                errorCount > 0 ? "bg-amber-100" : "bg-accent"
              )}>
                {errorCount > 0 ? <AlertTriangle className="h-5 w-5 text-amber-600" /> : <Check className="h-5 w-5 text-accent-foreground" />}
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-lg">Importación completada</h3>
                <p className="text-sm text-muted-foreground">
                  {successCount} importada{successCount !== 1 ? "s" : ""}
                  {skippedCount > 0 && `, ${skippedCount} saltada${skippedCount !== 1 ? "s" : ""}`}
                  {errorCount > 0 && `, ${errorCount} error${errorCount !== 1 ? "es" : ""}`}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              {results.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-sm py-1">
                  {r.success ? (
                    r.action === "skipped" ?
                      <span className="text-amber-500">—</span> :
                      <Check className="h-4 w-4 text-green-600 shrink-0" />
                  ) : (
                    <X className="h-4 w-4 text-destructive shrink-0" />
                  )}
                  <span className="text-foreground truncate">{r.title}</span>
                  {r.action === "overwritten" && <Badge variant="outline" className="text-xs">Sobrescrita</Badge>}
                  {r.action === "skipped" && <Badge variant="outline" className="text-xs">Saltada</Badge>}
                  {r.error && <span className="text-xs text-destructive">{r.error}</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => { setPhase("select"); setRecipes([]); setResults([]); setValidationErrors([]); }}>
              Importar más
            </Button>
            <Button onClick={() => navigate("/mis-recetas")} className="flex-1">
              Ver mis recetas
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
