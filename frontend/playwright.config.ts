import { fileURLToPath } from "node:url"
import { defineConfig } from "@playwright/test"

const repo = fileURLToPath(new URL("../", import.meta.url))
export default defineConfig({
  testDir: "./tests",
  outputDir: `${repo}.scratch/test-results`,
  reporter: [["list"]],
  use: { baseURL: "http://127.0.0.1:18541", headless: true },
  webServer: [
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
