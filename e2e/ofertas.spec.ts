import { expect, test } from "@playwright/test";

// The page reads postings on the server, so these tests do not depend on the table having rows:
// they check the chips, the URL sync, the search box and the calm empty states.

test("filter chips are links that sync the URL and mark the active one", async ({ page }) => {
  await page.goto("/ofertas");
  await expect(page.getByRole("heading", { level: 1, name: /Ofertas junior/ })).toBeVisible();

  const industria = page.getByRole("group", { name: "Industria" });
  await expect(industria.getByRole("link", { name: "Todas" })).toHaveAttribute(
    "aria-current",
    "true",
  );

  await industria.getByRole("link", { name: "Consultoría" }).click();
  await expect(page).toHaveURL(/industria=consulting/);
  await expect(
    page.getByRole("group", { name: "Industria" }).getByRole("link", { name: "Consultoría" }),
  ).toHaveAttribute("aria-current", "true");

  // A second group combines with the first.
  await page.getByRole("group", { name: "Ciudad" }).getByRole("link", { name: "Madrid" }).click();
  await expect(page).toHaveURL(/industria=consulting/);
  await expect(page).toHaveURL(/ciudad=Madrid/);

  await page.getByRole("group", { name: "Modalidad" }).getByRole("link").click();
  await expect(page).toHaveURL(/remoto=1/);
});

test("search writes q to the URL and shows a calm empty state for no match", async ({ page }) => {
  await page.goto("/ofertas");
  await page.getByPlaceholder("Empresa, puesto o ciudad").fill("zzzz-no-existe");
  await expect(page).toHaveURL(/q=zzzz-no-existe/);
  await expect(page.getByRole("heading", { name: "Nada coincide con tu búsqueda" })).toBeVisible();
  await page.getByRole("link", { name: "Quitar filtros" }).click();
  await expect(page).toHaveURL(/\/ofertas$/);
});

test("filters and search come back from the URL", async ({ page }) => {
  await page.goto("/ofertas?nivel=intern&q=analista");
  await expect(page.getByPlaceholder("Empresa, puesto o ciudad")).toHaveValue("analista");
  await expect(
    page.getByRole("group", { name: "Nivel" }).getByRole("link", { name: /Prácticas/ }),
  ).toHaveAttribute("aria-current", "true");
});

test("'Encaje' sorting only appears with a local profile", async ({ page }) => {
  await page.goto("/ofertas");
  await expect(page.getByLabel("Ordenar").locator("option")).toHaveText(["Más recientes"]);

  await page.evaluate(() =>
    localStorage.setItem(
      "carrera-web.profile.v1",
      JSON.stringify({
        industries: ["consulting"],
        roles: [],
        skills: ["SQL"],
        languages: [],
        education: [],
        locations: [],
        remote: "any",
      }),
    ),
  );
  await page.reload();
  await expect(page.getByLabel("Ordenar").locator("option")).toHaveText([
    "Más recientes",
    "Encaje con tu perfil",
  ]);
});

test("375 px: no horizontal scroll", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/ofertas");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
