"use client";

import { useState } from "react";
import type { Page } from "../data/site";

export function InnerPageVisuals({ page }: { page: Page }) {
  const [active, setActive] = useState(0);
  const current = page.visuals[active];

  return <section className={`page-visual-story visual-${page.variant} section reveal`} aria-label={`${page.kicker} visual story`}>
    <div className="visual-story-head">
      <div><p className="eyebrow">{page.kicker} · Visual story</p><h2>{page.visualTitle}</h2></div>
      <p>Move across the photographs to explore the mood. Property-specific details and imagery are confirmed directly with the resort.</p>
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
        <span className="visual-photo" style={{ backgroundImage: `linear-gradient(0deg,rgba(8,29,19,.72),transparent 60%),url("${visual.image}")` }} />
        <span className="visual-index">0{index + 1}</span>
        <span className="visual-label">{visual.label}</span>
      </button>)}
    </div>

    <div className="visual-caption" key={current.label}>
      <span>0{active + 1}</span><div><strong>{current.label}</strong><p>{current.copy}</p></div>
      <div className="visual-progress">{page.visuals.map((_, index) => <i className={index === active ? "active" : ""} key={index} />)}</div>
    </div>
  </section>;
}
