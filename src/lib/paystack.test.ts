import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createSubaccount,
  initializeTransaction,
  isValidWebhookSignature,
  newReference,
  transactionSettlesOrder,
  verifyTransaction,
} from "./paystack";

const SECRET = "sk_test_unit";

beforeEach(() => vi.stubEnv("PAYSTACK_SECRET_KEY", SECRET));
afterEach(() => vi.unstubAllEnvs());

function fakeFetch(body: unknown, status = 200) {
  return vi.fn(async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch & {
    mock: { calls: [string, RequestInit][] };
  };
}

describe("isValidWebhookSignature", () => {
  const body = JSON.stringify({ event: "charge.success", data: { reference: "dh_x" } });
  const good = createHmac("sha512", SECRET).update(body).digest("hex");

  it("accepts Paystack's HMAC-SHA512 over the raw body", () => {
    expect(isValidWebhookSignature(body, good, SECRET)).toBe(true);
  });
  it("rejects tampering, wrong keys, SHA-256 and missing headers", () => {
    expect(isValidWebhookSignature(body + " ", good, SECRET)).toBe(false);
    expect(isValidWebhookSignature(body, good, "sk_test_other")).toBe(false);
    expect(isValidWebhookSignature(body, createHmac("sha256", SECRET).update(body).digest("hex"), SECRET)).toBe(false);
    expect(isValidWebhookSignature(body, null, SECRET)).toBe(false);
    expect(isValidWebhookSignature(body, good, "")).toBe(false);
  });
});

describe("transactionSettlesOrder", () => {
  const order = { amountCents: 51_741, reference: "dh_1" };
  const tx = { status: "success", amount: 51_741, currency: "ZAR", reference: "dh_1" };
  it("settles only a successful ZAR charge for the exact amount and reference", () => {
    expect(transactionSettlesOrder(tx, order)).toBe(true);
    expect(transactionSettlesOrder({ ...tx, status: "abandoned" }, order)).toBe(false);
    expect(transactionSettlesOrder({ ...tx, amount: 100 }, order)).toBe(false);
    expect(transactionSettlesOrder({ ...tx, currency: "NGN" }, order)).toBe(false);
    expect(transactionSettlesOrder({ ...tx, reference: "dh_2" }, order)).toBe(false);
  });
});

describe("Paystack API calls", () => {
  it("initializes a split payment where the seller's subaccount bears the fee", async () => {
    const f = fakeFetch({ status: true, message: "ok", data: { authorization_url: "https://checkout.paystack.com/x", access_code: "x", reference: "dh_1" } });
    const data = await initializeTransaction(
      { email: "b@x.co", amountCents: 51_741, reference: "dh_1", callbackUrl: "https://d/cb", subaccount: "ACCT_1", metadata: { order_id: "o1" } },
      f,
    );
    expect(data.authorization_url).toContain("checkout.paystack.com");
    const [url, init] = f.mock.calls[0];
    expect(url).toBe("https://api.paystack.co/transaction/initialize");
    expect(init.headers).toMatchObject({ Authorization: `Bearer ${SECRET}` });
    expect(JSON.parse(init.body as string)).toMatchObject({
      amount: 51_741,
      currency: "ZAR",
      subaccount: "ACCT_1",
      bearer: "subaccount",
      reference: "dh_1",
    });
  });

  it("creates subaccounts with a 0% platform share", async () => {
    const f = fakeFetch({ status: true, message: "ok", data: { subaccount_code: "ACCT_9" } });
    await createSubaccount({ businessName: "Bosch", bankCode: "632005", accountNumber: "123", email: "s@x.co" }, f);
    expect(JSON.parse(f.mock.calls[0][1].body as string)).toMatchObject({ percentage_charge: 0, settlement_bank: "632005" });
  });

  it("surfaces Paystack errors", async () => {
    const f = fakeFetch({ status: false, message: "Invalid key" }, 401);
    await expect(verifyTransaction("dh_1", f)).rejects.toThrow(/Invalid key/);
  });

  it("refuses to call Paystack without a key", async () => {
    vi.stubEnv("PAYSTACK_SECRET_KEY", "");
    await expect(verifyTransaction("dh_1", fakeFetch({}))).rejects.toThrow(/not set/);
  });
});

describe("newReference", () => {
  it("is unique and URL-safe", () => {
    const refs = new Set(Array.from({ length: 500 }, newReference));
    expect(refs.size).toBe(500);
    for (const r of refs) expect(r).toMatch(/^dh_[a-z0-9]+_[0-9a-f]{16}$/);
  });
});
