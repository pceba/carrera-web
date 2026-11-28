import { expect, test } from "@playwright/test";

test("tracker without an account: add, move, edit, reload persists", async ({ page }) => {
  const posts: string[] = [];
  page.on("request", (r) => {
    if (r.method() !== "GET") posts.push(`${r.method()} ${r.url()}`);
  });

  await page.goto("/candidaturas");
  await expect(page.getByRole("heading", { level: 1, name: "Mis candidaturas" })).toBeVisible();
  await expect(page.getByText("Sin cuenta, se guarda solo en este navegador.")).toBeVisible();
  await page.getByRole("button", { name: "Añadir la primera" }).click();

  // Validation: firm is required and the link must be https.
  await page.getByRole("button", { name: "Guardar", exact: true }).click();
  await expect(page.getByText("Escribe el nombre de la empresa.")).toBeVisible();
  await page.getByLabel("Empresa *").fill("Acme Consulting");
  await page.getByLabel("Enlace a la oferta").fill("http://acme.test");
  await page.getByRole("button", { name: "Guardar", exact: true }).click();
  await expect(page.getByText("El enlace debe empezar por https://")).toBeVisible();

  await page.getByLabel("Enlace a la oferta").fill("https://acme.test/jobs/1");
  await page.getByLabel("Puesto o programa").fill("Analyst Intern");
  await page.getByLabel("Sector").selectOption("consulting");
  await page.getByRole("button", { name: "Guardar", exact: true }).click();

  const card = page.getByTestId("application").filter({ hasText: "Acme Consulting" });
  await expect(card).toBeVisible();
  await expect(page.getByRole("heading", { name: /Me interesa\s*1/ })).toBeVisible();

  // Move stage with the select.
  await card.getByLabel("Fase de Acme Consulting").selectOption("entrevista");
  await expect(page.getByRole("heading", { name: /Entrevista\s*1/ })).toBeVisible();

  // Edit.
  await page.getByRole("button", { name: "Editar Acme Consulting" }).click();
  await page.getByLabel("Puesto o programa").fill("Business Analyst");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByText("Business Analyst")).toBeVisible();

  // Reload: still there, in the same stage.
  await page.reload();
  await expect(page.getByText("Acme Consulting", { exact: true })).toBeVisible();
  await expect(page.getByText("Business Analyst")).toBeVisible();
  await expect(page.getByLabel("Fase de Acme Consulting")).toHaveValue("entrevista");

  // Nothing was sent anywhere.
  expect(posts).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  );
});

test("tracker shows the upcoming strip and drops invalid stored entries", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "path.applications.v1",
      JSON.stringify({
        version: 1,
        items: [
          {
            id: "a1",
            firm: "Beta Legal",
            stage: "enviada",
            next_step: "Prueba online",
            next_step_on: new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10),
          },
          { firm: "" }, // invalid: dropped
        ],
      }),
    );
  });
  await page.goto("/candidaturas");
  await expect(page.getByRole("heading", { name: "Próximos 14 días" })).toBeVisible();
  await expect(page.getByTestId("application")).toHaveCount(1);
});

test("page renders empty when storage throws", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("blocked", "SecurityError");
      },
    });
  });
  await page.goto("/candidaturas");
  await expect(page.getByRole("button", { name: "Añadir la primera" })).toBeVisible();
});
