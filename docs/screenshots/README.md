# Screenshots

Before and after the WS-UI redesign (2026-11-27). Pages: home, consulting, industry map, offers
(empty state: no database in local builds) and sign-in. Each at 375 px and 1280 px, light and dark,
full page, JPEG quality 70. Only fictional or public data appears.

Regenerate against a running build:

```powershell
npm run build
npm run start -- -p 3217
node e2e/capture-screenshots.mjs docs/screenshots/after http://localhost:3217
```

Pass a fourth argument to limit pages, e.g. `home,consultoria`.
