# Pinned Nil example replay

Run from the CW-20261010-0093 worktree. Read-only parent receipts are copied into
`.scratch/nil/parents`; own retained tooling is in `.scratch/nil/tooling`.
`node_modules` copied for focused work is retained, not a fresh installation.
The end gate stages the entire authored tree without `.git`, `.scratch`,
`node_modules` or Vite caches, including standalone HTML and proof entrypoints.

The copied exact-lock npm cache and Go caches are explicit prerequisites. A
fresh stage runs `make check` with those own paths as command-line variables,
then Storybook, inventory generation/check and the whole configured native
suite. Default remote addresses remain unchanged in the repository. Local
replay substitutes only 18541→18961, 18542→18962 and 18545→18965 in the staged
catalog, configuration, tests and standalone HTML. Originals and before/after
hashes are retained; mapped app, Storybook and Go binaries are rebuilt.

The separate owned Playwright wrapper selects the retained Chromium executable
and `--no-sandbox`, with owned library/font paths. It does not change discovery,
assertions or configured server readiness. Short browser profiles are owned and
removed after the browser exits. Logs and actual per-leg exits remain retained,
including failures; completed successful legs are not repeated for unrelated
corrections. End-gate receipts identify exact authored source and any generated
inventory reconciliation separately.

For a cheap provenance replay without building a kit:

```sh
python3 scripts/nil-example-provenance.py \
  --kit-repo /home/chrispian/dev/hollis-labs/libs/design-kit
```

The script reads the exact accepted Git heads, archives, package pins, lock and
installed files. It physically materializes their raw source/emitted bytes and
checks complete file maps, not just filenames or package versions. It needs the
retained parent seals and the installed locked dependencies. It performs no
publication, candidate build, kit repack or consumer migration.

Focused browser checks use `frontend/nil-example.playwright.config.ts`, port
18965, and the own Chromium/library/font paths. Run through `heavytest`; the
required end gate uses the unchanged full configured suite rather than this
focused configuration. Synthetic composition and CDP touch are emulation only.
