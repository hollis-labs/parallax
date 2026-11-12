import { fileURLToPath } from "node:url"
import { defineConfig } from "@playwright/test"

const repo = fileURLToPath(new URL("../", import.meta.url))
const remote = process.env.FLUX_COMPOSITION_BASE_URL
const run = process.env.FLUX_COMPOSITION_RUN ?? "development"
export default defineConfig({
  testDir: "./tests",
  testMatch: "flux-composition.spec.ts",
  workers: 1,
  outputDir: `${repo}.scratch/flux-composition/${run}/results`,
  reporter: [["list"]],
  use: {
    baseURL: remote ?? "http://127.0.0.1:18975",
    headless: true,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    viewport: { width: 1280, height: 900 },
    launchOptions: {
      executablePath: `${repo}.scratch/tooling/chromium/chrome-headless-shell`,
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
      env: {
        ...process.env,
        LD_LIBRARY_PATH: `${repo}.scratch/tooling/libs`,
        FONTCONFIG_PATH: `${repo}.scratch/tooling`,
        FONTCONFIG_FILE: `${repo}.scratch/tooling/fonts.conf`,
        XDG_CACHE_HOME: `${repo}.scratch/browser-cache`,
      },
    },
  },
  ...(remote
    ? {}
    : {
        webServer: {
          command: "npm run dev -- --host 127.0.0.1 --port 18975 --strictPort",
          cwd: `${repo}frontend`,
          url: "http://127.0.0.1:18975",
          reuseExistingServer: false,
          timeout: 30000,
        },
      }),
})
