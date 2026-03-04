import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Constants } from "@/integrations/supabase/types";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import {
  FileText, Clock, MapPin, Layers, CalendarDays, StickyNote, Scale, FlaskConical,
  ChevronDown, Plus, Trash2, Star, ImagePlus, Camera,
} from "lucide-react";

import { ComponentEditor, ComponentForm, emptyComponent } from "./ComponentEditor";
import { TagSelector } from "./TagSelector";
import { useRecipeTags, useSetRecipeTags } from "@/hooks/useTags";
import type { RecipeWithComponents } from "@/types/recipe";

const categories = Constants.public.Enums.recipe_category;
const difficulties = Constants.public.Enums.recipe_difficulty;

// ─── Form data types ────────────────────────────────────────────────
interface PlanningDay { day_label: string; tasks: string[]; sort_order: number; }
interface NoteForm { content: string; sort_order: number; }
interface VariantForm { name: string; description: string; }
interface ScaleForm { reference_mold: string; target_mold: string; multiplier: string; }

interface FormData {
  title: string; description: string; photo_url: string | null;
  category: string; subcategory: string; difficulty: string;
  servings: string; mold: string; temperature: string;
  prep_time_min: string; bake_time_min: string; rest_time_min: string; total_active_min: string;
  origin_chef: string; origin_url: string; origin_book: string;
  components: ComponentForm[];
  planning_enabled: boolean; planning: PlanningDay[];
  notes: NoteForm[]; variants: VariantForm[];
  scale_factors: ScaleForm[];
  tested: boolean; test_notes: string; rating: number | null;
  tag_ids: string[];
}

function defaultForm(): FormData {
  return {
    title: "", description: "", photo_url: null,
    category: "autre", subcategory: "", difficulty: "basico",
    servings: "", mold: "", temperature: "",
    prep_time_min: "", bake_time_min: "", rest_time_min: "", total_active_min: "",
    origin_chef: "", origin_url: "", origin_book: "",
    components: [emptyComponent()],
    planning_enabled: false, planning: [],
    notes: [], variants: [],
    scale_factors: [],
    tested: false, test_notes: "", rating: null,
    tag_ids: [],
  };
}

function recipeToForm(r: RecipeWithComponents): FormData {
  return {
    title: r.title, description: r.description || "", photo_url: r.photo_url,
    category: r.category, subcategory: r.subcategory || "", difficulty: r.difficulty || "basico",
    servings: r.servings ? String(r.servings) : "", mold: r.mold || "",
    temperature: r.temperature ? String(r.temperature) : "",
    prep_time_min: r.prep_time_min ? String(r.prep_time_min) : "",
    bake_time_min: r.bake_time_min ? String(r.bake_time_min) : "",
    rest_time_min: r.rest_time_min ? String(r.rest_time_min) : "",
    total_active_min: r.total_active_min ? String(r.total_active_min) : "",
    origin_chef: r.origin_chef || "", origin_url: r.origin_url || "", origin_book: r.origin_book || "",
    components: (r.recipe_components || [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(c => ({
        name: c.name, sort_order: c.sort_order,
        ingredients: (c.recipe_ingredients || []).sort((a, b) => a.sort_order - b.sort_order).map(i => ({
          name: i.name, quantity: i.quantity ? String(i.quantity) : "", unit: i.unit || "", sort_order: i.sort_order,
        })),
        steps: (c.recipe_steps || []).sort((a, b) => a.step_order - b.step_order).map(s => ({
          description: s.description, temp_c: s.temp_c ? String(s.temp_c) : "",
          duration_min: s.duration_min ? String(s.duration_min) : "",
          technical_notes: s.technical_notes || "", step_order: s.step_order,
        })),
      })),
    planning_enabled: (r.recipe_planning || []).length > 0,
    planning: (r.recipe_planning || []).sort((a, b) => a.sort_order - b.sort_order).map(p => ({
      day_label: p.day_label, tasks: p.tasks || [], sort_order: p.sort_order,
    })),
    notes: (r.recipe_notes || []).sort((a, b) => a.sort_order - b.sort_order).map(n => ({ content: n.content, sort_order: n.sort_order })),
    variants: (r.recipe_variants || []).map(v => ({ name: v.name, description: v.description || "" })),
    scale_factors: (r.recipe_scale_factors || []).map(s => ({ reference_mold: s.reference_mold, target_mold: s.target_mold, multiplier: String(s.multiplier) })),
    tested: r.tested || false, test_notes: r.test_notes || "", rating: r.rating || null,
    tag_ids: [], // loaded separately
  };
}

// ─── Section header ────────────────────────────────────────────────
function SH({ icon: Icon, label, open }: { icon: any; label: string; open: boolean }) {
  return (
    <CollapsibleTrigger asChild>
      <button type="button" className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg text-left font-semibold text-sm hover:bg-muted transition-colors">
        <span className="flex items-center gap-2"><Icon size={16} className="text-primary" /> {label}</span>
        <ChevronDown className={cn("transition-transform duration-200 text-muted-foreground", open && "rotate-180")} size={16} />
      </button>
    </CollapsibleTrigger>
  );
}

// ─── Star rating ───────────────────────────────────────────────────
function StarRating({ value, onChange }: { value: number | null; onChange: (v: number | null) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button" onClick={() => onChange(value === s ? null : s)} className="p-0.5">
          <Star size={20} className={cn(s <= (value || 0) ? "fill-primary text-primary" : "text-muted-foreground/40")} />
        </button>
      ))}
    </div>
  );
}

// ─── Main form ─────────────────────────────────────────────────────
interface Props {
  recipeId?: string;
  initialRecipe?: RecipeWithComponents;
}

export function RecipeForm({ recipeId, initialRecipe }: Props) {
  const [data, setData] = useState<FormData>(initialRecipe ? recipeToForm(initialRecipe) : defaultForm());
  const [open, setOpen] = useState(new Set(["basic", "components"]));
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialRecipe?.photo_url || null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setRecipeTags = useSetRecipeTags();

  // Load existing tags for this recipe
  const { data: existingTags } = useRecipeTags(recipeId);
  const [tagsLoaded, setTagsLoaded] = useState(false);
  if (existingTags && !tagsLoaded) {
    setData(prev => ({ ...prev, tag_ids: existingTags.map(rt => rt.tag_id) }));
    setTagsLoaded(true);
  }

  const toggle = (k: string) => setOpen(prev => { const n = new Set(prev); n.has(k) ? n.delete(k) : n.add(k); return n; });
  const set = <K extends keyof FormData>(k: K, v: FormData[K]) => setData(p => ({ ...p, [k]: v }));

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setPhotoFile(file); setPhotoPreview(URL.createObjectURL(file)); }
  };

  const updateComponent = (i: number, comp: ComponentForm) => {
    const c = [...data.components]; c[i] = comp; set("components", c);
  };
  const swapComponents = (i: number, dir: -1 | 1) => {
    const j = i + dir; if (j < 0 || j >= data.components.length) return;
    const c = [...data.components]; [c[i], c[j]] = [c[j], c[i]]; set("components", c);
  };

  const num = (v: string) => v ? Number(v) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!data.title.trim()) { toast.error("El título es obligatorio"); return; }
    if (!data.components.some(c => c.ingredients.some(i => i.name.trim()))) {
      toast.error("Añade al menos un ingrediente"); return;
    }
    setLoading(true);
    try {
      let photo_url = data.photo_url;
      if (photoFile) {
        const path = `${user.id}/${Date.now()}-${photoFile.name}`;
        const { error: upErr } = await supabase.storage.from("recipe-photos").upload(path, photoFile);
        if (upErr) throw upErr;
        photo_url = supabase.storage.from("recipe-photos").getPublicUrl(path).data.publicUrl;
      }

      const payload: any = {
        title: data.title.trim(), description: data.description || null, photo_url,
        category: data.category, subcategory: data.subcategory || null,
        difficulty: data.difficulty, servings: num(data.servings), mold: data.mold || null,
        temperature: num(data.temperature),
        prep_time_min: num(data.prep_time_min), bake_time_min: num(data.bake_time_min),
        rest_time_min: num(data.rest_time_min), total_active_min: num(data.total_active_min),
        origin_chef: data.origin_chef || null, origin_url: data.origin_url || null, origin_book: data.origin_book || null,
        planning_days: data.planning_enabled ? data.planning.length : null,
        tested: data.tested, test_notes: data.test_notes || null, rating: data.rating,
      };

      let finalId: string;
      if (recipeId) {
        const { error } = await supabase.from("recipes").update(payload).eq("id", recipeId);
        if (error) throw error;
        finalId = recipeId;
        await Promise.all([
          supabase.from("recipe_components").delete().eq("recipe_id", recipeId),
          supabase.from("recipe_planning").delete().eq("recipe_id", recipeId),
          supabase.from("recipe_notes").delete().eq("recipe_id", recipeId),
          supabase.from("recipe_variants").delete().eq("recipe_id", recipeId),
          supabase.from("recipe_scale_factors").delete().eq("recipe_id", recipeId),
        ]);
      } else {
        payload.user_id = user.id;
        payload.slug = `${data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
        const { data: newR, error } = await supabase.from("recipes").insert(payload).select().single();
        if (error) throw error;
        finalId = newR.id;
      }

      // Components → ingredients + steps
      for (const comp of data.components) {
        const { data: nc, error: ce } = await supabase.from("recipe_components")
          .insert({ recipe_id: finalId, name: comp.name, sort_order: comp.sort_order }).select().single();
        if (ce || !nc) throw ce;

        const ings = comp.ingredients.filter(i => i.name.trim());
        if (ings.length) await supabase.from("recipe_ingredients").insert(
          ings.map((ig, i) => ({ component_id: nc.id, name: ig.name.trim(), quantity: num(ig.quantity), unit: (ig.unit || null) as any, sort_order: i }))
        );
        const stps = comp.steps.filter(s => s.description.trim());
        if (stps.length) await supabase.from("recipe_steps").insert(
          stps.map((s, i) => ({ component_id: nc.id, description: s.description.trim(), temp_c: num(s.temp_c), duration_min: num(s.duration_min), technical_notes: s.technical_notes || null, step_order: i }))
        );
      }

      // Planning
      const pDays = data.planning_enabled ? data.planning.filter(p => p.day_label.trim()) : [];
      if (pDays.length) await supabase.from("recipe_planning").insert(
        pDays.map((p, i) => ({ recipe_id: finalId, day_label: p.day_label, tasks: p.tasks.filter(t => t.trim()), sort_order: i }))
      );

      // Notes
      const vNotes = data.notes.filter(n => n.content.trim());
      if (vNotes.length) await supabase.from("recipe_notes").insert(
        vNotes.map((n, i) => ({ recipe_id: finalId, content: n.content.trim(), sort_order: i }))
      );

      // Variants
      const vVars = data.variants.filter(v => v.name.trim());
      if (vVars.length) await supabase.from("recipe_variants").insert(
        vVars.map(v => ({ recipe_id: finalId, name: v.name.trim(), description: v.description || null }))
      );

      // Scale factors
      const vScales = data.scale_factors.filter(s => s.reference_mold.trim() && s.target_mold.trim());
      if (vScales.length) await supabase.from("recipe_scale_factors").insert(
        vScales.map(s => ({ recipe_id: finalId, reference_mold: s.reference_mold, target_mold: s.target_mold, multiplier: Number(s.multiplier) || 1 }))
      );

      // Tags
      await setRecipeTags.mutateAsync({ recipeId: finalId, tagIds: data.tag_ids });

      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      queryClient.invalidateQueries({ queryKey: ["recipe", finalId] });
      toast.success(recipeId ? "¡Receta actualizada!" : "¡Receta guardada!");
      navigate(`/receta/${finalId}`);
    } catch (err: any) {
      toast.error(err.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in space-y-3 max-w-3xl pb-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{recipeId ? "Editar Receta" : "Crear Receta"}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{recipeId ? "Modifica los datos de tu receta" : "Añade una nueva receta a tu colección"}</p>
      </div>

      {/* ── 1. Info básica ────────────────────────────── */}
      <Collapsible open={open.has("basic")} onOpenChange={() => toggle("basic")}>
        <SH icon={FileText} label="Info básica" open={open.has("basic")} />
        <CollapsibleContent className="pt-4 pb-2 space-y-4 px-1">
          <div className="space-y-1.5">
            <Label>Título *</Label>
            <Input value={data.title} onChange={e => set("title", e.target.value)} placeholder="Ej: Tarta de chocolate" required className="rounded-sm" />
          </div>
          <div className="space-y-1.5">
            <Label>Descripción</Label>
            <Textarea value={data.description} onChange={e => set("description", e.target.value)} placeholder="Breve descripción..." rows={2} className="rounded-sm" />
          </div>

          {/* Photo */}
          <div className="space-y-1.5">
            <Label>Foto</Label>
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
            {photoPreview ? (
              <div className="relative">
                <img src={photoPreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                <Button type="button" variant="secondary" size="sm" className="absolute bottom-2 right-2 rounded-lg" onClick={() => fileRef.current?.click()}>
                  <Camera size={14} className="mr-1" /> Cambiar
                </Button>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()} className="w-full h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors">
                <ImagePlus size={24} />
                <span className="text-xs">Añadir foto</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Categoría</Label>
              <Select value={data.category} onValueChange={v => set("category", v)}>
                <SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Subcategoría</Label>
              <Input value={data.subcategory} onChange={e => set("subcategory", e.target.value)} placeholder="Opcional" className="rounded-sm" />
            </div>
          </div>
          {/* Tags */}
          <div className="space-y-1.5">
            <Label>Etiquetas</Label>
            <TagSelector
              recipeId={recipeId}
              selectedTagIds={data.tag_ids}
              onTagsChange={ids => set("tag_ids", ids)}
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label>Dificultad</Label>
              <Select value={data.difficulty} onValueChange={v => set("difficulty", v)}>
                <SelectTrigger className="rounded-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{difficulties.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Porciones</Label>
              <Input value={data.servings} onChange={e => set("servings", e.target.value)} type="number" placeholder="—" className="rounded-sm" />
            </div>
            <div className="space-y-1.5">
              <Label>Molde</Label>
              <Input value={data.mold} onChange={e => set("mold", e.target.value)} placeholder="Ej: Círculo 24cm" className="rounded-sm" />
            </div>
            <div className="space-y-1.5">
              <Label>Temperatura °C</Label>
              <Input value={data.temperature} onChange={e => set("temperature", e.target.value)} type="number" placeholder="—" className="rounded-sm" />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* ── 2. Tiempos ───────────────────────────────── */}
      <Collapsible open={open.has("times")} onOpenChange={() => toggle("times")}>
        <SH icon={Clock} label="Tiempos" open={open.has("times")} />
        <CollapsibleContent className="pt-4 pb-2 px-1">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1.5"><Label>Preparación (min)</Label><Input value={data.prep_time_min} onChange={e => set("prep_time_min", e.target.value)} type="number" placeholder="—" className="rounded-sm" /></div>
            <div className="space-y-1.5"><Label>Cocción (min)</Label><Input value={data.bake_time_min} onChange={e => set("bake_time_min", e.target.value)} type="number" placeholder="—" className="rounded-sm" /></div>
            <div className="space-y-1.5"><Label>Reposo (min)</Label><Input value={data.rest_time_min} onChange={e => set("rest_time_min", e.target.value)} type="number" placeholder="—" className="rounded-sm" /></div>
            <div className="space-y-1.5"><Label>Total activo (min)</Label><Input value={data.total_active_min} onChange={e => set("total_active_min", e.target.value)} type="number" placeholder="—" className="rounded-sm" /></div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* ── 3. Origen ────────────────────────────────── */}
      <Collapsible open={open.has("origin")} onOpenChange={() => toggle("origin")}>
        <SH icon={MapPin} label="Origen" open={open.has("origin")} />
        <CollapsibleContent className="pt-4 pb-2 space-y-3 px-1">
          <div className="space-y-1.5"><Label>Chef / Autor</Label><Input value={data.origin_chef} onChange={e => set("origin_chef", e.target.value)} placeholder="Nombre del chef" className="rounded-sm" /></div>
          <div className="space-y-1.5"><Label>URL fuente</Label><Input value={data.origin_url} onChange={e => set("origin_url", e.target.value)} placeholder="https://..." type="url" className="rounded-sm" /></div>
          <div className="space-y-1.5"><Label>Libro / Referencia</Label><Input value={data.origin_book} onChange={e => set("origin_book", e.target.value)} placeholder="Nombre del libro" className="rounded-sm" /></div>
        </CollapsibleContent>
      </Collapsible>

      {/* ── 4. Componentes ───────────────────────────── */}
      <Collapsible open={open.has("components")} onOpenChange={() => toggle("components")}>
        <SH icon={Layers} label="Componentes *" open={open.has("components")} />
        <CollapsibleContent className="pt-4 pb-2 space-y-3 px-1">
          {data.components.map((comp, i) => (
            <ComponentEditor
              key={i}
              component={comp}
              index={i}
              total={data.components.length}
              onChange={c => updateComponent(i, c)}
              onDelete={() => set("components", data.components.filter((_, idx) => idx !== i))}
              onMoveUp={() => swapComponents(i, -1)}
              onMoveDown={() => swapComponents(i, 1)}
            />
          ))}
          <Button type="button" variant="outline" onClick={() => set("components", [...data.components, emptyComponent(data.components.length)])} className="w-full rounded-lg">
            <Plus size={16} className="mr-1" /> Añadir componente
          </Button>
        </CollapsibleContent>
      </Collapsible>

      {/* ── 5. Planning multi-día ────────────────────── */}
      <Collapsible open={open.has("planning")} onOpenChange={() => toggle("planning")}>
        <SH icon={CalendarDays} label="Planning multi-día" open={open.has("planning")} />
        <CollapsibleContent className="pt-4 pb-2 space-y-3 px-1">
          <div className="flex items-center gap-3">
            <Switch checked={data.planning_enabled} onCheckedChange={v => set("planning_enabled", v)} />
            <Label>Activar planificación por días</Label>
          </div>
          {data.planning_enabled && (
            <>
              {data.planning.map((day, di) => (
                <div key={di} className="border border-border rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Input value={day.day_label} onChange={e => { const p = [...data.planning]; p[di] = { ...p[di], day_label: e.target.value }; set("planning", p); }} placeholder={`Día ${di + 1}`} className="flex-1 font-medium text-sm h-9" />
                    <Button type="button" variant="ghost" size="icon" onClick={() => set("planning", data.planning.filter((_, i) => i !== di))} className="text-destructive h-8 w-8"><Trash2 size={14} /></Button>
                  </div>
                  {day.tasks.map((task, ti) => (
                    <div key={ti} className="flex items-center gap-1.5 ml-4">
                      <span className="text-xs text-muted-foreground">•</span>
                      <Input value={task} onChange={e => { const p = [...data.planning]; const t = [...p[di].tasks]; t[ti] = e.target.value; p[di] = { ...p[di], tasks: t }; set("planning", p); }} placeholder="Tarea..." className="flex-1 text-sm h-8" />
                      <button type="button" onClick={() => { const p = [...data.planning]; p[di] = { ...p[di], tasks: p[di].tasks.filter((_, i) => i !== ti) }; set("planning", p); }} className="text-destructive/60 hover:text-destructive p-1"><Trash2 size={12} /></button>
                    </div>
                  ))}
                  <Button type="button" variant="ghost" size="sm" onClick={() => { const p = [...data.planning]; p[di] = { ...p[di], tasks: [...p[di].tasks, ""] }; set("planning", p); }} className="ml-4 h-7 text-xs"><Plus size={12} className="mr-1" /> Tarea</Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => set("planning", [...data.planning, { day_label: "", tasks: [""], sort_order: data.planning.length }])} className="rounded-lg">
                <Plus size={14} className="mr-1" /> Añadir día
              </Button>
            </>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* ── 6. Notas y Variantes ─────────────────────── */}
      <Collapsible open={open.has("notes")} onOpenChange={() => toggle("notes")}>
        <SH icon={StickyNote} label="Notas y Variantes" open={open.has("notes")} />
        <CollapsibleContent className="pt-4 pb-2 space-y-4 px-1">
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Tips / Notas</h4>
            {data.notes.map((note, i) => (
              <div key={i} className="flex items-start gap-1.5 mb-2">
                <Textarea value={note.content} onChange={e => { const n = [...data.notes]; n[i] = { ...n[i], content: e.target.value }; set("notes", n); }} placeholder="Tip o nota..." rows={1} className="flex-1 text-sm min-h-[2rem]" />
                <button type="button" onClick={() => set("notes", data.notes.filter((_, idx) => idx !== i))} className="text-destructive/60 hover:text-destructive p-1 mt-1"><Trash2 size={13} /></button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => set("notes", [...data.notes, { content: "", sort_order: data.notes.length }])} className="h-8 text-xs"><Plus size={13} className="mr-1" /> Nota</Button>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Variantes</h4>
            {data.variants.map((v, i) => (
              <div key={i} className="flex items-start gap-1.5 mb-2">
                <Input value={v.name} onChange={e => { const vs = [...data.variants]; vs[i] = { ...vs[i], name: e.target.value }; set("variants", vs); }} placeholder="Nombre" className="w-1/3 text-sm h-9" />
                <Input value={v.description} onChange={e => { const vs = [...data.variants]; vs[i] = { ...vs[i], description: e.target.value }; set("variants", vs); }} placeholder="Descripción" className="flex-1 text-sm h-9" />
                <button type="button" onClick={() => set("variants", data.variants.filter((_, idx) => idx !== i))} className="text-destructive/60 hover:text-destructive p-1 mt-1"><Trash2 size={13} /></button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => set("variants", [...data.variants, { name: "", description: "" }])} className="h-8 text-xs"><Plus size={13} className="mr-1" /> Variante</Button>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* ── 7. Escala ────────────────────────────────── */}
      <Collapsible open={open.has("scale")} onOpenChange={() => toggle("scale")}>
        <SH icon={Scale} label="Factores de escala" open={open.has("scale")} />
        <CollapsibleContent className="pt-4 pb-2 space-y-3 px-1">
          {data.scale_factors.map((sf, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input value={sf.reference_mold} onChange={e => { const s = [...data.scale_factors]; s[i] = { ...s[i], reference_mold: e.target.value }; set("scale_factors", s); }} placeholder="Molde referencia" className="flex-1 text-sm h-9" />
              <span className="text-muted-foreground text-xs">→</span>
              <Input value={sf.target_mold} onChange={e => { const s = [...data.scale_factors]; s[i] = { ...s[i], target_mold: e.target.value }; set("scale_factors", s); }} placeholder="Molde destino" className="flex-1 text-sm h-9" />
              <Input value={sf.multiplier} onChange={e => { const s = [...data.scale_factors]; s[i] = { ...s[i], multiplier: e.target.value }; set("scale_factors", s); }} placeholder="×" className="w-16 text-sm h-9" type="number" step="any" />
              <button type="button" onClick={() => set("scale_factors", data.scale_factors.filter((_, idx) => idx !== i))} className="text-destructive/60 hover:text-destructive p-1"><Trash2 size={13} /></button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => set("scale_factors", [...data.scale_factors, { reference_mold: "", target_mold: "", multiplier: "1" }])} className="h-8 text-xs"><Plus size={13} className="mr-1" /> Factor</Button>
        </CollapsibleContent>
      </Collapsible>

      {/* ── 8. Estado ────────────────────────────────── */}
      <Collapsible open={open.has("status")} onOpenChange={() => toggle("status")}>
        <SH icon={FlaskConical} label="Estado" open={open.has("status")} />
        <CollapsibleContent className="pt-4 pb-2 space-y-4 px-1">
          <div className="flex items-center gap-3">
            <Switch checked={data.tested} onCheckedChange={v => set("tested", v)} />
            <Label>Receta probada</Label>
          </div>
          {data.tested && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Notas de prueba</Label>
                <Textarea value={data.test_notes} onChange={e => set("test_notes", e.target.value)} placeholder="¿Cómo salió? ¿Qué ajustarías?" rows={3} className="rounded-sm" />
              </div>
              <div className="space-y-1.5">
                <Label>Valoración</Label>
                <StarRating value={data.rating} onChange={v => set("rating", v)} />
              </div>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* ── Submit ────────────────────────────────────── */}
      <div className="pt-4">
        <Button type="submit" size="lg" className="w-full rounded-lg" disabled={loading}>
          {loading ? "Guardando..." : recipeId ? "Actualizar receta" : "Guardar receta"}
        </Button>
      </div>
    </form>
  );
}
