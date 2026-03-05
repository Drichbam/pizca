import { Home, BookOpen, Euro, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Inicio", icon: Home },
  { to: "/mis-recetas", label: "Mis Recetas", icon: BookOpen },
  { to: "/mis-precios", label: "Mis Ingredientes", icon: Euro },
  { to: "/perfil", label: "Perfil", icon: User },
];

export function DesktopSidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card min-h-screen p-6">
      {/* Logo */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="text-primary">Pizca</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Tu recetario dulce</p>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="pt-6 border-t border-border">
        <p className="text-xs text-muted-foreground">© 2026 Pizca</p>
      </div>
    </aside>
  );
}
