import { expect, test } from "@playwright/test";

for (const path of [
  "/legal/privacidad",
  "/legal/terminos",
  "/legal/cookies",
  "/legal/aviso-legal",
]) {
  test(`${path} renders one h1 and has no horizontal scroll`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByText(/Versión \d{4}-\d{2}-\d{2}/)).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });
}
