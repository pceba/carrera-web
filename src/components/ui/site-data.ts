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

export const FOOTER_GROUPS = [
  {
    title: "Guía",
    links: [
      { href: ROUTES.industries, label: "Industrias" },
      { href: ROUTES.prep, label: "Preparación" },
      { href: ROUTES.resources, label: "Recursos" },
      { href: ROUTES.offers, label: "Ofertas" },
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
