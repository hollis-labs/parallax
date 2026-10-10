#!/usr/bin/env python3
"""Stage the sealed candidate for cheap typechecking, never another broad gate.

Prerequisites: Python 3.12+, Node 24/npm 11, retained receipt/source tar and
installed frontend dependencies. Ports: none. Cleanup: remove the printed
temporary stage yourself after review. --fresh-install uses the archived lock
and archives with npm ci; otherwise this is fresh source, NOT fresh install.
"""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import tarfile
import tempfile


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("receipt", type=Path, help="sealed .scratch/rail/manifest.json")
    parser.add_argument("--receipt-sha256", required=True, help="digest supplied by reviewer")
    parser.add_argument("--installed", type=Path, help="retained frontend/node_modules")
    parser.add_argument("--fresh-install", action="store_true")
    args = parser.parse_args()
    raw = args.receipt.read_bytes()
    if hashlib.sha256(raw).hexdigest() != args.receipt_sha256:
        parser.error("receipt digest mismatch")
    receipt = json.loads(raw)
    archive = args.receipt.parent / receipt["source_archive"]["path"]
    if hashlib.sha256(archive.read_bytes()).hexdigest() != receipt["source_archive"]["sha256"]:
        parser.error("source archive digest mismatch")
    if not args.fresh_install and not args.installed:
        parser.error("supply --installed or --fresh-install")
    stage_root = args.receipt.resolve().parent / "replay-stages"
    stage_root.mkdir(exist_ok=True)
    stage = Path(tempfile.mkdtemp(prefix="flux-rail-review-", dir=stage_root))
    print(f"Pinned source {receipt['head']} / tree {receipt['tree']}", flush=True)
    print(f"Stage retained for review and explicit cleanup: {stage}", flush=True)
    with tarfile.open(archive) as source:
        source.extractall(stage, filter="data")
    frontend = stage / "frontend"
    if args.fresh_install:
        subprocess.run(["npm", "ci", "--ignore-scripts", "--no-audit", "--no-fund"], cwd=frontend, check=True)
    else:
        installed = args.installed.resolve(strict=True)
        for item in receipt["installed_files"]:
            if hashlib.sha256((installed / item["path"]).read_bytes()).hexdigest() != item["sha256"]:
                parser.error(f"retained installed byte mismatch: {item['path']}")
        (frontend / "node_modules").symlink_to(installed, target_is_directory=True)
    subprocess.run(["npm", "run", "typecheck"], cwd=frontend, check=True)
    print("Cheap typecheck passed; no native/visual/CI approval implied.")


if __name__ == "__main__":
    main()
