# Nil source survey and keyboard interaction audit

CW-20261010-0089 · Parallax PRJ-20261004-0003 · EP-20261010-0006

This audit records the primary source contracts, event handling patterns, timing logic,
and source-inferred interaction risks observed in `apps/nil` frontend at commit
`cab453268482bf0b60df5820bb337a77e2ff841b`. It provides the empirical baseline for
the Parallax behavior specification ([`docs/nil-behavior-spec.md`](nil-behavior-spec.md))
and the owner decision sheet ([`docs/nil-decision-records.md`](nil-decision-records.md)).

## 1. Audit environment and head citations

| Repository | Reference | Git object | Role |
| --- | --- | --- | --- |
| `nil` (`apps/nil`) | Source head | Commit `cab453268482bf0b60df5820bb337a77e2ff841b` | Primary source audited across 12 topics. |
| `parallax` | Source head | Commit `70afd38a3b31b409ee5d267083ce3b7f9d3fe75a` | Host of review spec & docs (`origin/main`). |
| `design-kit` | PR 102 merge commit | Commit `1dc83f98098a93ecf300dc5b3999bfe542efc7a7` | Landed candidate on `main`. |
| `design-kit` | PR 102 source head | Commit `62c066cfe6a6547969e85745d969929240e3dcb6` | Author candidate head. |
| `design-kit` | Pinned package tree | Tree `d1e6241b9fb735ccce3b627bf913515574e72c61` | Pinned tree in local tarball `0.4.0-cw0036`. |

All line citations below refer to the exact commit `cab453268482bf0b60df5820bb337a77e2ff841b`
in `apps/nil`, unless explicitly noted as Parallax source.

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
   *Source-inferred observations:*
   - `KeyboardScope` attaches directly to `window.addEventListener("keydown", handleKeyDown)`
     (line 63). It does not inspect `e.target`, so pressing `Cmd+N`, `Cmd+S`, or `Shift+Shift`
     while focused inside an `<input>`, `<textarea>`, or contenteditable dispatches the global action.
   - Line 49 (`e.key === "i"`) omits `!e.shiftKey`, meaning `Cmd+Shift+I` also triggers `onOpenInbox`
     unless intercepted earlier.
   - **`Cmd+K` does not exist anywhere in `apps/nil`**. In Nil, quick search is mapped to `Cmd+S`
     (`KeyboardScope.tsx:44`) or `Shift+Shift` (`KeyboardScope.tsx:23`). Primary `Cmd+K` is a new
     direction established by the owner (relayed via planner/tracker handoffs
     `01M4HR38D2BWASTS5FQ8WF01X1` / `01M4HV1FTKSY20B9RKVPNY683E`; DEC-073 authorizes the
     propose-then-confirm process).

2. **`frontend/src/pages/App.tsx:108-128`**:
   - `Cmd+Shift+V` / `Ctrl+Shift+V` → `setShowVaultSwitcher(v => !v)` (lines 110–113).
   - `Cmd+,` / `Ctrl+,` → `setSettingsOpen(v => !v)` (lines 114–117).
   - `Cmd+Shift+C` / `Ctrl+Shift+C` → `setChatOpen(v => !v)` (lines 118–121).
   *Source-inferred observations:*
   - Independent window keydown listener registered alongside `KeyboardScope`.
   - No target element check; firing `Cmd+,` while typing in an input opens settings immediately.

3. **`frontend/src/components/EditItemModal.tsx:209-237`**:
   - `Escape` → closes dirty close prompt if active, else calls `requestClose()` (lines 211–216).
   - `Cmd+Enter` / `Ctrl+Enter` → saves item and closes dialog (`handleSubmit`, lines 217–222).
   - `Cmd+S` / `Ctrl+S` → in edit mode with `onSaveStay`, performs save-in-place (`doSaveStay`,
     lines 223–233); otherwise submits.

---

### Topic 2: Shift-Shift timing, text-input guards, and IME ownership

Nil implements the `Shift+Shift` double-tap shortcut in
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

*Static source analysis & risks:*
1. **Reset behavior:** Line 18 explicitly resets `lastShiftRef.current = 0` on any key other than
   `'Shift'`. Typing standard text characters (e.g. alternating letters and Shift) resets the window.
2. **Editable field collision risk:** `KeyboardScope` does not check `e.target`. If a user pauses
   inside an `<input>` or `<textarea>` and taps Shift twice in succession within 300ms (for instance,
   preparing to type capitalized text or double-tapping out of habit), `onOpenQuickSearch?.()`
   is invoked, interrupting input focus.
3. **IME composition ignorance:** There is no check for `e.isComposing` or `e.keyCode === 229`.
   During input method editor (IME) composition for East Asian languages or dead keys, synthetic
   Shift events can occur during composition cycles without a guard.
4. **Wall-clock non-determinism:** Uses `Date.now()` (line 24) rather than event timestamps or
   a deterministic clock.

---

### Topic 3: Layered Escape stack and main-query retention

In Nil, Escape handling is fragmented across more than 10 independent component listeners
attached to `window` and `document`. There is no centralized stack.

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
- `components/VaultSwitcher.tsx:81-83`: `document.addEventListener("keydown", handler, true)` (capturing phase)
- `components/CopyrightFooter.tsx:42-45`: `window.addEventListener("keydown", handleKeyDown, { capture: true })`

#### The cross-layer clearing risk (`App.tsx:607-620`)

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

*Static analysis of event ordering risk:*
1. The user filters the main page with a search query.
2. The user opens `QuickSearchModal.tsx` (`quickSearchOpen === true`).
3. Pressing `Escape` dispatches to window listeners.
4. `QuickSearchModal.tsx:79-83` catches `Escape`, calls `e.preventDefault()`, and closes the modal.
5. `KeyboardScope.tsx:58-61` also registers a window keydown listener. Because `e.stopPropagation()`
   does not prevent other listeners on the same `window` node from running, `handleClearAll()` is invoked.
6. In `App.tsx:612`, the guard checks `!quickOpen && !notesOpen && !settingsOpen && !sessionContextOpen`.
   Notice that **`quickSearchOpen` is omitted from this check**.
7. As a consequence, `handleClearAll()` proceeds to line 613: `setQuery("")`. Closing the quick search
   modal risks clearing the background query on the main page.

---

### Topic 4: Focus entry, focus trap, and focus return

Every modal and overlay in `apps/nil` is implemented as an unadorned `<div>` with `position: fixed; inset: 0;`:
- **Focus entry:** In `QuickSearchModal.tsx:66`, focus entry is triggered via
  `setTimeout(() => inputRef.current?.focus(), 0)`. In `EditItemModal.tsx`, `SettingsModal.tsx`,
  and `VaultSwitcher.tsx`, initial focus is unmanaged.
- **Focus trap:** Zero modals in Nil provide a focus trap. Pressing `Tab` or `Shift+Tab` cycles
  keyboard focus out of the modal into background DOM elements.
- **Focus return:** Modals in Nil do not track `document.activeElement` prior to opening. Dismissing
  an overlay leaves focus on `document.body` or stranded.
- **ARIA attributes:** Modals omit `role="dialog"`, `aria-modal="true"`, and labeling relationships.

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
1. The text input (`<input ref={inputRef} ...>`) retains DOM focus (`QuickSearchModal.tsx:153-168`).
2. Pressing `ArrowDown` or `ArrowUp` calls `e.preventDefault()`, which prevents the browser's default
   caret movement within the text box.
3. React state `focusedIndex` is incremented/decremented.
4. Line 72 (`rowRefs.current[focusedIndex]?.scrollIntoView({ block: "nearest" })`) scrolls the
   highlighted item into view.
5. The caret in the input remains intact at its authored position.
6. Lacks accessible combobox semantics: no `role="combobox"` on the input, and no `aria-activedescendant`.

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
- There is no direct keyboard navigation to cycle chips from the search input.
- Reaching chips requires tabbing past the input and clear button.
- Chips lack `role="radiogroup"` / `role="radio"` semantics; selection is marked via CSS class names.

---

### Topic 7: Radial menu timing, geometry, and post-hold click suppression

The radial menu in Nil consists of:
- Event coordinator: `frontend/src/components/TerminalList.tsx:240-281` (todos) and `485-516` (notes).
- Menu rendering: `frontend/src/components/RadialMenuWrapper.tsx:1-351`.

#### Mechanics and geometry (historical Nil source values)
- Radius: `const radius = 60;` (`RadialMenuWrapper.tsx:159`).
- Center button: 35px diameter (`line 239`). Item buttons: 35px diameter (`line 212`).
- Item count:
  - Todo main layer: **8 items** (`now`, `soon`, `anytime`, `delete`, `edit`, `complete`, `more`, `pin` at
    0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°) (`lines 142–150`).
  - Note main layer: **5 items** (`edit`, `convertType`, `delete`, `pin`, `clone` at
    0°, 60°, 120°, 180°, 270°) (`lines 133–140`).
  - More sublayer: **4 items** (`archive`, `clone`, `meta`, `convertType` at
    90°, 150°, 210°, 270°) (`lines 152–157`).
- Hold duration: **1000ms** hardcoded via `setTimeout(..., 1000)` (`TerminalList.tsx:252, 269, 498`).

#### Post-hold click suppression risk (`TerminalList.tsx:250-298`)

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

*Static code observation:*
- When long-press timer elapses, `deleteTriggered.current` is set to `true`.
- On pointer release, browsers synthesize a `click` event on the row.
- `onClick` (line 282) checks `deleteConfirm` and `isCheckboxClick`, but **does not check `deleteTriggered.current`**.
- In code analysis, this indicates a risk where mouse release after long-press invokes `onEditItem(r)`,
  opening `EditItemModal` behind or over the newly opened radial menu. In contrast,
  `AppModeToggleButton.tsx:44-53` explicitly guarded `onClick` with `if (!lpFired.current)`.

#### Missing touchmove cancellation and viewport clamping
- **No `touchmove` cancellation:** `TerminalList.tsx:265-281` registers `onTouchStart` and `onTouchEnd`,
  omitting `onTouchMove`.
- **No viewport bounds clamping:** In `RadialMenuWrapper.tsx:273-277`, coordinates are unconstrained
  `left: ${position.x}px; top: ${position.y}px`. Near screen boundaries, menu buttons risk rendering
  partially off-screen.
- **No keyboard access:** `TerminalList.tsx` and `RadialMenuWrapper.tsx` provide no keyboard trigger
  or action navigation.

---

### Topic 8: Cycle button and input-mode controls

1. **Mode cycle button (`frontend/src/components/AppModeToggleButton.tsx:15-89`)**:
   - Cycles 3 states: `todos` → `notes` → `all` → `todos` (`lines 46–50`).
   - Short click: cycles mode.
   - Long press (1000ms, line 30): sets `lpFired.current = true` and invokes `onLongPress()`.
   - In `App.tsx:866-869`, `onLongPress` opens `SettingsModal` navigated to the `'tabs'` tab.
   - Suppresses `onCycle` on click release if `lpFired.current === true` (`lines 45–52`).

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

### Topic 9: The "+/@" source discrepancy and syntax origin

The task brief references:
*"the cycle button plus the +/@ button beside search"*.

**Factual findings in `apps/nil`:**
1. There is **no button labeled `+/@`** anywhere in the Nil codebase.
2. The control immediately beside `<SearchAutocomplete>` in `App.tsx:679-711` is the `inputMode`
   toggle, displaying a `Plus` (`+`) icon or `Search` icon.
3. The control immediately beside that (`App.tsx:712-740`) is the Session Context button with a `Target` icon.
4. **Origin of `+` and `@`:** Nil is built around a `todo.txt`-inspired capture and query syntax:
   - `+project` designates a project tag (`HelpModal.tsx:146, 195`, `app_demo.go:50`, `README.md:106`).
   - `@context` designates a context/location tag (`HelpModal.tsx:147, 196`, `app_demo.go:50`, `README.md:107`).
   - `ItemTitleInput.tsx:21` placeholder: `"e.g. Review pull request +project @context"`.
5. **Interpretation (proposed):** The owner's phrase *"the +/@ button beside search"* is ambiguous.
   It plausibly refers to the `Plus`/`Search` mode toggle button, or to a conceptual control for
   inserting or toggling `todo.txt` project (`+`) and context (`@`) syntax. This reading is labelled
   as a proposal for owner confirmation.

---

### Topic 10: Inbox view keys (`x`, `p`, `a`, `d`) vs Parallax Operations

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

*Comparison with Parallax Operations:*
- In Nil's `InboxView.tsx`, single unadorned letters (`x`, `p`, `a`, `d`) are intercepted globally on `window`.
  The only guard is `!target.classList.contains("inbox-search-input")` (line 100).
- In Parallax `Operations.tsx:608-624`:
  - Both `Enter` AND `Space` (`e.key === "Enter" || e.key === " "`) call `onSelect(r.task.id)`, which
    opens record inspection.
  - Row selection checkbox (`<td><input type="checkbox" ... />`) independently owns selection.
  - `rowInteractiveProps` marks interactive children so clicks inside them do not trigger row selection;
    it is not a selection toggle mechanism.
  - **No authored Up/Down roving tabindex rows or kanban 2D navigation exists in `Operations.tsx` today.**

---

### Topic 11: Directional navigation: list Up/Down vs dialog Left/Right

- **Nil's list navigation:** Lists in Nil (`TerminalList.tsx`, `InboxView.tsx:113-118`,
  `QuickSearchModal.tsx:84-93`) navigate vertically using `ArrowUp` and `ArrowDown`.
- **Nil's dialog navigation:** Modals in Nil (`EditItemModal.tsx`, `NotesModal.tsx`) provide no
  record-to-record navigation keys.
- **Parallax inspection navigation:** Parallax's extraction of `useControlledRecordNavigation`
  (`CW-20261010-0036`, `docs/navigation-extraction.md`, `TaskInspection.tsx:51-96`) provides:
  - Inside an inspection popup: `ArrowLeft` and `ArrowRight` navigate previous/next records along
    the admitted sequence.
  - Supports explicit `boundaryPolicy: "wrap" | "stop"`.

---

### Topic 12: Fullscreen modal toggle and session mounting reality

In `frontend/src/components/EditItemModal.tsx:59-62, 239, 514-526, 557-568`:
```typescript
// EditItemModal.tsx:59-62
// Fullscreen toggle: when true the modal expands to fill the viewport.
// Persists per session in component state only — intentionally not in
// localStorage so each editor opening starts in the default size.
const [isFullscreen, setIsFullscreen] = React.useState(false);
...
// EditItemModal.tsx:239
if (!open) return null;
```

*Static code observation on mounting:*
1. In `pages/App.tsx:1048`, `<EditItemModal open={quickOpen} ... />` is **always mounted** in the component tree.
2. When closed (`quickOpen === false`), `EditItemModal.tsx:239` executes `if (!open) return null;`.
   The DOM elements are unmounted, but the React component instance **remains mounted in memory**.
3. `isFullscreen` (line 62) has no `useEffect` resetting it when `open` changes; the only setter is
   line 557 (`onClick={() => setIsFullscreen(v => !v)}`).
4. **Result:** Despite the code comment claiming each opening starts in default size, `isFullscreen`
   actually **persists across close and reopen** within the app session in Nil's running code.
