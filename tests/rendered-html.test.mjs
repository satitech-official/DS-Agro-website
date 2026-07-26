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
  assert.match(html, /aria-current="page"[^>]*href="\/"|href="\/"[^>]*aria-current="page"/);
  assert.match(html, /918149428126/);
  assert.match(html, /4N9MusUsVUeHSG9E8/);
  assert.doesNotMatch(html, /chatgpt\.site|sites\.openai\.com/i);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Lorem Ipsum/i);
});

test("exports inner experience pages without fake booking claims", async () => {
  const html = await renderedHtml("stay/index.html");
  assert.match(html, /Stay close to nature\./);
  assert.match(html, /confirmed directly by the resort team/);
  assert.match(html, /Enquire on WhatsApp/);
  assert.match(html, /Rest\. Reconnect\. Repeat\./);
  assert.match(html, /visual-stay/);
  assert.doesNotMatch(html, /Confirm Booking|Book Now|available rooms|discount/i);
});
