import { defineConfig } from "@playwright/test"
export default defineConfig({
  testDir: "./tests",
  testMatch: "nil-example.spec.ts",
  workers: 1,
  outputDir: "../.scratch/nil/test-results",
  reporter: [["list"], ["json", { outputFile: "../.scratch/nil/browser-results.json" }]],
  use: {
    baseURL: "http://127.0.0.1:18965",
    headless: true,
    screenshot: "only-on-failure",
    launchOptions: { executablePath: process.env.NIL_CHROMIUM, args: ["--no-sandbox"] },
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 18965 --strictPort",
    url: "http://127.0.0.1:18965/nil-example.html",
    reuseExistingServer: false,
  },
})
