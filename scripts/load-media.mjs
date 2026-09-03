import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../data/site.ts", import.meta.url), "utf8");
const url = "data:text/javascript;base64," + Buffer.from(ts.transpile(source, { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 })).toString("base64");
export const site = await import(url);
const gallerySource = await readFile(new URL("../lib/gallery.ts", import.meta.url), "utf8");
export const gallery = await import("data:text/javascript;base64," + Buffer.from(ts.transpile(gallerySource.replace('"../data/site"', JSON.stringify(url)), { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 })).toString("base64"));

export function mediaSlots(value, prefix = "") {
  return Object.entries(value).flatMap(([key, item]) => {
    const slot = prefix ? `${prefix}.${key}` : key;
    return typeof item === "string" ? [{ slot, path: item }] : mediaSlots(item, slot);
  });
}
