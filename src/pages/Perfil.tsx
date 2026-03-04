import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";


export default function Perfil() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Chef";

  return (
    <div className="animate-fade-in space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold text-foreground">Perfil</h1>

      <div className="bg-card rounded-xl p-6 shadow-card">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-14 w-14 rounded-full bg-accent flex items-center justify-center overflow-hidden">
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <User className="h-7 w-7 text-accent-foreground" />
            )}
          </div>
          <div>
            <p className="font-semibold text-foreground text-lg">{displayName}</p>
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
