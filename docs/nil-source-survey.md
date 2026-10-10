# Nil source survey and keyboard interaction audit

CW-20261010-0089 · Parallax PRJ-20261004-0003 · EP-20261010-0006

This audit records the primary source contracts, event handling patterns, timing logic,
and defects observed in `apps/nil` frontend at commit
`cab453268482bf0b60df5820bb337a77e2ff841b`. It provides the empirical baseline for
the Parallax behavior specification ([`docs/nil-behavior-spec.md`](nil-behavior-spec.md))
and the owner decision sheet ([`docs/nil-decision-records.md`](nil-decision-records.md)).

## 1. Audit environment and head citations

| Repository | Head commit | Path in workspace | Role |
| --- | --- | --- | --- |
| `nil` (`apps/nil`) | `cab453268482bf0b60df5820bb337a77e2ff841b` | `~/dev/hollis-labs/worktrees/nil/CW-20261010-0089` | Primary source under audit |
| `parallax` (`apps/parallax`) | `70afd38a3b31b409ee5d267083ce3b7f9d3fe75a` | `~/dev/hollis-labs/worktrees/parallax/CW-20261010-0089` | Host of review spec & docs |
| `design-kit` | `d1e6241b9fb735ccce3b627bf913515574e72c61` | Pinned local candidate `0.4.0-cw0036` | Upstream target for extracted primitives |

All line citations below refer to the exact commit `cab453268482bf0b60df5820bb337a77e2ff841b`
in `apps/nil`.

---

## 2. Topic survey and code analysis

### Topic 1: Shortcuts and modified presses

Global shortcuts in Nil are distributed across multiple components without centralized
registration, priority arbitration, or input-field collision prevention.

1. **`frontend/src/components/KeyboardScope.tsx:16-65`**:
   - `Shift + Shift` (double-tap within 300ms) → `onOpenQuickSearch?.()` (lines 22–33).
   - `Cmd+Shift+N` / `Ctrl+Shift+N` → `onQuickAddNote?.()` (lines 34–38).
   - `Cmd+Shift+M` / `Ctrl+Shift+M` → `onToggleAppMode?.()` (lines 39–43).
   - `Cmd+S` / `Ctrl+S` → `onOpenQuickSearch?.()` (lines 44–48).
   - `Cmd+I` / `Ctrl+I` → `onOpenInbox?.()` (lines 49–53).
   - `Cmd+N` / `Ctrl+N` → `onQuickAdd()` (lines 54–57).
   - `Escape` → `onEscape()` (lines 58–61).
   *Defects observed:*
   - `KeyboardScope` attaches directly to `window.addEventListener("keydown", handleKeyDown)`
     (line 63). It does **not** inspect `e.target`, so pressing `Cmd+N`, `Cmd+S`, or `Shift+Shift`
     while focused inside an `<input>`, `<textarea>`, or contenteditable triggers the global action.
   - Line 49 (`e.key === "i"`) omits `!e.shiftKey`, meaning `Cmd+Shift+I` also triggers `onOpenInbox`
     unless intercepted earlier.
   - **`Cmd+K` does not exist anywhere in `apps/nil`**. In Nil, quick search is mapped to `Cmd+S`
     (`KeyboardScope.tsx:44`) or `Shift+Shift` (`KeyboardScope.tsx:23`). Primary `Cmd+K` is a new
     decision introduced by the owner in DEC-073.

2. **`frontend/src/pages/App.tsx:108-128`**:
   - `Cmd+Shift+V` / `Ctrl+Shift+V` → `setShowVaultSwitcher(v => !v)` (lines 110–113).
   - `Cmd+,` / `Ctrl+,` → `setSettingsOpen(v => !v)` (lines 114–117).
   - `Cmd+Shift+C` / `Ctrl+Shift+C` → `setChatOpen(v => !v)` (lines 118–121).
   *Defects observed:*
   - Independent window keydown listener registered alongside `KeyboardScope`.
   - No target element check; firing `Cmd+,` while typing in an input opens settings immediately.

3. **`frontend/src/components/EditItemModal.tsx:209-237`**:
   - `Escape` → closes dirty close prompt if active, else calls `requestClose()` (lines 211–216).
   - `Cmd+Enter` / `Ctrl+Enter` → saves item and closes dialog (`handleSubmit`, lines 217–222).
   - `Cmd+S` / `Ctrl+S` → in edit mode with `onSaveStay`, performs save-in-place (`doSaveStay`,
     lines 223–233); otherwise submits.

---

### Topic 2: Shift-Shift timing, text-input leaks, and IME ownership

Nil implements the JetBrains-style `Shift+Shift` double-tap shortcut in
`frontend/src/components/KeyboardScope.tsx:13-33`:

```typescript
// KeyboardScope.tsx:13-33
const lastShiftRef = React.useRef<number>(0);

React.useEffect(() => {
  function handleKeyDown(e: KeyboardEvent) {
    // Any non-Shift key resets the double-tap window so normal typing never triggers it.
    if (e.key !== 'Shift') {
      lastShiftRef.current = 0;
    }

    // Shift+Shift (double-tap within 300ms) → Quick Search
    if (e.key === 'Shift' && !e.metaKey && !e.ctrlKey && !e.altKey) {
      const now = Date.now();
      if (now - lastShiftRef.current < 300) {
        e.preventDefault();
        onOpenQuickSearch?.();
        lastShiftRef.current = 0;
      } else {
        lastShiftRef.current = now;
      }
      return;
    }
```

*Observed failure modes:*
1. **No editable field guard:** `KeyboardScope` does not check `e.target`. When a user types in
   `ItemTitleInput.tsx`, `NotesEditorField.tsx`, or `SearchAutocomplete.tsx` and types capitalized
   letters, acronyms (e.g. `NASA`, `ADR`), or pauses between Shift presses within 300ms,
   `onOpenQuickSearch?.()` is invoked, stealing focus away from their active typing.
2. **IME composition ignorance:** There is no check for `e.isComposing` or `e.keyCode === 229`.
   During input method editor (IME) composition for East Asian languages (Japanese, Chinese,
   Korean) or European dead keys, Shift presses can be dispatched while composing characters.
   Nil interprets these as raw Shift taps.
3. **Wall-clock non-determinism:** Uses `Date.now()` (line 24) instead of `e.timeStamp` or a
   deterministic monotonic clock, causing potential drift or test instability.
4. **Key repeat vulnerability:** Holding Shift down on some operating systems or repeating
   modifier events without `e.repeat` guard can register successive keydown events.

---

### Topic 3: Layered Escape stack and main-query retention

In Nil, Escape handling is fragmented across more than 10 independent component listeners
attached to `window` and `document`. There is no central stack or coordinator.

*Observed listeners:*
- `pages/App.tsx:607-620` (`handleClearAll`) wired to `KeyboardScope.tsx:58-61` via `onEscape`.
- `components/QuickSearchModal.tsx:79-83`: `window.addEventListener("keydown", handle)`
- `components/EditItemModal.tsx:211-216`: `window.addEventListener("keydown", handleKeyDown)`
- `components/NotesModal.tsx:95-99`: `window.addEventListener("keydown", handleEscape)`
- `components/SettingsModal.tsx:107-111`: `window.addEventListener("keydown", handleEscape)`
- `components/ThemeSettingsModal.tsx:42-46`: `window.addEventListener("keydown", handleEscape)`
- `components/QuickAddModal.tsx:28-32`: `window.addEventListener("keydown", handleEscape)`
- `components/RadialMenuWrapper.tsx:52-63`: `document.addEventListener("keydown", handleEscape)`
- `components/InboxView.tsx:103-112`: `window.addEventListener("keydown", handleKeyDown)`
- `components/VaultSwitcher.tsx:81-83`: `document.addEventListener("keydown", handler, true)` (capturing!)
- `components/CopyrightFooter.tsx:42-45`: `window.addEventListener("keydown", handleKeyDown, { capture: true })`

#### The accidental cross-layer clearing defect (`App.tsx:607-620`)

In `pages/App.tsx:607-620`:
```typescript
// App.tsx:607-620
function handleClearAll() {
  if (appMode === 'inbox') {
    closeInbox();
    return;
  }
  if (!quickOpen && !notesOpen && !settingsOpen && !sessionContextOpen) {
    setQuery("");
    const session = getActiveSession();
    if (session?.useAsFilterTab) {
      setActiveSession({ ...session, useAsFilterTab: false });
      updateSessionFilterCount();
      runSearch();
    }
  }
}
```

*The failure sequence:*
1. The user types a search query in `App.tsx` (e.g. `pri:A +project`), filtering the main task list.
2. The user presses `Cmd+S` or `Shift+Shift` to open `QuickSearchModal.tsx`.
3. `QuickSearchModal` opens (`quickSearchOpen === true`).
4. The user decides to cancel quick search and presses `Escape`.
5. `QuickSearchModal.tsx:79-83` catches `Escape`, calls `e.preventDefault()`, and calls
   `onOpenChange(false)`.
6. However, `KeyboardScope.tsx:58-61` ALSO receives the `Escape` keydown event on `window`!
7. `KeyboardScope` calls `onEscape` → `handleClearAll()`.
8. `handleClearAll()` evaluates line 612:
   `if (!quickOpen && !notesOpen && !settingsOpen && !sessionContextOpen)`
9. Notice that **`quickSearchOpen` is completely missing from this guard condition**!
10. `handleClearAll` proceeds to execute `setQuery("")` (line 613).
11. **Result:** Closing the quick search modal silently wipes out the background search query on
    the main page behind it.

---

### Topic 4: Focus entry, focus trap, and focus return

Every modal and overlay in `apps/nil` is implemented as a plain `<div>` with `position: fixed; inset: 0;`
and hand-rolled CSS.
- **Focus entry:** In `QuickSearchModal.tsx:66`, focus entry is triggered via
  `setTimeout(() => inputRef.current?.focus(), 0)`. In `EditItemModal.tsx`, `SettingsModal.tsx`,
  and `VaultSwitcher.tsx`, initial focus is either unmanaged or relies on native browser autofocus.
- **Focus trap:** Zero modals in Nil have a focus trap. Pressing `Tab` or `Shift+Tab` cycles
  keyboard focus out of the modal into the obscured background DOM elements (such as `AppHeaderBar`,
  `TerminalList`, or hidden buttons).
- **Focus return:** Zero modals in Nil track the triggering element (`document.activeElement`) prior
  to opening. When an overlay closes, focus defaults to `document.body` or is stranded, forcing
  the keyboard user to re-tab through the entire page.
- **ARIA attributes:** Nil modals omit `role="dialog"`, `aria-modal="true"`, `aria-labelledby`,
  and `aria-describedby`.

---

### Topic 5: Search arrows while retaining input caret

In `frontend/src/components/QuickSearchModal.tsx:76-105`:
```typescript
// QuickSearchModal.tsx:78-102
const handle = (e: KeyboardEvent) => {
  if (e.key === "Escape") {
    e.preventDefault();
    onOpenChange(false);
    return;
  }
  if (e.key === "ArrowDown") {
    e.preventDefault();
    setFocusedIndex((i) => Math.min(i + 1, results.length - 1));
    return;
  }
  if (e.key === "ArrowUp") {
    e.preventDefault();
    setFocusedIndex((i) => Math.max(i - 1, 0));
    return;
  }
  if (e.key === "Enter") {
    const hit = results[focusedIndex];
    if (hit) {
      e.preventDefault();
      onOpenItem(hit);
      return;
    }
  }
};
window.addEventListener("keydown", handle);
```

*Observed mechanics:*
1. The text input (`<input ref={inputRef} ...>`) retains continuous DOM focus (`QuickSearchModal.tsx:153-168`).
2. Pressing `ArrowDown` or `ArrowUp` calls `e.preventDefault()`, which prevents the browser's default
   caret movement within the text box.
3. React state `focusedIndex` is incremented/decremented.
4. Line 72 (`rowRefs.current[focusedIndex]?.scrollIntoView({ block: "nearest" })`) scrolls the
   highlighted item into view.
5. The caret in the input remains intact at its authored position.
6. *Limitation:* Lacks `role="combobox"`, `role="listbox"`, `role="option"`, and
   `aria-activedescendant`. Screen readers cannot announce the highlighted item.

---

### Topic 6: Filter-chip accessibility

In `frontend/src/components/QuickSearchModal.tsx:109-114, 188-215`:
```typescript
// QuickSearchModal.tsx:109-114
const filterChips: { label: string; value: "" | "todo" | "note" | "scratch" }[] = [
  { label: "All", value: "" },
  { label: "Todos", value: "todo" },
  { label: "Notes", value: "note" },
  { label: "Scratch", value: "scratch" },
];
```
- Filter chips are rendered as raw `<button>` elements with `onClick={() => setTypeFilter(chip.value)}`.
- There is **no keyboard navigation** to cycle chips from the search input.
- To reach the chips, a keyboard user must press `Tab` (which escapes the input and hits the clear button
  at line 170, then the chips).
- The chips lack `role="tablist"` / `role="tab"` or `role="radiogroup"` / `role="radio"`. Active state
  is indicated purely by CSS class name (`className={`badge ${typeFilter === chip.value ? "warn" : "fg"}`}`).

---

### Topic 7: Radial menu timing, geometry, and post-hold click suppression defect

The radial menu in Nil consists of two components:
- Gesture & event coordinator: `frontend/src/components/TerminalList.tsx:240-281` (todos) and `485-516` (notes).
- Menu rendering & action dispatch: `frontend/src/components/RadialMenuWrapper.tsx:1-351`.

#### Mechanics and geometry
- Radius: `const radius = 60;` (`RadialMenuWrapper.tsx:159`). Center button size: 35px (`line 239`).
  Item button size: 35px (`line 212`). Total bounding circle diameter is `(60 * 2) + 35 = 155px`.
- Item count:
  - Todo main layer: **8 items** (`now`, `soon`, `anytime`, `delete`, `edit`, `complete`, `more`, `pin` at
    0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°) (`lines 142–150`).
  - Note main layer: **5 items** (`edit`, `convertType`, `delete`, `pin`, `clone` at
    0°, 60°, 120°, 180°, 270°) (`lines 133–140`).
  - More sublayer: **4 items** (`archive`, `clone`, `meta`, `convertType` at
    90°, 150°, 210°, 270°) (`lines 152–157`).
- Hold duration: **1000ms** hardcoded via `setTimeout(..., 1000)` (`TerminalList.tsx:252, 269, 498`).

#### The post-hold click suppression defect (`TerminalList.tsx:250-298`)

In `frontend/src/components/TerminalList.tsx:250-298`:
```typescript
// TerminalList.tsx:250-258
onMouseDown={(e) => {
  deleteTriggered.current = false;
  longPressTimer.current = setTimeout(() => {
    deleteTriggered.current = true;
    if (onOpenRadialMenu) {
      onOpenRadialMenu(r, { x: e.clientX, y: e.clientY });
    }
  }, 1000);
}}
onMouseUp={() => {
  if (longPressTimer.current) {
    clearTimeout(longPressTimer.current);
    longPressTimer.current = null;
  }
}}
...
// TerminalList.tsx:282-298
onClick={(e) => {
  // Don't open edit if delete confirmation is showing
  if (deleteConfirm) {
    e.preventDefault();
    e.stopPropagation();
    return;
  }

  const target = e.target as HTMLElement;
  const isCheckboxClick = target.closest('.checkbox');

  if (!isCheckboxClick) {
    e.preventDefault();
    setHoveredRow(null);
    onEditItem(r);
  }
}}
```

*The failure sequence:*
1. The user presses and holds mouse button 1 on a todo row.
2. At 1000ms, the timer fires: `deleteTriggered.current = true;` and `onOpenRadialMenu` is called.
3. The radial menu mounts over the row.
4. The user releases the mouse button (`mouseup`).
5. The browser natively synthesizes a `click` event on the row element.
6. `onClick` fires (line 282).
7. Notice that **`onClick` never checks `deleteTriggered.current`**!
8. `onClick` executes line 296: `onEditItem(r)`.
9. **Result:** Immediately after the radial menu opens from a long press, the edit modal
   (`EditItemModal`) is opened directly behind or over the radial menu!
10. In contrast, `AppModeToggleButton.tsx:44-53` correctly guarded its `onClick` with
    `if (!lpFired.current) { onCycle(next); }`. `TerminalList.tsx` missed this check in both
    its todo row (line 282) and note row (line 511).

#### Missing touchmove cancellation and viewport clamping
- **No `touchmove` cancellation:** `TerminalList.tsx:265-281` registers `onTouchStart` and `onTouchEnd`.
  It does **not** register `onTouchMove`. If a user touches a row and scrolls vertically for 1 second,
  the radial menu pops up under their moving thumb while scrolling.
- **No viewport bounds clamping:** In `RadialMenuWrapper.tsx:273-277`, the menu container position is
  `left: ${position.x}px; top: ${position.y}px`. Near viewport edges (e.g. clicks near top, bottom, or
  window borders), the 155px diameter menu renders partially off-screen with buttons clipped.
- **No keyboard access:** Neither `TerminalList.tsx` nor `RadialMenuWrapper.tsx` provides any keyboard
  trigger (`Shift+F10`, context key, or shortcut) or keyboard navigation for radial options.

---

### Topic 8: Cycle button and input-mode controls

1. **Mode cycle button (`frontend/src/components/AppModeToggleButton.tsx:15-89`)**:
   - Cycles 3 states: `todos` → `notes` → `all` → `todos` (`lines 46–50`).
   - Short click: cycles mode.
   - Long press (1000ms, line 30): sets `lpFired.current = true` and invokes `onLongPress()`.
   - In `App.tsx:866-869`, `onLongPress` opens `SettingsModal` navigated to the `'tabs'` tab.
   - Correctly suppresses `onCycle` on click release if `lpFired.current === true` (`lines 45–52`).

2. **Input-mode toggle (`frontend/src/pages/App.tsx:679-711`)**:
   - Toggles state `inputMode` between `'search'` and `'add'` (`lines 694–697`).
   - Persisted in `localStorage.setItem('nil.inputMode', newMode)`.
   - Visual icon:
     - When `inputMode === 'add'`: renders `<Plus size={16} />` (line 707).
     - When `inputMode === 'search'`: renders `<Search size={16} />` (line 709).
   - Tooltip: `inputMode === 'add' ? 'Quick Add Mode (Click to Search)' : 'Search Mode (Click to Quick Add)'`.

3. **Session Context button (`frontend/src/pages/App.tsx:712-740`)**:
   - Located immediately beside the input-mode button.
   - Renders a `<Target size={16} />` icon (line 740).
   - Opens `SessionContextModal` (`onClick={() => setSessionContextOpen(true)}`).

---

### Topic 9: The literal `+/@` source discrepancy and todo.txt syntax origin

The task brief and historical notes reference:
*"the cycle button plus the +/@ button beside search"*.

**Factual findings in `apps/nil`:**
1. There is **no button with the label, text, or icon `+/@`** anywhere in the Nil codebase.
2. The control immediately beside `<SearchAutocomplete>` in `App.tsx:679-711` is the `inputMode`
   toggle, displaying a `Plus` (`+`) icon or `Search` (magnifying glass) icon.
3. The control immediately beside that (`App.tsx:712-740`) is the Session Context button with a `Target` icon.
4. **Origin of `+` and `@`:** Nil is built around a `todo.txt`-inspired capture and query syntax:
   - `+project` designates a project tag (`HelpModal.tsx:146, 195`, `app_demo.go:50`, `README.md:106`).
   - `@context` designates a context/location tag (`HelpModal.tsx:147, 196`, `app_demo.go:50`, `README.md:107`).
   - `ItemTitleInput.tsx:21` placeholder: `"e.g. Review pull request +project @context"`.
   - `HelpModal.tsx:172-175`: explains `todo.txt` syntax extensions in Nil.
5. **Deduction:** The owner's phrase *"the +/@ button beside search"* conflated the visual `Plus` (`+`)
   mode toggle beside search with Nil's fundamental `+` (project) and `@` (context) syntax prefixes.

---

### Topic 10: Inbox view keys (`x`, `p`, `a`, `d`) vs table/board row interaction

In `frontend/src/components/InboxView.tsx:96-142`:
```typescript
// InboxView.tsx:98-138
const handleKeyDown = (e: KeyboardEvent) => {
  const target = e.target as HTMLElement;
  const onSearchInput = target.classList.contains("inbox-search-input");

  switch (e.key) {
    case "Escape":
      if (selectedIds.size > 0) {
        e.preventDefault();
        setSelectedIds(new Set());
        setBulkDeleteConfirm(false);
      } else {
        e.preventDefault();
        onClose();
      }
      break;
    case "ArrowDown":
      if (!onSearchInput) { e.preventDefault(); setFocusedIndex(i => Math.min(i + 1, items.length - 1)); }
      break;
    case "ArrowUp":
      if (!onSearchInput) { e.preventDefault(); setFocusedIndex(i => Math.max(i - 1, 0)); }
      break;
    case "Enter":
      if (!onSearchInput) { e.preventDefault(); const it = items[focusedIndex]; if (it) onEdit(it); }
      break;
    case "x":
      if (!onSearchInput) {
        e.preventDefault();
        const item = items[focusedIndex];
        if (item) toggleSelect(item.id);
      }
      break;
    case "p":
      if (!onSearchInput) { e.preventDefault(); const it = items[focusedIndex]; if (it) handleProcess(it.id); }
      break;
    case "a":
      if (!onSearchInput) { e.preventDefault(); const it = items[focusedIndex]; if (it) handleArchive(it.id); }
      break;
    case "d":
      if (!onSearchInput) { e.preventDefault(); const it = items[focusedIndex]; if (it) handleDelete(it.id); }
      break;
  }
};
window.addEventListener("keydown", handleKeyDown);
```

*Observed mechanics and deficiencies:*
- Single unadorned letters (`x`, `p`, `a`, `d`) are intercepted globally on `window`.
- The only guard is `!target.classList.contains("inbox-search-input")` (line 100). If focus is in
  any other element, child modal, or browser extension input, typing `p`, `a`, `d`, or `x` triggers
  destructive or state-altering actions (process, archive, delete, select) without modifier keys!
- In contrast, Parallax Torque operations (`frontend/src/examples/torque/Operations.tsx:608-624`) uses
  standard ARIA grid/table semantics:
  - `Space`: toggles row selection checkbox (`rowInteractiveProps`).
  - `Enter`: inspects/activates row (`onSelect(r.task.id)`).
  - Row key events require `e.target === e.currentTarget`, `!e.isComposing`, `keyCode !== 229`,
    and absence of active dialogs.

---

### Topic 11: Directional navigation: list Up/Down vs dialog Left/Right

- **Nil's list navigation:** All lists in Nil (`TerminalList.tsx`, `InboxView.tsx:113-118`,
  `QuickSearchModal.tsx:84-93`) navigate vertically using `ArrowUp` and `ArrowDown`.
- **Nil's dialog navigation:** Modals in Nil (`EditItemModal.tsx`, `NotesModal.tsx`) have **zero**
  record-to-record navigation capabilities. Once an item is opened, the user must close it and
  select another.
- **Torque / Parallax navigation:** Parallax's extraction of `useControlledRecordNavigation`
  (`CW-20261010-0036`, `docs/navigation-extraction.md`, `TaskInspection.tsx:51-96`) establishes:
  - Inside an inspection popup / detail dialog: `ArrowLeft` and `ArrowRight` navigate previous/next
    records along the admitted sequence.
  - Supports explicit `boundaryPolicy: "wrap" | "stop"`.
  - In list/table views: `ArrowUp` and `ArrowDown` navigate rows vertically.
  - In kanban/board views: `ArrowLeft` / `ArrowRight` moves horizontally across columns/lanes, while
    `ArrowUp` / `ArrowDown` moves vertically within the active column.

---

### Topic 12: Fullscreen modal toggle and session scope

In `frontend/src/components/EditItemModal.tsx:59-62, 514-526, 557-568`:
```typescript
// EditItemModal.tsx:59-62
// Fullscreen toggle: when true the modal expands to fill the viewport.
// Persists per session in component state only — intentionally not in
// localStorage so each editor opening starts in the default size.
const [isFullscreen, setIsFullscreen] = React.useState(false);
```
- Geometry:
  - Default: `width: 720px; height: min(750px, calc(100vh - 40px)); borderRadius: 8px;`
  - Fullscreen: `width: 100vw; height: 100vh; borderRadius: 0;` (`lines 517–525`).
- Toggle button: `EditItemModal.tsx:557-568` renders `<Maximize2 size={13} />` or `<Minimize2 size={13} />`.
- **Scope:** Fullscreen is implemented **only** on `EditItemModal.tsx`. It does not exist on
  `QuickSearchModal`, `NotesModal`, `SettingsModal`, `QuickAddModal`, or `VaultSwitcher`.
- **Persistence:** Purely in-memory React state on that modal instance. It resets to `false` every
  time the modal closes and reopens.
