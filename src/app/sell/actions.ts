"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { serverClient } from "@/lib/supabase/server";

export type BecomeSellerState = { status: "idle" } | { status: "error"; message: string };

export async function becomeSeller(_prev: BecomeSellerState, formData: FormData): Promise<BecomeSellerState> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?next=/sell");
  if (user.isSeller) redirect("/dashboard");
  if (formData.get("terms") !== "on") {
    return { status: "error", message: "Please accept the seller terms to continue." };
  }

  const supabase = await serverClient();
  const { error } = await supabase.rpc("become_seller");
  if (error) return { status: "error", message: "Couldn't set up your seller account. Try again." };
  redirect("/dashboard?welcome=1");
}
