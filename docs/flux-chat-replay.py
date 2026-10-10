"""Materialize an exact committed source, install pins cheaply, or replay native CI.

From the OWN retained task worktree:
  python3 docs/flux-chat-replay.py EXACT_COMMIT fresh
  python3 docs/flux-chat-replay.py EXACT_COMMIT native
  heavytest bash .scratch/evidence/CW-20261010-0088/native-EXACT_COMMIT/run.sh
Fresh mode performs npm ci and typecheck only, not another broad native gate.
Native mode records retained dependencies/emitted builds and exact port mappings.
"""
from pathlib import Path
import hashlib
import json
import shlex
import subprocess
import sys
import tarfile

root = Path.cwd().resolve()
head = subprocess.check_output(["git", "rev-parse", f"{sys.argv[1]}^{{commit}}"], text=True).strip()
mode = sys.argv[2]
if mode not in {"fresh", "native"}:
    raise SystemExit("mode must be fresh or native")
proof = root / ".scratch/evidence/CW-20261010-0088" / f"{mode}-{head}"
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

receipt = {"head": head, "mode": mode, "archive_sha256": sha(archive),
           "source_files": tree(stage), "stage": str(stage),
           "lock_sha256": sha(stage / "frontend/package-lock.json"),
           "archives": tree(stage / "third_party")}
(stage / ".scratch/tmp").mkdir(parents=True)
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
    receipt["storybook_bytes"] = tree(root / ".scratch/storybook")
    receipt["webui_bytes"] = tree(root / "internal/webui/dist")
    receipt["go_binary_sha256"] = sha(root / ".scratch/parallax")
    receipt["port_map"] = {"18541": "18951", "18542": "18952", "18545": "18955"}
    receipt["mapped_files"] = {}
    for file in [stage / "frontend/playwright.config.ts", stage / "frontend/src/workbench/catalog.ts",
                 *sorted((stage / "frontend/tests").glob("*.ts"))]:
        original = file.read_text()
        mapped = original
        for old, new in receipt["port_map"].items():
            mapped = mapped.replace(old, new)
        if mapped != original:
            before = sha(file)
            file.write_text(mapped)
            receipt["mapped_files"][str(file.relative_to(stage))] = {"original_sha256": before, "mapped_sha256": sha(file)}
    # Browser/tool, output and worker overrides are explicit and separate from the port-only source mapping.
    wrapper = stage / "owned-native.config.mts"
    wrapper.write_text('import { defineConfig } from "./frontend/node_modules/@playwright/test/index.mjs"\n'
                       'import base from "./frontend/playwright.config.ts"\n'
                       'export default defineConfig({...base, testDir:"./frontend/tests", workers:2, outputDir:"../results", '
                       'use:{...base.use, launchOptions:{executablePath:process.env.OWN_CHROMIUM,args:["--no-sandbox"]}}})\n')
    receipt["tool_override_sha256"] = sha(wrapper)
    # The Workbench localhost admission list is part of the port-only mapping.
    # Rebuild its app and portable-story artifacts; retain original emitted hashes above.
    capture = proof / "capture-emitted.py"
    capture.write_text('from pathlib import Path\nimport hashlib,json\n'
                       'proof=Path(__file__).parent\nstage=proof/"stage"\n'
                       'def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()\n'
                       'def tree(p): return {str(f.relative_to(p)):sha(f) for f in sorted(p.rglob("*")) if f.is_file()}\n'
                       'receipt=json.loads((proof/"receipt.json").read_text())\n'
                       'receipt["mapped_emitted"]={"webui":tree(stage/"internal/webui/dist"),'
                       '"storybook":tree(stage/".scratch/storybook"),"go_binary_sha256":sha(stage/".scratch/parallax")}\n'
                       '(proof/"receipt.json").write_text(json.dumps(receipt,indent=2)+"\\n")\n')
    browser_tmp = Path(f"/home/chrispian/.cache/team-tmp/cw0088-b-{head[:7]}")
    browser_tmp.mkdir(parents=True, exist_ok=False)
    receipt["owned_browser_tmp"] = str(browser_tmp)
    quote = shlex.quote
    commands = ["#!/usr/bin/env bash", "set -euo pipefail", f"cd {quote(str(stage))}",
                f"export TMPDIR={quote(str(browser_tmp))}", "export CI=true",
                f"export OWN_CHROMIUM={quote(str(root / '.scratch/tooling/chromium/chrome-headless-shell'))}",
                f"export LD_LIBRARY_PATH={quote(str(root / '.scratch/tooling/libs'))}",
                f"export FONTCONFIG_FILE={quote(str(root / '.scratch/tooling/fonts.conf'))}",
                f"export GOCACHE={quote(str(root / '.scratch/gocache'))}",
                f"export GOMODCACHE={quote(str(root / '.scratch/gomodcache'))}",
                f"npm run build --prefix frontend > {quote(str(proof / 'build.log'))} 2>&1",
                f"STORYBOOK_DISABLE_TELEMETRY=1 npm run build-storybook --prefix frontend >> {quote(str(proof / 'build.log'))} 2>&1",
                f"go build -o .scratch/parallax ./cmd/parallax >> {quote(str(proof / 'build.log'))} 2>&1",
                f"python3 {quote(str(capture))}",
                'frontend/node_modules/.bin/playwright test --config owned-native.config.mts "$@"']
    (proof / "run.sh").write_text("\n".join(commands) + "\n")
(proof / "receipt.json").write_text(json.dumps(receipt, indent=2) + "\n")
print(json.dumps({"head": head, "mode": mode, "proof": str(proof), "archive_sha256": receipt["archive_sha256"]}))
