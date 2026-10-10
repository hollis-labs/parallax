# DEC-073 Owner Questions Sheet: Fragments Reader Recreation Example

**Task Reference:** CW-20261010-0096 / PRJ-20261004-0003 / EP-20261010-0006  
**Agent:** `task-parallax-3` (`msg://agent/agent-mux/agt_0wg67s9rcs`)  
**Target:** Routed through `launch-worker-1` (`msg://agent/agent-mux/agt_d7rr0npkcj`)  
**Status:** Proposed Defaults for Owner Decision (DEC-073)

---

### 1. Standalone Route & Default Scope

* **Question:** What is the canonical route entry point and default landing scope for the standalone Fragments Reader?
* **Proposed Default:** `/?example=reader&scope=inbox`
* **Rationale:** Aligns directly with existing Parallax whole-app standalone examples (`?example=torque`, `?example=chat`, `?example=administration`, `?example=workspace`, `?example=messaging`). Defaulting to `scope=inbox` matches reader workflow priorities where unread/inbox triage is the primary entry activity.

### 2. URL Scope Canonicalization

* **Question:** How should invalid, missing, or repeated `scope` query parameters be handled?
* **Proposed Default:** Canonicalize immediately to `scope=inbox` using `window.history.replaceState` (without pushing a new history entry).
* **Rationale:** Prevents polluting browser session history with malformed URLs and ensures reproducible URL sharing and bookmarking across clients.

### 3. Scope Model Parity (Inbox / Library / All)

* **Question:** How should fragments be partitioned across the three tabs (`Inbox`, `Library`, `All`)?
* **Proposed Default:** Maintain exact primary source (`apps/fragments-engine/apps/sysop`) parity where `inbox` represents an actionable subset (unread / pending triage), and `library` and `all` present the full library collection (14 fixture items).
* **Rationale:** Faithfully reflects the authored source behavior without assuming unverified backend filtering schemas or new taxonomy rules.

### 4. Search and Entity Filtering Exclusion

* **Question:** Should an entity search bar, omnibar, or faceted filter rail appear on the reader example page?
* **Proposed Default:** Excluded. The reader route provides a single-column list with `PageHeader` ("Reader") and manual `Refresh` button only.
* **Rationale:** Keeps the reader list focused strictly on reading and triage ergonomics, respecting the bounded small-example scope and avoiding premature extraction of search widgets.

### 5. Card Activation Semantics (Proposed Local Adaptation vs Source Parity)

* **Question:** What activation semantics should apply to `ReaderCard`, given that each card contains embedded tabs, note inputs, tag removal buttons, reading state toggles, and action pills?
* **Proposed Default:** The card uses button/popup-trigger semantics (`role="button"`, `aria-haspopup="dialog"`, `tabIndex={0}`) rather than link role, because activation opens an in-place modal inspection dialog rather than performing browser navigation. This is an explicit **proposed Parallax local adaptation rather than source parity** (in the primary `apps/fragments-engine/apps/sysop` source, `openItem` navigates to `/reader/:id`). The card is activated by primary mouse click, clean `Enter`, or clean `Space`. Clicks and key presses originating from interactive descendants (`a`, `button`, `input`, `select`, `textarea`, `[role="button"]`, `[role="tab"]`, `[data-reader-ignore-card-click]`), text selections (`window.getSelection()`), `defaultPrevented` events, composition/IME (e.g. `keyCode === 229`), or modifier keys (`Shift`, `Control`, `Alt`, `Meta`) are strictly rejected.
* **Rationale:** A link role should not imply navigation when an action opens a dialog. Using `role="button"` with `aria-haspopup="dialog"` communicates accurate popup-trigger semantics while preventing accidental activations during text selection, form interactions, or modified keystrokes.

### 6. Focus Return on Dialog Dismissal

* **Question:** Where should focus land when closing media preview or fragment detail inspection dialogs?
* **Proposed Default:** Focus returns deterministically to the originating element (the specific `ReaderCard` element with `tabIndex={0}`, or the visual preview trigger button) via Base UI `finalFocus` reference. If the specific element is stale or disconnected, an explicit fallback returns focus to an admitted reader card.
* **Rationale:** Meets accessibility guidelines (WCAG 2.4.3 Focus Order) and ensures keyboard users remain at their current position in the list.

### 7. Provenance Spine Description

* **Question:** What operational facets are represented by the left-edge 3-segment provenance spine on `ReaderCard`?
* **Proposed Default:** The three segments represent operational status tones for:
  1. `triage` (operational triage tone)
  2. `enrichment` (operational enrichment tone)
  3. `media` (operational media acquisition tone)
* **Rationale:** Faithfully reflects the primary source provenance spine contract (`triage/enrichment/media`).

### 8. Local Fictional Fixture Mutations

* **Question:** How should user commands (tag edits, note saving, reading progress, effect actions) take effect?
* **Proposed Default:** All commands execute purely against in-memory local fixture state. No network requests, SSE streams, timers, or persistent storage are invoked. A "Reset fixture state" button in the pinned footer restores the initial state.
* **Rationale:** Adheres to Parallax standalone architectural constraints where examples provide realistic interactive ergonomics without backend side-effects or network flakiness.

### 9. Self-Contained Media Format

* **Question:** How should visual media (article preview images, gallery slides, video posters) be delivered?
* **Proposed Default:** Embedded as self-contained SVG data URIs directly within `reader-example.json`.
* **Rationale:** Eliminates external network requests, avoids blob URL leakages, and guarantees reproducible rendering across test suites, Storybook, and headless CI environments.

### 10. Standalone Detail Route Scheme & Scope Preservation

* **Question:** What is the canonical route structure for the standalone Reader Detail Page?
* **Proposed Default:** `/?example=reader&fragmentId=${fragmentId}&scope=${scope}` (with optional `&revision_id=${revisionId}`). Missing or unrecognized scope canonicalizes to `inbox`.
* **Rationale:** Parallax hosts standalone apps using query parameters (`?example=...`). Mapping the sysop `/reader/:fragmentId` route into `?example=reader&fragmentId=...` preserves the overarching Parallax URL scheme while retaining origin `scope` context for return navigation through native browser history and the "Reader" back button.

### 11. Guarded Record Navigation & Boundary Policy (CW-20261010-0036 Contract)

* **Question:** How should previous/next record navigation behave across admitted fragment lists?
* **Proposed Default:** Enforces `boundaryPolicy: "stop"`, where navigation terminates at the start and end of the admitted list without wrapping. Navigation strictly admits only IDs belonging to the origin scope projection (`inbox`, `library`, or `all`).
* **Rationale:** Stop bounds prevent disorienting list wrap-around during reading sessions. Respecting admitted list-origin projection ensures users only navigate between items present in their chosen scope.

### 12. Navigation Keyboard Shortcut Filtering & Ownership Veto

* **Question:** Under what conditions should global ArrowLeft and ArrowRight keyboard shortcuts trigger record navigation?
* **Proposed Default:** Arrow shortcuts trigger navigation only when focus is outside editable elements (`input`, `textarea`, `select`, `contenteditable`), outside open modal dialogs or alert dialogs, outside media players/controls, and without modifier keys (`Shift`, `Control`, `Alt`, `Meta`), IME composition (`isComposing`, `keyCode === 229`), or `defaultPrevented`. Any active dialog or modal strictly vetoes global record navigation.
* **Rationale:** Prevents accidental navigation while typing notes, scrubbing media, or navigating inside modal dialogs (such as gallery inspection or image zoom).

### 13. External Provider Media Inertness & Local Asset Guarantee

* **Question:** How should external video, audio, or third-party embed links (e.g. YouTube) behave in fixture mode?
* **Proposed Default:** Rendered as inert, accessible local placeholders with no external network requests, third-party iframes, or blob streams. Local media relies exclusively on self-contained SVG data URIs.
* **Rationale:** Prevents network flakiness, sandbox CSP violations, tracker leakage, and non-deterministic behavior in automated test environments.

### 14. Detail Page PM Inert Writes & Specimen Boundary

* **Question:** How are reading progress, notes, tags, and media materialization handled on the detail page?
* **Proposed Default:** Strict PM inert write boundary is enforced. Notes, tags, reading progress, and media materialization are presented as read-only fictional specimens with explicit "Read-only specimen" labels and fenced callbacks. Simulated mutations are completely disallowed (not merely network-free). Note textareas are `readOnly` with no local saving or "Saved locally" / "Note added" toast announcements. Tags render without add/delete controls. The header "Refresh" button re-synchronizes the admitted state.
* **Rationale:** Adheres to supervisor review directive (CW-20261010-0097) preventing false impressions of state persistence, while preserving taxonomy, typography, and visual layout parity.

### 15. Committed Admission & Lifecycle Leases (Custody Proof)

* **Question:** How do detail page actions, window keyboard navigation, and dialogs guard against stale callbacks and competing foreground layers?
* **Proposed Default:** All detail actions (Back, Refresh, Previous, Next navigation) require captured committed lifecycle admission (`alive`, `generation`, `access`, `layer`, `activity`) and current-layer foreground check (`currentLayer(root)`). If an unregistered dialog, menu, listbox, or outside foreground owner is active, background callbacks strictly refuse. Stale DOM callbacks retained across retirement boundaries never revive.
* **Rationale:** Guarantees custody safety across React StrictMode, Concurrent Mode, route changes, and nested modal overlays matching Tachyon Nav and Flux Chat contracts.
