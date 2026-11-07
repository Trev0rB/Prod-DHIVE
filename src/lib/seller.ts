import "server-only";
import { serverClient } from "./supabase/server";

export type ListingStatus = "draft" | "published" | "archived";

export type SellerListing = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  categorySlug: string;
  priceCents: number;
  icon: string;
  imageUrl: string | null;
  integrations: string[];
  status: ListingStatus;
  fileName: string | null;
  fileSize: number | null;
  updatedAt: string;
};

const COLUMNS =
  "id, slug, title, summary, description, category_slug, price_cents, icon, image_url, integrations, status, file_name, file_size, updated_at";

type Row = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  category_slug: string;
  price_cents: number;
  icon: string;
  image_url: string | null;
  integrations: string[];
  status: ListingStatus;
  file_name: string | null;
  file_size: number | null;
  updated_at: string;
};

const toListing = (r: Row): SellerListing => ({
  id: r.id,
  slug: r.slug,
  title: r.title,
  summary: r.summary,
  description: r.description,
  categorySlug: r.category_slug,
  priceCents: r.price_cents,
  icon: r.icon,
  imageUrl: r.image_url,
  integrations: r.integrations ?? [],
  status: r.status,
  fileName: r.file_name,
  fileSize: r.file_size,
  updatedAt: r.updated_at,
});

/** The signed-in seller's listings, every status. Uncached: sellers must see their own edits immediately. */
export async function getMyListings(sellerId: string): Promise<SellerListing[]> {
  const supabase = await serverClient();
  const { data, error } = await supabase
    .from("products")
    .select(COLUMNS)
    .eq("seller_id", sellerId)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(`Failed to load your listings: ${error.message}`);
  return (data as Row[]).map(toListing);
}

export async function getMyListing(sellerId: string, id: string): Promise<SellerListing | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await serverClient();
  const { data, error } = await supabase
    .from("products")
    .select(COLUMNS)
    .eq("seller_id", sellerId)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Failed to load listing: ${error.message}`);
  return data ? toListing(data as Row) : null;
}
