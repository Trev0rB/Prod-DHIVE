import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Privileged client for trusted server-side writes that have no user session:
 * marking orders paid from Paystack webhooks, and saving seller payout accounts.
 * Uses SUPABASE_SECRET_KEY (sb_secret_…), which bypasses RLS. Never import in client code.
 */
let admin: SupabaseClient | null = null;

export function hasAdmin(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);
}

export function adminClient(): SupabaseClient {
  if (!hasAdmin()) throw new Error("SUPABASE_SECRET_KEY is not set");
  admin ??= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return admin;
}
