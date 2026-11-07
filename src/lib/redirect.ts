/**
 * Only allow same-site relative paths as post-login destinations, so a crafted
 * ?next= link can't bounce someone to another site after they sign in.
 */
export function safeNext(next: string | null | undefined, fallback = "/account"): string {
  if (!next || !next.startsWith("/")) return fallback;
  // "//evil.com" and "/\evil.com" are protocol-relative in browsers.
  if (next.startsWith("//") || next.startsWith("/\\")) return fallback;
  // Control characters (e.g. tab/newline) can be stripped by browsers to form "//".
  if (/[\u0000-\u001f\u007f]/.test(next)) return fallback;
  return next;
}

/** Basic email shape check; Supabase does the real validation. */
export function isEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
