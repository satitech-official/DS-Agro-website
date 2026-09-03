import { readFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { site, mediaSlots } from "./load-media.mjs";

export async function auditMedia() {
  const sources = JSON.parse(await readFile(new URL("../data/photo-sources.json", import.meta.url), "utf8"));
  const slots = mediaSlots(site.pageMedia).filter(item => !item.slot.startsWith("gallery."));
  const byIdentity = new Map();
  const records = [];
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  for (const item of slots) {
    const path = item.path.replace(base, "").replace(/^\//, "");
    const file = new URL("../public/" + path, import.meta.url);
    const source = sources.find(source => source.path === path);
    const hash = createHash("sha256").update(await readFile(file)).digest("hex");
    const record = { ...item, source: source?.source ?? "Retained official resort asset", bytes: (await stat(file)).size, sha256: hash };
    records.push(record);
    for (const identity of ["sha256:" + hash, ...(source?.driveId ? ["drive:" + source.driveId] : [])]) {
      byIdentity.set(identity, [...(byIdentity.get(identity) ?? []), record]);
    }
  }
  return { slots: records, duplicates: [...byIdentity.values()].filter(group => group.length > 1), exceptions: ["Full Gallery and room albums archive the official photographs.", "A room cover is intentionally shared by its Stay card, Booking thumbnail and admin preview.", "Video poster/loading/reduced-motion/low-data/error states share one official aerial.", "Authenticated workspace branding is outside marketing slots."] };
}

if (process.argv[1]?.endsWith("check-media-duplicates.mjs")) {
  const report = await auditMedia();
  if (process.argv.includes("--json")) console.log(JSON.stringify(report, null, 2));
  else {
    console.log(`${report.slots.length} non-gallery marketing slots checked by source identity and SHA-256.`);
    if (report.duplicates.length) for (const group of report.duplicates) console.error("Duplicate marketing media found:\n" + group.map(item => `- ${item.slot}: ${item.path}`).join("\n"));
    else console.log("No duplicate marketing photographs found.");
    console.log("Allowed reuse: room identity thumbnails, media archives, video fallback poster and admin previews.");
  }
  if (report.duplicates.length) process.exitCode = 1;
}
