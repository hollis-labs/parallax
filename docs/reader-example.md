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
  - `ReaderDetailPage.tsx`: Full detail page composing header, metadata, reading stage, state summary, and notes
  - `ReaderDetailHeader.tsx`: Back button, inbox item navigation (previous/next), reading state slot, copy link, and refresh
  - `renderers/`: Dedicated renderer implementations for all 8 media types:
    - `ArticleRenderer.tsx`: Full markdown preview with full-content availability flag
    - `ImageRenderer.tsx`: Large preview with `MediaDialog` modal zoom and caption
    - `GalleryRenderer.tsx`: 4-item strip with active stage, `aria-live` polite count line, mixed acquisition states (`available`, `pending`, `reference_only`, `failed`), and `MediaDialog` with `ArrowLeft`/`ArrowRight`/`Home`/`End` keyboard controls
    - `VideoRenderer.tsx`: Inert video frame with play icon, video metadata, description, transcript panel with status and links, and captured page article
    - `FallbackRenderers.tsx`: `AudioRenderer`, `DocumentRenderer`, `TextRenderer`, and `UnknownRenderer` fallbacks
    - `ResourceStatePanel.tsx`: Unified token-based acquisition and availability status alerts
    - `MediaDialog.tsx`: Accessible dialog wrapper with deterministic focus return
  - `model.ts`: State normalization, 10 public themes registry, UTC date formatting, operational tally derivation, scope definitions, and detail route parameters (`fragmentId`, `revision_id`)
  - `Standalone.tsx`: Standalone harness with popstate and URL synchronization

### Reader Detail Page & Media Renderers (CW-20261010-0097)

`/?example=reader&fragmentId=${fragmentId}&scope=${scope}` renders the full detail view for a fragment, recreating `apps/fragments-engine/apps/sysop/src/pages/ReaderDetailPage.tsx` within Parallax standalone conventions.

#### Guarded Record Navigation (`CW-20261010-0036` Contract)
- Powered by `useControlledRecordNavigation` from `@hollis-labs/design-components`.
- Enforces `boundaryPolicy: "stop"`: navigation halts at the boundaries (previous is disabled on the first item; next is disabled on the last item) without wrapping.
- Admitted IDs strictly project the items from the origin `scope` (`inbox`, `library`, or `all`).
- Shortcuts (`ArrowLeft` / `ArrowRight`) are strictly guarded:
  - Vetoed when focus is inside editable targets (`input`, `textarea`, `select`, `contenteditable`, `data-reader-nav-exclude`).
  - Vetoed when any modal dialog or alertdialog is open on the page.
  - Vetoed when focus is inside media controllers or video/audio elements.
  - Vetoed when keyboard event has modifier keys (`Shift`, `Control`, `Alt`, `Meta`), IME composition (`isComposing`, `keyCode === 229`), or `defaultPrevented`.
- Stale or retired callbacks from previous render generations are discarded via unique unhoisted identity checks.

#### Renderers & Media State Handling
1. **Article (`article`):** Renders readable markdown preview text and announces full-content status when `full_content_available` is true.
2. **Image (`image`):** Displays authorized preview with alt text, caption, and "View larger" button launching `MediaDialog` with focus return.
3. **Gallery (`gallery`):** 4-item horizontal strip covering all four acquisition states (`available`, `pending`, `reference_only`, `failed`), active stage, `aria-live` item counter, kind badge, and modal dialog with keyboard navigation (`ArrowLeft`, `ArrowRight`, `Home`, `End`).
4. **Video (`video`):** Inert video player preview placeholder with play icon, video metadata, description, transcript status panel, and embedded article section. No external network requests or third-party iframe embeds.
5. **Audio (`audio`):** Extension point placeholder showing audio icon, acquisition state panel, and authorized source link.
6. **Document (`document`):** Extension point placeholder showing document icon, acquisition state panel, and authorized source link.
7. **Text (`text`):** Formatted article presentation for raw plain text captures.
8. **Unknown (`unknown`):** Graceful fallback displaying readable text excerpt with `FileQuestion` icon.

#### State & Revision Handling
- **Missing or Invalid Revision:** Supplying multiple `revision_id` parameters or an empty `revision_id=` displays an `EmptyState` explaining "The revision link is invalid." without rewriting the URL.
- **Unrecognized Fragment:** Navigating to an invalid or unknown `fragmentId` displays "The Reader item could not be loaded." with a "Back to Reader" action.
- **Copy Link:** Uses `navigator.clipboard.writeText` to copy the canonical URL and announces "Link copied" through an `aria-live="polite"` status message.
- **Manual Refresh:** Header Refresh button synchronously resets any local fictional fixture mutations.

