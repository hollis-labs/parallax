# Flux Resizable Tabbed Drawers — Candidate Architecture & Upstream Proposal

## 1. Executive Summary

- **Task Reference:** Torque `CW-20261010-0084` under Parallax `EP-20261010-0006`.
- **Primary Source Reference:** Flux commit `232064c3a5eaa8e8d9e270d89d78df3ca81df231` (`ChatPrimaryDrawer`, `ChatWorkingDrawer`, `ChatDrawerTabStrip`).
- **Policy Alignment (DEC-080 & PM01a123ff-1a7d-7f2d-88b0-72f56e6dead6):**
  - High fidelity with design token snapping.
  - Local candidate primitives implemented first in Parallax.
  - Scoped dark composer for Concrete & Signal; system font stacks.
  - Distinct-second-consumer review is strictly required before promotion to `@hollis-labs/design-components` (per PM correction `01a123ff-25bc-7dad-8380-e31a32092c02`).
  - Scope is strictly candidate implementation + upstream proposal; tasks `CW-20261010-0086` (kit promotion), `CW-20261010-0087`, and `CW-20261010-0094` are deferred until distinct-second-consumer review.
  - No core registry publication, npm deployment, or hardware claims.

---

## 2. Candidate Primitives & Architecture

The candidate architecture in `frontend/src/drawers/` introduces four cleanly decoupled units:

### 2.1 `ResizableTabbedDrawer` (Unified Top/Bottom Primitive)
- **File:** [`frontend/src/drawers/ResizableTabbedDrawer.tsx`](file:///home/chrispian/dev/hollis-labs/worktrees/parallax/CW-20261010-0084/frontend/src/drawers/ResizableTabbedDrawer.tsx)
- **Role:** Unified container primitive supporting both `placement="top"` (Primary Drawer) and `placement="bottom"` (Working Drawer).
- **Drag Mechanics:**
  - Pointer capture via `setPointerCapture(pointerId)` prevents pointer event loss across frames, iframes, and rapid mouse movements.
  - Dragging down expands the top drawer; dragging up expands the bottom drawer.
  - Min/max height bounding (`minHeight = 48`, `maxHeight = 600`).
  - Auto-close threshold: dragging past `< 24px` collapses the drawer and stores the prior height for restoration.
  - Double-click on the handle toggles open/close with instant height restoration.
- **Accessibility & Keyboard Resizing:**
  - WAI-ARIA `role="separator"` with `tabIndex={0}`, `aria-orientation="horizontal"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`.
  - Arrow keys: `ArrowDown` / `ArrowUp` increment/decrement by 16px.
  - Page keys: `PageDown` / `PageUp` increment/decrement by 48px.
  - Bounds keys: `End` expands to `maxHeight` (600px); `Home` collapses to `minHeight` (48px).
  - Toggle key: `Space` toggles open/close state.
  - Focus return: closing via close button (`X`) or auto-close automatically restores focus to the drag handle.
- **Alert Simulation Overlay:**
  - When active (e.g. Session Takeover, Circuit Open, Interrupted Turn), drawer body dims to `opacity-30` and pointer events are locked while alert banner is presented with `role="alert"`.

### 2.2 `ChatDrawerTabStrip` (Dynamic Tab Navigation)
- **File:** [`frontend/src/drawers/ChatDrawerTabStrip.tsx`](file:///home/chrispian/dev/hollis-labs/worktrees/parallax/CW-20261010-0084/frontend/src/drawers/ChatDrawerTabStrip.tsx)
- **Role:** Dynamic horizontal tab strip with overflow pagination, running pip indicator, and close/pin actions.
- **Features:**
  - Overflow measurement via `scrollLeft` / `scrollWidth` / `clientWidth` with Chevron left/right pagination controls.
  - Keyboard navigation: `ArrowLeft` / `ArrowRight` cycles between tabs with auto-focus; `Home` / `End` jumps to first/last tab.
  - Running pip indicator: tabs with `running: true` display a pulsing pip with `role="status"` and `aria-label="Running"`.
  - Closeable tabs: dynamic card tabs display a close button (`X`) with focus retirement to the preceding tab.
  - Pinnable tabs: dynamic card tabs display a pin toggle (`Pin` / `PinOff`), sending pinned cards to the top drawer.

### 2.3 `useDrawerSessionStore` (Per-Session Persistence & Isolation)
- **File:** [`frontend/src/drawers/useDrawerSessionStore.tsx`](file:///home/chrispian/dev/hollis-labs/worktrees/parallax/CW-20261010-0084/frontend/src/drawers/useDrawerSessionStore.ts)
- **Role:** Session-keyed layout state store utilizing `localStorage` with fallback in-memory caching.
- **Isolation Guarantee:**
  - Changes to drawer heights, open/closed states, active tabs, and pinned/card tabs in `CHAT-001` have zero side effects on `CHAT-002` or `CHAT-003`.
  - Reactive subscriptions via React 19's `useSyncExternalStore` ensure multi-tab or cross-component reactivity without stale renders.

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
   - Zero arbitrary bracket escapes (no `text-[11px]`, `rounded-[4px]`, etc.).
2. **Built-in Themes Compatibility:**
   - Tested and verified across all 10 design-tokens themes in both `light` and `dark` modes:
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
   - Only when both distinct consumers agree on the API boundary should `CW-20261010-0086` be executed to promote to the shared design kit.
