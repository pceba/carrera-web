import { defineConfig, devices } from "@playwright/test";

// BASE_URL lets CI point the smoke test at a Vercel preview; locally it starts the built app.
const baseURL = process.env.BASE_URL ?? "http://localhost:3000";

// `/dev/*` routes only exist outside production, so their specs run against `next dev` on its own
// port (see e2e/encaje.spec.ts). Against a deployed BASE_URL those specs are skipped.
const DEV_URL = "http://localhost:3100";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL, trace: "on-first-retry" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-375", use: { ...devices["Pixel 5"], viewport: { width: 375, height: 812 } } },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : [
        { command: "npm run start", url: baseURL, reuseExistingServer: !process.env.CI },
        {
          command: "npx next dev -p 3100",
          url: DEV_URL,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
      ],
});
