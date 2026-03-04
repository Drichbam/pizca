import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOpenFoodFactsSearch } from "@/hooks/useOpenFoodFactsSearch";
import { useOpenPricesProduct } from "@/hooks/useOpenPrices";
import type { OFFSearchResult } from "@/hooks/useOpenFoodFactsSearch";

interface Props {
  ingredientName: string;
}

export function IngredientPriceSearchPanel({ ingredientName }: Props) {
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    setTriggered(false);
  }, [ingredientName]);

  const { data: results, isLoading } = useOpenFoodFactsSearch(ingredientName, triggered);

  if (ingredientName.length < 3) return null;

  if (!triggered) {
    return (
      <div className="mt-1.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-muted-foreground rounded-lg"
          onClick={() => setTriggered(true)}
        >
          <Search className="h-3 w-3 mr-1" /> Buscar precios comunitarios
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-2 rounded-lg border border-border bg-background p-3 space-y-1">
      {isLoading ? (
        <div className="flex items-center gap-2 py-1 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Buscando productos…
        </div>
      ) : !results?.length ? (
        <p className="text-xs text-muted-foreground py-1">Sin resultados en Open Food Facts</p>
      ) : (
        <ResultRows results={results} />
      )}
      <p className="text-[10px] text-muted-foreground pt-1 border-t border-border">
        <a
          href="https://prices.openfoodfacts.org"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Datos de Open Prices (ODbL)
        </a>
      </p>
    </div>
  );
}

function ResultRows({ results }: { results: OFFSearchResult[] }) {
  const [resolved, setResolved] = useState<Record<string, boolean>>({});

  const allResolved = results.every((r) => r.barcode in resolved);
  const anyData = Object.values(resolved).some(Boolean);

  const handleResolved = (barcode: string, hasData: boolean) => {
    setResolved((prev) => ({ ...prev, [barcode]: hasData }));
  };

  return (
    <>
      {results.map((r) => (
        <PriceRowTracked key={r.barcode} result={r} onResolved={handleResolved} />
      ))}
      {allResolved && !anyData && (
        <p className="text-xs text-muted-foreground py-1">Sin datos de precio para este ingrediente</p>
      )}
    </>
  );
}

function PriceRowTracked({
  result,
  onResolved,
}: {
  result: OFFSearchResult;
  onResolved: (barcode: string, hasData: boolean) => void;
}) {
  const { data, isLoading, isError } = useOpenPricesProduct(result.barcode);

  useEffect(() => {
    if (!isLoading) {
      onResolved(result.barcode, !!data && !isError);
    }
  }, [isLoading, data, isError, result.barcode, onResolved]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-1 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin shrink-0" />
        <span className="truncate">{result.name}</span>
      </div>
    );
  }

  if (isError || !data) return null;

  return (
    <div className="py-1 text-xs">
      <span className="font-medium text-foreground">{result.name}</span>
      {result.brand && <span className="text-muted-foreground"> ({result.brand})</span>}
      <span className="text-muted-foreground">
        {" — "}
        <span className="text-foreground font-semibold">{data.avgPrice.toFixed(2)} €</span>
        {" avg · "}
        {data.count} contribucione{data.count !== 1 ? "s" : ""}
        {data.isSpainOnly && " 🇪🇸"}
      </span>
    </div>
  );
}
