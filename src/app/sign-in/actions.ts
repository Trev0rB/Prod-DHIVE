"use server";

import { headers } from "next/headers";
import { isEmail, safeNext } from "@/lib/redirect";
import { hasSupabase } from "@/lib/supabase/public";
import { serverClient } from "@/lib/supabase/server";

export type SignInState =
  | { status: "idle" }
  | { status: "sent"; email: string }
  | { status: "error"; message: string; email?: string };

/** The origin this request came in on, so magic links work on previews as well as production. */
async function requestOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_SITE_URL ?? "https://dhive.co.za");
}

export async function sendMagicLink(_prev: SignInState, formData: FormData): Promise<SignInState> {
  if (!hasSupabase()) {
    return { status: "error", message: "Sign-in isn't switched on yet. Supabase hasn't been connected." };
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const next = safeNext(String(formData.get("next") ?? ""));
  if (!isEmail(email)) return { status: "error", message: "Enter a valid email address.", email };

  const supabase = await serverClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${await requestOrigin()}/auth/confirm?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    const message =
      error.status === 429
        ? "Too many attempts. Wait a minute and try again."
        : "We couldn't send the link. Check the address and try again.";
    return { status: "error", message, email };
  }
  return { status: "sent", email };
}
