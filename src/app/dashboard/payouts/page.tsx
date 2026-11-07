import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { paymentsEnabled } from "@/lib/orders";
import { listBanks } from "@/lib/paystack";
import { PayoutForm } from "./payout-form";

export const metadata: Metadata = { title: "Payouts", robots: { index: false } };

export default function PayoutsPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <Link href="/dashboard" className="text-sm text-ink-soft hover:text-ink">
        ← Your listings
      </Link>
      <h1 className="mt-3 font-display text-3xl font-bold">Payouts</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Where Paystack sends your money. You receive the full price of every sale. Buyers cover the card fee.
      </p>
      <div className="mt-8">
        <Suspense fallback={<div className="h-72 animate-pulse rounded-xl bg-wash" />}>
          <Payouts />
        </Suspense>
      </div>
    </div>
  );
}

async function Payouts() {
  const user = await requireUser("/dashboard/payouts");
  if (!user.isSeller) redirect("/sell");

  if (user.payoutsReady) {
    return (
      <div className="rounded-xl bg-emerald-50 p-6">
        <p className="font-semibold text-emerald-800">✓ Payouts are set up</p>
        <p className="mt-1 text-sm text-emerald-900/80">
          Sales are paid to your bank account by Paystack, usually the next business day. To change your bank details,
          contact support.
        </p>
      </div>
    );
  }

  if (!paymentsEnabled()) {
    return (
      <div className="rounded-xl bg-honey-wash p-6">
        <p className="font-semibold">Payouts open very soon</p>
        <p className="mt-1 text-sm text-ink-soft">
          You can create and publish free listings now. Paid listings become buyable once card payments go live and
          you&apos;ve added a payout account here.
        </p>
      </div>
    );
  }

  const banks = await listBanks().catch(() => null);
  if (!banks) {
    return <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">Couldn&apos;t load banks from Paystack. Refresh to try again.</p>;
  }
  return (
    <PayoutForm
      banks={banks.filter((b) => b.active).map(({ name, code }) => ({ name, code }))}
      defaultName={user.displayName}
    />
  );
}
