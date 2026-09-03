"use client";

import { useState } from "react";
import type { Page } from "../data/site";
import { ResortPhoto } from "./ResortPhoto";

export function InnerPageVisuals({ page }: { page: Page }) {
  const [active, setActive] = useState(0);
  const current = page.visuals[active];
  if (!current) return null;

  return <section className={`page-visual-story visual-${page.variant} section reveal`} aria-label={`${page.kicker} visual story`}>
    <div className="visual-story-head">
      <div><p className="eyebrow">{page.kicker} · Visual story</p><h2>{page.visualTitle}</h2></div>
      <p>Move across real DS Agro Tourism & Resort photographs to explore the rooms, setting and experiences.</p>
    </div>

    <div className="visual-stage">
      {page.visuals.map((visual, index) => <button
        type="button"
        className={`visual-card ${active === index ? "active" : ""}`}
        onMouseEnter={() => setActive(index)}
        onFocus={() => setActive(index)}
        onClick={() => setActive(index)}
        aria-pressed={active === index}
        aria-label={`${visual.label}: ${visual.copy}`}
        key={visual.image}
      >
        <span className="visual-photo"><ResortPhoto src={visual.image} alt={`${visual.label}. ${visual.copy}`} /></span>
        <span className="visual-index">{String(index + 1).padStart(2, "0")}</span>
        <span className="visual-label">{visual.label}</span>
      </button>)}
    </div>

    <div className="visual-caption" key={current.label}>
      <span>{String(active + 1).padStart(2, "0")}</span><div><strong>{current.label}</strong><p>{current.copy}</p></div>
      <div className="visual-progress">{page.visuals.map((_, index) => <i className={index === active ? "active" : ""} key={index} />)}</div>
    </div>
  </section>;
}
