import { expect, test } from "@playwright/test";

test("quiz: complete it by keyboard, see a ranked result, reload restores it", async ({ page }) => {
  const writes: string[] = [];
  page.on("request", (r) => {
    if (r.method() !== "GET") writes.push(`${r.method()} ${r.url()}`);
  });

  await page.goto("/diagnostico");
  await expect(
    page.getByRole("heading", { level: 1, name: "¿Qué industria encaja contigo?" }),
  ).toBeVisible();
  await expect(page.getByText("No guardamos tus respuestas")).toBeVisible();

  // Keyboard only: focus the first radio of each question, pick it with Space, Enter to continue.
  for (let q = 1; q <= 8; q++) {
    await expect(page.getByText(`${q} de 8`)).toBeVisible();
    await page.getByRole("radio").first().focus();
    await page.keyboard.press("Space");
    await page.keyboard.press("Enter");
  }

  await expect(page.getByRole("heading", { name: "Tu orientación" })).toBeVisible();
  await expect(page.getByText("Es una orientación, no un veredicto.")).toBeVisible();
  const ranked = page.getByTestId("ranked");
  await expect(ranked).toHaveCount(6);
  await expect(ranked.first()).toContainText("Más cerca");
  await expect(ranked.first().getByRole("listitem")).toHaveCount(2); // two "por qué" lines
  expect(page.url()).toMatch(/#r=\d{8}$/);

  const order = await ranked.locator("span[class*=rankName]").allTextContents();

  // Reload with the hash: same ranking, no storage involved.
  await page.reload();
  await expect(page.getByRole("heading", { name: "Tu orientación" })).toBeVisible();
  expect(
    await page.getByTestId("ranked").locator("span[class*=rankName]").allTextContents(),
  ).toEqual(order);

  // Repeat clears the hash and starts over.
  await page.getByRole("button", { name: "Repetir" }).click();
  await expect(page.getByText("1 de 8")).toBeVisible();
  expect(page.url()).not.toContain("#r=");

  expect(writes).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  );
});

test("quiz: a shared link opens the result; a broken one falls back to the first question", async ({
  page,
}) => {
  await page.goto("/diagnostico#r=33333333");
  await expect(page.getByRole("heading", { name: "Tu orientación" })).toBeVisible();
  await page.goto("/diagnostico#r=999");
  await expect(page.getByText("1 de 8")).toBeVisible();
});

test("quiz: the guide link points to the guide, or says it is in preparation", async ({ page }) => {
  await page.goto("/diagnostico#r=22111111");
  const first = page.getByTestId("ranked").first();
  await expect(first.getByRole("link")).toHaveAttribute("href", /^\/(industrias|ofertas)/);
});
