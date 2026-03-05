import { useOpenPricesProduct } from "@/hooks/useOpenPrices";
import { useTranslation } from "react-i18next";

interface Props {
  barcode: string;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function formatCurrency(amount: number, currency: string): string {
  const symbol = currency === "EUR" ? "€" : currency;
  return `${amount.toFixed(2)} ${symbol}`;
}

export function CommunityPricesPanel({ barcode }: Props) {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useOpenPricesProduct(barcode);

  if (isLoading) {
    return (
      <div className="h-4 bg-secondary rounded animate-pulse w-48" />
    );
  }

  if (isError || !data) return null;

  return (
    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-lg p-3 space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-blue-800 dark:text-blue-200">
          {data.isSpainOnly ? t("community.spainPrices") : t("community.globalPrices")}
        </p>
        <span className="text-xs text-blue-600 dark:text-blue-400">
          {t("community.contributions", { count: data.count })}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 text-xs text-blue-700 dark:text-blue-300">
        <span>{t("community.avgPrice")}</span>
        <span className="font-medium tabular-nums">{formatCurrency(data.avgPrice, data.currency)}</span>
        <span>{t("community.latestPrice")}</span>
        <span className="font-medium tabular-nums">
          {formatCurrency(data.latestPrice, data.currency)}
          <span className="font-normal text-blue-500 dark:text-blue-400 ml-1">({formatDate(data.latestDate)})</span>
        </span>
      </div>
      <p className="text-[10px] text-blue-500 dark:text-blue-400">
        <a
          href="https://prices.openfoodfacts.org"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:no-underline"
        >
          {t("community.attribution")}
        </a>
      </p>
    </div>
  );
}
