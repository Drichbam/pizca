import { MessageSquare, Layers } from "lucide-react";
import type { RecipeNote, RecipeVariant } from "@/types/recipe";

interface Props {
  notes: RecipeNote[];
  variants: RecipeVariant[];
}

export function RecipeNotesTab({ notes, variants }: Props) {
  const sortedNotes = [...notes].sort((a, b) => a.sort_order - b.sort_order);

  if (!sortedNotes.length && !variants.length) {
    return <p className="text-sm text-muted-foreground">Sin notas ni variantes.</p>;
  }

  return (
    <div className="space-y-4">
      {sortedNotes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" /> Tips del chef
          </h3>
          {sortedNotes.map((note) => (
            <div key={note.id} className="bg-card rounded-xl p-4 shadow-card text-sm text-foreground leading-relaxed">
              {note.content}
            </div>
          ))}
        </div>
      )}

      {variants.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" /> Variantes
          </h3>
          {variants.map((v) => (
            <div key={v.id} className="bg-card rounded-xl p-4 shadow-card">
              <p className="text-sm font-medium text-foreground">{v.name}</p>
              {v.description && <p className="text-sm text-muted-foreground mt-1">{v.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
