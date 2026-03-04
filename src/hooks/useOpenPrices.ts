import { useQuery } from "@tanstack/react-query";

export interface OpenPricesSummary {
  count: number;
  avgPrice: number;
  latestPrice: number;
  latestDate: string;
  currency: string;
  isSpainOnly: boolean;
}

interface OpenPricesItem {
  price: number;
  currency: string;
  date: string;
  osm_address_country_code: string | null;
}

interface OpenPricesResponse {
  items: OpenPricesItem[];
  total: number;
}

async function fetchOpenPrices(barcode: string): Promise<OpenPricesSummary> {
  const url = `https://prices.openfoodfacts.org/api/v1/prices?product_code=${barcode}&size=100&order_by=-date`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Pizca/1.0 (reposteria app)",
    },
  });
  if (!res.ok) throw new Error("Open Prices API error");

  const json: OpenPricesResponse = await res.json();
  const all = (json.items || []).filter((i) => i.price != null && i.price > 0);

  const esItems = all.filter((i) => i.osm_address_country_code === "ES");
  const items = esItems.length >= 2 ? esItems : all;
  const isSpainOnly = esItems.length >= 2;

  if (items.length === 0) throw new Error("No prices found");

  const avgPrice = items.reduce((sum, i) => sum + i.price, 0) / items.length;
  const latest = items[0];

  return {
    count: items.length,
    avgPrice,
    latestPrice: latest.price,
    latestDate: latest.date,
    currency: latest.currency || "EUR",
    isSpainOnly,
  };
}

export function useOpenPricesProduct(barcode: string) {
  return useQuery({
    queryKey: ["open_prices", barcode],
    queryFn: () => fetchOpenPrices(barcode),
    enabled: barcode.length >= 8,
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });
}
