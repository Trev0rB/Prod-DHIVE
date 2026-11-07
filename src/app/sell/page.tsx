import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Sell on DHIVE" };

const steps = [
  ["Create your seller account", "Sign up and connect your bank account through Paystack, in minutes."],
  ["List your product", "Upload your file, set a price in rand, and write a clear description."],
  ["Get paid, keep 100%", "Every sale is paid out to you by Paystack. DHIVE takes no commission."],
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

      <div className="mt-12 rounded-xl bg-brand-wash p-6">
        <p className="font-semibold">Seller sign-up opens soon.</p>
        <p className="mt-1 text-sm text-ink-soft">
          We&apos;re onboarding our first sellers now. Browse what&apos;s live in the meantime.
        </p>
        <Link href="/browse" className="mt-4 inline-block text-sm font-semibold text-brand hover:underline">
          Browse the marketplace →
        </Link>
      </div>
    </div>
  );
}
