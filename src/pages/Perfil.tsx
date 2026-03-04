import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";

export default function Perfil() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("pizca_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("pizca_user");
    navigate("/login");
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold text-foreground">Perfil</h1>

      <div className="bg-card rounded-xl p-6 shadow-card">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-14 w-14 rounded-full bg-accent flex items-center justify-center">
            <User className="h-7 w-7 text-accent-foreground" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-lg">{user?.name || "Chef"}</p>
            <p className="text-sm text-muted-foreground">{user?.email || ""}</p>
          </div>
        </div>

        <Button variant="outline" className="rounded-lg" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}
