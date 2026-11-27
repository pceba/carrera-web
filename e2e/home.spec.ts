import { expect, test } from "@playwright/test";

test("home renders in Spanish with landmarks and a single h1", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
});

test("no horizontal scroll on home, industries and /dev/ui", async ({ page }) => {
  for (const path of ["/", "/industrias", "/dev/ui", "/ofertas", "/entrar"]) {
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow, path).toBe(false);
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

test("industry map links only the live industry", async ({ page }) => {
  await page.goto("/industrias");
  const main = page.getByRole("main");
  await expect(main.getByRole("link", { name: "Consultoría" })).toBeVisible();
  await expect(page.getByText("Próximamente")).not.toHaveCount(0);
  await expect(main.getByRole("link", { name: "Marketing" })).toHaveCount(0);
});

test("tabs work with the keyboard", async ({ page }) => {
  await page.goto("/dev/ui");
  const first = page.getByRole("tab", { name: "Primero" });
  await first.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Segundo" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText("Contenido del segundo panel.")).toBeVisible();
});

test("main navigation reaches industries, consulting and offers", async ({ page, isMobile }) => {
  await page.goto("/");
  if (isMobile) {
    const menuButton = page.getByRole("button", { name: "Menú" });
    await menuButton.click();
    const menu = page.getByRole("navigation", { name: "Principal (móvil)" });
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("link", { name: "Industrias" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await menuButton.click();
    await menu.getByRole("link", { name: "Ofertas" }).click();
  } else {
    const nav = page.getByRole("navigation", { name: "Principal", exact: true });
    await expect(nav.getByRole("link", { name: "Industrias" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Consultoría" })).toBeVisible();
    await nav.getByRole("link", { name: "Ofertas" }).click();
  }
  await expect(page).toHaveURL(/\/ofertas$/);
  const current = page.locator('header a[aria-current="page"]');
  await expect(current.first()).toHaveText("Ofertas");
});

test("theme switch overrides the system theme and survives a reload", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/dev/ui");
  const group = page.getByRole("main").getByRole("group", { name: "Tema de color" }).first();
  await group.getByRole("button", { name: "Oscuro" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await group.getByRole("button", { name: "Automático" }).click();
  await expect(page.locator("html")).not.toHaveAttribute("data-theme", /.+/);
});

test("home offers an entry by year of degree", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "¿En qué curso estás?" })).toBeVisible();
  await page.getByRole("link", { name: "Toca buscar prácticas" }).click();
  await expect(page).toHaveURL(/\/industrias\/consultoria#c3$/);
  await expect(page.getByRole("tab", { name: "3.º" })).toHaveAttribute("aria-selected", "true");
});
