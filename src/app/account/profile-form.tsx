"use client";

import { useActionState } from "react";
import { updateProfile, type ProfileState } from "./actions";

export function ProfileForm({ displayName }: { displayName: string }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(updateProfile, { status: "idle" });
  return (
    <form action={action} className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label htmlFor="displayName" className="text-sm font-semibold">
          Display name
        </label>
        <p className="text-xs text-ink-soft">Shown on your listings and reviews.</p>
        <input
          id="displayName"
          name="displayName"
          defaultValue={displayName}
          required
          minLength={2}
          maxLength={60}
          className="mt-1.5 h-11 w-full rounded-lg border border-line px-3 focus:border-brand focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-lg bg-ink px-5 text-sm font-semibold text-paper hover:bg-brand disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save"}
      </button>
      <p aria-live="polite" className="text-sm sm:w-full sm:basis-full">
        {state.status === "saved" && <span className="text-emerald-700">Saved.</span>}
        {state.status === "error" && <span className="text-red-600">{state.message}</span>}
      </p>
    </form>
  );
}
