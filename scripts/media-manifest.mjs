import { readFile, writeFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { site, mediaSlots } from "./load-media.mjs";
import { auditMedia } from "./check-media-duplicates.mjs";

const normalize = value => value.replace(process.env.NEXT_PUBLIC_BASE_PATH ?? "", "").replace(/^\//, "");
const sources = JSON.parse(await readFile(new URL("../data/photo-sources.json", import.meta.url), "utf8"));
const dimensions = JSON.parse(await readFile(new URL("../data/photo-dimensions.json", import.meta.url), "utf8"));
const placements = mediaSlots(site.pageMedia);
const photos = new Map(sources.map(source => [source.path, { ...source, marketingSlots: [], galleryCategories: [], roomAlbumSlots: [] }]));
function record(path) {
  const key = normalize(path);
  if (!photos.has(key)) photos.set(key, { path:key, source:null, provenance:"Retained official resort asset from the previous release; original camera filename not recorded.", marketingSlots:[], galleryCategories:[], roomAlbumSlots:[] });
  return photos.get(key);
}
for (const slot of placements) record(slot.path).marketingSlots.push(slot.slot);
for (const category of site.galleryCategories) for (const photo of category.images) record(photo.image).galleryCategories.push(category.id);
for (const slot of mediaSlots(site.accommodationMedia)) record(slot.path).roomAlbumSlots.push(slot.slot);
record(site.heroMedia.poster).fallbackSlots = ["hero.poster", "hero.loading", "hero.reducedMotion", "hero.saveData", "hero.error"];
record(site.resortImages.estateAerial).adminSlots = ["admin.login.branding"];
for (const item of photos.values()) {
  const buffer = await readFile(new URL("../public/"+item.path,import.meta.url));
  item.bytes = buffer.length;
  item.sha256 = createHash("sha256").update(buffer).digest("hex");
  item.dimensions = dimensions[item.path] ?? null;
  item.variants = ["-640", "-1200"].map(size=>item.path.replace(".webp",size+".webp")).filter(path=>dimensions[path]).map(path=>({path,dimensions:dimensions[path]}));
  if (item.driveId) item.sourceUrl = "https://drive.google.com/file/d/"+item.driveId+"/view";
  item.usage = item.marketingSlots.length || item.galleryCategories.length || item.roomAlbumSlots.length || item.fallbackSlots || item.adminSlots ? "active" : "retained-not-displayed";
}
const videoSources = [
  {source:"DJI_20260807131702_0080_D.MP4",driveId:"1RCwGDEc_xGIrT2VwUiceESYSoQayxhI8",description:"Official DS Agro property orbit",sourceDimensions:[3840,2160],sourceFps:60},
  {source:"DJI_20260807131142_0073_D.MP4",driveId:"13kfHSzC44CNa9wgLktxAxh5mwaPL0vY-",description:"Official DS Agro pool glide",sourceDimensions:[3840,2160],sourceFps:60},
];
const videos = [];
for (const [path,size] of [[site.heroMedia.desktop,[1920,1080]],[site.heroMedia.mobile,[720,720]]]) {
  const asset = normalize(path);
  videos.push({path:asset,dimensions:size,durationSeconds:12.4,fps:30,codec:"H.264 MP4",audio:false,bytes:(await stat(new URL("../public/"+asset,import.meta.url))).size,sources:videoSources,poster:normalize(site.heroMedia.poster)});
}
const audit = await auditMedia();
const report = {version:1,scope:"Official media defaults. Live admin records remain authoritative and may differ until imported.",generatedFrom:["data/site.ts","data/photo-sources.json","data/photo-dimensions.json"],marketingAudit:{slots:audit.slots.length,duplicates:audit.duplicates,exceptions:audit.exceptions},photos:[...photos.values()].sort((a,b)=>a.path.localeCompare(b.path)),videos};
await writeFile(new URL("../docs/MEDIA_MANIFEST.json",import.meta.url),JSON.stringify(report,null,2)+"\n");
console.log(`Media manifest: ${photos.size} photographs, ${videos.length} video encodes, ${audit.slots.length} unique marketing slots.`);
if (process.argv.includes("--files")) {
  const tracked = execFileSync("git", ["diff", "--name-only", "HEAD"], {encoding:"utf8"});
  const added = execFileSync("git", ["ls-files", "--others", "--exclude-standard"], {encoding:"utf8"});
  const files = [...new Set([...tracked.split(/\r?\n/), ...added.split(/\r?\n/), "docs/VISUAL_UPGRADE_FILES.txt"])].filter(Boolean).sort();
  await writeFile(new URL("../docs/VISUAL_UPGRADE_FILES.txt",import.meta.url),files.join("\n")+"\n");
}
