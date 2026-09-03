"use client";

import { useState } from "react";
import dimensions from "../data/photo-dimensions.json";

/** Static export has no image optimizer: serve checked-in, pre-sized WebP files. */
export function ResortPhoto({ src, alt, className = "", priority = false, sizes = "(max-width: 900px) 100vw, 50vw", contain = false }: {
  src: string | null; alt: string; className?: string; priority?: boolean; sizes?: string; contain?: boolean;
}) {
  const [failed, setFailed] = useState<string | null>(null);
  if (!src || failed === src) return <span className={`photo-pending ${className}`}>Photo awaiting verification</span>;
  const sizesByPath: Record<string, number[]> = dimensions;
  const localPath = src.replace(process.env.NEXT_PUBLIC_BASE_PATH ?? "", "").replace(/^\//, "");
  const responsive = !/^https?:/i.test(src) && Boolean(sizesByPath[localPath]);
  const variants = [src.replace(".webp", "-640.webp"), src.replace(".webp", "-1200.webp"), src];
  const srcSet = variants.map(path => {
    const size = sizesByPath[path.replace(process.env.NEXT_PUBLIC_BASE_PATH ?? "", "").replace(/^\//, "")];
    return size ? `${path} ${size[0]}w` : "";
  }).filter(Boolean).join(", ");
  return <picture className={`resort-photo ${className}${contain ? " photo-contain" : ""}`}>
    {responsive && <source type="image/webp" srcSet={srcSet} sizes={sizes} />}
    <img src={src} alt={alt} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} decoding="async" onError={() => setFailed(src)} />
  </picture>;
}
