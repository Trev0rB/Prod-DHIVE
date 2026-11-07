const zar = new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 });

/** Format a price in cents. v1 is rand-only (Paystack South Africa settles in ZAR). */
export function formatPrice(priceCents: number): string {
  if (priceCents === 0) return "Free";
  // Intl uses a non-breaking space for en-ZA; normalise so "R 2 500" renders predictably.
  return zar.format(priceCents / 100).replace(/ /g, " ");
}

const zarExact = new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", minimumFractionDigits: 2 });

/** Exact amount with cents, e.g. "R 2 587,45". Used for checkout totals and receipts. */
export function formatAmount(cents: number): string {
  return zarExact.format(cents / 100).replace(/ /g, " ");
}
