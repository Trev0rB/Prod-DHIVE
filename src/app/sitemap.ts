import type { MetadataRoute } from "next";
import { getCategories, listProducts } from "@/lib/catalog";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([listProducts(), getCategories()]);
  const page = (path: string, priority: number, changeFrequency: "daily" | "weekly" | "monthly" | "yearly") => ({
    url: `${SITE_URL}${path}`,
    priority,
    changeFrequency,
  });

  return [
    page("/", 1, "daily"),
    page("/browse", 0.9, "daily"),
    page("/sell", 0.8, "monthly"),
    ...categories.map((c) => page(`/browse?category=${c.slug}`, 0.7, "weekly")),
    ...products.map((p) => ({
      url: `${SITE_URL}/p/${p.slug}`,
      lastModified: new Date(p.createdAt),
      priority: 0.8,
      changeFrequency: "weekly" as const,
    })),
    page("/terms", 0.2, "yearly"),
    page("/privacy", 0.2, "yearly"),
    page("/seller-terms", 0.2, "yearly"),
  ];
}
