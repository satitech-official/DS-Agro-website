"use client";

import { useEffect } from "react";

const VIMEO_BACKGROUND_URL =
  "https://player.vimeo.com/video/772640871?background=1&autoplay=1&loop=1&muted=1&autopause=0&title=0&byline=0&portrait=0&dnt=1";

export function HeroVideoOverlay() {
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(".hero-v2");
    if (!hero || hero.querySelector(".hero-video-restored")) return;

    const style = document.createElement("style");
    style.dataset.dsHeroVideo = "true";
    style.textContent = `
      .hero-v2{isolation:isolate}
      .hero-v2 .hero-image{z-index:0}
      .hero-v2 .hero-video-restored{position:absolute;inset:0;overflow:hidden;z-index:1;opacity:0;transition:opacity 1.1s ease;pointer-events:none;background:#102a1e}
      .hero-v2 .hero-video-restored.is-ready{opacity:1}
      .hero-v2 .hero-video-restored iframe{position:absolute;top:50%;left:50%;width:max(100%,177.78vh);height:max(100%,56.25vw);min-width:100%;min-height:100%;transform:translate(-50%,-50%);border:0;pointer-events:none;filter:saturate(.9) contrast(1.06) brightness(.78)}
      .hero-v2 .hero-shade{z-index:2}
      .hero-v2 .hero-grid-lines,.hero-v2 .sun-orb,.hero-v2 .floating-leaf{z-index:3}
      .hero-v2 .hero-copy,.hero-v2 .hero-stat-strip,.hero-v2 .hero-note{z-index:4}
      @media (prefers-reduced-motion: reduce){.hero-v2 .hero-video-restored{display:none}}
    `;
    document.head.appendChild(style);

    const shell = document.createElement("div");
    shell.className = "hero-video-restored";
    shell.setAttribute("aria-hidden", "true");

    const iframe = document.createElement("iframe");
    iframe.src = VIMEO_BACKGROUND_URL;
    iframe.title = "";
    iframe.tabIndex = -1;
    iframe.loading = "eager";
    iframe.allow = "autoplay; fullscreen; picture-in-picture";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.addEventListener("load", () => shell.classList.add("is-ready"), { once: true });

    shell.appendChild(iframe);
    hero.prepend(shell);

    return () => {
      shell.remove();
      style.remove();
    };
  }, []);

  return null;
}
