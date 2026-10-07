# Actionable public-export review inventory

Run `node scripts/coverage.mjs` after a standalone Storybook build to regenerate `export-inventory.json`; run `node scripts/coverage.mjs --check` to validate freshness and evidence paths/story IDs. CI runs that check after Storybook. For a read-only source catalogue audit use `node scripts/coverage.mjs --check --audit-source --source-root ../../libs/design-kit`. A public checkout requires only its installed packages and committed catalogue, not a sibling workspace or a machine-specific home path.

`coverage-policy.json` records explicit bounded review exceptions and representative family evidence. Every declaration row has a disposition, reason, next action, evidence and separate exact import evidence. An import never automatically becomes reviewed behavior. Re-export aliases/public entries are counted independently, not distinct visual designs. Classification follows React declaration symbol identity and nullable call returns/forward refs, with uppercase component names; `use*` hooks remain nonvisual. Representative visual/nonvisual/type classification guards run with the audit. Utility/type review calls for contract assertions, not invented visual stories.

- **reviewed**: named representative behavior has actual controlled page/story/check evidence; untested prop permutations remain outside that claim.
- **partial**: exact adoption/import plus family evidence exists, but this export's complete supported state/interaction review is unfinished.
- **deferred**: explicitly tracked, unadopted export with an actionable component or nonvisual contract review step.
- **unsupported**: concrete fixed-clock or permission-policy contract gap; reassess compatible controlled APIs before adoption.

The pinned catalogue records all fifteen packages at design-kit commit `dbcf4fa7f5bcfe83686d227b39ddf9426cea4fe5`. All nine actual kit packages are installed and enumerated. There is no separate kit-developer, kit-media or kit-canvas package in that catalogue: code and workflow/canvas are the actual owners. Tokens/source CSS/runtime/build tooling are supporting policies, not hundreds of visual components to fabricate stories for. The installed public declaration inventory also includes actual plugin-host-ui and design-app-runtime exports. Source and installed versions can differ intentionally for released packages; candidate versions/licenses/hashes remain documented in third_party. Catalogue membership/installed ownership and optional read-only source metadata are checked explicitly.

| Package | Visual | Types | Nonvisual/value | Reviewed | Partial | Deferred | Unsupported |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| @hollis-labs/design-components | 147 | 20 | 22 | 18 | 2 | 169 | 0 |
| @hollis-labs/kit-dashboard | 48 | 49 | 30 | 13 | 4 | 107 | 3 |
| @hollis-labs/kit-chat | 147 | 195 | 16 | 0 | 37 | 321 | 0 |
| @hollis-labs/design-bindings | 0 | 19 | 9 | 0 | 4 | 24 | 0 |
| @hollis-labs/kit-admin | 3 | 15 | 3 | 0 | 5 | 16 | 0 |
| @hollis-labs/kit-settings | 4 | 23 | 7 | 0 | 3 | 31 | 0 |
| @hollis-labs/kit-observe | 5 | 14 | 0 | 0 | 9 | 10 | 0 |
| @hollis-labs/kit-account | 6 | 12 | 0 | 0 | 6 | 12 | 0 |
| @hollis-labs/kit-code | 88 | 81 | 3 | 0 | 26 | 146 | 0 |
| @hollis-labs/kit-workflow | 12 | 11 | 1 | 0 | 9 | 15 | 0 |
| @hollis-labs/kit-voice | 42 | 46 | 2 | 0 | 26 | 62 | 2 |
| @hollis-labs/plugin-host-ui | 5 | 108 | 60 | 0 | 23 | 150 | 0 |
| @hollis-labs/design-app-runtime | 0 | 28 | 27 | 0 | 2 | 53 | 0 |

The complete machine-readable rows, not this summary, are the actionable export checklist. A deferred export has no claimed behavior evidence. Existing family stories and browser files are linked only for adopted rows, with exact declaration/import names separately retained.

Concrete deferred/gap families:

- Dashboard ActivityHeatmap/HourlyPulse/TimeSeriesChart read ambient dates and cannot preserve injected-clock/null-coverage semantics. App run-start/calendar/pulse and USD charts are labelled adaptations. Donut/Kpi/spark widgets remain separately deferred; generic composition import does not imply those exports were exercised.
- Code highlighting remains unadopted: `createCodeHighlighter` requires opt-in Shiki; review deterministic language/theme/error contracts and optional-loading before adoption. The app diff is an app-owned line composition. Remaining code subcomponents require their own bounded stories; inert ANSI output does not prove editor/execution behavior.
- Workflow graph authoring/connection/edit gestures remain deferred; the reviewed app uses immutable fixture nodes/edges, controlled selection/viewport and keyboard inspection. Remaining toolbar/node/action primitives are tracked independently.
- Voice MicSelector/useAudioDevices are unsupported under the fixture-only permission policy; nested selector preview remains deferred because of its upstream option semantics. Local AudioPlayer and timed authored transcript have actual playback/reset proof. Persona/Rive/video are not current public kit-voice exports and are future-family ideas, not missing export rows.
- Account NewTokenDisclosure remains deferred; the reviewed checkpoint uses metadata-only fixture access, never credentials, grants or auth evaluation.
- Settings/Admin/Observe/Chat/base primitives have representative stories and state checks, while each unadopted independent export remains explicitly deferred. Complete all-family state fidelity is not implied by inventory completion.

This inventory satisfies tracking rather than exhaustive implementation: broad presentation contracts/fixture families and exact Torque reference fidelity remain partial wherever recorded acceptance gaps persist. New adoption must update dispositions and concrete evidence before changing a review claim.

The eleventh bounded batch adds nine reviewed design-components dispositions (27 reviewed declarations overall, 179 exact imports). [Controlled primitives](primitives-review.md) documents actual supported appearances, native form/dialog host admission policies and representative rendered/keyboard/reset evidence. The remaining 1,120 deferred declarations still have explicit next actions; this batch does not close all independent behavior.

The twelfth bounded batch adds JsonViewer/PayloadSummary/MetaList/SearchInput (31 reviewed declarations overall; 184 exact imports). [Evidence payload inspection](evidence-review.md) points to actual app/portable state and callback proofs. JsonModal/PayloadActions/CopyButton stay deferred because the current no-clipboard review policy cannot disable their built-in effects through published props. Remaining 1,116 deferred declarations retain explicit next actions.
