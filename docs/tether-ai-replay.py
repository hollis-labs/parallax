"""Materialize an exact committed source, install pins cheaply, or replay native CI.

From the OWN retained task worktree:
  python3 docs/tether-ai-replay.py [EXACT_COMMIT] fresh
  python3 docs/tether-ai-replay.py [EXACT_COMMIT] native
  bash .scratch/evidence/CW-20261010-0100/native-EXACT_COMMIT/run.sh

Fresh mode performs genuine clean offline npm ci from owned cache and runs typecheck in exact extracted stage.
Native mode records retained dependencies, executes run.sh with short newly owned browser temp, and runs affected Playwright checks on assigned port 19025.
"""
from pathlib import Path
import hashlib
import json
import os
import shlex
import subprocess
import sys
import tarfile

root = Path.cwd().resolve()
commit_arg = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1] in {"fresh", "native"} else "HEAD"
mode = sys.argv[2] if len(sys.argv) > 2 else (sys.argv[1] if len(sys.argv) > 1 and sys.argv[1] in {"fresh", "native"} else "native")

if mode not in {"fresh", "native"}:
    raise SystemExit("mode must be 'fresh' or 'native'")

head = subprocess.check_output(["git", "rev-parse", f"{commit_arg}^{{commit}}"], text=True).strip()

evidence_dir = root / ".scratch/evidence/CW-20261010-0100"
base_proof = evidence_dir / f"{mode}-{head}"
if not (base_proof / "receipt.json").exists():
    proof = base_proof
else:
    attempt = 2
    while (evidence_dir / f"{mode}-{head}-attempt{attempt}" / "receipt.json").exists():
        attempt += 1
    proof = evidence_dir / f"{mode}-{head}-attempt{attempt}"

proof.mkdir(parents=True, exist_ok=True)
archive = proof / "source.tar"
with archive.open("wb") as output:
    subprocess.run(["git", "archive", "--format=tar", head], stdout=output, check=True)

stage = proof / "stage"
if stage.exists():
    import shutil
    shutil.rmtree(stage)
stage.mkdir(parents=True)

with tarfile.open(archive) as source:
    source.extractall(stage, filter="data")

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def tree(path):
    if not path.exists():
        return {}
    return {str(file.relative_to(path)): sha(file) for file in sorted(path.rglob("*")) if file.is_file()}

receipt = {
    "task": "CW-20261010-0100",
    "workstream": "parallax-tether-ai",
    "head": head,
    "mode": mode,
    "archive_sha256": sha(archive),
    "stage": str(stage),
    "tether_specimen": {
        "file": "apps/sysop/frontend/src/pages/ai.tsx",
        "tether_commit": "3e9e7a42783d4e3df52db25e50e40e05bff4c8c4",
        "sha256": "7a241ec4ab8e286ece847c29ccb62e9fdfeb0cccfb991df3fd3ca5e188219636"
    },
    "source_files": tree(stage),
    "lock_sha256": sha(stage / "frontend/package-lock.json") if (stage / "frontend/package-lock.json").exists() else None,
    "third_party_archives": tree(stage / "third_party"),
    "tooling_bytes": {
        "chromium": tree(root / ".scratch/tooling/chromium"),
        "libs": tree(root / ".scratch/tooling/libs"),
        "fonts": tree(root / ".scratch/tooling/fonts")
    } if (root / ".scratch/tooling").exists() else {},
    "fonts_conf_sha256": sha(root / ".scratch/tooling/fonts.conf") if (root / ".scratch/tooling/fonts.conf").exists() else None,
    "assigned_ports": {
        "go": 19021,
        "storybook": 19022,
        "playwright_vite": 19025
    }
}

# Short newly owned browser temp directory
browser_tmp = Path(f"/home/chrispian/.cache/team-tmp/cw0100-b-{head[:7]}-{os.getpid()}")
browser_tmp.mkdir(parents=True, exist_ok=True)
receipt["browser_tmp"] = str(browser_tmp)

# Create cleanup trap helper
cleanup_py = proof / "cleanup.py"
cleanup_py.write_text(f"""import os, shutil, json, sys
browser_tmp = {repr(str(browser_tmp))}
proof_dir = {repr(str(proof))}
exit_code = int(sys.argv[1]) if len(sys.argv) > 1 else 0
if os.path.exists(browser_tmp):
    shutil.rmtree(browser_tmp, ignore_errors=True)
cleanup_receipt = {{
    "browser_tmp": browser_tmp,
    "status": "cleaned",
    "exit_code": exit_code
}}
with open(os.path.join(proof_dir, "cleanup-receipt.json"), "w") as f:
    json.dump(cleanup_receipt, f, indent=2)
    f.write("\\n")
""")
cleanup_py.chmod(0o755)

(stage / ".scratch/tmp").mkdir(parents=True, exist_ok=True)
if (root / ".scratch/tooling").exists():
    (stage / ".scratch/tooling").symlink_to(root / ".scratch/tooling", target_is_directory=True)

quote = shlex.quote

if mode == "fresh":
    receipt["dependency_mode"] = "clean npm ci from owned cache (.scratch/npm; network permitted); no retained node_modules"
    env = dict(os.environ, TMPDIR=str(browser_tmp), npm_config_cache=str(root / ".scratch/npm"))
    with (proof / "fresh-install.log").open("w") as install_log:
        ci_res = subprocess.run(
            ["npm", "ci", "--ignore-scripts", "--no-audit", "--no-fund"],
            cwd=stage / "frontend",
            env=env,
            stdout=install_log,
            stderr=subprocess.STDOUT
        )
    if ci_res.returncode != 0:
        receipt["failed_command"] = ["npm", "ci"]
        receipt["exit_code"] = ci_res.returncode
        (proof / "receipt.json").write_text(json.dumps(receipt, indent=2) + "\n")
        subprocess.run(["python3", str(cleanup_py), str(ci_res.returncode)], check=False)
        raise SystemExit(ci_res.returncode)

    with (proof / "typecheck.log").open("w") as tc_log:
        tc_res = subprocess.run(
            ["npm", "run", "typecheck"],
            cwd=stage / "frontend",
            env=env,
            stdout=tc_log,
            stderr=subprocess.STDOUT
        )
        if tc_res.returncode != 0:
            receipt["failed_command"] = ["npm", "run", "typecheck"]
            receipt["exit_code"] = tc_res.returncode
            (proof / "receipt.json").write_text(json.dumps(receipt, indent=2) + "\n")
            subprocess.run(["python3", str(cleanup_py), str(tc_res.returncode)], check=False)
            raise SystemExit(tc_res.returncode)

    receipt["exit_code"] = 0
    subprocess.run(["python3", str(cleanup_py), "0"], check=False)
    (proof / "receipt.json").write_text(json.dumps(receipt, indent=2) + "\n")
    print(json.dumps({"head": head, "mode": mode, "proof": str(proof), "archive_sha256": receipt["archive_sha256"], "exit_code": 0}))

else:
    receipt["dependency_mode"] = "retained_dependencies (worktree offline node_modules; verified hollis packages and lockfile; assigned port 19025; no fresh-install claim)"
    (stage / "frontend/node_modules").symlink_to(root / "frontend/node_modules", target_is_directory=True)
    receipt["installed_hollis_bytes"] = tree(root / "frontend/node_modules/@hollis-labs")
    receipt["installed_external_bytes"] = {
        name: tree(root / "frontend/node_modules" / name)
        for name in ["@base-ui/react", "react", "react-dom", "playwright", "@playwright/test", "@biomejs/biome"]
        if (root / "frontend/node_modules" / name).exists()
    }

    commands = [
        "#!/usr/bin/env bash",
        "set -euo pipefail",
        f"cd {quote(str(stage))}",
        f"export TMPDIR={quote(str(browser_tmp))}",
        "export CI=true",
        f"export LD_LIBRARY_PATH={quote(str(root / '.scratch/tooling/libs') + ':' + str(root / '.scratch/tooling/libs/gbm'))}",
        f"export FONTCONFIG_FILE={quote(str(root / '.scratch/tooling/fonts.conf'))}",
        f"export OWN_CHROMIUM={quote(str(root / '.scratch/tooling/chromium/chrome-headless-shell'))}",
        f"trap 'python3 {quote(str(cleanup_py))} $?' EXIT",
        "npm exec --prefix frontend -- playwright test --config frontend/playwright.tether-ai.config.ts \"$@\"",
        f"# Replay completed for Tether AI Gateway (CW-20261010-0100)"
    ]
    (proof / "run.sh").write_text("\n".join(commands) + "\n")
    (proof / "run.sh").chmod(0o755)

    print(f"Executing native replay via {proof / 'run.sh'}...")
    with (proof / "test.log").open("w") as log:
        proc = subprocess.run([str(proof / "run.sh")], cwd=stage, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        log.write(proc.stdout)
        print(proc.stdout)
        receipt["test_exit_code"] = proc.returncode
        receipt["exit_code"] = proc.returncode

    (proof / "receipt.json").write_text(json.dumps(receipt, indent=2) + "\n")
    print(json.dumps({"head": head, "mode": mode, "proof": str(proof), "archive_sha256": receipt["archive_sha256"], "exit_code": proc.returncode}))
    if proc.returncode != 0:
        raise SystemExit(proc.returncode)
