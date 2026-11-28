# Handover P13: site plumbing

Branch `claude/p13-plumbing` (from local `main`), not pushed.

## Done

- `src/app/sitemap.ts`: static public routes + industry hubs + every section/segment of `live`
  industries + prep guides with `hasContent` (content-driven from `content/catalog.ts`). Excludes
  `/cuenta`, `/entrar`, `/dev`, `/api`, `/alertas/baja`.
- `src/app/robots.ts`: `Disallow: /` unless `NEXT_PUBLIC_INDEXABLE=true` (same switch as the root
  metadata); when indexable, allows `/`, blocks account/API/dev and lists the sitemap.
- `src/app/manifest.ts` (Path name, `#eceef1` background, `#0b0d10` theme) +
  `public/icon-maskable.svg`; the regular icon is the existing `src/app/icon.svg`.
- `not-found.tsx` (inside `Shell`, so Ctrl/⌘K search works; links to home, industries, diagnostic,
  tracker), `error.tsx` (retry + home), `global-error.tsx` (plain inline styles, no tokens).
- OG images in `(public)/{candidaturas,diagnostico,practica,calendario,encaje,ofertas}/`.
- `e2e/plumbing.spec.ts`: robots, sitemap, manifest, 404, the six share images.

## Notes / requests

- Base URL for sitemap/robots: `NEXT_PUBLIC_SITE_URL`, default `https://path-ten-theta.vercel.app`.
  Set it in Vercel when the real domain exists. `metadataBase` in the root layout is still unset
  (build warns; OG URLs fall back to localhost in dev): owner of `src/app/layout.tsx` should set it.
- Manifest icons are SVG only; PNG 192/512 (needed for some installers) were not generated.
- New pages added by other streams must be added to `STATIC_ROUTES` in `sitemap.ts`.
