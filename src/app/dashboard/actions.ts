"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCategories } from "@/lib/catalog";
import { parseListingForm, uniqueSlug, type FieldErrors } from "@/lib/listing";
import { getMyListing, type ListingStatus } from "@/lib/seller";
import { serverClient } from "@/lib/supabase/server";

export type ListingFormState = { status: "idle" } | { status: "error"; errors: FieldErrors };

async function requireSeller() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?next=/dashboard");
  if (!user.isSeller) redirect("/sell");
  return user;
}

/** Catalog pages are cached; refresh them after any change that could affect what's public. */
function refreshCatalog(slug?: string) {
  updateTag("products");
  if (slug) updateTag(`product:${slug}`);
}

function dbError(message: string): ListingFormState {
  if (message.includes("products_published_has_file")) {
    return { status: "error", errors: { file: "Upload the file buyers will receive before publishing." } };
  }
  return { status: "error", errors: { form: "Couldn't save the listing. Try again." } };
}

export async function saveListing(_prev: ListingFormState, formData: FormData): Promise<ListingFormState> {
  const user = await requireSeller();
  const categories = (await getCategories()).map((c) => c.slug);
  const parsed = parseListingForm(formData, user.id, categories);
  if (!parsed.ok) return { status: "error", errors: parsed.errors };

  const { data } = parsed;
  const id = String(formData.get("id") ?? "");
  const publish = formData.get("intent") === "publish";
  const supabase = await serverClient();

  const fields = {
    title: data.title,
    summary: data.summary,
    description: data.description,
    category_slug: data.categorySlug,
    price_cents: data.priceCents,
    icon: data.icon,
    integrations: data.integrations,
    image_url: data.imageUrl,
    ...(data.file ? { file_path: data.file.path, file_name: data.file.name, file_size: data.file.size } : {}),
    ...(publish ? { status: "published" as const } : {}),
  };

  if (id) {
    const existing = await getMyListing(user.id, id);
    if (!existing) return { status: "error", errors: { form: "That listing no longer exists." } };
    const { error } = await supabase.from("products").update(fields).eq("id", id).eq("seller_id", user.id);
    if (error) return dbError(error.message);
    refreshCatalog(existing.slug);
  } else {
    const { error } = await supabase
      .from("products")
      .insert({ ...fields, seller_id: user.id, slug: uniqueSlug(data.title) });
    if (error) return dbError(error.message);
    refreshCatalog();
  }

  redirect(`/dashboard?saved=${publish ? "published" : "draft"}`);
}

const TRANSITIONS: Record<string, ListingStatus> = { publish: "published", unpublish: "draft", archive: "archived" };

export async function changeListingStatus(formData: FormData) {
  const user = await requireSeller();
  const id = String(formData.get("id") ?? "");
  const next = TRANSITIONS[String(formData.get("action") ?? "")];
  const listing = await getMyListing(user.id, id);
  if (!listing || !next) redirect("/dashboard");

  const supabase = await serverClient();
  const { error } = await supabase.from("products").update({ status: next }).eq("id", id).eq("seller_id", user.id);
  refreshCatalog(listing.slug);
  redirect(error ? "/dashboard?error=status" : `/dashboard?saved=${next}`);
}

export async function deleteDraft(formData: FormData) {
  const user = await requireSeller();
  const id = String(formData.get("id") ?? "");
  const listing = await getMyListing(user.id, id);
  if (!listing || listing.status !== "draft") redirect("/dashboard");

  const supabase = await serverClient();
  // RLS only allows deleting drafts; storage cleanup is best-effort.
  const { error } = await supabase.from("products").delete().eq("id", id).eq("seller_id", user.id);
  redirect(error ? "/dashboard?error=delete" : "/dashboard?saved=deleted");
}
