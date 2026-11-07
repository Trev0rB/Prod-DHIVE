import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Minimal Paystack client. Only used server-side; the secret key never reaches the browser.
 * Docs: https://paystack.com/docs/api/
 */

const API = "https://api.paystack.co";

export function paystackKey(): string | null {
  return process.env.PAYSTACK_SECRET_KEY || null;
}

type PaystackResponse<T> = { status: boolean; message: string; data: T };

async function call<T>(path: string, init: RequestInit = {}, fetchImpl: typeof fetch = fetch): Promise<T> {
  const key = paystackKey();
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set");
  const res = await fetchImpl(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...init.headers },
    cache: "no-store",
  });
  const body = (await res.json().catch(() => null)) as PaystackResponse<T> | null;
  if (!res.ok || !body?.status) {
    throw new Error(`Paystack ${path} failed (${res.status}): ${body?.message ?? "no response body"}`);
  }
  return body.data;
}

export type InitializeInput = {
  email: string;
  amountCents: number;
  reference: string;
  callbackUrl: string;
  subaccount: string;
  metadata: Record<string, string>;
};

/**
 * Start a split payment. The whole charge goes to the seller's subaccount (created with
 * percentage_charge 0), and the subaccount bears Paystack's fee, which the buyer has
 * already covered in amountCents. Net effect: seller gets the listing price, DHIVE gets 0.
 */
export function initializeTransaction(input: InitializeInput, fetchImpl?: typeof fetch) {
  return call<{ authorization_url: string; access_code: string; reference: string }>(
    "/transaction/initialize",
    {
      method: "POST",
      body: JSON.stringify({
        email: input.email,
        amount: input.amountCents,
        currency: "ZAR",
        reference: input.reference,
        callback_url: input.callbackUrl,
        subaccount: input.subaccount,
        bearer: "subaccount",
        metadata: JSON.stringify(input.metadata),
      }),
    },
    fetchImpl,
  );
}

export type VerifiedTransaction = {
  status: string;
  reference: string;
  amount: number;
  currency: string;
  paid_at: string | null;
};

export function verifyTransaction(reference: string, fetchImpl?: typeof fetch) {
  return call<VerifiedTransaction>(`/transaction/verify/${encodeURIComponent(reference)}`, {}, fetchImpl);
}

export type Bank = { name: string; code: string; active: boolean };

export function listBanks(fetchImpl?: typeof fetch) {
  return call<Bank[]>("/bank?country=south%20africa&currency=ZAR&perPage=100", {}, fetchImpl);
}

export function createSubaccount(
  input: { businessName: string; bankCode: string; accountNumber: string; email: string },
  fetchImpl?: typeof fetch,
) {
  return call<{ subaccount_code: string; account_name?: string | null }>(
    "/subaccount",
    {
      method: "POST",
      body: JSON.stringify({
        business_name: input.businessName,
        settlement_bank: input.bankCode,
        account_number: input.accountNumber,
        // 0% to DHIVE: the seller keeps the full split.
        percentage_charge: 0,
        primary_contact_email: input.email,
      }),
    },
    fetchImpl,
  );
}

/** Check a webhook's x-paystack-signature: hex HMAC-SHA512 of the raw body, keyed with the secret key. */
export function isValidWebhookSignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature || !secret) return false;
  const expected = createHmac("sha512", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

/** A verified Paystack transaction only completes an order if it's a success for exactly the order's amount. */
export function transactionSettlesOrder(
  tx: Pick<VerifiedTransaction, "status" | "amount" | "currency" | "reference">,
  order: { amountCents: number; reference: string },
): boolean {
  return (
    tx.status === "success" &&
    tx.reference === order.reference &&
    tx.currency === "ZAR" &&
    tx.amount === order.amountCents
  );
}

/** Unguessable order reference, e.g. "dh_m3x8k2_9f2c4a1b7e3d". */
export function newReference(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const rand = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `dh_${Date.now().toString(36)}_${rand}`;
}
