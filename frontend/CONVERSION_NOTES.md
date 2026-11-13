# Conversion notes: gaps and friction (frontend)

Owner-facing. Each gap stops the work it touches until the driver decides.

## Framework gaps

0. **Where the kits stand against the BOM (`bom/bom.yaml` `kits:`).** Moved to the pin: design-tokens 0.5.0, design-bindings 0.2.0,
   design-app-runtime 0.5.0, kit-account 0.1.0, kit-admin 0.2.0, plugin-host-ui 0.3.0 (kit-settings 0.2.0 and plugin-registry 0.2.0 already were);
   `@hollis-labs/eslint-config-design` 0.5.0 (not a BOM kit; 0.4's peer is design-tokens ^0.4). Not moved, and why:
   - **Recorded exception (owner decision, 2026-11-12, option B): design-components (cw0091 candidate tarball, BOM 0.5.1) and kit-dashboard
     (planner candidate tarball, BOM 0.6.0) stay on their candidate tarballs in `third_party/`, beside the four unreleased kits (kit-chat,
     kit-code, kit-voice, kit-workflow).** It ends when Torque CW-20261112-0113 ships (compact/root-scaling typography in kit-dashboard, the
     Combobox `ariaLabel` on its trigger and root-scaled menu items in design-components); each then moves to its BOM pin. If that release is a
     minor bump (design-components 0.6.0), app-shell's `^0.5` dependency would not accept it (raised with Task Ops). At the pins 10 browser tests
     regress (dashboard x4, torque-board x5, primitives gallery x1); the local branch `gui/kit-pins` (3752196) keeps that move as the record of
     what it costs. They cannot be mixed (the candidate kit-dashboard needs the candidate design-components).
   - kit-observe stays 0.1.1 (a consequence of the same exception): 0.1.2 declares `peerOptional kit-dashboard ^0.5 || ^0.6`, which the 0.4 candidate cannot satisfy (ERESOLVE).
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
1a. **app-shell 0.1.0 has no responsive navigation (Torque CW-20261112-0110).** Its nav is a docked 240px column at every width (`isNarrow` only moves docked tabs to
   bottom sheets), so at a 390px viewport the page gets about 150px. Wrapping the lab in the shell (parked on a local branch) fails about 16
   of the lab's narrow-viewport tests that pass today. The 16 failing tests (file:line on the parked branch `gui/shell-wip`, 63ddb6a): administration.spec.ts:184, app-shell-aside.spec.ts:57 and :139,
   communications.spec.ts:132, lab.spec.ts:4 and :26, layouts.spec.ts:4 and :43, observability.spec.ts:158, ops-dashboard.spec.ts:171,
   playback.spec.ts:175, run-explorer.spec.ts:176, usage-evidence.spec.ts:249, workbench.spec.ts:119 and :142, workflow-review.spec.ts:212.
   The fix belongs in app-shell (a collapsible/overlay nav, or a nav region the host can hide); the app does not hide it with its own CSS
   and toggle. They are not fixme'd and not accepted: the shell wrap waits for the app-shell release. Until then the shell wrap is not on the branch, and with it the sign-out page
   (a `nav.footer` surface in `cmd/parallax/app.ui.json`) has no screen to live on; the lab header has a `SignOutButton` meanwhile.
1b. **A lab that is itself a shell nests badly.** The lab's own design-components `AppShell` is sized `h-dvh w-dvw`; inside an app-shell page it
   overflows unless the host overrides the size. The override is small (`.lab-host > .h-dvh`) but it is the host working around the kit.

2. **Identity has no UI kit yet** (CW-20261112-0080). Interim sign-in/setup screens live in one directory and are replaced when the kit ships.
3. **App-shell has no user-menu region** (CW-20261112-0107): sign-out is a `nav.footer` page.

## Browser suites against the real backend

- Ports: the repository defaults are the old proof ports (backend 18541, Vite 18545, static Storybook 18542, `tests/ports.ts`).
  `PARALLAX_E2E_BACKEND_PORT`, `PARALLAX_E2E_DEV_PORT` and `PARALLAX_E2E_STORYBOOK_PORT` move them; the Vite dev server and the
  Storybook build also need `VITE_PARALLAX_E2E_*_PORT` with the same values (the workbench's story-link host table reads them).
  The dev proxy targets `PARALLAX_PROXY_URL`, default `127.0.0.1:18441` (the manifest's `httphost.addr`). Agents run in their own block through
  the environment; no agent block is a committed default. The sibling `playwright.*.config.ts` files keep their own ports and have no sign-in
  fixture yet (they proxy to the backend, so only fixture pages work there).
- `playwright.config.ts` starts the real binary on a throwaway data directory (`.scratch/e2e`) with its own `SUBSTRATE_CONFIG`,
  the owner `e2e` is created on the host before the server starts (`parallax identity setup`, password from a fresh random value written to `.scratch/e2e-password`; first-run setup over HTTP is closed since Substrate d453ac8), and `e2e/global-setup.ts` signs in once and stores the session cookie as `storageState`. On CI a failing test keeps its trace under `.scratch/test-results` (`trace: retain-on-failure`, no retries); uploading that directory as an artifact is a workflow step. The browser is Playwright's bundled Chromium unless `PLAYWRIGHT_CHANNEL` names another (`chrome`; CI sets `chromium`). Writes from tests carry `X-Requested-With`.
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

Four more are `test.fixme` with the reason `CW-20261112-0116: fails on main since before the Substrate port`. They are not a browser difference and not the
port: they fail on bundled Chromium in CI (PR #35 run 43250608571) and on `main`'s last CI run (2026-10-21, `33401f5`; main's CI has been red since
2026-10-16): `appearance.spec.ts` "native palette selection..." (root cause: kit-dashboard's `theme.css` sets `select { appearance: base-select }`; ArrowDown on
the closed select emits no `change` in current Chromium), `messaging-example.spec.ts` "StrictMode current-message..." (focus after `selectOption`, probably the
same control family, unproven), `nil-example.spec.ts` "complete native bounds and scroll" at 1280x800 and 390x844 (the inspection body no longer overflows its
box; not root-caused; the 390x420 variant passes and stays on).

## Shell wrap: what is already known (for the follow-up when CW-20261112-0110 ships)

The wrap is parked on the local branch `gui/shell-wip` (63ddb6a); nothing of it is on `feat/substrate-conversion`. Findings from that run
(642 passed, 27 failed of 671; 4 are the known browser-difference tests, 16 are the narrow-viewport gap above):
1. **Install**: `@hollis-labs/app-shell` 0.1.0 installs beside the candidate design-components and kit-dashboard. It depends directly on
   design-components ^0.5, design-bindings ^0.2 and plugin-host-ui ^0.3, so npm nests its own copies; the bundle then holds design-components
   0.4 (the lab) and 0.5.1 (the shell chrome). Main chunk 2,816,884 -> 2,888,453 bytes. It needs `allowImportingTsExtensions` in tsconfig
   (app-shell publishes raw `.ts`) and `@source "../node_modules/@hollis-labs/app-shell/src"` in `index.css` (no `source.css`).
2. **Nested shell**: the lab's own `AppShell` is `h-dvh w-dvw`; a wrapper `.lab-host` with `.lab-host > .h-dvh { width: 100%; height: auto }` makes
   it fill the shell page. Its rail/header/drawer navigation stays only as the Layouts demo (the nested shell there is a demo, not a second app
   shell); the rest of the lab uses the shell nav.
3. **Headings and landmarks**: every lab surface gets the generic shell title "Parallax design lab" (`app.ui.json`) so the view name stays the only
   heading with that name; the lab's own `h1` becomes an `h2` with the same size rule (`.page-title h2 { font-size: var(--dash-page-heading-size) }`).
   The shell adds two `main` landmarks: `lab.spec.ts:75` (`locator('main')`) needs a selector change.
4. **Nav selectors**: 33 test lines click the old rail by role `button` (`getByRole("button", { name: "Usage", exact: true })`); in the shell they are
   `link`s. Plus `dashboard.spec.ts:144` (`locator("h1").first()` -> `main main` `h1, .page-title h2`) and `torque-board.spec.ts:347`
   (`.page-title h1` -> `h2`). The four `getByRole("navigation", { name: "Application navigation" })` waits become `{ name: "Primary" }`.
5. **Routes**: `/` shows Activity (the old default view), the Review Workbench is `/review-workbench`, every other destination is `/<slug>`
   (`src/shell/routes.ts`). `/?view=Name&...` is redirected client-side to the route keeping every other query parameter in order; an
   unknown name lands on `/` with `view` kept so the page says what was asked. `tests/shell-routes.spec.ts` covers it (4 unit, 3 browser).
   Not yet diagnosed on that branch: `run-explorer.spec.ts:87` and `conversation-review.spec.ts:292`.
6. **Sign-out** is a `nav.footer` surface (`SignOutPage`). Until the wrap lands the lab header carries `SignOutButton` (`src/identity/SignOut.tsx`: the
   signed-in display name and a Sign out button, the same logout call); the shell's footer surface replaces it.

Naming leftover: `src/chimera` is a plugin-registry loader and presentation adapters, not a host any more. It is not renamed because the backend fixture
generator (`internal/scenarios/families.go`) and `docs/coverage-policy.json` / `docs/export-inventory.json` reference the path.

## Why a `waitFor` and not a cover (dashboard.spec heatmap test)

`dashboard.spec.ts` "reference dashboard compositions..." read `.calendar-intensity` cells with `evaluateAll` straight after `goto`. `evaluateAll`
does not wait, and the sign-in gate adds an async step before the page renders, so the test sometimes read an empty page (`new Set([]).size` is 0).
The test measures the cells' `--activity-weight`; waiting for the first cell to exist makes it measure them. No assertion changed.

## Sign-in screens and first-run setup (Substrate d453ac8)

`GET /api/setup` answers `{setup_required, setup_over_http}`; `POST /api/setup` is refused (`403 setup_offline`). The interim `Entry` screen therefore shows,
when no owner exists and setup is closed (or after a `setup_offline` answer), a plain screen with no form that names `parallax identity setup --username NAME`
on the host; the owner form stays only for a backend that reports `setup_over_http: true`. Tests: `tests/identity.spec.ts`.

## Unproven CI failure (operations-list-candidate "runs")

Failed once on CI (PR #35 run 43250608571: `Record inspector` not visible within 5s after `Enter`) and passed in every other run. Not reproduced in 360+ local
runs (CPU oversubscription, cold Vite cache, the headless shell 1248). The test now waits for the cleared search to bring the rows back before pressing Enter;
that is not claimed as the cause. A recurrence leaves a trace (see Browser suites).

## Layered Escape in the session details (Torque CW-20261112-0125): fixed in the lab

On CI, one Escape sometimes closed the "Stop session · local preview" dialog and the "Session details" dialog under it (`snapshot-sessions.spec.ts`
"session inspection and stop previews...", red in several full runs). The lab rendered the two `DetailDialog`s (Base UI dialogs) as siblings; the library
coordinates Escape between nested dialogs only. The preview is now rendered inside the details dialog (`src/snapshots/Sessions.tsx`). Measured on 2 cores
(`taskset -c 0,1`) with 2 workers, the test repeated 60 times: siblings 21 failed, nested 0 failed. Other members of the same CI flake family are not
fixed: `reader-detail-custody.spec.ts:213` (CW-20261112-0126, a single dialog; 1 of 40 under the same condition) and `evidence-states.spec.ts:5` and `:100`.

## Popup-timing quarantine (non-blocking CI job `browser-popup-timing`)

Three tests are tagged `@popup-timing` in their titles and run as the Playwright project `popup-timing`, in their own CI job `browser-popup-timing (non-blocking)`
(`continue-on-error`), so a red result is visible in the checks and does not block the merge. Everything else is the `blocking` project and the job that
gates the merge, at the default worker count. No retries, no `fixme`. A plain `playwright test` (and `make browser`) runs both projects.

| Test | Why it is here | Task |
|---|---|---|
| `reader-detail-custody.spec.ts` "MediaDialog finalFocus binds to opening activation..." | the reader dialog is still present after Escape; 1 of 40 runs at 2 cores / 2 workers (a single dialog) | CW-20261112-0126 |
| `evidence-states.spec.ts` "native supplemental help has actual description, Escape and current visible evidence" | the tooltip is visible but its trigger never gets `aria-describedby`; 4 of 60 at 2 cores / 2 workers (1 of 60 with a settling poll) | CW-20261112-0129 |
| `evidence-states.spec.ts` "actual complete desktop and dark narrow source-help portal are bounded inert and contrasted" | the tooltip's geometry or paint never settles, or the tooltip is gone; 7 of 60 at 2 cores / 2 workers (5 of 60 with settling polls) | CW-20261112-0129 |

Pattern: keyboard-opened floating popups whose result depends on event ordering and commits under CPU contention (0 failures at 4 cores with 1 worker locally;
a few percent per test at 2 cores or 2 workers; still failing on the public runner with one worker, which was tried and dropped). A longer expect timeout and
test-side settling each helped a little and did not remove it. The fifth member, `snapshot-sessions.spec.ts` "session inspection and stop previews...", was the
lab's own composition (sibling dialogs) and is fixed (CW-20261112-0125): it stays in the blocking suite.

**How a test leaves quarantine:** twenty consecutive green runs of the `browser-popup-timing` job on `main`, or a fix with a measured before and after
(repeated runs pinned to 2 cores with 2 workers, as for CW-20261112-0125), in the pull request that removes the `@popup-timing` tag.

## What changed for people (shell wrap, branch gui/shell-wip)

- A **known** `?view=NAME` link (the lab was used with these until the cutover; the owner may have bookmarks) still opens that view: the page redirects to its
  path (`/<slug>`, `/` for Activity) and keeps every other query parameter. Test: `tests/shell-routes.spec.ts` "/?view=Name reaches the route, keeps the other
  parameters and shows that view", with the unit tests of `legacyViewRedirect` beside it.
- An **unknown** `?view=NAME` lands on `/` (Activity), says "Unknown requested view NAME; showing Activity.", and leaves no `view` parameter in the URL (it used to
  rewrite `view` to "Activity"). Test: `tests/workbench.spec.ts` "known URL reload and unknown route fallback..." (last assertion: path is `/`, no `view` parameter), ruled by the driver.
- Navigation is the shell's: a column at wide widths, a top bar with a "More" sheet at narrow widths; sign-out is its footer surface (the header button is gone).

## Shell wrap: scroll owners, the header strip and the second `main`

- The three "one page scroll owner" tests (`administration`, `communications`, `observability`) now count scroll containers inside the lab's page body
  (`[data-lab-body]`), not inside `main *`: in the old layout the header control strip sat outside `main`; in the shell page the whole lab is inside the kit's `main`.
  The strip (`.review-controls`) still scrolls inside itself at narrow widths (`max-height: 120px; overflow-y: auto`); unchanged behaviour, now inside the shell's `main`.
- The kit `AppShell` always renders a `<main>`, and the app-shell already has one, so a nested `AppShell` is a second landmark. Every page except Layouts now uses
  `LabFrame` (`src/shell/LabFrame.tsx`: header, a labelled region, no `main`). Layouts keeps the real `AppShell` because it demonstrates the kit's aside and
  navigation variants; it therefore still has two `main` elements (`app-shell-aside.spec.ts` "narrow-short 390x420..." targets it and stays failing). A way for
  `AppShell` to render its content without `main` belongs to design-components.

## Expected failures (`test.fail`), shell wrap: known failures, not passing

Two Parallax tests are Playwright expected failures: they fail today, the run stays green, and a run fails if one of them starts passing, so the annotation is removed in the
change that adopts the kit fix.
- `layouts.spec.ts` "narrow drawers keyboard navigation and short rail remain reachable": `layout-scroll` is 206 px at 390x844 (the test needs > 250). Chrome budget: bottom nav 57 +
  the shell's page title row 60 (16 padding + 28 h1 + 16 gap) + lab header 74 + controls strip 120. Passes (266) once a surface can opt out of the generic page title:
  Torque CW-20261112-0134 (frontend-support). The threshold stays 250.
- `app-shell-aside.spec.ts` "narrow-short 390x420 viewport preserves geometry and usability": the Layouts page demonstrates the kit AppShell's aside and navigation variants, so
  it keeps the real design-components `AppShell`, which always renders its own `<main>` inside the shell's `main` (two `main` elements). Needs an AppShell content mode
  without `main`: Torque CW-20261112-0135 (design-components).

## App snapshots on a normal instance: the live capture is installed by configuration

`/?example=snapshots` ("App snapshots": Torque task board, Tether overview and sessions, Tachyon Planner, Agents, Builder) reads `/api/snapshots/current`. A build
embeds only the empty capture, so a plain instance shows "No captured data installed". The old live build had embedded a capture from an untracked, ignored build
input (`internal/snapshots/data/current.json`, `docs/fixture-contracts.md`), and the port carries none; the committed `frontend/tests/data/synthetic-capture.json`
is test data only. On the live instance the driver installed that capture through configuration on 2026-11-12 (the file copied unchanged into the config directory,
`parallax.snapshot_file` set, unit restarted); signed in, the route went from the empty capture to the full one. The owner may have it removed. A real capture never
belongs in the repository.

## Retired host name in the UI

The only owner-visible use of the retired host's name was the Activity page's "Chimera contribution" panel title, now "Plugin contribution". The remaining uses are code
identifiers, import paths (`src/chimera/*`, see "Naming leftover" above) and comments, not renamed in that change.
