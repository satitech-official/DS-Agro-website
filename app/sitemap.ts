import type { MetadataRoute } from "next";
import { pages } from "../data/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://satitech-official.github.io/DS-Agro-website";
  return [
    { url: `${base}/`, priority: 1 },
    { url: `${base}/booking/`, priority: .9 },
    ...Object.keys(pages).map(slug => ({ url: `${base}/${slug}/`, priority: .7 })),
  ];
}
