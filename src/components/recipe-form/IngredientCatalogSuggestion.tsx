import { useMemo } from "react";
import { Check, X, Link } from "lucide-react";
import { useIngredientCatalog, findMatchingIngredientIds } from "@/hooks/useIngredientCatalog";
import { useTranslation } from "react-i18next";

interface Props {
  displayName: string;
  currentIngredientId: string | null;
  dismissed: boolean;
  onAccept: (id: string) => void;
  onDismiss: () => void;
}

export function IngredientCatalogSuggestion({ displayName, currentIngredientId, dismissed, onAccept, onDismiss }: Props) {
  const { data: catalog } = useIngredientCatalog();
  const { i18n } = useTranslation();
  const lang = i18n.language;

  function getLabel(id: string) {
    const match = catalog?.find(c => c.id === id);
    if (!match) return null;
    const t = (match.translations as Record<string, string>) || {};
    return t[lang] || t["es"] || t["fr"] || t["en"] || match.canonical_name;
  }

  const suggestion = useMemo(() => {
    if (!catalog || displayName.length < 2 || dismissed || currentIngredientId) return null;
    const matchIds = findMatchingIngredientIds(displayName, catalog);
    if (!matchIds.length) return null;
    const label = getLabel(matchIds[0]);
    if (!label) return null;
    return { id: matchIds[0], label };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalog, displayName, dismissed, currentIngredientId, lang]);

  if (currentIngredientId) {
    const label = getLabel(currentIngredientId);
    if (!label) return null;
    return (
      <div className="flex items-center gap-1 mt-0.5 ml-1">
        <Link size={10} className="text-emerald-600 shrink-0" />
        <span className="text-xs text-emerald-600">{label}</span>
        <button type="button" onClick={onDismiss} className="text-muted-foreground hover:text-foreground ml-0.5">
          <X size={10} />
        </button>
      </div>
    );
  }

  if (!suggestion) return null;

  return (
    <div className="flex items-center gap-1 mt-0.5 ml-1">
      <span className="text-xs text-muted-foreground">Vincular a:</span>
      <span className="text-xs font-medium">{suggestion.label}</span>
      <button
        type="button"
        onClick={() => onAccept(suggestion.id)}
        className="text-emerald-600 hover:text-emerald-700 ml-0.5 p-0.5 rounded"
      >
        <Check size={11} />
      </button>
      <button
        type="button"
        onClick={onDismiss}
        className="text-muted-foreground hover:text-foreground p-0.5 rounded"
      >
        <X size={11} />
      </button>
    </div>
  );
}
