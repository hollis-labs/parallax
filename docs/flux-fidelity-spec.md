# Flux fidelity preparation — CW-20261010-0083

This is the proposed visual and fixture specification for the Flux chat recreation.
It prepares review; it does not implement a primitive, change a wire contract, adopt
a kit in Flux/Tangent, or record owner acceptance. DEC-073 approves the
propose-then-confirm process. The manager consolidates the questions below for
Chrispian before the dependent implementation tasks start.

## Primary references and exact provenance

| Reference | Source read | Meaning |
|---|---|---|
| Flux | `hollis-labs/flux`, fetched `origin/main` **232064c3a5eaa8e8d9e270d89d78df3ca81df231**, package 0.0.1 | Primary authored visual/layout/theme/renderer/state source. The repository represents `apps/flux`; this machine had no live Flux checkout, so the source clone is isolated at `worktrees/flux/CW-20261010-0083`. |
| Parallax | Fetched `origin/main` **bb6f11970b38aeb803e8cad2f9fb7af2c38cbd82** | Spec base. Existing `frontend/src/examples/chat/ChatExample.tsx`, model, routes, chat CSS and companion fixtures are the extension point, not a second chat example fork. |
| design-kit | Fetched `origin/main` **1dc83f98098a93ecf300dc5b3999bfe542efc7a7**, read from an exact Git archive | Current authored tokens, scales and primitives, including 0035/0036. Local live checkout was older; the archive, not that checkout, supplied the current API review and mapping. |
| go-envelopes | Released **v0.4.0**, tag object `521cc9fb5733f9ef372a9f960dc67796422c0f0f`, source commit **ae5bc8c72e1d58a81fb858a66c688b1e60c0139e** | Flux `go.mod` pin. Read `manifest/envelopes.yaml` and each referenced schema before Flux's generated registry. No exporter/digest/producer changes. |
| Tracker relay | Tesseract item `01M4HV1FTKSY20B9RKVPNY683E`, version `01M4HV1FTMXKF6GV98JRG4WBR2` | PM's copied DEC-026/071/072/073 and risk records; underlying tracker remains authoritative. Planner handoffs `01M4HR38D2BWASTS5FQ8WF01X1` and `01M4HQKQGRYC98P1HM48A28WS4` were read. |

Flux's own `AGENTS.md` explicitly says Nanite `main` embeds an independently
diverging `ui/` copy. No Nanite rendered/embedded copy is substituted here. The
read sequence was actual Flux `index.css`, App/AppGate/AppShell, layout and chat
stores, theme defaults/apply, sidebar kind/activity derivation, transcript/card
renderer, drawers and widget implementations; historical survey prose was not
used as visual evidence. The inventory contains hashes of every authored source
file in its declared scan domain.

## Reference captures and their boundary

Native Chromium captures use the **actual Flux App and components** with a
temporary owned Vite fixture entry and local in-memory API adapter. Layout and
component styles are the source styles. Card galleries mount the real
`EnvelopeRenderer`; transcript/approval/tool galleries mount the real source
components. Gallery framing is an inspection arrangement, not a Flux route or a
proposed Parallax design. The source main entry's development StrictMode wrapper
is omitted in the temporary entry; source product components are unchanged.

The source dev config normally proxies `/api` to Nanite at localhost:8090 and
starts generators in `predev`. It was **not** used. Startup also mounts unified
SSE, plugin registry/slots, tool refresh, per-session message reads, persisted
layout and active-session state. The harness replaces only the API import and
query polling configuration, disables SSE/WebSocket/interval transport, uses a
fresh browser context, and allows browser HTTP GET/HEAD only to its own
`127.0.0.1:18583` asset server. `/api`, remote assets, model calls, mutation
requests and service workers are blocked. An unknown adapter method rejects as
**unavailable**, never a successful empty array. Only explicitly declared empty
fixture slices return `[]`.

The manager authorized package-registry dependency acquisition after the offline
cache missed Zustand 5.0.11 (Tether `01a123c3-a776-70ed-9cfe-d299d6471bdb`).
`npm ci --ignore-scripts --no-audit --no-fund` installed the existing Flux lockfile
using an owned cache; it did not launch the generator, backend or a model CLI.
This authorization applies to build dependencies, not native runtime network.

Seed **4421**, reference time **2026-10-04T14:30:00Z**. Playwright fixes both
`new Date()` and source `Date.now()` to that instant; fictional ages derive from
the reference clock. Operand generation uses no wall clock. Native source
polling/countdowns are suppressed, so these captures establish static visual
states, not SSE reconnect, real streaming cadence, timeout behavior or persisted
backend effects. Built-in fixture settings are fictional. No customer folders,
credentials or real data were read. Source error-card Giphy behavior is excluded
by an empty query and the browser network boundary.

Fonts are the isolated retained local system font set. Flux declares Inter and
JetBrains Mono but does not bundle them or load a webfont in `index.html`; these
captures disclose fallback typography rather than claiming those font files were
present. OS IME, physical touch and live provider behavior are not established.

The owned immutable proof packet, capture results, native gallery observations,
request/mutation logs, hashes and replay recipe are linked in
[capture evidence](flux-fidelity/capture-evidence.md). Selected native previews
are included there; the complete-resolution originals remain in this task's own
`.scratch/flux-fidelity`, not another agent's historical proof.

## Mapping every authored color, radius, size and font

[The mapping table](flux-fidelity/token-mapping.md) has a row for every distinct
authored presentation entry in the declared lexical scan. The
[source inventory](flux-fidelity/source-token-inventory.json) retains all
occurrences and file SHA256s. [Its generator](flux-fidelity/inventory.py) reads
Flux `src/**/*.{ts,tsx,css,svg}` including dormant components, theme editor
swatches, inline style/state geometry and vendored UI; it excludes tests and
generated files. It is an authoring inventory, not computed CSS, reachability or
a new product gate. Strings/layout defaults can contain non-rendered entries;
their presence is not a claim that they paint the current screen.

CSS declarations and all six authored Flux theme palettes are included. External
`highlight.js/styles/github-dark.css` and Tailwind's inherited scales are library
inputs, not authored Flux values. The source's explicit light highlight overrides
are included. SVG viewBox paths are asset geometry, not design spacing; width,
height and paint attributes are recorded. Conditional progress percentages,
resize coordinates and measured drawer height are data/interaction geometry;
they must not become fixed design constants disguised as tokens.

Numeric color proximity in literal rows uses nearest authored Concrete & Signal
dark/light reference RGB from the pinned kit theme. It is a search aid: **role
wins over RGB proximity**. Semantic CSS variables map by meaning, palette
utilities map by purpose, and context-specific exceptions below override generic
literal proximity. No component may receive a hex/RGB value. Fidelity values
belong in a scoped theme layer; no new theme token is silently treated as shipped.

| Source family | Actual kit vocabulary | Proposed default / rationale |
|---|---|---|
| Surface/text/border ladders | `bg`, `bg-elevated`, `surface`, `surface-hover`, `surface-active`, `fg`, `fg-secondary`, `fg-muted`, `fg-faint`, `border`, `border-subtle`, `divider` | Preserve roles. Source muted/faint values are dimmer than current kit values; use the kit's reviewed text floors in the recreation rather than override them downward for pixel matching. |
| Brand red | `brand`, `brand-hover`, `brand-active`, `brand-muted`, `brand-fg` | Use built-in `nanite-default` for the source reference; its brand already carries Concrete & Signal values. Any additional brand fidelity override stays in the theme layer. `primary` remains the workhorse ink/foreground role, not a synonym for red. |
| Danger/warning/success/info | Their existing contract families | Keep the distinctions in the kit. Flux Direction C warning/danger share red and success/info are neutral; current kit independently corrected those values. Do not restore that collapse in shared components. |
| `accent-*`, shadcn aliases, `status-*`, toggle | Source-resolved brand or matching contract role | Flux `accent` means brand, unlike the kit's shadcn alias for selection. Resolve from Flux declarations, never perform a blind name-preserving migration. `status-ok/warn/danger` become `success/warning/danger`; `toggle-on` becomes `primary`. |
| 9/10/11/13px text | `text-micro/caption/label/control` | Exact scale fit. 12/14/16px and larger matching steps use inherited `text-xs/sm/base/...`. Off-step text snaps to the nearest actual scale, with its difference stated in the row. |
| 4/6/8/10/12/16px radii | `rounded-sm/control/lg/panel/xl/2xl` | Exact fit. 14px empty-state radius proposes `rounded-xl` (12px); no component-only 14px token. Fully circular indicators retain `rounded-full`. Preserve corner selectors on mapped radii. |
| Spacing and static dimensions | Tailwind spacing scale, inherited width/max-width scales | The token contract explicitly uses Tailwind's spacing scale. Named scale utilities replace literal px/rem. `max-w-[80%]` proposes `w-full` within the existing bounded message column; relative bubble width is an owner fidelity choice, not a new semantic token. |
| Font families and weights | `font-sans`, `font-mono`, inherited weight/tracking/leading | Family stacks are theme overrides; source 10/11px mono labels retain their role. `tracking-wide/wider` already fit. Off-scale tracking snaps to the nearest declared inherited or contract tracking step. |

These exception choices are proposals for confirmation, not UI defaults already
approved by DEC-073:

| Choice | Concrete proposed default | Rationale and fidelity cost |
|---|---|---|
| F1 — always-dark composer | Preserve its dark appearance only in the Concrete & Signal reference by a scoped dark theme context mapping its nine `composer-*` roles to existing contract tokens. Other themes/modes use their active palette. | The source composer stays dark in light mode. Scope preserves the signature without hard-coded component paint or a new global composer family; full 10-theme mode behavior stays coherent. |
| F2 — modes and multi-agent identity hues | Use visible names/icons plus existing `primary/info/warning/brand` roles locally. Retain deterministic identity assignment in the fixture model. Propose a theme-owned categorical chat identity family only if a second distinct consumer proves it necessary. | Flux has four mode hues and raw violet/orange/pink agent rings; modes were removed from the production per-session dial. Fixed hue identity is not generic feedback. No new idiom tokens under 0083. |
| F3 — raw palettes, scrims, legacy unknown names | Resolve by source role; neutral fills use surface ladder, feedback uses success/warning/danger/info. Scrims use a themeable existing surface/opacity composition; fidelity shadow and scrim values, if retained, live in the theme layer after review. | Avoid raw zinc/black/white paint freezing light/dark. Dormant `bg-bg-surface`, `bg-elevated`, `border-subtle` spellings are documented mappings, not proof they currently generate useful CSS. |
| F4 — off-scale size/radius/tracking | Snap to the nearest existing step. For ties choose the smaller radius/text size unless readability requires the larger step. Source 34px logo type proposes `text-4xl` (36px); source stroke 1.9 proposes `stroke-2`. | Exact 10px panels, 6px controls and 11px labels already fit. Tiny isolated deviations do not justify new primitives or scales. The full table states each nearest step. |
| F5 — proportions and resize geometry | Keep controlled geometry for drag/progress data; token-bound minimum/maximum and named default heights. Bubble width uses bounded column + full available width. At 390px show one primary surface and make rails/drawers explicitly openable rather than retain clipped desktop columns. | Source screenshots preserve the authored desktop-first clipping; the recreation should preserve hierarchy, not inaccessible overflow. This is a proposed adaptation requiring owner confirmation. |
| F6 — typography | Theme `font-sans/mono` stacks; use installed system fallback for deterministic portable fixtures. If Inter/JetBrains matching is required, add reviewed local font assets and receipts as a follow-up, with no browser font network. | Source declares stacks but ships no matching font assets. Current captures cannot prove those exact fonts. |
| F7 — code and chart paint | Code highlighting uses `syntax-key/string/number/boolean/null` and foreground roles, with source light-highlight rules as the visual guide. Charts use semantic feedback for actual statuses; categorical series require reviewed theme series values. | Imported GitHub Dark/light overrides and ChartJS global literals bypass active theme today. Built-in kit `chart-1..5` remain explicit placeholders; don't present identical placeholder series as a designed palette. |

## Primitive boundary: reuse, local candidates, upstream proposals

Current source APIs are reviewed independently of registry availability. The
0035 `InspectionDialog` ships controlled `open/onOpenChange`, `title`, `meta`,
`navigation/navigationLabel`, `footer`, `children`, `titleProps`, `bodyProps`,
forwarded popup/focus/event props and ref. The 0036
`useControlledRecordNavigation` takes `orderedIds`, `selectedId`, `active`,
`accessible`, `sourceGeneration`, `boundaryPolicy: wrap|stop`, `onSelect`; it
returns `position`, `availability`, `navigate` and bubble/composition
`popupHandlers`. Neither API owns data, transport, routing or persistence.

0035 source delivery: kit PR101 merge `37fcb187ffcfe886b39e941fd16e0f3fe1d0d17d`,
reviewed source `f90f113f8420f3e9ff6b0853b58baeab7effdf20`; Parallax PR5 merge
`706e90b3bfb7f9df2a329217ca45d0eb01403511` consumes the unpublished archive
SHA256 `d1ac13e4854d36299878a7218461a7cf47768ed3b330ad49e45cdd535fade425`.
0036 source delivery: kit PR102 merge
`1dc83f98098a93ecf300dc5b3999bfe542efc7a7`, reviewed source
`62c066cfe6a6547969e85745d969929240e3dcb6`; combined unpublished candidate
SHA256 `70245a92dc01fdee25546a567105c50d7dd85a0ae53d5559b4da8d58c99b7ccd`.
At this spec's read, Parallax PR7's combined consumption was still under review;
the current spec base consumes chrome only. These are source/package receipts,
not a claim that the npm registry publishes these APIs at 0.4.0.

| Surface / dependent task | Existing primitive/source | Proposed route and second-consumer boundary |
|---|---|---|
| Top/bottom resizable drawers, 0084 | `Sheet`, `OverlaySidebar`, `TabStrip`, source `ChatPrimaryDrawer/ChatWorkingDrawer/ChatDrawerTabStrip` | Narrow controlled local Parallax drawer candidate first: placement, open/size, tabs, pin/close/running indicator; host owns session-keyed layout state. Top and bottom variants in Flux alone do not prove a second consumer. Reuse in a distinct Workspace/Messaging inspection workflow before general design-components proposal. |
| Session tree and header/presets, 0086 | Existing Parallax Chat grouped list, kit `ChatStream/ModelSelector/Context`, Flux `sidebar-session.ts` | Extend the existing Chat model/list as a local candidate; preserve source kind/state evidence and guarded editable/context-menu ownership. Header chip composition and preset state remain app-owned. General tree primitive only with a distinct Administration/Workspace hierarchy consumer. No ops-list clone. |
| Existing stream cards, 0087 | kit-chat `ArtifactCard`, `DocumentCard`, `PromptCard`, `ConfirmationCard`, `DiffCard`, `Envelope` slots, `InfoCard`, `ListCard`, `MetricCard`, `ProgressCard`, `TableCard`, `TimelineCard`; source renderer | Reuse existing cards and an app-owned binding adapter from the pinned wire operands. Appearance packages do not rename wire types or claim schema/digest ownership. `session-task` remains unsupported visual fallback, not a new renderer invented here. |
| Missing approval/proposal/report/error/termination/elicitation states, 0087 | `Confirmation*`, `Question`, `Tool`, `CardBoundary/CardMiss`, response seam | Write focused kit-chat extension proposals against the existing slot/response seams. First prove the specific candidate in Parallax; upstream only when a separate Messaging/Tangent fixture flow establishes a second distinct consumer. An inline card plus its drawer rendering is still one consumer. |
| Tool modes, thinking, banners, compaction, 0087 | `Tool`, `Reasoning`, `ChainOfThought`, `ChatStream` statuses and existing envelope slots | Compose locally; propose only the missing behavior/slot, not a wholesale Flux store-bound component transplant. Distinguish warning, error, termination, interrupted turn and text-only explanation. |
| Composer slash and @ mentions, 0087 | Native `ChatInput`, `PromptInput*`, `Suggestion`, source Tiptap editor/extensions | Local controlled suggestion/menu candidate around native kit input first; host supplies finite commands/file references and selected insertion. Keep rich editor/document model out of shared input until a second consumer requires it. No Tiptap default imposed by source resemblance. |
| Right rail/widget shell, 0085 | `CollapsibleSection` (currently local state/defaultOpen), `Panel/Kpi/MiniTrend`, `Context/Plan/Queue`, source Widget/RightRailV2 | Controlled tab-host/widget-shell local candidates. Host stores open/order/default by fictional session; propose a controlled collapse seam upstream only after another distinct idiom needs it. The future AppShell aside (0072) is the intended host, not an additional custom outer shell. 0072 remains owner-gated. |
| Widget context/details inspection | Exact 0035 chrome and 0036 controlled navigation | Reuse `InspectionDialog` for bounded arbitrary detail, with host purpose-specific initial/final focus and one scroll body. Use record navigation only for real admitted record siblings, not tab switching. |
| Whole chat, 0088 | Existing `ChatExample`/model/routes/story/native contracts | Extend its admitted fictional companion with a named Flux appearance/composition and matching standalone/portable entry. Every send/stop/resume/approve/pin control is an inert labelled specimen or explicit local preview; no saved/produced outcome implied. |

Do not duplicate [CW-20261003-0073](https://torque.nanite.cloud/tasks/CW-20261003-0073):
the Flux rebuild/plugin-host-ui decision is separately owned by the Flux/ops-chat
track. This spec may inform its visual work; it does not cover its Model A loader
retirement, agent-kit adoption or release. Plugin-host-ui release prep 0104 and
the generic ops-list 0073 are independent work, not part of this task.

## Deterministic operand inventory

[Fixture operands](flux-fidelity/fixture-operands.json) and
[authoring recipe](flux-fidelity/fixtures.py) are concrete proposals for the
downstream model. They include stable fictional IDs, fixed clock/seed and exact
source-schema references/hashes. They are not captured production sessions,
historical outcomes, or fixed product-count guarantees. Native adapter values
are separately recorded in the proof packet; widget proposals which were not
rendered successfully are not upgraded to observed source behavior.

| Session | Kind | Source operands yielding activity | Reference age |
|---|---|---|---|
| fixture-session-1 | api | active; no presence/runtime markers → idle | 10m |
| fixture-session-2 | cli | `pty-codex`, `runtime_state: running` → online | 11m |
| fixture-session-3 | durable | `context_type: durable_agent`; activeStreams entry → working | 12m |
| fixture-session-4 | api | pendingTools entry → pending_action | 13m |
| fixture-session-5 | cli | `status/runtime_state: failed` → failed | 14m |
| fixture-session-6 | durable | `halted_at` present → halted | 15m |
| fixture-session-7 | cli | `status: stopped` → stopped | 16m |
| fixture-session-8 | durable | `status: archived` → archived | 17m |

The actual source prioritizes archived, halted timestamp, stopped/done, failure,
pending tool, stream, resident/CLI online, then idle. These display states are not
a new backend enum. Archived is hidden until the archive toggle; captures show
both source admission behavior and explicit archive reveal. Add downstream
nested parent/root/child, missing parent, pinned ancestor, editable row, empty,
loading, unavailable and partial specimens, using the existing source derivation.

Messages include markdown/code/table/blockquote, compacted→non-compacted
boundary, envelope-bearing assistant content, long identifier wrap, static
thinking/narration/final preview, tools **running/done/error** (every actual
`ToolCall.status`), and the text-only banner. Tool display-mode proposals should
also cover source indicator/minimal/compact/full preferences;
capture of the tools gallery alone does not establish every mode interaction.

The authored manifest has **18** core types, not the task's historical 16. The
task description for 0087 itself lists 17 visual names while calling them 16.
There are 17 visual registry bindings and backend-only `session-task`:

| Core type | Native source path / binding | Complete and partial intent |
|---|---|---|
| document-viewer | DocumentViewerCard | Heading/content/section specimen; missing content. |
| report-card | ReportCard | Metric + summary; missing metrics. |
| error-report | ErrorCard | Code/message/details/time, no Giphy query; missing code. |
| approval-card | ApprovalCard, wrapper override | Risk/description; incomplete description/details. |
| proposal-card | ProposalCard, wrapper override | Editable fictional fields/schema; missing payload/type. |
| info-card | InfoCard | Title/body; incomplete body. |
| list-card | ListCard | Static items/statuses; missing items. Separate proposed unresolved data-source fixture. |
| metric-card | MetricCard | Label/value/unit/trend; missing value. |
| progress-card | ProgressCard | Percentage/steps; missing progress. |
| confirmation-card | ConfirmationCard, wrapper | Message/actions/risk; incomplete fields. |
| table-card | TableCard | Columns/rows; missing both. Later actions are local inert previews. |
| timeline-card | TimelineCard | Timed completed/active events; missing events. |
| diff-card | DiffCard | Before/after; missing both. |
| artifact-mini | ArtifactMiniCard | Fictional file metadata; incomplete file identity. No download performed. |
| session-task | No frontend binding | Both variants deliberately demonstrate unsupported fallback. Backend-only is not “successfully rendered task card.” |
| subagent-spawn-approval | ApprovalCard, wrapper override | Run/role/prompt/mode/risk; missing run/mode. Never launches an agent. |
| chat-loop-terminated | ChatLoopTerminatedCard | Code/reason/iteration/failures/time; missing machine fields. |
| elicitation-prompt | ElicitationPromptCard, wrapper | Boolean prompt/origin/fixed future timeout; missing request identity/schema. Add string variant downstream. |

Complete data operands are validated against their pinned primary JSON schemas.
Partial operands intentionally omit required data: they exercise UI robustness,
not valid complete producer payloads. Native fallback/error outcomes are recorded
per type, rather than assumed to be gracefully empty. Wire `type` remains exactly
the released manifest identity throughout.

Both approval flavors have low/medium/high × pending/approved/rejected operands.
Generic approved/rejected hydrates from `prior_response.status: submitted` plus
`data.approved`. Subagent rejection uses `status: canceled` and reason; approval
uses submitted. These are observed source response conventions, not permission
to change producers. Separate runtime permission approval countdowns remain
out of native timing proof; later fixtures must not auto-call a real decision API.

Widget proposal slices cover agent/session/context/tokens/tools/workers/
observability/bookmarks. Supply explicit `known_empty`, `unavailable`, `unknown`
and `partial` alternatives: a missing metric must never be presented as a proven
zero. Source widgets sometimes default missing data to zero; that is documented
source behavior, not an accepted recreation evidence model. The exact capture
adapter supplies fictional 8,000 tokens/32,000 ceiling and a labelled fictional
zero cost. It also supplies one inert tool and one disconnected fictional tool server. Its
successful-empty bookmarks/execution slices are separate
from unavailable start-surface capability and any other undeclared methods.

Drawer inventory follows actual switch/table declarations:

- Primary: **documents, reports, diffs, tools, pins**, plus `pin:<id>` for a
  supplied pinned card. Payload kinds: markdown/image/diff/scratchpad/artifact-mini/
  agent-envelope; these are not invented primary tab names.
- Working: **scratchpad, terminal-1, terminal-2 (developer only), artifacts,
  runtime, session-context**, plus **card:fixture-info-card**. Resize/open/tab state
  is supplied per fictional session; card pin/close/retirement are local proposals.
- Right: **widgets, work (Plan label), workflows, inbox, artifacts**; plugin panel
  metadata may deliberately render the source's pending-renderer placeholder.
  No remote plugin bundle is loaded.

Terminal strings are inert. Runtime feed is explicitly unavailable unless a
finite local host-feed operand is supplied. Drawer “empty” source fallback does
not prove a successful terminal, artifact, runtime or pin backend operation.

## One-pass owner confirmation packet

Manager routes these together under DEC-073. None is labelled owner accepted.

| Owner question | Proposed default | Why / evidence |
|---|---|---|
| Which visual source and capture permission? | Use this exact `apps/flux` source and native local fictional-fixture packet. Existing authorization is sufficient; no additional screenshot request. | Flux AGENTS/source divergence, exact clone head and blocked-runtime logs. |
| Pixel fidelity or token purity? | Preserve composition, hierarchy, 10px panels/6px controls/11px mono density; snap isolated off-scale values and use reviewed kit semantic contrast/feedback. | Many source sizes fit exactly; kit Concrete & Signal deliberately differs in muted text/health roles. Table and F1–F7 make every exception concrete. |
| Dark composer in light mode? | Scoped dark composer only for Concrete & Signal reference; active-theme composer otherwise. | Source index.css keeps composer values identical across modes. This is a theme choice, not a hard-coded component exception. |
| Mode/agent colors and fonts? | Named identities plus theme roles; deterministic local system font stacks. Propose reviewed categorical chat tokens or locally bundled Inter/JetBrains only if exact matching is wanted. | Source palette/agent hash and unbundled font declarations; no hidden external assets. |
| 80% bubbles, drawer proportions and 390px behavior? | Bounded column + full available bubble width; token defaults and controlled drag geometry; one primary surface on narrow layouts with explicit rail/drawer access. | Source viewport captures expose clipping and geometry; accessible adaptation needs explicit confirmation. |
| Local primitive vs immediate upstream? | Local controlled drawer/tree/tab-host/widget-shell candidates first; focused upstream proposals for gaps in existing kit-chat seams, after distinct second-consumer proof. | Current APIs and per-surface boundary table above. Two render placements of Flux are not two consumers. |
| Rich editor/slash/@ boundary? | Native kit input with controlled finite suggestion insertion locally; no Tiptap adoption by default. | Existing kit native input vs Flux's store/Tiptap-coupled composer. |
| Envelope completeness and unavailable behavior? | All 18 primary manifest identities; distinguish valid complete, deliberately partial, unsupported backend-only and unavailable. Preserve observed failures as evidence; later recreation supplies useful fallback rather than claiming successful zero. | Released schemas, source registry/renderer and native observations. |
| Which later Flux settings scope? | In 0094, propose Appearance (all themes/modes), Layout, Shortcuts and Permissions as representative pages; provider/tool/plugin panels are inert fictional specimens and only expand after explicit scope confirmation. | Shared theme/layout/keyboard/approval evidence matters to chat; full settings adoption is a separate 0094/0095 task. No settings implementation under 0083. |
| How does this cover the Flux rebuild? | Link existing CW-20261003-0073; no claim of loader/adoption completion. | Its current task explicitly assigns the plugin-layer decision to the Flux/ops-chat rebuild track. |

Verified shortcut defaults from source `useKeyboardShortcuts.ts` and
`ShortcutsPanel.tsx`: Mod+B sidebar, Mod+/ right rail, Mod+L composer, Mod+N new
session, Mod+K palette, Shift Shift search, Mod+] / Mod+[ session navigation,
Mod+D bookmark, Mod+. artifacts. Mod+\\ opens layout menu; Mod+Shift+H toggles
header chips. Source Escape first yields to an open Radix dialog, then blurs an
editable focus owner, then pops navigation/settings. These are source facts;
native keyboard/focus/IME polish remains downstream behavior acceptance.

## Validation and remaining acceptance

The final evidence packet records the focused native gate through `heavytest`,
complete schema validation, deterministic regeneration, source hashes and Git
whitespace review. No product or wire source is changed, so unrelated Parallax
Go/frontend full suites and unrelated kit gates are not rerun. The source capture
is not a broad Flux build/test acceptance claim.

Technical doc/source review, current PR gate and eventual merge are separately
tracked in Torque. Owner defaults and visual acceptance stay pending through the
manager even if this documentation merges. Registry publication, tags, versions,
credentials, deploys, model execution, live mutation, product primitives and
Tangent/Flux adoption are outside this preparation task.
