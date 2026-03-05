import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Search, Plus, Pencil, Trash2, X, Check, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";
import { Constants } from "@/integrations/supabase/types";
import { BarcodeSearchField } from "@/components/profile/BarcodeSearchField";
import { CommunityPricesPanel } from "@/components/profile/CommunityPricesPanel";
import { IngredientPriceSearchPanel } from "@/components/profile/IngredientPriceSearchPanel";
import type { OpenFoodFactsProduct } from "@/hooks/useOpenFoodFacts";
import { useTranslation } from "react-i18next";

type IngredientPrice = Database["public"]["Tables"]["ingredient_prices"]["Row"];
type IngredientUnit = Database["public"]["Enums"]["ingredient_unit"];

const UNITS = Constants.public.Enums.ingredient_unit;

interface FormData {
  ingredient_name: string;
  brand: string;
  supermarket: string;
  price: string;
  package_size: string;
  package_unit: IngredientUnit;
  is_default: boolean;
}

const emptyForm: FormData = {
  ingredient_name: "",
  brand: "",
  supermarket: "",
  price: "",
  package_size: "",
  package_unit: "g",
  is_default: true,
};

interface Props {
  initialIngredient?: string;
  initialBarcode?: string;
}

type FilterMode = "all" | "priced" | "unpriced";

interface CombinedItem {
  type: "priced" | "unpriced";
  name: string;
  price?: IngredientPrice;
}

function IngredientRecipesList({ ingredientName, navigate }: { ingredientName: string; navigate: (path: string) => void }) {
  const { t } = useTranslation();
  const normalizedName = ingredientName.trim().toLowerCase();
  const { data: recipes, isLoading } = useQuery({
    queryKey: ["recipes_using_ingredient", normalizedName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipe_ingredients")
        .select("name, recipe_components!inner(recipe_id, recipes!inner(id, title))");
      if (error) throw error;
      const matches = (data || []).filter(
        (r: any) => r.name?.trim().toLowerCase() === normalizedName
      );
      const seen = new Set<string>();
      const result: { id: string; title: string }[] = [];
      for (const m of matches) {
        const rec = (m as any).recipe_components?.recipes;
        if (rec && !seen.has(rec.id)) {
          seen.add(rec.id);
          result.push({ id: rec.id, title: rec.title });
        }
      }
      return result.sort((a, b) => a.title.localeCompare(b.title, "es"));
    },
  });

  if (isLoading) return <div className="px-3 pb-3"><div className="h-4 bg-secondary rounded animate-pulse" /></div>;
  if (!recipes?.length) return <p className="px-3 pb-3 text-xs text-muted-foreground">{t("prices.notInRecipes")}</p>;

  return (
    <div className="px-3 pb-3 flex flex-wrap gap-1.5">
      {recipes.map((r) => (
        <button
          key={r.id}
          type="button"
          onClick={() => navigate(`/receta/${r.id}`)}
          className="text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground px-2 py-0.5 rounded-full transition-colors"
        >
          {r.title}
        </button>
      ))}
    </div>
  );
}

export function IngredientPricesManager({ initialIngredient, initialBarcode }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(
    initialIngredient ? { ...emptyForm, ingredient_name: initialIngredient } : emptyForm
  );
  const [showForm, setShowForm] = useState(!!initialIngredient || !!initialBarcode);
  const [foundBarcode, setFoundBarcode] = useState<string | null>(initialBarcode || null);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [expandedIngredient, setExpandedIngredient] = useState<string | null>(null);

  const { data: prices, isLoading } = useQuery({
    queryKey: ["ingredient_prices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ingredient_prices")
        .select("*")
        .order("ingredient_name");
      if (error) throw error;
      return data as IngredientPrice[];
    },
  });

  const { data: recipeIngredients } = useQuery({
    queryKey: ["recipe_ingredient_names"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipe_ingredients")
        .select("name");
      if (error) throw error;
      const nameSet = new Set<string>();
      (data || []).forEach((r) => {
        const n = r.name?.trim();
        if (n && n.length <= 60 && !n.includes(",") && !n.includes(".")) nameSet.add(n.toLowerCase());
      });
      return Array.from(nameSet).sort();
    },
  });

  const activeIngredientName = showForm ? form.ingredient_name.trim().toLowerCase() : "";
  const { data: recipesUsingIngredient } = useQuery({
    queryKey: ["recipes_using_ingredient", activeIngredientName],
    queryFn: async () => {
      if (!activeIngredientName) return [];
      const { data, error } = await supabase
        .from("recipe_ingredients")
        .select("component_id, name, recipe_components!inner(recipe_id, recipes!inner(id, title))");
      if (error) throw error;
      const matches = (data || []).filter(
        (r: any) => r.name?.trim().toLowerCase() === activeIngredientName
      );
      const seen = new Set<string>();
      const recipes: { id: string; title: string }[] = [];
      for (const m of matches) {
        const rec = (m as any).recipe_components?.recipes;
        if (rec && !seen.has(rec.id)) {
          seen.add(rec.id);
          recipes.push({ id: rec.id, title: rec.title });
        }
      }
      return recipes.sort((a, b) => a.title.localeCompare(b.title, "es"));
    },
    enabled: !!activeIngredientName,
  });

  const combinedList = useMemo<CombinedItem[]>(() => {
    const priceMap = new Map<string, IngredientPrice>();
    (prices || []).forEach((p) => {
      priceMap.set(p.ingredient_name.trim().toLowerCase(), p);
    });

    const items: CombinedItem[] = (prices || []).map((p) => ({
      type: "priced" as const,
      name: p.ingredient_name,
      price: p,
    }));

    const pricedNames = new Set(
      (prices || []).map((p) => p.ingredient_name.trim().toLowerCase())
    );
    (recipeIngredients || []).forEach((name) => {
      if (!pricedNames.has(name)) {
        items.push({ type: "unpriced", name });
      }
    });

    items.sort((a, b) => {
      if (a.type !== b.type) return a.type === "priced" ? -1 : 1;
      return a.name.localeCompare(b.name, "es");
    });

    return items;
  }, [prices, recipeIngredients]);

  const filtered = useMemo(() => {
    return combinedList.filter((item) => {
      if (filter === "priced" && item.type !== "priced") return false;
      if (filter === "unpriced" && item.type !== "unpriced") return false;
      if (!search) return true;
      const s = search.toLowerCase();
      if (item.name.toLowerCase().includes(s)) return true;
      if (item.price?.brand?.toLowerCase().includes(s)) return true;
      if (item.price?.supermarket?.toLowerCase().includes(s)) return true;
      return false;
    });
  }, [combinedList, filter, search]);

  const upsert = useMutation({
    mutationFn: async (data: FormData) => {
      if (!user) throw new Error("Not authenticated");
      const payload = {
        user_id: user.id,
        ingredient_name: data.ingredient_name.trim(),
        brand: data.brand.trim() || null,
        supermarket: data.supermarket.trim() || null,
        price: Number(data.price),
        package_size: data.package_size ? Number(data.package_size) : null,
        package_unit: data.package_unit as IngredientUnit,
        is_default: data.is_default,
      };

      if (editingId) {
        const { error } = await supabase
          .from("ingredient_prices")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("ingredient_prices").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredient_prices"] });
      queryClient.invalidateQueries({ queryKey: ["recipe_ingredient_names"] });
      toast.success(editingId ? t("prices.updated") : t("prices.addedSuccess"));
      resetForm();
    },
    onError: () => toast.error(t("prices.saveError")),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ingredient_prices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredient_prices"] });
      toast.success(t("prices.deleted"));
    },
    onError: () => toast.error(t("prices.deleteError")),
  });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setFoundBarcode(null);
  };

  const startEdit = (p: IngredientPrice) => {
    setEditingId(p.id);
    setForm({
      ingredient_name: p.ingredient_name,
      brand: p.brand || "",
      supermarket: p.supermarket || "",
      price: String(p.price),
      package_size: p.package_size ? String(p.package_size) : "",
      package_unit: (p.package_unit as IngredientUnit) || "g",
      is_default: p.is_default ?? true,
    });
    setShowForm(true);
  };

  const startAddForIngredient = (name: string) => {
    setEditingId(null);
    setForm({ ...emptyForm, ingredient_name: name });
    setShowForm(true);
  };

  const handleProductFound = (product: OpenFoodFactsProduct & { barcode: string }) => {
    const packageUnit = UNITS.includes(product.package_unit as IngredientUnit)
      ? (product.package_unit as IngredientUnit)
      : "g";
    setFoundBarcode(product.barcode);
    setForm((prev) => ({
      ...prev,
      ingredient_name: prev.ingredient_name || product.name,
      brand: prev.brand || product.brand,
      package_size: product.package_size != null ? String(product.package_size) : prev.package_size,
      package_unit: packageUnit,
    }));
  };

  const unpricedCount = combinedList.filter((i) => i.type === "unpriced").length;
  const pricedCount = combinedList.filter((i) => i.type === "priced").length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("nav.ingredients")}</p>
        {!showForm && (
          <Button size="sm" className="rounded-lg" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" /> {t("prices.add")}
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-accent/30 rounded-xl p-4 space-y-3 border border-border">
          {!editingId && (
            <BarcodeSearchField onProductFound={handleProductFound} />
          )}
          {foundBarcode && !editingId && (
            <CommunityPricesPanel barcode={foundBarcode} />
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-xs text-muted-foreground">{t("prices.ingredientLabel")}</Label>
              <Input
                value={form.ingredient_name}
                onChange={(e) => setForm({ ...form, ingredient_name: e.target.value })}
                className="rounded-lg"
                placeholder={t("prices.ingredientPlaceholder")}
              />
              <IngredientPriceSearchPanel ingredientName={form.ingredient_name} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">{t("prices.brand")}</Label>
              <Input
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="rounded-lg"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">{t("prices.supermarket")}</Label>
              <Input
                value={form.supermarket}
                onChange={(e) => setForm({ ...form, supermarket: e.target.value })}
                className="rounded-lg"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">{t("prices.priceLabel")}</Label>
              <Input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="rounded-lg"
                min={0}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">{t("prices.packageSize")}</Label>
              <Input
                type="number"
                value={form.package_size}
                onChange={(e) => setForm({ ...form, package_size: e.target.value })}
                className="rounded-lg"
                min={0}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">{t("prices.packageUnit")}</Label>
              <Select
                value={form.package_unit}
                onValueChange={(v) => setForm({ ...form, package_unit: v as IngredientUnit })}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pt-4">
              <Checkbox
                id="is_default"
                checked={form.is_default}
                onCheckedChange={(v) => setForm({ ...form, is_default: !!v })}
              />
              <label htmlFor="is_default" className="text-xs text-muted-foreground cursor-pointer">
                {t("prices.isDefault")}
              </label>
            </div>
          </div>
          <div className="flex gap-2 justify-between">
            {editingId ? (
              <Button
                variant="ghost"
                size="sm"
                className="rounded-lg text-destructive hover:text-destructive"
                onClick={() => { deleteMutation.mutate(editingId); resetForm(); }}
              >
                <Trash2 className="h-4 w-4 mr-1" /> {t("common.delete")}
              </Button>
            ) : <div />}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-lg" onClick={resetForm}>
                <X className="h-4 w-4 mr-1" /> {t("common.cancel")}
              </Button>
              <Button
                size="sm"
                className="rounded-lg"
                disabled={!form.ingredient_name.trim() || !form.price || upsert.isPending}
                onClick={() => upsert.mutate(form)}
              >
                <Check className="h-4 w-4 mr-1" /> {editingId ? t("common.save") : t("prices.add")}
              </Button>
            </div>
          </div>

          {activeIngredientName && recipesUsingIngredient && recipesUsingIngredient.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <BookOpen className="h-3 w-3" /> {t("prices.usedInRecipes", { count: recipesUsingIngredient.length })}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {recipesUsingIngredient.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => navigate(`/receta/${r.id}`)}
                    className="text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground px-2 py-0.5 rounded-full transition-colors"
                  >
                    {r.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("prices.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-lg"
          />
        </div>
      </div>

      <ToggleGroup
        type="single"
        value={filter}
        onValueChange={(v) => v && setFilter(v as FilterMode)}
        variant="outline"
        size="sm"
        className="justify-start"
      >
        <ToggleGroupItem value="all" className="rounded-lg text-xs">
          {t("prices.filterAll", { count: combinedList.length })}
        </ToggleGroupItem>
        <ToggleGroupItem value="priced" className="rounded-lg text-xs">
          {t("prices.filterPriced", { count: pricedCount })}
        </ToggleGroupItem>
        <ToggleGroupItem value="unpriced" className="rounded-lg text-xs">
          {t("prices.filterUnpriced", { count: unpricedCount })}
        </ToggleGroupItem>
      </ToggleGroup>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-secondary rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          {combinedList.length ? t("prices.noResults") : t("prices.empty")}
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) =>
            item.type === "priced" && item.price ? (
              <div key={item.price.id} className="bg-card rounded-xl shadow-card overflow-hidden">
                <div className="p-3 flex items-center justify-between">
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => setExpandedIngredient(
                      expandedIngredient === item.price!.ingredient_name.toLowerCase()
                        ? null
                        : item.price!.ingredient_name.toLowerCase()
                    )}
                  >
                    <p className="text-sm font-medium text-foreground truncate flex items-center gap-1">
                      {item.price.ingredient_name}
                      {item.price.is_default && (
                        <span className="text-xs text-primary">★</span>
                      )}
                      {expandedIngredient === item.price.ingredient_name.toLowerCase()
                        ? <ChevronUp className="h-3 w-3 text-muted-foreground shrink-0" />
                        : <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
                      }
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {[item.price.brand, item.price.supermarket].filter(Boolean).join(" · ") || t("prices.noDetails")}
                      {item.price.package_size ? ` · ${item.price.package_size} ${item.price.package_unit || ""}` : ""}
                    </p>
                  </button>
                  <div className="flex items-center gap-2 ml-3">
                    <span className="text-sm font-semibold text-foreground tabular-nums whitespace-nowrap">
                      {Number(item.price.price).toFixed(2)} €
                    </span>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => startEdit(item.price!)}>
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
                {expandedIngredient === item.price.ingredient_name.toLowerCase() && (
                  <IngredientRecipesList ingredientName={item.price.ingredient_name} navigate={navigate} />
                )}
              </div>
            ) : (
              <div
                key={`unpriced-${item.name}`}
                className="bg-card/50 rounded-xl border border-dashed border-border overflow-hidden opacity-70"
              >
                <div className="p-3 flex items-center justify-between">
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => setExpandedIngredient(
                      expandedIngredient === item.name ? null : item.name
                    )}
                  >
                    <p className="text-sm font-medium text-foreground truncate flex items-center gap-1">
                      {item.name}
                      {expandedIngredient === item.name
                        ? <ChevronUp className="h-3 w-3 text-muted-foreground shrink-0" />
                        : <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">{t("prices.usedInList")}</p>
                  </button>
                  <div className="flex items-center gap-2 ml-3">
                    <span className="text-xs text-muted-foreground italic whitespace-nowrap">{t("prices.noPrice")}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 rounded-lg text-xs"
                      onClick={() => startAddForIngredient(item.name)}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> {t("prices.add")}
                    </Button>
                  </div>
                </div>
                {expandedIngredient === item.name && (
                  <IngredientRecipesList ingredientName={item.name} navigate={navigate} />
                )}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
