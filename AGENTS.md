# Parallax: agent notes

Fixture-only GUI lab on Substrate (`app-host`). Read docs/architecture.md first, docs/conversion-notes.md for gaps.

- Pins live in Substrate's `bom/bom.yaml`; never edit versions in `go.mod` by hand (`make pins` checks them).
- `cmd/parallax/substrate.yaml` is the manifest; `make generate` rewrites the committed `substrate_wiring.go`.
- Every route is added to the list in `internal/api/api.go` with its scope; the mux and the scope table come from it.
- No `os.Getenv` for settings except `PARALLAX_DATA_DIR`; config goes through `SUBSTRATE_CONFIG`.
- Fixtures are deterministic (seed 4421). `make fixtures` regenerates them; do not hand-edit generated JSON.
- Public repo: run `make scan` (tree; `scan-public.allow` holds reviewed false positives only) before pushing; no secrets, internal hosts or personal paths.
