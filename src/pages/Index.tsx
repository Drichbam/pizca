import { useNavigate } from "react-router-dom";
import { BookOpen, Euro, ChefHat, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Chef";

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("greeting.morning");
    if (hour < 18) return t("greeting.afternoon");
    return t("greeting.evening");
  };

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {greeting()}, <span className="text-primary">{userName}</span> 👋
        </h1>
        <p className="text-muted-foreground mt-1">{t("index.question")}</p>
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
          <h3 className="font-semibold text-foreground text-lg">{t("index.myRecipes")}</h3>
          <p className="text-sm text-muted-foreground mt-1">{t("index.myRecipesDesc")}</p>
        </button>

        <button
          onClick={() => navigate("/mis-precios")}
          className="bg-card rounded-xl p-6 shadow-card hover:shadow-elevated transition-shadow text-left group"
        >
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Euro className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground text-lg">{t("index.myIngredients")}</h3>
          <p className="text-sm text-muted-foreground mt-1">{t("index.myIngredientsDesc")}</p>
        </button>
      </div>


      <div>
        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          {t("index.recentActivity")}
        </h2>
        <div className="bg-background-alt rounded-xl p-8 text-center">
          <p className="text-sm text-muted-foreground">
            {t("index.noActivity")}
          </p>
        </div>
      </div>
    </div>
  );
}
