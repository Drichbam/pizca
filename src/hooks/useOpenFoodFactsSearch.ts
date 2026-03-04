import { useQuery } from "@tanstack/react-query";

export interface OFFSearchResult {
  barcode: string;
  name: string;
  brand: string;
}

async function searchOpenFoodFacts(query: string): Promise<OFFSearchResult[]> {
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&json=1&page_size=5&fields=code,product_name,brands`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Pizca/1.0 (reposteria app)" },
  });
  if (!res.ok) throw new Error("Error al buscar en Open Food Facts");

  const data = await res.json();
  const products = data.products || [];

  return products
    .filter((p: any) => p.code && p.product_name)
    .map((p: any) => ({
      barcode: p.code,
      name: p.product_name,
      brand: p.brands ? p.brands.split(",")[0].trim() : "",
    }));
}

export function useOpenFoodFactsSearch(query: string, enabled: boolean) {
  return useQuery({
    queryKey: ["off_search", query],
    queryFn: () => searchOpenFoodFacts(query),
    enabled: enabled && query.length >= 3,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}
