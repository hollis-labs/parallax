"""Materialize an exact committed source, install pins cheaply, or replay native CI for reader detail.

From the OWN retained task worktree:
  python3 docs/reader-detail-replay.py EXACT_COMMIT fresh
  python3 docs/reader-detail-replay.py EXACT_COMMIT native
  bash .scratch/evidence/CW-20261010-0097/native-EXACT_COMMIT/run.sh
"""
from pathlib import Path
import hashlib
import json
import shlex
import subprocess
import sys
import tarfile
import tempfile

root = Path.cwd().resolve()
head = subprocess.check_output(["git", "rev-parse", f"{sys.argv[1]}^{{commit}}"], text=True).strip()
mode = sys.argv[2]
if mode not in {"fresh", "native"}:
    raise SystemExit("mode must be fresh or native")
proof = root / ".scratch/evidence/CW-20261010-0097" / f"{mode}-{head}"
proof.mkdir(parents=True, exist_ok=False)
archive = proof / "source.tar"
with archive.open("wb") as output:
    subprocess.run(["git", "archive", "--format=tar", head], stdout=output, check=True)
stage = proof / "stage"
stage.mkdir()
with tarfile.open(archive) as source:
    source.extractall(stage, filter="data")

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def tree(path):
    return {str(file.relative_to(path)): sha(file) for file in sorted(path.rglob("*")) if file.is_file()}

tooling = {}
if (root / ".scratch/libs").exists():
    tooling["libs"] = tree(root / ".scratch/libs")
if (root / ".scratch/tooling").exists():
    for name in ["chromium", "libs", "fonts"]:
        if (root / ".scratch/tooling" / name).exists():
            tooling[name] = tree(root / ".scratch/tooling" / name)

chromium_path = Path("/home/chrispian/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome")
node_path = Path("/home/chrispian/.local/node/bin/node")
npm_path = Path("/home/chrispian/.local/node/bin/npm")
fonts_path = Path("/usr/share/fonts/truetype/dejavu")

prerequisites = {
    "node": {
        "path": str(node_path),
        "sha256": sha(node_path) if node_path.exists() else None,
        "attribution": "shared toolchain"
    },
    "npm": {
        "path": str(npm_path),
        "sha256": sha(npm_path) if npm_path.exists() else None,
        "attribution": "shared toolchain"
    },
    "chromium": {
        "path": str(chromium_path),
        "sha256": sha(chromium_path) if chromium_path.exists() else None,
        "attribution": "shared playwright cache"
    },
    "libs": {
        "path": str(root / ".scratch/libs"),
        "sha256_tree": tree(root / ".scratch/libs") if (root / ".scratch/libs").exists() else {},
        "attribution": "retained task worktree"
    },
    "fonts": {
        "path": str(fonts_path),
        "sha256_tree": tree(fonts_path) if fonts_path.exists() else {},
        "attribution": "system shared fonts"
    }
}

actual_tree = subprocess.check_output(["git", "rev-parse", f"{head}^{{tree}}"], text=True).strip()

receipt = {"head": head,
           "tree": actual_tree,
           "ancestor": "5dfcde6bef7fc96b0c0dbd1b8efbc7717eeaa4bc",
           "mode": mode,
           "archive_sha256": sha(archive),
           "source_files": tree(stage), "stage": str(stage),
           "lock_sha256": sha(stage / "frontend/package-lock.json"),
           "archives": tree(stage / "third_party") if (stage / "third_party").exists() else {},
           "tooling_bytes": tooling,
           "prerequisites": prerequisites,
           "fonts_conf_sha256": sha(root / ".scratch/tooling/fonts.conf") if (root / ".scratch/tooling/fonts.conf").exists() else None}
(stage / ".scratch/tmp").mkdir(parents=True, exist_ok=True)
if mode == "fresh":
    receipt["dependency_mode"] = "fresh npm ci in exact source stage; owned npm cache may supply fetched bytes"
    with (proof / "install.log").open("w") as log:
        import os
        env = dict(os.environ, TMPDIR=str(stage / ".scratch/tmp"), npm_config_cache=str(root / ".scratch/npm"))
        for command in [["npm", "ci"], ["npm", "run", "typecheck"]]:
            result = subprocess.run(command, cwd=stage / "frontend", env=env, stdout=log, stderr=subprocess.STDOUT)
            if result.returncode:
                receipt["failed_command"] = command
                receipt["exit_code"] = result.returncode
                (proof / "receipt.json").write_text(json.dumps(receipt, indent=2) + "\n")
                raise SystemExit(result.returncode)
    receipt["installed_hollis_bytes"] = tree(stage / "frontend/node_modules/@hollis-labs")
    receipt["exit_code"] = 0
else:
    receipt["dependency_mode"] = "retained owned npm-ci installation; original emitted hashes retained, port-mapped artifacts rebuilt; no fresh-install claim"
    (stage / "frontend/node_modules").symlink_to(root / "frontend/node_modules", target_is_directory=True)
    receipt["installed_hollis_bytes"] = tree(root / "frontend/node_modules/@hollis-labs")
    receipt["installed_external_bytes"] = {name: tree(root / "frontend/node_modules" / name) for name in ["@base-ui/react", "react", "react-dom", "playwright", "@playwright/test"]}
    if (root / ".scratch/storybook").exists():
        receipt["storybook_bytes"] = tree(root / ".scratch/storybook")
    receipt["webui_bytes"] = tree(root / "internal/webui/dist")
    if (root / ".scratch/parallax").exists():
        receipt["go_binary_sha256"] = sha(root / ".scratch/parallax")
    receipt["port_map"] = {"18541": "19031", "18542": "19032", "18545": "19035"}
    receipt["mapped_files"] = {}
    for file in [stage / "frontend/playwright.config.ts", stage / "frontend/src/workbench/catalog.ts",
                 *sorted((stage / "frontend/tests").glob("*.ts"))]:
        if not file.exists():
            continue
        original = file.read_text()
        mapped = original
        for old, new in receipt["port_map"].items():
            mapped = mapped.replace(old, new)
        if mapped != original:
            before = sha(file)
            file.write_text(mapped)
            receipt["mapped_files"][str(file.relative_to(stage))] = {"original_sha256": before, "mapped_sha256": sha(file)}
    wrapper = stage / "owned-native.config.mts"
    wrapper.write_text('import { defineConfig } from "./frontend/node_modules/@playwright/test/index.mjs"\n'
                       'import base from "./frontend/playwright.config.ts"\n'
                       'export default defineConfig({...base, testDir:"./frontend/tests", workers:1, outputDir:"../results", '
                       'use:{...base.use, baseURL:"http://127.0.0.1:19031", launchOptions:{args:["--no-sandbox"]}}})\n')
    receipt["tool_override_sha256"] = sha(wrapper)
    capture = proof / "capture-emitted.py"
    capture.write_text('from pathlib import Path\nimport hashlib,json\n'
                       'proof=Path(__file__).parent\nstage=proof/"stage"\n'
                       'def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()\n'
                       'def tree(p): return {str(f.relative_to(p)):sha(f) for f in sorted(p.rglob("*")) if f.is_file()}\n'
                       'receipt=json.loads((proof/"receipt.json").read_text())\n'
                       'receipt["mapped_emitted"]={"webui":tree(stage/"internal/webui/dist"),'
                       '"storybook":tree(stage/".scratch/storybook") if (stage/".scratch/storybook").exists() else {},'
                       '"go_binary_sha256":sha(stage/".scratch/parallax") if (stage/".scratch/parallax").exists() else None}\n'
                       '(proof/"receipt.json").write_text(json.dumps(receipt,indent=2)+"\\n")\n')
    cache_dir = Path("/home/chrispian/.cache/team-tmp")
    cache_dir.mkdir(parents=True, exist_ok=True)
    browser_tmp = Path(tempfile.mkdtemp(prefix=f"cw0097-b-{head[:7]}-", dir=cache_dir))
    receipt["owned_browser_tmp"] = str(browser_tmp)
    cleanup = proof / "cleanup.py"
    cleanup.write_text('from pathlib import Path\nimport json,shutil,sys\n'
                       f'profile=Path({str(browser_tmp)!r})\n'
                       'error=None\ntry:\n    shutil.rmtree(profile)\n'
                       'except FileNotFoundError:\n    pass\n'
                       'except OSError as caught:\n    error=str(caught)\n'
                       'receipt={"replay_exit_code":int(sys.argv[1]),"owned_browser_tmp":str(profile),'
                       '"removed":not profile.exists(),"cleanup_error":error}\n'
                       '(Path(__file__).parent/"cleanup-receipt.json").write_text(json.dumps(receipt,indent=2)+"\\n")\n'
                       'raise SystemExit(1 if error else 0)\n')
    quote = shlex.quote
    commands = ["#!/usr/bin/env bash", "set -euo pipefail", f"cd {quote(str(stage))}",
                "cleanup_owned() {", "  replay_status=$?", "  trap - EXIT",
                f'  if python3 {quote(str(cleanup))} "$replay_status"; then cleanup_status=0; else cleanup_status=$?; fi',
                '  if [[ "$replay_status" -eq 0 && "$cleanup_status" -ne 0 ]]; then exit "$cleanup_status"; fi',
                '  exit "$replay_status"', "}", "trap cleanup_owned EXIT",
                f"export TMPDIR={quote(str(browser_tmp))}", "export CI=true",
                f"export LD_LIBRARY_PATH={quote(str(root / '.scratch/libs'))}",
                f"npm run build --prefix frontend > {quote(str(proof / 'build.log'))} 2>&1",
                f"STORYBOOK_DISABLE_TELEMETRY=1 npm run build-storybook --prefix frontend >> {quote(str(proof / 'build.log'))} 2>&1",
                f"go build -o .scratch/parallax ./cmd/parallax >> {quote(str(proof / 'build.log'))} 2>&1",
                f"python3 {quote(str(capture))}",
                'frontend/node_modules/.bin/playwright test "${@:-reader-detail-custody.spec.ts}" --config owned-native.config.mts']
    (proof / "run.sh").write_text("\n".join(commands) + "\n")
(proof / "receipt.json").write_text(json.dumps(receipt, indent=2) + "\n")
print(json.dumps({"head": head, "mode": mode, "proof": str(proof), "archive_sha256": receipt["archive_sha256"]}))
