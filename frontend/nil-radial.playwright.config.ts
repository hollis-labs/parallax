import { defineConfig } from "@playwright/test"

process.env.NIL_PORT = "18925"
export default defineConfig({
  testDir: "./tests",
  testMatch: "nil-radial.spec.ts",
  workers: 1,
  outputDir: "../.scratch/nil-radial/test-results",
  reporter: [["list"], ["json", { outputFile: "../.scratch/nil-radial/browser-results.json" }]],
  use: {
    baseURL: "http://127.0.0.1:18925",
    headless: true,
    screenshot: "only-on-failure",
    launchOptions: { executablePath: process.env.NIL_CHROMIUM, args: ["--no-sandbox"] },
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 18925 --strictPort",
    url: "http://127.0.0.1:18925/nil-radial.html",
    reuseExistingServer: false,
  },
})
