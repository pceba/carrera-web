import { expect, test, type Page, type Request } from "@playwright/test";

/**
 * /practica with a mocked provider API. The whole point of the page is that the user's key goes
 * from the browser straight to the provider and never to our server, so these tests record every
 * request to our own origin and check the key is nowhere in them.
 */
const KEY = "AIzaTESTKEY-1234567890-zzzz";

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "POST, OPTIONS",
};

const sse = (...texts: string[]) =>
  texts
    .map(
      (t) => `data: ${JSON.stringify({ candidates: [{ content: { parts: [{ text: t }] } }] })}\n\n`,
    )
    .join("");

const FEEDBACK = JSON.stringify({
  resumen: "Buen ritmo y estructura clara.",
  criterios: [
    { id: "estructura", puntuacion: 4, comentario: "Abriste con objetivo y dos ramas." },
    { id: "calculo", puntuacion: 3, comentario: "Faltó comprobar el orden de magnitud." },
    { id: "sintesis", puntuacion: 2, comentario: "No cerraste con una recomendación." },
    { id: "comunicacion", puntuacion: 5, comentario: "Pensaste en voz alta." },
  ],
  siguientes_pasos: ["Practica estimaciones", "Cierra siempre con respuesta", "Resume en 30 s"],
});

/** Mocks Gemini: replies depend on what the request asks. Returns the recorded provider calls. */
async function mockGemini(page: Page, opts: { status?: number } = {}) {
  const calls: { headers: Record<string, string>; body: string; url: string }[] = [];
  await page.route("https://generativelanguage.googleapis.com/**", async (route) => {
    const req = route.request();
    if (req.method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers: CORS });
      return;
    }
    calls.push({ headers: req.headers(), body: req.postData() ?? "", url: req.url() });
    if (opts.status) {
      await route.fulfill({ status: opts.status, headers: CORS, body: "{}" });
      return;
    }
    const body = req.postData() ?? "";
    const text = body.includes("Transcripción de la sesión")
      ? sse(FEEDBACK.slice(0, 40), FEEDBACK.slice(40))
      : body.includes("Preguntaría")
        ? sse("Bien. ", "Ahora, ¿qué cifras pedirías?")
        : sse("Caso ficticio: una panadería. ", "¿Cómo estructurarías el problema?");
    await route.fulfill({
      status: 200,
      headers: { ...CORS, "content-type": "text/event-stream" },
      body: text,
    });
  });
  return calls;
}

function watchOwnOrigin(page: Page) {
  const seen: Request[] = [];
  page.on("request", (r) => {
    if (r.url().startsWith("http://localhost")) seen.push(r);
  });
  return seen;
}

async function saveKey(page: Page, remember = false) {
  await page.getByLabel("Clave de Google Gemini").fill(KEY);
  if (remember) await page.getByLabel("Recordar en este navegador").check();
  await page.getByRole("button", { name: "Guardar clave" }).click();
}

test("without a key it shows a demo and how to get one, and cannot start", async ({ page }) => {
  await page.goto("/practica");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Practica la entrevista");
  await expect(page.getByText("Ejemplo", { exact: true })).toBeVisible();
  await expect(page.getByRole("log", { name: "Conversación" })).toContainText("panaderías");
  await expect(page.getByRole("button", { name: "Empezar la práctica" })).toBeDisabled();

  await page.getByText("¿Cómo consigo una clave de Google Gemini?").click();
  await expect(page.getByRole("listitem").filter({ hasText: "Google AI Studio" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Abrir la consola de Google Gemini/ }),
  ).toHaveAttribute("href", "https://aistudio.google.com/apikey");

  // Other provider and mode change what is shown.
  await page.getByRole("radio", { name: "Anthropic (Claude)" }).click();
  await expect(page.getByLabel("Modelo")).toHaveValue("claude-haiku-5-5");
  await page.getByRole("radio", { name: /Comportamiento/ }).click();
  await expect(page.getByRole("log", { name: "Conversación" })).toContainText("desacuerdo");
});

test("full session: key, two turns, feedback cards, download, and the key never reaches our server", async ({
  page,
}) => {
  const own = watchOwnOrigin(page);
  const calls = await mockGemini(page);
  await page.goto("/practica");

  await saveKey(page);
  await expect(page.getByText("AIza••••zzzz")).toBeVisible();
  // Session storage by default; nothing in local storage.
  expect(await page.evaluate(() => sessionStorage.length)).toBe(1);
  expect(await page.evaluate(() => localStorage.getItem("path.byok.key.gemini"))).toBeNull();

  await page.getByRole("button", { name: "Empezar la práctica" }).click();
  const log = page.getByRole("log", { name: "Conversación" });
  await expect(log).toContainText("¿Cómo estructurarías el problema?");
  // The start marker is never shown.
  await expect(log).not.toContainText("[INICIO]");

  const answer = page.getByLabel("Tu respuesta");
  await answer.fill("Preguntaría por el objetivo y dividiría en ingresos y costes.");
  await answer.press("Enter");
  await expect(log).toContainText("¿qué cifras pedirías?");
  await expect(log).toContainText("Tú");

  await answer.fill("Pediría clientes por tienda y ticket medio.");
  await page.getByRole("button", { name: "Enviar" }).click();
  await expect(log.getByText("Pediría clientes por tienda")).toBeVisible();

  await page.getByRole("button", { name: "Terminar y pedir feedback" }).click();
  await expect(page.getByRole("heading", { name: "Feedback de la sesión" })).toBeVisible();
  const cards = page
    .getByRole("listitem")
    .filter({ hasText: /Estructura|Cálculo|Síntesis|Comunicación/ });
  await expect(cards).toHaveCount(4);
  await expect(page.getByText("Abriste con objetivo y dos ramas.")).toBeVisible();
  await expect(page.getByText("Cierra siempre con respuesta")).toBeVisible();

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Descargar transcripción" }).click(),
  ]);
  expect(download.suggestedFilename()).toBe("practica-consultoria.txt");

  // The provider got the key in a header, over HTTPS, straight from the browser.
  expect(calls.length).toBeGreaterThanOrEqual(4);
  for (const c of calls) {
    expect(c.headers["x-goog-api-key"]).toBe(KEY);
    expect(c.url).not.toContain(KEY);
    expect(c.body).not.toContain(KEY);
  }

  // Nothing about the key reached our own origin: no POST, no key anywhere in URL, headers or body.
  expect(own.filter((r) => r.method() !== "GET")).toHaveLength(0);
  for (const r of own) {
    expect(r.url()).not.toContain(KEY);
    expect(r.postData() ?? "").not.toContain(KEY);
    expect(JSON.stringify(r.headers())).not.toContain(KEY);
  }
  expect(page.url()).not.toContain(KEY);

  // The transcript is not stored anywhere.
  const stored = await page.evaluate(() => JSON.stringify({ ...sessionStorage, ...localStorage }));
  expect(stored).not.toContain("panadería");
});

test("remember puts the key in local storage and Borrar clave removes it everywhere", async ({
  page,
}) => {
  await page.goto("/practica");
  await saveKey(page, true);
  await expect(page.getByText("recordada en este navegador")).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("path.byok.key.gemini"))).toBe(KEY);
  expect(await page.evaluate(() => sessionStorage.getItem("path.byok.key.gemini"))).toBeNull();

  await page.reload();
  await expect(page.getByText("AIza••••zzzz")).toBeVisible();

  await page.getByRole("button", { name: "Borrar clave" }).click();
  await expect(page.getByLabel("Clave de Google Gemini")).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("path.byok.key.gemini"))).toBeNull();
  expect(await page.evaluate(() => sessionStorage.getItem("path.byok.key.gemini"))).toBeNull();
  await expect(page.getByRole("region", { name: "Avisos" })).toContainText("Clave borrada");
});

test("a rejected key explains itself and offers a retry", async ({ page }) => {
  await mockGemini(page, { status: 401 });
  await page.goto("/practica");
  await saveKey(page);
  await page.getByRole("button", { name: "Empezar la práctica" }).click();
  await expect(page.locator("main [role=alert]")).toContainText("no acepta la clave");
  await expect(page.getByRole("button", { name: "Reintentar" })).toBeVisible();
});

test("rate limit and blocked network give their own messages", async ({ page }) => {
  await mockGemini(page, { status: 429 });
  await page.goto("/practica");
  await saveKey(page);
  await page.getByRole("button", { name: "Empezar la práctica" }).click();
  await expect(page.locator("main [role=alert]")).toContainText("límite");

  await page.unroute("https://generativelanguage.googleapis.com/**");
  await page.route("https://generativelanguage.googleapis.com/**", (r) => r.abort("failed"));
  await page.getByRole("button", { name: "Reintentar" }).click();
  await expect(page.locator("main [role=alert]")).toContainText(
    "No se pudo conectar con Google Gemini",
  );
});

test("Anthropic calls carry the browser-access header and the default model", async ({ page }) => {
  let seen: { headers: Record<string, string>; body: string } | null = null;
  await page.route("https://api.anthropic.com/**", async (route) => {
    const req = route.request();
    if (req.method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers: CORS });
      return;
    }
    seen = { headers: req.headers(), body: req.postData() ?? "" };
    const ev = (o: unknown) => `data: ${JSON.stringify(o)}\n\n`;
    await route.fulfill({
      status: 200,
      headers: { ...CORS, "content-type": "text/event-stream" },
      body:
        ev({ type: "message_start" }) +
        ev({ type: "content_block_delta", delta: { text: "Hola, empezamos." } }) +
        ev({ type: "message_stop" }),
    });
  });
  await page.goto("/practica");
  await page.getByRole("radio", { name: "Anthropic (Claude)" }).click();
  await page.getByLabel("Clave de Anthropic (Claude)").fill("sk-ant-test-0000000000");
  await page.getByRole("button", { name: "Guardar clave" }).click();
  await page.getByRole("button", { name: "Empezar la práctica" }).click();
  await expect(page.getByRole("log", { name: "Conversación" })).toContainText("Hola, empezamos.");
  expect(seen).not.toBeNull();
  const s = seen as unknown as { headers: Record<string, string>; body: string };
  expect(s.headers["anthropic-dangerous-direct-browser-access"]).toBe("true");
  expect(s.headers["x-api-key"]).toBe("sk-ant-test-0000000000");
  expect(JSON.parse(s.body).model).toBe("claude-haiku-5-5");
});

test("no horizontal scroll and the header menu lists the practice page", async ({
  page,
  isMobile,
}) => {
  await page.goto("/practica");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
  if (!isMobile) {
    await page.getByRole("button", { name: "Herramientas", exact: true }).click();
    await expect(
      page
        .getByRole("navigation", { name: "Principal", exact: true })
        .getByRole("link", { name: /Práctica con IA/ }),
    ).toHaveAttribute("href", "/practica");
  }
});
