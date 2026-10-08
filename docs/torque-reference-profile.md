# Torque reference operands

The separately selected `torque-16w` source provides a bounded deterministic operand pack for the forthcoming Activity/Mission/Usage reference screens. It does not claim those existing charts now match Torque. Source reference: Torque commit `1f1a8c8c82e1bd4db042e63544a1470c7cdcdf01`, `apps/gui/src/pages/DashboardPage.tsx` and its widgets.

The standalone Torque review drawer selects Legacy operations review or Torque 16-week reference. The known `profile` URL flag survives native navigation, reload/history and context reset. The ordinary lab and its source selection remain unchanged. All original operations8/80, communications, administration, observations, developer and voice artifacts are byte-identical to checkpoint32.

Two new files are generated together:

- `operations-torque.json`: operations/v2 wire shape, generator parallax/v8, persisted profile torque-16w, seed4421, original reference2026-10-04T14:30:00Z. Its96 task/run/session/tool/trace/receipt graphs include useful historical spread, covered empty periods and current in-progress runs. A later TASK009 update moves its single effective update from Oct3 to Oct4 without changing its completed run.
- `torque-reference.json`: torque-reference/v1/parallax/v8, exact graph identity,193 task-state receipts and9 recorded run.started buffer entries. Every eligible run in its declared complete24h interval has exactly one matching start event; historical runs outside that buffer remain distinct. The installed reference buffer cap is500; this pack supports exactly96 runs and does not claim larger-buffer retention behavior. Recent results use newest-started order, deterministic ID tie-break and limit12.

The six-family manifest records the new profile's own version/generator override. Metadata admission uses original artifact reference clock, not `projectDataset.clock`, which represents the review cutoff. The actual plugin context includes the profile/sidecar source token and current admitted counts; it does not fabricate a different provider or collector.

## Fixed UTC projection

Calendar geometry is16 Sunday–Saturday columns: Jun21–Oct10 at this supplied Sunday clock. Coverage starts Jun28; earlier cells and future remaining-week dates are Unknown. Each admitted run start contributes once; each admitted task contributes only its latest task-state receipt. That effective update can move dates when a later receipt is admitted. Current covered day is partial at the cutoff.

Pulse uses the separately supplied recorded start buffer, never the historical run list. Its24 hourly intervals are anchored to the explicit Oct3 14:30→Oct4 14:30 window. Before an interval is reached it is Unknown; during it the admitted count is partial; a fully covered empty interval is0. These fixed-window operands are distinct from Torque's live SSE behavior.

The14-day chart window starts Sep21 00:00UTC and ends at the original clock. Runs are attributed to their run-start UTC date. Input/output tokens and USD use only receipts matching both `run.usageId` and `receipt.runId`, admitted at receipt time. An active run may acquire a receipt before its final outcome. No receipt means Unknown amounts; some missing receipts give partial recorded totals. A covered empty filtered day gives0. Supplied token totals are not model context occupancy. No provider/model attribution exists and none is inferred.

The sparse appearance is a labelled authored display mask: bins beginning on UTC dates divisible by3 are unavailable. This does not mutate recorded source coverage or compress missing bins. Query/resource filtering applies to the same admitted task/run graph used by record details. Blocked resources withhold aggregates; a successful empty match remains distinct from unavailable data.

## Presentation and checks

About exposes the versioned operands, native calendar/pulse/receipt disclosures and readonly recent-run navigation. Its bounded receipt table has explicit horizontal and vertical native scrolling so exact USD numeric sums remain inspectable; it is not a mobile chart. Native keyboard access reaches the current final date/amounts, recent rows and ordinary outer footer. Source/profile/query/cutoff replacement retires local callbacks; switching profile clears selection. Reset retains the chosen profile but clears query/selection/resource override and restores the original cutoff.

`internal/scenarios/torque_test.go` checks deterministic generation/artifact freshness and real identity, closed graph, missing update/start, duplicate/order, UTC/future/coverage and snapshot failures. Existing legacy suites continue unchanged. `frontend/tests/torque-reference.spec.ts` verifies single effective update, calendar geometry/future Unknown/covered0, distinct buffer, recent12 ordering, receipt-to-detail totals across admission, query/denied/sparse semantics, unsupported identity/window refusal, native profile history/reset and shared API-free portable stories. Four new reference stories reuse the actual Torque composition.

Exact Activity reference rendering remains CW-20261008-0049; Mission/Usage distributions and chart presentation remain CW-20261008-0050. Original parent fixture/reference acceptance is evaluated separately after the other whole-app milestones.
