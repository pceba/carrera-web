import { expect, test } from "@playwright/test";

test("robots disallows everything unless indexable", async ({ request }) => {
  const body = await (await request.get("/robots.txt")).text();
  if (process.env.NEXT_PUBLIC_INDEXABLE === "true") {
    expect(body).toContain("Sitemap:");
  } else {
    expect(body).toMatch(/User-Agent: \*\s+Disallow: \/\s*$/i);
  }
});

test("sitemap lists public routes and guide pages, not account or dev pages", async ({
  request,
}) => {
  const body = await (await request.get("/sitemap.xml")).text();
  for (const p of [
    "/industrias",
    "/calendario",
    "/encaje",
    "/industrias/banca-de-inversion/proceso",
  ]) {
    expect(body).toContain(`${p}</loc>`);
  }
  expect(body).not.toContain("/cuenta");
  expect(body).not.toContain("/dev");
  expect(body).not.toContain("/entrar");
});

test("manifest has Path colours and icons", async ({ request }) => {
  const m = await (await request.get("/manifest.webmanifest")).json();
  expect(m.name).toBe("Path");
  expect(m.theme_color).toBe("#0b0d10");
  expect(m.icons.length).toBeGreaterThan(0);
});

test("unknown routes get the designed 404 with a way out", async ({ page }) => {
  const res = await page.goto("/esto-no-existe");
  expect(res?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { level: 1, name: "No encontramos esa página" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Candidaturas" }).first()).toBeVisible();
});

for (const route of [
  "candidaturas",
  "diagnostico",
  "practica",
  "calendario",
  "encaje",
  "ofertas",
]) {
  test(`/${route} has its own share image`, async ({ page, request }) => {
    await page.goto(`/${route}`);
    const og = await page.locator('meta[property="og:image"]').getAttribute("content");
    expect(og).toContain(`/${route}/opengraph-image`);
    const res = await request.get(new URL(og!).pathname);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
  });
}
