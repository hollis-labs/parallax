# Nil decision records and owner decision sheet

CW-20261010-0089 · Parallax PRJ-20261004-0003 · EP-20261010-0006

This document distinguishes **established owner decisions** (already confirmed in DEC-073
and planner handoffs) from the **single owner decision sheet** covering the seven
unresolved behavioral questions. Each unresolved question carries one concrete proposed
default and its rationale, ready for consolidated review by the portfolio manager and lead.

Related documents:
- Source survey & code audit: [`docs/nil-source-survey.md`](nil-source-survey.md)
- Complete behavior specification: [`docs/nil-behavior-spec.md`](nil-behavior-spec.md)
- Template design specification: [`docs/ops-shell-template-spec.md`](ops-shell-template-spec.md)

---

## 1. Established owner decisions (confirmed in DEC-073)

The following behavioral principles were established by the project owner (Chrispian)
in DEC-073 (Tesseract relay `01M4HV1FTKSY20B9RKVPNY683E` / handoff `01M4HR38D2BWASTS5FQ8WF01X1`).
They govern all Parallax recreations and kit adaptations.

| Decision ID | Principle | Scope & direction | Historical Nil divergence |
| --- | --- | --- | --- |
| **DEC-NIL-01** | **`Cmd+K` primary with `Shift+Shift` alias** | `Cmd+K` is the primary shortcut for the quick search palette; `Shift+Shift` (within 300ms) is retained as an alias. | Old Nil had **no `Cmd+K`**; quick search was bound to `Cmd+S` or `Shift+Shift`. |
| **DEC-NIL-02** | **Search modal input focus & immediate arrows** | Opening the search modal focuses the text input immediately; `ArrowDown` / `ArrowUp` moves result highlight without blurring input or losing caret. Filter bar stays static. | Matches Nil `QuickSearchModal.tsx:66, 78-105`, but requires ARIA combobox semantics and accessible filter chips. |
| **DEC-NIL-03** | **Fullscreen option for all modals** | A fullscreen expand/collapse toggle is available as a kit-level option across all dialogs and modals. | In old Nil, fullscreen existed **only** on `EditItemModal.tsx:59-62`. |
| **DEC-NIL-04** | **Cycle button and mode toggle beside search** | Retain the mode cycle button (todos → notes → all) and the input-mode toggle beside search. | Old Nil had `AppModeToggleButton.tsx` and an input-mode toggle button (`App.tsx:679-711`) showing `Plus`/`Search`. |
| **DEC-NIL-05** | **Long-click radial menu** | Retain the radial menu triggered by long click on todo/note rows for fast inline actions. | Old Nil had `TerminalList.tsx:250-281` and `RadialMenuWrapper.tsx:1-351` (suffered from post-hold click bug). |
| **DEC-NIL-06** | **Escape stack importance & layered precedence** | Escape key behavior is critical; overlays must dismiss cleanly in innermost-first order. | Old Nil had accidental cross-layer query clearing (`App.tsx:612` cleared query on quick search Escape). |
| **DEC-NIL-07** | **Torque operations behavior baseline plus Nil focus** | The recreation baseline is Torque's operations table and board behavior, enriched with Nil's keyboard-first focus model. | Parallax Torque operations (`Operations.tsx`) provides the robust table/board baseline. |

---

## 2. Single owner decision sheet (unresolved questions)

Under DEC-073, the author proposes one concrete default with technical rationale for each
unresolved question. The manager consolidates these into a single confirmation pass for Chrispian.

### Question 1: Layered Escape stack vs Nil's per-component listeners

* **Context:** In `apps/nil`, more than 10 independent components attach uncoordinated
  `keydown` listeners to `window` and `document` (`nil-source-survey.md` Topic 3). In `App.tsx:612`,
  `handleClearAll` accidentally omits `quickSearchOpen` from its guard, causing an Escape press
  inside `QuickSearchModal` to close the modal *and* silently wipe the background search query.
* **Proposed default:** **Adopt a single, centralized LIFO layered Escape stack.**
  - The innermost (topmost) active overlay intercepts `Escape`, dismisses itself, and calls
    `e.stopPropagation()` and `e.stopImmediatePropagation()`.
  - Closing an overlay **never clears the background query** or propagates to parent handlers.
  - Background search queries are cleared by `Escape` only when no overlays are active and focus
    is either directly in the search input or explicitly on the empty canvas.
* **Alternatives considered:**
  1. *Per-component listeners with ad-hoc boolean props:* Fragile, prone to state desynchronization
     and omission bugs (as seen in `App.tsx:612`).
  2. *Single global Escape clears everything at once:* Disorienting and destructive for users
     with nested dialogs or active filters.
* **Rationale:** Eliminates accidental cross-layer side effects, provides predictable dismissal
  semantics, and matches the Base UI / design-components overlay architecture.

---

### Question 2: `Cmd+K` primary and `Shift+Shift` alias: text-input guarding & timing

* **Context:** Nil's `KeyboardScope.tsx:18-32` implements `Shift+Shift` within 300ms using
  `Date.now()`. It has no `e.target` check and no IME check (`nil-source-survey.md` Topic 2).
  Typing capitalized words (e.g. `NASA`) or pausing during text entry triggers the search modal.
* **Proposed default:**
  - **Retain 300ms double-tap window** between Shift releases and subsequent presses.
  - **Strictly ignore `Shift+Shift` when focus is inside editable fields** (`input`, `textarea`,
    `[contenteditable]`, or elements with ARIA role `textbox`, `combobox`, `searchbox`).
  - **Strictly ignore during IME composition** (`e.isComposing === true` or `e.keyCode === 229`).
  - **Reset timing window** on any non-Shift key, modifier press (`metaKey`, `ctrlKey`, `altKey`),
    window blur, or touch event.
* **Alternatives considered:**
  1. *Allow `Shift+Shift` in inputs:* Catastrophic for text typing; causes frequent accidental modal opens.
  2. *Shorten window to 200ms or lengthen to 400ms:* 300ms is the proven JetBrains standard;
     200ms feels unresponsive, 400ms increases false-positive rate.
  3. *Remove `Shift+Shift` entirely:* Violates owner decision DEC-NIL-01.
* **Rationale:** Protects normal text entry and internationalized IME typing while preserving the
  muscle-memory shortcut for power users navigating outside form fields.

---

### Question 3: Radial menu hold duration (1000ms) & keyboard access

* **Context:** Nil's `TerminalList.tsx:252` uses a hardcoded 1000ms `setTimeout`. It suffers from
  a post-hold click defect (`TerminalList.tsx:282-298` opens `EditItemModal` upon mouse release),
  lacks `touchmove` scroll cancellation, lacks viewport edge clamping, and provides zero keyboard
  access (`nil-source-survey.md` Topic 7).
* **Proposed default:**
  - **Retain 1000ms initial hold duration** as the safe default for touch and mouse hold.
  - **Fix post-hold click suppression:** The synthesized `click` event following a successful
    long-press hold must be strictly suppressed, preventing the underlying row from opening the editor.
  - **Add touchmove / pointermove cancellation:** Cancel hold timer if pointer moves > 8px
    (prevents triggering during vertical list scrolling).
  - **Add viewport clamping:** Clamp menu center coordinates so the 155px bounding circle never
    clips past screen boundaries (minimum 85px margin from viewport edges).
  - **Add keyboard accessibility:** Provide a keyboard trigger (e.g. `Shift+F10`, context menu key,
    or `m` on a focused row) that opens the radial menu centered on the row, allows arrow-key
    rotary navigation between action wedges, `Enter` to execute, and `Escape` to return focus to the row.
* **Alternatives considered:**
  1. *Shorten hold to 500ms:* Increases accidental triggers during touch scrolling on mobile/trackpad.
  2. *Omit keyboard access:* Violates accessibility guidelines (WCAG 2.1 Keyboard Accessible).
  3. *Replace with standard rectangle context menu:* Loses Nil's distinctive radial interaction model.
* **Rationale:** Keeps the deliberate 1000ms threshold to prevent drag/scroll collisions while
  resolving the critical double-open defect and making the radial menu fully accessible.

---

### Question 4: Clarification of the "+/@ button"

* **Context:** The task brief refers to *"the cycle button plus the +/@ button beside search"*.
  The audit of `apps/nil` confirms that **no literal "+/@" button exists** (`nil-source-survey.md`
  Topic 8 & 9). Beside search sits:
  1. An input-mode toggle (`App.tsx:679-711`) showing a `Plus` (`+`) icon in add mode and a
     `Search` icon in search mode.
  2. A session context button (`App.tsx:712-740`) showing a `Target` icon.
  In Nil's underlying `todo.txt` syntax, `+` is the prefix for projects (`+project`) and `@` is
  the prefix for contexts (`@context`).
* **Proposed default:**
  - **Acknowledge the source reality:** The button beside search is an **input-mode toggle**
    (switching the single input bar between Search query mode and Quick Add mode).
  - **Implement as an explicit Search / Quick Add mode toggle** displaying `Search` / `Plus`
    icons with clear ARIA labels and tooltips.
  - **Support optional syntax tokens:** Provide a quick-insert or facet filter menu supporting
    `+` (project) and `@` (context/agent) filtering, aligning the UI with Nil's todo.txt model
    without fabricating an unconfirmed "+/@" glyph button.
* **Alternatives considered:**
  1. *Create a button with literal text "+/@":* Unclear affordance that confuses users.
  2. *Split into two separate persistent inputs:* Consumes excess horizontal header space.
* **Rationale:** Faithfully reflects the actual Nil codebase while preserving the owner's intent
  to easily switch between search and item creation and filter by project/context.

---

### Question 5: Inbox single-key actions (`x`, `p`, `a`, `d`) vs Torque row keys

* **Context:** Nil's `InboxView.tsx:122-137` binds unadorned single characters (`x` for select,
  `p` for process, `a` for archive, `d` for delete) on `window` (`nil-source-survey.md` Topic 10).
  In Torque / Parallax (`Operations.tsx:608-624`), table rows use standard ARIA grid interaction:
  `Space` toggles selection, `Enter` inspects/opens, and Up/Down navigates rows.
* **Proposed default:**
  - **Fold `x` into standard `Space`** for row selection across all tables and lists.
  - **Preserve `p` (process/today), `a` (archive), and `d` (delete/done) strictly as row-focused
    actions:**
    - Active **only** when keyboard focus is explicitly on a list row (`e.target === e.currentTarget`
      with roving tabindex or listbox selection).
    - **Never** attached at the global window level.
    - Strictly ignored when focus is in an input or during IME composition.
  - When in general operations table or board mode, standard Torque row semantics (`Enter` to inspect,
    `Space` to select) govern.
* **Alternatives considered:**
  1. *Keep global window listeners for x/p/a/d:* Highly dangerous; causes accidental data loss
     when typing in form fields or search bars.
  2. *Eliminate single-key triage entirely:* Slows down high-volume keyboard triage for power users.
  3. *Require modifiers (Cmd+P, Cmd+A, Cmd+D):* Clashes with browser standard shortcuts (Cmd+P = Print).
* **Rationale:** Provides the speed of single-key inbox triage without risking accidental
  destructive actions or interfering with search inputs.

---

### Question 6: Next/prev directional navigation: List Up/Down vs Dialog Left/Right

* **Context:** In Nil, lists use `ArrowUp` / `ArrowDown` for vertical navigation, while dialogs have
  no record navigation (`nil-source-survey.md` Topic 11). In Parallax, CW-20261010-0036 extracted
  `useControlledRecordNavigation` (`TaskInspection.tsx:51-96`), where inspection dialogs use
  `ArrowLeft` / `ArrowRight` to cycle through previous/next records.
* **Proposed default:** **Establish a consistent 2D directional matrix:**
  1. **Vertical lists and tables:** `ArrowUp` / `ArrowDown` navigates rows and items.
  2. **Inspection dialogs and detail modals:** `ArrowLeft` / `ArrowRight` navigates previous and
     next records along the admitted sequence (consuming `useControlledRecordNavigation` with
     `boundaryPolicy: "wrap"` or `"stop"`).
  3. **Multi-column boards (kanban):** `ArrowLeft` / `ArrowRight` moves focus across columns/lanes;
     `ArrowUp` / `ArrowDown` moves focus vertically between cards within a column.
  4. **Precedence:** When an inspection dialog is open over a board or list, the dialog's
     `ArrowLeft` / `ArrowRight` record navigation takes precedence and consumes the event.
* **Alternatives considered:**
  1. *Use Up/Down in detail dialogs:* Conflicts with vertical scrolling within the dialog body.
  2. *Use Left/Right in lists:* Counterintuitive for vertically stacked items.
* **Rationale:** Resolves directional ambiguity cleanly: vertical arrows move within vertical
  containers; horizontal arrows move along the horizontal record navigation axis or across board columns.

---

### Question 7: Fullscreen toggle scope and session persistence

* **Context:** In Nil, fullscreen exists only on `EditItemModal.tsx:59-62`, where `isFullscreen`
  is held in local React state and resets to `false` every time the modal closes. DEC-NIL-03 expands
  the fullscreen capability to all dialogs. The open question is whether fullscreen state should
  persist across modal openings within a session.
* **Proposed default:**
  - **Make fullscreen a standard, optional capability on all dialogs and modals** (including
    `InspectionDialog` and search palettes) using a consistent `<Maximize2>` / `<Minimize2>` header button.
  - **Default persistence policy:** **Reset to default size on each opening** (matching Nil's
    proven behavior).
  - **Opt-in session persistence:** If the owner confirms session persistence, store the preference
    in `sessionStorage` per dialog archetype (e.g. `parallax.dialog.fullscreen.<archetype>`),
    cleared upon browser tab close, never in persistent `localStorage`.
* **Alternatives considered:**
  1. *Always persist fullscreen in localStorage:* Causes unexpected full-viewport jumps across sessions.
  2. *Force all dialogs to open fullscreen unconditionally:* Destroys desktop spatial context.
* **Rationale:** Preserves Nil's sensible default (opening in bounded size prevents visual disorientation)
  while establishing a clean architectural path for session-level persistence if the owner requests it.

---

## 3. Summary of proposed defaults for owner confirmation

| # | Topic | Recommended proposed default | Status |
|---|---|---|---|
| **Q1** | **Escape stack** | Layered LIFO stack; innermost closes first; background query preserved. | Awaiting owner confirmation |
| **Q2** | **Shift-Shift alias** | Retain 300ms window; strictly ignore in editable fields and during IME composition. | Awaiting owner confirmation |
| **Q3** | **Radial menu hold** | Retain 1000ms hold; cancel on >8px drag; suppress post-hold click; clamp to viewport; add keyboard access (`Shift+F10`). | Awaiting owner confirmation |
| **Q4** | **"+/@" button** | Input-mode toggle (`Search` / `Plus`) with project (`+`) / context (`@`) facet syntax support. | Awaiting owner confirmation |
| **Q5** | **Inbox keys** | Fold `x` into `Space`; preserve `p`/`a`/`d` strictly as row-focused actions (never global). | Awaiting owner confirmation |
| **Q6** | **Directional keys** | Lists use `Up`/`Down`; inspection dialogs use `Left`/`Right`; boards use 2D (columns `Left`/`Right`, cards `Up`/`Down`). | Awaiting owner confirmation |
| **Q7** | **Fullscreen scope** | Available on all modals; default resets on open (matching Nil); opt-in `sessionStorage` persistence. | Awaiting owner confirmation |
