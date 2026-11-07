/** Canonical site URL for metadata, sitemaps and links. Switch NEXT_PUBLIC_SITE_URL when dhive.co.za moves over. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://prod-dhive.vercel.app").replace(/\/$/, "");

/** Public support mailbox shown in legal pages and errors. Must exist before launch. */
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@dhive.co.za";

export const COMPANY = {
  name: "BoschTech",
  product: "DHIVE",
  country: "South Africa",
} as const;
