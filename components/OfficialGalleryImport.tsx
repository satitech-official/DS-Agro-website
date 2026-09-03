"use client";

import { useState } from "react";
import { isRetiredGalleryImage, officialGalleryRows, officialGalleryId, resolveGalleryImageUrl, type GalleryRecord } from "../lib/gallery";
import { getSupabaseClient } from "../lib/supabase";

export function OfficialGalleryImport({ onComplete }: { onComplete: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function importPhotos() {
    if (!window.confirm("Import the verified official collection and archive the old mislabelled/duplicate local photos? Custom uploads, hidden images and stored files will be kept.")) return;
    setBusy(true); setMessage("");
    try {
      const client = getSupabaseClient();
      if (!client) throw new Error("Admin service is unavailable.");
      const current = await client.from("gallery").select("id,image_url,status");
      if (current.error) throw current.error;
      const rows = current.data as Pick<GalleryRecord, "id" | "image_url" | "status">[];
      const existing = new Set(rows.map(row => resolveGalleryImageUrl(row.image_url)));
      const missing = officialGalleryRows.filter(row => !existing.has(resolveGalleryImageUrl(row.image_url)));
      for (const row of missing) {
        const response = await fetch(resolveGalleryImageUrl(row.image_url), { method: "HEAD" });
        if (!response.ok) throw new Error("Official assets are not deployed yet. No records changed.");
      }
      if (missing.length) {
        // Stable IDs make simultaneous imports safe without replacing admin edits.
        const imports = await Promise.all(missing.map(async row => ({ ...row, id: await officialGalleryId(row.image_url) })));
        const result = await client.from("gallery").upsert(imports, { onConflict: "id", ignoreDuplicates: true });
        if (result.error) throw result.error;
      }
      for (const row of rows.filter(row => row.status === "Published" && isRetiredGalleryImage(row.image_url))) {
        const result = await client.from("gallery").update({ status: "Archived" }).eq("id", row.id).eq("image_url", row.image_url).eq("status", "Published");
        if (result.error) throw result.error;
      }
      await onComplete();
      setMessage("Official collection imported. Custom uploads, hidden records and stored files were preserved.");
    } catch (error) {
      setMessage((error as { message?: string })?.message || "Import could not finish. Retry safely when the service is available.");
    } finally { setBusy(false); }
  }
  return <div><button type="button" className="media-import-button" disabled={busy} onClick={() => void importPhotos()}>{busy ? "Importing…" : "Import official resort photos"}</button><p className="media-note" role="status">{message || "One-time import: verified photos, correct categories, no changes to bookings or rates."}</p></div>;
}
