import { fileURLToPath } from "node:url"
import { defineConfig } from "@playwright/test"
import { ports } from "./tests/ports"

const repo = fileURLToPath(new URL("../", import.meta.url))
// The suites run the real binary on a throwaway data directory under .scratch, with its own
// SUBSTRATE_CONFIG. Ports come from tests/ports.ts (PARALLAX_E2E_*_PORT overrides them).
const e2e = `${repo}.scratch/e2e`
const backend = `http://127.0.0.1:${ports.backend}`
const dev = `http://127.0.0.1:${ports.dev}`
export default defineConfig({
  testDir: "./tests",
  globalSetup: "./e2e/global-setup.ts",
  outputDir: `${repo}.scratch/test-results`,
  reporter: [["list"]],
  use: {
    baseURL: backend,
    headless: true,
    // Unset uses Playwright's bundled Chromium; PLAYWRIGHT_CHANNEL=chrome uses the installed Chrome.
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
    storageState: `${repo}.scratch/e2e-auth.json`,
  },
  webServer: [
    {
      command: `PARALLAX_PROXY_URL=${backend} npm run dev -- --host 127.0.0.1 --port ${ports.dev} --strictPort`,
      cwd: `${repo}frontend`,
      url: dev,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `rm -rf ${e2e} && mkdir -p ${e2e} && printf 'httphost:\\n  addr: "127.0.0.1:${ports.backend}"\\n' > ${e2e}/substrate.yaml && SUBSTRATE_CONFIG=${e2e}/substrate.yaml PARALLAX_DATA_DIR=${e2e}/data .scratch/parallax`,
      cwd: repo,
      url: backend,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `STORYBOOK_PORT=${ports.storybook} node scripts/serve-storybook.mjs`,
      cwd: repo,
      url: `http://127.0.0.1:${ports.storybook}/iframe.html`,
      reuseExistingServer: !process.env.CI,
    },
  ],
})
