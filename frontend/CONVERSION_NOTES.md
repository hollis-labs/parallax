# Conversion notes: gaps and friction (frontend)

Owner-facing. Each gap stops the work it touches until the driver decides.

## Framework gaps

0. **Where the kits stand against the BOM (`bom/bom.yaml` `kits:`, Substrate add408c4).** Every BOM kit the app uses is pinned exactly:
   app-shell 0.11.0, design-app-runtime 0.6.0, design-bindings 0.3.0, design-components 0.5.1, design-tokens 0.5.0, kit-account 0.3.0, kit-admin 0.2.0,
   kit-dashboard 0.6.1, kit-observe 0.1.2, kit-settings 0.2.0, plugin-host-ui 0.3.0, plugin-registry 0.2.0 (`make pins`: "app pins match the bom").
   kit-identity 0.1.0 is in the BOM but not imported yet (the identity UI swap is CW-20261112-0118). `@hollis-labs/eslint-config-design` 0.5.0 is not a BOM kit.
   - **The candidate tarballs for design-components and kit-dashboard are gone (driver ruling 2026-11-13: BOM-exact wins).** The released kits carry
     the candidate features; kit-dashboard 0.6.x defaults to its reviewed fixed geometry (4px spacing, 12px controls, 14px menus), and the lab, built on
     the earlier root-relative default, opts back in once for the whole app: `<html data-dashboard-scale="root-relative">` in `frontend/index.html`
     (the kit README: set it at the application boundary, never per route). Typography stays the kit's default compact profile.
     What still differs from the candidates (CW-20261112-0113): kit-dashboard 0.6.1 gives `.dash-search-field` a `min-height` of 8 spacing units, so the
     Torque board's search field is 32/40/48px at roots 16/20/24 (the reference is 26/32/38); and design-components 0.5.1 `FormDialog` ignores Escape and
     close while `submitting`, so the gallery's note form no longer closes while an inspection is held.
   - **kit-settings 0.2.0** still depends on design-tokens ^0.4 and design-components ^0.4 (BOM `kit_exceptions`). `package.json` `overrides`, scoped to
     kit-settings, point both at the root versions so no nested 0.4 copy installs for it.
   - **kit-chat 0.4.0 is the one kit outside the BOM** (CW-20261113-0024): it declares design-bindings ^0.1, design-components ^0.4 and design-tokens ^0.4, so
     npm nests its own copies. Its built code never imports design-bindings; its design-components imports resolve to its nested 0.4.0. Beside design-bindings
     0.3.0 nothing breaks (install, typecheck, build, browser suite). It moves to kit-chat 0.8.0 (built for bindings 0.3) once the BOM pins it. kit-cards is not used.
   - kit-code, kit-voice and kit-workflow are still unpublished tarballs (0.0.0) in `third_party/`, with nested design-components/design-tokens 0.4.
   - **kit-account 0.1.0 -> 0.3.0**: 0.2.0 is a breaking release. `ApiTokenRecord.createdAt` and `ApiTokenDraft.expiry` are required, `status` is a closed set
     (anything else renders as "Unknown" and is never echoed), creation moved into a controlled dialog (`createOpen` / `onCreateOpenChange`), a denied create keeps
     a disabled button with its reason, and the revoke dialog has new wording. `src/administration/Account.tsx` and `src/account-review/` follow it; the
     unknown-status fixture rows keep their out-of-set value through a cast so the kit's Unknown rendering stays exercised. Three tests were updated to the new
     UI (driver ruling), each with a comment naming kit-account 0.2.0: `account-review.spec.ts` (token record keys; the create, revoke and unavailable-scope
     steps) and `administration.spec.ts` (locked state shows a disabled Create token with its reason).

1. **Kits the app uses are not in the BOM `kits:` list.** In addition to the BOM kits the app imports `@hollis-labs/kit-chat` (24 source files;
   the BOM leaves kit-chat out until a release on design-bindings 0.3 is pinned, CW-20261113-0024), `@hollis-labs/kit-code` (9),
   `@hollis-labs/kit-voice` (4) and `@hollis-labs/kit-workflow` (6). The last three are installed from sealed tarballs in `third_party/`
   (version 0.0.0, not published); they cannot move to a pin without a published, pinned release.
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

One more is `test.fixme` against its own design-components task (CW-20261113-0027, driver ruling 2026-11-13): `primitives.spec.ts` "gallery entry ignores operations
filter and retires focus and held outcomes on source replacement". design-components 0.5.1 `FormDialog` ignores Escape and close while `submitting`; the test
presses Escape while the "Review local note" form holds an inspection, so the dialog stays open, the page behind it stays inert and the next step times out
(30 s). The 0.4.0 candidate closed regardless. A timeout does not count as an expected failure in Playwright, so `test.fail` cannot hold it. The test's steps and
assertions are unchanged and the lab does not work around the dialog.

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

Two more single failures, in one local full run on 2026-11-13 (app-shell 0.11.0 and the BOM kit move): `chat-example.spec.ts` "current selected card annotation
overlay..." (`window[k] is not a function`) and `conversation-evidence.spec.ts` "actual StrictMode repeated selection..." (`window.oldConversation is not a
function`). Both replay a click handler the test captured from React props, so the capture found no `onClick` that time. Not reproduced: 20 of 20 alone,
40 of 40 pinned to 2 cores with 2 workers, and green in the other full runs. No cause is claimed and nothing was changed.

## Layered Escape in the session details (Torque CW-20261112-0125): fixed in the lab

On CI, one Escape sometimes closed the "Stop session · local preview" dialog and the "Session details" dialog under it (`snapshot-sessions.spec.ts`
"session inspection and stop previews...", red in several full runs). The lab rendered the two `DetailDialog`s (Base UI dialogs) as siblings; the library
coordinates Escape between nested dialogs only. The preview is now rendered inside the details dialog (`src/snapshots/Sessions.tsx`). Measured on 2 cores
(`taskset -c 0,1`) with 2 workers, the test repeated 60 times: siblings 21 failed, nested 0 failed. Other members of the same CI flake family are not
fixed: `reader-detail-custody.spec.ts:213` (CW-20261112-0126, a single dialog; 1 of 40 under the same condition) and `evidence-states.spec.ts:5` and `:100`.

## Popup-timing quarantine (non-blocking CI job `browser-popup-timing`)

Four tests are tagged `@popup-timing` in their titles and run as the Playwright project `popup-timing`, in their own CI job `browser-popup-timing (non-blocking)`
(`continue-on-error`), so a red result is visible in the checks and does not block the merge. Everything else is the `blocking` project and the job that
gates the merge, at the default worker count. No retries, no `fixme`. A plain `playwright test` (and `make browser`) runs both projects.

| Test | Why it is here | Task |
|---|---|---|
| `reader-detail-custody.spec.ts` "MediaDialog finalFocus binds to opening activation..." | the reader dialog is still present after Escape; 1 of 40 runs at 2 cores / 2 workers (a single dialog) | CW-20261112-0126 |
| `evidence-states.spec.ts` "native supplemental help has actual description, Escape and current visible evidence" | the tooltip is visible but its trigger never gets `aria-describedby`; 4 of 60 at 2 cores / 2 workers (1 of 60 with a settling poll) | CW-20261112-0129 |
| `evidence-states.spec.ts` "actual complete desktop and dark narrow source-help portal are bounded inert and contrasted" | the tooltip's geometry or paint never settles, or the tooltip is gone; 7 of 60 at 2 cores / 2 workers (5 of 60 with settling polls) | CW-20261112-0129 |
| `flux-rail.spec.ts` "inspection admits focus return and nested menu/dialog own Escape before rail" | after Escape closes the Inspection menu, its trigger is not focused; 20 of 20 alone, failed once in a full run (driver ruling 2026-11-13) | CW-20261112-0129 |

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

## Expected failures (`test.fail`): known failures, not passing

Five Parallax tests are Playwright expected failures: they fail today, the run stays green, and a run fails if one of them starts passing, so the annotation is removed in the
change that adopts the kit fix.
- `layouts.spec.ts` "narrow drawers keyboard navigation and short rail remain reachable": `layout-scroll` is 206 px at 390x844 (the test needs > 250). Chrome budget: bottom nav 57 +
  the shell's page title row 60 (16 padding + 28 h1 + 16 gap) + lab header 74 + controls strip 120. Passes (266) once a surface can opt out of the generic page title:
  Torque CW-20261112-0134 (frontend-support). The threshold stays 250.
- `app-shell-aside.spec.ts` "narrow-short 390x420 viewport preserves geometry and usability": the Layouts page demonstrates the kit AppShell's aside and navigation variants, so
  it keeps the real design-components `AppShell`, which always renders its own `<main>` inside the shell's `main` (two `main` elements). Needs an AppShell content mode
  without `main`: Torque CW-20261112-0135 (design-components).
- `torque-board.spec.ts` "compact header and filters preserve audited scaling" at root 16, 20 and 24 (Torque CW-20261112-0113): `.torque-search-field` is
  32/40/48px high, the reference 26/32/38. kit-dashboard 0.6.1 sets `.dash-search-field { min-height: calc(var(--spacing) * 8) }`; the candidate had none.
  The other assertions of the test (compact 11/13/10px type, the root-scaled scope buttons) pass.

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
