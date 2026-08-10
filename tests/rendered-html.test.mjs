import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function renderedHtml(path = "index.html") {
  return readFile(new URL(`../out/${path}`, import.meta.url), "utf8");
}

test("exports the finished resort homepage", async () => {
  const html = await renderedHtml();
  assert.match(html, /DS Agro Tourism &amp; Resort/);
  assert.match(html, /Escape the city\./);
  assert.match(html, /Check on WhatsApp/);
  assert.match(html, /videos\.pexels\.com\/video-files\/4334522/);
  assert.match(html, /resort\/aerial\.webp/);
  assert.match(html, /resort\/resort-wide\.webp/);
  assert.match(html, /resort\/pool-lawn\.webp/);
  assert.match(html, /resort\/turf-aerial\.webp/);
  assert.match(html, /resort\/dining-area\.webp/);
  assert.match(html, />Rooms</);
  assert.match(html, />Amenities</);
  assert.match(html, />Activities</);
  assert.match(html, />T&amp;C</);
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

test("uses a varied property photo library across the detailed pages", async () => {
  const [amenities, activities, outing, gallery] = await Promise.all([
    renderedHtml("amenities/index.html"),
    renderedHtml("experiences/index.html"),
    renderedHtml("day-outing/index.html"),
    renderedHtml("gallery/index.html"),
  ]);

  assert.match(amenities, /resort\/pool-lawn\.webp/);
  assert.match(amenities, /resort\/lounge\.webp/);
  assert.match(activities, /resort\/horse-arena-aerial\.webp/);
  assert.match(activities, /resort\/turf-aerial\.webp/);
  assert.match(outing, /resort\/dining-area\.webp/);
  assert.match(gallery, /resort\/villa-living\.webp/);
  assert.match(gallery, /resort\/bathroom\.webp/);
});
