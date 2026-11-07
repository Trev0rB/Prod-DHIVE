"use client";

import { useRef, useState } from "react";
import { formatBytes } from "@/lib/listing";
import { browserClient } from "@/lib/supabase/browser";

type Uploaded = { path: string; name: string; size: number; publicUrl?: string };

type Props = {
  bucket: "deliverables" | "listing-images";
  userId: string;
  label: string;
  hint: string;
  accept?: string;
  maxBytes: number;
  /** Shown when nothing new has been uploaded in this session. */
  current?: { name: string; size?: number | null; previewUrl?: string | null } | null;
  /** Names of the hidden inputs to fill once the upload finishes. */
  fields: { path?: string; name?: string; size?: string; publicUrl?: string };
  error?: string;
};

/** Uploads straight from the browser to Supabase Storage, into the user's own folder. */
export function FileUpload({ bucket, userId, label, hint, accept, maxBytes, current, fields, error }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [uploaded, setUploaded] = useState<Uploaded | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > maxBytes) {
      setStatus("error");
      setMessage(`That file is ${formatBytes(file.size)}. The limit is ${formatBytes(maxBytes)}.`);
      return;
    }
    setStatus("uploading");
    setMessage(null);

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-100) || "file";
    const path = `${userId}/${crypto.randomUUID()}/${safeName}`;
    const supabase = browserClient();
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, { contentType: file.type || "application/octet-stream", upsert: false });

    if (uploadError) {
      setStatus("error");
      setMessage("Upload failed. Check your connection and try again.");
      return;
    }
    const publicUrl =
      bucket === "listing-images" ? supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl : undefined;
    setUploaded({ path, name: file.name.slice(0, 200), size: file.size, publicUrl });
    setStatus("idle");
  }

  const shown = uploaded ?? (current ? { name: current.name, size: current.size ?? undefined } : null);
  const preview = uploaded?.publicUrl ?? current?.previewUrl ?? null;
  const shownError = message ?? error;

  return (
    <div>
      <p className="text-sm font-semibold">{label}</p>
      <p className="text-xs text-ink-soft">{hint}</p>
      <div className="mt-2 flex items-center gap-3 rounded-lg border border-dashed border-line p-3">
        {bucket === "listing-images" && preview && (
          // eslint-disable-next-line @next/next/no-img-element -- user-uploaded, arbitrary dimensions
          <img src={preview} alt="" className="size-14 rounded-md object-cover" />
        )}
        <div className="min-w-0 flex-1 text-sm">
          {status === "uploading" ? (
            <span className="text-ink-soft">Uploading…</span>
          ) : shown ? (
            <span className="block truncate">
              {shown.name}
              {shown.size ? <span className="text-ink-soft"> · {formatBytes(shown.size)}</span> : null}
              {uploaded && <span className="ml-1 text-emerald-700">✓ uploaded</span>}
            </span>
          ) : (
            <span className="text-ink-soft">No file yet</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={status === "uploading"}
          className="rounded-md border border-line bg-paper px-3 py-1.5 text-sm font-semibold hover:border-ink disabled:opacity-60"
        >
          {shown ? "Replace" : "Choose file"}
        </button>
        <input ref={input} type="file" accept={accept} onChange={onChange} className="hidden" />
      </div>
      {uploaded && (
        <>
          {fields.path && <input type="hidden" name={fields.path} value={uploaded.path} />}
          {fields.name && <input type="hidden" name={fields.name} value={uploaded.name} />}
          {fields.size && <input type="hidden" name={fields.size} value={uploaded.size} />}
          {fields.publicUrl && uploaded.publicUrl && (
            <input type="hidden" name={fields.publicUrl} value={uploaded.publicUrl} />
          )}
        </>
      )}
      {!uploaded && fields.publicUrl && current?.previewUrl && (
        <input type="hidden" name={fields.publicUrl} value={current.previewUrl} />
      )}
      {shownError && <p className="mt-1.5 text-sm text-red-600">{shownError}</p>}
    </div>
  );
}
