import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function Crear() {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [ingredientes, setIngredientes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("¡Receta guardada! (demo)");
    setTitulo("");
    setDescripcion("");
    setIngredientes("");
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
          <Label htmlFor="descripcion">Instrucciones</Label>
          <Textarea
            id="descripcion"
            placeholder="Describe los pasos..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={6}
            className="rounded-sm"
          />
        </div>

        <Button type="submit" className="rounded-lg" size="lg">
          Guardar receta
        </Button>
      </form>
    </div>
  );
}
