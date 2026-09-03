import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";
import { site, gallery, mediaSlots } from "../scripts/load-media.mjs";
import { auditMedia } from "../scripts/check-media-duplicates.mjs";

test("marketing slots contain no repeated path, source identity or bytes", async () => {
  const report = await auditMedia();
  assert.equal(report.duplicates.length, 0);
  assert.equal(report.slots.length, 41);
  assert.equal(new Set(report.slots.map(item => item.path)).size, report.slots.length);
});

test("page heroes and stories use the audited central registry", () => {
  for (const [slug, page] of Object.entries(site.pages)) {
    const key = slug === "day-outing" ? "dayOuting" : slug;
    assert.equal(page.image, site.pageMedia[key].hero);
    if (key !== "gallery") assert.deepEqual(page.visuals.map(photo => photo.image), site.pageMedia[key].visualStory);
  }
  assert.deepEqual(site.experiences.map(item => item.image), Object.values(site.pageMedia.home.experiences));
  const nonRoom = [site.pageMedia.contact, site.pageMedia.terms, site.pageMedia.amenities, site.pageMedia.dining];
  assert.ok(mediaSlots(nonRoom).every(item => !/\/(bungalow|deluxe|super-deluxe|premium)\//.test(item.path)));
  assert.equal(site.pages.terms.visuals.length, 0);
});

test("Premium defaults preserve custom uploads, removals and correct categories", () => {
  assert.equal(site.roomCategoryBySlug["premium-room"], "premium");
  assert.equal(site.resolveRoomCover("premium-room", ""), null);
  assert.equal(site.resolveRoomCover("premium-room", "https://example.com/admin.webp"), "https://example.com/admin.webp");
  assert.equal(site.resolveRoomCover("premium-room", null), site.accommodationMedia.premium.cover);
  assert.ok(site.accommodationMedia.premium.gallery.every(path => path.includes("/premium/")));
  assert.equal(site.accommodationMedia.superDeluxe.gallery.length, 2);
  assert.ok(gallery.isRetiredGalleryImage("images/ds-agro/super-deluxe/ds-agro-super-deluxe-room-angle.webp"));
});

test("official import IDs are content-stable and independent of category order", async () => {
  const rows = gallery.officialGalleryRows;
  const ids = await Promise.all(rows.map(row => gallery.officialGalleryId(row.image_url)));
  assert.equal(new Set(ids).size, rows.length);
  assert.equal(await gallery.officialGalleryId(rows[0].image_url), await gallery.officialGalleryId("/" + rows[0].image_url));
  assert.match(ids[0], /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-a[0-9a-f]{3}-[0-9a-f]{12}$/);
});

test("local hero encodes are MP4 and bounded downloads", async () => {
  for (const [name, limit] of [["desktop", 9 * 1024 * 1024], ["mobile", 3 * 1024 * 1024]]) {
    const path = new URL("../public" + site.heroMedia[name], import.meta.url);
    assert.ok((await stat(path)).size < limit);
    assert.equal((await readFile(path)).subarray(4, 8).toString(), "ftyp");
  }
  const component = await readFile(new URL("../components/HeroVideo.tsx", import.meta.url), "utf8");
  for (const feature of ["autoPlay muted loop playsInline", "prefers-reduced-motion", "saveData", "onError", "visibilitychange", "IntersectionObserver"]) assert.ok(component.includes(feature));
  assert.doesNotMatch(component, /pexels|controls=/i);
});

test("loader has a hard deadline and galleries share keyboard/swipe preview", async () => {
  const loader = await readFile(new URL("../components/FirstVisitLoader.tsx", import.meta.url), "utf8");
  assert.match(loader, /sessionStorage/); assert.match(loader, /Skip intro/); assert.match(loader, /reduced \? 250 : 2980/);
  assert.match(loader, /catch/);
  assert.match(loader, /__dsIntro/);
  assert.match(await readFile(new URL("../app/visual-upgrade.css", import.meta.url), "utf8"), /serenity-safety-hide/);
  assert.match(await readFile(new URL("../app/visual-upgrade.css", import.meta.url), "utf8"), /serenity-safety-hide 0s \.35s forwards !important/);
  const lightbox = await readFile(new URL("../components/PhotoLightbox.tsx", import.meta.url), "utf8");
  for (const feature of ["showModal", "onCancel", "ArrowRight", "ArrowLeft", "onTouchEnd", "opener.current?.focus", "aria-live"]) assert.ok(lightbox.includes(feature));
  for (const name of ["GalleryCategories", "StayRoomCards"]) assert.match(await readFile(new URL(`../components/${name}.tsx`, import.meta.url), "utf8"), /<PhotoLightbox/);
});
