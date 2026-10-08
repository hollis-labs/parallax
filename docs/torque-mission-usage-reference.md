# Torque Mission Control and Usage reference

CW-20261008-0050 uses the same standalone Torque example, operations/v2 parallax/v8 torque-16w source, query, admitted cutoff and selected record as Activity. The legacy lab and legacy-profile dashboard retain their existing adaptations. No provider, execution, collection or consumption-completeness claim is made.

The read-only reference is Torque commit `1f1a8c8c82e1bd4db042e63544a1470c7cdcdf01`, `apps/gui/src/pages/DashboardPage.tsx` and its run-chart, throughput, pipeline, distribution and cost wrappers. The installed kit-dashboard 0.4.0 `DonutChart` and `BarMeter` receive finite precomputed operands. `TimeSeriesChart` remains unadopted: its ambient/local-date bucket initialization and numeric-only values cannot represent this explicit fixed UTC reference and null coverage. App-owned SVG presentation consumes the same validated reference operands, without copying a shared chart implementation or adding an engine.

| Reference composition | Current composition / explicit adaptation |
| --- | --- |
| Mission main column: run chart plus distribution; token chart below; pipeline aside | Same responsive arrangement, 160px run/token charts, 120px shared donut, canonical shared pipeline rows |
| Run chart success/done, error/failed, otherwise running | Known reference aliases use the running bucket; unsupported raw values remain a separate Unknown bucket rather than an execution claim |
| Donut broader completed/canceled/timeout/queued mapping | Success/Error/Active/Other partition of all admitted matching runs; integer percentages may not total 100 |
| Task pipeline todo/doing/blocked/done | Those exact task statuses only. Included and excluded denominators plus raw task statuses are visible; queued/running/failed are not silently coerced |
| Stacked prompt/completion throughput | Input/output receipt token rectangles share the same UTC x position and contact vertically on one scale; null dates have no segments |
| Daily cost area; attribution coming soon | 140px fixed UTC linear area with gaps split into paths and known point markers; exact USD companion and unchanged unavailable provider/model attribution |
| Ambient timestamps and missing-value coercion | Original artifact UTC window, current admitted receipt timestamp, explicit Unknown/zero/partial distinctions |

Fourteen run-start dates are Sep 21–Oct 4 at original reference 2026-10-04T14:30:00Z. Receipt timestamps determine admission; receipt amounts are attributed to their linked run's start date. RUN-003 has 3,812 recorded tokens at 14:15:15 while its run is still running until 14:15:30. No run-finish gate hides that admitted receipt.

At the original clock, all admitted sample operands are 96 runs/96 receipts, 559630 input + 186593 output = 746223 tokens, USD 1.492446. The 14-day admitted sample is 23 runs/23 receipts, 136212 + 45413 = 181625 tokens, USD 0.36325. They are different denominators. Query and cutoff recompute both. Numeric USD sum companions round only floating accumulation to 12 decimal places; no formatted currency hides the supplied magnitude. Missing receipts yield partial recorded sums when any receipt exists; no receipt evidence is Unknown, while a successful empty admitted sample is known zero.

Raw full-clock tasks are 58 done, 12 blocked, 12 queued, 12 failed and 2 running. Canonical pipeline rows therefore include 70 and exclude 26 of 96. Run distribution is 70 successful, 24 error and 2 active, independently of task lifecycle. Run-volume daily mapping differs from donut mapping by design. Authored sparse appearance masks dates divisible by three as Unknown; the supplied receipt totals are separately labelled and do not change with the display mask. Future dates and unavailable resources are not zero.

The bounded exact UTC table retains all 14 date positions and offers the first admitted run per date for current read-only inspection. Other admitted runs remain available through the existing Tasks/Runs routes. Native keyboard vertical/horizontal scrolling exposes the final USD/coverage cells without scrolling the outer page sideways. Detail links use current source, appearance, page identity and effect-owned StrictMode lifetime admission; previous-tab and retired callbacks cannot inspect a fresh page. App navigation and existing bounded record details remain the same shell/lifetime.

Portable fullscreen Mission/Usage reference, empty, loading, degraded, sparse, unknown and denied stories use the same composition/model with local navigation only. Evidence is bounded to the declared chart geometry, operands, current disclosure/detail flows and responsive states; it does not claim every chart prop or exact ambient-clock pixel equivalence. Original CW-20261004-0121 closure remains a root acceptance decision.
