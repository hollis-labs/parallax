# Parallax: agent notes

Fixture-only GUI lab on Substrate (`app-host`). Read docs/architecture.md first, docs/conversion-notes.md for gaps.

- Pins live in Substrate's `bom/bom.yaml`; never edit versions in `go.mod` by hand (`make pins` checks them).
- `cmd/parallax/substrate.yaml` is the manifest; `make generate` rewrites the committed `substrate_wiring.go`.
- Every route is added to the list in `internal/api/api.go` with its scope; the mux and the scope table come from it.
- No `os.Getenv` for settings except `PARALLAX_DATA_DIR`; config goes through `SUBSTRATE_CONFIG`. Paths in the manifest are relative defaults; the `AfterConfig` hook in `cmd/parallax/config.go` anchors them in the data directory.
- Tests and manual runs always set a temp `PARALLAX_DATA_DIR`; `TestMain` enforces it for the test binaries.
- Fixtures are deterministic (seed 4421). `make fixtures` regenerates them; do not hand-edit generated JSON.
- Public repo: run `make scan` (tree; `scan-public.allow` holds reviewed false positives only) before pushing; no secrets, internal hosts or personal paths.
- Frontend (`frontend/`): every `/api/` and `/plugins/` call goes through `src/identity/api.ts` (`apiFetch`/`request`: `X-Requested-With` on writes, flat `{code, message, details?}` errors, a 401 returns to sign-in). The interim sign-in, setup and sign-out screens live only in `src/identity/`; the shared identity kit replaces that directory as a unit. Nothing renders before `Gate` has a session.
- `frontend/CONVERSION_NOTES.md` is the frontend's gap list, the kit/BOM status and the known failing tests; read it before changing a kit pin. The app's own UI contributions are `cmd/parallax/app.ui.json` (named by `frontend.contributions` in the manifest); regenerate `frontend/src/generated/frontend.manifest.json` with `npm run manifest` after editing it.
- Browser suites: `cd frontend && npx playwright test` starts the real binary on a throwaway data directory and signs in once (`e2e/global-setup.ts`). Ports come from `tests/ports.ts` (`PARALLAX_E2E_*_PORT`, mirrored as `VITE_PARALLAX_E2E_*_PORT` for the Vite dev server and the Storybook build); build `npm run build` and `go build -o .scratch/parallax ./cmd/parallax` first. The snapshot suites read `frontend/tests/data/synthetic-capture.json` (`scripts/synthetic-capture.mjs` regenerates it).

