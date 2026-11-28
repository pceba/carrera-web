import { expect, test } from "@playwright/test";

test("/encaje is public and /cuenta/encaje redirects there", async ({ page, request }) => {
  const res = await request.get("/cuenta/encaje", { maxRedirects: 0 });
  expect(res.status()).toBe(308);
  expect(res.headers().location).toContain("/encaje");

  await page.goto("/encaje");
  await expect(page).toHaveURL(/\/encaje$/);
  await expect(page.getByRole("heading", { level: 1, name: "Tu encaje" })).toBeVisible();
  await expect(page.getByText("Tu CV no sale de tu navegador.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Crea una cuenta" })).toHaveAttribute(
    "href",
    "/entrar?modo=crear",
  );
});

test.describe("with sample postings (dev server)", () => {
  test.skip(!!process.env.BASE_URL, "dev-only route");
  test.use({ baseURL: "http://localhost:3100" });

  test("a ranked posting can be added to the local tracker", async ({ page }) => {
    await page.goto("/dev/encaje");
    await page
      .getByRole("button", { name: /^Añadir a candidaturas/ })
      .first()
      .click();
    await expect(page.getByText("añadida a tus candidaturas.")).toBeVisible();
    await page.goto("/candidaturas");
    await expect(page.getByText("Me interesa").first()).toBeVisible();
    const stored = await page.evaluate(() => window.localStorage.getItem("path.applications.v1"));
    expect(stored).toContain('"stage":"interes"');
  });
});
