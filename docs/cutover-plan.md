# Cutover plan: parallax-uat moves to the Substrate build

Status: **draft for the owner's approval. Nothing here has been run on the live host.** Merging the port (PR #35,
merge commit `6cdb6c8`) changed no running system: `parallax-uat` is the same process as before. This plan is the
separate step that changes it.

**Pre-merge `main`: `33401f5`** ("Go 1.26.10: fix GO-2026-6809 (crypto/x509) (#34)"), the last commit of the old
version. A fix to the running version is cut from `33401f5`, not from `main`, until the cutover is done.

## What changes for people (the visible change)

Today anyone who can reach the public name sees the lab: the page, `/api/scenario`, `/api/snapshots/current` and the
plugin bundles need no sign-in. **After the cutover every data request needs an account.** The page itself still
loads without one (the static shell is served), and shows a sign-in screen. The owner account is created on the host
before the service starts (step 5). Nobody else has an account until the owner makes one; this build has no screen for
adding people (the identity routes `POST /api/identity/users` and `POST /api/identity/keys` exist and need the
`parallax.admin` scope, which the owner holds), so the owner decides who is added and how. Script or health-check callers
of the old URLs other than `/healthz` stop working until they hold an API key (step 5).

There is no data to migrate: the old build kept no state. The new build gains one small identity database
(`parallax.db`) and a signing key in its data directory.

## What runs today (facts from the repository and the driver's read of the registry)

| Piece | Where | How it runs |
|---|---|---|
| The served instance | the server host | Cerberus resource `parallax-uat`, user unit `com.hollis-labs.cerberus.parallax.parallax-uat.service`, `127.0.0.1:18441`, `mode: os_service`, `run_from: artifact`, `auto_restart: true`, health check `GET /healthz` |
| Its descriptor | the operator's copy under `~/.config/parallax/` (one descriptor file) | registered with Cerberus from that copy, not from the repository's `parallax.cerberus.yaml`, which is a template |
| Its binary | the installed artifact directory `~/.cerberus/apps/parallax/parallax-uat/`, binary `bin/parallax-uat` | built by the descriptor's `make_standard` strategy (`make build`, output `.scratch/parallax`) in the checkout its `dir` names, copied to the installed artifact by Cerberus; the unit runs the installed copy |
| The build checkout | the descriptor's `dir`, under the operator's home (`<build checkout>`) | at commit `239bcb6` (the merge of PR #30, 2026-10-10), on a **detached HEAD**, with **71 uncommitted or untracked entries** (`git status --short`, read by the driver). It is neither on a branch nor clean |
| The unit | generated from the descriptor | `WorkingDirectory` = the build checkout, `ExecStart` = the installed artifact, `Environment` = `LISTEN_ADDR` and `PATH`; nothing the new binary reads is set today |
| How clients reach it | a local TLS proxy, by **two** public names | one host matcher with both names forwards to `127.0.0.1:18441` with a plain `reverse_proxy` and no header directives; the upstream Host is the public name as sent and the proxy sets `X-Forwarded-Proto` itself (whether it sends exactly one value and replaces a client-supplied one is not yet tested) |
| Its data | none | the old binary keeps no state |
| The storybook review service | `parallax-stories-review`, `127.0.0.1:18444`, from `~/.config/parallax-stories/` | a static Storybook; the backend change does not touch it |

The binary is Cerberus-built and installed as an artifact (not fleet-installed, not a plain file): the repository's own
descriptor template and `docs/cerberus-deployment.md` say so, and the driver's read confirms the unit. What I cannot tell
from the repository, and need looked at (read-only) before the window, is listed under "Open items".

## Principles

- **No open setup window, ever.** `POST /api/setup` is refused by this build (`403 setup_offline`), so there is no window
  to leave open. The owner and keys are made by the offline bootstrap **before the unit starts on the new build**, and
  the first check after start is that `GET /api/setup` answers `{"setup_required":false}`.
- The old binary is kept as a file, never overwritten, so rollback is a file swap and a restart (it keeps no state).
- Nothing in this plan is run on the live host by me. Each step names who runs it.
- The order is the rule: **build, sync, bootstrap, restart.** The service must not start on the new build before the
  owner exists (it would answer, with everything refused, but the first check would fail and a stray start creates the
  data directory). Cerberus `deploy` builds, syncs and activates in one command, so it is not used; `sync` and `reload`
  are (the lifecycle verbs are in the Cerberus setup guide: `sync` updates installed artifacts without applying the
  runtime backend; `reload` restarts the current installed service without syncing).

## Step zero: the data directory holds nothing of the new build (before anything else)

Any run of the new binary that writes (serving, `identity setup`, `identity key create`) **creates** a data directory, a
database, a signing key and its JWKS file in whichever directory it resolves. The read-only commands (`version`,
`config`, `health`, `help`) create nothing (tested with the real binary and an empty home), but nothing in this plan
should be the first run to find out.

1. As the service's user, with the unit's `HOME`: `find ~/.local/share/parallax -ls` (or the directory
   `PARALLAX_DATA_DIR` names in the descriptor, if it sets one). Change nothing.
2. The expected content is: **the directory does not exist.** The old build never wrote there. (`~/.config/parallax/`
   is the descriptor directory; the new binary does not read or write it.)
3. (Driver) Read the service's request log for the last week and name the callers (step 0.5).
4. **If anything is there, stop and report; do not proceed and do not delete it.** In particular `parallax.db`
   (with `-wal` and `-shm`), `identity-signing.key` or `identity-signing.key.jwks.json`: each means a new build has already
   run there, and what it created (an owner, keys) must be understood first. A signing key that already exists decides
   which issuer the database belongs to.
5. Record the listing in the task. It is the "before" for the checks below.

## 0. Before the window (anyone, no downtime)

1. Merge is done; record the commit to deploy (the head of `main` after any later fix) and that CI is green on it.
2. **Keep the old binary aside, once:** copy the installed binary `~/.cerberus/apps/parallax/parallax-uat/bin/parallax-uat`
   to a dated file outside Cerberus' managed tree, record its sha256, and note the artifact directory for the rollback.
   Cerberus `sync` replaces the installed binary and there is no retained-version rollback (`docs/cerberus-deployment.md`),
   so this copy is the rollback.
2a. **Prepare a clean build checkout; leave the old one untouched.** The current build checkout is on a detached HEAD at
   `239bcb6` with 71 uncommitted or untracked entries, so it cannot be brought to the deploy commit without risking
   changes nobody has looked at. Make a **fresh clone (or `git worktree`) beside it at the deploy commit** (`<new build
   checkout>`), and build there. The descriptor's `dir` is pointed at it only in step 1.3, and the old checkout stays as it
   is (it is part of the rollback). The 71 entries are the owner's to read before any later cleanup of the old checkout;
   this plan does not need their content and does not touch them. The build needs nothing from the old checkout: the
   binary embeds its frontend and locates nothing by the working directory.
3. **Write the new config file** `~/.config/parallax/substrate.yaml` (mode 600; the path is the operator's choice, it is
   named by `SUBSTRATE_CONFIG`). The listen address needs no entry: the default is `127.0.0.1:18441`. For the two public names:

   ```yaml
   parallax:
     allowed_hosts: ["<public-name-1>", "<public-name-2>"]
   identity:
     trusted_proxy: true
     allowed_origins: ["https://<public-name-1>", "https://<public-name-2>"]
   ```

   Both public names go in both lists (the proxy matcher serves both). `allowed_hosts` makes the backend answer to those Host names; `trusted_proxy` lets it read the proxy's
   `X-Forwarded-Proto`; `allowed_origins` is the page origin the identity module accepts for writes, needed because the
   proxied Host differs from the loopback address. A name that is not listed gets a plain 403. The file holds no secret.
4. **Rehearse on a scratch host** (done, see "Rehearsal"). Repeat it on the build that will be deployed.
5. Inventory the callers of the public name and of `127.0.0.1:18441` (people with bookmarks, scripts, other apps, any
   check other than `/healthz`). Each person gets an account decision, each script an API key with `parallax.read`, or is
   retired. The owner names them; nothing in the repository calls the service.
6. Prepare (do not apply) the descriptor change, to be made at the cutover and not before (by the Cerberus owner or
   the operator): `dir` points at `<new build checkout>`; `env` drops `LISTEN_ADDR` (the new binary ignores it; the default
   port is the same) and gains `SUBSTRATE_CONFIG: <absolute path of the file in step 3>`. `PARALLAX_DATA_DIR` is optional;
   leave it unset to use the service user's XDG data home (`~/.local/share/parallax`), or set it to decide the place
   explicitly.
7. Announce a short window to the people from step 5.

## 1. The window (server host)

Downtime: **seconds.** The unit is stopped from the moment the old process is stopped to the moment the new one answers
`/healthz`; on the rehearsal the new binary was healthy 0.08 s after start. The longer parts (build, copying) happen
while the old process keeps serving; the stop-to-healthy gap is the restart plus the checks.

Every mutating Cerberus verb below needs `--ack` and may need an approval id, so the **owner or the operator runs them
(under an approval), not I**; they have no dry-run flag. `sync` "syncs installed runtime artifacts without applying the
runtime backend" and `reload` "restarts the current installed resource without syncing artifacts or rewriting service
definitions; it does NOT rebuild or re-sync" (the verbs' own help text, read by the driver). Consequence: `reload` cannot
add `SUBSTRATE_CONFIG` to the unit; that needs the descriptor change plus `apply` (step 6).

1. **Build** the new binary in `<new build checkout>` at the deploy commit (step 0.2a): `make build` (Node 24 and Go 1.26.10
   on the build host; the frontend is built first and embedded). Nothing runs yet; the old process keeps serving.
2. **Stop the old unit:** `cerberus resource stop parallax-uat --ack` (or `systemctl --user stop` on the unit). The old
   process exits; nothing else holds the port. Downtime starts here.
3. **Change the descriptor** (step 0.6) in the operator's copy: `dir` to `<new build checkout>`, `env` from `LISTEN_ADDR`
   to `SUBSTRATE_CONFIG`. Cerberus re-reads the registered file, so the next verb sees it. Do not apply yet.
4. **Sync, not deploy:** `cerberus resource sync parallax-uat --ack` copies the built artifact to
   `~/.cerberus/apps/parallax/parallax-uat/bin/parallax-uat` without activating. (`deploy` builds, syncs and activates in one
   command and would start the new build before the owner exists, so it is not used.)
5. **Offline bootstrap**, as the service's user, with the unit's `HOME`, the config file named explicitly
   (`SUBSTRATE_CONFIG=<file> <installed binary> ...`, since the unit does not carry it yet) and the new installed binary:
   - `parallax identity setup --username NAME` (password from the no-echo prompt, or the first line of stdin; never an
     argument or an environment variable). It refuses if an owner exists.
   - `parallax identity key create --name CALLER --scope parallax.read --out PATH` for each script from step 0.5 (a new
     0600 file, never overwritten; `--stdout` prints it instead). Any scope may be granted; give `parallax.read` unless
     a caller needs more.

   These create the data directory (0700), the database and the signing key (0600) exactly where the service will look.
6. **Apply the descriptor and start:** `cerberus resource apply parallax-uat --ack` (the owner or operator) rewrites the
   unit (`WorkingDirectory`, `Environment`) and activates it on the installed artifact, which is now the new build; if it
   does not start the unit, `cerberus resource reload parallax-uat --ack` does. The owner exists, so a start here has the
   rehearsed result. **Right after, before the checks:** `systemctl --user cat <unit>` shows `SUBSTRATE_CONFIG` in
   `Environment` and the new `WorkingDirectory`. If `SUBSTRATE_CONFIG` is missing the loopback address works but both
   public names answer 403 (not listed): stop, fix the descriptor, apply again.
7. **First check, before anything else:** `GET /api/setup` through `127.0.0.1:18441` answers
   `{"setup_over_http":false,"setup_required":false}`. If `setup_required` is true, stop the unit at once and investigate:
   the bootstrap did not land where the service looks (a different data directory).
8. **First proxied check:** a request through **each** public name for `GET /healthz` must be 200. This also answers the one
   open question about the proxy (it sends exactly one `X-Forwarded-Proto: https`); if it fails, see the loopback fallback
   under the checks. Then the rest of section 2.

## 2. Checks (the driver or the owner; read-only against the live service)

Through the loopback address, then through the public name:

| Check | Expect |
|---|---|
| `GET /healthz` | 200 `{"status":"ok","checks":{"database":"ok"}}` |
| `GET /api/setup` | `{"setup_over_http":false,"setup_required":false}` |
| `POST /api/setup` (any body, with `X-Requested-With`) | 403 `setup_offline` |
| `GET /api/scenario` signed out | 401 |
| `GET /` signed out | 200: the page loads and shows the sign-in screen |
| unknown `Host` (`curl -H 'Host: evil.example.test'`) | 403 |
| each public name through the proxy, `GET /healthz` | 200 (the proxy sends exactly one `X-Forwarded-Proto: https`) |
| the public name with the proto header missing or `http` (test from the host, not through the proxy) | 403 |
| sign in as the owner through each public name (a browser) | succeeds; the session cookie is `Secure` and the page works over https |
| `GET /api/scenario` and `/plugins/ops/g1/bundle.js` signed in | 200 |
| an API key from step 5, `Authorization: Bearer <key>`, on `/api/scenario` | 200 |
| `POST /api/logout` with `X-Requested-With`, then `GET /api/scenario` | 204, then 401 |
| the data directory listing against the "before" | `parallax.db` (+ `-wal`/`-shm`), `identity-signing.key`, its `.jwks.json`; directory 0700, files 0600 |

The proxied-request checks are the same as the repository's `TestProxiedHost` (listed name served only for a loopback
peer carrying exactly one `X-Forwarded-Proto: https`; sign-in with the page's own origin). If the public check fails with
403 on a name that is listed, the usual cause is the proxy not sending the header, or sending it twice.

## Rollback

Parallax keeps no state in the old build, so rollback is a file swap:

1. `cerberus resource stop parallax-uat --ack` (the new process exits).
2. Restore the old binary: copy the file from step 0.2 over `bin/parallax-uat` in the artifact directory (check its sha256
   against the recorded one), and restore the previous descriptor: `dir` back to the old build checkout (untouched, so it is
   as it was) and `env` back to `LISTEN_ADDR` (drop `SUBSTRATE_CONFIG`).
3. `cerberus resource apply parallax-uat --ack` (rewrites the unit back and starts it); check `/healthz` and that the public
   names serve the lab without sign-in again.
4. The new data directory can stay (the old binary ignores it) or be removed after the owner says so; nothing in it is
   needed by the old build. Do not delete it as part of the rollback.

## Downtime and risk

| Surface | Downtime |
|---|---|
| The lab (page, API, plugins) | seconds: stop to healthy, plus the owner's checks if the proxy keeps serving errors meanwhile |
| The storybook review service | none |

Risks, in the order they would show: the unit starts before the owner exists (step 7 catches it, it is closed by the
order: the descriptor is applied only after the bootstrap); the proxy does not send the proto header or sends it twice (403 on the public name, loopback still works);
a wrong `allowed_origins` (sign-in fails with 403 `bad_origin` through the public name); behind a proxy every client
reaches the service from the proxy's loopback address, so the login limiter (five failures per username in five minutes)
is effectively per username: someone who can reach the name can lock the owner out for a few minutes (a framework
property, noted in `docs/conversion-notes.md`).

## Open items

Settled by the driver's read-only look (2026-11-12) and folded into the plan above: the build checkout (detached HEAD,
71 entries: fresh checkout, step 0.2a), the descriptor's `env` (only `LISTEN_ADDR`), the proxy (two public names, plain
`reverse_proxy`), the Cerberus verbs (`sync`/`reload` semantics, no dry run, `--ack`), the installed artifact path.

Still open:

1. **Callers of the service** beyond people with the public URLs: the driver reads the request log for the last week
   before the window (step zero, item 3) and reports; each caller then gets an account or an API key, or is retired.
2. **The proxy's `X-Forwarded-Proto` behaviour** (exactly one `https`, a client-supplied value replaced) is untested; it is
   the first proxied check in the window (step 8), through each name. If it fails, the loopback address keeps working and
   the fix is a header directive in the proxy (the owner of the proxy), not in this repository.
3. **Who runs the Cerberus verbs** (`stop`, descriptor change, `sync`, `apply`/`reload`): the owner or the operator under
   an approval, with `--ack`; and the exact `apply` behaviour (whether it starts the unit) is confirmed by whoever runs it,
   with step 6's `systemctl cat` check as the guard.
4. **Owner's approval** for the window, and the owner's decision on how additional accounts are created (API only in this
   build).

## Rehearsal (scratch host, nothing on the live host)

Run on 2026-11-12 with the binary built from `main` (`6cdb6c8`), a scratch `HOME` and every XDG variable under it,
port 18135, `SUBSTRATE_CONFIG` as in step 0.3 with a placeholder public name (`parallax.example.test`). Results:

- Step zero: the scratch data directory did not exist; `parallax version` and `parallax config` created nothing (the
  config output showed the anchored database and key paths and the allowed host).
- `identity setup --username owner` (password on stdin): "owner owner created"; `identity key create ... --out`: a 0600
  key file. The data directory appeared 0700 with `parallax.db` (+ `-wal`, `-shm`) and `identity-signing.key` 0600 and
  its `.jwks.json`.
- Start: healthy 0.08 s after launch. `GET /api/setup` `{"setup_over_http":false,"setup_required":false}`;
  `POST /api/setup` 403; `/api/scenario` signed out 401; `GET /` signed out 200; unknown Host 403; the listed name
  without the proto header 403 and with `X-Forwarded-Proto: https` 200; sign-in through the listed name with its own
  `Origin` 200 with a `parallax_session` cookie; the API key read `/api/scenario` and `/plugins/ops/g1/bundle.js` 200.
- SIGTERM stopped the process; the port was free afterwards.

The scratch is not the live host: the live service, its descriptor and its data were not touched, and no command of this
plan was run there.

## After

- Keep the old binary copy for at least a release. Remove nothing.
- Update the repository's template descriptor only if the deployed shape should change; the live copy is the operator's.
- Record the actual downtime, the data directory listing and the check results in the task.
