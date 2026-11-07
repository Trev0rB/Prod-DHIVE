import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { signOut } from "./actions";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Suspense fallback={<div className="h-80 animate-pulse rounded-xl bg-wash" />}>
        <AccountBody />
      </Suspense>
    </div>
  );
}

async function AccountBody() {
  const user = await requireUser("/account");
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Hi, {user.displayName}</h1>
          <p className="mt-1 text-sm text-ink-soft">{user.email}</p>
        </div>
        <form action={signOut}>
          <button type="submit" className="rounded-lg border border-line px-4 py-2 text-sm font-semibold hover:border-ink">
            Sign out
          </button>
        </form>
      </div>

      <section className="mt-10 rounded-xl border border-line p-6">
        <h2 className="font-display text-lg font-semibold">Profile</h2>
        <div className="mt-4">
          <ProfileForm displayName={user.displayName} />
        </div>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <section className="rounded-xl border border-line p-6">
          <h2 className="font-display text-lg font-semibold">Purchases</h2>
          <p className="mt-1 text-sm text-ink-soft">Everything you buy on DHIVE will be here to download.</p>
          <Link href="/browse" className="mt-4 inline-block text-sm font-semibold text-brand hover:underline">
            Browse the marketplace →
          </Link>
        </section>
        <section className="rounded-xl border border-line bg-honey-wash/60 p-6">
          <h2 className="font-display text-lg font-semibold">{user.isSeller ? "Seller dashboard" : "Start selling"}</h2>
          <p className="mt-1 text-sm text-ink-soft">
            {user.isSeller
              ? "Manage your listings and see your sales."
              : "List your AI tools and keep 100% of every sale."}
          </p>
          <Link href="/sell" className="mt-4 inline-block text-sm font-semibold text-amber-800 hover:underline">
            {user.isSeller ? "Go to dashboard →" : "Become a seller →"}
          </Link>
        </section>
      </div>
    </>
  );
}
