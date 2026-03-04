import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileJson, Check, X, AlertTriangle, ChevronLeft, RefreshCw } from "lucide-react";
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
interface JsonRecipe {
  id: string;
  nombre: string;
  categoria: string;
  componentes: JsonComponent[];
  preparacion?: JsonPreparation[];
  descripcion?: string | null;
  porciones?: number | null;
  molde?: string | null;
  tiempo_preparacion?: number | null;
  tiempo_coccion?: number | null;
  tiempo_reposo?: number | null;
  tiempo_activo?: number | null;
  temperatura?: number | null;
  dificultad?: string | null;
  origen_chef?: string | null;
  origen_url?: string | null;
  origen_libro?: string | null;
  planning?: JsonPlanning[];
  notas?: string[];
  variantes?: JsonVariant[];
  escalado?: JsonScaleFactor[];
  probado?: boolean | null;
  valoracion?: number | null;
  notas_prueba?: string | null;
  subcategoria?: string | null;
  dias_planificacion?: number | null;
}

// --- Validation ---
interface ValidationError { file: string; errors: string[]; }
interface ParsedRecipe {
  json: JsonRecipe;
  file: string;
  selected: boolean;
  slug: string;
  totalIngredients: number;
  totalSteps: number;
}

const VALID_CATEGORIES: RecipeCategory[] = [
  "tartes","entremets","biscuits","gâteaux","pâtes-de-base",
  "crèmes-de-base","mousses","glaces-sorbets","viennoiserie","confiserie","autre",
];
const VALID_DIFFICULTIES: RecipeDifficulty[] = ["basico","intermedio","avanzado","experto"];
const VALID_UNITS: IngredientUnit[] = ["g","kg","ml","cl","dl","l","pcs","QS","cc","cs","pincée"];

function validateRecipe(json: any, fileName: string): { errors: string[]; recipe?: ParsedRecipe } {
  const errors: string[] = [];
  if (!json.nombre || typeof json.nombre !== "string") errors.push("Falta 'nombre'");
  if (!json.categoria || !VALID_CATEGORIES.includes(json.categoria)) errors.push(`Categoría inválida: '${json.categoria}'. Válidas: ${VALID_CATEGORIES.join(", ")}`);
  if (!json.id || typeof json.id !== "string") errors.push("Falta 'id'");
  if (!Array.isArray(json.componentes) || json.componentes.length === 0) {
    errors.push("Falta al menos un componente con ingredientes");
  } else {
    json.componentes.forEach((c: any, i: number) => {
      if (!c.nombre) errors.push(`Componente ${i + 1}: falta 'nombre'`);
      if (!Array.isArray(c.ingredientes) || c.ingredientes.length === 0)
        errors.push(`Componente '${c.nombre || i + 1}': sin ingredientes`);
      else c.ingredientes.forEach((ing: any, j: number) => {
        if (!ing.ingrediente) errors.push(`Componente '${c.nombre || i + 1}', ingrediente ${j + 1}: falta 'ingrediente'`);
      });
    });
  }

  if (errors.length > 0) return { errors };

  const totalIngredients = (json.componentes as JsonComponent[]).reduce((s, c) => s + c.ingredientes.length, 0);
  const totalSteps = (json.preparacion || []).reduce((s: number, p: JsonPreparation) => s + (p.pasos?.length || 0), 0);
  const slug = json.id.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  return {
    errors: [],
    recipe: { json, file: fileName, selected: true, slug, totalIngredients, totalSteps },
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
        const json = JSON.parse(text);
        const result = validateRecipe(json, file.name);
        if (result.errors.length > 0) errors.push({ file: file.name, errors: result.errors });
        else if (result.recipe) parsed.push(result.recipe);
      } catch {
        errors.push({ file: file.name, errors: ["No es un archivo JSON válido"] });
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
          prep_time_min: r.json.tiempo_preparacion || null,
          bake_time_min: r.json.tiempo_coccion || null,
          rest_time_min: r.json.tiempo_reposo || null,
          total_active_min: r.json.tiempo_activo || null,
          temperature: r.json.temperatura || null,
          difficulty,
          planning_days: r.json.dias_planificacion || null,
          origin_chef: r.json.origen_chef || null,
          origin_url: r.json.origen_url || null,
          origin_book: r.json.origen_libro || null,
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
            name: ing.ingrediente,
            quantity: ing.cantidad ?? null,
            unit: (VALID_UNITS.includes(ing.unidad as IngredientUnit) ? ing.unidad : null) as IngredientUnit | null,
            sort_order: j,
          }));
          if (ingredients.length) await supabase.from("recipe_ingredients").insert(ingredients);
        }

        // Steps (from preparacion)
        if (r.json.preparacion) {
          for (const prep of r.json.preparacion) {
            const compId = compMap.get(prep.componente);
            if (!compId || !prep.pasos) continue;
            const steps = prep.pasos.map((s, j) => ({
              component_id: compId,
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

        // Scale factors
        if (r.json.escalado?.length) {
          const factors = r.json.escalado.map((s) => ({
            recipe_id: newRecipe.id,
            reference_mold: s.molde_referencia,
            target_mold: s.molde_destino,
            multiplier: s.multiplicador,
          }));
          await supabase.from("recipe_scale_factors").insert(factors);
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
          {recipes.length > 0 && (
            <>
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
                          {r.json.origen_chef && <span>👨‍🍳 {r.json.origen_chef}</span>}
                        </div>
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
          )}

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
