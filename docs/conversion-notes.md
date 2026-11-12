# Conversion notes: Parallax onto Substrate

Clean break: no shims, no fallbacks. There was no data to migrate. The frontend is not part of this change; it
belongs to the GUI agent and is listed under "For the frontend".

## Gaps

1. **scan-public: the tree is cleaned in two steps; history is left for a program-wide pass.** Owner rule (2026-11-12, via
   the driver): the TREE must be clean in the port PR; HISTORY is not rewritten during the port and gets one planned pass over all
   repos afterwards. CI and `make scan` therefore run `scan-public --tree`; the history gate (`--ref HEAD`) returns after that pass.
   Status: done in this branch: home paths, hosts and addresses in `docs/` and `third_party/` provenance, replay scripts and
   `docs/review-workbench.md`; `scan-public.allow` lists the reviewed tree false positives, each with a reason (design-token
   property names, sha256 checksums beside file names containing "token", one model name). Still open (35 findings), waiting for
   gui-parallax and agreed placeholder strings: the generator and its generated fixtures (`internal/scenarios/tether_sysop.go`,
   `reader.go`, `frontend/src/fixtures/tether-sysop.json`, `reader-example.json`, `docs/tether-sysop-fixtures.md`) and the
   frontend-owned files (`catalog.ts`, specs, `AIGatewayPage.tsx`, `StreamStates.tsx`, `scripts/capture-*.mjs`). The table below
   was the plan and is also the history findings record for the later pass. Placeholders used so far:
   `parallax.example.test`, `parallax-os.example.test`, `parallax-stories.example.test`, `torque.example.test`, `192.0.2.10`,
   `198.51.100.10`, `$HOME`. Where a replay script or manifest recorded a hash of a file whose text changed, the recorded hash was
   updated (`docs/tether-ai-source.json`, `docs/reader-detail-source.json`, `docs/flux-fidelity/proof-manifest.json`).
   The list to execute the decision from (placeholder in the last column; "backend" means a Go generator whose
   output is a frontend fixture, so the generator is changed and the fixture regenerated with `make fixtures`):

   | Class | Files | Owner | Placeholder |
   |---|---|---|---|
   | internal host | `internal/scenarios/tether_sysop.go` (6 sites), `internal/scenarios/reader.go` (1) and, generated from them, `frontend/src/fixtures/tether-sysop.json`, `reader-example.json` | backend (generator) | `*.example.test` names |
   | home path | `internal/scenarios/tether_sysop.go` (1 site, about 21 occurrences) and generated `tether-sysop.json` | backend (generator) | `<home>/...` |
   | internal host, LAN and tailnet IP | `frontend/src/workbench/catalog.ts`, `frontend/tests/workbench.spec.ts` | frontend | `*.example.test`; `192.0.2.10`, `198.51.100.10` (documentation ranges) |
   | internal host | `scripts/capture-snapshots.mjs`, `scripts/capture-planner.mjs` | frontend/tooling | `*.example.test` |
   | home path | `frontend/src/tether-sysop/AIGatewayPage.tsx`, `frontend/tests/tether-ai.spec.ts`, `frontend/tests/tether-overview.spec.ts` | frontend | `<home>/...` |
   | secret pattern (1) | `frontend/src/examples/flux-cards/StreamStates.tsx` | frontend | review: likely a sample token string |
   | home path, host, IP | `docs/*.md`, `docs/*.py`, `docs/flux-fidelity/**`, `docs/nil-radial-candidate.json`, `docs/review-workbench.md`, `docs/flux-fidelity-spec.md` | docs | same placeholders |
   | home path | `third_party/kit-dashboard-record-candidate-provenance.json`, `third_party/kit-admin-directory-candidate-provenance.json` | docs/provenance | `<home>/...` |
   | false positives | `docs/flux-fidelity/source-token-inventory.json` and the gitleaks hits in `docs/flux-fidelity/proof-manifest.json`, `docs/flux-settings-source-map.json`, `docs/nil-radial-candidate.json`, `frontend/src/fixtures/tether-sysop.json` | allowlist (only if the owner chooses an allowlist) | n/a |

   Changing the generated fixture text changes strings the frontend tests assert on (host names and paths shown in the
   Tether sysop pages), so frontend tests move in the same change. History stays dirty under any option except a
   rewrite or making the repository private.
2. **golangci-lint: resolved.** The 37 pre-existing findings in `internal/scenarios` (plus 7 more it hid behind its
   same-issue limit) are fixed; `golangci-lint run` reports 0 issues for the whole tree. Only what the linter named
   was changed: error returns, file modes `0644`->`0o600` and `0755`->`0o750` on the fixture writers (file
   content unchanged), comment forms, tagged switches, De Morgan, renamed `copy` variables, two unused/constant
   parameters, and `//nolint` with a reason on three kinds of false positive (the fixture `SecretRef` strings,
   tests reading their own fixture path, bounded integer conversions in the tone generator). The spelling
   "labelled" in `families.go` is kept (nolint) because the fixture text and the frontend assert on it. Proof that no
   fixture changed: all 15 files `cmd/fixtures` writes (JSON and WAV media) were generated before and after the
   fixes into separate directories and `diff -r` reports no difference.
3. **No Substrate support for registry-v2 plugin delivery.** `pluginhost` is for subprocess plugins. The
   `Delivery` from libs `app-host/plugins` is a plain `http.Handler`, so it is served as an `httphost.Mount` at
   `/plugins/` behind the auth guard (not open), scope `parallax.read`. The scope table matches a subtree only with
   a trailing `*`, so the scope pattern is `/plugins/*` while the mount pattern is `/plugins/`. Works; a framework
   accessor would be tidier. No action needed unless the owner wants one.
4. **The identity module has no UI.** Setup, sign-in and sign-out screens are the frontend's until the kit
   (CW-20261112-0080) lands. The SPA must show them before any call to `/api/` or `/plugins/`.
5. **Identity adds a database to an app that had none.** Accepted per guide section 5; recorded in architecture.md.
6. **The Host check is implemented per app (framework Gap, for the driver).** `internal/hostguard` (171 lines with
   tests) is guide section 5 rule 7 written again, as Basalisk did: loopback Host names, a configured list, the
   validated `X-Forwarded-Proto`, forwarding-header stripping, hardening headers. It belongs in `httphost`. The copy
   stays until then; the allowed list is read from the app's own `parallax:` block (`internal/settings`).
7. **CI runs `scan-public --tree` only** until the program-wide history pass (see Gap 1). The tree step stays red until
   the 35 generator and frontend findings are fixed with gui-parallax.
8. **Run-time data directory: resolved with the Substrate boot hooks (09c04e5).** The manifest carries relative defaults
   (`database.sqlite.path: parallax.db`, `identity.key_file: identity-signing.key`) and the app's own `parallax:` block
   (`allowed_hosts: []`). `boot.StartWith` with an `AfterConfig` hook (`cmd/parallax/config.go`) resolves the data directory
   after the `SUBSTRATE_CONFIG` override is applied, anchors a relative path in it and keeps an absolute one from the
   override. The earlier JSON rewrite of the generated config is gone. No framework data-directory concept yet (the
   framework's own note). No legacy-data guard is needed (nothing existed).

## Old to new

### Environment and flags

| Old | New |
|---|---|
| `LISTEN_ADDR` (default `127.0.0.1:18441`) | `httphost.addr` (default `127.0.0.1:8085`); must be loopback |
| (none) | `PARALLAX_DATA_DIR` data directory; `SUBSTRATE_CONFIG` YAML overrides |
| (none) | `parallax.allowed_hosts` (proxy names), read from `app.Config["parallax"]`; defaults in the manifest (`allowed_hosts: []`), parsed by `internal/settings` |

### HTTP

| Old | New |
|---|---|
| `GET /healthz` (Chimera) | `GET /healthz` (framework, includes database); unauthenticated |
| `GET /api/snapshots/current`, `GET /api/scenario[?profile=large]` | same paths and bodies; now need a signed-in caller with `parallax.read` |
| `/plugins/...` (registry, bundles) | same paths; now need `parallax.read` |
| (none) | `/api/setup`, `/api/login`, `/api/logout`, `/api/password`, `/api/identity/*`, `/api/token`, `/api/pair` |
| Chimera-provided plugin/registry routes other than `/plugins/` | not carried; verify the SPA does not call any |

## Contract for the frontend (gui-parallax)

Scope table (all enforced by the auth guard; the first account made by setup holds `*`):

| Method and path | Scope |
|---|---|
| `GET /api/snapshots/current`, `GET /api/scenario[?profile=large]` | `parallax.read` |
| `GET /plugins/*` (registry, `ops/g1` bundle) | `parallax.read` |
| `GET /api/setup`, `POST /api/setup`, `POST /api/login`, `GET /api/identity/jwks`, `POST /api/pair` | `public` |
| `POST /api/logout`, `PUT /api/password`, `PUT /api/identity/profile`, `POST /api/token`, `GET /api/identity/sessions`, `DELETE /api/identity/sessions/{id}` | `authenticated` |
| `GET/POST /api/identity/users`, `PUT /api/identity/users/{id}`, `GET/POST /api/identity/keys`, `DELETE /api/identity/keys/{id}`, `POST /api/identity/pairing-codes` | `parallax.admin` |
| `GET /healthz` | unauthenticated |

Session flow for the SPA: `GET /api/setup` says whether first-run setup is still open (show the setup screen, then
`POST /api/setup`); otherwise `POST /api/login`. There is no "who am I" route; a 401 from any `/api/` call means
signed out, and sign-out is `POST /api/logout` (204). Host and origin: the backend answers only to loopback Host names (`localhost`, `127.0.0.1`, `[::1]`, any port) and
to the names in `parallax.allowed_hosts`; any other Host gets a plain 403. A listed name is served only for a loopback
peer carrying exactly one `X-Forwarded-Proto: https` (a local TLS proxy). Writes need `X-Requested-With` and a
same-origin `Origin`. The dev frontend proxies `/api`, `/plugins` and
`/healthz` to `http://127.0.0.1:8085` (the default `httphost.addr`; agents set their own port in
`SUBSTRATE_CONFIG`, for example 18130). The `vite.config.ts` and Playwright configs still name 18441/18541: that is
the GUI agent's to change.

Observed on the real binary (Torque CW-20261112-0080, comment 23312, checked against it; first start, throwaway data dir):

- `GET /api/setup` -> `200 {"setup_required": bool}`; a second `POST /api/setup` -> `409 {"code":"setup_closed","message":"setup is already done"}`.
- A cookie-authenticated write **without `X-Requested-With`** -> `403 {"code":"csrf","message":"missing X-Requested-With"}`. A **foreign `Origin`**
  (header present) -> `403 {"code":"bad_origin","message":"the request did not come from this app"}`: the two cases have different
  codes (comment 23312 lists both under `csrf`).
- A revoked key **disappears** from `GET /api/identity/keys` (no revoked flag). An empty list is `{"keys":null}`, not `[]`: the client
  must treat `null` as empty. Revoking again -> `404 not_found`. `POST /api/identity/keys` -> `201 {"credential":{id,name,scopes,created_by,created_at},"key":"key_..."}`;
  empty `scopes` or a scope the caller does not hold -> `400 invalid_request`, message "give a name, and scopes the caller itself holds".
- **429 carries no `Retry-After` header** (headers: `Cache-Control: no-store`, `Content-Type`, `Referrer-Policy`, `X-Frame-Options`). Body
  `{"code":"rate_limited","message":"too many attempts; wait a few minutes"}`. Five wrong logins return 401; the sixth is 429, and the
  correct password is also refused with 429 until the window passes.
- `PUT /api/password` with a wrong current password -> `401 invalid_login` (not a signed-out 401); a too-short new password ->
  `400 invalid_request`, message "password must be at least 12 characters".
- Session lifetime here is 12 hours (`identity.session_ttl: 12h` in the manifest), not the module default of 720 hours; the sessions list marks only the
  current one with `"current": true`.
- Setup and login answer `{id, username, display_name, email, scopes}` (email is `""` until set); the owner's scopes are `["*"]`.

Setup/sign-in screens are the GUI agent's; use Basalisk's as the reference until the identity UI kit exists.
Setup and login bodies: `{username, display_name, password}` / `{username, password}`; both answer the identity user
`{id, username, display_name, email, scopes}`.

## For the frontend

- Errors are `{code, message, details?}`. Writes (setup, login, logout) need `X-Requested-With` and a same-origin `Origin`.
- Every `/api/` and `/plugins/` request needs the session cookie; unauthenticated gives 401. Build setup/sign-in first.
- Dev proxy targets and Playwright configs still name ports 18441/18541 and the Chimera layout; they must point at the
  backend's `httphost.addr` (default 8085).
- The Storybook review service (127.0.0.1:18444) is frontend-only and unaffected by the backend.

## For the operator

- `parallax.cerberus.yaml` (the repo's descriptor proposal) now sets `SUBSTRATE_CONFIG` and `PARALLAX_DATA_DIR` to placeholder paths instead of
  `LISTEN_ADDR`; the listen address is `httphost.addr` in that file. The deployed registration changes only at cutover, by the Cerberus owner.
- Behind a local TLS proxy that forwards a name (the frontend's workbench catalogue already knows public names for
  this app, and the descriptor calls an external URL "a separate operator decision"): in the `SUBSTRATE_CONFIG` file
  set `parallax.allowed_hosts: [<name>]`, `identity.trusted_proxy: true` and, if the page origin differs from the
  proxied Host, `identity.allowed_origins`. The proxy must reach the backend over loopback and send
  `X-Forwarded-Proto: https`. Without the list, a proxied name answers 403. `cmd/parallax/boot_test.go` covers this.
- Behind a proxy, every client reaches the backend from the proxy's loopback address (the Host check strips `X-Forwarded-For`), so
  identity's login limiter (five failures per username and address in five minutes) is effectively per username: someone who can reach
  the site can lock the owner out for a few minutes. This is the framework's design (a validated client address for the limiter is on
  the framework's list), not an app setting.
- First start creates the data directory (`0700`), `parallax.db` and the signing key; first-run setup creates the owner.

## Deployed instance and cutover outline

Parallax is deployed. On the Cerberus host, a Cerberus-managed service (`com.hollis-labs.cerberus.parallax.parallax-uat`,
binary under `~/.cerberus/apps/parallax/parallax-uat`) and a storybook review service (`parallax-stories-review`,
127.0.0.1:18444, served from a checkout) run. `~/.config/parallax/` holds two Cerberus project descriptor files
(a project descriptor and a backup); nothing in the Parallax code reads that directory. I did not open those
files and did not touch the services. No Parallax data store exists, so data is fresh: nothing is migrated, and the
new data directory (`parallax.db`, signing key) is created on first start. Who uses the instance (people, other
apps, scripts) is not known to me; the owner should name them, since each now has to sign in.

Outline (owner approves the deploy; Cerberus' owner changes the descriptor):

1. **Clients**: the browser UI only, as far as the code shows (no other app calls its two APIs). Every caller now needs
   a session. Confirm with the owner that there are no scripted callers or health checks other than `/healthz`.
2. **Descriptor changes (hand to Cerberus)**: drop `env.LISTEN_ADDR`; set the listen address with `httphost.addr` in a
   `SUBSTRATE_CONFIG` YAML file (keep 127.0.0.1:18441 if the proxy and `health_check` URL stay); keep the
   `/healthz` health check (now includes the database); optionally set `PARALLAX_DATA_DIR`. The storybook service
   is unaffected by the backend but its frontend build path is the GUI agent's.
3. **Deploy**: build once in CI (frontend first, then Go), install the new binary beside the old one, keep the
   previous release directory, dry-run, then switch.
4. **Rollback**: relink the previous release and restore the previous descriptor; the old app keeps no state, so
   nothing else needs restoring. The new data directory can be left or deleted.
5. **Verify live**: first-run setup, sign in, read `/api/scenario` through the real URL, open the UI and check the
   plugin panel loads, an unknown `Host` is refused (403), unauthenticated `/api/scenario` is 401.
