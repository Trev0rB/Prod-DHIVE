import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** True when the app is wired to a real Supabase project. */
export function hasSupabase(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}

let client: SupabaseClient | null = null;

/**
 * Cookie-less anon client for public catalog reads. Safe to call inside 'use cache'
 * scopes because it never touches request data. RLS limits it to published listings.
 */
export function publicClient(): SupabaseClient {
  if (!hasSupabase()) throw new Error("Supabase env vars are not set");
  client ??= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
