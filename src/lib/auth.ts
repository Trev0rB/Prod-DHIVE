import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { hasSupabase } from "./supabase/public";
import { serverClient } from "./supabase/server";

export type CurrentUser = {
  id: string;
  email: string;
  displayName: string;
  isSeller: boolean;
  payoutsReady: boolean;
};

/**
 * The signed-in user, or null. Reads cookies, so callers must sit behind <Suspense>.
 * Deduplicated per request with React cache().
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  if (!hasSupabase()) return null;
  const supabase = await serverClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, is_seller, payouts_ready")
    .eq("id", claims.sub)
    .maybeSingle();

  const email = typeof claims.email === "string" ? claims.email : "";
  return {
    id: claims.sub,
    email,
    displayName: profile?.display_name || email.split("@")[0] || "there",
    isSeller: profile?.is_seller ?? false,
    payoutsReady: profile?.payouts_ready ?? false,
  };
});

/** Like getCurrentUser, but sends signed-out visitors to sign in and back again. */
export async function requireUser(returnTo: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(returnTo)}`);
  return user;
}
