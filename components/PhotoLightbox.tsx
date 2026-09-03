"use client";

import { useEffect, useRef } from "react";
import { resolveMediaUrl } from "../data/site";
import { ResortPhoto } from "./ResortPhoto";

export type LightboxPhoto = { image: string; label: string; copy?: string };

export function PhotoLightbox({ photos, active, onChange }: { photos: readonly LightboxPhoto[]; active: number | null; onChange: (index: number | null) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const current = active === null ? undefined : photos[active];
  useEffect(() => {
    if (current && !dialog.current?.open) {
      opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.current?.showModal();
    }
    if (!current && dialog.current?.open) dialog.current.close();
  }, [current]);
  const move = (direction: number) => { if (photos.length) onChange(((active ?? 0) + direction + photos.length) % photos.length); };
  const close = () => { onChange(null); opener.current?.focus(); };
  return <dialog className="photo-lightbox" ref={dialog} aria-label="Photograph preview" onCancel={close} onClose={close}
    onClick={event => { if (event.target === event.currentTarget) close(); }}
    onKeyDown={event => { if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1); } }}>
    {current && <div className="lightbox-content">
      <button className="lightbox-close" type="button" onClick={close} aria-label="Close photograph">Close ×</button>
      <div className="lightbox-image"
        onTouchStart={event => { const point = event.touches[0]; touch.current = event.touches.length === 1 ? { x: point.clientX, y: point.clientY } : null; }}
        onTouchCancel={() => { touch.current = null; }}
        onTouchEnd={event => { const start = touch.current; touch.current = null; const end = event.changedTouches[0]; if (!start || !end) return; const dx = end.clientX - start.x; const dy = end.clientY - start.y; if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) move(dx < 0 ? 1 : -1); }}>
        <ResortPhoto src={resolveMediaUrl(current.image)} alt={`${current.label}${current.copy ? ". " + current.copy : ""}`} priority contain sizes="90vw" />
      </div>
      <div className="lightbox-caption"><button type="button" aria-label="Previous photograph" onClick={() => move(-1)}>←</button><p aria-live="polite"><strong>{current.label}</strong>{current.copy && <span className="lightbox-description">{current.copy}</span>}<br />{(active ?? 0) + 1} / {photos.length}</p><button type="button" aria-label="Next photograph" onClick={() => move(1)}>→</button></div>
    </div>}
  </dialog>;
}
