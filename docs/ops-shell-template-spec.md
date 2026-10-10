# Shell and operations-list template specification

CW-20261010-0070 · EP-20261010-0005 · **proposal for owner review in Parallax**.

This document and the [Storybook-ready anatomy](ops-shell-template-anatomy.md)
are the reviewable design deliverable. They do not implement or release an API.
Owner acceptance is required before downstream template kit implementation.
Independent technical review, a merged document, and green checks are separate
from owner acceptance. The runnable review example belongs to CW-20261010-0074;
route specimens belong to -0076/-0077. No kit or Tangent code changes under -0070.

## Evidence and authority

Primary Parallax source was read in an owned worktree from fetched `origin/main`
at `22c674798e91e46d70ca2ad00356fb7a0fc28e75`. Tangent source was read with
`git show origin/main:<path>` at `d31c5c25d967b44b4de209e9419525d406527e3d`,
not from its stale working files or deployed assets. Design-kit base files were
read at `dbcf4fa7f5bcfe83686d227b39ddf9426cea4fe5`; extraction source was also
read, without edits, in the -0036 worktree at
`62c066cfe6a6547969e85745d969929240e3dcb6`.

| Primary source | Finding that affects this proposal |
| --- | --- |
| design-components `layout/app-shell.tsx`, `overlay-sidebar.tsx` | AppShell has nav/header/children, no persistent aside. OverlaySidebar is a controlled Sheet with trigger, title/description, header/body/footer; Sheet owns modal focus. It has no breakpoint/store/width API. |
| kit-dashboard `layout/operations-table-page.tsx`, `filter-bar/filter-bar.tsx` | Generic table composition threads a page scroll ref to its observer. Facets are currently a children slot; no facet registry, inspector mode or slash arbitration prop. |
| kit-dashboard `data-table/data-table.tsx` | Compact/comfortable, stable IDs, sort, reveal, selection and visible-order callback exist. Reveal resets on items/sort/pageSize; selected IDs persist across items changes. |
| design-components `search-input.tsx` | Slash already guards modifiers, prevented events and editable focus. IME, multiple lists, panes and overlays still require orchestration. Escape clears and blurs today. |
| runtime `lib/list-cursor.ts`, dashboard `hooks/use-arrow-nav.ts` | Cursor save/read/clear uses session storage; neighbors stop at ends. Legacy arrows install a window listener; not equivalent to the new guarded popup adapter. |
| Parallax `examples/torque/Operations.tsx` | Hand-built Torque vocabulary, admission/projections, dense rows, filter band and incremental reveal; not OperationsTablePage. |
| Parallax `run-explorer/Explorer.tsx`, `model.ts` | Generic table/facets with admitted/matched/revealed/checked counts; source/filter keys remount state. Inspector currently **modal DetailDialog**, not inline. |
| Parallax `examples/messaging/*`, `examples/administration/*`, `administration/Admin.tsx` | Existing fixture-only conversation and independent administration examples, bounded overlays and source/lifetime guards; reuse rather than add competing examples. |
| Tangent `routes/Inbox.tsx`, `InboxItemBody.tsx`, `lib/inbox-api.ts` | Inline list/detail, URL filters, oldest-first default, kind-specific bodies/actions. Unified metadata is opaque and optional, not universal project/workstream/session fields. |
| Tangent `routes/ChannelPane.tsx`, `lib/channel-api.ts` | Agent-opened channels, unread/needs-input badges, inline conversation, local drafts and existing delivery vocabulary. No operator create-channel action. |
| Tangent `lib/turns-api.ts`, ADR 0013/0014 | Frozen annotated 1.0–1.2, trace/origin/reply contracts; opt-in assistant plugin, no core agent/conversation ownership. |

The reviewed -0068 successor is Tesseract item `01M4HTGTF4P3PRRGKZV40NFMJQ`,
immutable revision `01M4HTJR9W53YC5Y9G5M06FQFH`; durable handoff
`01M4HTKFC4DFF65YTY0MY960WW`, version `01M4HTKFC4DFF65YTY0Q1BTEDB`.
The shared architecture draft is item `01M4HQESVP18BWT04MFTR77K16`, version
`01M4HTHCCXD8THSDFSQ3AQHD9K` (a version token, not an item ID).
Planner handoffs `01M4HQKQGRYC98P1HM48A28WS4` and
`01M4HR38D2BWASTS5FQ8WF01X1` were read as planning context after the task.
Their stale source claims are superseded by the primary findings above and -0068.

**Later tracker relay read:** Portfolio Manager copied WS-tangent-gui,
WS-parallax-recreations next_step, DEC-026/071/072/073 and RK-024/050 into
workspace item `01M4HV1FTKSY20B9RKVPNY683E`, exact version
`01M4HV1FTMXKF6GV98JRG4WBR2`; this task independently read that body.
The underlying tracker remains authoritative; this is a PM-copied snapshot,
with WS-parallax-recreations next_step explicitly abridged. The earlier -0068
missing-relay receipt remains historical, not a current unresolved gap.
DEC-072 establishes design-kit/runtime/Folio, optional aside/data-agnostic
ops-list, no new kit, and inline Inbox/Channels versus modal PM. DEC-071 B
requires public exact-byte/CSP-compatible plugin-host-ui first. DEC-073 approves
propose-then-confirm for recreation questions, not proposed UI defaults here;
the manager applies the same default-first review discipline to this proposal.
Original PM authority `01a1238d-ac9e-7ca8-adbb-6ef9d93519be` and manager defaults
`01a123aa-4f71-7271-8fea-adfe22128aaf` were read via verbatim relays
`01a123ae-bafd-796c-9c11-55558e4b2f18` / `01a123ae-c6cd-765a-a816-c387acaf98bc`.
Direct reads under this agent identity were forbidden; no other identity was
claimed. Manager defaults remain awaiting owner confirmation. No guessed
metadata joins appear here. Portfolio Manager's
current DOM implementation was not located/read in this task; PM route details
below are a proposal grounded in the planner handoff, not a fidelity claim.

### Extraction receipts: reuse, not duplication

Observed GitHub state on 2026-10-10: [design-kit PR 101](https://github.com/hollis-labs/design-kit/pull/101)
merged as `37fcb187ffcfe886b39e941fd16e0f3fe1d0d17d` from reviewed
`f90f113f8420f3e9ff6b0853b58baeab7effdf20`.
[PR 102](https://github.com/hollis-labs/design-kit/pull/102) subsequently merged
at `1dc83f98098a93ecf300dc5b3999bfe542efc7a7` (02:41:10Z), from reviewed
`62c066cfe6a6547969e85745d969929240e3dcb6`, tree
`d1e6241b9fb735ccce3b627bf913515574e72c61` (GitHub state re-read by this task).
[Parallax chrome PR 5](https://github.com/hollis-labs/parallax/pull/5) was open at
`8a8c8c4cd3f286148fbad7b2db5f0678a41febb1`. Re-derive delivery before adoption.

* -0035: public-root `InspectionDialog` / `InspectionDialogProps`, separate from
  legacy DetailDialog. Controlled `open`, `onOpenChange`, `title`, `meta`,
  `navigation`, `navigationLabel`, `footer`, `children`, `titleProps`, `bodyProps`;
  remaining popup props include forwarded ref/focus/key/composition props.
  One bounded scrolling body; header/navigation/footer remain pinned.
  No source admission, ordering, actions or focus-return eligibility inside it.
* -0036: public-root `useControlledRecordNavigation({ orderedIds, selectedId,
  active, accessible, sourceGeneration, boundaryPolicy: 'wrap' | 'stop', onSelect })`.
  IDs are readonly opaque strings; generation is `unknown`. Returns zero-based
  `position` (-1 if absent), `availability: { previous, next }`,
  `navigate(-1 | 1): boolean`, and `popupHandlers` containing bubble `onKeyDown`
  and composition start/end capture. Spread handlers on the actual popup root;
  compose rather than overwrite caller handlers. Inline consumers may omit them.
  Retired callbacks cannot navigate; caller owns admission, routes/history/focus.

Author receipts: Tether `01a123ac-f864-7858-9726-1bf5c34a9c0f` (-0036) and
`01a123ad-4d29-7343-8997-402d3a2d5d31` (-0035). -0035 review receipt
`01a123a7-cd7a-747c-9b87-77e928c9cbc9`; -0036 combined candidate review
`01a123ac-6aa1-779e-9835-ef4a43816bcf`, combined 194-file pack SHA256
`70245a92dc01fdee25546a567105c50d7dd85a0ae53d5559b4da8d58c99b7ccd`.
These are source/local candidate receipts, **not published 0.4.0 APIs**.
Future consumers require actual merged source, exact pack/release and their own
consumption receipt. -0073 owns registry/projection/reveal/selection/inline
orchestration; it must not reimplement either narrow extraction.

## 1. Shell geometry and state — proposed defaults

Established direction: one viewport AppShell, route-defined main area and
optional persistent **right** chat aside. Inbox/Channels split list/detail inside
main; PM uses a modal. Never three equal columns. Tangent initially adopts an
**empty collapsible region**; real assistant content waits for opt-in host/plugin
delivery (-0064/-0104 and chat prerequisites), not a placeholder agent transport.

Proposed extension, not current API:

```tsx
<AppShell nav={nav} header={header}
  aside={optionalContent} asideLabel="Assistant"
  asideWidth="regular" asideCollapsed={collapsed}
  onAsideCollapsedChange={setCollapsed}>
  {routeContent}
</AppShell>
```

`aside` omitted means no region or toggle. An explicitly supplied empty region
reserves geometry and has an accessible toggle; no chat controls or plugin data.
`asideWidth: 'compact' | 'regular' | 'wide'` and collapsed state are controlled.
No transport, localStorage or media-query listener is embedded in the slot API.
The host owns persistence and temporary narrow-screen open state.

| Choice | Proposed default and rationale |
| --- | --- |
| Width | Compact/regular/wide map to existing spacing-scale utilities `w-80`/`w-96`/`w-112`, regular default. Bounded presets avoid arbitrary drag sizes and give long chat text room; verify these exact utilities in the consuming theme. |
| Collapse | Desktop aside initially collapsed for the empty Tangent adoption; fixture chat story can start expanded. Keep a labelled toggle in pinned shell chrome, `aria-expanded` and `aria-controls`; do not reserve an empty sliver when collapsed. |
| Persistence | Host `createScopedStorage` preference key `ops-shell:aside:v1`, local area, containing only validated preset/collapsed state. App namespace scopes it. Storage denied/malformed uses defaults; never persist drafts, IDs or overlay-open state here. Stories use an injected memory store. |
| Narrow threshold | Existing `lg` breakpoint is the starting default for persistent aside; below it use a right OverlaySidebar. Decide from actual available main width, including nav, not three equal fractions. Main inline inspector adapts independently at existing `md`. |
| 390px | Main fills available width; header/facets/footer wrap. List and inline detail become one main pane with Back to list. Chat appears only through its modal toggle. Sheet stays bounded by viewport; no page horizontal overflow. Secondary cells may move to row metadata with accessible labels. |
| Resize while open | Same logical aside content/draft, exactly one mounted copy. Switching persistent→overlay closes temporary overlay and focuses visible toggle if focus was inside; reverse switch restores desktop preference without changing it. Resize is not a persisted collapse action. |
| Empty region | Label it as Assistant region in review chrome; leave body empty. Collapse is available. No fake Send/online state. It proves shell geometry independently of plugin loading. |

### Scroll owners

Shell/document never scroll (`h-dvh`, overflow containment, `min-h-0/min-w-0`
through every flex link, runtime shell-reset opt-in). Header/filter/count/footer
chrome is pinned. Main has one primary page/list body scroller; chat has its own
transcript scroller and pinned composer. Scrolling either never moves the other.
Do not wrap OperationsTablePage in another page-scroll container: its
ListPageLayout body is the observer root.

For inline list/detail, main's bounded list and detail bodies are sibling scroll
regions, never nested vertical owners. This route-specific detail scroller is in
addition to the two shell domains; “two owners” does not force a long inspector
into the list. Each region is named, and only keyboard-reachable where needed.
At narrow width only the active main pane is mounted/interactive. OverlaySidebar
already scrolls its body: use that body as the narrow aside transcript owner,
with composer in its footer, rather than nest another full-height transcript
scroller. InspectionDialog similarly owns the sole modal body scroller.

## 2. Generic ops-list contract — proposed, not shipped

The generic component deals in admitted records and presentation state. A host
adapter authenticates/admit sources, builds optional metadata, supplies route
URLs, persists authorized view preferences and executes actions. No Torque
statuses, sessions, approvals, fetches, joins or business mutations in the kit.

```ts
type Facet =
  | { id: string; kind: 'chips'; label: string;
      options: readonly { value: string; label: string; count?: number }[];
      value: readonly string[]; onChange(next: readonly string[]): void }
  | { id: string; kind: 'cycle'; label: string;
      options: readonly [{ value: string; label: string },
        ...{ value: string; label: string }[]];
      value: string; onChange(next: string): void }
  | { id: string; kind: 'entity'; label: string; allLabel: string;
      options: readonly { id: string; name: string; count?: number }[];
      value: string | null; onChange(next: string | null): void }

// Review sketch; names/shapes require -0073 API review.
type OperationsListInput<T> = {
  sourceKey: string; sourceGeneration: unknown; accessible: boolean;
  admittedItems: readonly T[]; matchedItems: readonly T[];
  getRowId(item: T): string; columns: readonly ColumnDef<T>[];
  density: 'compact' | 'comfortable'; facets: readonly Facet[];
  query: string; onQueryChange(next: string): void;
  selection: readonly string[]; onSelectionChange(next: readonly string[]): void;
  inspector: { mode: 'modal' | 'inline'; selectedId: string | null;
    onSelect(id: string | null): void; renderBody(item: T): ReactNode;
    header?: ReactNode; footer?: ReactNode; boundaryPolicy: 'stop' | 'wrap' };
  revealSize?: number; onRevealedOrderChange?(ids: readonly string[]): void;
  loading?: boolean; errorState?: ReactNode; emptyState?: ReactNode;
}
```

Existing PageHeader/summary/headerActions/tabs/filterActions/footer/rowAriaLabel
slots continue conceptually. The final implementation should extend the existing
OperationsTablePage composition rather than create a competing page framework.
`ColumnDef`, `SortState` and `TableDensity` keep their actual package contracts;
the readonly sketch above does not assert those APIs accept readonly arrays now.

### Facet registry and rows

Registry order is display order; stable unique IDs scope data hooks. Chips
multi-select (OR within group); groups combine with AND. Cycle is a nonempty
finite sequence; entity is single-select with null meaning All. Host supplies
match predicate/projection, permitted values and optional counts, not generic
record field paths. Invalid selections are surfaced/reset by the host; no
silent reinterpretation of an unknown ID as All. Existing chip/cycle/entity
controls render the registry; extend their seams only where proven necessary.

Count policy: facet option counts are self-excluding matches (apply query and
other facets, omit this facet), labelled as such; if unavailable omit the count.
Disabled zero-count choices remain readable; selected zero-match choices remain
clearable. No create-entity control unless the caller explicitly supplies one.
Facet expansion is presentation state. Compact is the default density; rows
have title/secondary metadata plus aligned status/time/IDs, not generic cards.
Column sort has a stable ID tie-breaker and explicit null placement; unknown
values remain labelled. Density changes preserve admitted selection and order.
Selection checkbox, row open and embedded actions have separate event ownership;
Enter/Space opens a focused row, never an embedded checkbox/link/button.

### Projection, counts and reveal

Apply **source admission → match query/facets → stable sort → reveal window**.
Validate IDs as unique and opaque before interaction; duplicate/invalid IDs
produce an explicit unavailable/error presentation rather than alias records.

* Admitted: host-accessible records in the current source/cutoff, before filters.
* Matched: admitted records after query/facets, before windowing.
* Revealed: actual rendered sorted prefix reported by the table.
* Selected: explicit checked IDs within that current matched set; inspector
  selection is separate and labelled “open record”, not “checked”.

Unknown/loading/error/denied counts are withheld, not zero. Successful empty is
zero. Counts announce a settled projection through a polite status region,
without reading the entire list after every keystroke. Select all selects only
revealed rows and says so. Incremental reveal defaults to 50 with a bounded
“Show more” button as keyboard fallback to the sentinel; it performs no fetch.
Observer roots on main list body; newly revealed IDs append to the cursor.

Source generation changes (scenario/cutoff/access/adapter snapshot/reset) retire
checked/open selection, reveal/cursor, pending callbacks and delayed focus
restoration synchronously before new actions. Reusing IDs does not revive old
callbacks. A generation is host-controlled, not merely a string ID list hash.
For query/facet changes, default clear checked selection, return reveal to first
window, and close an inspector excluded by the new match set. Sort preserves
checked IDs, resets reveal and recomputes cursor; an open ID outside the revealed
window closes by default. Keep focus on the originating filter/sort control.
Immutable stable projections prevent unrelated rerenders resetting the window.

### Inspector and cursor

Modal uses **InspectionDialog**, once actual delivery/consumption is verified;
inline uses existing bounded detail layout, not another dialog primitive.
Host renders title/meta/body/action footer. Ordinary record navigation preserves
inspector chrome, but resets record-local draft/body scroll as the host chooses.
Missing/admission-retired record immediately disables actions and closes or
shows an explicit unavailable pane; never fall through to another record.

Capture the actual **revealed sorted order** and filter/view state with
`createListCursor<F>(routeScopedKey).save(ids, filter)`. Validate any restored
IDs/filter against current source before use; session storage is navigation
convenience, not admission evidence. Clear on source retirement. Cursor order
must match what the user saw, not underlying fixture order or all unrevealed
matches. Show position/total and discoverable Previous/Next buttons.

Use -0036's controlled adapter for popup arrows; default stop boundaries,
explicit wrap only for an accepted route idiom such as Torque. Inline detail
uses buttons by default. Legacy `useArrowNav` remains for legacy consumers and
must be disabled while a guarded popup is active; never bind both to one record
surface. It supplies no source/lifetime fence on its own.

## 3. Keyboard, focus and overlay ownership

One host arbiter tracks the most recently focused pane and active top overlay.
No global search winner inferred from DOM mounting order. SearchInput's existing
editable guard is retained; new composition disables its default global listener
and exposes a narrow search focus seam through FilterBar/OperationsTablePage.
That seam is **proposed**; current FilterBar cannot pass `slashToFocus` through.
No listener interception hack is presented as a shipped fix.

| Context | Key/focus policy |
| --- | --- |
| Main list focused, no overlay/editor/composition | `/` focuses that list's search only; modifiers, prevented events, native `isComposing`, keyCode 229 and active composition veto it. No pane focus yet means no shortcut; toggle/search stays discoverable. |
| Chat composer, inline reply editor, editable descendant | Literal slash/arrow/Enter belong to the editor. IME Enter never submits. Shift+Enter newline; ordinary Enter follows the explicit composer contract. |
| Combobox/menu/tablist/slider/listbox/button/link | Widget retains its native keys; no record arrows or background slash. Respect both event target ancestry and consumed events. |
| Modal inspection | -0036 bubble popupHandlers arbitrate arrows after descendants. Top nested overlay wins; visible competing overlays veto navigation. No background list/chat key action. |
| Inline inspector | Previous/Next buttons; no window arrow listener by default. Main search remains pane-local; inspector comment editor excludes search. |
| Escape | Top Sheet/dialog/menu closes through its existing primitive. With no overlay, nonempty focused search clears once and retains focus (proposed change from current clear+blur); empty search Escape returns to current row/list fallback. No second action from the same key. |
| Close/collapse/source change | Return to connected, visible, enabled, current-source trigger; otherwise visible pane heading/search. Never focus an old row or a hidden desktop toggle. Cancel pending restore when another overlay/source opens. |

Opening Sheet traps focus and makes the background inert through existing Sheet
semantics. Persistent aside is a named complementary region and does not trap
focus. Tab follows document order: nav/header, main controls/results/detail,
aside controls/transcript/composer. No custom cross-pane arrow navigation.
Initial focus on a modal is a named title/body control, not an accidental action;
approval/deny never auto-activates. Footer wraps at 390px and stays visible when
body scrolls. Short-height composition must keep Close and actions reachable.

## 4. Route compositions and frozen contracts

| Route | Main content and inspector | Right aside |
| --- | --- | --- |
| Inbox | Ops rows, category/read/status/tags facets, newest-first; inline detail with kind renderer and pinned action footer. Narrow Back to list. | Optional empty region initially; later opt-in assistant, not the selected item's reply editor. |
| Channels | Channel rows (title/last message/unread/needs input); inline channel history, explicit needs-input links and pinned channel composer. | Same independent assistant region; channel conversation stays in main. |
| Tether↔Tangent messages | Channel-scoped history by default; actionable Inbox projection links back to authoritative source using supplied locators. Notice/status retain original kind labels. | Optional assistant, never a second copy of channel transport. |
| Portfolio Manager | Generic ops rows with caller-defined entity type/status/project/workstream facets; record detail modal. Relationships/IDs are fixture-authored; write controls only inspect local intent. | Same shell region, no embedded tracker agent. |

Newest-first defaults apply to lists and record history (created/updated field
named by adapter, UTC plus stable ID tie-breaker). **Proposed exception:** active
channel/chat transcript stays oldest→newest top-to-bottom so the composer follows
the latest message; owner confirms this interpretation of “newest everywhere”.
No auto-scroll when reading older history; a labelled jump-to-latest affordance.
Channels remain agent-opened; creating/muting/archiving channels is not inferred
from the new template. Existing channel delivery states queued/awaiting-peer/
accepted-by-peer remain distinct from turn reply-delivery states.

### Owner Inbox source list: CW-20261009-0115

| Requirement | Proposed presentation / dependency |
| --- | --- |
| Approval/draft/doc tags | Distinguish system kind/type badges from participant tags; original kind remains visible. “Draft” appears only when supplied, not inferred from unresolved state. |
| Read/unread and approved/pending/status | Independent read badge and lifecycle label in each left list row. Preserve original terminal state; approved is shown only from an actual approval resolution, not all resolved records. |
| Dismiss current / all | Current action requires eligible kind/revision. Bulk defaults to current matched, eligible non-pending-approval records, explicit confirmation naming count/exclusions; no implicit approve/deny/delete. Unsupported kinds show a reason. |
| Comment on any kind | Common comment affordance, independent of approval resolution/reply delivery. Fixture shows unsupported/read-only state too. Universal comment persistence/identity needs an additive owning contract; do not disguise a comment as a turn reply. |
| Newest first | Named UTC field descending with stable ID tie-breaker; preserve URL filter/sort state and explicitly offer oldest-first. |
| User tagging for docs | Proposed participant-scoped tags keyed to authoritative document ID; shared/team tagging remains an owner choice and needs identity/server custody. Fixture-only local demonstration does not promise persistence. |
| Fixed approve/deny footer | Inline detail flex body scroller with sibling pinned footer; footer contains exact kind-supported actions, busy/error/revision refusal, not a generic Approve on all kinds. -0071 owns implementation. |
| Copy share URLs/IDs | Explicit button, exact supplied canonical locator, accessible copied/failure result. Fixture locators remain fictional; no guessed live URL, credentials or automatic clipboard writes. |
| Status in left sidebar | Per-row textual lifecycle plus read state; status may be additionally filtered. Colour is supplementary. |
| Project/workstream/Tether session filters | Kind-aware display-only metadata adapters below; include Unspecified and conflict state. No fake universal schema or hidden joins. |
| Approve contrast | Existing semantic Button token pair (primary/primary-fg, verify actual exported names in implementation); retain theme/authored foreground policy. Measure enabled text ≥4.5:1, control/focus indicator ≥3:1 in all supported modes. No literal white/palette override. -0071/-0069 own correction. |
| Duplicate waiting copy | Source fix already landed at `5665f5d778fa09aa313981906fc69fe72cd9b2e3`; no new source deletion. Only revisit on exact observed URL/build evidence; deployed assets were not inspected here. |

Read/dismiss are **not uniformly missing**: documents already have mark-read/
archive APIs; turns already have dismiss. Generalizing them across all kinds,
bulk actions and participant tags/comments needs explicit contract work. The
template accepts capability flags/reasons; it must not manufacture availability.

### Metadata normalization and wire preservation

Unified Inbox's interaction carries request_snapshot, caller/state/timestamps
and optional legacy room/envelope IDs. HITL correlations can optionally name
authority-qualified project/task/session; no universal first-class workstream.
Turns optionally carry `session_id`, opaque correlations and
`source_message.attribution.project_id/workstream_id/launch_id`. Document
correlations are optional/opaque. A `launch_id`, `room_id` or turn session is
never relabelled “Tether session”. Normalize only explicitly known per-kind
paths with source field, authority and confidence visible. Missing is
Unspecified; disagreement is Conflict, without arbitrarily choosing a winner.
Unsupported metadata filters state why; available fields do not imply all items
have them. No inferred joins through display names or common string IDs.

Frozen annotated contracts **1.0–1.2**, annotations and `stage_trace` retain
meaning/order/version labels. Preserve `source_message.origin` routed versus
publication and exact sender/channel/message attribution. Publication remains
nonreplyable. Resolution accepted, queued, delivered and acknowledged are
separate; retries retain existing expected-version/action-ID/interrupt gates.
No wire/producer edits, envelope digest edits or new notice/status kinds here.
Rendering a fixture “accepted” must never claim real delivery.

## 5. Reuse boundaries, tokens and themes

Extract generic geometry/filter registry/table projection orchestration into
existing design-components/kit-dashboard only after owner review and -0074
proof. Torque adapter retains status vocabulary, source graph/cutoff, filters,
menus, task/run links and business intent. Reuse dense visual anatomy and
rowInteractiveProps semantics; do not move Torque's domain CSS/models upstream.
Host adapters belong to Chimera; thin recipe wiring to Folio; transport stays
with Tangent/plugins. Link existing [Torque](torque-example.md),
[Run Explorer](run-explorer.md), [Event Ledger](event-ledger-review.md),
[Messaging](messaging-example.md), [Administration](administration-example.md)
and [Chat](chat-example.md). Flux rebuild CW-20261003-0073 is related evidence,
not implementation scope for this task.

No new token prefix is justified by this proposal. Reuse semantic fg/bg/border/
primary/danger/focus and existing scale tokens for all colours/spacing/type/
width/radius. Width/breakpoint preset choices require visual proof, not literal
pixel CSS. If proof reveals a missing semantic token, record the need and its
two consumers/distinct idioms before prefix registration; DEC-026 forbids a new
kit/prefix on one specimen. Inspect actual exports rather than infer --hl/fg
renaming. Published core 0.4.0 availability was verified in -0068; private
plugin-host-ui, stale verifier from 0.2 and Tangent lock Vite **8.3.1** are
separate release/adoption concerns, not resolved by this spec.

Review all ten canonical built-ins (`nanite-default`, `dir-a`, `dir-b`, `dir-d`,
`dir-e`, `dir-f`, `sysop-p4-white`, `sysop-green-phosphor`,
`sysop-amber-phosphor`, `sysop-hi-contrast`) in light and dark. Use the runtime
theme store before mount for first paint, root theme/mode attributes and actual
package source.css registration; do not inherit the older examples' four-theme
URL whitelist as a new limitation. Tangent custom palette/foreground policy
remains a separate supported theme, verified against exported derivation rules.
No claimed visual acceptance of these modes under this documentation task.

## 6. Browser data-hook contract — proposed

Prefer accessible role/name assertions for behavior; data hooks locate structural
owners where semantics alone cannot distinguish panes. Hook names describe
regions/state, never CSS colour/spacing or fixture counts. Attributes supplement
ARIA, not replace it. No customer data, draft text or credentials in hooks.

| Hook | Scope / values |
| --- | --- |
| `data-ops-shell`, `data-ops-route` | One root; route enum inbox/channels/messages/portfolio. |
| `data-ops-pane` | main/list/inspector/aside on actual owner regions. |
| `data-ops-scroll` | list/detail/chat/overlay-body on actual scrolling element, not a wrapper. |
| `data-ops-aside-state` | absent/collapsed/persistent/overlay; width preset separately `data-ops-aside-width`. |
| `data-ops-action` | toggle-aside/search/clear/reveal-more/previous/next/back/dismiss/copy/comment; scope to pane/record. |
| `data-ops-facet`, `data-ops-facet-kind` | Registry stable ID; chips/cycle/entity. |
| `data-ops-row-id` | Opaque fixture/admitted row ID, never array index; reuse table's existing hooks where available. |
| `data-ops-count` | admitted/matched/revealed/selected; `data-ops-count-state` is known or withheld. |
| `data-ops-inspector-mode` | inline/modal; open record ID separate from checked state. |
| `data-ops-resource` | ready/loading/empty/error/denied/unavailable; actual authored state. |

Keep existing `data-slot=inspection-*` and `overlay-sidebar-body/footer` hooks
from narrow primitives. Do not rename them or add a second scroll owner solely
to fit the proposed table. Source generation stays opaque host state; browser
proof uses source switches/retained callbacks rather than encoding serialized
wire records into a hook.

## 7. Owner review sheet — every open choice has a default

These are proposals, not decisions. Manager consolidates one pass under DEC-073
and records acceptance/change/rejection on the task and immutable review receipt.

| Owner choice | Recommended default | Rationale / consequence |
| --- | --- | --- |
| Width/collapse/narrow transition | Regular preset, initially collapsed empty rail, lg overlay transition | Reserves room only when asked; readable main at 390px. Confirm with -0074 rendered anatomy. |
| Persistence scope | App-local presentation preference, no overlay/drafts/IDs | Stable chrome without cross-project data custody. |
| Search/Escape/record ends | Focused pane only; clear search once/retain focus; stop at ends | Avoids chat/overlay key theft and surprising wrap. Torque can request explicit wrap. |
| Selection on projection changes | Clear on query/facets/source; preserve on sort/density, close unrevealed open ID | No invisible bulk action target; cursor remains visible order. |
| Facet denominator / bulk select | Self-excluding option counts; select revealed only | Useful exploration with explicit bounded action scope. |
| Notice/status mapping | Fixture-only attention/terminal presentation with source-kind badge, no new wire kinds | Lets owner compare appearance without committing producer semantics; arbitrary status is not automatically terminal. |
| Messages location | Conversations in Channels; actionable requests in Inbox with source link | Separates reading from answering, avoids duplicate transport or consumption. Confirm -0076 routing. |
| Metadata conflicts | Per-kind provenance, Unspecified/Conflict, no joins | Admits actual available evidence without false Tether identity. |
| Read / dismiss semantics | Participant view preference; dismiss non-destructive, no automatic approval resolution | New universal semantics need owning contract; existing per-kind capabilities stay truthful. |
| Dismiss all | Current matched eligible non-pending-approval items, count/exclusion confirmation | Owner sees exactly which items would be hidden; pending approvals remain reachable. |
| Comment on every kind | Separate participant comment, not a reply/resolution substitute | Frozen replyable/publication/delivery rules remain intact; persistence needs contract. |
| Doc tags | Participant-scoped, authoritative doc ID | Avoids inventing shared identity/custody before owner decision. |
| Newest everywhere vs transcript | Lists newest-first, transcript chronological with latest at bottom | Matches operator recency while maintaining conversation reading/typing order. |
| PM details/data/regions | Modal record, fictional copied schema, discuss-first -0077/-0108; aside is layout only | No live tracker mutation or assumed plugin panel↔aside mapping. |
| Token/prefix/new kit | Existing semantics/scales; no new prefix/kit | Second distinct idiom must justify promotion, not a package-name preference. |
| Palette/contrast / waiting copy | Preserve custom palette, measure token pair; no waiting-copy source change absent build evidence | Fix unreadable controls without discarding authored theme or repeating an already-landed fix. |

No unresolved exact named-record relay remains after the PM snapshot read;
refresh the snapshot through PM if tracker state changes. Flux/Nil/Fragments/Tether
recreation question defaults belong to their owning plans; this task links the
planner handoff and does not expand into those recreations. No generic-question
idle wait is needed to finish this proposal.

## 8. Review and downstream admission

Documentation validation here is whitespace/link/source/API review, not a
product build/browser claim. The anatomy specifies the future behavior evidence.
-0074/-0076/-0077 must supply fixture-only actual Storybook/app rendering,
keyboard/scroll/focus/390px/short-height/theme evidence with seed **4421** and
reference **2026-10-04T14:30:00Z**, no fixture network or `Date.now()`, no real
customer/trackers/model CLI. Synthetic IME diagnostics must be labelled; native
OS IME and physical touch remain separate until exercised.

Required review sequence: exact proposal technical review → owner review in
Parallax (record concrete defaults accepted/changed) → extraction/API work with
actual -0035/-0036 delivery receipts → released consumption/adoption proofs.
No npm publishing/tags/version/credentials/deploy, or implementation of
-0069/-0071/-0075/-0078/-0079/-0080/-0082 under this task. Any merge of these docs
does not authorize those actions or satisfy downstream owner acceptance.
