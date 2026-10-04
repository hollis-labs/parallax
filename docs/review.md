# Review evidence and boundaries

Commands: `make check`; `node scripts/coverage.mjs`; `npm run build-storybook --prefix frontend`; `npm exec --prefix frontend -- playwright test --config frontend/playwright.config.ts` against `make run`.

Browser tests cover coherent detail, transient business intents/reset, light mode, large-list page scroll and narrow layout. Tests use bundled fixtures and local host only. Screenshots are ignored review artifacts under `.scratch`. CSS TSX design lint and CSS variable resolution are separate checks; browser computed-style evidence confirms 24px page padding, actual themed text/background and source registration.

Public export inventory `export-inventory.json` enumerates exported runtime/type names from installed package public declaration entrypoints. Used entries are mapped explicitly; every other export is unreviewed. This is a baseline for future component-specific stories and interaction tests, not full visual coverage.

Known upstream adaptation targets:

- Released ActivityHeatmap/HourlyPulse read ambient Date without an injected clock. Parallax uses app-owned fixed-clock calendar/pulse views derived from record timestamps instead.
- Sparkbars' square cells overflow a wide eight-sample strip, hiding variation. A token-sized wrapper constrains this review example.
- Folio preset root mount produced `//`; application wiring corrects `/` and consumes Chimera.
- plugin-host-ui candidate is unpublished. Exact archive/version/digest and MIT provenance are recorded in third_party.

Remaining scope: comprehensive Storybook coverage, all independent kits, long-running scripted event playback (current control is clock preview), shell/layout comparison families, admin/account/messaging/developer/voice compositions, sandboxed-frame plugin proof, remote snapshot imports, Sigil generation and generic seeder extraction. Generic Examples drafts/settings only demonstrate transient intent behavior; they do not satisfy those kit-specific backlog tasks.

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

Go host: `github.com/hollis-labs/chimera v0.0.0-20261004204622-e8327a939965`; generator: `gofakeit/v7 v7.17.1`; Go language floor1.26.6, locally tested Go1.26.8.
