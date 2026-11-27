import { expect, test } from "@playwright/test";

test("consulting page: sections, sources, no horizontal scroll", async ({ page }) => {
  await page.goto("/industrias/consultoria");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("region", { name: "Fuentes" })).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
});

test("firm filter narrows the list", async ({ page }) => {
  await page.goto("/industrias/consultoria");
  await page.getByLabel("Tipo").selectOption("Big Four");
  await expect(page.getByText("4 empresas")).toBeVisible();
});

test("case happy path with the keyboard-friendly controls", async ({ page }) => {
  await page.goto("/industrias/consultoria#caso");
  const next = page.getByRole("button", { name: "Siguiente" });
  await next.click(); // prompt -> questions
  await page.getByLabel(/solo café, o cualquier bebida/).check();
  await next.click();
  await page.getByLabel(/Embudo de demanda/).check();
  await next.click();
  await next.click(); // exhibit -> maths
  await expect(next).toBeDisabled();
  await page.getByLabel(/cafés al día vendería/).fill("1.080");
  await page.getByRole("button", { name: "Comprobar" }).click();
  await expect(page.getByText("Correcto.")).toBeVisible();
  await next.click();
  await page.getByLabel(/Unos 1.080 cafés al día/).check();
  await next.click();
  await expect(page.getByText(/1\.080 cafés al día/)).toBeVisible();
  await page.getByLabel(/Dije cada supuesto/).check();
  await expect(page.getByText(/Autoevaluación: 20 %/)).toBeVisible();
});
