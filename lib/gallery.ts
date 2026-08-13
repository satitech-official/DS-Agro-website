import { galleryCategories, type GalleryCategory } from "../data/site";
import { appHref } from "./supabase";

export type GalleryRecord = {
  id: string;
  title: string;
  category: string;
  image_url: string;
  thumbnail_url: string | null;
  media_type: "image" | "video";
  description: string | null;
  featured: boolean;
  display_order: number;
  status: "Published" | "Hidden" | "Archived";
  created_at: string;
};

export const galleryRecordSelect = "id,title,category,image_url,thumbnail_url,media_type,description,featured,display_order,status,created_at";

export const galleryCategoryOptions = galleryCategories.map((category) => ({
  id: category.id,
  title: category.title,
}));

export function galleryCategoryLabel(categoryId: string) {
  return galleryCategoryOptions.find((category) => category.id === categoryId)?.title ?? categoryId;
}

export function resolveGalleryImageUrl(value: string) {
  const trimmed = value.trim();
  if (/^(https?:|data:|blob:)/i.test(trimmed)) return trimmed;
  return appHref(`/${trimmed.replace(/^\/+/, "")}`);
}

export function recordsToGalleryCategories(records: GalleryRecord[]): GalleryCategory[] {
  const grouped = new Map<string, GalleryRecord[]>();
  records
    .filter((record) => record.media_type === "image" && record.status === "Published")
    .sort((a, b) => a.display_order - b.display_order || a.created_at.localeCompare(b.created_at))
    .forEach((record) => grouped.set(record.category, [...(grouped.get(record.category) ?? []), record]));

  const knownOrder = new Map(galleryCategoryOptions.map((category, index) => [category.id, index]));
  return [...grouped.entries()]
    .sort(([left], [right]) => (knownOrder.get(left) ?? 1000) - (knownOrder.get(right) ?? 1000) || left.localeCompare(right))
    .map(([categoryId, items]) => {
      const existing = galleryCategories.find((category) => category.id === categoryId);
      return {
        id: existing?.id ?? categoryId.replace(/[^a-z0-9-]+/gi, "-").toLowerCase(),
        title: existing?.title ?? categoryId,
        eyebrow: existing?.eyebrow ?? "Gallery collection",
        description: existing?.description ?? "A curated collection from DS Agro Tourism & Resort.",
        images: items.map((item) => ({
          image: resolveGalleryImageUrl(item.image_url),
          label: item.title,
          copy: item.description || "A moment from DS Agro Tourism & Resort.",
        })),
      };
    });
}
