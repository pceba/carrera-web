import { expect, test } from "@playwright/test";

test("investment banking: hub -> como-funciona -> empresas -> el-trabajo", async ({ page }) => {
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
  await expect(page).toHaveURL(/\/empresas$/);
  await expect(page.getByRole("heading", { level: 1, name: "Empresas en España" })).toBeVisible();

  await page
    .getByRole("navigation", { name: "Anterior y siguiente" })
    .getByRole("link", { name: /Siguiente/ })
    .click();
  await expect(page).toHaveURL(/\/el-trabajo$/);
  await expect(page.getByRole("heading", { level: 1, name: "El trabajo" })).toBeVisible();
});

test("investment banking: hub -> proceso -> recursos, sueldos and the library filter", async ({
  page,
}) => {
  await page.goto("/industrias/banca-de-inversion");
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

  await page.goto("/industrias/banca-de-inversion/sueldos");
  await expect(page.getByRole("heading", { level: 1, name: "Sueldos" })).toBeVisible();
  await expect(page.getByText("Según Michael Page, 2026")).toBeVisible();

  await page.goto("/recursos?industria=banca-de-inversion");
  await expect(page.getByText("Alantra").first()).toBeVisible();
});
