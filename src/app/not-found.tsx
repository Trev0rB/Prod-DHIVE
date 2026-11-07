import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <p className="font-display text-6xl font-bold text-honey">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold">This cell of the hive is empty.</h1>
      <p className="mt-2 text-ink-soft">The page or listing you&apos;re after doesn&apos;t exist, or was taken down.</p>
      <Link
        href="/browse"
        className="mt-6 inline-block rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-paper hover:bg-brand-dark"
      >
        Browse the marketplace
      </Link>
    </div>
  );
}
