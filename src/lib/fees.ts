/**
 * Buyer-paid Paystack fees.
 *
 * DHIVE takes 0%, and the buyer covers Paystack's fee, so the seller receives exactly
 * the listing price. Paystack South Africa, local cards: 2.9% + R1 excluding VAT, with
 * the R1 waived under R10 (https://paystack.com/za/pricing). VAT is 15%.
 *
 * International cards cost slightly more (3.1% + R1); on those the seller nets a few
 * rand less. Update these constants if Paystack's pricing changes.
 */
export const PAYSTACK_ZA = {
  percent: 0.029,
  flatCents: 100,
  flatWaivedBelowCents: 1000,
  vat: 0.15,
} as const;

/** Paystack's fee (incl. VAT) on a charge of `amountCents`, in cents, rounded up. */
export function paystackFeeCents(amountCents: number, p = PAYSTACK_ZA): number {
  if (amountCents <= 0) return 0;
  const flat = amountCents < p.flatWaivedBelowCents ? 0 : p.flatCents;
  return Math.ceil((amountCents * p.percent + flat) * (1 + p.vat));
}

export type Checkout = {
  /** What the seller receives (the listing price). */
  priceCents: number;
  /** Service fee shown to the buyer (covers Paystack incl. VAT). */
  feeCents: number;
  /** What the buyer is charged. */
  totalCents: number;
};

/**
 * Smallest total such that total − Paystack fee(total) ≥ price, so the seller nets the
 * full price. Starts from the closed-form estimate and steps up to absorb rounding.
 */
export function checkoutFor(priceCents: number, p = PAYSTACK_ZA): Checkout {
  if (!Number.isInteger(priceCents) || priceCents < 0) throw new Error(`invalid price: ${priceCents}`);
  if (priceCents === 0) return { priceCents: 0, feeCents: 0, totalCents: 0 };

  const rate = p.percent * (1 + p.vat);
  let total = Math.floor((priceCents + p.flatCents * (1 + p.vat)) / (1 - rate));
  // The estimate assumes the flat fee applies; under R10 it may overshoot, so walk down first.
  while (total - 1 >= priceCents && total - 1 - paystackFeeCents(total - 1, p) >= priceCents) total -= 1;
  while (total - paystackFeeCents(total, p) < priceCents) total += 1;

  return { priceCents, feeCents: total - priceCents, totalCents: total };
}
