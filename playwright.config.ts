import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";

import { TIMEOUT } from "./constants";

const junitOutputFile = process.env.CI
  ? `test-results/junit-${process.env.CI_JOB_ID ?? "local"}.xml`
  : "test-results/junit.xml";
const viewport = process.env.CI
  ? { width: 1440, height: 900 }
  : { width: 1920, height: 1080 };

export default defineConfig({
  testDir: "./tests",
  globalSetup: "./global-setup.ts",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.E2E_RETRIES
    ? Number.parseInt(process.env.E2E_RETRIES, 10)
    : process.env.CI
      ? 1
      : 0,
  workers: process.env.PLAYWRIGHT_WORKERS
    ? Number.parseInt(process.env.PLAYWRIGHT_WORKERS, 10)
    : 1,
  reporter: process.env.CI
    ? [
        ["list"],
        ["junit", { outputFile: junitOutputFile }],
        ["json", { outputFile: "test-results/results.json" }],
      ]
    : [
        ["list"],
        ["html", { open: "on-failure" }],
        ["json", { outputFile: "test-results/results.json" }],
      ],
  timeout: process.env.CI ? TIMEOUT.TEST_OVERALL : TIMEOUT.TEST_OVERALL_LOCAL,
  use: {
    ...devices["Desktop Chrome"],
    baseURL: process.env.MIRAIZ_BASE_URL ?? "https://miraiz-persol.jp",
    trace: "on", // Record trace (screenshots + DOM snapshots) for every test, embedded in HTML report
    headless: true,
    screenshot: "on", // Capture a screenshot after each step, embedded in HTML report
    video: {
      mode: "on",
      size: viewport,
    },
    viewport: viewport,
    launchOptions: {
      slowMo: process.env.CI ? 100 : 150,
      args: process.env.CI
        ? ["--disable-gpu", "--disable-dev-shm-usage", "--no-sandbox"]
        : ["--start-maximized"],
    },
    deviceScaleFactor: process.env.CI ? 1 : undefined,
    timezoneId: "Asia/Tokyo",
  },
});
