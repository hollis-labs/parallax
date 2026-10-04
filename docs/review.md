# Review evidence and boundaries

Commands: `make check`; `node scripts/coverage.mjs`; `npm run build-storybook --prefix frontend`; `npm exec --prefix frontend -- playwright test --config frontend/playwright.config.ts` against `make run`.

Browser tests cover coherent detail, transient business intents/reset, light mode, large-list page scroll and narrow layout. Tests use bundled fixtures and local host only. Screenshots are ignored review artifacts under `.scratch`. CSS TSX design lint and CSS variable resolution are separate checks; browser computed-style evidence confirms 24px page padding, actual themed text/background and source registration.

Public export inventory `export-inventory.json` enumerates exported runtime/type names from installed package public declaration entrypoints. Used entries are mapped explicitly; every other export is unreviewed. This is a baseline for future component-specific stories and interaction tests, not full visual coverage.

Known upstream adaptation targets:

- Released ActivityHeatmap/HourlyPulse read ambient Date without an injected clock. Parallax uses app-owned fixed-clock calendar/pulse views derived from record timestamps instead.
- Sparkbars' square cells overflow a wide eight-sample strip, hiding variation. V2 uses explicit clock-injected day charts and shared BarMeter/CompositionBars; upstream source is untouched.
- Folio preset root mount produced `//`; application wiring corrects `/` and consumes Chimera.
- plugin-host-ui candidate is unpublished. Exact archive/version/digest and MIT provenance are recorded in third_party.

Remaining scope: comprehensive Storybook coverage, all independent kits, long-running scripted event playback (current control is clock preview), shell/layout comparison families, admin/account/messaging/developer/voice compositions, sandboxed-frame plugin proof, remote snapshot imports, Sigil generation and generic seeder extraction. Generic Examples drafts/settings only demonstrate transient intent behavior; they do not satisfy those kit-specific backlog tasks.

Validated baseline: Go race tests include deterministic generation, referential equality, bundled-fixture freshness and real registry/bundle digest. Chromium uses a freshly built embedded binary launched by Playwright (CI=true), not a previously running dev server. Browser artifact paths resolve under the repository scratch directory.

Upstream routing: clock-injected widgets and proven visual primitives belong in design-kit; host adapters/catalog/isolation/lifecycle in Chimera; scaffold root-mount/default wiring in Folio. Propose source changes separately with these fixture cases/browser evidence. This repository publishes source to GitHub only; it does not publish npm packages, deploy sites or adopt production applications.

## Pinned review dependencies

| Package | Exact version |
|---|---|
| @base-ui/react | 1.8.0 |
| @hollis-labs/design-app-runtime | 0.4.0 |
| @hollis-labs/design-components | 0.4.0 |
| @hollis-labs/design-tokens | 0.4.0 |
| @hollis-labs/kit-dashboard | 0.4.0 |
| @hollis-labs/kit-settings | 0.2.0 |
| @hollis-labs/plugin-host-ui | file:../third_party/hollis-labs-plugin-host-ui-0.1.0.tgz |
| @hollis-labs/plugin-registry | 0.2.0 |
| es-module-lexer | 1.7.0 |
| lucide-react | 1.52.0 |
| react | 19.3.0 |
| react-dom | 19.3.0 |
| @biomejs/biome | 2.5.15 |
| @hollis-labs/eslint-config-design | 0.4.0 |
| @playwright/test | 1.63.0 |
| @storybook/react-vite | 10.6.1 |
| @tailwindcss/vite | 4.3.3 |
| @types/node | 26.6.4 |
| @types/react | 19.3.0 |
| @types/react-dom | 19.3.0 |
| @vitejs/plugin-react | 5.2.0 |
| eslint | 9.39.5 |
| storybook | 10.6.1 |
| tailwindcss | 4.3.3 |
| typescript | 5.9.3 |
| typescript-eslint | 8.71.0 |
| vite | 7.3.6 |

Go host: `github.com/hollis-labs/chimera v0.0.0-20261004221620-c6485d234afe`; generator: `gofakeit/v7 v7.17.1`; Go language floor 1.26.6, locally tested Go 1.26.8.

## Operations v2 checkpoint

The versioned `operations/v2` artifact now carries tasks, runs, sessions, messages, tool calls, traces/spans, timestamped logs, lifecycle events and usage. Eight authored narratives include active review, completed review, blocked task after a failed run, and queued follow-up after a completed run. The 80-record history profile spans fourteen days. Larger generator profiles calculate their actual earliest observation rather than claiming a shorter coverage window. Private seed 4421 and fixed clock make both artifacts reproducible; Go validation checks graph references, intervals, parent spans, temporal bounds and token breakdown. Both bundled JSON profiles are freshness-tested against generation.

`operations/model.ts` supplies the same controlled scenario/resource model to the app and stories. Summary totals include the selected filtered records. Fourteen-day series aggregate those actual timestamped records; days before full UTC-day coverage are unknown. The current day includes observations only through the fixed clock. Sparse deliberately masks every third daily rollup while keeping individual records inspectable; summaries therefore count inspectable records, and plotted known-day totals omit unavailable rollups. Unavailable/denied/loading/error resources have null totals and series, never a healthy zero. Provider/model attribution remains explicitly unavailable.

| Torque reference composition | Parallax v2 adaptation |
|---|---|
| Activity: full-width 16-week calendar, 24-hour pulse, recent runs | Fixed UTC calendar with explicit coverage gaps, run-derived pulse, descending recent-run list; shared Panel/SummaryCards/StatusBadge and app-owned clock-injected visuals |
| Mission Control: 14-day run volume, run distribution, token throughput, task pipeline | Shared CompositionBars/BarList/BarMeter; fixed-window token-styled trend chart; distinct task/run states and preserved unknown task status |
| Usage: 14-day cost, provider/model usage | Same run/usage records and fixed-day chart; inspectable correlated-run usage; explicit attribution gap |
| Detail: session/messages/tools/log/trace/usage links | ID joins into actual artifact arrays, safe intent inspection, keyboard modal and selection retained across ordinary view navigation |

These are reference adaptations with a bounded two-week history, not pixel-perfect Torque copies. No API/SSE/live-data behavior was inherited. Calendar intensity currently distinguishes observation presence with exact numeric counts, rather than the upstream multi-level palette. Reference styling/fidelity tasks remain partial; coherent data/detail and portable-story contracts are the closure targets.

The plugin instance now owns its lifecycle and consumes Chimera's exact `c6485d234afe2fb004feb7d4ff7fc55e631f3217` composition/actions adapters. App-owned catalog policy admits summary widget, detail panel, modal widget, declarative toolbar actions and a reviewed handler target. Shared `usePluginAction`/gateway drives allowed local navigation, genuine admitted modal targets and transient command receipts. No command executes business work. Changing scenario/filter changes invocation identity as well as render context, cancels pending actions and clears modal/receipt state. An explicit producer-release control proves a late scripted outcome cannot restore prior-context receipts or action-status text. Load errors and explicit unload have truthful unavailable presentation.

### Story coverage and portable reuse

`Operations/Controlled views` includes Activity, Mission Control, Usage, Sparse, Unavailable, Unknown status, Missing metadata, Long labels, Empty, Failure and Primitives. The primitives story exercises Button, disabled action, known/unknown StatusBadge and EmptyState. Two earlier Fixed activity stories remain. These compositions import the same bundled JSON, model and view adapters as the app; scenario changes remount transient story state. Host/plugin integration is tested in the app, not duplicated as a fake Storybook host.

Build standalone files with `STORYBOOK_DISABLE_TELEMETRY=1 npm run build-storybook --prefix frontend`; output is `.scratch/storybook`. Serve these files with any static server. No Go server, database, credentials, providers, `/api` or `/plugins` calls are required; browser evidence asserts no such requests. Storybook's optional telemetry is disabled for the build command. Optional portable-story consumers can import the CSF exports from `frontend/src/operations/Operations.stories.tsx` and compose them with the installed Storybook React package, applying `frontend/src/index.css` as the preview does. Controlled props are `scenario` and `view`; the generated artifact/model/view files are the actual reusable presentation seam. This does not claim all-kit or all-export coverage.

Fresh browser proof uses app port 18541 and static Storybook port 18542, independent of the frozen live review on 18441. Screenshots include desktop/light mode, narrow long labels, Mission Control, Usage and narrow detail under `.scratch/test-results`. The root-managed review service and exposure binary are untouched.

Validated v2 checks: `make check` (Go race/vet, TypeScript, Biome, design lint, production build, 26 app CSS variables resolving in built CSS), standalone Storybook build, and 13 Chromium checks with fresh owned servers. The story index contains 13 stories; adopted package export inventory contains 316 declaration names and 16 used entry occurrences. The latter is public-entry usage evidence, not component behavior completeness. Navigation resets page scroll to the top while retaining the selected record; narrow modal capture disables entrance animation to document the final rendered surface.
