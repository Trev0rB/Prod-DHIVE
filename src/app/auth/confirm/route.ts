import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/redirect";
import { hasSupabase } from "@/lib/supabase/public";
import { serverClient } from "@/lib/supabase/server";

/**
 * Landing point for magic links. Supports both link styles Supabase can send:
 * - ?code=...                     (PKCE, the default email template)
 * - ?token_hash=...&type=email    (works across devices; needs the template change in the README)
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = safeNext(searchParams.get("next"));
  const fail = NextResponse.redirect(new URL(`/sign-in?error=link&next=${encodeURIComponent(next)}`, origin));
  if (!hasSupabase()) return fail;

  const supabase = await serverClient();
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      : { error: new Error("missing token") };

  if (error) return fail;
  return NextResponse.redirect(new URL(next, origin));
}
