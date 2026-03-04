import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";
import { Constants } from "@/integrations/supabase/types";

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
}

export function IngredientPricesManager({ initialIngredient }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(
    initialIngredient ? { ...emptyForm, ingredient_name: initialIngredient } : emptyForm
  );
  const [showForm, setShowForm] = useState(!!initialIngredient);

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
      toast.success(editingId ? "Precio actualizado" : "Precio añadido");
      resetForm();
    },
    onError: () => toast.error("Error al guardar"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ingredient_prices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredient_prices"] });
      toast.success("Precio eliminado");
    },
    onError: () => toast.error("Error al eliminar"),
  });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
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

  const filtered = (prices || []).filter(
    (p) =>
      !search ||
      p.ingredient_name.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(search.toLowerCase())) ||
      (p.supermarket && p.supermarket.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Mis Precios</p>
        {!showForm && (
          <Button size="sm" className="rounded-lg" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" /> Añadir
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-accent/30 rounded-xl p-4 space-y-3 border border-border">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-xs text-muted-foreground">Ingrediente *</Label>
              <Input
                value={form.ingredient_name}
                onChange={(e) => setForm({ ...form, ingredient_name: e.target.value })}
                className="rounded-lg"
                placeholder="Ej: harina"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Marca</Label>
              <Input
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="rounded-lg"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Supermercado</Label>
              <Input
                value={form.supermarket}
                onChange={(e) => setForm({ ...form, supermarket: e.target.value })}
                className="rounded-lg"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Precio (€) *</Label>
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
              <Label className="text-xs text-muted-foreground">Tamaño envase</Label>
              <Input
                type="number"
                value={form.package_size}
                onChange={(e) => setForm({ ...form, package_size: e.target.value })}
                className="rounded-lg"
                min={0}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Unidad envase</Label>
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
                Precio por defecto
              </label>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" className="rounded-lg" onClick={resetForm}>
              <X className="h-4 w-4 mr-1" /> Cancelar
            </Button>
            <Button
              size="sm"
              className="rounded-lg"
              disabled={!form.ingredient_name.trim() || !form.price || upsert.isPending}
              onClick={() => upsert.mutate(form)}
            >
              <Check className="h-4 w-4 mr-1" /> {editingId ? "Guardar" : "Añadir"}
            </Button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar ingrediente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 rounded-lg"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-secondary rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          {prices?.length ? "Sin resultados" : "No hay precios registrados aún."}
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <div key={p.id} className="bg-card rounded-xl shadow-card p-3 flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">
                  {p.ingredient_name}
                  {p.is_default && (
                    <span className="ml-1.5 text-xs text-primary">★</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {[p.brand, p.supermarket].filter(Boolean).join(" · ") || "Sin detalles"}
                  {p.package_size ? ` · ${p.package_size} ${p.package_unit || ""}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-3">
                <span className="text-sm font-semibold text-foreground tabular-nums whitespace-nowrap">
                  {Number(p.price).toFixed(2)} €
                </span>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => startEdit(p)}>
                  <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                  onClick={() => deleteMutation.mutate(p.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
