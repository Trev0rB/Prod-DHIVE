"use client";

import { useActionState } from "react";
import { sendMagicLink, type SignInState } from "./actions";

export function SignInForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<SignInState, FormData>(sendMagicLink, { status: "idle" });

  if (state.status === "sent") {
    return (
      <div className="rounded-xl border border-ok/30 bg-emerald-50 p-6" role="status">
        <p className="font-display text-lg font-semibold">Check your inbox</p>
        <p className="mt-1 text-sm text-ink-soft">
          We sent a sign-in link to <span className="font-semibold text-ink">{state.email}</span>. Open it on this
          device to continue. It expires in an hour.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="email" className="text-sm font-semibold">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={state.status === "error" ? state.email : undefined}
          aria-invalid={state.status === "error"}
          aria-describedby={state.status === "error" ? "email-error" : undefined}
          placeholder="you@example.co.za"
          className="mt-1.5 h-11 w-full rounded-lg border border-line px-3 focus:border-brand focus:outline-none"
        />
        {state.status === "error" && (
          <p id="email-error" className="mt-1.5 text-sm text-red-600">
            {state.message}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="h-11 w-full rounded-lg bg-brand text-sm font-semibold text-paper hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Sending…" : "Email me a sign-in link"}
      </button>
      <p className="text-center text-xs text-ink-soft">No password needed. New here? This creates your account.</p>
    </form>
  );
}
