# Flux right rail candidate — CW-20261010-0085

Open `/?example=flux-rail`, or Storybook **Candidates / Flux Right Rail**.
The candidate is an additive isolated review entry; existing Chat, Messaging,
Operations and Drawers entries are linked, with their routes intact. It does not
implement the whole Flux chat application (0088).

The primary reference is authored Flux `origin/main`
`232064c3a5eaa8e8d9e270d89d78df3ca81df231`, read from this task's own Git archive.
[Provenance](flux-rail-provenance.json) records source paths, SHA256s, source trees,
exact Parallax base, current kit source and every installed byte of the used kits.
The unpublished archives already pinned by 0074 are unchanged; installed version
0.4.0 does not imply these candidate APIs are published in the registry.

Read the full [preparation](flux-fidelity-spec.md), token mapping and Tesseract
`01M4HZ9A8ED9DAWRC28MP9WWJF`. Its historical proposed sheet is superseded by
**DEC-080**, owner acceptance of all proposed defaults without edits, relayed by
PM `01a123ff-1a7d-7f2d-88b0-72f56e6dead6` and directly read by the manager, who
relayed `01a124cf-b051-7792-877c-6516b9736a9a` to this author. This confirms defaults;
it does **not** supply technical or visual approval of this new candidate.
**Owner visual approval: false / pending actual review.**

## Composition and source fidelity

The public `AppShell` owns the persistent aside, independent scrolling, compact
viewport overlay and focus restoration. The candidate never copies Flux's custom
outer `aside`. The host header carries title/settings/close and a horizontally
scrolling roving tablist. Stable IDs are `widgets`, `work` (visible **Plan**),
`workflows`, `inbox`, `artifacts`, and declared `fixture-plugin` (hidden by default).
Settings demonstrate enabled/order/default preferences; Up buttons are accessible
local ordering controls in place of source drag-and-drop.

`Widget` is controlled: icon, uppercase mono label, metadata, chevron and host-owned
open state. Session and Observability start collapsed. Composition preserves source
10px panel radius, 11px mono labels, 10px header padding using named panel/label/
spacing scales. All paints/scales use public semantic/design/Tailwind tokens.
No new theme palette, spacing literals, custom fonts or component-only values.
All ten public themes and both modes are exercised. System fallback typography is
intentional under DEC-080; this is not an Inter/JetBrains glyph fidelity claim.

Agent, Session, Context, Token Usage, Tools, Workers, Observability and Bookmarks
have finite fictional operands. Known zero uses 0 and $0.00; unknown/unavailable/
partial metrics never become a zero or a phantom progress bar. Context uses a
real zero-length progress bar rather than source Widget.Bar's minimum 2% fill.
Dashboard `Panel`, `Kpi`, `KpiGrid`, `MiniTrend` are reused where supplied samples
fit; kit-chat `Context` usage, `Plan`, and `Queue` anatomy are reused for context,
plan steps, todos and reminder/scope idioms. Nothing polls or loads a plugin bundle.

Work shows Session/Project scope, proposed plan with supplied completed/pending
steps, Todos, a fixed-time reminder and inert Send Changes. Inbox shows My/Agent
Inbox, status projection, expansion/thread/reply previews and inert Send/Resolve.
Opening a message never acknowledges delivery. Reply text stays in memory and is
retired on panel or source changes. Session details show read-only session/start/
persona/runtime/durable/checkpoint/usage facts, with absent fields explicitly
unknown. Restart/Approve/Stop/Resume/Refresh/Open artifact specimens are disabled
and labelled inert. These are bounded idioms, not complete backend-coupled ports
of InboxContent or SessionDetailsPanel.

Local `panel_signal` open/close/planning specimens retain the source dismiss and
user-ownership rules: disabled/unknown panels refuse opens; user dismissal blocks
later agent opens; manual opening reaffirms intent; agent close cannot close a
user-opened panel. Attribution/dismissal is transient and reset on source change.
No SSE or production signal subscription is registered.

## Admission, custody and persistence

Only allowlisted panel IDs, default/order/enabled settings and boolean widget open
states are persisted per declared fictional session. Reads reject bad types and
duplicates; storage denial/malformed JSON falls back to usable in-memory defaults.
No drafts, messages, envelopes, metadata, action outcomes or customer payloads are
stored. Each exposed dispatcher uses the committed lease from the public guarded
`useShortcut` result: source/access/layer replacement and React Activity effect
retirement invalidate retained callbacks permanently, including reactivation.
Mod+/ uses the kit's exact modifier, editable, IME and modal guards.

Review found two additional focus paths outside the action dispatchers. Captured
inspection focus return now checks its committed lease before reading refs,
requires matching source markers, and refuses to take focus from a new foreground
owner. The tab header moves focus and scrolls only after its host returns `true`
from selection. A native repro first established working focus/arrow callbacks,
then showed old focus return resolving a replacement heading or reviving after
Activity reactivation, and an old arrow moving focus after selection refused.
The correction keeps these callbacks retired while current controls still work.
The test captures the actual React DOM keyboard prop; production code does not
use React internals. Original failures and focused correction logs are retained.

Context and Session reuse `InspectionDialog`, with explicit initial heading focus,
admitted trigger return and heading fallback. Nested inspection menu and usage
popover mount through installed public Base UI Portal/Positioner/Popup inside the
owning dialog. Shared root/trigger/item and kit Context content remain reused.
The default shared dropdown Positioner fixes z-50 below the dialog viewport's
z-60; Popup className alone cannot resolve that. Retained failing native logs show
pointer interception. This host composition is the supported local workaround;
no private kit import or shared-repo fork/change was made. A focused upstream
portal-container/positioner composition seam is proposed below.

## Evidence and limits

Native specs live in `frontend/tests/flux-rail.spec.ts`, with an actual StrictMode /
React Activity retirement fixture in `tests/fixtures/rail-lifecycle.tsx`. They cover
roving Home/End/arrows, defaults/settings/collapse persistence, malformed layout
preferences, session isolation, known-zero/unknown/partial operands, signal dismiss,
Work scope, ephemeral Inbox reply, nested pointer/keyboard/Escape custody, admitted
focus fallback, current-positive/retained-negative actions, editable/IME/modifier
shortcuts and bounds/network rejection across themes/modes at 1280 and 390x420.
Screenshots belong to this author's browser evidence; independent source/receipt
review by the manager must be attributed separately.

Owned `.scratch/rail` retains exact Flux/kit source archives, copied read-only
Chromium/libs/fonts, raw failed and passing logs, source tar, screenshots, byte maps
and a sealed manifest. Failures remain visible; later passes do not erase them.
`docs/flux-rail-replay.py` provides a pinned fresh-source stage using retained
installed dependencies by default, or explicit fresh-install with npm ci. Tooling
prerequisites, addresses and cleanup are in its help. This recipe is a narrow
replay, not an additional broad acceptance claim. The configured GitHub workflow
continues to exercise the actual default configuration.

Live provider behavior, model execution, streaming/delivery, backend mutations,
OS IME/physical touch, real fonts, kit promotion and Flux/Tangent adoption are not
covered. Source files, packages, services, registry configuration and public tags
are untouched. A manager reviews the exact head and proof receipt; owner visual
review stays pending even after technical review or merge.

## Upstream proposal (no extraction under this task)

1. Propose controlled `open/onOpenChange` and stable accessible trigger/body linkage
   for the existing CollapsibleSection seam, after a distinct second consumer
   demonstrates the need. Flux's eight widgets and its inline/modal placements
   are one consumer under DEC-026.
2. Propose a controlled tab-host composition seam (host supplies IDs/order,
   enable/default resolution, roving navigation and local persistence policy).
   No Flux stores, provider effects, plugin loaders or panel_signal transport in
   generic components.
3. Propose public portal-container/positioner composition props for shared menu
   and popover content. This task supplies a concrete native pointer repro and a
   local public Base UI composition. Do not promote until separate consumer
   evidence, owner review and the shared package's own tests establish the seam.
4. Review positioning of the shared PlanTrigger's absolute `sr-only` label.
   Native 1280x420 geometry showed document height 428 while AppShell/root/body
   stayed 420: the label's bottom was 427.5 outside the clipped aside because its
   trigger lacked a positioned ancestor. This candidate supplies `relative` on
   the public trigger. The affected short-height check passes at both widths
   without changing its strict document bounds. No shared kit patch is included.
