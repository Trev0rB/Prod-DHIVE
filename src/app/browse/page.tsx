import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProductGrid, ProductGridSkeleton } from "@/components/product-card";
import { SearchBox } from "@/components/search-box";
import { getCategories, listProducts } from "@/lib/catalog";
import { parseQuery, PRICE_BANDS } from "@/lib/filter";
import type { Category, ProductQuery } from "@/lib/types";

export const metadata: Metadata = { title: "Browse" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function BrowsePage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold">Browse the marketplace</h1>
      {/* Search params are request data, so everything that reads them streams in. */}
      <Suspense fallback={<BrowseSkeleton />}>
        <BrowseResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function BrowseResults({ searchParams }: { searchParams: SearchParams }) {
  const query = parseQuery(await searchParams);
  const [categories, products] = await Promise.all([getCategories(), listProducts(query)]);
  const activeCategory = categories.find((c) => c.slug === query.category);

  const activeFilters = Number(Boolean(query.category)) + Number(Boolean(query.price));

  return (
    <div className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-[220px_1fr] lg:gap-10">
      <div className="sm:hidden">
        <SearchBox defaultValue={query.q} />
      </div>
      {/* Collapsed on small screens so results stay above the fold; always open on desktop. */}
      <details className="group rounded-xl border border-line lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold">
          Filters{activeFilters > 0 && ` (${activeFilters})`}
          <span className="text-ink-soft transition group-open:rotate-180" aria-hidden="true">
            ▾
          </span>
        </summary>
        <div className="border-t border-line px-1 py-4">
          <Filters categories={categories} query={query} />
        </div>
      </details>
      <div className="hidden lg:block">
        <Filters categories={categories} query={query} />
      </div>
      <section aria-live="polite">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-soft">
            {products.length} {products.length === 1 ? "result" : "results"}
            {query.q && (
              <>
                {" "}
                for <span className="font-semibold text-ink">“{query.q}”</span>
              </>
            )}
            {activeCategory && <> in {activeCategory.name}</>}
          </p>
          <SortLinks query={query} />
        </div>
        {products.length ? (
          <ProductGrid products={products} />
        ) : (
          <div className="rounded-xl border border-dashed border-line p-12 text-center">
            <p className="font-display text-lg font-semibold">Nothing matches that yet.</p>
            <p className="mt-1 text-sm text-ink-soft">Try a broader search, or clear the filters.</p>
            <Link href="/browse" className="mt-4 inline-block text-sm font-semibold text-brand hover:underline">
              Clear filters
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

/** Build a /browse URL from the current query with some keys overridden. */
function browseHref(query: ProductQuery, patch: Partial<ProductQuery>): string {
  const next = { ...query, ...patch };
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(next)) if (v) params.set(k, v);
  const s = params.toString();
  return s ? `/browse?${s}` : "/browse";
}

function FilterLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={`block rounded-md px-3 py-1.5 text-sm ${
        active ? "bg-brand-wash font-semibold text-brand" : "text-ink-soft hover:bg-wash hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}

function Filters({ categories, query }: { categories: Category[]; query: ProductQuery }) {
  return (
    <aside className="space-y-8">
      <div>
        <h2 className="mb-2 px-3 text-xs font-semibold tracking-wider text-ink-soft uppercase">Category</h2>
        <FilterLink href={browseHref(query, { category: undefined })} active={!query.category}>
          All categories
        </FilterLink>
        {categories.map((c) => (
          <FilterLink key={c.slug} href={browseHref(query, { category: c.slug })} active={query.category === c.slug}>
            <span aria-hidden="true">{c.icon}</span> {c.name}
          </FilterLink>
        ))}
      </div>
      <div>
        <h2 className="mb-2 px-3 text-xs font-semibold tracking-wider text-ink-soft uppercase">Price</h2>
        <FilterLink href={browseHref(query, { price: undefined })} active={!query.price}>
          Any price
        </FilterLink>
        {Object.entries(PRICE_BANDS).map(([key, band]) => (
          <FilterLink
            key={key}
            href={browseHref(query, { price: key as ProductQuery["price"] })}
            active={query.price === key}
          >
            {band.label}
          </FilterLink>
        ))}
      </div>
    </aside>
  );
}

function SortLinks({ query }: { query: ProductQuery }) {
  const sorts = [
    ["newest", "Featured & new"],
    ["price-asc", "Price: low to high"],
    ["price-desc", "Price: high to low"],
  ] as const;
  const current = query.sort ?? "newest";
  return (
    <nav aria-label="Sort" className="flex gap-1 rounded-lg bg-wash p-1 text-xs font-medium">
      {sorts.map(([key, label]) => (
        <Link
          key={key}
          href={browseHref(query, { sort: key === "newest" ? undefined : key })}
          aria-current={current === key ? "true" : undefined}
          className={`rounded-md px-2.5 py-1.5 ${current === key ? "bg-paper text-ink shadow-sm" : "text-ink-soft hover:text-ink"}`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

function BrowseSkeleton() {
  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[220px_1fr]">
      <div className="hidden h-96 animate-pulse rounded-xl bg-wash lg:block" />
      <div>
        <div className="mb-5 h-8 w-48 animate-pulse rounded bg-wash" />
        <ProductGridSkeleton />
      </div>
    </div>
  );
}
