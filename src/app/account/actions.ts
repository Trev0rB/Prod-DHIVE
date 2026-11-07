"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { hasSupabase } from "@/lib/supabase/public";
import { serverClient } from "@/lib/supabase/server";

export type ProfileState = { status: "idle" | "saved" } | { status: "error"; message: string };

export async function updateProfile(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?next=/account");

  const displayName = String(formData.get("displayName") ?? "")
    .trim()
    .replace(/\s+/g, " ");
  if (displayName.length < 2 || displayName.length > 60) {
    return { status: "error", message: "Use between 2 and 60 characters." };
  }

  const supabase = await serverClient();
  // RLS also restricts this to the caller's own row.
  const { error } = await supabase.from("profiles").update({ display_name: displayName }).eq("id", user.id);
  if (error) return { status: "error", message: "Couldn't save that. Try again." };

  revalidatePath("/account");
  return { status: "saved" };
}

export async function signOut() {
  if (hasSupabase()) {
    const supabase = await serverClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
