"use client";

import { createBrowserClient } from "@supabase/ssr";

/** Browser client, used only for direct-to-storage uploads (Vercel caps request bodies at ~4.5 MB). */
export function browserClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
}
