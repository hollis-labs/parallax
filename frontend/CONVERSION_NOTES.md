# Conversion notes: gaps and friction (frontend)

Owner-facing. Each gap stops the work it touches until the driver decides.

## Framework gaps

0. **Where the kits stand against the BOM (`bom/bom.yaml` `kits:`).** Moved to the pin: design-tokens 0.5.0, design-bindings 0.2.0,
   design-app-runtime 0.5.0, kit-account 0.1.0, kit-admin 0.2.0, plugin-host-ui 0.3.0 (kit-settings 0.2.0 and plugin-registry 0.2.0 already were);
   `@hollis-labs/eslint-config-design` 0.5.0 (not a BOM kit; 0.4's peer is design-tokens ^0.4). Not moved, and why:
   - design-components (cw0091 candidate tarball, BOM 0.5.1) and kit-dashboard (planner candidate tarball, BOM 0.6.0): at the pins 10 browser tests
     regress (compact/root-scaling typography, the Combobox `ariaLabel` on its trigger, root-scaled menu items; the kit-dashboard CHANGELOG lists
     the compact typography profile under *Unreleased*). Upstream: Torque CW-20261112-0113. They cannot be mixed (the candidate kit-dashboard
     needs the candidate design-components). Owner decision pending.
   - kit-observe stays 0.1.1: 0.1.2 declares `peerOptional kit-dashboard ^0.5 || ^0.6`, which the 0.4 candidate cannot satisfy (ERESOLVE).
   - design-bindings 0.2.0 is a documented breaking release (isolation vocabulary): `src/communications/bindings.ts` and `Chat.tsx` follow it; the
     rendered text is `main-origin` where it was `core-trusted`.

1. **Kits the app uses are not in the BOM `kits:` list.** Substrate `bom/bom.yaml` pins design-tokens, design-components,
   design-app-runtime, design-bindings, kit-settings, kit-admin, kit-cards, kit-account, kit-observe, app-shell,
   kit-dashboard, plugin-host-ui and plugin-registry. The app imports, in addition:
   `@hollis-labs/kit-chat` (24 source files; the BOM says "not pinned, pin the next release"),
   `@hollis-labs/kit-code` (9), `@hollis-labs/kit-voice` (4), `@hollis-labs/kit-workflow` (6). `kit-code`, `kit-voice` and
   `kit-workflow` are installed today from sealed tarballs in `third_party/` (version 0.0.0, not published), and
   design-components, design-app-runtime, kit-account, kit-admin and kit-dashboard are also tarball candidates at 0.4.x,
   not the BOM's 0.5.x. Moving to the BOM pins cannot be done for these four kits without a published, pinned release.
1a. **app-shell 0.1.0 has no responsive navigation.** Its nav is a docked 240px column at every width (`isNarrow` only moves docked tabs to
   bottom sheets), so at a 390px viewport the page gets about 150px. Wrapping the lab in the shell (parked on a local branch) fails about 16
   of the lab's narrow-viewport tests that pass today. The fix belongs in app-shell (a collapsible/overlay nav, or a nav region the host can
   hide); the app does not hide it with its own CSS and toggle. Until then the shell wrap is not on the branch, and with it the sign-out page
   (a `nav.footer` surface in `cmd/parallax/app.ui.json`) has no screen to live on.
1b. **A lab that is itself a shell nests badly.** The lab's own design-components `AppShell` is sized `h-dvh w-dvw`; inside an app-shell page it
   overflows unless the host overrides the size. The override is small (`.lab-host > .h-dvh`) but it is the host working around the kit.

2. **Identity has no UI kit yet** (CW-20261112-0080). Interim sign-in/setup screens live in one directory and are replaced when the kit ships.
3. **App-shell has no user-menu region** (CW-20261112-0107): sign-out is a `nav.footer` page.

## Browser suites against the real backend

- Ports: the repository defaults are the old proof ports (backend 18541, Vite 18545, static Storybook 18542, `tests/ports.ts`).
  `PARALLAX_E2E_BACKEND_PORT`, `PARALLAX_E2E_DEV_PORT` and `PARALLAX_E2E_STORYBOOK_PORT` move them; the Vite dev server and the
  Storybook build also need `VITE_PARALLAX_E2E_*_PORT` with the same values (the workbench's story-link host table reads them).
  The dev proxy targets `PARALLAX_PROXY_URL`, default `127.0.0.1:8085` (the manifest's `httphost.addr`). Agents run in their own block through
  the environment; no agent block is a committed default. The sibling `playwright.*.config.ts` files keep their own ports and have no sign-in
  fixture yet (they proxy to the backend, so only fixture pages work there).
- `playwright.config.ts` starts the real binary on a throwaway data directory (`.scratch/e2e`) with its own `SUBSTRATE_CONFIG`,
  `e2e/global-setup.ts` runs first-run setup (or signs in) once and stores the session cookie as `storageState`. The browser is Playwright's bundled Chromium unless `PLAYWRIGHT_CHANNEL` names another (`chrome`; CI sets `chromium`). Writes from tests carry `X-Requested-With`.
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

## Known failing tests (marked `test.fixme`, Torque CW-20261112-0112)

Two tests were already failing on the unmodified pre-port app. Blame: `1ea2574` ("Standardize dashboard references and match
Tachyon Agents", #33) rewrote `src/examples/torque/Operations.tsx` and
- removed the row-action menu item `Inspect task {id}` (added by `63c80a5`); `tests/shortcut-registry.spec.ts` ("Torque: Layered Escape Stack
  enforces input-clearing before closing...") still clicks it;
- left the Torque example footer without the run id (`86 tasks · 0 selected ... · TASK-001 · Snapshot ...`);
  `tests/torque-example.spec.ts` ("standalone app native routes reload and browser back...") still expects `TASK-001 / RUN-001`.
Whether #33 meant to drop them is the Torque reference owner's call. They are `test.fixme` with the reason
`CW-20261112-0112: predates the Substrate port (1ea2574)`.

Suspected browser difference, still failing here (system Chrome), left as they are until the CI workflow runs them with the bundled Chromium:
`appearance` (select keyboard handling), `messaging-example` (focus after `selectOption`), `nil-example` x2 (inspection body scroll height).
