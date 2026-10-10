# Standalone Reader Example

`/?example=reader` mounts a standalone Fragments Reader list recreation matching the primary visual source from Fragments Engine Sysop (`apps/fragments-engine/apps/sysop`). The example provides a single-column list (max width 76rem) with scope navigation tabs (`Inbox`, `Library`, `All`), PageHeader with manual `Refresh` button, fragment counter line, responsive `ReaderCard` items, and a pinned snapshot footer. The same composition powers API-free **App Examples / Reader** stories (`app-examples-reader`).

The source is the generated `fe.reader.list.v1` fixture family at fixed reference clock `2026-10-04T14:30:00Z` and seed `4421`. It contains 14 curated fragment records covering all eight renderer types (`article`, `image`, `gallery`, `video`, `audio`, `document`, `text`, `unknown`), multi-axis operational summaries, reading states, attributed tags, curated notes, capture notes history, and self-contained SVG data URI media assets.

The URL carries canonical `scope` state (`inbox`, `library`, `all`). Any missing, unrecognized, or repeated `scope` parameters are automatically canonicalized to `scope=inbox` via `window.history.replaceState`.

Each `ReaderCard` includes:
- Left-edge 3-segment provenance spine visualizing triage, enrichment, and media acquisition operational tones.
- Top metadata line displaying source provider, hostname, formatted publication date, and capture frequency.
- Clamped 2-line title and compact reading controls (toggle read/unread and reading position popover).
- Inert media renderer slot (14rem on md+ viewports) supporting image, gallery, and video previews with modal inspection and focus return.
- Inner tablist with `Content`, `Curated note`, and `Capture note` views.
- Plain text excerpt summary, provenance attribution, user and provider attributed tags with inline addition and removal.
- Effect action pills for local asset acquisition request, routing, and materialization intents.
- Five-axis operational summary (`Triage`, `Routing`, `Materialization`, `Enrichment`, `Media`).
- Outbound "View source" link when a valid HTTP/HTTPS URL is supplied.

Native keyboard (`Enter`, `Space`) and primary mouse clicks activate the card to open full fragment detail inspection in a dialog. Interactive descendants (`a`, `button`, `input`, `select`, `textarea`, `[role="button"]`, `[role="tab"]`, `[data-reader-nav-exclude]`), consumed events, and text selections are strictly excluded from triggering navigation. Dismissing the dialog returns focus directly to the originating card element.

States include 5-card skeleton loading, empty state (`No fragments in {scope}`), initial error state with retry button, deterministic 2-page cursor pagination with "Load more" and ID deduplication, and inline page error retry. All commands mutate only fictional local in-memory fixture state.
