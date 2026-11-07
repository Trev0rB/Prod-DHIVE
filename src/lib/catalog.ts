import { cacheLife, cacheTag } from "next/cache";
import { DEMO_CATEGORIES, DEMO_PRODUCTS } from "./demo-data";
import { filterProducts, PRICE_BANDS } from "./filter";
import { hasSupabase, publicClient } from "./supabase/public";
import type { Category, Product, ProductQuery } from "./types";

// Public catalog reads. Cached and tagged so seller edits can call
// revalidateTag("products") once listing management lands.

type ProductRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  category_slug: string;
  price_cents: number;
  currency: "ZAR";
  icon: string;
  image_url: string | null;
  integrations: string[];
  featured_until: string | null;
  created_at: string;
  seller: { display_name: string } | null;
};

const PRODUCT_COLUMNS =
  "id, slug, title, summary, description, category_slug, price_cents, currency, icon, image_url, integrations, featured_until, created_at, seller:profiles!products_seller_id_fkey(display_name)";

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    description: row.description,
    categorySlug: row.category_slug,
    priceCents: row.price_cents,
    currency: row.currency,
    icon: row.icon,
    imageUrl: row.image_url,
    integrations: row.integrations ?? [],
    sellerName: row.seller?.display_name || "DHIVE seller",
    featured: row.featured_until !== null && new Date(row.featured_until) > new Date(),
    createdAt: row.created_at,
  };
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheTag("categories");
  cacheLife("days");
  if (!hasSupabase()) return DEMO_CATEGORIES;

  const { data, error } = await publicClient()
    .from("categories")
    .select("slug, name, icon")
    .order("sort_order");
  if (error) throw new Error(`Failed to load categories: ${error.message}`);
  return data;
}

export async function listProducts(query: ProductQuery = {}): Promise<Product[]> {
  "use cache";
  cacheTag("products");
  cacheLife("minutes");
  if (!hasSupabase()) return filterProducts(DEMO_PRODUCTS, query);

  let req = publicClient().from("products").select(PRODUCT_COLUMNS).eq("status", "published").limit(60);

  if (query.category) req = req.eq("category_slug", query.category);
  if (query.price) {
    const band = PRICE_BANDS[query.price];
    req = req.gte("price_cents", band.min);
    if (band.max !== null) req = req.lt("price_cents", band.max);
  }
  if (query.q) {
    // `search` is a generated tsvector over title + summary + description (GIN-indexed).
    req = req.textSearch("search", query.q, { type: "websearch", config: "english" });
  }
  switch (query.sort) {
    case "price-asc":
      req = req.order("price_cents", { ascending: true });
      break;
    case "price-desc":
      req = req.order("price_cents", { ascending: false });
      break;
    default:
      req = req
        .order("featured_until", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
  }

  const { data, error } = await req;
  if (error) throw new Error(`Failed to load products: ${error.message}`);
  return (data as unknown as ProductRow[]).map(toProduct);
}

export async function getProduct(slug: string): Promise<Product | null> {
  "use cache";
  cacheTag("products", `product:${slug}`);
  cacheLife("minutes");
  if (!hasSupabase()) return DEMO_PRODUCTS.find((p) => p.slug === slug) ?? null;

  const { data, error } = await publicClient()
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw new Error(`Failed to load product: ${error.message}`);
  return data ? toProduct(data as unknown as ProductRow) : null;
}

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  const all = await listProducts({ sort: "newest" });
  return all.slice(0, limit);
}
