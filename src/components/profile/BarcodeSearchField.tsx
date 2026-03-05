import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Barcode, Loader2, AlertCircle, Camera } from "lucide-react";
import { useOpenFoodFactsProduct, type OpenFoodFactsProduct } from "@/hooks/useOpenFoodFacts";
import { BarcodeScannerDialog } from "@/components/BarcodeScannerDialog";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface Props {
  onProductFound: (product: OpenFoodFactsProduct & { barcode: string }) => void;
}

export function BarcodeSearchField({ onProductFound }: Props) {
  const { t } = useTranslation();
  const [barcodeInput, setBarcodeInput] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [showError, setShowError] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const { data: product, isLoading, isError, error } = useOpenFoodFactsProduct(barcodeInput);

  const handleSearch = () => {
    if (!barcodeInput.trim()) {
      toast.error(t("barcode.errorRequired"));
      return;
    }

    if (barcodeInput.length < 8) {
      toast.error(t("barcode.errorMinLength"));
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

  const handleScan = (barcode: string) => {
    setBarcodeInput(barcode);
    setHasSearched(true);
    setShowError(false);
  };

  if (product && hasSearched && !isLoading) {
    const productWithBarcode = { ...product, barcode: barcodeInput };
    onProductFound(productWithBarcode);
    handleClear();
  }

  if (isError && hasSearched && !isLoading) {
    if (!showError) {
      setShowError(true);
      toast.error(
        error?.message || t("barcode.errorStart")
      );
    }
  }

  return (
    <div className="space-y-3 pb-3 border-b border-border">
      <div className="flex gap-2">
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground">{t("barcode.label")}</Label>
          <Input
            placeholder={t("barcode.placeholder")}
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            disabled={isLoading || hasSearched}
            className="rounded-lg font-mono text-sm"
          />
        </div>
        <div className="flex items-end gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setScannerOpen(true)}
            disabled={isLoading || hasSearched}
            className="rounded-lg"
            title={t("barcode.scanTitle")}
          >
            <Camera className="h-4 w-4" />
          </Button>
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
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" /> {t("barcode.searching")}
                </>
              ) : (
                <>
                  <Barcode className="h-4 w-4 mr-1" /> {t("barcode.search")}
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
              {t("barcode.clear")}
            </Button>
          )}
        </div>
      </div>

      {product && hasSearched && !isLoading && (
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 rounded-lg p-2">
          <p className="text-xs text-green-700 dark:text-green-300">
            {t("barcode.dataCompleted")} <strong>{product.name}</strong>
            {product.brand && ` (${product.brand})`}
          </p>
        </div>
      )}

      {showError && isError && (
        <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50 rounded-lg p-2 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-orange-700 dark:text-orange-300">
              {error?.message || t("barcode.errorStart")}
            </p>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              {t("barcode.canContinue")}{" "}
              <button
                onClick={handleClear}
                className="underline hover:no-underline font-medium"
              >
                {t("barcode.continueManually")}
              </button>
              .
            </p>
          </div>
        </div>
      )}

      <BarcodeScannerDialog
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleScan}
      />
    </div>
  );
}
