import { expect, test } from "@playwright/test";

test("/recursos: search narrows the list and says when nothing matches", async ({ page }) => {
  await page.goto("/recursos");
  const main = page.getByRole("main");
  const all = await main.getByRole("heading", { level: 2 }).count();
  await main.getByRole("searchbox", { name: "Buscar recursos" }).fill("estimación");
  const some = await main.getByRole("heading", { level: 2 }).count();
  expect(some).toBeGreaterThan(0);
  expect(some).toBeLessThan(all);
  await main.getByRole("searchbox", { name: "Buscar recursos" }).fill("zzzxxqq");
  await expect(main.getByText("Ningún recurso coincide con tu búsqueda.")).toBeVisible();
});

test("/recursos: saved items persist, count and filter", async ({ page }) => {
  await page.goto("/recursos");
  const main = page.getByRole("main");
  const toggle = main.getByRole("button", { name: /^Guardados/ });
  await toggle.click();
  await expect(main.getByText(/Aún no has guardado ningún recurso/)).toBeVisible();
  await toggle.click();

  await main
    .getByRole("button", { name: /^Guardar:/ })
    .first()
    .click();
  await expect(toggle).toContainText("1");
  expect(await page.evaluate(() => localStorage.getItem("path.saved.v1"))).toMatch(/^\["r:/);

  await page.reload();
  await expect(main.getByRole("button", { name: /^Guardados/ })).toContainText("1");
  await main.getByRole("button", { name: /^Guardados/ }).click();
  await expect(main.getByRole("heading", { level: 2 })).toHaveCount(1);
  await expect(main.getByRole("button", { name: /^Quitar de guardados:/ })).toBeVisible();
});

test("/recursos: cards show the type and the source domain", async ({ page }) => {
  await page.goto("/recursos?tipo=web-oficial");
  const first = page.getByRole("main").getByRole("listitem").filter({ hasText: "Revisado el" });
  await expect(first.first()).toContainText("Web oficial");
  await expect(first.first()).toContainText(/\w+\.\w+/);
});
