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
