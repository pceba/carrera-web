/**
 * Site routes and shell navigation. Industries, sections, preparation guides and resources are
 * data in `content/catalog.ts`; this file only holds the fixed frame around them.
 */

export const ROUTES = {
  home: "/",
  industries: "/industrias",
  consulting: "/industrias/consultoria",
  prep: "/preparacion",
  resources: "/recursos",
  offers: "/ofertas",
  /** Tools. `/candidaturas` is built by the P1 stream; `/encaje` works without an account. */
  tracker: "/candidaturas",
  /** Quiz "¿Qué industria encaja contigo?", built by another stream. */
  diagnostic: "/diagnostico",
  fit: "/encaje",
  /** Owned by WS-C: magic-link sign-in, which also creates the account on first use. */
  signIn: "/entrar",
  account: "/cuenta",
  privacy: "/legal/privacidad",
  terms: "/legal/terminos",
  cookies: "/legal/cookies",
  legalNotice: "/legal/aviso-legal",
} as const;

/** Public source code. Content is CC BY-SA 4.0, code MIT. */
export const REPO_URL = "https://github.com/pceba/path";

/** Main navigation: four items. `match` marks the link as current for every path under it. */
export const NAV_LINKS = [
  { href: ROUTES.industries, label: "Industrias", match: "/industrias" },
  { href: ROUTES.prep, label: "Preparación", match: "/preparacion" },
  { href: ROUTES.resources, label: "Recursos", match: "/recursos" },
  { href: ROUTES.offers, label: "Ofertas", match: "/ofertas" },
] as const;

/** Tools shown in the "Herramientas" menu, the command palette and the footer. */
export const TOOLS = [
  {
    href: ROUTES.fit,
    label: "Encaje",
    text: "Ordena las seis industrias según tu perfil. Tu CV no sale del navegador.",
  },
  {
    href: ROUTES.diagnostic,
    label: "Diagnóstico",
    text: "¿Qué industria encaja contigo? Unas preguntas y una primera idea.",
  },
  {
    href: ROUTES.tracker,
    label: "Candidaturas",
    text: "Un tablero para seguir cada solicitud, de guardada a oferta.",
  },
  {
    href: ROUTES.offers,
    label: "Ofertas",
    text: "Prácticas y puestos junior, con enlace al anuncio original.",
  },
] as const;

export const FOOTER_GROUPS = [
  {
    title: "Herramientas",
    links: [
      { href: ROUTES.diagnostic, label: "Diagnóstico" },
      { href: ROUTES.fit, label: "Encaje" },
      { href: ROUTES.tracker, label: "Candidaturas" },
      { href: ROUTES.offers, label: "Ofertas" },
    ],
  },
  {
    title: "Preparación",
    links: [
      { href: ROUTES.prep, label: "Guías de preparación" },
      { href: ROUTES.resources, label: "Biblioteca de recursos" },
    ],
  },
  {
    title: "Cuenta",
    links: [
      { href: ROUTES.signIn, label: "Entrar o crear cuenta" },
      { href: ROUTES.account, label: "Mi cuenta" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: ROUTES.privacy, label: "Privacidad" },
      { href: ROUTES.terms, label: "Términos de uso" },
      { href: ROUTES.cookies, label: "Cookies" },
      { href: ROUTES.legalNotice, label: "Aviso legal" },
    ],
  },
] as const;
