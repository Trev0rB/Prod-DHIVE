import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { formatAmount } from "@/lib/format";
import { formatBytes } from "@/lib/listing";
import { serverClient } from "@/lib/supabase/server";
import { downloadPurchase } from "./actions";

export const metadata: Metadata = { title: "Your purchases", robots: { index: false } };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type PurchaseRow = {
  id: string;
  paid_at: string | null;
  amount_cents: number;
  product: { id: string; slug: string; title: string; icon: string; file_name: string | null; file_size: number | null; status: string } | null;
};

const NOTICES: Record<string, { text: string; tone: "ok" | "warn" | "err" }> = {
  paid: { text: "Payment received. Your download is ready below.", tone: "ok" },
  claimed: { text: "Added to your library. Download it below.", tone: "ok" },
  owned: { text: "You already own this. It's in your library below.", tone: "ok" },
  pending: { text: "We're still confirming your payment with Paystack. Refresh in a minute.", tone: "warn" },
  download: { text: "That download isn't available. Contact support if this keeps happening.", tone: "err" },
};

export default function PurchasesPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Link href="/account" className="text-sm text-ink-soft hover:text-ink">
        ← Account
      </Link>
      <h1 className="mt-3 font-display text-3xl font-bold">Your purchases</h1>
      <Suspense fallback={<div className="mt-8 h-64 animate-pulse rounded-xl bg-wash" />}>
        <Purchases searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Purchases({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireUser("/account/purchases");
  const params = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const key = one(params.paid) ? "paid" : one(params.claimed) ? "claimed" : one(params.owned) ? "owned" : one(params.payment) ? "pending" : one(params.error) ? "download" : "";
  const notice = NOTICES[key];

  const supabase = await serverClient();
  const { data } = await supabase
    .from("orders")
    .select("id, paid_at, amount_cents, product:products(id, slug, title, icon, file_name, file_size, status)")
    .eq("buyer_id", user.id)
    .eq("status", "paid")
    .order("paid_at", { ascending: false });
  const purchases = ((data ?? []) as unknown as PurchaseRow[]).filter((p) => p.product);

  return (
    <>
      {notice && (
        <p
          role="status"
          className={`mt-6 rounded-lg p-3 text-sm ${
            notice.tone === "ok" ? "bg-emerald-50 text-emerald-800" : notice.tone === "warn" ? "bg-honey-wash text-amber-900" : "bg-red-50 text-red-700"
          }`}
        >
          {notice.text}
        </p>
      )}

      {purchases.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-line p-12 text-center">
          <p className="font-display text-xl font-semibold">Nothing here yet</p>
          <p className="mt-1 text-sm text-ink-soft">Everything you buy or claim on DHIVE shows up here to download any time.</p>
          <Link href="/browse" className="mt-4 inline-block text-sm font-semibold text-brand hover:underline">
            Browse the marketplace →
          </Link>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-line rounded-xl border border-line">
          {purchases.map(({ id, paid_at, amount_cents, product: p }) => (
            <li key={id} className="flex flex-wrap items-center gap-4 p-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-brand-wash text-2xl" aria-hidden="true">
                {p!.icon}
              </span>
              <div className="min-w-0 flex-1">
                {p!.status === "published" ? (
                  <Link href={`/p/${p!.slug}`} className="font-semibold hover:text-brand">
                    {p!.title}
                  </Link>
                ) : (
                  <span className="font-semibold">{p!.title}</span>
                )}
                <p className="mt-0.5 text-sm text-ink-soft">
                  {amount_cents === 0 ? "Free" : `Paid ${formatAmount(amount_cents)}`}
                  {paid_at && ` · ${new Date(paid_at).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}`}
                  {p!.file_name && ` · ${p!.file_name}`}
                  {p!.file_size ? ` (${formatBytes(p!.file_size)})` : ""}
                </p>
              </div>
              <form action={downloadPurchase}>
                <input type="hidden" name="productId" value={p!.id} />
                <button className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-paper hover:bg-brand-dark">
                  Download
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
