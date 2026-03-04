import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Constants } from "@/integrations/supabase/types";

const categories = Constants.public.Enums.recipe_category;
const difficulties = Constants.public.Enums.recipe_difficulty;

export default function Crear() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [category, setCategory] = useState<string>("autre");
  const [difficulty, setDifficulty] = useState<string>("basico");
  const [ingredientes, setIngredientes] = useState("");
  const [instrucciones, setInstrucciones] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const slug = `${titulo.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "")}-${Date.now()}`;

      // Insert recipe
      const { data: recipe, error } = await supabase
        .from("recipes")
        .insert({
          user_id: user.id,
          title: titulo,
          slug,
          description: descripcion || null,
          category: category as any,
          difficulty: difficulty as any,
        })
        .select()
        .single();

      if (error) throw error;

      // Insert a default component with ingredients and steps
      const ingredientLines = ingredientes.split("\n").filter((l) => l.trim());
      const stepLines = instrucciones.split("\n").filter((l) => l.trim());

      if (ingredientLines.length || stepLines.length) {
        const { data: comp, error: compErr } = await supabase
          .from("recipe_components")
          .insert({ recipe_id: recipe.id, name: "Principal", sort_order: 0 })
          .select()
          .single();

        if (compErr) throw compErr;

        if (ingredientLines.length) {
          await supabase.from("recipe_ingredients").insert(
            ingredientLines.map((line, i) => ({
              component_id: comp.id,
              name: line.trim(),
              sort_order: i,
            }))
          );
        }

        if (stepLines.length) {
          await supabase.from("recipe_steps").insert(
            stepLines.map((line, i) => ({
              component_id: comp.id,
              description: line.trim(),
              step_order: i,
            }))
          );
        }
      }

      toast.success("¡Receta guardada!");
      navigate(`/receta/${recipe.id}`);
    } catch (err: any) {
      toast.error(err.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Crear Receta</h1>
        <p className="text-muted-foreground mt-1">Añade una nueva receta a tu colección</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-card rounded-xl p-6 md:p-8 shadow-card space-y-5">
        <div className="space-y-2">
          <Label htmlFor="titulo">Nombre de la receta</Label>
          <Input
            id="titulo"
            placeholder="Ej: Tarta de chocolate"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            className="rounded-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Categoría</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="rounded-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Dificultad</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="rounded-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="descripcion">Descripción (opcional)</Label>
          <Input
            id="descripcion"
            placeholder="Una breve descripción..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="rounded-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ingredientes">Ingredientes</Label>
          <Textarea
            id="ingredientes"
            placeholder="Un ingrediente por línea..."
            value={ingredientes}
            onChange={(e) => setIngredientes(e.target.value)}
            rows={4}
            className="rounded-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instrucciones">Instrucciones</Label>
          <Textarea
            id="instrucciones"
            placeholder="Un paso por línea..."
            value={instrucciones}
            onChange={(e) => setInstrucciones(e.target.value)}
            rows={6}
            className="rounded-sm"
          />
        </div>

        <Button type="submit" className="rounded-lg" size="lg" disabled={loading}>
          {loading ? "Guardando..." : "Guardar receta"}
        </Button>
      </form>
    </div>
  );
}
