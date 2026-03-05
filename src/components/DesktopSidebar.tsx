import { Home, BookOpen, Euro, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export function DesktopSidebar() {
  const { t } = useTranslation();

  const navItems = [
    { to: "/", label: t("nav.home"), icon: Home },
    { to: "/mis-recetas", label: t("nav.recipes"), icon: BookOpen },
    { to: "/mis-precios", label: t("nav.ingredients"), icon: Euro },
    { to: "/perfil", label: t("nav.profile"), icon: User },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card min-h-screen p-6">
      {/* Logo */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="text-primary">Pizca</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">{t("auth.tagline")}</p>
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
