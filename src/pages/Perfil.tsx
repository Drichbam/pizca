import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { TagsManager } from "@/components/profile/TagsManager";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";

const LANGUAGES = [
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

export default function Perfil() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("pizca-lang", lang);
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Chef";

  return (
    <div className="animate-fade-in space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold text-foreground">{t("profile.title")}</h1>

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
          {t("profile.logout")}
        </Button>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-card">
        <p className="text-sm font-medium text-foreground mb-3">{t("profile.languageLabel")}</p>
        <div className="flex gap-2 flex-wrap">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                i18n.language === lang.code
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-card">
        <TagsManager />
      </div>
    </div>
  );
}
