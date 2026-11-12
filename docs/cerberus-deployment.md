# Parallax Cerberus deployment proposal

The repo-owned `parallax.cerberus.yaml` proposes one artifact-backed
`parallax-uat` service. This source change does not register, install, start,
reload or deploy a resource. First activation remains an operator step.

## Build and runtime

Use Go 1.26.10 and Node 24 with npm 11 on the build host. From a clean checkout,
`make build` runs the locked frontend `npm ci` and Vite build before compiling
`.scratch/parallax`. The frontend is embedded in that binary. Tracked
`third_party/*.tgz` candidate packages referenced by the lockfile must remain
in the checkout; installing different registry versions changes the input.
The runtime needs no Vite server, Storybook server, npm or source checkout data.

The `make_standard` strategy explicitly declares `.scratch/parallax` as its
output. Cerberus copies that output to its installed artifact and runs the
installed copy with `run_from: artifact`; a workspace rebuild or resource reload
alone does not install a new binary. `dir: .` resolves relative to this config's
repo directory. The existing Makefile needs no deployment target change.

The listener is `127.0.0.1:18441`, the binary's default. The binary has no `LISTEN_ADDR`: the
address is `httphost.addr`, changeable in a YAML file that `SUBSTRATE_CONFIG` names (an
absolute path the operator provides; the descriptor sets none). That
file also holds `identity.trusted_proxy` and `parallax.allowed_hosts` if a proxy
name is ever used. The data directory (the identity database and signing key)
is `PARALLAX_DATA_DIR`, or the XDG data home of the service user when unset; it is created private
(0700). Set the variable in the resource `env` when the service user has no usable home. The declaration contains no secrets or secret
references: the fixture-only runtime needs none. Any later environment reference must use the operator's
Cerberus secret-reference contract and stay outside the repository. Confirm
the port is free on the eventual runtime host before activation. The proposed
URL is loopback only; an externally reachable URL or proxy is a separate
operator decision.

## Health and activation

Substrate supplies `GET /healthz` (no sign-in needed), returning
`{"status":"ok","checks":{"database":"ok"}}`. That proves HTTP liveness and
the identity database. Everything else needs a session: after first-run setup
(owner account) and sign-in, check `/`, `/api/scenario`, `/plugins/ops/g1/bundle.js`
(401 signed out, 200 signed in) and one local `/?example=...` fixture journey to
verify the embedded UI and scenario delivery. An unknown `Host` is refused (403). Browser acceptance and owner visual approval remain
separate from a healthy daemon.

After this declaration lands on main, the operator can validate the exact
checkout with `cerberus validate /absolute/repo/parallax.cerberus.yaml`, then
register that file with `cerberus register /absolute/repo/parallax.cerberus.yaml`.
Registration records a config pointer; activation requires a separate GO.
With that GO, use `cerberus resource deploy parallax-uat --ack` to build, sync
and activate together. Inspect resource status, source revision, source binary
hash, installed binary hash, activation result and health response. Keep the
build output and installed-artifact receipts together. Do not substitute
`reload` or an unchanged-source freshness check for deployment of new source.

## Rollback

Before an update, retain the last working source commit, descriptor, binary
hash and health receipt outside the managed current artifact. Cerberus sync
replaces its installed binary; this proposal does not claim a retained-version
rollback API. With operator authorization, restore a separate checkout of the
last accepted commit and its repo-owned config, validate and register that
config path, then deploy it to rebuild, sync and activate the prior source.
Verify the resulting installed hash and health. A rebuilt binary can have a
different hash from its earlier build; record the new artifact honestly.

For a failed first activation with no known-good prior artifact, stop only
`parallax-uat` through Cerberus and keep the failed logs and artifact receipts.
Do not remove another resource, alter a proxy or perform registry cleanup as
part of this source proposal.
