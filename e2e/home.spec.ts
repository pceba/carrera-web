import { expect, test, type Page } from "@playwright/test";
import { INDUSTRIES } from "../content/catalog";

const noOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

test("home renders in Spanish with landmarks and a single h1", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
});

test("home links the six industries and has no year-of-degree entry", async ({ page }) => {
  await page.goto("/");
  const main = page.getByRole("main");
  for (const i of INDUSTRIES) {
    await expect(main.locator(`a[href="/industrias/${i.slug}"]`).first()).toBeVisible();
  }
  await expect(page.getByText("¿En qué curso estás?")).toHaveCount(0);
});

test("industry map lists the six industries and marks the ones in preparation", async ({
  page,
}) => {
  await page.goto("/industrias");
  const main = page.getByRole("main");
  for (const i of INDUSTRIES) {
    await expect(main.locator(`a[href="/industrias/${i.slug}"]`)).toBeVisible();
  }
  await expect(main.getByText("En preparación", { exact: true })).toHaveCount(
    INDUSTRIES.filter((i) => i.status === "preparing").length,
  );
});

test("an industry in preparation has a hub and no sections", async ({ page }) => {
  await page.goto("/industrias/private-equity");
  await expect(page.getByRole("heading", { level: 1, name: "Private equity" })).toBeVisible();
  await expect(page.getByText("En preparación").first()).toBeVisible();
  const missing = await page.goto("/industrias/private-equity/proceso");
  expect(missing?.status()).toBe(404);
});

test("no horizontal scroll on the main pages", async ({ page }) => {
  for (const path of [
    "/",
    "/industrias",
    "/industrias/consultoria",
    "/industrias/consultoria/proceso",
    "/preparacion",
    "/preparacion/entrevistas-de-caso",
    "/recursos",
    "/dev/ui",
    "/ofertas",
    "/entrar",
  ]) {
    await page.goto(path);
    expect(await noOverflow(page), path).toBe(true);
  }
});

test("skip link is the first tab stop and moves focus to main", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Saltar al contenido" });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#contenido$/);
});

test("tabs work with the keyboard", async ({ page }) => {
  await page.goto("/dev/ui");
  const first = page.getByRole("tab", { name: "Primero" });
  await first.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Segundo" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText("Contenido del segundo panel.")).toBeVisible();
});

test("header reaches Industrias, Preparación, Recursos and Ofertas", async ({ page, isMobile }) => {
  const targets = [
    ["Industrias", /\/industrias$/],
    ["Preparación", /\/preparacion$/],
    ["Recursos", /\/recursos$/],
    ["Ofertas", /\/ofertas$/],
  ] as const;

  for (const [label, url] of targets) {
    await page.goto("/");
    let nav;
    if (isMobile) {
      await page.getByRole("button", { name: "Menú" }).click();
      nav = page.getByRole("navigation", { name: "Principal (móvil)" });
      await expect(nav).toBeVisible();
    } else {
      nav = page.getByRole("navigation", { name: "Principal", exact: true });
    }
    await nav.getByRole("link", { name: label }).click();
    await expect(page).toHaveURL(url);
    await expect(page.locator('header a[aria-current="page"]').first()).toHaveText(label);
  }
});

test("the mobile menu closes with Escape", async ({ page, isMobile }) => {
  test.skip(!isMobile, "phone-only menu");
  await page.goto("/");
  await page.getByRole("button", { name: "Menú" }).click();
  const menu = page.getByRole("navigation", { name: "Principal (móvil)" });
  await expect(menu).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
});

test("dark theme is opt-in and survives a reload", async ({ page, isMobile }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  // Light by default for everyone.
  await expect(page.locator("html")).not.toHaveAttribute("data-theme", /.+/);

  if (isMobile) await page.getByRole("button", { name: "Menú" }).click();
  await page.getByRole("button", { name: "Tema oscuro" }).first().click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  if (isMobile) await page.getByRole("button", { name: "Menú" }).click();
  const toggle = page.getByRole("button", { name: "Tema oscuro" }).first();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await toggle.click();
  await expect(page.locator("html")).not.toHaveAttribute("data-theme", /.+/);
});
