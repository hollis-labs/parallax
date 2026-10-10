# Flux Settings Candidate & Upstream Proposal — CW-20261010-0094

This document records the design decisions, component boundaries, and upstream gap analysis for the Flux settings candidate recreation in Parallax.

## 1. Scope Decision & Relayed Owner Acceptance

Per PM owner relay `01a123ff-1a7d-7f2d-88b0-72f56e6dead6` and DEC-080:
- Chrispian accepted all Flux defaults exactly as proposed in the CW-20261010-0083 fidelity preparation (`01M4HZ9A8ED9DAWRC28MP9WWJF`).
- Scope for CW-20261010-0094 is strictly narrowed to four representative sections:
  1. **Appearance**: theme selection, real token/theme preview, token-bound color editor, and scoped dark composer for Concrete & Signal.
  2. **Layout**: validated layout preference controls (tool display modes, drawer retention, default working drawer tab, workspace presets coordinated with 0086).
  3. **Shortcuts**: guarded key capture editor, modifier/IME lifecycle guards, conflict detection, and plugin shortcut references.
  4. **Permissions**: fixture tool-grants editor, execution permission policy modes (`Default`, `Accept Edits`, `Plan`, `Yolo`), and grant/revoke switch toggles.
- Profile, provider fallback chains, Agents, Plugins, Observability dashboards, and Agent Builder Wizard are excluded from this candidate per the relayed decision.
- Candidate visuals remain owner-pending.

## 2. Component Boundaries & Local Candidates

All components are implemented in `frontend/src/examples/flux-settings/` as isolated local candidates:

| Component | Role | Public Seams & APIs |
|---|---|---|
| `FluxSettingsShell` | Grouped settings shell with sidebar navigation, breadcrumbs, and hash routing. | Deep-links via `#appearance`, `#layout`, `#shortcuts`, `#permissions`; listens to native `hashchange` events for browser back/forward and deep reloads. |
| `primitives.tsx` | Reusable settings primitives. | `PanelHeader`, `SCard` (with semantic accent borders), `SRow` (horizontal/vertical), `SToggle` (accessible `role="switch"`), `SSelect`, `STextField`, `ThemeSeg`, `Kbd`, `KbdGroup`. |
| `AppearanceSection` | Theme selection and token editing. | Real `ThemePreview` visual hierarchy; token editor grouped by semantic category (`surfaces`, `text`, `brand`, `primary`, etc.); native color picker + hex/rgba input; token presets; built-in theme duplication and protection. |
| `LayoutSection` | Layout and stream preferences. | Validated controls for tool call style (`indicator`, `minimal`, `compact`, `full`), drawer retention (`5`, `15`, `30`, `60`, `-1`), default bottom drawer tab (`scratchpad`, `terminal-1`, etc.), and presets (`focus`, `default`, `workspace`, `reading`) matching 0086's `layoutStorage`. |
| `ShortcutsSection` | Guarded key capture editor. | Event-captured key listener with modifier-only filtering, IME composition suppression (`isComposing`), Escape cancellation, nested layer priority (`stopPropagation`), and shortcut conflict detection. |
| `PermissionsSection` | Tool grants and policy editor. | Permission policy selector; searchable tool whitelist with switches; metrics (Granted, Discovered, Auto-Loaded); inert local actions with clear feedback. |

## 3. Shared Library Gap Analysis (Upstream Proposals)

Before proposing extraction into `@hollis-labs/kit-settings` or `@hollis-labs/design-components`, the following gaps were identified against current pinned versions:

### `@hollis-labs/kit-settings` (v0.2.0)
- **Current state**: `kit-settings` is strictly schema-driven for flat scalar/enum fields (`SettingsGroupForm`, `SettingsRenderer`, `SettingsProvenanceRenderer`, `SettingsWizard`).
- **Gaps**:
  1. **Navigation-Grouped Settings Shell**: No shell component exists in `kit-settings` with grouped categories ("You", "System"), breadcrumbs, and hash deep-linking.
  2. **Theme/Token Preview**: No live token-bound preview canvas or palette inspector.
  3. **Key Capture**: No keyboard remapping or shortcut binding form control.
  4. **Tool Grants / Capability Whitelist**: No master-detail or toggle list for per-tool execution grants with risk indicators.

### `@hollis-labs/design-components` (v0.4.0)
- **Current state**: Ships atomic UI primitives (`Button`, `Callout`, `DetailDialog`, `JsonViewer`, `MetaList`, `Sheet`).
- **Gaps**:
  1. `Kbd` / `KbdGroup` keycap presentation primitives.
  2. Guarded key capture input (`KeyCapture`).

### Second-Consumer Gate (DEC-026)
Per DEC-026, components built here must remain Parallax local candidates until a second distinct consumer (e.g. Tangent, Nanite Administration, or sysop) requires the same abstraction with independent requirements. No premature package extraction or promotion is performed under CW-20261010-0094.

## 4. Exact Source Provenance & Hashes

The candidate directly recreates the verified Flux source files:

| File | Exact SHA256 Hash |
|---|---|
| `SettingsPage.tsx` | `0fb2872bb3bf8b97d0156221f769f2973996dbc9c6a90d699f870297f155838c` |
| `primitives.tsx` | `c81b419d0ec1c1611bec1499f5c48ace3b78c9307ece1a60dbf949a8ad5d3827` |

### Environment Parameters
- **Deterministic Seed**: `4421`
- **Reference Clock**: `2026-10-04T14:30:00Z` (fixed; no `Date.now()`, no live network)
- **Ports Allocated**:
  - `18941`: Application
  - `18942`: Storybook
  - `18945`: Vite Dev Server
