"""Replay a pinned source archive with retained, explicitly recorded dependencies.

Run from this task's OWN worktree:
  python3 docs/flux-cards-replay.py EXACT_COMMIT
  heavytest bash .scratch/flux-cards/pinned-replay/run.sh
No install, producer access, sibling listener cleanup or shared configuration edit.
"""
from pathlib import Path
import hashlib
import json
import subprocess
import sys
import tarfile

root = Path.cwd().resolve()
head = subprocess.check_output(["git", "rev-parse", f"{sys.argv[1]}^{{commit}}"], text=True).strip()
proof = root / ".scratch/flux-cards/pinned-replay"
proof.mkdir(parents=True, exist_ok=True)
stage = proof / head
if stage.exists():
    raise SystemExit("Use a new pinned stage; prior replay evidence is retained.")
archive = proof / f"{head}.tar"
with archive.open("wb") as out:
    subprocess.run(["git", "archive", "--format=tar", head], stdout=out, check=True)
stage.mkdir()
with tarfile.open(archive) as source:
    source.extractall(stage, filter="data")
files = {str(p.relative_to(stage)): hashlib.sha256(p.read_bytes()).hexdigest()
         for p in stage.rglob("*") if p.is_file()}
(stage / "frontend/node_modules").symlink_to(root / "frontend/node_modules", target_is_directory=True)
(stage / ".scratch/tmp").mkdir(parents=True)
receipt = {"head": head, "archive_sha256": hashlib.sha256(archive.read_bytes()).hexdigest(),
           "source_files": files, "dependency_mode": "retained owned installed node_modules; no fresh-install claim",
           "lock_sha256": hashlib.sha256((stage / "frontend/package-lock.json").read_bytes()).hexdigest(),
           "tool_receipt": str(root / ".scratch/flux-cards/tool-receipts.json"), "stage": str(stage)}
(proof / "receipt.json").write_text(json.dumps(receipt, indent=2) + "\n")
# Shell paths are quoted with shlex, never JSON interpolation.
import shlex
quote = shlex.quote
commands = ["#!/usr/bin/env bash", "set -euo pipefail", f"cd {quote(str(stage))}",
            f"export TMPDIR={quote(str(stage / '.scratch/tmp'))}", "export CI=true",
            f"export LD_LIBRARY_PATH={quote(str(root / '.scratch/tooling/libs') + ':' + str(root / '.scratch/tooling/libs/gbm'))}",
            f"export FONTCONFIG_FILE={quote(str(root / '.scratch/tooling/fonts.conf'))}",
            f"export FLUX_BROWSER={quote(str(root / '.scratch/tooling/chromium/chrome-headless-shell'))}",
            "npm exec --prefix frontend -- playwright test --config frontend/playwright.flux-cards.config.ts --grep 'same-identity|queued|source/access retirement|captured send'",
            "# Playwright stops only its own assigned-port listener. Retain stage/logs/screens until lead retirement."]
(proof / "run.sh").write_text("\n".join(commands) + "\n")
print(json.dumps({"head": head, "stage": str(stage), "archive_sha256": receipt["archive_sha256"]}))
