export type Category = {
  slug: string;
  name: string;
  icon: string;
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  categorySlug: string;
  priceCents: number;
  currency: "ZAR";
  icon: string;
  imageUrl: string | null;
  integrations: string[];
  sellerName: string;
  /** Whether the seller can receive Paystack payouts yet (paid listings can only be bought if so). */
  sellerPayoutsReady: boolean;
  featured: boolean;
  createdAt: string;
};

export type SortKey = "newest" | "price-asc" | "price-desc";

export type PriceBand = "free" | "under-500" | "500-2000" | "over-2000";

export type ProductQuery = {
  q?: string;
  category?: string;
  price?: PriceBand;
  sort?: SortKey;
};
