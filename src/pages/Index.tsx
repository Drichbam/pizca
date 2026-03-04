import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, PlusCircle, ChefHat, Clock } from "lucide-react";

export default function Index() {
  const [userName, setUserName] = useState("Chef");
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("pizca_user");
    if (!stored) {
      navigate("/login");
      return;
    }
    const user = JSON.parse(stored);
    setUserName(user.name || "Chef");
  }, [navigate]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  return (
    <div className="animate-fade-in space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {greeting()}, <span className="text-primary">{userName}</span> 👋
        </h1>
        <p className="text-muted-foreground mt-1">¿Qué vamos a hornear hoy?</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => navigate("/mis-recetas")}
          className="bg-card rounded-xl p-6 shadow-card hover:shadow-elevated transition-shadow text-left group"
        >
          <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <BookOpen className="h-6 w-6 text-accent-foreground" />
          </div>
          <h3 className="font-semibold text-foreground text-lg">Mis Recetas</h3>
          <p className="text-sm text-muted-foreground mt-1">Explora tu colección de recetas guardadas</p>
        </button>

        <button
          onClick={() => navigate("/crear")}
          className="bg-card rounded-xl p-6 shadow-card hover:shadow-elevated transition-shadow text-left group"
        >
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <PlusCircle className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground text-lg">Crear Receta</h3>
          <p className="text-sm text-muted-foreground mt-1">Añade una nueva receta a tu colección</p>
        </button>
      </div>

      {/* Tips section */}
      <div className="bg-card rounded-xl p-6 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <ChefHat className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">Tip del día</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Para un bizcocho más esponjoso, asegúrate de tamizar la harina y de que los huevos
          estén a temperatura ambiente antes de mezclar.
        </p>
      </div>

      {/* Recent activity placeholder */}
      <div>
        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          Actividad reciente
        </h2>
        <div className="bg-background-alt rounded-xl p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Aún no tienes actividad. ¡Empieza creando tu primera receta!
          </p>
        </div>
      </div>
    </div>
  );
}
