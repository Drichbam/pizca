import { useQuery } from "@tanstack/react-query";

export interface OpenFoodFactsProduct {
  name: string;
  brand: string;
  package_size: number | null;
  package_unit: string;
}

// Parse quantity string like "500g", "1.5l", "250 ml" to {size, unit}
function parseQuantity(quantity: string | null): { size: number | null; unit: string } {
  if (!quantity) return { size: null, unit: "g" };

  // Remove spaces and convert to lowercase
  const q = (quantity as string).trim().toLowerCase();

  // Try to match number and unit (e.g., "500g", "1.5 ml")
  const match = q.match(/^([\d.,]+)\s*([a-z%]+)?$/);
  if (!match) return { size: null, unit: "g" };

  const sizeStr = match[1].replace(",", ".");
  const size = parseFloat(sizeStr);
  const unit = (match[2] || "g").replace(/s$/, ""); // Remove plural 's'

  // Normalize units
  const unitMap: Record<string, string> = {
    "ml": "ml",
    "l": "l",
    "g": "g",
    "kg": "kg",
    "mg": "mg",
    "oz": "oz",
    "lb": "lb",
  };

  const normalizedUnit = unitMap[unit] || unit || "g";
  return { size: isNaN(size) ? null : size, unit: normalizedUnit };
}

// Fetch product from Open Food Facts API
async function fetchOpenFoodFactsProduct(
  barcode: string
): Promise<OpenFoodFactsProduct> {
  const response = await fetch(
    `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`,
    { headers: { "Accept": "application/json" } }
  );

  if (!response.ok) {
    throw new Error(
      response.status === 404
        ? "Producto no encontrado en Open Food Facts"
        : "Error al consultar Open Food Facts"
    );
  }

  const data = await response.json();
  if (!data.product) {
    throw new Error("Producto no encontrado en Open Food Facts");
  }

  const product = data.product;

  // Extract name
  const name = product.product_name || product.name || "";
  if (!name) {
    throw new Error("El producto no tiene nombre en Open Food Facts");
  }

  // Extract brand (handle both string and array)
  let brand = "";
  if (product.brands) {
    brand = typeof product.brands === "string" ? product.brands : product.brands.split(",")[0];
    brand = brand.trim();
  }

  // Parse quantity
  const { size: package_size, unit: package_unit } = parseQuantity(product.quantity);

  return {
    name: name.trim(),
    brand: brand.trim(),
    package_size,
    package_unit,
  };
}

export function useOpenFoodFactsProduct(barcode: string) {
  return useQuery({
    queryKey: ["open_food_facts_product", barcode],
    queryFn: () => fetchOpenFoodFactsProduct(barcode),
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    enabled: !!barcode && barcode.length >= 8, // Only fetch if barcode has minimum length
    retry: 1,
  });
}
