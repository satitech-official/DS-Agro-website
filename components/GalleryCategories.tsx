"use client";

import { useEffect, useRef, useState } from "react";
import { galleryCategories, type GalleryCategory } from "../data/site";
import { galleryRecordSelect, recordsToGalleryCategories, type GalleryRecord } from "../lib/gallery";
import { getSupabaseClient } from "../lib/supabase";
import { ResortPhoto } from "./ResortPhoto";

export function GalleryCategories() {
  const [categories, setCategories] = useState<GalleryCategory[]>(galleryCategories);
  const [filter, setFilter] = useState("all");
  const [activeImage, setActiveImage] = useState<number | null>(null);
  const [offline, setOffline] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const visible = categories.filter(category => filter === "all" || category.id === filter);
  const photos = visible.flatMap(category => category.images);
  const current = activeImage === null ? null : photos[activeImage];

  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) return;
    let active = true;
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 8000);
    Promise.resolve(client.from("gallery").select(galleryRecordSelect)
      .eq("status", "Published").eq("media_type", "image")
      .order("display_order", { ascending: true }).abortSignal(controller.signal))
      .then(({ data, error }) => {
        if (!active) return;
        if (error) { setOffline(true); return; }
        setCategories(recordsToGalleryCategories((data ?? []) as GalleryRecord[]));
      }).catch(() => { if (active) setOffline(true); })
      .finally(() => window.clearTimeout(timer));
    return () => { active = false; controller.abort(); window.clearTimeout(timer); };
  }, []);

  useEffect(() => {
    if (current && !dialog.current?.open) dialog.current?.showModal();
    if (!current && dialog.current?.open) dialog.current?.close();
  }, [current]);

  function closePreview() {
    setActiveImage(null);
    opener.current?.focus();
  }

  return <section className="gallery-categories section" aria-labelledby="gallery-categories-title">
    <div className="gallery-categories-heading">
      <div><p className="eyebrow">Property gallery</p><h2 id="gallery-categories-title">Explore by category.</h2></div>
      <p>Official resort photography, carefully grouped. Choose a category and open any photograph for a full view.</p>
    </div>
    <nav className="gallery-category-nav" aria-label="Gallery categories">
      <button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>All <span>{categories.reduce((count, item) => count + item.images.length, 0)}</span></button>
      {categories.map(category => <button type="button" aria-pressed={filter === category.id} onClick={() => setFilter(category.id)} key={category.id}>{category.title} <span>{category.images.length}</span></button>)}
    </nav>
    {offline && <p className="media-note" role="status">Showing the curated resort collection. Live gallery updates are temporarily unavailable.</p>}
    <div className="gallery-category-list">
      {visible.length === 0 && <div className="empty-state"><strong>No published photographs in this category yet.</strong><p>Choose All to explore the other collections.</p></div>}
      {visible.map((category, categoryIndex) => <section className="gallery-category-block" id={`gallery-${category.id}`} aria-labelledby={`gallery-${category.id}-title`} key={category.id}>
        <header><span>{String(categoryIndex + 1).padStart(2, "0")}</span><div><p className="eyebrow">{category.eyebrow}</p><h3 id={`gallery-${category.id}-title`}>{category.title}</h3></div><p>{category.description}</p></header>
        <div className="gallery-category-grid">
          {category.images.map((photo, photoIndex) => <figure className="gallery-category-card" key={photo.image}>
            <button type="button" className="gallery-open" aria-label={`Open ${photo.label}`} onClick={event => { opener.current = event.currentTarget; setActiveImage(photos.findIndex(item => item.image === photo.image)); }}>
              <ResortPhoto className="gallery-category-photo" src={photo.image} alt={`${photo.label} at DS Agro Tourism & Resort. ${photo.copy}`} sizes="(max-width: 900px) 88vw, 60vw" />
            </button>
            <figcaption><span>{String(photoIndex + 1).padStart(2, "0")}</span><strong>{photo.label}</strong><p>{photo.copy}</p></figcaption>
          </figure>)}
        </div>
      </section>)}
    </div>
    <dialog className="photo-lightbox" ref={dialog} aria-label="Photograph preview" onCancel={closePreview} onClose={closePreview} onClick={event => { if (event.target === event.currentTarget) closePreview(); }} onKeyDown={event => {
      if (!current) return;
      if (event.key === "ArrowRight") { event.preventDefault(); setActiveImage(((activeImage ?? 0) + 1) % photos.length); }
      if (event.key === "ArrowLeft") { event.preventDefault(); setActiveImage(((activeImage ?? 0) - 1 + photos.length) % photos.length); }
    }}>
      {current && <div className="lightbox-content">
        <button className="lightbox-close" type="button" onClick={closePreview} aria-label="Close photograph">Close ×</button>
        <div className="lightbox-image"><ResortPhoto src={current.image} alt={`${current.label}. ${current.copy}`} priority contain sizes="90vw" /></div>
        <div className="lightbox-caption"><button type="button" aria-label="Previous photograph" onClick={() => setActiveImage(((activeImage ?? 0) - 1 + photos.length) % photos.length)}>←</button><p aria-live="polite"><strong>{current.label}</strong><br />{(activeImage ?? 0) + 1} / {photos.length}</p><button type="button" aria-label="Next photograph" onClick={() => setActiveImage(((activeImage ?? 0) + 1) % photos.length)}>→</button></div>
      </div>}
    </dialog>
  </section>;
}
