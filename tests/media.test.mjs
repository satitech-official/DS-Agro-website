import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../data/site.ts", import.meta.url), "utf8");
const moduleUrl = "data:text/javascript;base64," + Buffer.from(ts.transpile(source, { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 })).toString("base64");
const site = await import(moduleUrl);
const manifest = JSON.parse(await readFile(new URL("../data/photo-sources.json", import.meta.url), "utf8"));

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
