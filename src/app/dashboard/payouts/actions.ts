"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { paymentsEnabled } from "@/lib/orders";
import { createSubaccount, listBanks } from "@/lib/paystack";
import { adminClient } from "@/lib/supabase/admin";

export type PayoutState = { status: "idle" } | { status: "error"; message: string };

export async function setUpPayouts(_prev: PayoutState, formData: FormData): Promise<PayoutState> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?next=/dashboard/payouts");
  if (!user.isSeller) redirect("/sell");
  if (!paymentsEnabled()) return { status: "error", message: "Payouts aren't switched on yet." };

  const businessName = String(formData.get("businessName") ?? "").trim().replace(/\s+/g, " ");
  const bankCode = String(formData.get("bankCode") ?? "").trim();
  const accountNumber = String(formData.get("accountNumber") ?? "").replace(/[\s-]/g, "");

  if (businessName.length < 2 || businessName.length > 100) {
    return { status: "error", message: "Enter the name payouts should be made out to." };
  }
  if (!/^\d{6,16}$/.test(accountNumber)) {
    return { status: "error", message: "Enter a valid account number (digits only)." };
  }
  const banks = await listBanks().catch(() => []);
  if (!banks.some((b) => b.code === bankCode)) return { status: "error", message: "Choose your bank." };

  let code: string;
  try {
    ({ subaccount_code: code } = await createSubaccount({ businessName, bankCode, accountNumber, email: user.email }));
  } catch (err) {
    console.error("[payouts] subaccount failed", err);
    return {
      status: "error",
      message: "Paystack couldn't verify those bank details. Check the bank and account number and try again.",
    };
  }

  const { error } = await adminClient().from("profiles").update({ paystack_subaccount_code: code }).eq("id", user.id);
  if (error) return { status: "error", message: "Saved with Paystack, but couldn't update your profile. Try again." };
  redirect("/dashboard?saved=payouts");
}
