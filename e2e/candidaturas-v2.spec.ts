import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";

const day = (offset: number) => new Date(Date.now() + offset * 864e5).toISOString().slice(0, 10);

async function seed(page: Page) {
  const items = [
    {
      id: "a1",
      firm: "Alfa",
      stage: "enviada",
      industry: "consulting",
      next_step: "Llamada",
      next_step_on: day(-2),
    },
    {
      id: "b2",
      firm: "Beta",
      stage: "pruebas",
      industry: "big-law",
      next_step: "Test online",
      next_step_on: day(3),
    },
    { id: "c3", firm: "Gamma", stage: "interes", notes: "=SUMA(1)" },
  ];
  await page.addInitScript((data) => {
    if (!localStorage.getItem("path.applications.v1")) {
      localStorage.setItem("path.applications.v1", JSON.stringify({ version: 1, items: data }));
    }
  }, items);
}

test("stats bar, sector filter and deadline highlighting", async ({ page }) => {
  await seed(page);
  await page.goto("/candidaturas");
  await expect(page.getByTestId("stat-total")).toHaveText("3");
  await expect(page.getByTestId("stat-progress")).toHaveText("2");
  await expect(page.getByTestId("stat-rate")).toHaveText("50%"); // 1 of 2 sent reached pruebas

  const alfa = page.getByTestId("application").filter({ hasText: "Alfa" });
  await expect(alfa.getByText("Vencido")).toBeVisible();
  await expect(
    page.getByTestId("application").filter({ hasText: "Beta" }).getByText("Esta semana"),
  ).toBeVisible();

  await page.getByLabel("Filtrar por sector").selectOption("big-law");
  await expect(page.getByTestId("application")).toHaveCount(1);
  await expect(page.getByText("1 de 3")).toBeVisible();
  await page.getByLabel("Filtrar por sector").selectOption("all");
  await expect(page.getByTestId("application")).toHaveCount(3);
});

test("moving by keyboard menu is announced; drag and drop works on desktop", async ({
  page,
}, testInfo) => {
  await seed(page);
  await page.goto("/candidaturas");

  await page.getByLabel("Fase de Gamma").selectOption("enviada");
  await expect(
    page.getByRole("status").filter({ hasText: "Gamma movida a Enviada." }),
  ).toBeAttached();
  await expect(page.getByLabel("Fase de Gamma")).toHaveValue("enviada");

  test.skip(testInfo.project.name !== "desktop", "pointer drag is desktop only");
  await page.setViewportSize({ width: 1280, height: 1600 }); // no scrolling mid-drag (sticky header)
  const card = page.getByTestId("application").filter({ hasText: "Gamma" });
  await card.dragTo(page.getByRole("region", { name: /^Entrevista/ }), {
    sourcePosition: { x: 20, y: 12 }, // grab the card by its title, not by the select
  });
  await expect(page.getByLabel("Fase de Gamma")).toHaveValue("entrevista");
  await expect(
    page.getByRole("status").filter({ hasText: "Gamma movida a Entrevista." }),
  ).toBeAttached();
});

test("CSV and .ics exports, delete with undo", async ({ page }) => {
  await seed(page);
  await page.goto("/candidaturas");

  const [csv] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Exportar CSV" }).click(),
  ]);
  expect(csv.suggestedFilename()).toBe("candidaturas.csv");
  const csvText = await readFile((await csv.path())!, "utf8");
  expect(csvText).toContain("Empresa,Sector");
  expect(csvText).toContain("Alfa");
  expect(csvText).toContain("'=SUMA(1)"); // formula defused

  const [ics] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: /\.ics/ }).click(),
  ]);
  const icsText = await readFile((await ics.path())!, "utf8");
  expect(icsText).toContain("BEGIN:VCALENDAR");
  expect(icsText.match(/BEGIN:VEVENT/g)).toHaveLength(2);

  await page.getByRole("button", { name: "Editar Gamma" }).click();
  await page.getByRole("button", { name: "Eliminar", exact: true }).click();
  await page.getByRole("button", { name: "Sí, eliminar" }).click();
  await expect(page.getByTestId("application")).toHaveCount(2);
  await expect(page.getByText("Has eliminado Gamma.")).toBeVisible();
  await page.getByRole("button", { name: "Deshacer" }).click();
  await expect(page.getByTestId("application")).toHaveCount(3);
  await expect(page.getByTestId("application").filter({ hasText: "Gamma" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  );
});
