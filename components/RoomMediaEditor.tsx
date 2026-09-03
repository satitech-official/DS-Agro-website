"use client";

import { FormEvent, useEffect, useState } from "react";
import { galleryCategories, resolveMediaUrl, resolveRoomCover, roomCategoryBySlug } from "../data/site";
import { getSupabaseClient } from "../lib/supabase";
import { ResortPhoto } from "./ResortPhoto";

type Room = { id: string; name: string; slug: string; cover_image: string | null };
type Photo = { id: string; room_id: string; image_url: string; alt_text: string; display_order: number };
const selection = "id,room_id,image_url,alt_text,display_order";

export function RoomMediaEditor({ room }: { room: Room }) {
  const [cover, setCover] = useState(room.cover_image);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState(room.name + " at DS Agro Tourism & Resort");
  const [file, setFile] = useState<File | null>(null);
  const [target, setTarget] = useState("gallery");
  const [fileKey, setFileKey] = useState(0);
  const [preview, setPreview] = useState("");
  const defaults = galleryCategories.find(item => item.id === roomCategoryBySlug[room.slug])?.images ?? [];

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  async function loadPhotos() {
    const client = getSupabaseClient();
    if (!client) throw new Error("Admin service is not configured.");
    const result = await client.from("room_images").select(selection).eq("room_id", room.id).order("display_order");
    if (result.error) throw result.error;
    setPhotos(result.data as Photo[]);
    setLoaded(true);
  }

  async function run(action: () => Promise<void>) {
    if (busy) return;
    setBusy(true); setError(""); setMessage("");
    try { await action(); } catch (failure) {
      setError(failure instanceof Error ? failure.message : (failure as { message?: string })?.message || "Media could not be saved. Please try again.");
    } finally { setBusy(false); }
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    await run(async () => {
      const client = getSupabaseClient();
      if (!client) throw new Error("Admin service is not configured.");
      let imageUrl = url.trim();
      if (file) {
        const extension = ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as Record<string, string>)[file.type];
        if (!extension || file.size > 10 * 1024 * 1024) throw new Error("Choose a JPG, PNG or WebP file up to 10 MB.");
        const path = `rooms/${room.id}/${crypto.randomUUID()}.${extension}`;
        const upload = await client.storage.from("gallery").upload(path, file, { upsert: false, cacheControl: "31536000", contentType: file.type });
        if (upload.error) throw upload.error;
        imageUrl = client.storage.from("gallery").getPublicUrl(path).data.publicUrl;
      } else if (!/^https:\/\//i.test(imageUrl)) {
        throw new Error("Upload a photograph or supply an HTTPS image URL.");
      }
      // Decode first; a broken image must not replace a working cover.
      await new Promise<void>((resolve, reject) => {
        const image = new Image();
        const timeout = window.setTimeout(() => reject(new Error("Image could not be verified. Check its URL.")), 12000);
        image.onload = () => { window.clearTimeout(timeout); resolve(); };
        image.onerror = () => { window.clearTimeout(timeout); reject(new Error("Image could not be loaded. Current images were not changed.")); };
        image.src = resolveMediaUrl(imageUrl);
      });
      if (target === "cover") {
        const saved = await client.from("rooms").update({ cover_image: imageUrl }).eq("id", room.id).select("cover_image").single();
        if (saved.error) throw saved.error;
        setCover(saved.data.cover_image);
      } else {
        const saved = await client.from("room_images").insert({ room_id: room.id, image_url: imageUrl, alt_text: alt.trim() || room.name, display_order: (photos.at(-1)?.display_order ?? 0) + 10 }).select(selection).single();
        if (saved.error) throw saved.error;
        await loadPhotos();
      }
      setMessage(target === "cover" ? "Cover saved. Rooms and booking will use it on their next load." : "Room photograph saved.");
      setFile(null); setUrl(""); setFileKey(value => value + 1);
    });
  }

  async function importAlbum() {
    if (!window.confirm(`Add ${defaults.length} verified ${room.name} photographs? Existing images are kept.`)) return;
    await run(async () => {
      const client = getSupabaseClient();
      if (!client) return;
      for (const photo of defaults) {
        const response = await fetch(photo.image, { method: "HEAD" });
        if (!response.ok) throw new Error("Official assets are not deployed yet. Import after the website deployment finishes.");
      }
      const result = await client.from("room_images").upsert(defaults.map((photo, index) => ({
        room_id: room.id, image_url: photo.image.replace(process.env.NEXT_PUBLIC_BASE_PATH ?? "", ""), alt_text: photo.label, display_order: (index + 1) * 10,
      })), { onConflict: "room_id,image_url", ignoreDuplicates: true });
      if (result.error) throw result.error;
      await loadPhotos(); setMessage("Verified room album imported. Existing photographs were kept.");
    });
  }

  return <>
    <div className="stay-room-photo"><ResortPhoto src={resolveRoomCover(room.slug, cover)} alt={room.name + " cover"} /></div>
    <details className="room-media-editor" onToggle={event => { if (event.currentTarget.open && !loaded && !busy) void run(loadPhotos); }}>
      <summary>Manage room photographs</summary>
      <p className="media-note">Cover appears on Rooms and Booking. This room album is separate from the public Gallery. Only photographs of this room type should be added.</p>
      {error && <p className="media-editor-error" role="alert">{error}</p>}
      {message && <p className="media-editor-status" role="status">{message}</p>}
      {!loaded && <button type="button" disabled={busy} onClick={() => void run(loadPhotos)}>{busy ? "Loading…" : "Load room album"}</button>}
      {loaded && <>
        <form onSubmit={save}>
          <label>Update<select value={target} onChange={event => setTarget(event.target.value)}><option value="gallery">Add to room album</option><option value="cover">Replace cover</option></select></label>
          <label>Upload photograph<input key={fileKey} type="file" accept="image/jpeg,image/png,image/webp" onChange={event => { const selected = event.target.files?.[0] ?? null; setFile(selected); setPreview(selected ? URL.createObjectURL(selected) : ""); }} /></label>
          <label>Or HTTPS image URL<input type="url" value={url} onChange={event => setUrl(event.target.value)} placeholder="https://…" /></label>
          <label>Image description<input value={alt} onChange={event => setAlt(event.target.value)} maxLength={200} required /></label>
          {(file || /^https:\/\//i.test(url)) && <div className="stay-room-photo"><ResortPhoto src={file ? preview : url} alt="New room photograph preview" contain /></div>}
          <button disabled={busy}>{busy ? "Saving…" : "Save photograph"}</button>
        </form>
        {defaults.length > 0 && <button type="button" disabled={busy} onClick={() => void importAlbum()}>Import verified room album</button>}
        <button type="button" disabled={busy} onClick={() => {
          if (!window.confirm("Remove this room cover? The original file will be kept.")) return;
          void run(async () => {
            const result = await getSupabaseClient()!.from("rooms").update({ cover_image: "" }).eq("id", room.id).select("id").single();
            if (result.error) throw result.error;
            setCover(""); setMessage("Cover removed. Stored file retained for recovery.");
          });
        }}>Remove cover</button>
        {photos.length === 0 && <p className="media-note">No saved room album yet.</p>}
        {photos.map(photo => <div className="room-media-row" key={photo.id}>
          <div className="stay-room-photo"><ResortPhoto src={resolveMediaUrl(photo.image_url)} alt={photo.alt_text} contain /></div>
          <p className="media-note">{photo.alt_text}</p>
          <form onSubmit={event => {
            event.preventDefault();
            const order = Number(new FormData(event.currentTarget).get("order"));
            void run(async () => {
              if (!Number.isInteger(order) || order < 0 || order > 9999) throw new Error("Use a whole-number order from 0 to 9999.");
              const result = await getSupabaseClient()!.from("room_images").update({ display_order: order }).eq("id", photo.id).eq("room_id", room.id).select("id").single();
              if (result.error) throw result.error;
              await loadPhotos(); setMessage("Photo order saved. Lower numbers appear first.");
            });
          }}>
            <label>Display order<input name="order" type="number" min={0} max={9999} defaultValue={photo.display_order} required /></label>
            <button disabled={busy}>Save order</button>
            <button type="button" disabled={busy} onClick={() => {
              if (!window.confirm("Remove this photograph from the room album? The stored file will be kept.")) return;
              void run(async () => {
                const result = await getSupabaseClient()!.from("room_images").delete().eq("id", photo.id).eq("room_id", room.id).select("id").single();
                if (result.error) throw result.error;
                await loadPhotos(); setMessage("Photograph removed from the album. File retained.");
              });
            }}>Remove photo</button>
          </form>
        </div>)}
      </>}
    </details>
  </>;
}
