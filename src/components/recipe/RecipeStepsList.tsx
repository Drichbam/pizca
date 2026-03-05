import { useState } from "react";
import { ChevronDown, ChevronRight, Thermometer, Clock } from "lucide-react";
import type { RecipeComponent, RecipeStep } from "@/types/recipe";
import { useTranslation } from "react-i18next";

interface Props {
  components: (RecipeComponent & { recipe_steps: RecipeStep[] })[];
}

export function RecipeStepsList({ components }: Props) {
  const { t } = useTranslation();
  const sorted = [...components].sort((a, b) => a.sort_order - b.sort_order);

  if (!sorted.length) {
    return <p className="text-sm text-muted-foreground">{t("stepsList.empty")}</p>;
  }

  if (sorted.length === 1 && !sorted[0].name) {
    const steps = [...sorted[0].recipe_steps].sort((a, b) => a.step_order - b.step_order);
    return (
      <div className="space-y-4">
        {steps.map((step, idx) => (
          <StepRow key={step.id} step={step} index={idx + 1} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sorted.map((comp) => (
        <StepSection key={comp.id} component={comp} />
      ))}
    </div>
  );
}

function StepSection({ component }: { component: RecipeComponent & { recipe_steps: RecipeStep[] } }) {
  const [open, setOpen] = useState(true);
  const { t } = useTranslation();
  const steps = [...component.recipe_steps].sort((a, b) => a.step_order - b.step_order);

  return (
    <div className="bg-card rounded-xl shadow-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 p-4 text-left hover:bg-muted/50 transition-colors"
      >
        {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        <span className="font-semibold text-foreground text-sm">{component.name || t("stepsList.defaultGroup")}</span>
        <span className="text-xs text-muted-foreground ml-auto">{t("stepsList.count", { count: steps.length })}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-4">
          {steps.map((step, idx) => (
            <StepRow key={step.id} step={step} index={idx + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function StepRow({ step, index }: { step: RecipeStep; index: number }) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
        {index}
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-sm text-foreground leading-relaxed">{step.description}</p>
        <div className="flex flex-wrap gap-2">
          {step.temp_c && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Thermometer className="h-3 w-3" /> {step.temp_c}°C
            </span>
          )}
          {step.duration_min && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> {step.duration_min} min
            </span>
          )}
        </div>
        {step.technical_notes && (
          <p className="text-xs text-muted-foreground italic bg-muted/50 rounded-md px-2 py-1.5 mt-1">
            💡 {step.technical_notes}
          </p>
        )}
        {step.photo_url && (
          <img
            src={step.photo_url}
            alt={`${index}`}
            className="mt-2 rounded-lg w-full max-h-56 object-cover"
          />
        )}
      </div>
    </div>
  );
}
