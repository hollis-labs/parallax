# Flux Resizable Tabbed Drawers — Candidate Architecture & Upstream Proposal

## 1. Executive Summary

- **Task Reference:** Torque `CW-20261010-0084` under Parallax `EP-20261010-0006`.
- **Primary Source Reference:** Flux commit `232064c3a5eaa8e8d9e270d89d78df3ca81df231` (`ChatPrimaryDrawer`, `ChatWorkingDrawer`, `ChatDrawerTabStrip`).
- **Policy Alignment (DEC-080 & PM01a123ff-1a7d-7f2d-88b0-72f56e6dead6):**
  - High fidelity with design token snapping.
  - Local candidate primitives implemented first in Parallax.
  - Scoped dark composer for Concrete & Signal; system font stacks.
  - Distinct-second-consumer review is strictly required before promotion to `@hollis-labs/design-components` (per PM correction `01a123ff-25bc-7dad-8380-e31a32092c02`).
  - Scope is strictly candidate implementation + upstream proposal; this task does not implement `CW-20261010-0086`, `CW-20261010-0087`, or `CW-20261010-0094`. Shared primitive promotion requires distinct-second-consumer review.
  - No core registry publication, npm deployment, or hardware claims.

---

## 2. Candidate Primitives & Architecture

The candidate architecture in `frontend/src/drawers/` introduces four cleanly decoupled units:

### 2.1 `ResizableTabbedDrawer` (Unified Top/Bottom Primitive)
- **File:** [`frontend/src/drawers/ResizableTabbedDrawer.tsx`](../frontend/src/drawers/ResizableTabbedDrawer.tsx)
- **Role:** Unified container primitive supporting both `placement="top"` (Primary Drawer) and `placement="bottom"` (Working Drawer).
- **Drag Mechanics:**
  - Pointer capture via `setPointerCapture(pointerId)` prevents pointer event loss across frames, iframes, and rapid mouse movements.
  - Dragging down expands the top drawer; dragging up expands the bottom drawer.
  - Min/max height bounding (`minHeight = 48`, `maxHeight = 600`).
  - Auto-close threshold: dragging past `< 24px` collapses the drawer and resets height to default baseline (240px primary / 200px working) upon re-opening, matching Flux source behavior.
  - Double-click on the handle toggles open/close state, restoring default baseline height if collapsed below minHeight.
- **Accessibility & Keyboard Resizing:**
  - WAI-ARIA `role="separator"` with `tabIndex={0}`, `aria-orientation="horizontal"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`.
  - Arrow keys: `ArrowDown` / `ArrowUp` increment/decrement by 16px (aligned with 4px token grid scale).
  - Page keys: `PageDown` / `PageUp` increment/decrement by 48px (aligned with 4px token grid scale).
  - Bounds keys: `End` expands to `maxHeight` (600px at the default root scale); `Home` resizes to `minHeight` (48px).
  - Toggle key: `Space` toggles open/close state.
  - Focus return: closing via close button (`X`) restores focus to the drag handle.
- **Alert Simulation Overlay:**
  - When active (e.g. Session Takeover, Circuit Open, Interrupted Turn), drawer body dims to `opacity-30` with `inert` and `aria-hidden` attributes applied to background body and sidebar, blocking keyboard access to underlying tabs and pin controls.
  - Scoped alert is presented as `role="alertdialog"` (the review controls outside the drawer remain available), auto-focuses dismiss control on entry, and restores focus to the active tab upon dismissal.

### 2.2 `ChatDrawerTabStrip` (Dynamic Tab Navigation)
- **File:** [`frontend/src/drawers/ChatDrawerTabStrip.tsx`](../frontend/src/drawers/ChatDrawerTabStrip.tsx)
- **Role:** Dynamic horizontal tab strip with overflow pagination, running pip indicator, and close/pin actions.
- **Features:**
  - Overflow measurement via `scrollLeft` / `scrollWidth` / `clientWidth` with Chevron left/right pagination controls.
  - Keyboard navigation: `ArrowLeft` / `ArrowRight` cycles between tabs with auto-focus; `Home` / `End` jumps to first/last tab.
  - Running pip indicator: tabs with `runningPip: true` display a pulsing pip with `role="status"` and `aria-label="Running activity"`.
  - Closeable tabs: dynamic card tabs display a close button (`X`) with focus return to an adjacent admitted tab after removal.
  - Pinnable tabs: dynamic card tabs display a pin toggle (`Pin` / `PinOff`), sending pinned cards to the top drawer.

### 2.3 `useDrawerSessionStore` (Per-Session Persistence & Isolation)
- **File:** [`frontend/src/drawers/useDrawerSessionStore.ts`](../frontend/src/drawers/useDrawerSessionStore.ts)
- **Role:** Session-keyed layout state store utilizing `localStorage` with fallback in-memory caching.
- **Isolation & Persistence Guarantee:**
  - Changes to drawer heights, open/closed states, active tabs, and pinned/card tabs in `CHAT-001` have zero side effects on `CHAT-002` or `CHAT-003`.
  - Rehydration Policy (matching Flux `useLayoutStore` 232064c3): `localStorage` stores layout dimensions only (`open`, `height`, static `activeTab`). Transient dynamic card tabs and envelopes are in-memory session state and initialize empty on reload. Persisted booleans, finite heights and static tab identities are validated; unknown session panels explicitly show unavailable data.
  - Cross-Browser-Tab Reactivity: Subscribes to `window` `storage` events to synchronize layout updates across concurrent browser tabs.
  - Stale Setter Retirement: `useDrawerSession` guards all state dispatchers with a distinct admitted lifetime for each session visit (including A → B → A), preventing old held setters from mutating stale sessions after switch or unmount.

### 2.4 Domain Adapters: `ChatPrimaryDrawer` & `ChatWorkingDrawer`
- **Top Drawer (`ChatPrimaryDrawer`):**
  - Tabs: Documents, Reports, Diffs, Tools (pulsing running pip), Pins.
  - Integrates pinned dynamic cards (`pin:<id>`) alongside static tabs.
- **Bottom Drawer (`ChatWorkingDrawer`):**
  - Tabs: Scratchpad, Terminals (Terminal 1 & Terminal 2), Artifacts, Runtime, Session Context.
  - Integrates dynamically added closeable/pinnable card tabs.
  - Developer Mode sidebar showing context tokens, latency, cache hit ratios, and model parameters.

---

## 3. Design Token Compliance & Purity

Strict adherence to `@hollis-labs/eslint-config-design` and `@hollis-labs/design-tokens`:

1. **Dynamic Geometry vs. Authored Style Tokens:**
   - User-measured dynamic drag heights are passed via inline styles: `style={{ height: `${effectiveHeight}px` }}`.
   - All authored classes strictly use token scale utilities:
     - Text scale: `text-caption`, `text-micro`, `text-body`, `text-heading-sm`.
     - Radii: `rounded-panel`, `rounded-control`, `rounded-sm`.
     - Colors: `bg-bg`, `bg-bg-elevated`, `bg-surface`, `text-fg`, `text-fg-muted`, `border-border`, `bg-primary`, `text-primary`.
     - Spacing: standard Tailwind spacing (`p-2`, `px-3`, `py-1`, `h-5`, `w-36`).
   - Scrollbar visibility selectors are behavioral utilities; no arbitrary presentation bracket escapes (no `text-[11px]`, `rounded-[4px]`, etc.).
2. **Built-in Themes Compatibility:**
   - Verified theme application and token resolution across all 10 design-tokens themes in both `light` and `dark` modes:
     1. Concrete & Signal (`nanite-default`)
     2. Graphite & Ink (`dir-a`)
     3. Warm Stone & Steel (`dir-b`)
     4. Synthwave (`dir-d`)
     5. Hacker / Terminal (`dir-e`)
     6. Flat / Mono (`dir-f`)
     7. Sysop — P4 White (`sysop-p4-white`)
     8. Sysop — Green Phosphor (`sysop-green-phosphor`)
     9. Sysop — Amber Phosphor (`sysop-amber-phosphor`)
     10. Sysop — High Contrast (`sysop-hi-contrast`)

---

## 4. Verification Evidence & Test Matrix

- **Deterministic Fixtures:**
  - Seed `4421`, Reference Clock `2026-10-04T14:30:00Z`.
  - Zero live network, no `Date.now()`, no external timers.
- **Playwright Test Suite (`frontend/tests/drawers.spec.ts`):**
  1. Semantic rendering and presence of top and bottom drawers with tabs and running pip.
  2. Pointer drag resizing of top and bottom drawers with auto-close threshold (< 24px) and header toggle recovery.
  3. Keyboard resizing: `ArrowUp`/`ArrowDown` (16px), `PageUp`/`PageDown` (48px), `End` (600px), `Home` (48px), `Space` toggle, and double-click handle toggle.
  4. Dynamic card tab creation, overflow pagination, arrow key navigation, pinning, and closing with focus return.
  5. Per-session persistence and isolation across `CHAT-001` and `CHAT-002`, including browser reload retention.
  6. Alert simulation overlay with content dimming (`opacity-30`) and dismiss behavior.
  7. Four standard viewports: `1440x900` (desktop full), `1440x420` (desktop short), `390x844` (mobile portrait), `390x420` (mobile short) with `scrollWidth <= 390` containment.
  8. Theme switching across all 10 themes in light and dark modes.

---

## 5. Upstream Kit Promotion Recommendation

1. **Keep Local in Parallax First:**
   - As mandated by PM correction `01a123ff-25bc-7dad-8380-e31a32092c02`, candidate primitives should live in Parallax (`frontend/src/drawers/`) for initial field validation.
2. **Requirements for `@hollis-labs/design-components` Extraction:**
   - Identify a **distinct second consumer** (e.g. Operations Workbench, Tether diagnostic panel, or Admin Review) with a genuine non-chat idiom.
   - Formalize the component interface:
     - `ResizableDrawer`: Generic placement (`top` | `bottom` | `left` | `right`), controlled height/width, pointer capture drag, keyboard accessibility.
     - `DrawerTabStrip`: General-purpose tab strip with badge, pip, and overflow support.
   - Only when both distinct consumers agree on the API boundary should a separately scoped promotion task be executed.

## Source and adaptation boundary

The pinned Flux drawers use measured pointer geometry, near-zero release collapse and default reset (240 primary / 200 working). They do not provide this candidate’s keyboard separator controls or 48/600 bounds. Those controls are local accessibility adaptations; 16/48 key increments snap to inherited Tailwind spacing-4/12. Defaults snap to spacing-60/50, minimum to spacing-12, maximum to spacing-150 and collapse threshold to spacing-6. These authored steps resolve from the inherited spacing token; pointer deltas remain measured geometry. Flux layout persistence excludes transient working card tabs and panel envelopes. This candidate also excludes pins from reload persistence, and starts both drawers open for inspection; neither is a claim about Flux default state.

Theme checks establish application and nonempty token resolution, not full visual acceptance of every interaction in every theme. Native browser receipts establish local mouse and keyboard behavior; physical touch, OS IME and live provider behavior remain unclaimed.

Additional regression cases assert disabled/inert alert controls and admitted dismissal focus, active close/unpin focus, transient-free reloads, cross-tab layout updates and deletion, malformed persisted layout, explicit unknown-session panels, and alert focus when the drawer starts closed. Retained native replay separately exercises each held hook dispatcher after switch, return to the same session ID, and unmount. Raw viewport/theme captures, request logs and source/package hashes are retained in the task’s owned proof packet for independent manager review.

Dispatcher custody uses a captured subscription activation epoch. React StrictMode and preserved-state Activity hide/show create a fresh lease: current dispatchers work, while callbacks held before cleanup stay retired. The source-mounted lifecycle spec covers a once-working old dispatcher, hide/show, a current positive mutation, and every old mutation remaining inert.
