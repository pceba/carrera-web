import { expect, test, type Page } from "@playwright/test";
import { INDUSTRIES } from "../content/catalog";

const noOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

test.describe("home (P3 redesign)", () => {
  test("renders every section: announcement, hero, window, logos, cards, tools, trust, CTA", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("link", { name: /Tracker de candidaturas/i }).first(),
    ).toHaveAttribute("href", "/candidaturas");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Empieza tu carrera");
    const main = page.getByRole("main");
    await expect(main.getByRole("link", { name: "Explorar industrias" }).first()).toBeVisible();
    await expect(main.getByRole("link", { name: "Probar Encaje" }).first()).toBeVisible();

    // Product window with its three tabs.
    const tabs = page.getByRole("tablist", { name: "Herramientas de Path" }).getByRole("tab");
    await expect(tabs).toHaveCount(3);
    await expect(page.getByText("Datos de ejemplo").first()).toBeVisible();

    // Typographic logo wall with its caption and disclaimer; no images.
    const wall = page.getByRole("region", { name: "Empresas que analiza la guía" });
    await expect(wall.getByRole("listitem")).toHaveCount(20);
    await expect(wall.getByText("Path no está afiliado a ninguna de ellas.")).toBeAttached();
    await expect(wall.locator("img")).toHaveCount(0);

    await expect(main.getByRole("heading", { name: /Todo lo que necesitas/ })).toBeAttached();
    await expect(main.getByText("Sin anuncios ni tracking")).toBeAttached();
    await expect(main.getByRole("heading", { name: /Tu primer paso/ })).toBeAttached();
    for (const i of INDUSTRIES) {
      await expect(main.locator(`a[href="/industrias/${i.slug}"]`).first()).toBeAttached();
    }
    // Decorative art is hidden from assistive tech.
    expect(await page.locator("main svg:not([aria-hidden='true'])").count()).toBe(0);
    expect(await noOverflow(page)).toBe(true);
  });

  test("window tabs respond to click and arrow keys", async ({ page }) => {
    await page.goto("/");
    const list = page.getByRole("tablist", { name: "Herramientas de Path" });
    await list.getByRole("tab", { name: /Candidaturas/ }).click();
    await expect(list.getByRole("tab", { name: /Candidaturas/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(page.getByRole("tabpanel")).toContainText("tablero");
    await page.keyboard.press("ArrowRight");
    await expect(list.getByRole("tab", { name: /Ofertas/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await page.keyboard.press("Home");
    await expect(list.getByRole("tab", { name: /Encaje/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("window tabs cycle by themselves", async ({ page }) => {
    await page.goto("/");
    const second = page.getByRole("tab", { name: /Candidaturas/ });
    await expect(second).toHaveAttribute("aria-selected", "false");
    await expect(second).toHaveAttribute("aria-selected", "true", { timeout: 15_000 });
  });

  test("scroll reveals show their content", async ({ page }) => {
    await page.goto("/");
    const heading = page.getByRole("heading", { name: /Hecho para ti/ });
    await heading.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        heading.evaluate((el) => getComputedStyle(el.closest("[data-reveal]") ?? el).opacity),
      )
      .toBe("1");
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("everything is visible at once and tabs do not cycle", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(800); // let hydration run its effects
    expect(await page.locator('[data-reveal="out"]').count()).toBe(0);
    const cta = page.getByRole("heading", { name: /Tu primer paso/ });
    expect(await cta.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
    const first = page.getByRole("tab", { name: /Encaje/ });
    await expect(first).toHaveAttribute("aria-selected", "true");
    await page.waitForTimeout(1500);
    await expect(first).toHaveAttribute("aria-selected", "true");
  });
});

test.describe("command palette", () => {
  test("Ctrl+K opens it, filters the catalogue and navigates with Enter", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Control+k");
    const dialog = page.getByRole("dialog", { name: "Buscar en Path" });
    await expect(dialog).toBeVisible();
    const input = dialog.getByRole("combobox");
    await expect(input).toBeFocused();
    await input.fill("banca");
    await expect(dialog.getByRole("option").first()).toContainText("Banca de inversión");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/industrias\/banca-de-inversion$/);
    await expect(dialog).toBeHidden();
  });

  test("arrow keys move the selection and Escape closes it, returning focus", async ({ page }) => {
    await page.goto("/");
    const opener = page.getByRole("button", { name: "Buscar" }).filter({ visible: true }).first();
    await opener.click();
    const dialog = page.getByRole("dialog", { name: "Buscar en Path" });
    await expect(dialog).toBeVisible();
    const options = dialog.getByRole("option");
    await expect(options.first()).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowDown");
    await expect(options.nth(1)).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test("says so when nothing matches, and copies the link with a toast", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]).catch(() => {});
    await page.goto("/");
    await page.keyboard.press("Control+k");
    const dialog = page.getByRole("dialog", { name: "Buscar en Path" });
    await dialog.getByRole("combobox").fill("zzzzqq");
    await expect(dialog.getByRole("status")).toContainText("Nada para");
    await dialog.getByRole("combobox").fill("copiar enlace");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("region", { name: "Avisos" })).toContainText(
      /Enlace copiado|No se pudo copiar/,
    );
  });
});

test.describe("header menus", () => {
  test("desktop dropdown opens with the arrow keys and closes with Escape", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "desktop dropdowns");
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Industrias", exact: true });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await trigger.focus();
    await page.keyboard.press("ArrowDown");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    const nav = page.getByRole("navigation", { name: "Principal", exact: true });
    await expect(nav.getByRole("link", { name: /Banca de inversión/ })).toBeVisible();
    await expect(nav.getByRole("link", { name: /Roles de IA/ })).toContainText("Pronto");
    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toBeFocused();
  });

  test("the phone menu is a full-screen sheet that works from the keyboard", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "phone-only menu");
    await page.goto("/");
    const button = page.getByRole("button", { name: "Menú" });
    await button.focus();
    await page.keyboard.press("Enter");
    const nav = page.getByRole("navigation", { name: "Principal (móvil)" });
    await expect(nav).toBeVisible();
    const box = await page.locator("#menu-movil").boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(370);
    expect(box?.height).toBeGreaterThanOrEqual(780);
    await page.keyboard.press("Tab");
    await expect(page.locator("#menu-movil :focus")).toHaveCount(1);
    await page.keyboard.press("Escape");
    await expect(nav).toBeHidden();
    await expect(button).toBeFocused();
  });
});

test.describe("/industrias", () => {
  test("filter chips narrow the cards", async ({ page }) => {
    await page.goto("/industrias");
    const main = page.getByRole("main");
    const live = INDUSTRIES.filter((i) => i.status === "live").length;
    await main.getByRole("button", { name: /Próximamente/ }).click();
    await expect(main.getByRole("status")).toContainText(
      `Mostrando ${INDUSTRIES.length - live} de ${INDUSTRIES.length}`,
    );
    await expect(main.getByRole("button", { name: /Próximamente/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await main.getByRole("button", { name: /Con guía/ }).click();
    await expect(main.locator("ul a")).toHaveCount(live);
    await main.getByRole("button", { name: /Todas/ }).click();
    await expect(main.locator("ul a")).toHaveCount(INDUSTRIES.length);
  });
});
