import { fileURLToPath } from "node:url"
import { defineConfig } from "@playwright/test"
import { ports } from "./tests/ports"

const repo = fileURLToPath(new URL("../", import.meta.url))
// The suites run the real binary on a throwaway data directory under .scratch, with its own
// SUBSTRATE_CONFIG. Ports come from tests/ports.ts (PARALLAX_E2E_*_PORT overrides them).
const e2e = `${repo}.scratch/e2e`
// A synthetic, committed capture (scripts/synthetic-capture.mjs) stands in for the live one, so
// the snapshot suites run against the real backend in a clean checkout.
const capture = `${repo}frontend/tests/data/synthetic-capture.json`
const backend = `http://127.0.0.1:${ports.backend}`
const dev = `http://127.0.0.1:${ports.dev}`
export default defineConfig({
  testDir: "./tests",
  globalSetup: "./e2e/global-setup.ts",
  outputDir: `${repo}.scratch/test-results`,
  reporter: [["list"]],
  // One worker on CI. Focus, popup and portal assertions (layered Escape, dialog final focus) race CPU contention between
  // parallel browsers: on 4 cores, 2 workers failed 2 of 30 runs of three such tests and 1 worker 0 of 30; a longer expect
  // timeout did not help (still 14 of 36 failed at 20 s under 3x oversubscription). No retries: a flaky test stays red.
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: backend,
    headless: true,
    // Unset uses Playwright's bundled Chromium; PLAYWRIGHT_CHANNEL=chrome uses the installed Chrome.
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
    // A failure on CI keeps its trace under .scratch/test-results; no retries, so a flaky test stays red.
    trace: process.env.CI ? "retain-on-failure" : "off",
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
      // The owner is created on the host before the server starts (first-run setup over HTTP is closed),
      // with a fresh random password that global-setup reads from .scratch/e2e-password.
      command: [
        `rm -rf ${e2e} && mkdir -p ${e2e}`,
        `printf 'httphost:\\n  addr: "127.0.0.1:${ports.backend}"\\nparallax:\\n  snapshot_file: "${capture}"\\n' > ${e2e}/substrate.yaml`,
        "PW=$(head -c 18 /dev/urandom | base64 | tr -d '=+/')",
        `(umask 077; printf '%s' "$PW" > ${repo}.scratch/e2e-password)`,
        `printf '%s\\n' "$PW" | SUBSTRATE_CONFIG=${e2e}/substrate.yaml PARALLAX_DATA_DIR=${e2e}/data .scratch/parallax identity setup --username e2e --display-name "E2E Owner"`,
        `SUBSTRATE_CONFIG=${e2e}/substrate.yaml PARALLAX_DATA_DIR=${e2e}/data .scratch/parallax`,
      ].join(" && "),
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
