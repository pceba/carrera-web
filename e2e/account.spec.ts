import { expect, test } from "@playwright/test";

test("sign-in page uses the site shell and labelled fields", async ({ page }) => {
  await page.goto("/entrar");
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByLabel("Correo electrónico")).toBeVisible();
  await expect(page.getByLabel("Año de nacimiento")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Enviarme el enlace" })).toBeVisible();
});

test("Crear cuenta asks for birth year and the 16+ box; Entrar does not", async ({ page }) => {
  await page.goto("/entrar");
  const tabs = page.getByRole("navigation", { name: "Entrar o crear cuenta" });
  await expect(tabs.getByRole("link", { name: "Entrar" })).toHaveAttribute("aria-current", "page");
  await tabs.getByRole("link", { name: "Crear cuenta" }).click();
  await expect(page).toHaveURL(/modo=crear/);
  await expect(page.getByRole("heading", { level: 1, name: "Crear cuenta" })).toBeVisible();
  await expect(page.getByLabel("Año de nacimiento")).toBeVisible();
  await expect(page.getByLabel("Confirmo que tengo 16 años o más")).toBeVisible();
  await expect(page.getByRole("button", { name: "Crear mi cuenta" })).toBeVisible();
});

test("sign-in errors are announced", async ({ page }) => {
  await page.goto("/entrar?error=email");
  await expect(page.getByRole("main").getByRole("alert")).toHaveText("Escribe un correo válido.");
  await page.goto("/entrar?modo=crear&error=edad");
  await expect(page.getByRole("main").getByRole("alert")).toContainText("16 años");
});

test("after sending, tips explain spam, validity and the same browser", async ({ page }) => {
  await page.goto("/entrar?enviado=1");
  await expect(page.getByText("Mira también en spam")).toBeVisible();
  await expect(page.getByText("aproximadamente una hora")).toBeVisible();
  await expect(page.getByText("Ábrelo en este mismo navegador.")).toBeVisible();
});

test("/cuenta sends a signed-out visitor to sign-in", async ({ page }) => {
  await page.goto("/cuenta");
  await expect(page).toHaveURL(/\/entrar/);
});
