"use client";

import { useEffect } from "react";

const VIDEO_SOURCES = [
  "https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4",
  "https://cdn.coverr.co/videos/coverr-cloudy-sky-2765/1080p.mp4",
];

export function HeroVideoOverlay() {
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(".hero-v2");
    if (!hero || hero.querySelector(".hero-video-restored")) return;

    const style = document.createElement("style");
    style.dataset.dsHeroVideo = "true";
    style.textContent = `
      .hero-v2{isolation:isolate}
      .hero-v2 .hero-image{z-index:0}
      .hero-v2 .hero-video-restored{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;z-index:1;opacity:0;filter:saturate(.9) contrast(1.06) brightness(.82);transition:opacity 1.2s ease;pointer-events:none}
      .hero-v2 .hero-video-restored.is-ready{opacity:1}
      .hero-v2 .hero-shade{z-index:2}
      .hero-v2 .hero-grid-lines,.hero-v2 .sun-orb,.hero-v2 .floating-leaf{z-index:3}
      .hero-v2 .hero-copy,.hero-v2 .hero-stat-strip,.hero-v2 .hero-note{z-index:4}
      @media (prefers-reduced-motion: reduce){.hero-v2 .hero-video-restored{display:none}}
    `;
    document.head.appendChild(style);

    const video = document.createElement("video");
    video.className = "hero-video-restored";
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.setAttribute("aria-hidden", "true");
    video.setAttribute("disablePictureInPicture", "true");
    video.poster = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2200&q=90";

    VIDEO_SOURCES.forEach((src) => {
      const source = document.createElement("source");
      source.src = src;
      source.type = "video/mp4";
      video.appendChild(source);
    });

    const showVideo = () => video.classList.add("is-ready");
    video.addEventListener("canplay", showVideo, { once: true });
    hero.prepend(video);
    video.play().catch(() => {
      // The poster image remains visible when a browser blocks autoplay.
    });

    return () => {
      video.removeEventListener("canplay", showVideo);
      video.remove();
      style.remove();
    };
  }, []);

  return null;
}
