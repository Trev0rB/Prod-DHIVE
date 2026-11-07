import "server-only";
import { paystackKey, transactionSettlesOrder, verifyTransaction } from "./paystack";
import { adminClient, hasAdmin } from "./supabase/admin";

/** Paid checkout needs both keys; free claims and downloads work without them. */
export function paymentsEnabled(): boolean {
  return Boolean(paystackKey()) && hasAdmin();
}

export type FulfilResult = "paid" | "already_paid" | "not_settled" | "unknown_order";

/**
 * Re-verify a reference with Paystack and, if it settles the order, mark it paid.
 * Safe to call any number of times, from the redirect callback and the webhook alike:
 * we never trust the caller, only Paystack's own answer.
 */
export async function fulfilOrder(reference: string): Promise<FulfilResult> {
  const db = adminClient();
  const { data: order } = await db
    .from("orders")
    .select("id, status, amount_cents, paystack_reference")
    .eq("paystack_reference", reference)
    .maybeSingle();
  if (!order) return "unknown_order";
  if (order.status === "paid") return "already_paid";

  const tx = await verifyTransaction(reference);
  if (!transactionSettlesOrder(tx, { amountCents: order.amount_cents, reference })) {
    if (tx.status === "failed" || tx.status === "abandoned") {
      await db.from("orders").update({ status: "failed" }).eq("id", order.id).eq("status", "pending");
    }
    return "not_settled";
  }

  const { data: updated, error } = await db
    .from("orders")
    .update({ status: "paid", paid_at: tx.paid_at ?? new Date().toISOString() })
    .eq("id", order.id)
    .eq("status", "pending")
    .select("id");

  // A concurrent call (or an earlier paid order for the same item) got there first.
  if (error?.code === "23505" || (!error && updated?.length === 0)) return "already_paid";
  if (error) throw new Error(`Couldn't mark order paid: ${error.message}`);

  return "paid";
}
