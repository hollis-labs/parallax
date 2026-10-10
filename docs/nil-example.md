# Nil operations composition (CW-20261010-0093)

Open `?example=nil` or Storybook **App Examples / Nil**. The example uses the
landed public `OperationsListPage` and design-components controls, with local
fixture state only. Seed **4421**, reference **2026-10-04T14:30:00Z**: 24 todos,
12 notes, six untitled Inbox captures. IDs remain opaque; absent, null and zero
metadata remain distinct. There is no provider, persistence or live Nil adoption.

## Behavior

Todos / Notes / All cycle; Desk and Studio user tabs; Inbox and Archive tabs;
context, project and tag filters; tokenized `+project @context #tag` search;
search/add toggle; local quick capture. Four counted section controls preserve
now / soon / anytime / done order and collapse the same projection used for
selection and inspection. Bulk processing, archiving and confirmed deletion
mutate the fixture. Native row Enter/Space inspect, checkboxes select, row-only
`p` / `a` / `d` act in Inbox. Up/Down navigate rows; dialog Left/Right navigate
records outside editable controls and stop at boundaries.

Cmd/Ctrl+K and guarded Shift-Shift open the public search palette. Its input
retains focus while the result cursor moves, with static filters and no-result
state. Escape closes the top layer; query custody stays with its owner.

The edit dialog retains a local draft, resets fullscreen each opening, preserves
caret across fullscreen changes and prompts before dirty close or navigation.
Cmd/Ctrl+Enter saves and closes. Composing edits remain editable; composition
and keyCode 229 veto shortcuts. IME synthesis is an emulation check, not evidence
from hardware IME.

Public long-press is bound to the background application root with an exact
current row target. The mode secondary hold lives outside portals. A completed
hold suppresses its compatibility click; later native taps and keyboard actions
remain admitted. Radial position/action ordering follows DEC079. No in-dialog
long-press bypass or library repack is present.

## Local adaptation and limits

OperationsListPage has no grouped-row slot. The accepted local adaptation is a
single dense table, section column/counts and four collapse controls. Narrow
rows include desktop metadata inline; scoped token CSS hides those duplicate
columns. At short heights the whole public list layout also scrolls, preserving
the table's own scroll surface and reachable controls. This is not a claim of
Nil grouped-row or owner visual fidelity. New owner visual approval is false.

The example consumes unchanged local public pins. `scripts/nil-example-provenance.py`
materializes source and emitted files and compares archive, lock and installed
bytes against accepted parent receipts. `.scratch/nil` contains author native
receipts, raw failures, browser/tool/cache boundaries and screenshots. Parent
build receipts and independent manager source review remain separate evidence.
The configured remote suite retains the repository's default server addresses;
local replay maps only addresses and rebuilds its own application and Storybook.
