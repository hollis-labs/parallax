import { defineConfig } from "@playwright/test"
const port = Number(process.env.OPS_PORT ?? 18773)
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
    baseURL: `http://127.0.0.1:${port}`,
    headless: true,
    launchOptions: { executablePath: process.env.OPS_CHROMIUM, args: ["--no-sandbox"] },
    screenshot: "only-on-failure",
  },
  webServer: {
    command: `npm run dev -- --host 127.0.0.1 --port ${port} --strictPort`,
    url: `http://127.0.0.1:${port}/operations-list.html`,
    reuseExistingServer: false,
  },
})
