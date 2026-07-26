import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the finished resort homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /DS Agro Tourism &amp; Resort/);
  assert.match(html, /Escape the city\./);
  assert.match(html, /Check on WhatsApp/);
  assert.match(html, /media\/farming-fields\.mp4/);
  assert.match(html, /aria-current="page"[^>]*href="\/"|href="\/"[^>]*aria-current="page"/);
  assert.match(html, /918149428126/);
  assert.match(html, /4N9MusUsVUeHSG9E8/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Lorem Ipsum/i);
});

test("renders inner experience pages without fake booking claims", async () => {
  const response = await render("/stay");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Stay close to nature\./);
  assert.match(html, /confirmed directly by the resort team/);
  assert.match(html, /Enquire on WhatsApp/);
  assert.match(html, /Rest\. Reconnect\. Repeat\./);
  assert.match(html, /visual-stay/);
  assert.doesNotMatch(html, /Confirm Booking|Book Now|available rooms|discount/i);
});
