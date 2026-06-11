import { defineConfig, devices } from '@playwright/test';

const PORT = process.env.PLAYWRIGHT_PORT
  ? Number(process.env.PLAYWRIGHT_PORT)
  : 9000;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ],
  webServer: {
    command: 'npm run serve',
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      // Defaults so the suite runs on a clean checkout with no .env: the
      // harness pages under test never call the STAC API, but tasks/server.mjs
      // exits without REACT_APP_STAC_API and the posthtml build needs
      // APP_TITLE / APP_DESCRIPTION. Exported real values still win.
      REACT_APP_STAC_API:
        process.env.REACT_APP_STAC_API ?? 'http://localhost:9876/stac',
      APP_TITLE: process.env.APP_TITLE ?? 'STAC Manager (e2e)',
      APP_DESCRIPTION: process.env.APP_DESCRIPTION ?? 'STAC Manager e2e run',
      // Pin the dev server to the port Playwright polls; otherwise it scans
      // 9000-9999 for a free port and can bind somewhere else entirely.
      PORT: String(PORT)
    }
  }
});
