import { galleryCategories, resolveMediaUrl, type GalleryCategory } from "../data/site";

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

export const galleryCategoryOptions = [...galleryCategories.map((category) => ({
  id: category.id,
  title: category.title,
})), { id: "rooms-stays", title: "Rooms & Stays (legacy)" }];

export function galleryCategoryLabel(categoryId: string) {
  return galleryCategoryOptions.find((category) => category.id === categoryId)?.title ?? categoryId;
}

export function resolveGalleryImageUrl(value: string) {
  return resolveMediaUrl(value.trim());
}

// Reviewed duplicates and wrongly labelled legacy photographs. Keep files/rows
// recoverable, but do not continue presenting these as verified room categories.
export const retiredGalleryFiles = new Set([
  "resort-wide.webp", "deluxe-room.webp", "premium-room.webp", "premium-room-alt.webp",
  "room-white.webp", "room-white-alt.webp", "suite-living.webp", "dormitory.webp",
  "dormitory-wide.webp", "dormitory-lounge.webp", "villa-exterior.webp", "villa-living.webp",
  "bathroom.webp", "lounge.webp", "horse-track.webp", "dining-area.webp", "villa-garden-exterior.webp",
]);

export function isRetiredGalleryImage(value: string) {
  const path = value.replace(process.env.NEXT_PUBLIC_BASE_PATH ?? "", "").replace(/^\//, "");
  if (path === "images/ds-agro/super-deluxe/ds-agro-super-deluxe-room-angle.webp") return true;
  return path.startsWith("resort/") && retiredGalleryFiles.has(path.slice(7));
}

// Content-derived UUIDs stay stable even when a new category is inserted.
export async function officialGalleryId(imageUrl: string) {
  const canonical = imageUrl.replace(process.env.NEXT_PUBLIC_BASE_PATH ?? "", "").replace(/^\//, "");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("ds-agro-official-gallery:" + canonical));
  const hex = Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

export const officialGalleryRows = galleryCategories.flatMap((category, categoryIndex) =>
  category.images.map((photo, index) => ({
    title: photo.label, category: category.id,
    image_url: photo.image.replace(process.env.NEXT_PUBLIC_BASE_PATH ?? "", "").replace(/^\//, ""),
    media_type: "image" as const, description: photo.copy, featured: false,
    display_order: (categoryIndex + 1) * 100 + index * 10, status: "Published" as const,
  })),
);

export function recordsToGalleryCategories(records: GalleryRecord[]): GalleryCategory[] {
  const grouped = new Map<string, GalleryRecord[]>();
  const seen = new Set<string>();
  records
    .filter((record) => record.media_type === "image" && record.status === "Published" && !isRetiredGalleryImage(record.image_url))
    .sort((a, b) => a.display_order - b.display_order || a.created_at.localeCompare(b.created_at))
    .forEach((record) => {
      const url = resolveGalleryImageUrl(record.image_url);
      if (seen.has(url)) return;
      seen.add(url);
      grouped.set(record.category, [...(grouped.get(record.category) ?? []), record]);
    });

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
