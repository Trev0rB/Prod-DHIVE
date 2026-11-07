import { describe, expect, it } from "vitest";
import { checkoutFor, paystackFeeCents } from "./fees";

describe("paystackFeeCents", () => {
  it("matches Paystack ZA pricing incl. VAT", () => {
    // R1000: (2.9% of R1000 + R1) = R30, + 15% VAT = R34.50
    expect(paystackFeeCents(100_000)).toBe(3_450);
  });
  it("waives the R1 flat fee under R10", () => {
    // R5: 2.9% = 14.5c, + VAT = 16.675c → 17c
    expect(paystackFeeCents(500)).toBe(17);
  });
  it("is zero for zero", () => {
    expect(paystackFeeCents(0)).toBe(0);
  });
});

describe("checkoutFor", () => {
  it("is free for free listings", () => {
    expect(checkoutFor(0)).toEqual({ priceCents: 0, feeCents: 0, totalCents: 0 });
  });

  it("grosses up so the seller nets at least the full price, by at most 1c", () => {
    for (const price of [100, 500, 999, 1_000, 4_900, 49_900, 129_999, 250_000, 9_999_999]) {
      const { totalCents, feeCents } = checkoutFor(price);
      const sellerNet = totalCents - paystackFeeCents(totalCents);
      expect(sellerNet).toBeGreaterThanOrEqual(price);
      expect(sellerNet - price).toBeLessThanOrEqual(1);
      // And it's the smallest such total.
      expect(totalCents - 1 - paystackFeeCents(totalCents - 1)).toBeLessThan(price);
      expect(feeCents).toBe(totalCents - price);
    }
  });

  it("gives sensible numbers for a typical R499 listing", () => {
    const c = checkoutFor(49_900);
    expect(c.feeCents).toBeGreaterThan(1_500);
    expect(c).toEqual({ priceCents: 49_900, feeCents: 1_841, totalCents: 51_741 }); // R18.41 fee, verified by hand
  });

  it("rejects bad input", () => {
    expect(() => checkoutFor(-1)).toThrow();
    expect(() => checkoutFor(1.5)).toThrow();
  });
});
