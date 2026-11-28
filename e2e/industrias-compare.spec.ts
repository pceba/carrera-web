import { expect, test } from "@playwright/test";

test("compare two live guides side by side, with sources", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/industrias");
  const section = page.getByRole("region", { name: "Dos o tres industrias, lado a lado." });
  const table = section.getByTestId("compare-table");
  await expect(table).toBeVisible();
  await expect(table.getByRole("columnheader")).toHaveCount(2);
  await expect(table.getByRole("rowheader", { name: "Sueldo de entrada" })).toBeVisible();
  await expect(table.getByRole("link", { name: "Fuente: Sueldos" }).first()).toBeVisible();
  // Add a guide in preparation: its values are dashes with the reason.
  await section.getByRole("button", { name: "Private equity" }).click();
  await expect(table.getByRole("columnheader")).toHaveCount(3);
  await expect(table.getByText("Guía en preparación").first()).toBeVisible();
  // Three is the maximum: the remaining chips are disabled.
  await expect(section.getByRole("button", { name: "Big law" })).toBeDisabled();
  await expect(page.getByRole("link", { name: "Haz el test" })).toHaveAttribute(
    "href",
    "/diagnostico",
  );
});

test("a card's Comparar button opens the comparison in a dialog", async ({ page }) => {
  await page.goto("/industrias");
  await page.getByRole("button", { name: "Comparar Big law" }).click();
  const dialog = page.getByRole("dialog", { name: "Comparar Big law" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Big law", pressed: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("at 375 px the comparison is swipeable cards with no page scroll", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/industrias");
  const cards = page.getByTestId("compare-cards");
  await cards.scrollIntoViewIfNeeded();
  await expect(cards).toBeVisible();
  await expect(page.getByTestId("compare-table")).toBeHidden();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
});
