import type { MetadataRoute } from "next";
import { pages } from "../data/site";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://ds-agro-tourism-resort.sites.openai.com";
  return [{ url: base, priority: 1 }, ...Object.keys(pages).map(slug => ({ url: `${base}/${slug}`, priority: .7 }))];
}
