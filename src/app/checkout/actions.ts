"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { checkoutFor } from "@/lib/fees";
import { paymentsEnabled } from "@/lib/orders";
import { initializeTransaction, newReference } from "@/lib/paystack";
import { adminClient } from "@/lib/supabase/admin";
import { serverClient } from "@/lib/supabase/server";

async function requestOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_SITE_URL ?? "https://prod-dhive.vercel.app");
}

/** Buy (or claim, if free) a listing. Ends in a redirect: to Paystack, the library, or back with an error. */
export async function buyProduct(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const back = (err: string) => redirect(`/p/${encodeURIComponent(slug)}?checkout=${err}`);
  if (!/^[0-9a-f-]{36}$/i.test(productId)) back("invalid");

  const user = await getCurrentUser();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(`/p/${slug}`)}`);

  const supabase = await serverClient();
  const { data: product } = await supabase
    .from("products")
    .select("id, slug, title, price_cents, seller_id, status")
    .eq("id", productId)
    .eq("status", "published")
    .maybeSingle();
  if (!product) back("unavailable");

  // Already owned? Go straight to the library.
  const { data: owned } = await supabase
    .from("orders")
    .select("id")
    .eq("buyer_id", user.id)
    .eq("product_id", productId)
    .eq("status", "paid")
    .maybeSingle();
  if (owned) redirect("/account/purchases?owned=1");

  if (product!.price_cents === 0) {
    const { error } = await supabase.rpc("claim_free_product", { p_product_id: productId });
    if (error) back("failed");
    redirect("/account/purchases?claimed=1");
  }

  if (!paymentsEnabled()) back("disabled");
  if (product!.seller_id === user.id) back("own");

  const db = adminClient();
  const { data: seller } = await db
    .from("profiles")
    .select("paystack_subaccount_code")
    .eq("id", product!.seller_id)
    .single();
  if (!seller?.paystack_subaccount_code) back("seller-payouts");

  const { priceCents, feeCents, totalCents } = checkoutFor(product!.price_cents);
  const reference = newReference();
  const { data: order, error: orderError } = await db
    .from("orders")
    .insert({
      buyer_id: user.id,
      product_id: productId,
      seller_id: product!.seller_id,
      amount_cents: totalCents,
      price_cents: priceCents,
      fee_cents: feeCents,
      status: "pending",
      paystack_reference: reference,
    })
    .select("id")
    .single();
  if (orderError || !order) back("failed");

  let authorizationUrl: string;
  try {
    const tx = await initializeTransaction({
      email: user.email,
      amountCents: totalCents,
      reference,
      callbackUrl: `${await requestOrigin()}/checkout/callback`,
      subaccount: seller!.paystack_subaccount_code,
      metadata: { order_id: order!.id, product_id: productId, product: product!.title },
    });
    authorizationUrl = tx.authorization_url;
  } catch (err) {
    console.error("[checkout] initialize failed", err);
    await db.from("orders").update({ status: "failed" }).eq("id", order!.id);
    return back("failed");
  }
  redirect(authorizationUrl);
}
