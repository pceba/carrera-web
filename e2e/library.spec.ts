import { expect, test } from "@playwright/test";

test("/preparacion lists the guides and each frame opens", async ({ page }) => {
  await page.goto("/preparacion");
  await expect(page.getByRole("heading", { level: 1, name: "Preparación" })).toBeVisible();
  await page.getByRole("link", { name: /Entrevistas de caso/ }).click();
  await expect(page).toHaveURL(/\/preparacion\/entrevistas-de-caso$/);
  await expect(page.getByRole("heading", { level: 1, name: "Entrevistas de caso" })).toBeVisible();
  await expect(page.getByText("En preparación").first()).toBeVisible();
  // It links back to industry pages that cover it.
  await expect(
    page.getByRole("main").getByRole("link", { name: /Proceso de selección/ }),
  ).toBeVisible();
});

test("/recursos shows everything, then filters by industry and type with plain links", async ({
  page,
}) => {
  await page.goto("/recursos");
  const all = await page.getByRole("main").getByRole("heading", { level: 2 }).count();
  expect(all).toBeGreaterThan(3);

  const filters = page.getByRole("navigation", { name: "Filtros" });
  await filters.getByRole("link", { name: "Webs oficiales" }).click();
  await expect(page).toHaveURL(/\?tipo=web-oficial$/);
  const official = await page.getByRole("main").getByRole("heading", { level: 2 }).count();
  expect(official).toBeGreaterThan(0);
  expect(official).toBeLessThan(all);

  // Filters combine and keep each other.
  await filters.getByRole("link", { name: "Consultoría" }).click();
  await expect(page).toHaveURL(/\?industria=consultoria&tipo=web-oficial$/);
  await expect(filters.getByRole("link", { name: "Consultoría" })).toHaveAttribute(
    "aria-current",
    "true",
  );
});

test("/recursos?industria=...&tipo=... works as a direct link", async ({ page }) => {
  await page.goto("/recursos?industria=consultoria&tipo=casos");
  const items = page.getByRole("main").getByRole("heading", { level: 2 });
  await expect(items).toHaveCount(1);
  await expect(items.first()).toContainText("estimación de mercado");
});

test("/recursos explains an empty result in Spanish and offers a way out", async ({ page }) => {
  await page.goto("/recursos?industria=big-law&tipo=podcast");
  await expect(
    page.getByText("Todavía no hay recursos revisados con estos filtros."),
  ).toBeVisible();
  await page.getByRole("link", { name: "Quitar los filtros" }).click();
  await expect(page).toHaveURL(/\/recursos$/);
});

test("/recursos ignores unknown filter values", async ({ page }) => {
  await page.goto("/recursos?industria=nada&tipo=nada");
  await expect(page.getByRole("main").getByRole("heading", { level: 2 }).first()).toBeVisible();
});
