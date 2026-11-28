import { expect, test } from "@playwright/test";

test("contribuir: explains the ask and links the issue templates", async ({ page }) => {
  await page.goto("/contribuir");
  await expect(
    page.getByRole("heading", { level: 1, name: "Ayúdanos a que las guías sean correctas" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Qué pedimos" })).toBeVisible();
  await expect(page.getByText("Licencia abierta")).toBeVisible();
  await expect(page.getByRole("link", { name: "Revisar una página" })).toHaveAttribute(
    "href",
    /issues\/new\?template=review-page\.yml$/,
  );
  await expect(page.getByRole("link", { name: "Proponer una fuente" })).toHaveAttribute(
    "href",
    /template=propose-source\.yml$/,
  );
  await expect(page.locator("form")).toHaveCount(0);
});

test("contribuir fits a 375 px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/contribuir");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
});
