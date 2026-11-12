# Conversion notes: gaps and friction (frontend)

Owner-facing. Each gap stops the work it touches until the driver decides.

## Framework gaps

1. **Kits the app uses are not in the BOM `kits:` list.** Substrate `bom/bom.yaml` pins design-tokens, design-components,
   design-app-runtime, design-bindings, kit-settings, kit-admin, kit-cards, kit-account, kit-observe, app-shell,
   kit-dashboard, plugin-host-ui and plugin-registry. The app imports, in addition:
   `@hollis-labs/kit-chat` (24 source files; the BOM says "not pinned, pin the next release"),
   `@hollis-labs/kit-code` (9), `@hollis-labs/kit-voice` (4), `@hollis-labs/kit-workflow` (6). `kit-code`, `kit-voice` and
   `kit-workflow` are installed today from sealed tarballs in `third_party/` (version 0.0.0, not published), and
   design-components, design-app-runtime, kit-account, kit-admin and kit-dashboard are also tarball candidates at 0.4.x,
   not the BOM's 0.5.x. Moving to the BOM pins cannot be done for these four kits without a published, pinned release.
2. **Identity has no UI kit yet** (CW-20261112-0080). Interim sign-in/setup screens live in one directory and are replaced when the kit ships.
3. **App-shell has no user-menu region** (CW-20261112-0107): sign-out is a `nav.footer` page.

## Browser suites against the real backend

- Ports (agent block 18160-18169, now the defaults in the configs and tests): backend 18160, Vite dev server 18163, static
  Storybook 18164; the sibling `playwright.*.config.ts` files that used their own ports now share 18163/18164 (run one at a time).
- `playwright.config.ts` starts the real binary on a throwaway data directory (`.scratch/e2e`) with its own `SUBSTRATE_CONFIG`,
  `e2e/global-setup.ts` runs first-run setup (or signs in) once and stores the session cookie as `storageState`. The browser channel
  is `chrome` unless `PLAYWRIGHT_CHANNEL` says otherwise (CI sets `chromium`). Writes from tests carry `X-Requested-With`.
- An unmapped write answers `403 route_not_mapped` (the old host answered 405); `tests/lab.spec.ts` asserts that and the
  `403 csrf` for a write without the header.
- **Baseline, same environment (system Chrome, real binary, no live capture):** the pre-port app (`main`, Chimera host) passes
  628 and fails 27 of 655. The port passes 628 and fails 27: the same 27, so the port adds no failure. The 27 are:
  17 `snapshot*.spec.ts` tests that need `internal/snapshots/data/current.json`, a gitignored capture of a live Torque/Tether
  (a clean checkout serves `empty.json`, `data.sources` is null); and 10 that fail identically before the port
  (`app-examples-acceptance` x2, `appearance`, `messaging-example`, `nil-example` x2, `ops-dashboard`, `shortcut-registry`,
  `torque-example`): focus, scroll-height, tour-theme and kit-disposition assertions, which do not touch the backend.
  Both groups need an owner decision (a committed sanitized capture; whether the 10 are kit-candidate drift or Chrome-vs-headless-shell).

## Standalone HTML pages (outside the shell)

Served only by the Vite dev server (not part of `vite build`, not embedded in the binary). Dev/test pages for the sibling Playwright configs:
`flux-cards-lifecycle.html`, `flux-chat-lifecycle.html`, `flux-settings.html`, `nil-example.html`, `nil-radial.html`,
`operations-list.html`, `reader-lifecycle.html`, `tachyon-nav-lifecycle.html`, `tether-ai.html`. They render fixtures and
call no `/api` or `/plugins` route (checked: only `src/snapshots/Review.tsx` and the plugin registry loader fetch from the backend,
both inside the main app).
