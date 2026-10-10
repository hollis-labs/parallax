# Standalone Reader Example

`/?example=reader` mounts a standalone Fragments Reader list recreation matching the primary visual source from Fragments Engine Sysop (`apps/fragments-engine/apps/sysop`). The example provides a single-column list (max width 76rem) with scope navigation tabs (`Inbox`, `Library`, `All`), PageHeader with manual `Refresh` button, fragment counter line, responsive `ReaderCard` items, and a pinned snapshot footer. The same composition powers API-free **App Examples / Reader** stories (`app-examples-reader`).

The source is the generated `fe.reader.list.v1` fixture family at fixed reference clock `2026-10-04T14:30:00Z` and seed `4421`. It contains 14 curated fragment records covering all eight renderer types (`article`, `image`, `gallery`, `video`, `audio`, `document`, `text`, `unknown`), multi-axis operational summaries, reading states, attributed tags, curated notes, capture notes history, and self-contained SVG data URI media assets.

The URL carries canonical `scope` state (`inbox`, `library`, `all`). Any missing, unrecognized, or repeated `scope` parameters are automatically canonicalized to `scope=inbox` via `window.history.replaceState`.

Each `ReaderCard` includes:
- Left-edge 3-segment provenance spine visualizing operational status tones: Segment 1 = `triage`, Segment 2 = `enrichment`, Segment 3 = `media`.
- Top metadata line displaying source provider, hostname, formatted publication date, and capture frequency.
- Clamped 2-line title and compact reading controls (toggle read/unread and reading position popover).
- Inert media renderer slot (14rem on md+ viewports) supporting image, gallery, and video previews with modal inspection and focus return.
- Inner tablist with `Content`, `Curated note`, and `Capture note` views.
- Plain text excerpt summary, provenance attribution, user and provider attributed tags with inline addition and removal.
- Effect action pills for local asset acquisition request, routing, and materialization intents.
- Five-axis operational summary (`Triage`, `Routing`, `Materialization`, `Enrichment`, `Media`).
- Outbound "View source" link when a valid HTTP/HTTPS URL is supplied.

### Interaction Semantics & Local Adaptation

In the primary visual source (`apps/fragments-engine/apps/sysop/src/pages/ReaderPage.tsx`), selecting or clicking a card called `openItem(id)` which performed browser navigation to the dedicated route `/reader/:id`.

In the Parallax Standalone Reader Example, this is implemented as a **proposed Parallax local adaptation rather than source parity**: the card uses accessible popup-trigger semantics (`role="button"`, `aria-haspopup="dialog"`, `tabIndex={0}`) to open an in-place fragment detail inspection modal. A link role is explicitly avoided because the action does not perform URL navigation.

Activation rules and guards:
- Primary pointer click, clean `Enter`, and clean `Space` activate the card and open the modal dialog.
- Modifiers (`Shift`, `Control`, `Alt`, `Meta`) are strictly rejected.
- Composition and IME events (`isComposing`, `keyCode === 229`) are strictly rejected.
- Events marked `defaultPrevented` are strictly rejected.
- Text selection (`window.getSelection()`) inside the card prevents activation so users can copy text without accidental dialog opening.
- Interactive descendant elements (`a`, `button`, `input`, `select`, `textarea`, `[role="button"]`, `[role="tab"]`, `[data-reader-ignore-card-click]`) stop event propagation to card opening.
- Dismissing the modal dialog returns focus directly to the originating card element via Base UI `finalFocus` callback, with an explicit fallback to an admitted reader card if the originating node is stale or disconnected.

States include 5-card skeleton loading, empty state (`No fragments in {scope}`), initial error state with retry button, deterministic 2-page cursor pagination with "Load more" and ID deduplication (with synchronous finite transitions and zero timers), and inline page error retry. All commands mutate only fictional local in-memory fixture state.

### Primary Source Contracts & Evidence

- **Primary Source Codebase:** `apps/fragments-engine` (commit `eabdfb9e7a06048d95b4d32198eecfc9261f7764`, tree `00f535c776569372d3a1c23e23b31a0e3b0dd4b2`)
  - List entry: `apps/sysop/src/pages/ReaderPage.tsx`
  - Detail page (primary nav target): `apps/sysop/src/pages/ReaderDetailPage.tsx`
  - Card component: `apps/sysop/src/components/reader/ReaderCard.tsx`
  - Reader lib & contracts: `apps/sysop/src/lib/reader.ts`
  - Schema contract: `contracts/browser-capture-reader/v1/schema/reader-list.schema.json`
- **Parallax Fixture Generator:** `internal/scenarios/reader.go` & `internal/scenarios/reader_test.go`
  - Family: `fe.reader.list.v1`
  - Output: `frontend/src/fixtures/reader-example.json`
- **Parallax Implementation:** `frontend/src/examples/reader/`
  - `ReaderExample.tsx`: Single-column list, scope tabs, pagination, and inline inspection dialog modal
  - `ReaderCard.tsx`: Compound card with button/dialog popup-trigger semantics, provenance spine, interactive tabs
  - `ReaderVisual.tsx`: Multi-format media renderer (image, gallery, video) with preview modal
  - `ReaderProvenanceSpine.tsx`: 3-segment operational provenance spine (`triage`, `enrichment`, `media`)
  - `ReaderStateSummary.tsx`: 5-axis operational summary (`Triage`, `Routing`, `Materialization`, `Enrichment`, `Media`)
  - `ReaderInlineActions.tsx`: Effect pills (`acquire`, `route`, `materialize`) and reading position popovers
  - `ReaderNotes.tsx`: Curated and capture note editors with immediate synchronous save and zero timers
  - `model.ts`: State normalization, 10 public themes registry, UTC date formatting, operational tally derivation, and scope definitions
  - `Standalone.tsx`: Standalone harness with popstate and URL synchronization

