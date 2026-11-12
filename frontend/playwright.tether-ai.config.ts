import fs from "node:fs"
import { fileURLToPath } from "node:url"
import { defineConfig } from "@playwright/test"

const repo = fileURLToPath(new URL("../", import.meta.url))
const localChromium = `${repo}.scratch/tooling/chromium/chrome-headless-shell`
const chromiumPath =
  process.env.OWN_CHROMIUM ||
  process.env.FLUX_BROWSER ||
  (fs.existsSync(localChromium) ? localChromium : undefined)

export default defineConfig({
  testDir: "./tests",
  testMatch: "tether-ai.spec.ts",
  outputDir: `${repo}.scratch/tether-ai/results`,
  reporter: [["list"]],
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:19025",
    headless: true,
    launchOptions: {
      ...(chromiumPath ? { executablePath: chromiumPath } : {}),
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
      env: {
        ...process.env,
        ...(fs.existsSync(`${repo}.scratch/tooling/libs`)
          ? {
              LD_LIBRARY_PATH: `${repo}.scratch/tooling/libs:${process.env.LD_LIBRARY_PATH ?? ""}`,
              FONTCONFIG_PATH: `${repo}.scratch/tooling`,
            }
          : {}),
      },
    },
    viewport: { width: 1280, height: 900 },
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 19025 --strictPort",
    cwd: `${repo}frontend`,
    url: "http://127.0.0.1:19025",
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
})
