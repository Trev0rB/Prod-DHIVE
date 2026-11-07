import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { getCategories } from "@/lib/catalog";
import { getMyListing } from "@/lib/seller";
import { ListingForm } from "../../listing-form";

export const metadata: Metadata = { title: "Edit listing", robots: { index: false } };

type Params = Promise<{ id: string }>;

export default function EditListingPage({ params }: { params: Params }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link href="/dashboard" className="text-sm text-ink-soft hover:text-ink">
        ← Your listings
      </Link>
      <Suspense fallback={<div className="mt-8 h-[600px] animate-pulse rounded-xl bg-wash" />}>
        <EditListing params={params} />
      </Suspense>
    </div>
  );
}

async function EditListing({ params }: { params: Params }) {
  const { id } = await params;
  const user = await requireUser(`/dashboard/listings/${id}`);
  if (!user.isSeller) redirect("/sell");

  const [listing, categories] = await Promise.all([getMyListing(user.id, id), getCategories()]);
  if (!listing) notFound();

  return (
    <>
      <h1 className="mt-3 font-display text-3xl font-bold">Edit listing</h1>
      <p className="mt-1 text-sm text-ink-soft">
        {listing.status === "published" ? "Live. Changes show up for buyers as soon as you save." : `Status: ${listing.status}`}
      </p>
      <div className="mt-8">
        <ListingForm
          userId={user.id}
          categories={categories}
          defaults={{
            id: listing.id,
            title: listing.title,
            summary: listing.summary,
            description: listing.description,
            categorySlug: listing.categorySlug,
            price: (listing.priceCents / 100).toString(),
            icon: listing.icon,
            integrations: listing.integrations.join(", "),
            imageUrl: listing.imageUrl,
            fileName: listing.fileName,
            fileSize: listing.fileSize,
            status: listing.status,
          }}
        />
      </div>
    </>
  );
}
