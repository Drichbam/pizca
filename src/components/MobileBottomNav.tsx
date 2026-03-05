import { Home, BookOpen, Euro, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export function MobileBottomNav() {
  const { t } = useTranslation();

  const navItems = [
    { to: "/", label: t("nav.home"), icon: Home },
    { to: "/mis-recetas", label: t("nav.recipes"), icon: BookOpen },
    { to: "/mis-precios", label: t("nav.ingredients"), icon: Euro },
    { to: "/perfil", label: t("nav.profile"), icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card border-t border-border shadow-elevated">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
