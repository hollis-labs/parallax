import { fileURLToPath } from "node:url"
import { defineConfig } from "@playwright/test"

const repo = fileURLToPath(new URL("../", import.meta.url))
const chromiumPath = `${repo}.scratch/tooling/chromium/chrome-headless-shell`

export default defineConfig({
  testDir: "./tests",
  testMatch: "tether-overview.spec.ts",
  outputDir: `${repo}.scratch/tether-overview/results`,
  reporter: [["list"]],
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:19015",
    headless: true,
    launchOptions: {
      executablePath: chromiumPath,
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
      env: {
        ...process.env,
        LD_LIBRARY_PATH: `${repo}.scratch/tooling/libs:${process.env.LD_LIBRARY_PATH ?? ""}`,
        FONTCONFIG_PATH: `${repo}.scratch/tooling`,
      },
    },
    viewport: { width: 1280, height: 900 },
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 19015 --strictPort",
    cwd: `${repo}frontend`,
    url: "http://127.0.0.1:19015",
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
})
