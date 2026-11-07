import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductGrid } from "@/components/product-card";
import { getCategories, getProduct, listProducts } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  if (!product) return { title: "Not found" };
  return { title: product.title, description: product.summary };
}

export default function ProductPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<div className="mx-auto h-[60vh] max-w-6xl animate-pulse px-4 py-10 sm:px-6" />}>
      <ProductDetail params={params} />
    </Suspense>
  );
}

async function ProductDetail({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const [categories, related] = await Promise.all([
    getCategories(),
    listProducts({ category: product.categorySlug }),
  ]);
  const category = categories.find((c) => c.slug === product.categorySlug);
  const more = related.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-sm text-ink-soft">
        <Link href="/browse" className="hover:text-ink">
          Browse
        </Link>
        {category && (
          <>
            {" / "}
            <Link href={`/browse?category=${category.slug}`} className="hover:text-ink">
              {category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_340px]">
        <article>
          <div className="flex items-center gap-4">
            <span className="grid size-16 place-items-center rounded-xl bg-brand-wash text-4xl" aria-hidden="true">
              {product.icon}
            </span>
            <div>
              <h1 className="font-display text-3xl leading-tight font-bold sm:text-4xl">{product.title}</h1>
              <p className="mt-1 text-sm text-ink-soft">by {product.sellerName}</p>
            </div>
          </div>
          <p className="mt-8 text-lg">{product.summary}</p>
          <div className="mt-4 leading-relaxed whitespace-pre-line text-ink-soft">{product.description}</div>

          {product.integrations.length > 0 && (
            <section className="mt-10">
              <h2 className="font-display text-lg font-semibold">Works with</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {product.integrations.map((i) => (
                  <li key={i} className="rounded-md border border-line bg-wash px-3 py-1 text-sm">
                    {i}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>

        <aside className="h-fit rounded-xl border border-line p-6 lg:sticky lg:top-24">
          <p className="font-display text-4xl font-bold">{formatPrice(product.priceCents)}</p>
          <p className="mt-1 text-sm text-ink-soft">Once-off · instant digital delivery</p>
          {/* Paystack checkout lands in a later cycle. */}
          <button
            type="button"
            disabled
            className="mt-6 w-full cursor-not-allowed rounded-lg bg-brand/60 px-5 py-3 text-sm font-semibold text-paper"
          >
            {product.priceCents === 0 ? "Get it free" : "Buy now"} · coming soon
          </button>
          <ul className="mt-6 space-y-2 text-sm text-ink-soft">
            <li>✓ Secure checkout with Paystack</li>
            <li>✓ 100% of your payment goes to the seller</li>
          </ul>
        </aside>
      </div>

      {more.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-2xl font-bold">More in {category?.name ?? "this category"}</h2>
          <div className="mt-5">
            <ProductGrid products={more} />
          </div>
        </section>
      )}
    </div>
  );
}
