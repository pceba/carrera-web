import { expect, test } from "@playwright/test";

test("sign-in page uses the site shell and labelled fields", async ({ page }) => {
  await page.goto("/entrar");
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByLabel("Correo electrónico")).toBeVisible();
  await expect(page.getByLabel("Año de nacimiento")).toBeVisible();
  await expect(page.getByRole("button", { name: "Enviarme el enlace" })).toBeVisible();
});

test("sign-in errors are announced", async ({ page }) => {
  await page.goto("/entrar?error=email");
  await expect(page.getByRole("main").getByRole("alert")).toHaveText("Escribe un correo válido.");
});
