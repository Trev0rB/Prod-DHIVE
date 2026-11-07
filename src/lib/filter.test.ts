import { describe, expect, it } from "vitest";
import { DEMO_PRODUCTS } from "./demo-data";
import { filterProducts, parseQuery } from "./filter";
import { formatPrice } from "./format";

describe("parseQuery", () => {
  it("keeps valid values and drops junk", () => {
    expect(parseQuery({ q: "  chatbot ", category: "ai-automation", price: "free", sort: "price-asc" })).toEqual({
      q: "chatbot",
      category: "ai-automation",
      price: "free",
      sort: "price-asc",
    });
    expect(parseQuery({ category: "x'; drop", price: "cheap", sort: "random" })).toEqual({
      q: undefined,
      category: undefined,
      price: undefined,
      sort: undefined,
    });
  });

  it("takes the first value of repeated params", () => {
    expect(parseQuery({ q: ["a", "b"] }).q).toBe("a");
  });
});

describe("filterProducts", () => {
  it("filters by category", () => {
    const out = filterProducts(DEMO_PRODUCTS, { category: "templates" });
    expect(out.length).toBeGreaterThan(0);
    expect(out.every((p) => p.categorySlug === "templates")).toBe(true);
  });

  it("filters by price band", () => {
    expect(filterProducts(DEMO_PRODUCTS, { price: "free" }).every((p) => p.priceCents === 0)).toBe(true);
    const mid = filterProducts(DEMO_PRODUCTS, { price: "500-2000" });
    expect(mid.every((p) => p.priceCents >= 50_000 && p.priceCents < 200_000)).toBe(true);
  });

  it("matches every search term, case-insensitively", () => {
    const out = filterProducts(DEMO_PRODUCTS, { q: "WHATSAPP lead" });
    expect(out.map((p) => p.slug)).toContain("lead-generation-chatbot");
    expect(filterProducts(DEMO_PRODUCTS, { q: "zzznotathing" })).toEqual([]);
  });

  it("sorts by price both ways and puts featured first by default", () => {
    const asc = filterProducts(DEMO_PRODUCTS, { sort: "price-asc" }).map((p) => p.priceCents);
    expect(asc).toEqual([...asc].sort((a, b) => a - b));
    const desc = filterProducts(DEMO_PRODUCTS, { sort: "price-desc" }).map((p) => p.priceCents);
    expect(desc).toEqual([...desc].sort((a, b) => b - a));
    const def = filterProducts(DEMO_PRODUCTS, {});
    const firstUnfeatured = def.findIndex((p) => !p.featured);
    expect(def.slice(firstUnfeatured).some((p) => p.featured)).toBe(false);
  });

  it("does not mutate its input", () => {
    const before = DEMO_PRODUCTS.map((p) => p.id);
    filterProducts(DEMO_PRODUCTS, { sort: "price-desc" });
    expect(DEMO_PRODUCTS.map((p) => p.id)).toEqual(before);
  });
});

describe("formatPrice", () => {
  it("formats rand and free", () => {
    expect(formatPrice(0)).toBe("Free");
    expect(formatPrice(250_000)).toMatch(/^R\s?2[\s,]500$/);
  });
});

describe("demo catalog", () => {
  it("is rand-only, keeps featured placements scarce, and has unique slugs", () => {
    expect(DEMO_PRODUCTS.every((p) => p.currency === "ZAR")).toBe(true);
    expect(DEMO_PRODUCTS.filter((p) => p.featured).length).toBeLessThanOrEqual(4);
    expect(new Set(DEMO_PRODUCTS.map((p) => p.slug)).size).toBe(DEMO_PRODUCTS.length);
  });
});

describe("formatAmount", () => {
  it("shows cents in the en-ZA style", async () => {
    const { formatAmount } = await import("./format");
    expect(formatAmount(258_745)).toMatch(/^R\s?2[\s ]587[,.]45$/);
    expect(formatAmount(1_841)).toMatch(/^R\s?18[,.]41$/);
  });
});
