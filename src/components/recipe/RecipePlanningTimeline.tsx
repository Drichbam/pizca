import type { RecipePlanning } from "@/types/recipe";

interface Props {
  planning: RecipePlanning[];
}

export function RecipePlanningTimeline({ planning }: Props) {
  const sorted = [...planning].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="bg-card rounded-xl p-4 shadow-card">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">📅 Planificación</p>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-border" />

        <div className="space-y-4">
          {sorted.map((day, idx) => (
            <div key={day.id} className="relative flex gap-4 items-start">
              {/* Dot */}
              <div className="relative z-10 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                {idx + 1}
              </div>
              <div className="flex-1 pb-1">
                <p className="font-semibold text-sm text-foreground">{day.day_label}</p>
                <ul className="mt-1 space-y-0.5">
                  {day.tasks.map((task, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-1.5">
                      <span className="text-primary mt-0.5">•</span>
                      {task}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
