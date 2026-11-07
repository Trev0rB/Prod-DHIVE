import Link from "next/link";
import { ProductGrid } from "@/components/product-card";
import { SearchBox } from "@/components/search-box";
import { getCategories, getFeaturedProducts } from "@/lib/catalog";

export default async function HomePage() {
  const [categories, featured] = await Promise.all([getCategories(), getFeaturedProducts(6)]);

  return (
    <>
      <section className="hive-pattern border-b border-line">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="inline-flex items-center gap-2 rounded-full border border-honey/40 bg-honey-wash px-3 py-1 text-xs font-semibold text-amber-800">
            0% platform fees · sellers keep 100%
          </p>
          <h1 className="mt-6 max-w-3xl font-display text-4xl leading-[1.05] font-bold tracking-tight sm:text-6xl">
            The marketplace for AI tools that actually get work done.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink-soft">
            Chatbots, automations, templates and courses from South African builders. Buy what you need, or sell what
            you&apos;ve built and keep every rand.
          </p>
          <div className="mt-8 max-w-lg">
            <SearchBox />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/browse"
              className="rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-paper hover:bg-brand-dark"
            >
              Browse the marketplace
            </Link>
            <Link
              href="/sell"
              className="rounded-lg border border-line bg-paper px-5 py-3 text-sm font-semibold hover:border-ink"
            >
              Start selling
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
        <h2 className="font-display text-2xl font-bold">Shop by category</h2>
        <div className="mt-5 flex flex-wrap gap-2">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/browse?category=${c.slug}`}
              className="rounded-full border border-line px-4 py-2 text-sm font-medium hover:border-brand hover:bg-brand-wash hover:text-brand"
            >
              <span aria-hidden="true">{c.icon}</span> {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl font-bold">Trending right now</h2>
          <Link href="/browse" className="text-sm font-semibold text-brand hover:underline">
            See all →
          </Link>
        </div>
        <div className="mt-5">
          <ProductGrid products={featured} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
        <div className="grid gap-8 rounded-2xl bg-ink p-8 text-paper sm:grid-cols-[1.4fr_1fr] sm:p-12">
          <div>
            <h2 className="font-display text-3xl font-bold">Built something useful? Sell it here.</h2>
            <p className="mt-3 text-paper/70">
              DHIVE charges sellers nothing. Payments go through Paystack straight to you. We earn from optional
              featured listings and Pro tools, not your sales.
            </p>
          </div>
          <div className="flex items-center sm:justify-end">
            <Link
              href="/sell"
              className="rounded-lg bg-honey px-6 py-3 text-sm font-semibold text-ink hover:bg-amber-400"
            >
              Become a seller
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
