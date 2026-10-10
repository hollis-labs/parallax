# Operations shell example — CW-20261010-0074

Open `/?example=ops-shell` or the fullscreen portable Storybook story
`Templates/Operations Shell / Run Explorer Inline`. One public AppShell holds a
generic Run Explorer main and an optional right Assistant region. The main uses
public OperationsListPage and its InspectionDialog/controlled navigation
composition. It does not use the Torque board's Operations.tsx or duplicate kit
chrome. The original Run Explorer and other examples retain their existing routes.

The manager's live task allocation records owner DEC082 receipt
`01a12409-f090-7b60-bf7c-70a1ed2acc03`, which ungated this example after 0072/0073
landed. All sixteen wider 0070 defaults are owner-confirmed per that allocation.
The older [template spec](ops-shell-template-spec.md) and
[anatomy/owner sheet](ops-shell-template-anatomy.md) describe their earlier proposal
moment. They are design context; this authored example and actual installed APIs
are the current implementation. **This example still needs owner visual review.**
Technical source completion and manager acceptance do not grant that approval.

## Fixture and composition contract

Seed **4421**, fixed reference **2026-10-04T14:30:00Z**. The model reuses the
existing generic Run Explorer fixture graph and explorerProjection. Local authored
IDs are opaque sparse strings such as `specimen:270/Ω`; both task-side and run/event
references are remapped together. One receipt is authored zero and another absent,
so Usage evidence distinguishes zero from unavailable. A long Unicode/unbroken
label and an explicitly invalid duplicate-ID source exercise bounds and rejection.
No fixture Date.now, fetch, polling, SSE, model call, transport or customer data.

ChatStream renders chronological fixture turns; the shell's body is its sole
vertical scroll owner. ChatInput is a local draft inspector. Enter reports a local
candidate without sending or appending a turn. No transport/status/delivery is
invented. Draft callbacks are fenced by source/access/layer, committed frame and
non-reused effect activation; edited inputs still update during composition.
Stories inject memory preferences. The standalone example stores only validated
aside width/collapse using the runtime's app-scoped preference key; drafts, IDs,
generation and overlay-open state are transient. Corrupt/denied storage falls back.

`aside=empty` proves an initially collapsed empty Assistant region; `aside=absent`
removes it. Fixture chat starts expanded. Review opens the public OverlaySidebar
for source, inspector mode, density and width controls. It keeps review controls
out of the short main header. Source replacement preserves authored IDs but
retires prior actions and clears drafts; access/layer revocation and remount are
retirement diagnostics exposed only by the standalone review entry's `opsShell`.
No consumer adopts these package candidates automatically.

## Behavior specification

| Context | Implemented contract / native check |
| --- | --- |
| 1280px | One viewport shell, main plus regular aside. No reserved sliver when collapsed; explicit header toggle gets admitted focus. Compact/regular/wide use kit spacing presets. |
| 390px, including 420px height | Main list/detail switches within main; Back to list stays reachable. Right chat Sheet uses its own scrolling body and pinned composer. Only one composer is mounted. All secondary run information appears below the title and wraps. Density remains available in Review. |
| Independent scroll | The public list body owns list scroll/observer; the public aside body owns transcript scroll. Moving either leaves the other offset and pinned composer unchanged. Inspector body is a sibling/modal owner, never nested in list. |
| Pane search | `/` from a focused row focuses only main search. Chat/editor/widget keys stay local. Modified/prevented/composing/keyCode229 events are vetoed. Search edits work during active composition; Escape clears once and retains search focus. |
| Cursor and inspector | Row Up/Down follows visible order. Inline and modal use public current navigation, stop boundaries and admitted close return. Popup descendants/editors and nested dialogs retain their keys; nested Escape closes only that layer. No legacy global arrow listener. |
| Projection and counts | Admitted/matched/revealed/selected remain distinct. Select-all includes only revealed rows. Query/facets/source reset selection; density/sort preserve it. First 50 and Show more are observable. Unavailable evidence withholds counts; successful empty is zero. |
| Facets | Existing generic status chips, usage cycle and owner entity control. Option counts omit their own facet; missing owner is Unspecified. No metadata joins or guessed identity. |
| Retirement | Current action/aside/draft controls work. Retained source/access/layer/remount controls cannot mutate state or steal focus, including same IDs in a replacement generation under StrictMode. |
| Native resize focus | Focused narrow popup -> desktop returns to current connected/enabled/admitted desktop trigger/fallback after modal cleanup. Source/access/layer replacement in that commit, effect retirement, ordinary blur/unmount or a competing open layer suppress return. Outside focus before resize keeps its owner. |
| Appearance | All ten actual public theme IDs, light/dark, at 1280 and 390px. Settled native screenshots cover main/chat; original palettes are retained. Synthetic IME is diagnostic; hardware OS IME and physical touch are unclaimed. |

Portable stories cover inline/modal, empty/absent aside, missing metadata,
unavailable, successful empty, long labels and duplicate identifiers. Standalone
query operands: `inspector=modal`, `scenario=<source>`, `aside=empty|absent`,
`theme=<public-id>` and `mode=light|dark`. These are finite review choices, not URLs
carrying actual customer records.

## Upstream integration correction

The original installed 0072 candidate exposed a concrete narrow-to-desktop gap:
OverlaySidebar's popup unmounted before its deferred return could run, leaving
BODY focused. Both current trigger/fallback were connected, visible, enabled and
admitted; calling the current handle's restoreFocus succeeded. Original failed
native test/probe and actual-portal unit logs are retained.

Manager messages `01a12490-dea8-778a-9200-dd7b2007df00` and
`01a12493-c679-725c-96a7-0484bd14bb4a` authorized a bounded upstream correction.
OverlaySidebar adds optional contentRef; AppShell locally observes popup focus,
returns only from a matching resize generation/activation/current committed frame,
and vetoes competing open layers. The runtime threads sourceGeneration through
additive asideSourceGeneration. Generic OverlaySidebar cleanup/unmount refusal is
preserved. Destinationless focus-out is resolved after DOM mutation, fenced by
popup/source/activation/focus epoch. Explicit blur of a connected node releases
ownership; blur and removal in one synchronous mutation remain indistinguishable
and are not claimed as independent observed blur. No Parallax widget fork or package version change.

## Package and verification receipts

Committed third_party archives and frontend/package-lock.json are exact local
candidates, **not registry-equivalent 0.4.0 releases**. Adjacent provenance records
source head/tree, source-archive SHA-256, archive SHA-256 and build command.
Replacement components/runtime source is `0652600275d14186c500e14311a1532390660501`
(tree `1fd3661dfe5473e65fa62830d43d77b2ef304d69`), based on fetched actual main
`f317ba8`; the unchanged dashboard candidate retains its original provenance.
Both affected upstream package gates passed (252 components / 60 runtime tests);
all seven focused native resize/ownership controls passed against the replacement. Owned `.scratch` retains source
archives, original and replacement package maps, every emitted/installed byte,
raw command/pass/failure logs, native screenshots and a manifest. The replay uses
its own Chromium/libraries/fonts and newly owned stage/profile, independently of
the retiring session TMPDIR. Default repository listeners are unchanged.

Manager-reserved ports: **18771 Go/app, 18772 Storybook, 18775 Vite**. Full native
acceptance remaps only local listener address literals in owned staged tests,
Workbench catalogue, embedded JS and webServer configuration. Source/test/asset
SHA maps retain those overrides; assertions and application behavior are unchanged. Record the current
exact source and results in Torque and the manager review packet. Required end gate
runs through heavytest: make check, Storybook build, native Playwright, and generated
inventory/coverage freshness. A green historical dependency receipt is not this
example's final acceptance.

## Proposed owner visual review notes

| Review operand | Concrete default to review |
| --- | --- |
| Main/aside hierarchy | Generic run list is primary; regular right fixture-chat rail is secondary. Empty Tangent adoption remains collapsed and carries no fake chat controls. |
| Mobile/short screen | Header keeps Operations shell, Review and Assistant reachable; fixture controls live in Review. Run metadata wraps beneath the title. Confirm readability at 390x420. |
| Inspector | Inline initial, modal via Review. Current public stop-boundary navigation and focus return; no domain-route adoption is implied. |
| Search/selection | Focused main pane only, clear-once search Escape, select revealed only, clear on projection/source, preserve density/sort. |
| Palette and transcript | Preserve all ten public palettes/modes; oldest-to-newest chat with latest at bottom, independent scroll, composer always reachable. |

These notes propose the rendered example for review; no acceptance checkbox or
user-approval statement is fabricated. Inbox/Channels/PM route migrations, live
APIs, metadata/delivery contract changes, Tachyon implementation, npm publication,
tags, version allocation and deployment remain outside this task.
