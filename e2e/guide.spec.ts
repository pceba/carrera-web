import { expect, test } from "@playwright/test";
import { INDUSTRIES } from "../content/catalog";

const PAGES = INDUSTRIES.filter((i) => i.status === "live").flatMap((i) =>
  [...i.sections, ...i.segments].map((p) => `/industrias/${i.slug}/${p.slug}`),
);
/** Three `##` headings, so the table of contents and the scroll-spy have something to do. */
const LONG = "/industrias/big-law/empresas";

test("every table-of-contents link points at a heading that exists, on every guide page", async ({
  page,
}) => {
  test.setTimeout(120_000);
  for (const path of PAGES) {
    await page.goto(path);
    const missing = await page.evaluate(() =>
      [...document.querySelectorAll('nav[aria-label="En esta página"] a')]
        .map((a) => a.getAttribute("href")?.slice(1) ?? "")
        .filter((id) => !document.getElementById(id)),
    );
    expect(missing, path).toEqual([]);
    // One heading per id, so anchors never collide.
    const ids = await page.evaluate(() =>
      [...document.querySelectorAll("article h2[id]")].map((h) => h.id),
    );
    expect(new Set(ids).size, path).toBe(ids.length);
  }
});

test("hero band: eyebrow, h1, reading time, review date and decorative cover art", async ({
  page,
}) => {
  await page.goto(LONG);
  const main = page.getByRole("main");
  await expect(main.getByRole("heading", { level: 1, name: "Empresas en España" })).toBeVisible();
  await expect(main.getByText(/\d+ min de lectura/)).toBeVisible();
  await expect(main.getByText(/Revisada el/).first()).toBeVisible();
  await expect(main.getByText(/Sección \d+ de \d+/)).toBeVisible();
  // Cover art is hidden from assistive technology.
  expect(await main.locator("header svg:not([aria-hidden='true'])").count()).toBe(0);
  expect(await main.locator("header svg[aria-hidden='true']").count()).toBeGreaterThan(0);
});

test("desktop: sticky table of contents follows the scroll (scroll-spy)", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "the sticky rail is for wide screens");
  await page.setViewportSize({ width: 1400, height: 800 });
  await page.goto(LONG);
  const rail = page.locator('nav[aria-label="En esta página"]').filter({ visible: true });
  await expect(rail).toHaveCount(1);
  const links = rail.getByRole("link");
  await expect(links).toHaveCount(3);

  await links.nth(2).click();
  await expect(page).toHaveURL(/#despachos-internacionales-en-madrid$/);
  await expect(links.nth(2)).toHaveAttribute("aria-current", "location");
  await expect(links.nth(0)).not.toHaveAttribute("aria-current", "location");

  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(links.nth(2)).not.toHaveAttribute("aria-current", "location");
  // Still on screen while the article scrolls.
  await page.evaluate(() => window.scrollTo(0, 600));
  await expect(rail).toBeInViewport();
});

test("phone: 'En esta página' is a collapsible row that jumps to the heading", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "phone-only");
  await page.goto(LONG);
  const toc = page.locator('nav[aria-label="En esta página"]').filter({ visible: true });
  await expect(toc).toHaveCount(1);
  const summary = toc.getByText("En esta página", { exact: true });
  await summary.click();
  const link = toc.getByRole("link", { name: "Despachos españoles" });
  await expect(link).toBeVisible();
  await link.click();
  await expect(page).toHaveURL(/#despachos-espanoles$/);
  await expect(page.getByRole("heading", { name: "Despachos españoles" })).toBeInViewport();
});

test("reading progress bar fills from 0 to 1 over the article", async ({ page }) => {
  await page.goto(LONG);
  const bar = page.locator("[data-reading-progress]");
  const read = () => bar.evaluate((el) => Number(el.style.getPropertyValue("--read") || "0"));
  expect(await read()).toBeLessThan(0.05);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect.poll(read).toBeGreaterThan(0.9);
});

test("previous/next cards show the neighbour's summary and navigate", async ({ page }) => {
  await page.goto("/industrias/big-law/empresas");
  const pager = page.getByRole("navigation", { name: "Anterior y siguiente" });
  await expect(pager.getByRole("link", { name: /Anterior/ })).toContainText("Cómo funciona");
  await expect(pager.getByRole("link", { name: /Siguiente/ })).toContainText(
    "La semana de un júnior",
  );
  await pager.getByRole("link", { name: /Siguiente/ }).click();
  await expect(page).toHaveURL(/\/industrias\/big-law\/el-trabajo$/);
});

test("Copiar enlace copies the page address and shows a toast", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]).catch(() => {});
  await page.goto(LONG);
  await page.getByRole("button", { name: "Copiar enlace" }).click();
  await expect(page.getByRole("region", { name: "Avisos" })).toContainText(
    /Enlace copiado|No se pudo copiar/,
  );
});

test("the hub has the same hero and an industry in preparation keeps its notice", async ({
  page,
}) => {
  await page.goto("/industrias/banca-de-inversion");
  await expect(page.getByRole("heading", { level: 1, name: "Banca de inversión" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Empieza por/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Copiar enlace" })).toBeVisible();

  await page.goto("/industrias/private-equity");
  await expect(page.getByRole("heading", { level: 1, name: "Private equity" })).toBeVisible();
  await expect(page.getByText("En preparación").first()).toBeVisible();
});

test("no horizontal scroll on guide pages", async ({ page }) => {
  for (const path of [LONG, "/industrias/consultoria/proceso", "/industrias/banca-de-inversion"]) {
    await page.goto(path);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
      path,
    ).toBe(true);
  }
});
