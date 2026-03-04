import { IngredientPricesManager } from "@/components/profile/IngredientPricesManager";
import { useSearchParams } from "react-router-dom";

export default function MisPrecios() {
  const [searchParams] = useSearchParams();
  const initialBarcode = searchParams.get("barcode") || undefined;

  return (
    <div className="animate-fade-in space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground">Mis Ingredientes</h1>
      <div className="bg-card rounded-xl p-6 shadow-card">
        <IngredientPricesManager initialBarcode={initialBarcode} />
      </div>
    </div>
  );
}
