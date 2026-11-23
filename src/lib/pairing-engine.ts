import { DEMO_PRODUCTS } from "./demo-data";
import { CoPurchaseStat, Product } from "./types";

export interface SmartPairingResult {
  product: Product;
  matchRate: number;
  orderCount: number;
  reason: string;
}

/**
 * Data-driven Smart Pairing Engine.
 * Selects the highest-demand companion product based on co-purchase frequency
 * and guest preference data (never random), excluding items already in the cart
 * when possible.
 */
export function getDataDrivenPairing(
  sourceProduct: Product | null,
  cartProductIds: string[] = []
): SmartPairingResult | null {
  if (!sourceProduct) return null;

  const stats: CoPurchaseStat[] = sourceProduct.co_purchase_stats ?? [];
  if (stats.length === 0) return null;

  // Sort deterministically by match_rate descending, then order_count descending
  const sorted = [...stats].sort((a, b) => {
    if (b.match_rate !== a.match_rate) return b.match_rate - a.match_rate;
    return b.order_count - a.order_count;
  });

  // Prefer the top-ranked companion not already in the cart; fallback to top-ranked
  const preferred =
    sorted.find((s) => !cartProductIds.includes(s.product_id)) ?? sorted[0];

  const matchedProduct = DEMO_PRODUCTS.find(
    (p) => p.id === preferred.product_id
  );
  if (!matchedProduct) return null;

  return {
    product: matchedProduct,
    matchRate: preferred.match_rate,
    orderCount: preferred.order_count,
    reason: preferred.reason,
  };
}
