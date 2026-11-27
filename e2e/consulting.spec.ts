import { expect, test } from "@playwright/test";

test("consulting hub lists the sections and links the first one", async ({ page }) => {
  await page.goto("/industrias/consultoria");
  await expect(page.getByRole("heading", { level: 1, name: "Consultoría" })).toBeVisible();
  const toc = page.getByRole("region", { name: "La guía, en orden" });
  await expect(toc.getByRole("listitem")).toHaveCount(7);
  await page.getByRole("link", { name: /Empieza por/ }).click();
  await expect(page).toHaveURL(/\/industrias\/consultoria\/como-funciona$/);
});

test("hub -> section -> next -> previous", async ({ page }) => {
  await page.goto("/industrias/consultoria");
  await page
    .getByRole("region", { name: "La guía, en orden" })
    .getByRole("link", { name: /Cómo funciona/ })
    .click();
  await expect(page).toHaveURL(/\/como-funciona$/);
  await expect(page.getByRole("heading", { level: 1, name: "Cómo funciona" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Fuentes" })).toBeVisible();

  const pn = page.getByRole("navigation", { name: "Anterior y siguiente" });
  await pn.getByRole("link", { name: /Siguiente/ }).click();
  await expect(page).toHaveURL(/\/el-trabajo$/);
  await expect(page.getByRole("heading", { level: 1, name: "El trabajo" })).toBeVisible();

  await page
    .getByRole("navigation", { name: "Anterior y siguiente" })
    .getByRole("link", { name: /Anterior/ })
    .click();
  await expect(page).toHaveURL(/\/como-funciona$/);
});

test("the first section goes back to the hub", async ({ page }) => {
  await page.goto("/industrias/consultoria/como-funciona");
  await page
    .getByRole("navigation", { name: "Anterior y siguiente" })
    .getByRole("link", { name: /Anterior/ })
    .click();
  await expect(page).toHaveURL(/\/industrias\/consultoria$/);
});

test("section nav marks the current page and jumps to another section", async ({
  page,
  isMobile,
}) => {
  await page.goto("/industrias/consultoria/proceso");
  const nav = page.getByRole("navigation", { name: "En esta guía" });
  if (isMobile) await nav.locator("summary").click();
  await expect(nav.getByRole("link", { name: "Proceso de selección" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await nav.getByRole("link", { name: "Empresas en España" }).click();
  await expect(page).toHaveURL(/\/empresas$/);
});

test("segment page estrategia is reachable from the section nav", async ({ page, isMobile }) => {
  await page.goto("/industrias/consultoria");
  await page
    .getByRole("link", { name: /Consultoría de estrategia/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/industrias\/consultoria\/estrategia$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Consultoría de estrategia" }),
  ).toBeVisible();
  await expect(page.getByText("Segmento de Consultoría")).toBeVisible();
  const nav = page.getByRole("navigation", { name: "En esta guía" });
  if (isMobile) await nav.locator("summary").click();
  await expect(nav.getByRole("link", { name: "Consultoría de estrategia" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("firm filter narrows the list", async ({ page }) => {
  await page.goto("/industrias/consultoria/empresas");
  await page.getByText("Filtrar por tipo y oficina").click();
  await page.getByRole("radio", { name: "Big Four" }).check();
  await expect(page.getByText("4 empresas")).toBeVisible();
  await page.getByRole("radio", { name: "Barcelona" }).check();
  await expect(page.getByText("2 empresas")).toBeVisible();
});

test("case happy path with the keyboard-friendly controls", async ({ page }) => {
  await page.goto("/industrias/consultoria/caso-practico");
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

test("proceso lists the 2026 online tests with their sources", async ({ page }) => {
  await page.goto("/industrias/consultoria/proceso");
  await expect(
    page.getByRole("heading", { level: 2, name: "Pruebas online y uso de IA" }),
  ).toBeVisible();
  await expect(page.getByText(/Sova o TestGorilla/)).toBeVisible();
  const sources = page.getByRole("region", { name: "Fuentes" });
  // On phones the list starts collapsed in a <details>; open it like a reader would.
  const summary = sources.locator("summary");
  if (await summary.isVisible()) {
    const details = sources.locator("details");
    if ((await details.getAttribute("open")) === null) await summary.click();
  }
  await expect(sources.getByRole("link", { name: /Digital assessment/ })).toBeVisible();
});

test("dated programs live on the strategy page", async ({ page }) => {
  await page.goto("/industrias/consultoria/estrategia");
  await expect(page.getByText(/octava edición/)).toBeVisible();
});
