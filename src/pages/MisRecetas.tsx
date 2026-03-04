import { BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function MisRecetas() {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mis Recetas</h1>
        <p className="text-muted-foreground mt-1">Tu colección personal de recetas</p>
      </div>

      {/* Empty state */}
      <div className="bg-card rounded-xl p-12 shadow-card text-center">
        <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
          <BookOpen className="h-8 w-8 text-accent-foreground" />
        </div>
        <h3 className="font-semibold text-foreground text-lg mb-2">Sin recetas aún</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
          Empieza a crear tu colección de recetas favoritas de repostería.
        </p>
        <Button onClick={() => navigate("/crear")} className="rounded-lg">
          Crear mi primera receta
        </Button>
      </div>
    </div>
  );
}
