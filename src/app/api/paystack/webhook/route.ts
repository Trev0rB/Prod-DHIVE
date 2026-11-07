import { NextResponse, type NextRequest } from "next/server";
import { fulfilOrder, paymentsEnabled } from "@/lib/orders";
import { isValidWebhookSignature, paystackKey } from "@/lib/paystack";

/**
 * Paystack webhook. Set this URL in Paystack → Settings → API Keys & Webhooks:
 *   https://<site>/api/paystack/webhook
 * Signature-checked, then every charge is re-verified with Paystack before an order is paid.
 */
export async function POST(request: NextRequest) {
  const raw = await request.text();
  const secret = paystackKey();
  if (!secret || !paymentsEnabled()) return new NextResponse("not configured", { status: 503 });
  if (!isValidWebhookSignature(raw, request.headers.get("x-paystack-signature"), secret)) {
    return new NextResponse("invalid signature", { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string } };
  try {
    event = JSON.parse(raw);
  } catch {
    return new NextResponse("bad json", { status: 400 });
  }

  if (event.event === "charge.success" && event.data?.reference?.startsWith("dh_")) {
    try {
      await fulfilOrder(event.data.reference);
    } catch (err) {
      // Non-2xx makes Paystack retry later.
      console.error("[webhook] fulfil failed", err);
      return new NextResponse("retry", { status: 500 });
    }
  }
  return NextResponse.json({ received: true });
}
