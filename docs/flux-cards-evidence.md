# Flux stream candidate evidence — CW-20261010-0087

This records author verification of the isolated cards/input candidate, not owner
visual acceptance. Exact final Git head/tree/archive and post-commit replay receipts
are sealed in the task's owned `.scratch/flux-cards` and reported in Torque. Lead
source/evidence acceptance and fresh configured exact-head CI remain separate gates.

Primary source pins and file hashes are in `flux-cards-source.json`: Flux
`232064c3a5eaa8e8d9e270d89d78df3ca81df231`, go-envelopes v0.4.0
`ae5bc8c72e1d58a81fb858a66c688b1e60c0139e`. The entire 274-file preparation scan
domain matched actual fetched Flux source. All 18 complete fictional operands
validated against primary schemas; deliberate partial omissions failed as expected.
Raw receipts: `source-verification.json`, `schema-validation.json`, and exact
primary-source tar archives in the owned proof directory.

Current corrected gate ran through `heavytest`: frontend typecheck, Biome/design
lint, production build, Storybook build, inventory regeneration, coverage --check,
and all **10 focused native tests passed** (1.1m). Raw log:
`.scratch/flux-cards/corrected-gate-full-native.log` (historical filename; current
contents are the scoped gate, not a local full-suite run), SHA256
`2a97d1340eed78822e6bed1a20a72ccbf0aa1cf079d4ff0f0eeac01afdc4759b`.
The earlier `make check` Go race tests/vet passed against unchanged Go sources;
its retained logs are attributed separately. The remote configured CI will check
unmodified default ports/configuration and the entire native suite at the PR head.

The native evidence includes 18 identities × complete/partial/empty/long ×
1280/390 (390 at 420 height), 144 settled card screenshots; all ten actual built-in
themes in light/dark modes (20 screenshots); tool indicator/minimal/compact/full
and running/done/error; receipt/risk/loop variants; native slash/@, suffix insertion,
IME composing/229, editable busy draft, empty matches, nested popover Escape/focus,
original table-row index actions, unaddressed controls and unresolved sources.
Action bounds now prevent horizontally clipped local footer controls at narrow width.
The final proof directory contains **168 screenshots** including focused menu/layer
specimens. System fonts and token paint remain explicit owner-relayed defaults.

Lead review found that the old mutable alive bit could revive a once-working
callback after Activity hide/show. `lifecycle-reproduction.log` retains the native
failure. The replacement captures a committed activation lease that cleanup only
retires; new activation gets a new lease. Native old-refusal/current-positive tests
passed. Retained close handlers capture a layer revision; queued return tests passed
across source/access/activation/new-layer and newer foreground focus, while current
ordinary close still returns to its origin. No shared kit source was changed.

Raw environment, doubled-@, fractional scroll alignment, fixture markup and intermediate
harness failures are retained as distinct logs. Corrected assertions keep strict
insertion and viewport bounds. Kit-native viewport spacing and local Footer wrapping
fixed the observed presentation issues. `verification-files.json` hashes 193 proof
files (including 168 screens and raw logs/archives), SHA256
`00df610282878de2dea8008ea0f2cc531a434584f8d50e91361f5fd793bb8869`.
Final post-commit sealing adds exact authored source/archive/replay hashes separately.

## Pinned replay and limits

Run `python3 docs/flux-cards-replay.py EXACT_COMMIT` from the owned worktree, then
`heavytest bash .scratch/flux-cards/pinned-replay/run.sh`, retaining its raw log.
The recipe extracts a new pinned Git archive, records every source hash, and runs
only stale/current lifecycle/send/focus controls on port 18915. It explicitly uses
retained installed dependencies plus the owned copied browser/libs/fonts and own
short TMPDIR. It makes no fresh-install claim. Playwright stops its own listener;
retain the stage/worktree/proofs until lead retirement, with no sibling cleanup.

Session-task stays explicitly unsupported. Document/report rich content is plaintext
in this bounded candidate. No producer/transport/provider/SSE, real decisions/retries,
physical OS IME/touch, kit release/promotion or full Flux composition is claimed.
Owner visual approval remains false. Upstream proposal and fidelity differences
are in `flux-cards-proposal.md`; final manager/CI/merge receipts belong to Torque
and the durable full-body/data workspace record after review.
