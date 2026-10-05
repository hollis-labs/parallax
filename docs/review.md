# Review evidence and boundaries

Commands: `make check`; `node scripts/coverage.mjs`; `npm run build-storybook --prefix frontend`; `npm exec --prefix frontend -- playwright test --config frontend/playwright.config.ts` against `make run`.

Browser tests cover coherent detail, transient business intents/reset, light mode, large-list page scroll and narrow layout. Tests use bundled fixtures and local host only. Screenshots are ignored review artifacts under `.scratch`. CSS TSX design lint and CSS variable resolution are separate checks; browser computed-style evidence confirms 24px page padding, actual themed text/background and source registration.

Public export inventory `export-inventory.json` enumerates exported runtime/type names from installed package public declaration entrypoints. Used entries are mapped explicitly; every other export is unreviewed. This is a baseline for future component-specific stories and interaction tests, not full visual coverage.

Known upstream adaptation targets:

- Released ActivityHeatmap/HourlyPulse read ambient Date without an injected clock. Parallax uses app-owned fixed-clock calendar/pulse views derived from record timestamps instead.
- Sparkbars' square cells overflow a wide eight-sample strip, hiding variation. V2 uses explicit clock-injected day charts and shared BarMeter/CompositionBars; upstream source is untouched.
- Folio preset root mount produced `//`; application wiring corrects `/` and consumes Chimera.
- plugin-host-ui candidate is unpublished. Exact archive/version/digest and MIT provenance are recorded in third_party.

Remaining scope: comprehensive Storybook coverage, all independent kits, long-running scripted event playback (current control is clock preview), shell/layout comparison families, admin/account/developer/voice compositions, sandboxed-frame plugin proof, remote snapshot imports, Sigil generation and generic seeder extraction. Generic Examples drafts/settings only demonstrate transient intent behavior; they do not satisfy those kit-specific backlog tasks.

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
| @hollis-labs/kit-chat | 0.4.0 |
| @hollis-labs/design-bindings | 0.1.0 |
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

## Communications and chat checkpoint

`communications/v1` is generated in Go alongside operations/v2 at seed 4421 and the same reference clock. Three fictional contacts, three channel-specific conversations, six inbound/outbound messages, three inline text attachments, three chat sessions, plans, queues and paired interactive cards join real operation run/session/tool IDs. Successful, failed and queued delivery narratives are explicit. Graph validation and freshness tests cover relationship identity, attachment ownership, timestamps and negative dangling/wrong-owner cases. Historical records never imply a live transport or model session.

Contacts directory/detail and email/SMS/Tether-style inboxes are app-owned compositions using current shared primitives. No dedicated `kit-contacts` or `kit-messaging` packages exist in the reviewed source portfolio or npm registry. Long messages, attachment inspection, empty inbox, failed delivery, missing contact metadata and denied send have controlled fixture presentations. Filters, selection and drafts stay transient. Changing conversation/channel/delivery context resets draft and attachment state; inaccessible resources remove transcript and attachment content.

Released `@hollis-labs/kit-chat@0.4.0` supplies ChatStream, ChatInput, ConfirmationCard, PromptCard, CardBoundary/CardMiss, Reasoning, Tool, Plan, Queue, Attachments, Sources and ArtifactCard. Both card kinds pass the same host-owned `design-bindings@0.1.0` table/resolution seam before rendering reviewed statically imported components. Fixture wire kinds are explicitly Parallax-owned, not a production server envelope contract. Unknown wire kinds use the actual unclassified CardMiss result; pending/refused/error/unknown response states use shared prior-response classification and lock input. Manual stream chunks have no timer, model or tool execution; changing session/state/scenario clears preview, drafts, answers and intents. Load-older history exposes the same operations message records.

ChatStream's shared MessageScroller viewport is adapted to natural document flow with overflow visible, disabled auto-scroll/prepend preservation and token-styled host overrides. The AppShell page-scroll remains the sole scrolling owner, verified at 390px. This is an inspector composition rather than an independent full-height chat viewport. Reasoning is explicitly authored fixture rationale, citations identify local provenance without external URLs, attachments expose inline read-only text and artifact downloads are absent.

The released chat source registration is `@hollis-labs/kit-chat/source.css`. All new app CSS uses contract tokens; built CSS resolves 27 referenced app variables. TypeScript allows the published bindings package's explicit TS extension imports under noEmit. No upstream source changes or new packed candidates were needed. Complete chat mixed-license text is preserved as a public static asset in `frontend/public/kit-chat-LICENSE.txt`; it includes MIT terms, Vercel AI Elements attribution and Apache-2.0 terms. No upstream license is reduced to MIT.

Communications/Controlled review adds 16 stories: Contacts, Messages, Empty inbox, Delivery failure, Denied send, Missing metadata, Long messages, Chat, Streaming, Pending card, Refused card, Response error, Unknown wire, Unknown response, Failed tool and Unavailable. These use the same generated artifact/model/components as the app, require no Go/API/plugin server and reset transient state when controlled args change. There are 29 stories total. Existing operations/plugin widget/panel/gateway proofs remain intact.

Validation: make check; standalone Storybook build with telemetry disabled; 17 fresh-server Chromium checks, including contact-to-conversation keyboard navigation, attachment focus restoration, no non-GET business requests, drafts/card classification/manual stream reset, denied content removal, portable stories without API requests and sole narrow page scroll ownership. Screenshot evidence includes desktop contacts/inbox/chat and scrolled card/tool surfaces plus narrow inbox/cards, under ignored .scratch/test-results.

Export inventory now enumerates 702 declaration names across four adopted packages with 54 exact public-entry imports, recording actual source locations and distinguishing typed imports from compositions. This is import/provenance evidence, not exhaustive behavior coverage. Broad developer/voice/account fixture families, all-kit stories, comprehensive export interactions and sandboxed plugin adoption remain open. Provider/model attribution and operation-reference fidelity remain the earlier documented gaps.
