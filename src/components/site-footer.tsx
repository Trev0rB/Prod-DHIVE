import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-wash">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          <span className="font-display font-semibold text-ink">DHIVE</span> by BoschTech · Built in South Africa
        </p>
        <nav className="flex gap-5">
          <Link href="/browse" className="hover:text-ink">
            Browse
          </Link>
          <Link href="/sell" className="hover:text-ink">
            Sell
          </Link>
        </nav>
      </div>
    </footer>
  );
}
