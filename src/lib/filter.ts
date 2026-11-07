import type { PriceBand, Product, ProductQuery, SortKey } from "./types";

const SORTS: SortKey[] = ["newest", "price-asc", "price-desc"];
const BANDS: PriceBand[] = ["free", "under-500", "500-2000", "over-2000"];

/** Price band bounds in cents, [min, max). */
export const PRICE_BANDS: Record<PriceBand, { label: string; min: number; max: number | null }> = {
  free: { label: "Free", min: 0, max: 1 },
  "under-500": { label: "Under R500", min: 1, max: 50_000 },
  "500-2000": { label: "R500 – R2 000", min: 50_000, max: 200_000 },
  "over-2000": { label: "R2 000+", min: 200_000, max: null },
};

/** Turn raw URL search params into a validated query. Unknown values are dropped. */
export function parseQuery(params: Record<string, string | string[] | undefined>): ProductQuery {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
  const q = one(params.q)?.slice(0, 100);
  const category = one(params.category);
  const price = one(params.price) as PriceBand | undefined;
  const sort = one(params.sort) as SortKey | undefined;
  return {
    q,
    category: category && /^[a-z0-9-]+$/.test(category) ? category : undefined,
    price: price && BANDS.includes(price) ? price : undefined,
    sort: sort && SORTS.includes(sort) ? sort : undefined,
  };
}

/** In-memory filtering, used for the demo catalog (Supabase does the same in SQL). */
export function filterProducts(products: Product[], query: ProductQuery): Product[] {
  const terms = query.q?.toLowerCase().split(/\s+/).filter(Boolean) ?? [];
  const band = query.price ? PRICE_BANDS[query.price] : null;

  const result = products.filter((p) => {
    if (query.category && p.categorySlug !== query.category) return false;
    if (band && (p.priceCents < band.min || (band.max !== null && p.priceCents >= band.max))) return false;
    if (terms.length) {
      const haystack = `${p.title} ${p.summary} ${p.description} ${p.integrations.join(" ")}`.toLowerCase();
      if (!terms.every((t) => haystack.includes(t))) return false;
    }
    return true;
  });

  return sortProducts(result, query.sort ?? "newest");
}

export function sortProducts(products: Product[], sort: SortKey): Product[] {
  const copy = [...products];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.priceCents - b.priceCents);
    case "price-desc":
      return copy.sort((a, b) => b.priceCents - a.priceCents);
    default:
      // Featured listings first, then newest.
      return copy.sort(
        (a, b) => Number(b.featured) - Number(a.featured) || b.createdAt.localeCompare(a.createdAt),
      );
  }
}
