import { useState } from "react";
import { Check, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useIngredientCatalog } from "@/hooks/useIngredientCatalog";
import { useTranslation } from "react-i18next";
import type { Ingredient } from "@/types/recipe";

interface UnlinkedItem {
  id: string;
  display_name: string;
}

interface Props {
  ingredients: UnlinkedItem[];
  onLinked: (id: string) => void;
}

function IngredientLinkRow({ item, catalog, lang, onLinked }: {
  item: UnlinkedItem;
  catalog: Ingredient[];
  lang: string;
  onLinked: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = search.trim().length >= 1
    ? catalog.filter(c => {
        const t = (c.translations as Record<string, string>) || {};
        const a = (c.aliases as Record<string, string[]>) || {};
        const q = search.toLowerCase();
        return (
          Object.values(t).some(v => v.toLowerCase().includes(q)) ||
          Object.values(a).flat().some(v => v.toLowerCase().includes(q)) ||
          c.canonical_name.includes(q)
        );
      }).slice(0, 6)
    : [];

  function getLabel(c: Ingredient) {
    const t = (c.translations as Record<string, string>) || {};
    return t[lang] || t["es"] || t["fr"] || t["en"] || c.canonical_name;
  }

  async function handleLink() {
    if (!selectedId) return;
    setSaving(true);
    await supabase.from("recipe_ingredients").update({ ingredient_id: selectedId }).eq("id", item.id);
    setSaving(false);
    onLinked(item.id);
  }

  return (
    <div className="border border-border rounded-lg p-3 space-y-2 text-sm">
      <div className="flex items-center gap-2">
        <span className="font-medium text-foreground flex-1">{item.display_name}</span>
        {selectedId && (
          <Button size="sm" className="h-7 text-xs" disabled={saving} onClick={handleLink}>
            <Check size={12} className="mr-1" />
            Vincular
          </Button>
        )}
      </div>
      <Input
        placeholder="Buscar en catálogo..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setSelectedId(null); }}
        className="h-8 text-xs"
      />
      {filtered.length > 0 && (
        <ul className="space-y-0.5">
          {filtered.map(c => (
            <li key={c.id}>
              <button
                type="button"
                className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                  selectedId === c.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-foreground"
                }`}
                onClick={() => setSelectedId(selectedId === c.id ? null : c.id)}
              >
                {getLabel(c)}
                <span className="text-muted-foreground ml-1">({c.canonical_name})</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function UnlinkedIngredientsReview({ ingredients, onLinked }: Props) {
  const { data: catalog = [] } = useIngredientCatalog();
  const { i18n } = useTranslation();
  const lang = i18n.language;

  if (ingredients.length === 0) return null;

  return (
    <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2 text-amber-800">
        <Link size={15} />
        <p className="text-sm font-semibold">
          {ingredients.length === 1
            ? "1 ingrediente no reconocido en catálogo"
            : `${ingredients.length} ingredientes no reconocidos en catálogo`}
        </p>
      </div>
      <p className="text-xs text-amber-700">
        Puedes vincularlos manualmente para habilitar agrupación en lista de compra y cálculo de costes.
      </p>
      <div className="space-y-2">
        {ingredients.map(item => (
          <IngredientLinkRow
            key={item.id}
            item={item}
            catalog={catalog}
            lang={lang}
            onLinked={onLinked}
          />
        ))}
      </div>
    </div>
  );
}
