#!/usr/bin/env bash
# Cheap, offline fresh-stage replay. Caller supplies copied dependency caches and tools.
# Does not reinstall/launch a browser or mutate the original worktrees.
set -euo pipefail
: "${TMPDIR:?owned disk scratch required}"
: "${NIL_KIT_REPO:?design-kit repository required}"
: "${NIL_KIT_HEAD:?exact reviewed source head required}"
: "${NIL_PARALLAX_HEAD:?exact reviewed specimen head required}"
: "${NIL_NPM_CACHE:?offline warm npm cache required}"
repo=$(git rev-parse --show-toplevel)
stage=$(mktemp -d "$TMPDIR/nil-fresh-XXXXXXXX")
printf '%s\n' "Retained fresh stage: $stage"
mkdir -p "$stage/kit" "$stage/parallax" "$stage/cache"
git -C "$NIL_KIT_REPO" archive "$NIL_KIT_HEAD" | tar -x -C "$stage/kit"
git -C "$repo" archive "$NIL_PARALLAX_HEAD" | tar -x -C "$stage/parallax"
cp -a "$NIL_NPM_CACHE/." "$stage/cache/"
(
  cd "$stage/kit"
  npm ci --offline --ignore-scripts --no-audit --no-fund --cache "$stage/cache"
  npm run build -w @hollis-labs/design-tokens
  npm run build -w @hollis-labs/design-components
  npm run test:run -w @hollis-labs/design-components -- src/__tests__/nil-dialogs.test.tsx src/__tests__/nil-escape-ownership.test.ts
)
(
  cd "$stage/parallax/frontend"
  npm ci --offline --ignore-scripts --no-audit --no-fund --cache "$stage/cache"
  npm run typecheck
  cd ..
  # Installed archive is checked against the committed pin, separately from a
  # freshly rebuilt package whose toolchain may produce different map paths.
  python3 - "$NIL_KIT_HEAD" <<'PY'
import base64, hashlib, json, pathlib, tarfile
root=pathlib.Path.cwd(); package=json.loads((root/'frontend/package.json').read_text())
archive=(root/'frontend'/package['dependencies']['@hollis-labs/design-components'].removeprefix('file:')).resolve()
lock=json.loads((root/'frontend/package-lock.json').read_text())['packages']['node_modules/@hollis-labs/design-components']
assert lock['integrity']=='sha512-'+base64.b64encode(hashlib.sha512(archive.read_bytes()).digest()).decode()
with tarfile.open(archive) as tar:
 for entry in tar.getmembers():
  if entry.isfile():
   name=entry.name.removeprefix('package/')
   assert (root/'frontend/node_modules/@hollis-labs/design-components'/name).read_bytes()==tar.extractfile(entry).read(),name
print('PASS committed local pin matches fresh installed archive bytes')
PY
)
printf '%s\n' "PASS cheap fresh-stage focus/pin replay; retained at $stage"
# Retain for independent review. Delete only this owned stage after review.
