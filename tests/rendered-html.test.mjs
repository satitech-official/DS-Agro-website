import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

async function readExport(path = "index.html") {
  return readFile(new URL(`../out/${path}`, import.meta.url), "utf8");
}

test("exports the finished resort homepage", async () => {
  const html = await readExport();
  assert.match(html, /DS Agro Tourism &amp; Resort/);
  assert.match(html, /Escape the city\./);
  assert.match(html, /Check on WhatsApp/);
  assert.match(html, /918149428126/);
  assert.match(html, /4N9MusUsVUeHSG9E8/);
  assert.match(html, /DS-Agro-website\/experiences\//);
  assert.doesNotMatch(html, /media\/farming-fields\.mp4/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Lorem Ipsum/i);
});

test("exports inner experience pages without fake booking claims", async () => {
  const html = await readExport("stay/index.html");
  assert.match(html, /Stay close to nature\./);
  assert.match(html, /confirmed directly by the resort team/);
  assert.match(html, /Enquire on WhatsApp/);
  assert.match(html, /Rest\. Reconnect\. Repeat\./);
  assert.match(html, /visual-stay/);
  assert.doesNotMatch(html, /Confirm Booking|Book Now|available rooms|discount/i);
});

test("exports SEO and deployment assets", async () => {
  const robots = await readExport("robots.txt");
  const sitemap = await readExport("sitemap.xml");
  assert.match(robots, /satitech-official\.github\.io\/DS-Agro-website\/sitemap\.xml/);
  assert.match(sitemap, /satitech-official\.github\.io\/DS-Agro-website\/stay\//);
});
