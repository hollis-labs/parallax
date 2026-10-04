import { fileURLToPath } from "node:url"
import { defineConfig } from "@playwright/test"

const repo = fileURLToPath(new URL("../", import.meta.url))
export default defineConfig({
  testDir: "./tests",
  outputDir: `${repo}.scratch/test-results`,
  reporter: [["list"]],
  use: { baseURL: "http://127.0.0.1:18441", headless: true },
  webServer: {
    command: ".scratch/parallax",
    cwd: repo,
    url: "http://127.0.0.1:18441",
    reuseExistingServer: !process.env.CI,
  },
})
