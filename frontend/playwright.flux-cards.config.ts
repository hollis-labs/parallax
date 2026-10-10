import { fileURLToPath } from "node:url"
import { defineConfig } from "@playwright/test"

const repo = fileURLToPath(new URL("../", import.meta.url))
export default defineConfig({
  testDir: "./tests",
  testMatch: "flux-cards.spec.ts",
  outputDir: `${repo}.scratch/flux-cards/results`,
  reporter: [["list"]],
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:18915",
    headless: true,
    launchOptions: process.env.FLUX_BROWSER
      ? {
          executablePath: process.env.FLUX_BROWSER,
          args: ["--no-sandbox", "--disable-dev-shm-usage"],
        }
      : undefined,
    viewport: { width: 1280, height: 900 },
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 18915 --strictPort",
    cwd: `${repo}frontend`,
    url: "http://127.0.0.1:18915",
    reuseExistingServer: !process.env.CI,
  },
})
