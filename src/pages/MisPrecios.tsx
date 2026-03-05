import { IngredientPricesManager } from "@/components/profile/IngredientPricesManager";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function MisPrecios() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialBarcode = searchParams.get("barcode") || undefined;

  return (
    <div className="animate-fade-in space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground">{t("nav.ingredients")}</h1>
      <div className="bg-card rounded-xl p-6 shadow-card">
        <IngredientPricesManager initialBarcode={initialBarcode} />
      </div>
    </div>
  );
}
