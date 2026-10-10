# Flux navigation, header and layout candidate

CW-20261010-0086 provides an optional local candidate at `/examples/chat?navigation=flux` and `Candidates/Flux Navigation` stories. The original Chat route keeps its grouped searchable session list. `ChatExample` accepts optional navigation/header render slots and a layout class; `Standalone` selects the candidate explicitly. No main entry or shared kit is changed.

## Source and adaptation

The primary reference is Flux commit `232064c3a5eaa8e8d9e270d89d78df3ca81df231`, tree `3a530e6a64921d3f8b132bab3ea0d1d5d66c26ee`: LeftSidebar, LeftRail, ScopeSelector, ChatHeader, LayoutMenu, sidebar-session and useLayoutStore. Read alongside the reviewed [fidelity specification](flux-fidelity-spec.md) and [token mapping](flux-fidelity/token-mapping.md). Source behavior is evidence; downstream keyboard and narrow-layout improvements are deliberate adaptations.

The fixture seed is 4421 and authored time is 2026-10-04T14:30:00Z. Eight explicit session rows cover API/CLI/durable kinds and idle/online/working/pending/failed/halted/stopped/archived activity. These are authored states, rather than a claim to recreate the source backend status reducer. Existing snapshot references are explicit `companion` fields, not metadata joins inferred from opaque IDs. Rows without a companion show the existing authored empty transcript. Counts and time labels use fixed operands, with no ambient clock or live request.

The tree preserves pinned ancestry, missing-parent roots and a visual depth cap of two. Search filters the authored rows; missing filtered ancestors remain truthful roots. Arrow keys rove without selecting, Enter/Space selects, Left/Right collapse/expand, F2 opens rename inspection and Shift+F10 opens the context menu. Hover actions, archive reveal, scope selection, skeleton, empty, unavailable, denied and locked states have separate specimens.

New chat, workspace, rename, pin, archive, hide, delete, settings, user, plugin and header actions inspect fictional local intents. Delete uses an alert with initial focus on Cancel. No action mutates snapshots, sends transport, starts a model or operates a provider. Review drafts stay under the original Chat editor's custody: search preserves drafts; selecting a distinct source or scope retires the old editor.

## Layout and admission contract

`model.ts` exports `Preset`, `presets`, `LayoutPreference`, `parseLayout`, `layoutKey` and `layoutStorage`. The four mappings match source: focus hides left/right/chips; default shows left/chips; workspace shows left/right/chips; reading shows chips alone. Version 1 preferences accept only these exact preset names. Standalone uses existing scoped browser storage; stories use memory storage. Malformed, unknown-version and unavailable storage fall back to default. Settings can consume this contract through its own controlled presentation, without editing the Chat host.

All candidate effects require a connected committed root, current source, access and layer/effect generation. Retained callbacks retire after selection, scope, filter, fixture replacement, access changes, overlay transitions and unmount. Each effect activation is admitted once: cleanup permanently retires its frame; StrictMode/Activity replay schedules a fresh rendered/committed handle. Modal return focus uses a separate source/root activation and captured opening ticket, permits normal close, refuses later modal/menu ownership, and respects a newer visible foreground focus owner inside or outside the candidate. The optional `lifecycle=replay` host supplies native Activity hide/show controls for this proof. Public guarded shortcut and focus APIs remain the base. Candidate shortcuts are Mod+\\ for layout, Mod+N for an inert new-chat specimen and Mod+K for desktop search; the broader source shortcut catalog remains outside this candidate.

All published theme names and light/dark modes are available. Colors and spacing derive from kit tokens. At narrow widths the original Sessions dialog provides one accessible navigation surface; at 420px height its tree remains scrollable and its footer reachable. Layout previews are local presentation specimens, not a full Flux rebuild.

## Verification and upstream proposal

`frontend/tests/flux-navigation.spec.ts` covers real tree/context-menu keyboard interaction, inert action boundaries, radio keyboard selection, storage failures, draft preservation, shortcut editable/IME/modifier/overlay rejection, once-working retained action/focus refusal after Activity replay with fresh positive controls, native normal-close and competing foreground focus return, all real themes, and 1280/390 widths at normal and 420px heights. Screenshots and raw failed/pass logs are retained in the task's owned `.scratch`; author browser evidence is distinct from independent source review.

The additive Chat slots are the bounded local proposal. A reusable tree/session navigation or header/layout host must wait for a genuinely distinct second consumer and DEC026 review. Two placements of this Flux candidate do not establish that gate. No kit extraction or publication is proposed in this change.

Chrispian accepted the preparation defaults through receipt `01a123ff-1a7d-7f2d-88b0-72f56e6dead6` and DEC080. This is relayed default acceptance, not visual approval of these candidate screenshots. Owner visual acceptance remains pending. Right-rail modules (0085), cards/composer (0087), full composition (0088), settings (0094), registry publication and live Flux adoption remain separate work.
