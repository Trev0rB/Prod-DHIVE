/** Validation for the seller listing form. Pure, so it's unit-tested and shared by actions. */

export type ListingInput = {
  title: string;
  summary: string;
  description: string;
  categorySlug: string;
  priceCents: number;
  icon: string;
  integrations: string[];
  imageUrl: string | null;
  /** Only present when a new file was uploaded in this submission. */
  file: { path: string; name: string; size: number } | null;
};

export type FieldErrors = Partial<Record<keyof ListingInput | "form", string>>;

export type ParseResult = { ok: true; data: ListingInput } | { ok: false; errors: FieldErrors };

const MAX_PRICE_CENTS = 10_000_000; // R100 000

/** "R 1 299,50", "1299.5", "1 299" → cents. Returns null if it isn't a sensible rand amount. */
export function parsePriceToCents(raw: string): number | null {
  const cleaned = raw.trim().replace(/^r\s*/i, "").replace(/[\s ]/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const cents = Math.round(Number(cleaned) * 100);
  return Number.isFinite(cents) && cents <= MAX_PRICE_CENTS ? cents : null;
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

/** Slug with a short random suffix so two sellers can use the same title. */
export function uniqueSlug(title: string, random: () => number = Math.random): string {
  const base = slugify(title) || "listing";
  const suffix = Math.floor(random() * 36 ** 4)
    .toString(36)
    .padStart(4, "0");
  return `${base}-${suffix}`;
}

type FormLike = { get(name: string): FormDataEntryValue | null };

const str = (form: FormLike, key: string) => {
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
};

/**
 * Validate a submitted listing form.
 * `sellerId` is used to check an uploaded file landed in the seller's own folder;
 * the database enforces the same rule, this just gives a friendly error.
 */
export function parseListingForm(form: FormLike, sellerId: string, validCategories: string[]): ParseResult {
  const errors: FieldErrors = {};

  const title = str(form, "title").replace(/\s+/g, " ");
  if (title.length < 3 || title.length > 120) errors.title = "Use 3 to 120 characters.";

  const summary = str(form, "summary").replace(/\s+/g, " ");
  if (summary.length < 10 || summary.length > 200) errors.summary = "Use 10 to 200 characters.";

  const description = str(form, "description");
  if (description.length > 5000) errors.description = "Keep it under 5 000 characters.";

  const categorySlug = str(form, "category");
  if (!validCategories.includes(categorySlug)) errors.categorySlug = "Pick a category.";

  const priceCents = parsePriceToCents(str(form, "price"));
  if (priceCents === null) errors.priceCents = "Enter a price in rand, like 499 or 1299.99 (0 for free).";

  const icon = [...(str(form, "icon") || "🤖")].slice(0, 2).join("");

  const integrations = [
    ...new Set(
      str(form, "integrations")
        .split(",")
        .map((s) => s.trim().replace(/\s+/g, " "))
        .filter(Boolean)
        .map((s) => s.slice(0, 30)),
    ),
  ].slice(0, 10);

  const imageUrl = str(form, "imageUrl") || null;
  if (imageUrl && !/^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\/listing-images\//.test(imageUrl)) {
    errors.imageUrl = "Upload the cover image again.";
  }

  let file: ListingInput["file"] = null;
  const filePath = str(form, "filePath");
  if (filePath) {
    const size = Number(str(form, "fileSize"));
    const name = str(form, "fileName").slice(0, 200);
    if (!filePath.startsWith(`${sellerId}/`) || filePath.includes("..") || !name || !Number.isFinite(size)) {
      errors.file = "Upload the file again.";
    } else {
      file = { path: filePath, name, size };
    }
  }

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    data: { title, summary, description, categorySlug, priceCents: priceCents!, icon, integrations, imageUrl, file },
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}
