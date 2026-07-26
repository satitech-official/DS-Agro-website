import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = join(process.cwd(), "out");
const port = Number(process.env.PORT || 3000);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const relative = normalize(decoded).replace(/^([/\\])+/, "");
  if (relative.startsWith("..")) return null;
  return relative;
}

createServer(async (request, response) => {
  const relative = safePath(request.url || "/");
  if (relative === null) {
    response.writeHead(400).end("Bad request");
    return;
  }

  let filePath = join(root, relative || "index.html");
  try {
    const info = await stat(filePath);
    if (info.isDirectory()) filePath = join(filePath, "index.html");
    const body = await readFile(filePath);
    response.writeHead(200, {
      "content-type": contentTypes[extname(filePath)] || "application/octet-stream",
      "cache-control": extname(filePath) === ".html" ? "no-cache" : "public, max-age=3600",
    });
    response.end(body);
  } catch {
    try {
      const body = await readFile(join(root, "404.html"));
      response.writeHead(404, { "content-type": "text/html; charset=utf-8" });
      response.end(body);
    } catch {
      response.writeHead(404).end("Not found");
    }
  }
}).listen(port, () => {
  console.log(`DS Agro static site running at http://localhost:${port}`);
});
