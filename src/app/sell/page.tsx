import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { BecomeSellerForm } from "./become-seller-form";

export const metadata: Metadata = { title: "Sell on DHIVE" };

const steps = [
  ["Open a seller account", "Sign in with your email and accept the seller terms. It takes a minute."],
  ["List your product", "Upload your file, set a price in rand, and write a clear description."],
  ["Get paid, keep 100%", "Every sale is paid out to you through Paystack. DHIVE takes no commission."],
];

export default function SellPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="text-sm font-semibold text-brand">For creators</p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">
        Sell your AI tools. Keep every rand.
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-ink-soft">
        Most marketplaces take 10–30% of each sale. DHIVE takes 0%. We make money from optional featured placements and
        Pro tools instead.
      </p>

      <ol className="mt-12 grid gap-4 sm:grid-cols-3">
        {steps.map(([title, body], i) => (
          <li key={title} className="rounded-xl border border-line p-5">
            <span className="font-display text-sm font-bold text-honey">0{i + 1}</span>
            <h2 className="mt-2 font-display font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-ink-soft">{body}</p>
          </li>
        ))}
      </ol>

      <section className="mt-12 rounded-xl bg-honey-wash p-6 sm:p-8">
        <Suspense fallback={<div className="h-40 animate-pulse rounded-lg bg-honey/10" />}>
          <SellerCta />
        </Suspense>
      </section>
    </div>
  );
}

async function SellerCta() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <>
        <h2 className="font-display text-xl font-bold">Start selling in a minute</h2>
        <p className="mt-1 text-sm text-ink-soft">Sign in with your email first. No password needed.</p>
        <Link
          href="/sign-in?next=/sell"
          className="mt-5 inline-block rounded-lg bg-ink px-6 py-3 text-sm font-semibold text-paper hover:bg-brand"
        >
          Sign in to start selling
        </Link>
      </>
    );
  }

  if (user.isSeller) {
    return (
      <>
        <h2 className="font-display text-xl font-bold">You&apos;re a DHIVE seller</h2>
        <p className="mt-1 text-sm text-ink-soft">Manage your listings and add new products from your dashboard.</p>
        <Link
          href="/dashboard"
          className="mt-5 inline-block rounded-lg bg-ink px-6 py-3 text-sm font-semibold text-paper hover:bg-brand"
        >
          Go to your dashboard →
        </Link>
      </>
    );
  }

  return (
    <>
      <h2 className="font-display text-xl font-bold">Open your seller account</h2>
      <p className="mt-1 mb-5 text-sm text-ink-soft">Signed in as {user.email}.</p>
      <BecomeSellerForm />
    </>
  );
}
