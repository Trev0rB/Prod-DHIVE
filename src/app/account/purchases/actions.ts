"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { serverClient } from "@/lib/supabase/server";

/** Send the buyer to a 60-second signed URL for something they've bought. */
export async function downloadPurchase(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?next=/account/purchases");
  if (!/^[0-9a-f-]{36}$/i.test(productId)) redirect("/account/purchases");

  const supabase = await serverClient();
  // Returns null unless the caller has a paid order for this product.
  const { data: path } = await supabase.rpc("purchased_file_path", { p_product_id: productId });
  if (typeof path !== "string" || !path) redirect("/account/purchases?error=download");

  const fileName = path.split("/").pop() ?? "download";
  const { data, error } = await supabase.storage
    .from("deliverables")
    .createSignedUrl(path, 60, { download: fileName });
  if (error || !data?.signedUrl) redirect("/account/purchases?error=download");
  redirect(data.signedUrl);
}
