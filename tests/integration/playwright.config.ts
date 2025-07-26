import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./specs",
  outputDir: "./results/test-artifacts",
  timeout: 15000,
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
