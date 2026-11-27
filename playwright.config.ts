import { defineConfig, devices } from "@playwright/test";

// BASE_URL lets CI point the smoke test at a Vercel preview; locally it starts the built app.
const baseURL = process.env.BASE_URL ?? "http://localhost:3000";

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
    : { command: "npm run start", url: baseURL, reuseExistingServer: !process.env.CI },
});
