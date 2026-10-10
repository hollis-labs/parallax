# DEC-073 Decision Sheet: Tether Sysop Overview Page Recreation & Routing Proposal

## 1. Context & Authority
- **Task ID:** CW-20261010-0099
- **Project:** Parallax (`PRJ-20261004-0003`, `EP-20261010-0006`)
- **Authority:** `PM01a12388-09fc-7ca4-8f09-e00c95cb06d4`, tracker relay `01M4HV1FTKSY20B9RKVPNY683E`
- **Parent Task:** CW-20261010-0098 (landed merge `71a1dd9`, fixture SHA `25dfb04`, parent record `01M4J12YMWXHRW2Q1JRMS7ZPS9`)
- **Upstream Primary Readback:**
  - Upstream Repository: `/home/chrispian/dev/hollis-labs/apps/tether`
  - Upstream HEAD Commit: `3e9e7a42783d4e3df52db25e50e40e05bff4c8c4`
  - Upstream Tree Hash: `a506862471eaf4a16917e44b4ec035229377ad98`
  - Upstream File Commit: `4c07bf4c63633fe9ddfdf5d8246974f8e752db7b`
  - Upstream File Path: `apps/sysop/frontend/src/pages/overview.tsx` (389 LOC)
  - Upstream File SHA256: `ade631e0c33b782fbc05b7860e99ab0fbb318e56f018a13e51ca9e84b07233c3`
- **Design Tokens & Styling Fidelity:**
  - `@hollis-labs/design-tokens` & `@hollis-labs/kit-dashboard`
  - Full public token mapping in `tether-sysop.css`:
    - `11px` -> `var(--text-label)`
    - `10px` -> `var(--text-caption)`
    - `12px` -> `var(--text-xs)`
    - `0.18em` / `0.16em` -> `var(--tracking-label)`
    - `2px 8px` -> `calc(var(--spacing) * 0.5) calc(var(--spacing) * 2)`
    - `gap: 6px` -> `calc(var(--spacing) * 1.5)`
    - Borders -> `var(--color-border)`
    - Status tones -> `var(--color-status-*)`

---

## 2. Proposed Route Scheme

### Proposed Canonical Route:
```text
/?example=tether&screen=overview
```

### Supporting Parameters:
| Parameter | Values | Default | Purpose |
|---|---|---|---|
| `example` | `tether` | (required) | Example family namespace |
| `screen` | `overview` | `overview` | Screen selector across the 4 planned Tether pages |
| `variant` | `standard`, `blocked-health`, `degraded-reliability`, `combined-adverse` | `standard` | Specimen selector for visual and degraded states |
| `appearance` | `ready`, `loading`, `error`, `empty` | `ready` | Visual state inspection |
| `theme` | `p4-white`, `p1-green-phosphor`, `p3-amber-phosphor`, `hi-contrast` | `p4-white` | System theme token selection |
| `mode` | `dark`, `light` | `dark` | Color mode selection |

---

## 3. Source-Based Rationale

1. **Parallax Example Precedent:**
   All multi-screen application recreations in Parallax are partitioned under `/?example=<family>&screen=<page>` (e.g. `/?example=torque&screen=tasks`, `/?example=nil&screen=...`).
2. **Four Tether Sysop Pages in Epic EP-20261010-0006:**
   The Tether Sysop suite comprises four distinct surfaces:
   - CW-20261010-0099: Overview Page (`/overview`, `pages/overview.tsx`) -> `screen=overview`
   - CW-20261010-0100: AI Gateway Page (`/ai`, `pages/ai.tsx`) -> `screen=ai`
   - CW-20261010-0101: Activity Monitor (`/activity`, `pages/activity.tsx`) -> `screen=activity`
   - CW-20261010-0102: Registry Page (`/registry`, `pages/registry.tsx`) -> `screen=registry`
   Setting `example=tether` establishes a clean, shared container and model adapter, while `screen=overview` provides truthful routing without conflating distinct pages.
3. **Default Screen:**
   Navigating to `/?example=tether` transparently normalizes to `screen=overview`.
4. **PM Confirmation Status:**
   PM confirmation is not yet claimed. Progress continues with reviewable fixture composition while the route proposal is submitted for review.

---

## 4. Inert Write Controls & Dashboard Fidelity

1. **Pure Dashboard:**
   The Overview page is an instrumentation and observability dashboard. It requires no write actions or background polling.
2. **Manual Refresh Semantics:**
   The `Refresh` button reloads local fixture data from the deterministic mock API (`createTetherSysopMockApi`). No network requests, daemon sockets, SSE streams, or timers are spawned.
3. **Specimen Controls:**
   Any write controls or future interactive forms remain truthful inert specimens labeled accordingly; no local fake delivery or approval receipts are synthesized.
4. **Deterministic Clock:**
   Fixed reference clock `2026-10-04T14:30:00Z` and seed `4421`; `Date.now()` is prohibited.

---

## 5. Cross-Family Identity Links (No Invented Joins)

To prevent invented cross-system joins, the Overview surface provides direct navigation links to established Parallax identities:
- **Torque Operations:** `/?example=torque`
- **Event Ledger:** `/?view=Event+Ledger`
- **Run Explorer:** `/?view=Run+Explorer`
- **Administration:** `/?example=administration`

In addition, individual panel headers carry direct deep-links:
- Sessions Panel -> Run Explorer (`/?view=Run+Explorer`)
- Event Bus Panel -> Event Ledger (`/?view=Event+Ledger`)
- Catalog Surface Panel -> Administration (`/?example=administration`)

---

## 6. Verification Summary
- **Typecheck & Lint:** 100% green (`tsc --noEmit`, Biome, ESLint design rules).
- **Playwright Suite:** `frontend/tests/tether-overview.spec.ts` covering route scheme, responsive bounds (1280px, 390px, 420px height), variants, keyboard tab navigation, and retained callback refusal.
- **Storybook:** `frontend/src/examples/tether/Tether.stories.tsx` providing isolated portable stories across all variants and appearance states.
