# Parallax architecture

Parallax is a fixture-only GUI laboratory: a Go backend that serves a built React SPA, two read-only fixture
endpoints and a registry-v2 plugin delivery. It runs on Substrate (`app-host` variant); the Chimera host is gone.

## Decisions (adopting-substrate.md section 0)

| Question | Answer |
|---|---|
| Migrated data or fresh start? | Fresh. The old app had no database and no persisted state; nothing to migrate. |
| Binary | `cmd/parallax`, variant `app-host`, serves the SPA, `/api/` and `/plugins/`. |
| Identity | Own accounts through the `identity` module (the first account, made offline with `parallax identity setup`, holds `*`; `POST /api/setup` is always refused, 403 `setup_offline`). |
| Routes | `GET /api/snapshots/current` and `GET /api/scenario` need `parallax.read`; `GET /plugins/*` needs `parallax.read`. No open mounts. |
| Background work | None. |
| UI needs from the framework | App-shell and the BOM kits; sign-in screens are app-owned until the identity UI kit exists (see conversion-notes Gaps). |
| BOM | No new pins: `app-host`, `plugin-mcp` and `ui-go` are already in `bom/bom.yaml`. |

## Layout

- `cmd/parallax`: `substrate.yaml` and generated `substrate_wiring.go` (manifest), `main.go` (boot, CLI root),
  `config.go` (the `AfterConfig` boot hook: data directory resolved after the override, relative paths anchored in it), `serve.go` (handler assembly).
- `internal/api`: the route list (one list builds the mux and the scope table) and its test.
- `internal/hostguard`: Host check against loopback plus `parallax.allowed_hosts` (DNS rebinding), forwarding-header
  stripping; `internal/settings` parses that block.
- `internal/appdirs`: data directory (`PARALLAX_DATA_DIR` or XDG data home); `0700` directory, `0600` database; relative manifest paths are anchored there, absolute override paths are kept.
- `internal/demoplugin`: the reviewed `ops/g1` plugin registry and bundle, served by libs `app-host/plugins.Delivery`.
- `internal/scenarios`, `internal/snapshots`: deterministic fixture generators and the embedded capture. Unchanged.
- `internal/webui`: embeds `dist/`; `cmd/fixtures` regenerates bundled JSON.

## Request path

`hostguard` (Host check; a listed proxy name needs a loopback peer and one `X-Forwarded-Proto: https`) -> `identity.Middleware` (session cookie becomes the bearer) -> `httphost` (auth guard,
CSRF/Origin check on writes, `/api/` mux, `/plugins/` mount, SPA). `/healthz` is the framework's and includes the database.

## Data

Substrate's `identity` module needs the `database` module, so the app now has a SQLite file (`parallax.db`) and a
signing key (`identity-signing.key`) in the data directory. Both hold accounts only; no fixture data is stored.

## Config

`httphost.addr` (default `127.0.0.1:18441`, the port the deployed `parallax-uat` instance uses; must be loopback), `identity.*`, `database.sqlite.path` and `identity.key_file` (relative defaults, anchored in the data directory by the boot hook),
all overridable in the file named by `SUBSTRATE_CONFIG`. The app's own `parallax:` block (`internal/settings`) has two
keys; an unknown key is refused at start.

- `allowed_hosts`: extra Host names served behind a local TLS proxy; default none. Its default (`allowed_hosts: []`) is in
  the manifest; the operator sets names in the override file, which merges deeply (lists replace).
- `snapshot_file`: absolute path to a capture file served by `GET /api/snapshots/current` instead of the embedded one.
  Unset (the default, not in the manifest) the binary serves the embedded `internal/snapshots/data/current.json` when the
  build has one, else `data/empty.json`. The file is read once at start and must exist, be at most 16 MiB, parse, and pass
  the same shape check as the embedded capture (`snapshots.Validate`); otherwise serve refuses to start with an error
  naming `parallax.snapshot_file`. It is how the browser suites serve a synthetic capture, and also how an operator installs a real capture on a deployed instance (the file lives in the instance's config directory, mode 600); a real capture never belongs in the repository or at the embedded path.

## Deployment

A Cerberus-managed `parallax-uat` instance runs today (see docs/conversion-notes.md, "Deployed instance and cutover
outline"). The data directory is fresh on first start (`parallax.db` and `identity-signing.key` under
`PARALLAX_DATA_DIR` or the XDG data home); nothing is migrated because the previous app kept no state.
