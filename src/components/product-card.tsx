import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/p/${product.slug}`}
      className="group flex flex-col rounded-xl border border-line bg-paper p-5 transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lg hover:shadow-brand/5"
    >
      <div className="flex items-start justify-between gap-3">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- seller uploads from Supabase Storage
          <img src={product.imageUrl} alt="" loading="lazy" className="size-12 rounded-lg object-cover" />
        ) : (
          <span className="grid size-12 place-items-center rounded-lg bg-brand-wash text-2xl" aria-hidden="true">
            {product.icon}
          </span>
        )}
        {product.featured && (
          <span className="rounded-full bg-honey-wash px-2 py-0.5 text-xs font-semibold text-amber-700">Featured</span>
        )}
      </div>
      <h3 className="mt-4 font-display text-lg leading-snug font-semibold group-hover:text-brand">{product.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{product.summary}</p>
      <div className="mt-auto flex items-end justify-between pt-5">
        <span className="text-xs text-ink-soft">by {product.sellerName}</span>
        <span className="font-display text-lg font-bold">{formatPrice(product.priceCents)}</span>
      </div>
    </Link>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="h-52 animate-pulse rounded-xl border border-line bg-wash" />
      ))}
    </div>
  );
}
