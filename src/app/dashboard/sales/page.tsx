import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { formatAmount } from "@/lib/format";
import { serverClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Sales", robots: { index: false } };

type SaleRow = {
  id: string;
  paid_at: string | null;
  price_cents: number;
  product: { title: string; slug: string; icon: string } | null;
};

export default function SalesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <Link href="/dashboard" className="text-sm text-ink-soft hover:text-ink">
        ← Your listings
      </Link>
      <h1 className="mt-3 font-display text-3xl font-bold">Sales</h1>
      <Suspense fallback={<div className="mt-8 h-80 animate-pulse rounded-xl bg-wash" />}>
        <Sales />
      </Suspense>
    </div>
  );
}

/** Request-time cutoff. Safe here: this component already reads the session, so it never prerenders. */
function daysAgo(days: number): number {
  return Date.now() - days * 24 * 3600 * 1000;
}

async function Sales() {
  const user = await requireUser("/dashboard/sales");
  if (!user.isSeller) redirect("/sell");

  const supabase = await serverClient();
  const { data } = await supabase
    .from("orders")
    .select("id, paid_at, price_cents, product:products(title, slug, icon)")
    .eq("seller_id", user.id)
    .eq("status", "paid")
    .order("paid_at", { ascending: false })
    .limit(200);
  const sales = (data ?? []) as unknown as SaleRow[];

  const paid = sales.filter((s) => s.price_cents > 0);
  const earned = paid.reduce((sum, s) => sum + s.price_cents, 0);
  const since = daysAgo(30);
  const earned30 = paid
    .filter((s) => s.paid_at && new Date(s.paid_at).getTime() >= since)
    .reduce((sum, s) => sum + s.price_cents, 0);
  const freeClaims = sales.length - paid.length;

  const stats = [
    ["Earned (all time)", formatAmount(earned)],
    ["Earned (last 30 days)", formatAmount(earned30)],
    ["Paid sales", String(paid.length)],
    ["Free downloads", String(freeClaims)],
  ];

  return (
    <>
      <p className="mt-1 text-sm text-ink-soft">
        You receive the full listing price; buyers pay the card fee. Paystack pays out to your bank, usually the next
        business day.
      </p>
      <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-line p-4">
            <dt className="text-xs text-ink-soft">{label}</dt>
            <dd className="mt-1 font-display text-2xl font-bold">{value}</dd>
          </div>
        ))}
      </dl>

      {sales.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-line p-12 text-center">
          <p className="font-display text-lg font-semibold">No sales yet</p>
          <p className="mt-1 text-sm text-ink-soft">When someone buys or downloads your listings, they&apos;ll show up here.</p>
        </div>
      ) : (
        <table className="mt-8 w-full text-left text-sm">
          <thead className="border-b border-line text-xs text-ink-soft">
            <tr>
              <th className="py-2 font-medium">Product</th>
              <th className="py-2 font-medium">Date</th>
              <th className="py-2 text-right font-medium">You received</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {sales.map((s) => (
              <tr key={s.id}>
                <td className="py-3">
                  <span aria-hidden="true">{s.product?.icon}</span> {s.product?.title ?? "Removed listing"}
                </td>
                <td className="py-3 text-ink-soft">
                  {s.paid_at
                    ? new Date(s.paid_at).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })
                    : "—"}
                </td>
                <td className="py-3 text-right font-semibold">{s.price_cents ? formatAmount(s.price_cents) : "Free"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
