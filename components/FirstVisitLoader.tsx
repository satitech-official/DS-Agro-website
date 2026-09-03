"use client";

import { useEffect, useRef, useState } from "react";

let seenInMemory = false;
const key = "ds-loader-seen";
// Run during HTML parsing, before hydration: no late overlay on a slow device.
const preflight = `(function(){if(!window.__dsIntro){var seen=false;try{seen=sessionStorage.getItem("ds-loader-seen")==="1"}catch(e){}window.__dsIntro={start:performance.now(),seen:seen};document.documentElement.dataset.dsIntro=seen?"seen":"new"}})()`;
function rememberVisit() {
  seenInMemory = true;
  try { sessionStorage.setItem(key, "1"); } catch { /* Private/restricted storage must not block entry. */ }
}

export function FirstVisitLoader() {
  const [phase, setPhase] = useState<"checking" | "growing" | "leaving" | "done">("checking");
  const finish = useRef<() => void>(() => {});
  useEffect(() => {
    const arrival = (window as Window & { __dsIntro?: { start: number; seen: boolean } }).__dsIntro;
    const start = arrival?.start ?? performance.now();
    let seen = seenInMemory || arrival?.seen;
    try { seen ||= sessionStorage.getItem(key) === "1"; } catch { /* In-memory fallback. */ }
    const timers: number[] = [];
    const after = (fn: () => void, delay: number) => { timers.push(window.setTimeout(fn, delay)); };
    if (seen || performance.now() - start >= 2980) { rememberVisit(); after(() => setPhase("done"), 0); return () => timers.forEach(clearTimeout); }
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    let finishing = false;
    const leave = () => {
      if (finishing) return;
      finishing = true; rememberVisit(); setPhase("leaving");
      document.documentElement.style.overflow = previousOverflow;
      after(() => setPhase("done"), reduced ? 100 : 420);
    };
    finish.current = leave;
    after(() => setPhase("growing"), 0);
    // Finish the brand reveal gracefully when video is ready; never wait on media.
    const mediaReady = () => after(leave, Math.max(0, 2600 - (performance.now() - start)));
    window.addEventListener("ds-hero-ready", mediaReady, { once: true });
    after(leave, Math.max(0, (reduced ? 250 : 2980) - (performance.now() - start)));
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("ds-hero-ready", mediaReady);
      document.documentElement.style.overflow = previousOverflow;
    };
  }, []);
  if (phase === "done") return null;
  return <><script dangerouslySetInnerHTML={{ __html: preflight }} /><div className={`serenity-loader ${phase}`} aria-label="Opening DS Agro Tourism & Resort">
    <button type="button" className="serenity-skip" onClick={() => finish.current()}>Skip intro <span>→</span></button>
    <div className="serenity-dawn" aria-hidden="true" />
    <div className="serenity-scene" aria-hidden="true">
      <div className="serenity-halo" />
      <svg viewBox="0 0 280 230" fill="none">
        <ellipse className="serenity-seed" cx="140" cy="164" rx="4" ry="7" fill="currentColor" transform="rotate(25 140 164)" />
        <path className="serenity-soil" d="M22 174 Q140 171 258 174" />
        <ellipse className="serenity-ripple" cx="140" cy="174" rx="54" ry="7" />
        <path className="serenity-root" pathLength="1" d="M140 174 Q136 187 144 199 M139 184 L128 191 M141 190 L151 196" />
        <path className="serenity-stem" pathLength="1" d="M140 173 Q130 143 143 108 Q149 88 140 69" />
        <path className="serenity-leaf left" d="M138 138 C110 135 92 115 91 99 C121 99 139 112 138 138Z" />
        <path className="serenity-leaf right" d="M144 115 C171 107 185 85 184 72 C157 77 144 91 144 115Z" />
      </svg>
    </div>
    <div className="serenity-brand"><strong>DS</strong><p>Agro Tourism <span>& Resort</span></p><small>From soil to serenity.</small></div>
    <span className="serenity-caption">From seed to serenity</span>
  </div></>;
}
