import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../data/site.ts", import.meta.url), "utf8");
const moduleUrl = "data:text/javascript;base64," + Buffer.from(ts.transpile(source, { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 })).toString("base64");
const site = await import(moduleUrl);
const manifest = JSON.parse(await readFile(new URL("../data/photo-sources.json", import.meta.url), "utf8"));
const gallerySource = await readFile(new URL("../lib/gallery.ts", import.meta.url), "utf8");
const galleryModule = ts.transpile(gallerySource.replace('"../data/site"', JSON.stringify(moduleUrl)), { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 });
const gallery = await import("data:text/javascript;base64," + Buffer.from(galleryModule).toString("base64"));

function galleryRecord(overrides = {}) {
  return { id: "test-image", title: "Verified room", category: "deluxe", image_url: "/images/ds-agro/deluxe/example.webp", thumbnail_url: null, media_type: "image", description: "A verified room photograph.", featured: false, display_order: 10, status: "Published", created_at: "2026-09-03T00:00:00Z", ...overrides };
}

test("managed gallery respects visibility and does not restore an empty catalog", () => {
  assert.deepEqual(gallery.recordsToGalleryCategories([]), []);
  const categories = gallery.recordsToGalleryCategories([
    galleryRecord(),
    galleryRecord({ id: "hidden", image_url: "/hidden.webp", status: "Hidden" }),
    galleryRecord({ id: "archived", image_url: "/archived.webp", status: "Archived" }),
    galleryRecord({ id: "video", image_url: "/video.mp4", media_type: "video" }),
    galleryRecord({ id: "legacy", image_url: "resort/dormitory.webp" }),
  ]);
  assert.equal(categories.length, 1);
  assert.equal(categories[0].images.length, 1);
  assert.equal(categories[0].images[0].label, "Verified room");
});

test("managed gallery deduplicates relative URLs and preserves uploaded photos", () => {
  const categories = gallery.recordsToGalleryCategories([
    galleryRecord(),
    galleryRecord({ id: "duplicate", image_url: "images/ds-agro/deluxe/example.webp" }),
    galleryRecord({ id: "uploaded", image_url: "https://example.com/uploaded.webp", display_order: 0 }),
  ]);
  assert.equal(categories[0].images.length, 2);
  assert.equal(categories[0].images[0].image, "https://example.com/uploaded.webp");
});

test("admin official import shares the curated public mapping", () => {
  assert.equal(gallery.officialGalleryRows.length, 33);
  assert.equal(new Set(gallery.officialGalleryRows.map(row => row.image_url)).size, 33);
  assert.ok(gallery.officialGalleryRows.every(row => row.status === "Published" && !gallery.isRetiredGalleryImage(row.image_url)));
});

test("only publishes verified source ranges with different room covers", () => {
  assert.equal(manifest.length, 23);
  for (const photo of manifest) {
    const number = Number(photo.source.match(/DSC(\d+)/)[1]);
    const correct = photo.path.includes("/bungalow/") ? number >= 2934 && number <= 2959
      : photo.path.includes("/super-deluxe/") ? number >= 2998 && number <= 3005
      : number >= 3040 && number <= 3076;
    assert.ok(correct, photo.source);
  }
  assert.equal(new Set(Object.values(site.roomCoverBySlug)).size, 3);
  assert.equal(site.roomCoverBySlug["premium-room"], undefined);
  assert.equal(site.resolveRoomCover("dormitory", "/resort/dormitory.webp"), null);
  assert.equal(site.resolveRoomCover("premium-room", "/resort/premium-room.webp"), null);
});

test("admin custom room covers and deliberate removals override default mapping", () => {
  assert.equal(site.resolveRoomCover("deluxe-room", "https://example.com/custom.webp"), "https://example.com/custom.webp");
  assert.equal(site.resolveRoomCover("deluxe-room", ""), null);
  assert.equal(site.resolveRoomCover("deluxe-room", "/resort/deluxe-room.webp"), site.accommodationMedia.deluxe.cover);
  assert.equal(site.resolveRoomCover("super-deluxe-room", null), site.accommodationMedia.superDeluxe.cover);
});

test("gallery contains 33 distinct images in six verified categories", () => {
  const images = site.galleryCategories.flatMap(category => category.images);
  assert.equal(images.length, 33);
  assert.equal(site.galleryCategories.length, 6);
  assert.equal(new Set(images.map(photo => photo.image)).size, 33);
  assert.ok(images.every(photo => photo.label.length > 4));
});

test("every referenced photo and responsive derivative exists and is optimized", async () => {
  const photos = new Set([
    ...Object.values(site.resortImages),
    ...site.galleryCategories.flatMap(category => category.images.map(photo => photo.image)),
    ...Object.values(site.pages).flatMap(page => [page.image, ...page.visuals.map(photo => photo.image)]),
  ]);
  for (const path of photos) {
    for (const variant of [path, path.replace(".webp", "-640.webp"), path.replace(".webp", "-1200.webp")]) {
      const size = (await stat(new URL("../public" + variant, import.meta.url))).size;
      assert.ok(size > 100 && size < 1024 * 1024, variant + " must remain under 1 MB");
    }
  }
  const hashes = await Promise.all(manifest.map(async photo => createHash("sha256").update(await readFile(new URL("../public/" + photo.path, import.meta.url))).digest("hex")));
  assert.equal(new Set(hashes).size, manifest.length);
});

test("GitHub Pages paths are prefixed once, never twice", async () => {
  const prefix = "/DS-Agro-website";
  const code = ts.transpile(source.replace('process.env.NEXT_PUBLIC_BASE_PATH ?? ""', JSON.stringify(prefix)), { module: ts.ModuleKind.ESNext });
  const deployed = await import("data:text/javascript;base64," + Buffer.from(code).toString("base64"));
  assert.equal(deployed.resolveMediaUrl("/resort/aerial.webp"), prefix + "/resort/aerial.webp");
  assert.equal(deployed.resolveMediaUrl(prefix + "/resort/aerial.webp"), prefix + "/resort/aerial.webp");
  assert.equal(deployed.resolveRoomCover("deluxe-room", prefix + "/resort/deluxe-room.webp"), deployed.accommodationMedia.deluxe.cover);
});

test("preserves database, auth, inventory and payment schemas in the media feature", async () => {
  const roomEditor = await readFile(new URL("../components/RoomMediaEditor.tsx", import.meta.url), "utf8");
  assert.match(roomEditor, /cover_image/);
  assert.match(roomEditor, /room_images/);
  assert.match(roomEditor, /display_order/);
  assert.doesNotMatch(roomEditor, /from\("(bookings|admins|customers|room_blocks)"\)/);
  assert.doesNotMatch(roomEditor, /service_role|secret_key/);
});
