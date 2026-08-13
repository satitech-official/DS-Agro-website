"use client";

import { useEffect, useState } from "react";
import { galleryCategories, type GalleryCategory } from "../data/site";
import { galleryRecordSelect, recordsToGalleryCategories, type GalleryRecord } from "../lib/gallery";
import { getSupabaseClient } from "../lib/supabase";


export function GalleryCategories() {
  const [categories, setCategories] = useState<GalleryCategory[]>(galleryCategories);

  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) return;

    let active = true;
    client.from("gallery")
      .select(galleryRecordSelect)
      .eq("status", "Published")
      .eq("media_type", "image")
      .order("display_order", { ascending: true })
      .then(({ data, error }) => {
        if (!active || error) return;
        setCategories(recordsToGalleryCategories((data ?? []) as GalleryRecord[]));
      });

    return () => { active = false; };
  }, []);

  return <section className="gallery-categories section" aria-labelledby="gallery-categories-title">
    <div className="gallery-categories-heading">
      <div>
        <p className="eyebrow">Property gallery</p>
        <h2 id="gallery-categories-title">Explore by category.</h2>
      </div>
      <p>Every photograph below is shown once and placed in one clear category, so you can explore the resort without repeated images.</p>
    </div>

    <nav className="gallery-category-nav" aria-label="Gallery categories">
      {categories.map((category, index) => <a href={`#gallery-${category.id}`} key={category.id}>
        <span>{String(index + 1).padStart(2, "0")}</span>{category.title}
      </a>)}
    </nav>

    <div className="gallery-category-list">
      {categories.length === 0 && <div className="empty-state"><strong>Gallery updates are coming soon.</strong><p>Please check again shortly.</p></div>}
      {categories.map((category, categoryIndex) => <section
        className="gallery-category-block reveal"
        id={`gallery-${category.id}`}
        aria-labelledby={`gallery-${category.id}-title`}
        key={category.id}
      >
        <header>
          <span>{String(categoryIndex + 1).padStart(2, "0")}</span>
          <div><p className="eyebrow">{category.eyebrow}</p><h3 id={`gallery-${category.id}-title`}>{category.title}</h3></div>
          <p>{category.description}</p>
        </header>

        <div className="gallery-category-grid">
          {category.images.map((photo, photoIndex) => <figure className="gallery-category-card" key={photo.image}>
            <span
              className="gallery-category-photo"
              style={{ backgroundImage: `linear-gradient(0deg,rgba(10,31,21,.68),transparent 55%),url("${photo.image}")` }}
              role="img"
              aria-label={`${photo.label}. ${photo.copy}`}
            />
            <figcaption><span>{String(photoIndex + 1).padStart(2, "0")}</span><strong>{photo.label}</strong><p>{photo.copy}</p></figcaption>
          </figure>)}
        </div>
      </section>)}
    </div>
  </section>;
}
