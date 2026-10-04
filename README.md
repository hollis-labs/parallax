# Parallax

A fixture-only GUI laboratory built with Go, React, Tailwind 4, Hollis Labs design-kit and Chimera. No database, credentials, providers or external services are required at runtime.

```sh
make run
# http://127.0.0.1:18441
```

Requires Go 1.26.6+ and Node 22.12+. Dependency installation needs network access; the built binary runs independently. `make ui-dev` starts Vite with same-origin fixture/plugin proxy to the running Go host. `make fixtures` explicitly regenerates bundled JSON; `make check` validates Go, frontend and CSS contracts.

Activity, Mission Control and Usage share deterministic Go-generated 8-record and 80-record profiles, seed 4421/reference time `2026-10-04T14:30:00Z`. Named scenario controls show populated/empty/loading/error/degraded/unavailable/permission-denied/long-label/large/sparse/unknown-status examples. Clock preview advances the displayed clock only. Fixed-clock activity bins stay anchored to the dataset reference time. Scenario changes reset transient selection, drafts, intent and clock preview.

Run detail joins actual sessions/messages/tool calls/logs/traces/spans/events/usage fixtures. Selection survives ordinary view navigation and clears on scenario change. Send/Save/Stop controls terminate at a transient intent inspector; fixture business records are unchanged. Account/authentication, microphone, model, tool, provider and remote business workflows are absent.

One viewport AppShell owns layout; `.page-scroll` is the page scroll owner. DetailDialog supplies modal focus behavior. Review identifiers are shareable through URL parameters `view`, `scenario`, `theme`, `mode`, `viewport`; drafts are excluded. Review controls choose palette, light/dark mode and constrained viewport. CSS source registration imports the published design-components/dashboard source.css entries (dashboard theme also imports these). UI uses root theme attributes; simultaneous subtree themes are not assumed.

A real `ops/g1` plugin contributes summary/modal widgets, a detail panel, declarative presentation actions and a reviewed simulation handler through Chimera registry v2 delivery, digest-verified plugin-registry loading and shared plugin-host-ui rendering. The Vite provisioning plugin supplies one shared React importmap runtime. The shared action gateway admits local navigation/modal presentation and transient simulation receipts; scenario/filter context changes fence pending actions. Main-origin execution is an explicit host choice restricted to the repository's reviewed fixture bytes; this is not a third-party installation UI or sandboxed-frame implementation.

`third_party/README.md` identifies the unpublished host-ui packed candidate and digest. Other frontend dependency versions are exact in package.json/lockfile. `.folio.yaml` retains scaffold provenance; scaffold wiring was adapted for root mounting and Chimera.

`make storybook` opens controlled operations compositions and a primitive baseline; `npm run build-storybook --prefix frontend` builds it. Export coverage is an inventory, not an assertion that every component is exercised. See [review evidence and gaps](docs/review.md).

Browser review: install Chromium once with `npm exec --prefix frontend -- playwright install chromium`, then `make browser`. Linux runners also need Chromium's shared libraries; CI installs them via Playwright. Playwright starts fresh built app/Storybook hosts itself. `docs/export-inventory.json` currently inventories the two adopted public packages (design-components/dashboard); independent kits/candidate inventories remain future coverage.
