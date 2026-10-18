# Supplied fixture families and complete examples

The generated [family manifest](../frontend/src/fixtures/family-contracts.json) describes the supplied artifacts. `make fixtures` regenerates it from the same Go generators as the JSON consumed by the app and portable stories. The Go freshness check compares artifact identity and every listed array count, then verifies validation and adapter pointers. Counts are bundled inventory, not filtered or admitted result totals.

| Family | Dataset / generator | Supplied profiles | Evidence boundary |
|---|---|---|---|
| Operations | operations/v2 / parallax/v2 | Persisted records-8 and records-80; separately selected torque-16w/parallax-v8 override | Exact recorded event prefix, or explicitly labelled full snapshot |
| Communications | communications/v1 / parallax/v3 | Declared contacts/chat review label; no persisted profile history | Independent full snapshot; metadata is unavailable before its own clock in prefix-aware evidence views |
| Administration | administration/v1 / parallax/v4 | Declared fictional directory/settings review label | Independent full snapshot; roles and permissions are metadata, not authorization |
| Observations | observations/v1 / parallax/v5 | Declared five-resource review label | Bounded resource receipts at observedAt; retrospective samples at their own exact UTC timestamps |
| Developer | developer/v1 / parallax/v6 | Declared file/graph review label | Recorded evidence at recordedAt; authored proposals remain explicitly separate |
| Voice | voice/v1 / parallax/v7 | Declared two-clip review label | Independent synthetic-media snapshot; authored timed text is not speech transcription |
| Tether Sysop | tether-sysop/v1 / parallax/v10 | Bundled control plane and operations dashboard | Independent full snapshot with authentic fixture-local sessions; 24h retrospective window |

Every artifact supplies seed 4421 and its own fixed reference clock, 2026-10-04T14:30:00Z. Their equal clocks do not make communication, administration or voice snapshots follow an operations cutoff. The manifest records actual coverage windows where supplied, and the developer recordedAt boundary. Presentation appearances and authored specimens are not persisted historical profiles. Administration now carries additive generator metadata; its existing v1 records and business relationships are unchanged.

The generators' existing validators own record, foreign-key, timestamp, parent-span, media and sample bounds. The accepted contract milestone (0047) closed two identity gaps: administration requires its supported generator; communications requires its supported dataset/generator versions. The metadata adapter does not replace record validation. A future compatible artifact needs an explicit manifest and adapter update rather than silently inheriting these declarations.

## Small example boundary

[ExampleDefinition](../frontend/src/examples/contracts.ts) supplies Torque's finite entry, destinations/default, primary family, projection, reset policy and scroll owners. `exampleContext` admits the exact supplied version/generator/seed/profile/reference clock and a supported family projection. Prefix admission also requires an actual known recorded boundary. Snapshot-only families refuse an attempted prefix. This is a bounded presentation contract, not a router, schema registry, ORM or transport.

The actual Torque shell and the fullscreen portable Torque composition consume this definition. Routes and reset defaults derive from it. Both display original reference clock separately from projected cutoff. The actual reviewed plugin host receives the same admitted family/profile/reference/source token alongside its existing projected counts and cutoff. Native selection admission remains in the operations model and finite route adapter: excluded records are cleared; ordinary navigation retains a currently admitted selection. One `.torque-page` owns ordinary page scroll; Runs uses the released operations page body instead; navigation and record dialogs have explicit bounded owners.

Torque About exposes the fixture-family matrix with native relationship/coverage disclosures. These are documentation and inspectable records, with no fetching or business effects. Portable About mounts no Go API or plugin delivery.

## Accepted whole-app consumers and remaining limits

All five compositions have a standalone finite entry and a fullscreen story in **App Examples**. The same component receives controlled state in both hosts; the standalone route adapter owns browser history while the portable host uses local state. No whole-app example nests the lab rail.

| Example | Entry | Primary supplied source | Shared composition / native proof |
|---|---|---|---|
| Torque | `?example=torque` | Operations prefix; explicit `torque-16w` reference profile or unchanged legacy packs | [TorqueExample](../frontend/src/examples/torque/TorqueExample.tsx), [routes and selection](../frontend/tests/torque-example.spec.ts), [Activity](../frontend/tests/torque-activity.spec.ts), [Mission/Usage](../frontend/tests/torque-mission.spec.ts) |
| Chat | `?example=chat` | Independently versioned chat companion plus original communications and records-8 joins | [ChatExample](../frontend/src/examples/chat/ChatExample.tsx), [native proof](../frontend/tests/chat-example.spec.ts) |
| Messaging | `?example=messaging` | Independent communications snapshot | [MessagingExample](../frontend/src/examples/messaging/MessagingExample.tsx), [native proof](../frontend/tests/messaging-example.spec.ts) |
| Administration | `?example=administration` | Independent administration snapshot | [AdministrationExample](../frontend/src/examples/administration/AdministrationExample.tsx), [native proof](../frontend/tests/administration-example.spec.ts) |
| Workspace | `?example=workspace` | Independent developer snapshot, recordedAt evidence and original records-8 joins | [WorkspaceExample](../frontend/src/examples/workspace/WorkspaceExample.tsx), [native proof](../frontend/tests/workspace-example.spec.ts) |
| Reader | `?example=reader` | Independent `fe.reader.list.v1` reader list snapshot | [ReaderExample](../frontend/src/examples/reader/ReaderExample.tsx), [native proof](../frontend/tests/reader-example.spec.ts) |

The [Torque reference pack](torque-reference-profile.md), [Activity](torque-activity-reference.md) and [Mission/Usage](torque-mission-usage-reference.md) are accepted reference presentations. Legacy records-8/80 dashboard charts remain labelled adaptations. The [chat companion](chat-example-fixtures.md) supplies finite authored order/history and original message/source references for the accepted whole-chat screen; its untimed authored history and manual preview are never committed recorded messages.

Concrete runtime limits remain:

- Communications metadata has no timestamped history contract for operations-prefix reconstruction. Its whole-app consumers use its independent snapshot clock.
- Account preferences, token/provider metadata and rendering specimens are separately authored, not recorded runtime account outcomes. Roles and permissions never evaluate authorization.
- No application creates saved settings, messages, provider connections, authentication decisions, execution results or repository history. Source/proposal files and the test ledger do not imply saved edits or executed CI.
- No real collector, provider attribution, voice capture or recorded speech/video is supplied. Current readonly graphs/files/synthetic media and resource appearances cover presentation only; valid DiagnosticPanel copy remains excluded.

[The criterion-specific parent evidence](whole-app-acceptance.md) maps original 0116/0119 requirements to these accepted consumers and validators. Parent disposition remains a separate root decision; this consolidation does not claim exhaustive component behavior or production runtime capabilities.

Validation: `internal/scenarios/families_test.go` checks generation/artifact/count/pointer freshness. Existing family suites validate real joins and bounds. `frontend/tests/example-contracts.spec.ts` covers incompatible identities/profiles/projected clocks/unknown boundaries and snapshot-to-prefix refusal. `frontend/tests/app-examples-acceptance.spec.ts` proves native Workbench admission into all five standalone shells and the matching API-free fullscreen Storybook compositions, with current navigation, clocks and bounded narrow/short-height owners. Existing per-app tests retain detailed source/currentness, keyboard and endpoint proofs.

## Captured app review

The Workbench's **App Snapshots** entry (`?example=snapshots`) reads the immutable
`/api/snapshots/current` build artifact. It offers Torque's task board, Tether's
overview and the kit-based Operations → Sessions reference. These views reuse the existing board and
overview compositions; captures do not enter the synthetic operations graph or
inherit its fictional annotations. Reset review clears local filters, selection
and transient actions. The authored examples remain separate links.

Run `node scripts/capture-snapshots.mjs` with `TORQUE_API_TOKEN` when required;
`TORQUE_SNAPSHOT_URL`, `TETHER_SNAPSHOT_URL` and `TETHER_SNAPSHOT_TOKEN` select
read-only source endpoints/authentication. The command captures one bounded
50-task summary page, referenced project/epic/sprint names, Tether's overview,
and up to 200 sessions from the returned session response. It does not paginate
an entire source store. `--stdin` accepts the same response envelope from an
authorized browser capture when the GUI's authenticated route is the available
read path. Credentials never belong in that envelope.

The projector validates data and writes `internal/snapshots/data/current.json`
atomically. That local build input is gitignored, and must be copied explicitly
into the preview build checkout before Cerberus deployment. Source-only builds
serve the tracked empty descriptor. Neither browser Refresh nor Reset contacts
Torque/Tether; refresh of captured data is an explicit capture and rebuild.
The content hash identifies the pack, with individual response timestamps and
original request paths. Separate GETs do not establish an atomic cross-service
snapshot. Counts on the Torque board cover captured rows; Tether overview totals
retain their own source scope. Session response coverage is distinct from those
aggregate totals. Task bodies, run receipts, message contents, tool payloads,
environments, prompts and credentials are deliberately excluded. Available
workstream IDs remain source references, not fabricated session joins.

The first slice does not yet replay the capture inside the original apps or
Tachyon's cache. It establishes reusable captured presentation input; original
app replay and wider domain/relationship coverage remain subsequent work.

The Sessions reference composes `OperationsTablePage`, `TabStrip`,
`FilterEntityCombobox`, `RecordSummary`, `StatusBadge`, shared menus and
`DetailDialog`; it has no page-specific stylesheet. Tether owns lifecycle
classification and capture projection. The page searches captured identities,
sorts columns, filters states/providers, windows rows, and opens captured
identity details. Summary counts cover the captured slice; the source total and
response timestamp remain separately labelled. Launch IDs are allowed in the
projection; absent fields from older captures remain “Not captured.”

Stop confirmation is a local preview, eligible only for captured ready, launching
or running states. It requires the same short-ID confirmation as the source
page, sends no command and does not mutate the capture. Launch profile editing,
cleanup, transcripts, checkpoints, runtime streams and policy changes are not
part of this reference slice. Tachyon is the reference for subsequent Planner
and page work; Torque's Planner is the retired spike.

The Torque task dialog presents captured status, priority, execution settings,
organization, tags, workstream and timestamps using shared detail components.
Descriptions and run history remain explicitly unavailable rather than raw JSON.

### Tachyon Planner reference

`?example=snapshots&source=planner` renders Tachyon's current Planner structure:
Board (curated), Activity (all), and the seven Planner lists. Torque supplies the
records; this is not Torque's retired Planner UI or an embedded Sysop page.
`node scripts/capture-planner.mjs` extends an installed base capture. It uses the
same Torque URL/token variables and supports `--stdin` for an authorized browser
envelope. Each list is bounded to 100 rows; each board section is bounded to 50.
Source totals, per-response timestamps, board notices and truncation survive the
projection. Ages use the captured board clock. Older packs show missing Planner
data explicitly. Capturing a fresh base pack requires extending it again.

Global search covers captured IDs, titles and summaries across all seven lists;
list search, status filtering and settled visibility are local. Lists use shared
DataTable/RecordSummary, FilterBar, StatusBadge and layout components. The shared
StatusBadge accepts an optional semantic tone while preserving an app's label,
so Planner does not need its own status-pill markup. The additive API is in the
review candidate, not a published kit release.

Item dialogs expose summaries and captured metadata. Full descriptions, comment
bodies, links and linked task details are excluded; reply counts are retained.
New item is an explicitly local title/summary preview. Creation, editing,
reordering, task linking and cache refresh are not implemented business actions.
No browser interaction calls Torque, Tether or Tachyon.

### Tachyon Agents and Builder references

`?example=snapshots&source=agents` preserves Tachyon's workstream/project groups,
robot identities, captured process/chat state, provisional score and detail
modal. Scores follow Tachyon's uptime/recency formula with no observed history.
No working-share chart is fabricated. Process/chat joins use an exact session ID
or a unique managed-workspace match before full paths are removed; ambiguous
matches remain separate identities. Clock-based labels freeze at capture time.

`?example=snapshots&source=builder` separates Definitions, Teams and Assignments.
Definitions offer search/provider filtering, selected details, launch profiles,
permissions/skills metadata and local edit/clone previews. Teams retain distinct
saved versions from Tachyon's operator-imported Tether snapshot, with seats and
policy summaries. Imported teams cannot be edited through a partial projection.
Assignments are local drafts; the source itself does not connect live assignment
reads. Preview state survives tab changes and clears on Reset review/reload.

These are React kit compositions. New controlled kit-admin components own the
responsive directory/detail layout, selectable record row, metadata grid and
theme-colored identity avatar. Shared dashboard section/search-band components
supply Planner's corrected inset, vertical spacing and divider. Parallax's `dl`
fallback lives in the base cascade layer so kit utility layouts can take effect.
No per-page stylesheet or Sysop embed is introduced.

Capture uses the authenticated read-only Tachyon routes for Torque activity,
Tether chat/catalog and manually imported saved teams. Tachyon remains a relay or
cache, not a third authoritative database. `scripts/project-console.mjs` can run
inside the authorized browser before download; `node scripts/capture-console.mjs
--projected < capture.json` validates that projection and extends the base pack.
Without `--projected`, stdin must be the raw response envelope for the projector.
Each source is bounded to 200 records. Counts, truncation, request paths, capture
times and available cache headers are retained; capture time is not source
freshness. Use `scripts/validate-console.mjs` to reject fields outside the allowed
projection before installation. The generated pack remains gitignored.

Prompts, environment, full filesystem paths, messages, action payloads, complete
team policy/authority/phase definitions and activation bindings are excluded.
No runtime stream, messaging, launch/retirement, persisted configuration writes
or assignment dispatch is implemented. Team creation previews cannot validate
runnable teams without activation bindings. Candidate kit archives and replay
patches remain local review artifacts, not registry releases.
