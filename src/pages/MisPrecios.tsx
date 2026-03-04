import { IngredientPricesManager } from "@/components/profile/IngredientPricesManager";

export default function MisPrecios() {
  return (
    <div className="animate-fade-in space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground">Mis Precios</h1>
      <div className="bg-card rounded-xl p-6 shadow-card">
        <IngredientPricesManager />
      </div>
    </div>
  );
}
