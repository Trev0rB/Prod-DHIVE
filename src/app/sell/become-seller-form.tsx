"use client";

import { useActionState } from "react";
import { becomeSeller, type BecomeSellerState } from "./actions";

export function BecomeSellerForm() {
  const [state, action, pending] = useActionState<BecomeSellerState, FormData>(becomeSeller, { status: "idle" });
  return (
    <form action={action} className="space-y-4">
      <ul className="space-y-2 text-sm text-ink-soft">
        <li>✓ You keep 100% of every sale. DHIVE takes no commission.</li>
        <li>✓ You only list things you own or have the right to sell.</li>
        <li>✓ Buyers get the file you upload, so make sure it works.</li>
      </ul>
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="terms" required className="mt-0.5 size-4 accent-[var(--color-brand)]" />
        <span>
          I agree to the{" "}
          <a href="/seller-terms" target="_blank" className="font-semibold underline">
            seller terms
          </a>
          .
        </span>
      </label>
      {state.status === "error" && (
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-lg bg-honey px-6 text-sm font-semibold text-ink hover:bg-amber-400 disabled:opacity-60"
      >
        {pending ? "Setting up…" : "Open my seller account"}
      </button>
    </form>
  );
}
