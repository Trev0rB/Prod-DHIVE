"use client";

import { useActionState } from "react";
import { FileUpload } from "@/components/file-upload";
import type { Category } from "@/lib/types";
import { saveListing, type ListingFormState } from "./actions";

export type ListingDefaults = {
  id?: string;
  title?: string;
  summary?: string;
  description?: string;
  categorySlug?: string;
  price?: string;
  icon?: string;
  integrations?: string;
  imageUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  status?: "draft" | "published" | "archived";
};

const input =
  "mt-1.5 w-full rounded-lg border border-line px-3 py-2.5 text-sm focus:border-brand focus:outline-none aria-invalid:border-red-400";

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      {hint && <span className="block text-xs text-ink-soft">{hint}</span>}
      {children}
      {error && <span className="mt-1.5 block text-sm text-red-600">{error}</span>}
    </label>
  );
}

export function ListingForm({
  userId,
  categories,
  defaults = {},
}: {
  userId: string;
  categories: Category[];
  defaults?: ListingDefaults;
}) {
  const [state, action, pending] = useActionState<ListingFormState, FormData>(saveListing, { status: "idle" });
  const errors = state.status === "error" ? state.errors : {};
  const isLive = defaults.status === "published";

  return (
    <form action={action} className="space-y-6">
      {defaults.id && <input type="hidden" name="id" value={defaults.id} />}

      {errors.form && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {errors.form}
        </p>
      )}

      <div className="grid grid-cols-[72px_1fr] gap-4 sm:grid-cols-[80px_1fr] sm:gap-6">
        <Field label="Icon" error={errors.icon}>
          <input name="icon" defaultValue={defaults.icon ?? "🤖"} maxLength={8} className={`${input} text-center text-2xl`} />
        </Field>
        <Field label="Title" error={errors.title}>
          <input
            name="title"
            required
            minLength={3}
            maxLength={120}
            defaultValue={defaults.title}
            aria-invalid={Boolean(errors.title)}
            placeholder="WhatsApp Lead Qualifier Bot"
            className={input}
          />
        </Field>
      </div>

      <Field label="Short summary" hint="One line shown on cards and in search. 10–200 characters." error={errors.summary}>
        <input
          name="summary"
          required
          minLength={10}
          maxLength={200}
          defaultValue={defaults.summary}
          aria-invalid={Boolean(errors.summary)}
          placeholder="Captures and scores leads on WhatsApp, 24/7."
          className={input}
        />
      </Field>

      <Field label="Description" hint="What buyers get, how to set it up, and what it needs." error={errors.description}>
        <textarea
          name="description"
          rows={7}
          maxLength={5000}
          defaultValue={defaults.description}
          aria-invalid={Boolean(errors.description)}
          className={input}
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Category" error={errors.categorySlug}>
          <select
            name="category"
            required
            defaultValue={defaults.categorySlug ?? ""}
            aria-invalid={Boolean(errors.categorySlug)}
            className={input}
          >
            <option value="" disabled>
              Choose…
            </option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Price (rand)" hint="Use 0 for a free listing." error={errors.priceCents}>
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-3 mt-[3px] -translate-y-1/2 text-sm text-ink-soft">
              R
            </span>
            <input
              name="price"
              required
              inputMode="decimal"
              defaultValue={defaults.price}
              aria-invalid={Boolean(errors.priceCents)}
              placeholder="499"
              className={`${input} pl-7`}
            />
          </div>
        </Field>
      </div>

      <Field label="Works with" hint="Comma separated, e.g. WhatsApp, Gmail, Notion." error={errors.integrations}>
        <input name="integrations" defaultValue={defaults.integrations} className={input} />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <FileUpload
          bucket="deliverables"
          userId={userId}
          label="File buyers receive"
          hint="Zip, PDF, template… up to 50 MB. Kept private until someone buys."
          maxBytes={50 * 1024 * 1024}
          current={defaults.fileName ? { name: defaults.fileName, size: defaults.fileSize } : null}
          fields={{ path: "filePath", name: "fileName", size: "fileSize" }}
          error={errors.file}
        />
        <FileUpload
          bucket="listing-images"
          userId={userId}
          label="Cover image (optional)"
          hint="PNG, JPG or WebP, up to 5 MB."
          accept="image/png,image/jpeg,image/webp"
          maxBytes={5 * 1024 * 1024}
          current={defaults.imageUrl ? { name: "Current cover image", previewUrl: defaults.imageUrl } : null}
          fields={{ publicUrl: "imageUrl" }}
          error={errors.imageUrl}
        />
      </div>

      <div className="flex flex-wrap gap-3 border-t border-line pt-6">
        <button
          type="submit"
          name="intent"
          value="publish"
          disabled={pending}
          className="h-11 rounded-lg bg-brand px-6 text-sm font-semibold text-paper hover:bg-brand-dark disabled:opacity-60"
        >
          {pending ? "Saving…" : isLive ? "Save changes" : "Publish"}
        </button>
        {!isLive && (
          <button
            type="submit"
            name="intent"
            value="draft"
            disabled={pending}
            className="h-11 rounded-lg border border-line px-6 text-sm font-semibold hover:border-ink disabled:opacity-60"
          >
            Save as draft
          </button>
        )}
      </div>
    </form>
  );
}
