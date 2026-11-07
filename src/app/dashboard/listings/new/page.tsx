import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { getCategories } from "@/lib/catalog";
import { ListingForm } from "../../listing-form";

export const metadata: Metadata = { title: "New listing", robots: { index: false } };

export default function NewListingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link href="/dashboard" className="text-sm text-ink-soft hover:text-ink">
        ← Your listings
      </Link>
      <h1 className="mt-3 font-display text-3xl font-bold">New listing</h1>
      <div className="mt-8">
        <Suspense fallback={<div className="h-[600px] animate-pulse rounded-xl bg-wash" />}>
          <NewListing />
        </Suspense>
      </div>
    </div>
  );
}

async function NewListing() {
  const user = await requireUser("/dashboard/listings/new");
  if (!user.isSeller) redirect("/sell");
  return <ListingForm userId={user.id} categories={await getCategories()} />;
}
