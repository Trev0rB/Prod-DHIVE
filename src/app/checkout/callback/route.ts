import { NextResponse, type NextRequest } from "next/server";
import { fulfilOrder, paymentsEnabled } from "@/lib/orders";

/** Paystack redirects the buyer here after paying. The webhook does the same work in the background. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const reference = searchParams.get("reference") ?? searchParams.get("trxref");
  const to = (path: string) => NextResponse.redirect(new URL(path, origin));

  if (!reference || !/^dh_[a-z0-9_]+$/.test(reference) || !paymentsEnabled()) return to("/account/purchases");

  try {
    const result = await fulfilOrder(reference);
    if (result === "paid" || result === "already_paid") return to("/account/purchases?paid=1");
    return to("/account/purchases?payment=pending");
  } catch (err) {
    console.error("[checkout] callback failed", err);
    return to("/account/purchases?payment=pending");
  }
}
