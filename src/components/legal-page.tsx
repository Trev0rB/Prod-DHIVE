import Link from "next/link";

export const LEGAL_UPDATED = "7 November 2026";

export function LegalPage({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <p className="text-sm text-ink-soft">Last updated {LEGAL_UPDATED}</p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">{title}</h1>
      <p className="mt-4 text-lg text-ink-soft">{intro}</p>
      <div className="mt-10 space-y-8 leading-relaxed [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_li]:mt-1.5 [&_p]:mt-2 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
      <nav className="mt-14 flex flex-wrap gap-4 border-t border-line pt-6 text-sm text-ink-soft">
        <Link href="/terms" className="hover:text-ink">
          Terms of use
        </Link>
        <Link href="/privacy" className="hover:text-ink">
          Privacy policy
        </Link>
        <Link href="/seller-terms" className="hover:text-ink">
          Seller terms
        </Link>
      </nav>
    </article>
  );
}
