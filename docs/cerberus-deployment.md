# Parallax Cerberus deployment proposal

The repo-owned `parallax.cerberus.yaml` proposes one artifact-backed
`parallax-uat` service. This source change does not register, install, start,
reload or deploy a resource. First activation remains an operator step.

## Build and runtime

Use Go 1.26.9 and Node 24 with npm 11 on the build host. From a clean checkout,
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

The proposed listener is `127.0.0.1:18441`, supplied through `LISTEN_ADDR`.
The declaration contains no secrets or secret references: this fixture-only
runtime needs none. Any later environment reference must use the operator's
Cerberus secret-reference contract and stay outside the repository. Confirm
the port is free on the eventual runtime host before activation. The proposed
URL is loopback only; an externally reachable URL or proxy is a separate
operator decision.

## Health and activation

Chimera already supplies `GET /healthz`, returning `{"status":"ok"}`. That
endpoint proves HTTP liveness. Check `/`, `/api/scenario`, and one local
`/?example=...` fixture journey separately to verify the embedded UI and
scenario delivery. Browser acceptance and owner visual approval remain
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
