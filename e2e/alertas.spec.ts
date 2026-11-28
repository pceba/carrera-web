import { expect, test } from "@playwright/test";

test("baja page with a bogus token is calm and reveals nothing", async ({ page }) => {
  await page.goto("/alertas/baja?token=bogus");
  await expect(
    page.getByRole("heading", { level: 1, name: "Listo, te hemos dado de baja" }),
  ).toBeVisible();
  await expect(
    page.getByText("Si este enlace correspondía a una suscripción activa"),
  ).toBeVisible();

  // No token at all gives the same page, and it needs no sign-in.
  await page.goto("/alertas/baja");
  await expect(
    page.getByRole("heading", { level: 1, name: "Listo, te hemos dado de baja" }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  );
});

test("/cuenta/alertas sends a signed-out visitor to sign-in", async ({ page }) => {
  await page.goto("/cuenta/alertas");
  await expect(page).toHaveURL(/\/entrar\?next=%2Fcuenta%2Falertas/);
});
