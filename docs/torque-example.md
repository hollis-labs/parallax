# Torque Example shell

`/?example=torque` replaces the lab shell with one released AppShell: app navigation, a compact header, primary content and a readonly footer. Dashboard is the default; Tasks, Runs, Task and run, and About are finite routes. This is a fixture application example, not the production Torque application.

The same controlled `TorqueExample` composition feeds ten fullscreen `app-examples-torque--*` stories. Portable stories perform local navigation and admission without mounting App, a Go API, or the plugin host. The standalone application owns one instance of the existing reviewed plugin host and reuses actual admitted widget/panel/action presentation in About. Loading, errors and unload remain explicit. Typed plugin navigation opens the Usage dashboard.

## Route and evidence contracts

`routes.ts` normalizes known screen/tab/scenario/theme/mode/resource values and admits cutoff only at an existing deterministic event boundary. `selected` is a task identifier resolved to its current run graph. Initial reload, controlled navigation and popstate withhold and canonicalize selections excluded by the current prefix, query or resource. Native links have finite same-origin URLs; ordinary local clicks push history. Dashboard tab changes replace their current route while other routes preserve the chosen tab and admitted selection. Workbench launch carries current scenario, cutoff, filter, resource, selection and appearance.

About keeps the original artifact reference clock distinct from the projected review cutoff. Tasks, Runs and details use the same current projected operations model as Dashboard. Future output, receipt, task status and run finish remain governed by existing playback projection. Changing source/query/cutoff/route retires prior presentation callbacks and local intents. A fresh narrow navigation overlay cannot be closed by a captured handler from an earlier history roundtrip. Reset clears selection/query/resource overrides and returns to the source reference clock. Review controls are transient and never mutate supplied records.

## Scroll and accessibility contracts

There is exactly one viewport shell. `.torque-page` scrolls ordinary routes; Runs replaces it with Run Explorer's actual OperationsTablePage body, without nesting an outer page scroller. Desktop application navigation has its own bounded overflow for short heights. Released OverlaySidebar supplies bounded temporary navigation/review bodies, modal focus containment, Escape and focus return. Its right review sheet is 320 pixels wide, contained in the 390-pixel viewport. Released DetailDialog supplies bounded record inspection.

Native navigation, history, task search, dashboard tabs, drawer keyboard reachability, selected graph admission, StrictMode callback retirement, actual plugin widget/panel navigation, short-height bounds and all ten portable states are checked in `frontend/tests/torque-example.spec.ts`. Actual dark narrow captures and complete desktop route captures accompany the review evidence.

## Bounded adaptations

Dashboard charts remain the existing fixed-clock/null-coverage-aware adaptations. Torque reference `apps/gui/src/pages/DashboardPage.tsx` at `1f1a8c8c82e1bd4db042e63544a1470c7cdcdf01` informs composition; this checkpoint does not claim event-heatmap/stacked-series/donut parity or close broader dashboard fidelity tasks. No new independent export claims, packages or versions are introduced. Supporting imports remain covered only by their existing inventory dispositions. No execution, saving, authentication, provider, model, sending or real refresh exists.
