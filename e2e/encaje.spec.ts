import path from "node:path";
import { expect, test } from "@playwright/test";

// `/dev/encaje` is not served in production, so this runs against `next dev` (playwright.config.ts).
const DEV_URL = "http://localhost:3100";
test.skip(!!process.env.BASE_URL, "dev-only route");
test.use({ baseURL: DEV_URL });

const CV = path.join(__dirname, "fixtures", "cv_lucia_ficticia.txt");

test("CV is read in the browser, profile is editable and reasons are shown", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (r) => requests.push(`${r.method()} ${r.url()}`));

  await page.goto("/dev/encaje");
  await expect(page.getByRole("heading", { level: 1, name: "Tu encaje" })).toBeVisible();
  await expect(page.getByText("Tu CV no sale de tu navegador.")).toBeVisible();

  await page.getByLabel("Archivo PDF, DOCX o TXT").setInputFiles(CV);
  await expect(page.getByText("Hemos leído tu CV en este navegador")).toBeVisible();

  // Detected from the fictional CV.
  const skills = page.getByLabel("Habilidades");
  await expect(skills).toHaveValue(/SQL/);
  await expect(skills).toHaveValue(/Python/);
  await expect(page.getByLabel("Ciudades")).toHaveValue(/Madrid/);

  // Edit: ask for a data role and add a skill the CV does not mention.
  await page.getByLabel("Puestos que buscas").fill("data analyst");
  await skills.fill("SQL, Python, Cobol");
  await page.getByLabel("Data science").check();

  const first = page.getByRole("listitem").filter({ hasText: "Junior Data Analyst" }).first();
  await expect(first).toBeVisible();
  await expect(first).toContainText("coincide: SQL, Python");
  await expect(first).toContainText("sector: ciencia de datos");

  // The CV never travels: no request carries it and no POST/PUT left the page.
  expect(requests.filter((r) => /^(POST|PUT|PATCH) /.test(r))).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    await page.evaluate(() => window.innerWidth),
  );

  // The profile survives a reload (localStorage), the CV text is not stored.
  await page.reload();
  await expect(page.getByLabel("Habilidades")).toHaveValue(/Cobol/);
  const stored = await page.evaluate(() => JSON.stringify({ ...window.localStorage }));
  expect(stored).not.toContain("lucia.ficticia");
});

test("everything is reachable by keyboard", async ({ page }) => {
  await page.goto("/dev/encaje");
  await page.getByLabel("Archivo PDF, DOCX o TXT").focus();
  await page.keyboard.press("Tab");
  // Next stop after the file input is the first industry checkbox.
  await expect(page.getByLabel("Consultoría")).toBeFocused();
  await page.keyboard.press("Space");
  await expect(page.getByLabel("Consultoría")).toBeChecked();
  await expect(
    page.getByRole("listitem").filter({ hasText: "sector: consultoría" }).first(),
  ).toBeVisible();
});

test("a file we cannot read is announced", async ({ page }) => {
  await page.goto("/dev/encaje");
  await page.getByLabel("Archivo PDF, DOCX o TXT").setInputFiles({
    name: "cv.png",
    mimeType: "image/png",
    buffer: Buffer.from("x"),
  });
  await expect(page.getByRole("main").getByRole("alert")).toHaveText(
    "Solo leemos archivos PDF, DOCX o TXT.",
  );
});
