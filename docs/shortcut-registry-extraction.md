# Nil shortcut registry & layered Escape ownership — CW-20261010-0090

## Overview

Torque and Messaging adopt the scoped shortcut registry and layered Escape ownership primitives extracted into `@hollis-labs/design-components`:
- `useLayeredEscape`: LIFO Escape stack with explicit consumer ownership, input-clearing priority before dialog closing, and admitted focus return to valid openers.
- `useShortcut`: Scoped keyboard shortcuts with exact modifier matching, editable/interactive target guards, composing/IME guards, and overlay suspension.
- `useShiftShift`: Double-tap Shift detection with 300ms default threshold, modifier cancellation, editable target suppression, and monotonic `getTime` clock injection.
- `useQuickSearchShortcut`: Composite shortcut binding `Mod+K` (`Cmd+K` on macOS, `Ctrl+K` on Linux/Windows) and `Shift-Shift` alias.
- `resolveAdmittedFocusTarget` / `restoreAdmittedFocus`: Safe focus restoration verifying target connectivity, enabled state (`:disabled` checks), and caller admission.

## Two Genuine Consumers & Distinct Idioms

1. **Torque Operations & Task Inspection (Dashboard / Task Management Idiom)**:
   - `TaskInspection`: Registers modal inspection overlay on the LIFO Escape stack with `boundaryPolicy: "wrap"`, restoring focus to the originating row action button trigger.
   - `Operations`: Mounts `useQuickSearchShortcut` to focus the task filter input via `Mod+K` and double-tap `Shift` (with 300ms window). Search input Escape key handling consumes the event (`stopImmediatePropagation()`) to clear the query first without dismissing open menus or parent surfaces. Background filter query is preserved when child inspection dialogs are dismissed.

2. **Messaging Example (Communications / Chat Idiom)**:
   - `MessagingExample`: Registers message candidate inspection dialog on `useLayeredEscape`. Search conversations input independently clears filter text on Escape with immediate propagation suppression.
   - Positive and retired negative controls verify committed React fiber frame fencing: held close actions succeed during active presentation and safely refuse execution after layer unmount.

## Packaging & Candidate Provenance

- Package: `@hollis-labs/design-components` candidate `0.4.0-cw0090`.
- Tarball: `third_party/hollis-labs-design-components-0.4.0-cw0090.tgz`
- SHA256: `da06b88070d607907f08fad5282e2da28d91fc34d1e1c593d4acb4cf1ad9aa5f`
- Source Commit: `10e360b871116e0f70ae418d769d61064f4488d1` (`packages/design-components` tree `41836c6f575d03f54df33bcb057d50abf9d7acd6`)
- Provenance manifest: `third_party/hollis-labs-design-components-0.4.0-cw0090.provenance.json`
- Pinned in `frontend/package.json` as `file:../third_party/hollis-labs-design-components-0.4.0-cw0090.tgz`.

## Verification & Acceptance

- Unit tests in `design-components`: 22 test cases in `src/__tests__/shortcut-registry.test.tsx` verifying exact modifiers, LIFO ordering, input-clearing priority, frame fencing, focus restoration, and Shift-Shift timing.
- Browser acceptance: Playwright test suite `frontend/tests/shortcut-registry.spec.ts` executed through `heavytest` with isolated task scratch libraries and fonts.
- Typecheck & Lint: Clean pass across frontend (`tsc --noEmit`, `biome check`, `eslint`).
- Design CSS & Optional imports: All variable and import checks pass.
- Export inventory: Synchronized via `scripts/coverage.mjs`.
