import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

/** Header account link. Reads the session, so it renders behind <Suspense>. */
export async function AccountNav() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <Link href="/sign-in" className="rounded-md px-3 py-2 text-ink-soft hover:bg-wash hover:text-ink">
        Sign in
      </Link>
    );
  }
  return (
    <Link
      href="/account"
      aria-label={`Your account (${user.displayName})`}
      className="grid size-9 place-items-center rounded-full bg-brand-wash font-display text-sm font-bold text-brand hover:bg-brand hover:text-paper"
    >
      {user.displayName.charAt(0).toUpperCase()}
    </Link>
  );
}

export function AccountNavFallback() {
  return <span className="inline-block h-9 w-16 rounded-md" aria-hidden="true" />;
}
