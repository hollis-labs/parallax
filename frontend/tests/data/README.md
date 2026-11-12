# Synthetic test data

`synthetic-capture.json` is **synthetic test data, not a live capture**. Every task, session,
agent, launch, team, Planner item and timestamp is invented (timestamps are fixed in 2026-10, hosts
are `*.example.test`). It has the shape of the app's `/api/snapshots/current` body
(`parallax-capture/v1`) so the snapshot browser suites can run against the real backend in a clean
checkout. A real capture of a live Torque and Tether stays gitignored at
`internal/snapshots/data/current.json`.

`playwright.config.ts` points the backend at this file through `parallax.snapshot_file` in the
throwaway `SUBSTRATE_CONFIG` it writes.

Regenerate (deterministic; a rerun leaves no diff) from the repository root, after
`cd frontend && npm ci`:

```sh
node scripts/synthetic-capture.mjs
```

The generator feeds invented raw inputs through the same projectors the real capture scripts use
(`capture-snapshots.mjs`, `project-console.mjs`, `capture-planner.mjs`), reuses the sanitized
Tether overview from `frontend/src/fixtures/tether-sysop.json`, and formats the result with Biome.
