"use client";

import { useActionState } from "react";
import type { Bank } from "@/lib/paystack";
import { setUpPayouts, type PayoutState } from "./actions";

const input = "mt-1.5 w-full rounded-lg border border-line px-3 py-2.5 text-sm focus:border-brand focus:outline-none";

export function PayoutForm({ banks, defaultName }: { banks: Pick<Bank, "name" | "code">[]; defaultName: string }) {
  const [state, action, pending] = useActionState<PayoutState, FormData>(setUpPayouts, { status: "idle" });
  return (
    <form action={action} className="space-y-5">
      <label className="block">
        <span className="text-sm font-semibold">Account holder / business name</span>
        <input name="businessName" required minLength={2} maxLength={100} defaultValue={defaultName} className={input} />
      </label>
      <label className="block">
        <span className="text-sm font-semibold">Bank</span>
        <select name="bankCode" required defaultValue="" className={input}>
          <option value="" disabled>
            Choose your bank…
          </option>
          {banks.map((b) => (
            <option key={b.code} value={b.code}>
              {b.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-sm font-semibold">Account number</span>
        <input name="accountNumber" required inputMode="numeric" autoComplete="off" className={input} />
      </label>
      {state.status === "error" && (
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-lg bg-brand px-6 text-sm font-semibold text-paper hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Verifying with Paystack…" : "Save payout account"}
      </button>
      <p className="text-xs text-ink-soft">
        Your bank details go straight to Paystack, which pays you out. DHIVE never stores your account number.
      </p>
    </form>
  );
}
