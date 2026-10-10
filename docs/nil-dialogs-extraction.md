# Nil dialog behavior candidate

CW-20261010-0092 uses the full reviewed Nil0089 spec and DEC-079 seven-default
confirmation. The current author source is authoritative; older task text saying
InspectionDialog lacks focus props is stale. It already forwarded Base UI's
initialFocus/finalFocus. Native compatibility remains available.

This task adds shared optional fullscreen and admitted returnFocus behavior to
Dialog, AlertDialog and Sheet popup compositions; Detail/Form/Confirm,
Inspection, Command, JsonModal and OverlaySidebar forward it. The root's existing
controlled/uncontrolled/canceled-open contract and native trap remain in Base UI.
Public API details and precedence are in design-components/docs/nil-dialogs.md.
Root design-kit files, version, tags, publishing and live applications are outside
this change.

## Concrete consumers

`frontend/src/nil-dialog-proof/Proof.tsx` is a local Nil-style editor/search
workbench. It demonstrates all modal variants, session persistence, a dirty
editor, nested confirmation, explicit retired-opener fallback and the two mode
controls. It is not CW0093's Nil app recreation. List Up/Down owns row focus;
inspection Left/Right uses the landed controlled-navigation hook and yields to
editors and nested dialogs.

`TorqueProof.tsx` consumes the actual seeded fictional `torqueSource` operations
projection and landed OperationsListPage through TorqueModalProof. It presents
dense task-ID/status search results, a read-only inspection and title-owned focus
with horizontal record navigation. This is a second source and dashboard idiom,
not another label on the Nil editor.

`LayerProof.tsx` is the exact registration regression shared with CW0091: a
current registered lower menu permits Escape in its newer registered sibling
portal dialog. Unrelated visible popups and retired lower registrations veto
outer dismissal. The generic stack exception names only exact roots of current,
connected live/admitted lower registrations. The palette's own results exception
separately checks its current input's aria-controls, results role/ID and root
containment; it is not a blanket descendant exception.

`SearchPalette` owns input focus, aria-activedescendant Up/Down, Enter activation,
a static keyboard radio strip and clear-before-close Escape. It uses the existing
layer/coordinator and current-frame leases. Composition updates remain editable
while navigation and dismissal are vetoed. The notification debounce is fenced
by current source, access, open state and overlay ownership. Async request/result
custody stays with the caller.

Palette boundary stop, radio wrap and configurable 150ms debounce are author
implementation proposals routed to PM; the owner sheet does not decide them.
No invented owner confirmation, Alt+number shortcut, or alternative Space-select
policy is claimed. CycleModeToggle preserves the existing appearance ModeToggle;
secondary pointer handling is a caller seam pending actual CW0091 main landing.
No unlanded branch is imported or cloned.

## Evidence and replay

Fixtures use seed 4421 and reference 2026-10-04T14:30:00Z. All effects remain
local inert intents. Playwright covers every variant, all Sheet sides, focus and
selection before/after fullscreen, open reset, admitted return, nested ownership,
composition clear/close, filter stability, unrelated-popup veto, second-source
navigation and 1280/390 viewports including 420px height. Physical touch and
native hardware/OS IME acceptance are not claimed.

The author retains original failures and native logs/screens in owned disk
scratch. The initial masked-opener assertion showed body focus instead of the
current opener; the correction resolves admission only after primitive aria-hidden
cleanup, under the matching committed closed frame/activation. Queue replacement,
Activity retirement and ordinary unmount must not revive old callbacks.

`scripts/nil-dialogs-provenance.py --kit <owned-kit> --output <owned-map.json>`
checks the actual current source/build/archive/pin/installed files and rejects
missing or extra installed package files. Tarball contents remain at package
version 0.4.0; the filename is an unpublished source snapshot. No registry release
is implied.

`scripts/replay-nil-dialogs.sh` creates fresh stages from exact Git heads supplied
through NIL_KIT_HEAD and NIL_PARALLAX_HEAD. It requires NIL_KIT_REPO and a copied
warm NIL_NPM_CACHE; missing cache entries fail offline. It runs focused current
return/layer controls and checks the committed local archive against a fresh
installed pin. Native acceptance requires the retained Chromium/library/font
bundle (or an independently provisioned equivalent), Storybook and Playwright;
the cheap recipe does not install those or replay the whole native suite. Run
that suite through heavytest with frontend/nil-dialogs.playwright.config.ts and
owned ports 18932. Stop only owned listeners; retain worktrees, proofs and replay
stages for independent review. Dependency caches and browser tools are inputs,
not claimed as rebuilt from source by this task.
