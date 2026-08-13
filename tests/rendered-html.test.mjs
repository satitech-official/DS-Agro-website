import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function renderedHtml(path = "index.html") {
  return readFile(new URL(`../out/${path}`, import.meta.url), "utf8");
}

function uniqueResortImages(html) {
  return new Set([...html.matchAll(/resort\/([a-z0-9-]+\.webp)/g)].map((match) => match[1]));
}

test("exports the finished resort homepage", async () => {
  const html = await renderedHtml();
  assert.match(html, /DS Agro Tourism &amp; Resort/);
  assert.match(html, /Escape the city\./);
  assert.match(html, /Check availability/);
  assert.match(html, /videos\.pexels\.com\/video-files\/4334522/);
  assert.match(html, /resort\/aerial\.webp/);
  assert.match(html, /resort\/turf-aerial\.webp/);
  assert.match(html, /resort\/dining-area\.webp/);
  assert.match(html, /resort\/room-white\.webp/);
  assert.match(html, /resort\/country-aerial\.webp/);
  assert.match(html, /resort\/villa-garden-exterior\.webp/);
  assert.equal(uniqueResortImages(html).size, 6, "homepage should render six different initial property photographs");
  assert.match(html, />Rooms</);
  assert.match(html, />Amenities</);
  assert.match(html, />Activities</);
  assert.match(html, />T&amp;C</);
  assert.match(html, /href="\/admin"[^>]*aria-label="Open admin dashboard"/);
  assert.match(html, /Admin Dashboard/);
  assert.match(html, /aria-current="page"[^>]*href="\/"|href="\/"[^>]*aria-current="page"/);
  assert.match(html, /918149428126/);
  assert.match(html, /4N9MusUsVUeHSG9E8/);
  assert.doesNotMatch(html, /chatgpt\.site|sites\.openai\.com/i);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Lorem Ipsum/i);
});

test("exports inner experience pages without fake booking claims", async () => {
  const html = await renderedHtml("stay/index.html");
  assert.match(html, /Stay close to nature\./);
  assert.match(html, /6 rooms/);
  assert.match(html, /2 BHK Villa \/ DS Bungalow/);
  assert.match(html, /₹2,999/);
  assert.match(html, /₹21,499/);
  assert.match(html, /Expected to be ready within 1 month/);
  assert.match(html, /resort\/dormitory\.webp/);
  assert.match(html, /Enquire on WhatsApp/);
  assert.match(html, /Rest\. Reconnect\. Repeat\./);
  assert.match(html, /visual-stay/);
  assert.doesNotMatch(html, /Confirm Booking|Book Now|available rooms|discount/i);
});

test("exports supplied amenities, activities, outing rates and terms", async () => {
  const [amenities, activities, outing, terms] = await Promise.all([
    renderedHtml("amenities/index.html"),
    renderedHtml("experiences/index.html"),
    renderedHtml("day-outing/index.html"),
    renderedHtml("terms/index.html"),
  ]);

  assert.match(amenities, /Swimming pool with attached deck/);
  assert.match(amenities, /Kids play area/);
  assert.match(activities, /Horse riding/);
  assert.match(activities, /Tyre climbing/);
  assert.match(outing, /₹850/);
  assert.match(outing, /₹1,150/);
  assert.match(outing, /Trampoline/);
  assert.match(terms, /Check-in: 2:00 PM/);
  assert.match(terms, /Pets are not allowed/);
  assert.match(terms, /Festival and New Year bookings are non-changeable and non-refundable/);
});

test("uses different hero and content photos across detailed pages", async () => {
  const [amenities, activities, outing] = await Promise.all([
    renderedHtml("amenities/index.html"),
    renderedHtml("experiences/index.html"),
    renderedHtml("day-outing/index.html"),
  ]);

  assert.match(amenities, /resort\/pool-lawn\.webp/);
  assert.match(amenities, /resort\/lounge\.webp/);
  assert.match(activities, /resort\/horse-arena-aerial\.webp/);
  assert.match(activities, /resort\/turf-close\.webp/);
  assert.match(outing, /resort\/country-aerial\.webp/);
  assert.match(outing, /resort\/suite-living\.webp/);
  assert.equal(uniqueResortImages(amenities).size, 4);
  assert.equal(uniqueResortImages(activities).size, 4);
  assert.equal(uniqueResortImages(outing).size, 4);
});

test("exports a categorized gallery with every photograph used once", async () => {
  const gallery = await renderedHtml("gallery/index.html");

  assert.match(gallery, /Resort &amp; Aerial Views/);
  assert.match(gallery, /Rooms &amp; Stays/);
  assert.match(gallery, /Activities &amp; Outdoors/);
  assert.match(gallery, /Amenities &amp; Shared Spaces/);
  assert.equal((gallery.match(/class="gallery-category-card"/g) ?? []).length, 30);
  assert.equal(uniqueResortImages(gallery).size, 31, "gallery hero and all 30 gallery photos should be different");
  assert.match(gallery, /resort\/villa-living\.webp/);
  assert.match(gallery, /resort\/bathroom\.webp/);
  assert.match(gallery, /resort\/horse-portrait\.webp/);
  assert.match(gallery, /resort\/turf-top\.webp/);
});

test("exports the live booking journey and protected admin entry points", async () => {
  const [booking, adminLogin, admin] = await Promise.all([
    renderedHtml("booking/index.html"),
    renderedHtml("admin/login/index.html"),
    renderedHtml("admin/index.html"),
  ]);

  assert.match(booking, /Plan your/);
  assert.match(booking, /Luxury Stay/);
  assert.match(booking, /live resort inventory/);
  assert.match(booking, /Booking progress/);
  assert.doesNotMatch(booking, /Confirm Booking|Guaranteed availability/);
  assert.match(adminLogin, /Secure workspace/);
  assert.match(adminLogin, /Welcome back/);
  assert.match(adminLogin, /Forgot password\?/);
  assert.doesNotMatch(adminLogin, /Set or reset password by email/);
  assert.match(admin, /Loading secure dashboard/);
});

test("ships an operational admin dashboard for bookings, inventory and gallery updates", async () => {
  const [source, publicGallery, migration] = await Promise.all([
    readFile(new URL("../components/AdminDashboard.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/GalleryCategories.tsx", import.meta.url), "utf8"),
    readFile(new URL("../supabase/migrations/20260813061200_gallery_management.sql", import.meta.url), "utf8"),
  ]);

  assert.match(source, /aria-current=.*activeTab/);
  assert.match(source, /Booking workspace/);
  assert.match(source, /View details/);
  assert.match(source, /Open WhatsApp/);
  assert.match(source, /paymentStatuses/);
  assert.match(source, /status saved as/);
  assert.match(source, /get_room_availability/);
  assert.match(source, /room_blocks/);
  assert.match(source, /Block selected dates/);
  assert.match(source, /Room block could not be removed/);
  assert.match(source, /Gallery workspace/);
  assert.match(source, /Add to gallery/);
  assert.match(source, /storage\.from\("gallery"\)\.upload/);
  assert.match(source, /Hidden and Archived items remain saved/);
  assert.match(source, /type="text" inputMode="url"/);
  assert.match(source, /deleteGalleryItem/);
  assert.match(publicGallery, /recordsToGalleryCategories/);
  assert.match(publicGallery, /\.eq\("status", "Published"\)/);
  assert.match(migration, /create policy gallery_assets_admin_insert/);
  assert.match(migration, /select private\.is_admin\(\)/);
  assert.equal((migration.match(/'resort\//g) ?? []).length, 30);
});
