import { expect, test } from "@playwright/test";

test("empezar: four steps, manual tick persists, finish state", async ({ page }) => {
  await page.goto("/empezar");
  await expect(
    page.getByRole("heading", { level: 1, name: "Cuatro pasos para arrancar" }),
  ).toBeVisible();
  await expect(page.getByText("0 de 4 pasos hechos")).toBeVisible();
  await expect(page.getByTestId("step-diagnostico")).toHaveAttribute("aria-current", "step");

  await page.getByTestId("step-diagnostico").getByRole("checkbox", { name: "Hecho" }).check();
  await expect(page.getByText("1 de 4 pasos hechos")).toBeVisible();
  await page.reload();
  await expect(page.getByText("1 de 4 pasos hechos")).toBeVisible();

  await page.getByTestId("step-guia").getByRole("checkbox", { name: "Hecho" }).check();
  await page.getByTestId("step-encaje").getByRole("checkbox", { name: "Hecho" }).check();
  await expect(page.getByRole("heading", { name: "Ya tienes tu camino en marcha" })).toHaveCount(0);

  // The last step is detected from the tracker's own storage.
  await page.evaluate(() => {
    localStorage.setItem(
      "path.applications.v1",
      JSON.stringify({ items: [{ id: "a1", firm: "Acme", role: "Analista", stage: "enviada" }] }),
    );
  });
  await page.reload();
  await expect(page.getByTestId("step-candidatura")).toContainText("Detectado en este navegador");
  await expect(page.getByRole("heading", { name: "Ya tienes tu camino en marcha" })).toBeVisible();
});

test("empezar: no horizontal scroll at 375 px", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/empezar");
  await expect(page.getByTestId("step-encaje")).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  expect(overflow).toBe(false);
});
