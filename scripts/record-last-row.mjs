// Records a looping clip of the /capture/last-row stage to public/last-row-animation.webm.
// Usage: node scripts/record-last-row.mjs
import { chromium } from "@playwright/test";
import { mkdir, rename, readdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT_DIR = path.join(ROOT, "public");
const TMP_DIR = path.join(ROOT, ".tmp-video");
const OUT_FILE = path.join(OUT_DIR, "last-row-animation.webm");

// Frame the row (6×160 cards + 5×18 gaps + 28×2 container padding ≈ 1106×208)
// with comfortable, even breathing room on all sides.
const WIDTH = 1240;
const HEIGHT = 360;
const DURATION_MS = 8000; // ~3 full animation loops (LOOP_MS = 2600)

await mkdir(OUT_DIR, { recursive: true });
await rm(TMP_DIR, { recursive: true, force: true });
await mkdir(TMP_DIR, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 2, // crisp 2× capture
  recordVideo: { dir: TMP_DIR, size: { width: WIDTH, height: HEIGHT } },
});

const page = await context.newPage();
await page.goto("http://localhost:3000/capture/last-row", { waitUntil: "networkidle" });
// Let the first animation loop kick in, then record a clean stretch.
await page.waitForTimeout(DURATION_MS);

const video = page.video();
await context.close(); // flushes the webm to disk
await browser.close();

// Playwright names the file randomly — move the single produced webm to the target.
const produced = video ? await video.path() : null;
if (produced) {
  await rename(produced, OUT_FILE);
} else {
  const files = (await readdir(TMP_DIR)).filter((f) => f.endsWith(".webm"));
  if (!files.length) throw new Error("No video produced");
  await rename(path.join(TMP_DIR, files[0]), OUT_FILE);
}
await rm(TMP_DIR, { recursive: true, force: true });

console.log("Saved", OUT_FILE);
