import { expect, test } from "@playwright/test";

test("calendario: honest empty dates, filter, add to tracker", async ({ page }) => {
  await page.goto("/calendario");
  await expect(
    page.getByRole("heading", { level: 1, name: "Calendario de procesos" }),
  ).toBeVisible();
  await expect(
    page.getByText("Fechas aún no publicadas · ver la web oficial").first(),
  ).toBeVisible();

  const filter = page.getByRole("group", { name: "Filtrar por industria" });
  await filter.getByRole("button", { name: "Big Law" }).click();
  await expect(page.getByRole("heading", { level: 3, name: "Cuatrecasas" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 3, name: "Alantra" })).toHaveCount(0);

  await page.getByRole("button", { name: "Añadir a candidaturas" }).first().click();
  await expect(page.getByText("añadida a tus candidaturas.")).toBeVisible();

  await page.goto("/candidaturas");
  await expect(page.getByText("(calendario)").first()).toBeVisible();
});

test("calendario fits a 375 px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/calendario");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
