// Captures full-page screenshots of the key pages at 375 px and 1280 px, light and dark.
// Usage: start the built app, then `node e2e/capture-screenshots.mjs <outDir> [baseURL] [pages]`.
// Not a test: Playwright's runner ignores it (no .spec suffix).
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const outDir = process.argv[2] ?? "docs/screenshots/after";
const baseURL = process.argv[3] ?? "http://localhost:3000";
/** Optional comma-separated page names to limit the run, e.g. "home,ofertas". */
const only = process.argv[4]?.split(",");

const PAGES = [
  ["home", "/"],
  ["consultoria", "/industrias/consultoria"],
  ["industrias", "/industrias"],
  ["ofertas", "/ofertas"],
  ["entrar", "/entrar"],
];
const VIEWPORTS = [
  ["375", { width: 375, height: 812 }],
  ["1280", { width: 1280, height: 800 }],
];
const THEMES = ["light", "dark"];

mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
for (const [vpName, viewport] of VIEWPORTS) {
  for (const theme of THEMES) {
    const context = await browser.newContext({
      viewport,
      colorScheme: theme,
      deviceScaleFactor: 1,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    for (const [name, path] of PAGES.filter(([n]) => !only || only.includes(n))) {
      await page.goto(baseURL + path, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      const file = join(outDir, `${name}-${vpName}-${theme}.jpg`);
      await page.screenshot({ path: file, fullPage: true, type: "jpeg", quality: 70 });
      console.log(file);
    }
    await context.close();
  }
}
await browser.close();
