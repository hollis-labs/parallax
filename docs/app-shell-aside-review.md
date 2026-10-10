# Optional AppShell aside review — CW-20261010-0072

The optional public `AppShell` aside keeps desktop main content and companion content in separate bounded scroll regions. Compact, regular and wide presets reserve no space when collapsed. Below the existing breakpoint the same content uses the public `OverlaySidebar`, with pinned header/footer and a scrolling body. Existing callers that omit the aside keep their previous shell behavior.

`useAppShellAside` owns scoped width/collapse preferences and temporary overlay state. Source/access/committed-frame changes, effect retirement and unmount invalidate retained callbacks. Trigger and fallback focus targets must remain connected, visible, enabled and admitted. The host supplies admission and an explicit fallback; the shell does not infer a replacement record from DOM selectors. Overlay focus resolves after the primitive removes its modal accessibility masks.

## Actual consumer evidence

`Layouts/Aside Consumers` adopts the public API in the existing `MessagingExample` and `AdministrationExample`. Messaging composes current `ChatStream`/`ChatInput` as child content; administration supplies a read-only permission inspector. Their default examples remain unchanged when these optional props are omitted. Empty adoption is a separate collapsed specimen. Fixtures use seed 4421 and reference time 2026-10-04T14:30:00Z. The composer does not send messages or create a transport.

`frontend/tests/app-shell-aside.spec.ts` checks presets, collapse, independent scroll regions, narrow and narrow-short overlays, resize persistence and no-aside compatibility. `frontend/tests/aside-consumers.spec.ts` checks both actual idioms, retired callbacks/current controls, editable keyboard custody, nested dismissal and empty content. Its visible matrix includes all ten public themes in both modes at 1280px and 390px. Browser input events cover composition/modifier routing; hardware OS IME and touch were not performed.

## Exact local candidates

The committed `frontend/package.json` selects head-named archives in `third_party`. Each adjacent provenance file records the authored kit commit/tree and whole-archive SHA-256. These are unpublished local candidates using package version 0.4.0, not registry-equivalent 0.4.0 releases. `.scratch/verify-installed.py` compares every regular archive entry with its installed bytes, including emitted JavaScript, declarations, CSS and metadata; its per-file hashes are retained in `.scratch/installed-byte-map-current.json`.

Both author worktrees retain `.scratch` source archives, raw successful and failed logs, browser tooling, screenshots and replay configuration. The private replay uses distinct owned ports and retained Chromium/libraries/fonts; it does not change the shared Playwright defaults. Gate and native acceptance receipts are recorded in the task comments and manager review packet once complete. Historical focused passes are not final acceptance.

## Limits and follow-up

This task does not publish packages, allocate a release version, deploy a consumer, or implement the runnable operations template from CW-20261010-0074. Source merge, isolated local consumption, registry publication and deployed adoption are separate milestones. Future release preparation should include the affected design-components and design-app-runtime packages under the release owner's allocation, with the existing core-package release policy reviewed there.
