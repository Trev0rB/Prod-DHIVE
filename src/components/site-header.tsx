import Link from "next/link";
import { SearchBox } from "./search-box";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight">
          <Logo />
          DHIVE
        </Link>
        <div className="hidden flex-1 sm:block">
          <SearchBox />
        </div>
        <nav className="ml-auto flex items-center gap-1 text-sm font-medium sm:ml-0">
          <Link href="/browse" className="rounded-md px-3 py-2 text-ink-soft hover:bg-wash hover:text-ink">
            Browse
          </Link>
          <Link href="/sell" className="rounded-md bg-ink px-3 py-2 text-paper hover:bg-brand">
            Sell on DHIVE
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <svg width="26" height="28" viewBox="0 0 26 28" aria-hidden="true">
      <path d="M13 1l11 6.5v13L13 27 2 20.5v-13L13 1z" fill="var(--color-honey)" />
      <path d="M13 8l5.5 3.25v6.5L13 21l-5.5-3.25v-6.5L13 8z" fill="var(--color-ink)" />
    </svg>
  );
}
