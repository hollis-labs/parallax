import { fileURLToPath } from "node:url"
import { defineConfig } from "@playwright/test"

const repo = fileURLToPath(new URL("../", import.meta.url))
// Ports are the agent block 18160-18169: backend 18160, Vite 18163, static Storybook 18164.
// The backend runs the real binary on a throwaway data directory under .scratch.
const e2e = `${repo}.scratch/e2e`
export default defineConfig({
  testDir: "./tests",
  globalSetup: "./e2e/global-setup.ts",
  outputDir: `${repo}.scratch/test-results`,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:18160",
    headless: true,
    channel: process.env.PLAYWRIGHT_CHANNEL ?? "chrome",
    storageState: `${repo}.scratch/e2e-auth.json`,
  },
  webServer: [
    {
      command:
        "PARALLAX_PROXY_URL=http://127.0.0.1:18160 npm run dev -- --host 127.0.0.1 --port 18163 --strictPort",
      cwd: `${repo}frontend`,
      url: "http://127.0.0.1:18163",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `rm -rf ${e2e} && mkdir -p ${e2e} && printf 'httphost:\\n  addr: "127.0.0.1:18160"\\n' > ${e2e}/substrate.yaml && SUBSTRATE_CONFIG=${e2e}/substrate.yaml PARALLAX_DATA_DIR=${e2e}/data .scratch/parallax`,
      cwd: repo,
      url: "http://127.0.0.1:18160",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "STORYBOOK_PORT=18164 node scripts/serve-storybook.mjs",
      cwd: repo,
      url: "http://127.0.0.1:18164/iframe.html",
      reuseExistingServer: !process.env.CI,
    },
  ],
})
