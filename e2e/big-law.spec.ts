import { expect, test } from "@playwright/test";

test("big law: hub -> como-funciona -> empresas -> el-trabajo", async ({ page }) => {
  await page.goto("/industrias/big-law");
  await expect(page.getByRole("heading", { level: 1, name: "Big Law" })).toBeVisible();
  await page.getByRole("link", { name: /Empieza por/ }).click();
  await expect(page).toHaveURL(/\/industrias\/big-law\/como-funciona$/);
  await expect(page.getByRole("heading", { level: 1, name: "Cómo funciona" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Fuentes" })).toBeVisible();

  await page
    .getByRole("navigation", { name: "Anterior y siguiente" })
    .getByRole("link", { name: /Siguiente/ })
    .click();
  await expect(page).toHaveURL(/\/empresas$/);
  await expect(page.getByRole("heading", { level: 1, name: "Empresas en España" })).toBeVisible();

  await page
    .getByRole("navigation", { name: "Anterior y siguiente" })
    .getByRole("link", { name: /Siguiente/ })
    .click();
  await expect(page).toHaveURL(/\/el-trabajo$/);
  await expect(page.getByRole("heading", { level: 1, name: "El trabajo" })).toBeVisible();
});

test("big law: hub -> proceso -> recursos and the library filter", async ({ page }) => {
  await page.goto("/industrias/big-law");
  await page
    .getByRole("region", { name: "La guía, en orden" })
    .getByRole("link", { name: /Proceso de selección/ })
    .click();
  await expect(page).toHaveURL(/\/proceso$/);
  await expect(page.getByRole("heading", { level: 1, name: "Proceso de selección" })).toBeVisible();
  await page
    .getByRole("navigation", { name: "Anterior y siguiente" })
    .getByRole("link", { name: /Siguiente/ })
    .click();
  await expect(page).toHaveURL(/\/recursos$/);
  await expect(page.getByRole("heading", { level: 1, name: "Recursos" })).toBeVisible();
  await page.goto("/recursos?industria=big-law");
  await expect(page.getByText("Ley 34/2006 sobre el acceso").first()).toBeVisible();
});
