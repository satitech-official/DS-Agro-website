"use client";

import { useEffect, useRef, useState } from "react";
import { heroMedia } from "../data/site";
import { ResortPhoto } from "./ResortPhoto";

/** Load only the appropriate encode, never the desktop file on a phone. */
export function HeroVideo() {
  const video = useRef<HTMLVideoElement>(null);
  const pausedByGuest = useRef(false);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: EventTarget & { saveData?: boolean } }).connection;
    let visible = true;
    let allowed = true;
    const play = () => {
      if (allowed && visible && !document.hidden && !pausedByGuest.current) {
        void element.play().catch(() => { /* Autoplay blocked: the official poster stays visible. */ });
      } else element.pause();
    };
    const configure = () => {
      allowed = !motion.matches && !connection?.saveData;
      if (!allowed) { element.pause(); element.removeAttribute("src"); element.load(); return; }
      const source = matchMedia("(max-width: 767px)").matches ? heroMedia.mobile : heroMedia.desktop;
      if (element.getAttribute("src") !== source) { element.src = source; element.load(); }
      play();
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; play(); }, { threshold: 0.05 });
    observer.observe(element);
    configure();
    motion.addEventListener("change", configure);
    connection?.addEventListener("change", configure);
    document.addEventListener("visibilitychange", play);
    return () => {
      observer.disconnect(); element.pause();
      motion.removeEventListener("change", configure);
      connection?.removeEventListener("change", configure);
      document.removeEventListener("visibilitychange", play);
    };
  }, []);
  return <>
    <div className="hero-media">
      <ResortPhoto src={heroMedia.poster} alt="The real DS Agro property surrounded by countryside" priority sizes="100vw" />
      <video ref={video} className={ready ? "is-ready" : ""} autoPlay muted loop playsInline preload="metadata" poster={heroMedia.poster} aria-hidden="true"
        onPlaying={() => { setReady(true); setPlaying(true); window.dispatchEvent(new Event("ds-hero-ready")); }}
        onPause={() => setPlaying(false)} onEmptied={() => { setReady(false); setPlaying(false); }}
        onError={() => { setReady(false); setPlaying(false); }} />
    </div>
    {ready && <button type="button" className="hero-video-toggle" aria-label={playing ? "Pause background video" : "Play background video"} onClick={() => {
      const element = video.current;
      if (!element) return;
      pausedByGuest.current = playing;
      if (playing) element.pause(); else void element.play().catch(() => setReady(false));
    }}>{playing ? "Ⅱ Pause film" : "▷ Play film"}</button>}
  </>;
}
