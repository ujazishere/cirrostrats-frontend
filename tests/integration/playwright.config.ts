import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./specs",
  outputDir: "./results/test-artifacts",
  timeout: 20000,
  expect: {
    timeout: 20000,
  },
  retries: process.env.CI ? 2 : 5, // Will retry twice if CI (github actions), otherwise just once
  workers: process.env.CI ? 1 : 3, // How many tests can run in parallel, 1 if (CI) github actions, 3 if locally
  use: {
    baseURL: "http://localhost:5173/",
    headless: true, // For debugging, headless = false gives a GUI
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  reporter: [
    ["html", { outputFolder: "./results/html-report" }],
    ["json", { outputFile: "./results/test-results.json" }],
  ],
  // Assume fronted & backend servers are already running.
});
