# Supplied fixture families and complete examples

The generated [family manifest](../frontend/src/fixtures/family-contracts.json) describes the six supplied artifacts. `make fixtures` regenerates it from the same Go generators as the JSON consumed by the app and portable stories. The Go freshness check compares artifact identity and every listed array count, then verifies validation and adapter pointers. Counts are bundled inventory, not filtered or admitted result totals.

| Family | Dataset / generator | Supplied profiles | Evidence boundary |
|---|---|---|---|
| Operations | operations/v2 / parallax/v2 | Persisted records-8 and records-80; separately selected torque-16w/parallax-v8 override | Exact recorded event prefix, or explicitly labelled full snapshot |
| Communications | communications/v1 / parallax/v3 | Declared contacts/chat review label; no persisted profile history | Independent full snapshot; metadata is unavailable before its own clock in prefix-aware evidence views |
| Administration | administration/v1 / parallax/v4 | Declared fictional directory/settings review label | Independent full snapshot; roles and permissions are metadata, not authorization |
| Observations | observations/v1 / parallax/v5 | Declared five-resource review label | Bounded resource receipts at observedAt; retrospective samples at their own exact UTC timestamps |
| Developer | developer/v1 / parallax/v6 | Declared file/graph review label | Recorded evidence at recordedAt; authored proposals remain explicitly separate |
| Voice | voice/v1 / parallax/v7 | Declared two-clip review label | Independent synthetic-media snapshot; authored timed text is not speech transcription |

Every artifact supplies seed 4421 and its own fixed reference clock, 2026-10-04T14:30:00Z. Their equal clocks do not make communication, administration or voice snapshots follow an operations cutoff. The manifest records actual coverage windows where supplied, and the developer recordedAt boundary. Presentation appearances and authored specimens are not persisted historical profiles. Administration now carries additive generator metadata; its existing v1 records and business relationships are unchanged.

The generators' existing validators own record, foreign-key, timestamp, parent-span, media and sample bounds. The accepted contract milestone (0047) closed two identity gaps: administration requires its supported generator; communications requires its supported dataset/generator versions. The metadata adapter does not replace record validation. A future compatible artifact needs an explicit manifest and adapter update rather than silently inheriting these declarations.

## Small example boundary

[ExampleDefinition](../frontend/src/examples/contracts.ts) supplies Torque's finite entry, destinations/default, primary family, projection, reset policy and scroll owners. `exampleContext` admits the exact supplied version/generator/seed/profile/reference clock and a supported family projection. Prefix admission also requires an actual known recorded boundary. Snapshot-only families refuse an attempted prefix. This is a bounded presentation contract, not a router, schema registry, ORM or transport.

The actual Torque shell and the fullscreen portable Torque composition consume this definition. Routes and reset defaults derive from it. Both display original reference clock separately from projected cutoff. The actual reviewed plugin host receives the same admitted family/profile/reference/source token alongside its existing projected counts and cutoff. Native selection admission remains in the operations model and finite route adapter: excluded records are cleared; ordinary navigation retains a currently admitted selection. One `.torque-page` owns ordinary page scroll; Runs uses the released operations page body instead; navigation and record dialogs have explicit bounded owners.

Torque About exposes the same six-family matrix with native relationship/coverage disclosures. These are documentation and inspectable records, with no fetching or business effects. Portable About mounts no Go API or plugin delivery.

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
