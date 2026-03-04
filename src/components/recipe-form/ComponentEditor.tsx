import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, ChevronUp, ChevronDown } from "lucide-react";
import { Constants } from "@/integrations/supabase/types";

const units = Constants.public.Enums.ingredient_unit;

export interface IngredientForm {
  name: string;
  quantity: string;
  unit: string;
  sort_order: number;
}

export interface StepForm {
  description: string;
  temp_c: string;
  duration_min: string;
  technical_notes: string;
  step_order: number;
}

export interface ComponentForm {
  name: string;
  sort_order: number;
  ingredients: IngredientForm[];
  steps: StepForm[];
}

export function emptyIngredient(order = 0): IngredientForm {
  return { name: "", quantity: "", unit: "", sort_order: order };
}
export function emptyStep(order = 0): StepForm {
  return { description: "", temp_c: "", duration_min: "", technical_notes: "", step_order: order };
}
export function emptyComponent(order = 0): ComponentForm {
  return { name: "", sort_order: order, ingredients: [emptyIngredient()], steps: [] };
}

function swap<T>(arr: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const copy = [...arr];
  [copy[i], copy[j]] = [copy[j], copy[i]];
  return copy;
}

interface Props {
  component: ComponentForm;
  index: number;
  total: number;
  onChange: (comp: ComponentForm) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function ComponentEditor({ component, index, total, onChange, onDelete, onMoveUp, onMoveDown }: Props) {
  const updateIng = (i: number, field: keyof IngredientForm, value: string) => {
    const ingredients = [...component.ingredients];
    ingredients[i] = { ...ingredients[i], [field]: value };
    onChange({ ...component, ingredients });
  };

  const updateStep = (i: number, field: keyof StepForm, value: string) => {
    const steps = [...component.steps];
    steps[i] = { ...steps[i], [field]: value };
    onChange({ ...component, steps });
  };

  return (
    <div className="border border-border rounded-lg p-4 space-y-4 bg-card/50">
      {/* Component header */}
      <div className="flex items-center gap-2">
        <div className="flex flex-col gap-0.5">
          <button type="button" onClick={onMoveUp} disabled={index === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-20 p-0.5"><ChevronUp size={14} /></button>
          <button type="button" onClick={onMoveDown} disabled={index === total - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-20 p-0.5"><ChevronDown size={14} /></button>
        </div>
        <Input
          placeholder={total === 1 ? "Componente principal (opcional)" : "Nombre del componente (ej: Pâte sablée)"}
          value={component.name}
          onChange={(e) => onChange({ ...component, name: e.target.value })}
          className="flex-1 font-medium"
        />
        {total > 1 && (
          <Button type="button" variant="ghost" size="icon" onClick={onDelete} className="text-destructive hover:text-destructive shrink-0">
            <Trash2 size={16} />
          </Button>
        )}
      </div>

      {/* Ingredients */}
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Ingredientes</h4>
        <div className="space-y-2">
          {component.ingredients.map((ing, i) => (
            <div key={i} className="flex gap-1.5 items-center">
              <Input placeholder="Nombre" value={ing.name} onChange={(e) => updateIng(i, "name", e.target.value)} className="flex-1 text-sm h-9" />
              <Input placeholder="Cant." value={ing.quantity} onChange={(e) => updateIng(i, "quantity", e.target.value)} className="w-[4.5rem] text-sm h-9" type="number" step="any" />
              <Select value={ing.unit || "none"} onValueChange={(v) => updateIng(i, "unit", v === "none" ? "" : v)}>
                <SelectTrigger className="w-[4.5rem] text-sm h-9"><SelectValue placeholder="Ud." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">—</SelectItem>
                  {units.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="flex flex-col gap-0">
                <button type="button" onClick={() => onChange({ ...component, ingredients: swap(component.ingredients, i, -1) })} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-20 leading-none"><ChevronUp size={11} /></button>
                <button type="button" onClick={() => onChange({ ...component, ingredients: swap(component.ingredients, i, 1) })} disabled={i === component.ingredients.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-20 leading-none"><ChevronDown size={11} /></button>
              </div>
              <button type="button" onClick={() => onChange({ ...component, ingredients: component.ingredients.filter((_, idx) => idx !== i) })} className="text-destructive/60 hover:text-destructive p-1">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...component, ingredients: [...component.ingredients, emptyIngredient(component.ingredients.length)] })} className="mt-2 h-8 text-xs">
          <Plus size={13} className="mr-1" /> Ingrediente
        </Button>
      </div>

      {/* Steps */}
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Pasos</h4>
        <div className="space-y-2">
          {component.steps.map((step, i) => (
            <div key={i} className="border border-border/40 rounded p-3 space-y-2 bg-background/50">
              <div className="flex items-start gap-2">
                <span className="text-xs font-bold text-primary mt-2.5 min-w-[1.2rem] text-right">{i + 1}.</span>
                <Textarea placeholder="Descripción del paso..." value={step.description} onChange={(e) => updateStep(i, "description", e.target.value)} rows={2} className="flex-1 text-sm min-h-[2.5rem]" />
                <div className="flex flex-col gap-0">
                  <button type="button" onClick={() => onChange({ ...component, steps: swap(component.steps, i, -1) })} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-20"><ChevronUp size={11} /></button>
                  <button type="button" onClick={() => onChange({ ...component, steps: swap(component.steps, i, 1) })} disabled={i === component.steps.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-20"><ChevronDown size={11} /></button>
                </div>
                <button type="button" onClick={() => onChange({ ...component, steps: component.steps.filter((_, idx) => idx !== i) })} className="text-destructive/60 hover:text-destructive p-1 mt-1">
                  <Trash2 size={13} />
                </button>
              </div>
              <div className="flex gap-2 ml-6">
                <Input placeholder="°C" value={step.temp_c} onChange={(e) => updateStep(i, "temp_c", e.target.value)} className="w-16 text-sm h-8" type="number" />
                <Input placeholder="Min" value={step.duration_min} onChange={(e) => updateStep(i, "duration_min", e.target.value)} className="w-16 text-sm h-8" type="number" />
                <Input placeholder="Notas técnicas" value={step.technical_notes} onChange={(e) => updateStep(i, "technical_notes", e.target.value)} className="flex-1 text-sm h-8" />
              </div>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => onChange({ ...component, steps: [...component.steps, emptyStep(component.steps.length)] })} className="mt-2 h-8 text-xs">
          <Plus size={13} className="mr-1" /> Paso
        </Button>
      </div>
    </div>
  );
}
