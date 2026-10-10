import { defineConfig } from "@playwright/test"
export default defineConfig({
  testDir: "./tests",
  testMatch: "operations-list-candidate.spec.ts",
  outputDir: "../.scratch/operations-list/test-results",
  workers: 1,
  reporter: [
    ["list"],
    ["json", { outputFile: "../.scratch/operations-list/browser-results.json" }],
  ],
  use: {
    baseURL: "http://127.0.0.1:18773",
    headless: true,
    launchOptions: { executablePath: process.env.OPS_CHROMIUM, args: ["--no-sandbox"] },
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 18773 --strictPort",
    url: "http://127.0.0.1:18773/operations-list.html",
    reuseExistingServer: false,
  },
})
