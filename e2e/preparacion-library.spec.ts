import { expect, test } from "@playwright/test";

test("/preparacion: search and industry chips filter the guides", async ({ page }) => {
  await page.goto("/preparacion");
  const main = page.getByRole("main");
  const all = await main.getByRole("heading", { level: 2 }).count();
  expect(all).toBeGreaterThan(2);

  await main.getByRole("searchbox", { name: "Buscar guías" }).fill("caso");
  const some = await main.getByRole("heading", { level: 2 }).count();
  expect(some).toBeGreaterThan(0);
  expect(some).toBeLessThan(all);
  await main.getByRole("searchbox", { name: "Buscar guías" }).fill("");

  await main
    .getByRole("group", { name: "Filtrar por industria" })
    .getByRole("button", { name: "Consultoría" })
    .click();
  expect(await main.getByRole("heading", { level: 2 }).count()).toBeLessThan(all);
});

test("/preparacion: saving a guide shows it under Guardados and survives a reload", async ({
  page,
}) => {
  await page.goto("/preparacion");
  const main = page.getByRole("main");
  await main.getByRole("button", { name: "Guardar: Entrevistas de caso" }).click();
  await page.reload();
  const toggle = main.getByRole("button", { name: /^Guardados/ });
  await expect(toggle).toContainText("1");
  await toggle.click();
  await expect(main.getByRole("heading", { level: 2 })).toHaveCount(1);
  await expect(main.getByRole("link", { name: "Entrevistas de caso" })).toBeVisible();
});

test("/preparacion has no horizontal scroll at 375 px", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/preparacion");
  const over = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(over).toBe(false);
});
