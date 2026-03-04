import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Barcode, Loader2, AlertCircle } from "lucide-react";
import { useOpenFoodFactsProduct, type OpenFoodFactsProduct } from "@/hooks/useOpenFoodFacts";
import { toast } from "sonner";

interface Props {
  onProductFound: (product: OpenFoodFactsProduct & { barcode: string }) => void;
}

export function BarcodeSearchField({ onProductFound }: Props) {
  const [barcodeInput, setBarcodeInput] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [showError, setShowError] = useState(false);

  const { data: product, isLoading, isError, error } = useOpenFoodFactsProduct(barcodeInput);

  const handleSearch = () => {
    if (!barcodeInput.trim()) {
      toast.error("Por favor introduce un código de barras");
      return;
    }

    if (barcodeInput.length < 8) {
      toast.error("El código debe tener al menos 8 dígitos");
      return;
    }

    setHasSearched(true);
    setShowError(false);
  };

  const handleClear = () => {
    setBarcodeInput("");
    setHasSearched(false);
    setShowError(false);
  };

  // Handle successful product fetch
  if (product && hasSearched && !isLoading) {
    const productWithBarcode = { ...product, barcode: barcodeInput };
    onProductFound(productWithBarcode);
    handleClear();
  }

  // Handle error
  if (isError && hasSearched && !isLoading) {
    if (!showError) {
      setShowError(true);
      toast.error(
        error?.message || "No se encontró el producto. Puedes continuar completando manualmente."
      );
    }
  }

  return (
    <div className="space-y-3 pb-3 border-b border-border">
      <div className="flex gap-2">
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground">Código de barras (opcional)</Label>
          <Input
            placeholder="Ej: 5000159484509"
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            disabled={isLoading || hasSearched}
            className="rounded-lg font-mono text-sm"
          />
        </div>
        <div className="flex items-end gap-2">
          {!hasSearched ? (
            <Button
              size="sm"
              variant="outline"
              onClick={handleSearch}
              disabled={!barcodeInput.trim() || isLoading}
              className="rounded-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Buscando...
                </>
              ) : (
                <>
                  <Barcode className="h-4 w-4 mr-1" /> Buscar
                </>
              )}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClear}
              className="rounded-lg"
            >
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Success message */}
      {product && hasSearched && !isLoading && (
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 rounded-lg p-2">
          <p className="text-xs text-green-700 dark:text-green-300">
            ✓ Datos completados: <strong>{product.name}</strong>
            {product.brand && ` (${product.brand})`}
          </p>
        </div>
      )}

      {/* Error state with option to continue manually */}
      {showError && isError && (
        <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50 rounded-lg p-2 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-orange-700 dark:text-orange-300">
              {error?.message || "No se encontró el producto"}
            </p>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              Puedes{" "}
              <button
                onClick={handleClear}
                className="underline hover:no-underline font-medium"
              >
                continuar completando manualmente
              </button>
              .
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
