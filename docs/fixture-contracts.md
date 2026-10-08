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

The generators' existing validators own record, foreign-key, timestamp, parent-span, media and sample bounds. This checkpoint closes two identity gaps: administration requires its supported generator; communications requires its supported dataset/generator versions. The metadata adapter does not replace record validation. A future compatible artifact needs an explicit manifest and adapter update rather than silently inheriting these declarations.

## Small example boundary

[ExampleDefinition](../frontend/src/examples/contracts.ts) supplies Torque's finite entry, destinations/default, primary family, projection, reset policy and scroll owners. `exampleContext` admits the exact supplied version/generator/seed/profile/reference clock and a supported family projection. Prefix admission also requires an actual known recorded boundary. Snapshot-only families refuse an attempted prefix. This is a bounded presentation contract, not a router, schema registry, ORM or transport.

The actual Torque shell and the fullscreen portable Torque composition consume this definition. Routes and reset defaults derive from it. Both display original reference clock separately from projected cutoff. The actual reviewed plugin host receives the same admitted family/profile/reference/source token alongside its existing projected counts and cutoff. Native selection admission remains in the operations model and finite route adapter: excluded records are cleared; ordinary navigation retains a currently admitted selection. One `.torque-page` owns ordinary page scroll; Runs uses the released operations page body instead; navigation and record dialogs have explicit bounded owners.

Torque About exposes the same six-family matrix with native relationship/coverage disclosures. These are documentation and inspectable records, with no fetching or business effects. Portable About mounts no Go API or plugin delivery.

## Concrete remaining fixture work (0119)

- The separately versioned [Torque reference pack](torque-reference-profile.md) supplies effective task updates, a recorded start buffer and explicit coverage. The [Activity reference](torque-activity-reference.md) consumes those operands; Mission/Usage rendering remains CW-20261008-0050; current records-8/80 remain unchanged review packs.
- CW-20261008-0051: a coherent whole-chat session/history pack, including timestamped communication metadata if prefix reconstruction is needed. Current manual stream chunks are authored previews, not committed history.
- CW-20261008-0053/0054/0055: complete messages, administration and developer workspace compositions using declared family boundaries; app screens do not create saved preferences, provider connections, authentication decisions, execution or repository history.
- No generic workflow executor, developer backend, voice capture, real speech/video, provider attribution or live observation collector is supplied. Current readonly graphs/files/media and resource appearances explicitly cover presentation only.

Parent 0116/0119 acceptance remains a separate task decision. This child provides six actual family contracts and a consumed example boundary; it does not claim that every planned record family or whole application has been delivered.

Validation: `internal/scenarios/families_test.go` checks generation/artifact/count/pointer freshness. Existing family suites continue to validate real joins and bounds. `frontend/tests/example-contracts.spec.ts` checks incompatible identities/profiles/projected clocks/unknown boundaries, unsupported snapshot-to-prefix requests, actual About at a prefix, responsive matrix and API-free portable consumption. Existing Torque native route/reload/back/selection/plugin tests remain in the full suite.
