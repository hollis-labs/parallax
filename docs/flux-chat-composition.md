# Flux Chat composition

CW-20261010-0088 adds `/?example=flux-chat` and `Examples/Flux Chat` portable stories. It extends `ChatExample` with an optional conversation slot and the public AppShell aside contract. The admitted session navigation, header and shell remain shared with Chat. The conversation composes the actual landed drawer, rail, navigation and card candidates; no public package pin is authored here.

The reference is Flux `232064c3a5eaa8e8d9e270d89d78df3ca81df231`, particularly ShortcutsPanel, useKeyboardShortcuts, ChatMain and useLayoutStore. Read alongside the [fidelity specification](flux-fidelity-spec.md), [token mapping](flux-fidelity/token-mapping.md) and parent proposals. Fixture seed 4421 and time 2026-10-04T14:30:00Z are fixed. No provider, model, transport or ambient clock supplies fixture outcomes.

## Composition and custody

One native kit ChatInput owns the draft. Finite slash commands and fictional @ references reuse the landed adapter. Send, stop, resume, approval and header actions are labelled inspection specimens or explicit local previews. Nothing creates a delivered message or provider receipt. Native composition updates remain editable; global shortcut admission rejects IME/229 and ordinary editable targets.

The stream retains all 18 authored wire identities and all four actual tool display modes. Backend-only `session-task` remains the landed unsupported fallback; document/report adaptations remain the parent's public bindings. The layout offers thinking and five distinct banner specimens. Loading, empty, error, denied, locked, partial and welcome states are explicit. Unknown opaque session IDs stay unavailable without substituting CHAT-001. Navigation rows relate to snapshots only through authored `companion` fields.

Layouts follow the source: focus hides left/right/chips; default shows left/chips; workspace shows both rails/chips; reading shows chips only. Standalone layout/configuration survives reload in the URL and browser history. Drawer open/height/static-tab preferences use the landed session-keyed storage; source defaults seed both closed only when no retained layout exists. Dynamic card tabs are transient and pin/close are local presentation operations. At narrow width, the original Sessions dialog is the navigation surface and public AppShell owns the sole right-rail dialog. The header Widgets control replaces the default floating aside control to keep the composer footer clear.

Source, access, appearance and fixture replacement remount the composed source. Committed action leases retire across layer/layout changes, root removal and Activity hide/show; old activations never regain authority. Focus uses a separate committed source/root lease and opening ticket. Normal close can return to an admitted trigger; newer plain, dialog and menu foreground owners keep focus. Palette commands wait for the native closing dialog to release its layer before acting, and cancellation prevents crossing a newer source/layer/root lease or newer connected plain foreground owner. Visible dialog, alertdialog, menu and listbox owners participate regardless of component-specific open markers. The native composer listbox is admitted only through its live textarea aria-controls ID and shared chat-input root; popup close, selection, command and configuration share exact current-owner admission. An unregistered nested role is a competing owner, not implicitly admitted by containment.

All themes and modes are scoped to the host and its popup. Concrete & Signal uses a scoped dark composer in both modes; other composers follow their active palette. Colors, spacing and typography use public tokens and system fallback fonts. No document theme mutation or component paint literals are introduced.

## Verified shortcut adaptation

| Binding | Composed local behavior |
|---|---|
| Mod+B | Toggle left navigation |
| Mod+/ | Open/toggle Widgets aside |
| Mod+L | Focus the admitted composer |
| Mod+N | Inspect a new-chat specimen |
| Mod+K | Command palette |
| Shift Shift | Search chats, 250ms threshold using monotonic event time |
| Mod+] / Mod+[ | Navigate finite admitted session rows |
| Mod+D | Inspect bookmark intent |
| Mod+. | Open Artifacts aside |
| Mod+backslash | Layout preset dialog |
| Mod+Shift+H | Toggle header chips |
| Escape | Native popup/menu owners handle close; admitted base editable focus moves to the host |

These defaults were read from the original ShortcutsPanel and hook. The historical task wording assigns Mod+backslash to sidebar; actual source assigns it to layout and Mod+B to sidebar. Public guarded shortcut ownership replaces the source's global editor/store handling. Double Shift uses the public guarded keydown hook with the source's 250ms threshold; it does not recreate the source's separate keyup tap-duration reducer. No extra global keyboard listeners are added.

## Evidence and boundaries

`frontend/tests/flux-chat.spec.ts` exercises the actual composition: wide/narrow/420px bounds with both drawers, palette/search/layout and native editor IME, draft preservation, resource/access/unknown-ID and history behavior, retained action/focus leases with fresh positive controls, drawer resize/persistence/card pin-close, header/menu intent and narrow aside ownership. Theme/mode, four layouts and all 18 card identities receive settled captures. `frontend/tests/flux-chat-custody.spec.ts` proves once-working real retained conversation actions refuse visible unregistered dialog/menu/listbox owners with fresh positives after close, validates owned autocomplete, waits for actual palette portal detach before assessing newer plain focus, and checks four popup producer paths behind a newer portal plus normal-close/nested-owner/fresh-close controls. Popup/rail captures wait for full opacity, completed finite native animations and stable geometry; screenshots disable animations. `flux-chat-lifecycle.html` is a served API-free Activity/foreground-owner fixture, included in the source archive.

Author browser logs, screenshots, source/archive/pin/installed/emitted seals and failed exploratory runs are retained under the owned `.scratch/evidence/CW-20261010-0088`. They are separate from manager independent source/receipt review and configured CI. The final receipt identifies exact immutable source and every materialized proof hash. Manager review corrections retain the original source/proof manifest as historical evidence; corrected custody logs and settled captures use new output directories. The generated native runner preserves its actual exit status and records cleanup of only its owned short browser temporary directory in an EXIT trap. Early dependency/browser copies are retained tooling, not fresh-install evidence; the end gate and pinned fresh-stage receipt state their own install mode explicitly.

Owner visual approval remains false. DEC080 accepts preparation defaults, not these screenshots. No extraction, registry publication, version/tag, live Flux adoption, provider operation or settings-family implementation is covered. Existing metric-card markup emits a nested p/div warning in the inherited card binding; the diagnostic log records it for follow-up without changing sibling source.
