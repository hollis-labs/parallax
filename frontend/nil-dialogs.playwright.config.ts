import { defineConfig } from "@playwright/test"
export default defineConfig({
  testDir: "./tests",
  testMatch: "nil-dialogs.spec.ts",
  outputDir: process.env.NIL_PROOF_DIR ?? "../.scratch/nil-dialogs/results",
  workers: 1,
  reporter: [["list"]],
  use: {
    headless: true,
    launchOptions: process.env.NIL_CHROMIUM
      ? { executablePath: process.env.NIL_CHROMIUM, args: ["--no-sandbox"] }
      : undefined,
  },
  webServer: {
    command: "npm run storybook -- --port 18932 --host 127.0.0.1 --ci",
    url: "http://127.0.0.1:18932/iframe.html",
    reuseExistingServer: false,
    timeout: 120000,
  },
})
