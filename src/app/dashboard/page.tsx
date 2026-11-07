import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import { getMyListings, type ListingStatus } from "@/lib/seller";
import { changeListingStatus, deleteDraft } from "./actions";

export const metadata: Metadata = { title: "Seller dashboard", robots: { index: false } };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const NOTICES: Record<string, string> = {
  published: "Your listing is live.",
  draft: "Saved as a draft. It isn't visible to buyers yet.",
  archived: "Listing archived. It's hidden from buyers.",
  deleted: "Draft deleted.",
  payouts: "Payout account saved. Your paid listings can now be bought.",
};

const BADGE: Record<ListingStatus, string> = {
  published: "bg-emerald-50 text-emerald-700",
  draft: "bg-wash text-ink-soft",
  archived: "bg-amber-50 text-amber-800",
};

export default function DashboardPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-wash" />}>
        <Dashboard searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Dashboard({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireUser("/dashboard");
  if (!user.isSeller) redirect("/sell");

  const params = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const listings = await getMyListings(user.id);
  const notice = one(params.welcome)
    ? "Welcome aboard! Add your first listing to get started."
    : NOTICES[one(params.saved) ?? ""];
  const error = one(params.error) ? "That didn't work. Try again." : null;
  const live = listings.filter((l) => l.status === "published").length;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-brand">Seller dashboard</p>
          <h1 className="mt-1 font-display text-3xl font-bold">Your listings</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {listings.length} total · {live} live
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/payouts"
            className="rounded-lg border border-line px-4 py-3 text-sm font-semibold hover:border-ink"
          >
            Payouts
          </Link>
          <Link
            href="/dashboard/listings/new"
            className="rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-paper hover:bg-brand-dark"
          >
            + New listing
          </Link>
        </div>
      </div>

      {!user.payoutsReady && listings.some((l) => l.priceCents > 0) && (
        <p className="mt-6 rounded-lg bg-honey-wash p-3 text-sm text-amber-900">
          Buyers can&apos;t pay for your paid listings until you{" "}
          <Link href="/dashboard/payouts" className="font-semibold underline">
            add a payout account
          </Link>
          .
        </p>
      )}

      {(notice || error) && (
        <p
          role="status"
          className={`mt-6 rounded-lg p-3 text-sm ${error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"}`}
        >
          {error ?? notice}
        </p>
      )}

      {listings.length === 0 ? (
        <div className="hive-pattern mt-8 rounded-xl border border-dashed border-line p-12 text-center">
          <p className="font-display text-xl font-semibold">No listings yet</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
            Upload your tool, template or course, set a price, and publish. You keep 100% of every sale.
          </p>
          <Link
            href="/dashboard/listings/new"
            className="mt-5 inline-block rounded-lg bg-honey px-5 py-2.5 text-sm font-semibold text-ink hover:bg-amber-400"
          >
            Create your first listing
          </Link>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-line rounded-xl border border-line">
          {listings.map((l) => (
            <li key={l.id} className="flex flex-wrap items-center gap-4 p-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-brand-wash text-2xl" aria-hidden="true">
                {l.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/dashboard/listings/${l.id}`} className="truncate font-semibold hover:text-brand">
                    {l.title}
                  </Link>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${BADGE[l.status]}`}>
                    {l.status === "published" ? "live" : l.status}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-ink-soft">
                  {formatPrice(l.priceCents)} · {l.fileName ? l.fileName : "⚠ no file uploaded"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {l.status === "published" && (
                  <Link href={`/p/${l.slug}`} className="rounded-md px-3 py-1.5 text-ink-soft hover:bg-wash hover:text-ink">
                    View
                  </Link>
                )}
                <Link
                  href={`/dashboard/listings/${l.id}`}
                  className="rounded-md px-3 py-1.5 text-ink-soft hover:bg-wash hover:text-ink"
                >
                  Edit
                </Link>
                <StatusButtons id={l.id} status={l.status} hasFile={Boolean(l.fileName)} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function StatusButtons({ id, status, hasFile }: { id: string; status: ListingStatus; hasFile: boolean }) {
  const btn = "rounded-md border border-line px-3 py-1.5 font-semibold hover:border-ink";
  return (
    <>
      <form action={changeListingStatus}>
        <input type="hidden" name="id" value={id} />
        {status === "published" ? (
          <button name="action" value="unpublish" className={btn}>
            Unpublish
          </button>
        ) : (
          <button
            name="action"
            value="publish"
            disabled={!hasFile}
            title={hasFile ? undefined : "Upload a file first"}
            className={`${btn} disabled:cursor-not-allowed disabled:opacity-40`}
          >
            Publish
          </button>
        )}
      </form>
      {status === "draft" ? (
        <form action={deleteDraft}>
          <input type="hidden" name="id" value={id} />
          <button className="rounded-md px-3 py-1.5 font-semibold text-red-600 hover:bg-red-50">Delete</button>
        </form>
      ) : status === "published" ? (
        <form action={changeListingStatus}>
          <input type="hidden" name="id" value={id} />
          <button name="action" value="archive" className="rounded-md px-3 py-1.5 text-ink-soft hover:bg-wash">
            Archive
          </button>
        </form>
      ) : null}
    </>
  );
}
