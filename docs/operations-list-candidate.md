# CW-20261010-0073 operations-list local candidate

This isolated candidate consumes OperationsListPage from the exact locally packed
kit-dashboard archive named `hollis-labs-kit-dashboard-0.4.0-cw0073-final-candidate.tgz`.
Its SHA256 is `894defd92a6378f20ac65a8d329588d2972d3c6f00b5c1a57b58616c629f0a64`
and its source is design-kit commit `cd3a90b16866548d6226c910e48f6f54177a3a40`
(tree `4dd1b9c41d1445f07e4bc62839c80f30626731ba`).
It is **not** the registry 0.4.0 archive. Source candidate, installed byte proof,
registry release, upstream adoption and deployment are separate states.

TorqueModalProof uses actual Torque operations graph records and the authored
operationsMetadata adapter. It explicitly wraps record navigation. RunInlineProof
uses the existing explorerProjection model for run/usage evidence and proposes an
inline list/detail idiom with stop boundaries. The baseline Run Explorer inspector
is modal: this proof neither claims native inline parity nor changes existing routes.
Neither proof creates fixture domains or real transport. Seed 4421 and supplied
UTC reference 2026-10-04T14:30:00Z are preserved. Existing opaque IDs are used whole,
never parsed as positions; reverse task input and sparse projections cover order
independence. Query/facet matching and self-excluding facet counts stay in adapters.

Run `operations-list.html?consumer=torque` or `consumer=runs` under the owned Vite
server, or Storybook Operations/Generic list candidate. Add `scenario=loading`,
`error`, `empty`, `permission-denied`, `large` or `sparse`. Source refresh advances
a separate epoch even when IDs repeat. Retained inspector scopes are diagnostic
objects only on this isolated entry; positive current actions and retired negative
controls are asserted against real adapter records. No API/network/SSE is used.

The browser contract is frontend/tests/operations-list-candidate.spec.ts with its
owned operations-list.playwright.config.ts. It covers query/selection/counts, sorted
reveal, density, keyboard/editor/overlay ownership, current vs retired source action
scopes, eligible focus return, resource states and all ten public themes in both
modes at 1440x900, 1024x768, 390x844 and 390x420. Synthetic IME/keyCode229 diagnostics
are labelled; hardware OS IME, touch and owner visual acceptance remain unclaimed.

Exact commands, raw passing and failed attempts, archive/source/installed hash maps,
screenshots and executable fresh replay are retained under the task-owned
`.scratch/operations-list`. The replay does not depend on the retiring session's
TMPDIR. The task reports the actual candidate/commit/tree/gate receipt when ready;
coverage is bounded evidence, never a claim about every export/state.

No0072 aside implementation,0074 full template/domain migration, npm publication,
tags, credentials, deploy or live checkout changes belong to this proof. A future
core lockstep release should include0035/0036 and0072/0073; PM/Chrispian owns the
temporary key and release window. No release is executed here.

Run the packet with `.scratch/operations-list/replay.sh`; it verifies pinned input
hashes, extracts the committed source to its own retained temporary stage, installs
the exact dependency lock, compares full installed maps and exercises both genuine
consumers. The packet retains its own Chromium, libraries and fonts. The complete
browser command is `cd frontend && playwright test --config operations-list.playwright.config.ts`
with the packet environment shown in `browser-gate-final.sh`.
