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

### 5. Card Activation & Interactive Descendant Exclusion

* **Question:** What activation semantics should apply to `ReaderCard`, given that each card contains embedded tabs, note inputs, tag removal buttons, reading state toggles, and action pills?
* **Proposed Default:** The card is an accessible link role (`tabIndex={0}`) activated by primary mouse click, `Enter`, or `Space`. Activation opens the fragment detail inspection modal. Clicks and key presses originating from interactive descendants (`a`, `button`, `input`, `select`, `textarea`, `[role="button"]`, `[role="tab"]`, `[data-reader-nav-exclude]`), text selections (`window.getSelection()`), or modifier keys are strictly excluded from triggering card activation.
* **Rationale:** Prevents frustrating misfires when users toggle read status, edit notes, add tags, or inspect visual media, while maintaining standard card clickability.

### 6. Focus Return on Dialog Dismissal

* **Question:** Where should focus land when closing media preview or fragment detail inspection dialogs?
* **Proposed Default:** Focus returns deterministically to the originating element (the specific card or media trigger button) via Base UI `finalFocus` reference.
* **Rationale:** Meets accessibility guidelines (WCAG 2.4.3 Focus Order) and ensures keyboard users remain at their current position in the list.

### 7. Local Fictional Fixture Mutations

* **Question:** How should user commands (tag edits, note saving, reading progress, effect actions) take effect?
* **Proposed Default:** All commands execute purely against in-memory local fixture state. No network requests, SSE streams, timers, or persistent storage are invoked. A "Reset fixture state" button in the pinned footer restores the initial state.
* **Rationale:** Adheres to Parallax standalone architectural constraints where examples provide realistic interactive ergonomics without backend side-effects or network flakiness.

### 8. Self-Contained Media Format

* **Question:** How should visual media (article preview images, gallery slides, video posters) be delivered?
* **Proposed Default:** Embedded as self-contained SVG data URIs directly within `reader-example.json`.
* **Rationale:** Eliminates external network requests, avoids blob URL leakages, and guarantees reproducible rendering across test suites, Storybook, and headless CI environments.
