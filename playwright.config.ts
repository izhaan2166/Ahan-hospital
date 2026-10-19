import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3100);
const baseURL = `http://localhost:${PORT}`;

/**
 * End-to-end tests run against the production build (`npm run build` first).
 * Set E2E_BROWSER_CHANNEL to "chrome" or "msedge" to use an installed browser
 * instead of Playwright's bundled Chromium.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    channel: process.env.E2E_BROWSER_CHANNEL || undefined,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], channel: process.env.E2E_BROWSER_CHANNEL || undefined } },
    { name: "mobile", use: { ...devices["Pixel 7"], channel: process.env.E2E_BROWSER_CHANNEL || undefined } },
  ],
  webServer: {
    command: `npm run start -- -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    // Appointment storage is deliberately unset: e2e tests exercise demo mode
    // and never write to a real database or send real email.
    env: { SUPABASE_URL: "", SUPABASE_SERVICE_ROLE_KEY: "", RESEND_API_KEY: "", APPOINTMENT_NOTIFY_TO: "" },
  },
});
