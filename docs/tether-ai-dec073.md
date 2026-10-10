# DEC-073 Decision Sheet: Tether Sysop AI Gateway Page Recreation & Routing Proposal

## 1. Context & Authority
- **Task ID:** CW-20261010-0100
- **Project:** Parallax (`PRJ-20261004-0003`, `EP-20261010-0006`)
- **Authority:** `PM01a12388-09fc-7ca4-8f09-e00c95cb06d4`, tracker relay `01M4HV1FTKSY20B9RKVPNY683E`
- **Parent Task:** CW-20261010-0098 (landed merge `71a1dd9`, fixture SHA `25dfb04`, parent record `01M4J12YMWXHRW2Q1JRMS7ZPS9`)
- **Upstream Primary Readback:**
  - Upstream Repository: `/home/chrispian/dev/hollis-labs/apps/tether`
  - Upstream HEAD Commit: `fd17c80b0c4a7861afb877a61e9be9d976926617`
  - Upstream Tree Hash: `a506862471eaf4a16917e44b4ec035229377ad98`
  - Upstream File Commit: `4c07bf4c63633fe9ddfdf5d8246974f8e752db7b`
  - Upstream File Path: `apps/sysop/frontend/src/pages/ai.tsx` (1,725 LOC)
  - Upstream File Blob SHA: `8c0a159afd81866a640531000b1d77945e8f954e`
  - Upstream API Client: `apps/sysop/frontend/src/api/client.ts` (Blob SHA: `352ee96d89e14e48d9c2b54d3d375310a1a9cade`)
- **Design Tokens & Styling Fidelity:**
  - `@hollis-labs/design-tokens` & `@hollis-labs/kit-dashboard`
  - Strict token-only styles in `tether-ai.css` passing `node scripts/check-design-css.mjs`:
    - `11px` -> `var(--text-label)`
    - `10px` -> `var(--text-caption)`
    - `12px` -> `var(--text-xs)`
    - `0.18em` / `0.16em` -> `var(--tracking-label)`
    - Borders -> `var(--color-border)`
    - Surfaces & Backgrounds -> `var(--color-surface)`, `var(--color-bg)`
    - Status tones -> `var(--color-status-*)`

---

## 2. Proposed Route Scheme

### Proposed Canonical Route:
```text
/?example=tether&screen=ai
```

### Dedicated Standalone Route:
```text
/?example=tether-ai
```

### Supporting Parameters:
| Parameter | Values | Default | Purpose |
|---|---|---|---|
| `example` | `tether`, `tether-ai` | `tether-ai` | Example family namespace |
| `screen` | `ai`, `overview` | `ai` (when `example=tether&screen=ai`) | Screen selector across the 4 planned Tether pages |
| `tab` | `config`, `providers`, `routes`, `runtime`, `usage`, `audit`, `budgets` | `config` | 7-tab instrumentation selector |
| `variant` | `standard`, `blocked-health`, `degraded-reliability`, `combined-adverse` | `standard` | Specimen selector for visual and degraded states |
| `appearance` | `ready`, `loading`, `error`, `empty` | `ready` | Visual state inspection |
| `theme` | `p4-white`, `p1-green-phosphor`, `p3-amber-phosphor`, `hi-contrast` | `p4-white` | System theme token selection |
| `mode` | `dark`, `light` | `dark` | Color mode selection |

---

## 3. Source-Based Rationale

1. **Parallax Multi-Screen Precedent:**
   All multi-screen application recreations in Parallax are partitioned under `/?example=<family>&screen=<page>` (e.g. `/?example=torque&screen=tasks`, `/?example=nil&screen=...`).
2. **Four Tether Sysop Pages in Epic EP-20261010-0006:**
   The Tether Sysop suite comprises four distinct surfaces:
   - CW-20261010-0099: Overview Page (`/overview`, `pages/overview.tsx`) -> `screen=overview`
   - CW-20261010-0100: AI Gateway Page (`/ai`, `pages/ai.tsx`) -> `screen=ai`
   - CW-20261010-0101: Activity Monitor (`/activity`, `pages/activity.tsx`) -> `screen=activity`
   - CW-20261010-0102: Registry Page (`/registry`, `pages/registry.tsx`) -> `screen=registry`
   Setting `example=tether` establishes a clean, shared container and model adapter, while `screen=ai` provides truthful routing without conflating distinct pages.
3. **Dedicated Entry Seam:**
   `/?example=tether-ai` is supported concurrently so that tests, Storybook entries, and independent verification do not collide with sibling review of PR #26.
4. **PM Confirmation Status:**
   PM confirmation is not yet claimed. Progress continues with reviewable fixture composition while the route proposal is submitted for review.

---

## 4. Inert Write Controls & Specimen Fidelity

1. **Pure Dashboard & Inspection Surface:**
   The AI Gateway page recreates all 7 tabs (`config`, `providers`, `routes`, `runtime`, `usage`, `audit`, `budgets`) and a `SummaryCards` row.
2. **Inert Write Controls:**
   Effectful write operations (Save config, Reload daemon, Add provider, Edit provider, Delete provider, Add route, Edit route, Delete route) are implemented as **INERT fixture specimens**. They are clearly labeled with `(specimen)` suffixes and display truthful user feedback. No fake delivery receipts or mutations are synthesized.
3. **Public Callback Stubs:**
   Public callback stubs refuse effectful writes.
4. **Deterministic Clock:**
   Fixed reference clock `2026-10-04T14:30:00Z` and seed `4421`; `Date.now()` is prohibited.

---

## 5. Monotonic Frame Leases & Lifecycle Admissibility

1. **Monotonic Lease Tracking:**
   `globalAILeaseSeq` and `retiredAILeases` ensure that when the component unmounts or undergoes an in-page variant change, the prior frame lease is permanently retired.
2. **Nonreviving Retirement:**
   Retired callbacks registered under `window.__tetherAIRetainedCallback` permanently return `false` upon lease retirement and never revive across subsequent variant flips or parent remounts.
3. **Competing Overlay Veto:**
   Background actions and retained callbacks verify `!hasCompetingOverlay()` to ensure modal overlays (dialogs, menus, listboxes) suppress background execution.
4. **Connected Root Verification:**
   Callbacks check `rootRef.current?.isConnected && document.contains(rootRef.current)` to guarantee that detached trees immediately refuse execution.

---

## 6. Cross-Family Identity Links (No Invented Joins)

To prevent invented cross-system joins, the AI Gateway surface provides direct navigation links to established Parallax identities:
- **Torque Operations:** `/?example=torque`
- **Event Ledger:** `/?view=Event+Ledger`
- **Run Explorer:** `/?view=Run+Explorer`
- **Administration:** `/?example=administration`
- **Overview:** `/?example=tether&screen=overview`

---

## 7. Verification Summary
- **Typecheck & Biome:** 100% clean (`npm run typecheck`, `./node_modules/.bin/biome check .`).
- **Design Tokens:** 100% compliant with design tokens and scale rules (`npm run lint:design`, `node scripts/check-design-css.mjs`).
- **Coverage & Imports:** `node scripts/check-optional-imports.mjs` PASS.
- **Storybook:** `AIGateway.stories.tsx` providing 18 portable stories across all tabs, standard/narrow/short viewports, adverse variants, empty/loading/error states, and phosphor themes.
- **Playwright Suite:** `frontend/tests/tether-ai.spec.ts` executed on dedicated port 19025.
