import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3100";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "**/*.spec.ts",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  use: {
    baseURL,
    locale: "en-IN",
    timezoneId: "Asia/Kolkata",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
      testIgnore: /mobile\.spec\.ts/,
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 7"], channel: "chrome" },
      testMatch: /mobile\.spec\.ts/,
    },
  ],
  webServer: {
    command: "npx next start -p 3100",
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
    env: {
      NAPI_RS_FORCE_WASI: "true",
      // The suite runs from one IP and signs in repeatedly; keep the production
      // defaults in the app but relax them for local end-to-end runs.
      AUTH_LOGIN_IP_LIMIT: "50",
      AUTH_LOGIN_EMAIL_LIMIT: "50",
      LEAD_RATE_LIMIT: "50",
      SITE_VISIT_RATE_LIMIT: "50",
    },
  },
});
