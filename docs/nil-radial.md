# Nil radial behavior specimen

CW-20261010-0091 promotes separate public `useLongPress` and `RadialMenu`
DOM primitives. This lab consumes an unpublished, same-version local candidate
archive through the public package entry. The registry version number does not
establish that these APIs are published.

Open `/nil-radial.html` or Storybook `Behaviors/Nil/Radial`. The Nil story uses
seed 4421, reference 2026-10-04T14:30:00Z, source-derived tutorial todo titles
and explicitly local note fixtures. Counters and action output are inert local
effects. The Message story supplies a separate action vocabulary, sparse IDs,
long labels and a disabled action. A standalone secondary-action button also
exercises the hook without opening an overlay.

The primary source read was Nil `RadialMenuWrapper.tsx`, its TerminalList call
site and `app_demo.go` at cab453286f83492d242ead69199e4eb70be5f5ba. Todo has
eight actions, note five, and More four. Coordinates preserve the actual
cos/sin orientation: zero points right and ninety down. The reviewed spec's
top/right angle labels disagree with that source. Note COPY remains COPY;
there is no invented note More action. Full Nil recreation belongs to 0093.

Hold a row for 1000ms. Movement beyond eight CSS pixels, early release, leave,
cancel, scrolling, blur, root removal, disable or committed source replacement
retires the pending hold. A fired gesture suppresses its originating release
click only. The next independent pointer gesture and keyboard click still work.
Background roots only: an active shared layer or visible overlay vetoes holds,
including a hold inside a dialog. Future owned-layer admission is separate.
Source, access, activation and admitted layer identity guard deferred work;
retained handlers and cancel functions cannot acquire a newer frame's authority.

Focus a row and press Shift+F10 or ContextMenu to open. Arrows and Tab cycle
enabled actions and center. Enter/Space activate; center and Escape return from
More before closing. The current source's section action is disabled. A newer
registered dialog retains Escape custody, then closing the menu returns focus
through the shared admitted resolver. Background query and composition keep
their own keys. Geometry clamps measured action bounds to the visual viewport;
color, spacing, text and focus styling use public tokens.

The authored prototype preceded upstream promotion. Its source snapshot and
hash map are retained under the owned `.scratch/nil-radial/prototype-source`
directory. Final source/archive/installed provenance, raw browser output,
screenshots and gate logs are retained in the same owned evidence directory.
Coverage tracks the named local specimens. Author native execution and
independent source/byte review are attributed separately; task receipts record
acceptance.

`frontend/tests/nil-radial.spec.ts` covers Chromium mouse holds, actual keyboard
actions, release custody, replacement, edge bounds at 1280×800 and 390×420,
and the second idiom. CDP touch is browser emulation. Composition events and
the nested-dialog fixture setup are synthetic and explicitly labelled in the
test source; there is no claim of physical touchscreen or native OS IME proof.
No provider, persistence, backend or real-record mutation is exercised.

The bounded custody controls force a labelled synthetic host position commit after
explicitly focusing the background query, then use native viewport and keyboard input. A
separate native backdrop press spans a labelled synthetic committed source replacement;
its retired release leaves the replacement open, while a fresh native press closes it.
Historical failing traces and source/archive bytes are retained separately.
