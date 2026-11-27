import { expect, test } from "@playwright/test";

test("investment banking: hub -> como-funciona -> el-trabajo", async ({ page }) => {
  await page.goto("/industrias/banca-de-inversion");
  await expect(page.getByRole("heading", { level: 1, name: "Banca de inversión" })).toBeVisible();
  await page.getByRole("link", { name: /Empieza por/ }).click();
  await expect(page).toHaveURL(/\/industrias\/banca-de-inversion\/como-funciona$/);
  await expect(page.getByRole("heading", { level: 1, name: "Cómo funciona" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Fuentes" })).toBeVisible();

  await page
    .getByRole("navigation", { name: "Anterior y siguiente" })
    .getByRole("link", { name: /Siguiente/ })
    .click();
  await expect(page).toHaveURL(/\/el-trabajo$/);
  await expect(page.getByRole("heading", { level: 1, name: "El trabajo" })).toBeVisible();
  await expect(page.getByText("Según Michael Page, 2026")).toBeVisible();
});
