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
  for (const path of ["/", "/industrias", "/dev/ui"]) {
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
  await expect(page.getByRole("link", { name: "Consultoría" })).toBeVisible();
  await expect(page.getByText("Próximamente")).not.toHaveCount(0);
  await expect(page.getByRole("link", { name: "Marketing" })).toHaveCount(0);
});

test("tabs work with the keyboard", async ({ page }) => {
  await page.goto("/dev/ui");
  const first = page.getByRole("tab", { name: "Primero" });
  await first.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Segundo" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText("Contenido del segundo panel.")).toBeVisible();
});
