import { fileURLToPath } from "node:url"
import { defineConfig } from "@playwright/test"

import fs from "node:fs"

const repo = fileURLToPath(new URL("../", import.meta.url))
const retained0007Browser =
  "/home/chrispian/dev/hollis-labs/worktrees/parallax/CW-20261009-0007/.scratch/operations-audit-tooling/browsers/chromium_headless_shell-1194/chrome-linux/headless_shell"
const executablePath =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
  (fs.existsSync(retained0007Browser) ? retained0007Browser : undefined)

export default defineConfig({
  testDir: "./tests",
  outputDir: `${repo}.scratch/test-results`,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:18541",
    headless: true,
    ...(executablePath
      ? {
          launchOptions: {
            executablePath,
            args: ["--disable-dev-shm-usage", "--no-sandbox", "--disable-gpu"],
          },
        }
      : {}),
  },
  webServer: [
    {
      command:
        "PARALLAX_PROXY_URL=http://127.0.0.1:18541 npm run dev -- --host 127.0.0.1 --port 18545 --strictPort",
      cwd: `${repo}frontend`,
      url: "http://127.0.0.1:18545",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "LISTEN_ADDR=127.0.0.1:18541 .scratch/parallax",
      cwd: repo,
      url: "http://127.0.0.1:18541",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "STORYBOOK_PORT=18542 node scripts/serve-storybook.mjs",
      cwd: repo,
      url: "http://127.0.0.1:18542/iframe.html",
      reuseExistingServer: !process.env.CI,
    },
  ],
})
