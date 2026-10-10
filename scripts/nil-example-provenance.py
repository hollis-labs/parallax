#!/usr/bin/env python3
"""Inspect exact landed public candidates; never repack or rebuild a kit."""
import argparse
import base64
import hashlib
import json
from pathlib import Path
import subprocess
import tarfile

parser = argparse.ArgumentParser()
parser.add_argument('--kit-repo', required=True)
parser.add_argument('--output', default='.scratch/nil/provenance')
a = parser.parse_args()
root = Path(__file__).resolve().parents[1]
output = root / a.output
output.mkdir(parents=True, exist_ok=True)
kit = Path(a.kit_repo).resolve()
sha = lambda data: hashlib.sha256(data).hexdigest()
run = lambda *cmd: subprocess.check_output(cmd, cwd=kit)
manifest = {'task': 'CW-20261010-0093', 'claim': 'Unchanged accepted public local candidates; retained parent build evidence, no kit rebuild/repack/release by0093', 'packages': {}}
heads = {'design-components': 'fa096cd2ffd239050f134b842ab987a9cbf453fe', 'kit-dashboard': 'cd3a90b16866548d6226c910e48f6f54177a3a40'}
pkg = json.loads((root / 'frontend/package.json').read_text())
lock = json.loads((root / 'frontend/package-lock.json').read_text())
for name, head in heads.items():
    pin = pkg['dependencies']['@hollis-labs/' + name]
    archive = (root / 'frontend' / pin.removeprefix('file:')).resolve()
    installed = root / 'frontend/node_modules/@hollis-labs' / name
    integrity = 'sha512-' + base64.b64encode(hashlib.sha512(archive.read_bytes()).digest()).decode()
    entry = lock['packages']['node_modules/@hollis-labs/' + name]
    assert entry['integrity'] == integrity
    maps = {}
    with tarfile.open(archive) as tar:
        for member in tar.getmembers():
            if not member.isfile():
                continue
            relative = member.name.removeprefix('package/')
            data = tar.extractfile(member).read()
            maps[relative] = sha(data)
            assert (installed / relative).read_bytes() == data, relative
            target = output / 'emitted' / name / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(data)
    actual = {str(p.relative_to(installed)): sha(p.read_bytes()) for p in sorted(installed.rglob('*')) if p.is_file()}
    assert actual == maps, name + ' installed extra/missing bytes'
    source = {}
    for path in run('git', 'ls-tree', '-r', '--name-only', head, '--', 'packages/' + name, *(['package.json','package-lock.json'] if name == 'design-components' else [])).decode().splitlines():
        data = run('git', 'show', head + ':' + path)
        source[path] = sha(data)
        target = output / 'source' / name / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
    receipt = {'sourceHead': head, 'sourceRepoTree': run('git','rev-parse',head+'^{tree}').decode().strip(), 'sourcePackageTree': run('git','rev-parse',head+':packages/'+name).decode().strip(), 'sourceFilesSha256': source, 'archive': str(archive.relative_to(root)), 'archiveSha256': sha(archive.read_bytes()), 'pin': pin, 'lockEntry': entry, 'archiveFilesSha256': maps, 'installedFilesSha256': actual, 'emittedJsTypesCss': {key:value for key,value in maps.items() if key.endswith(('.js','.d.ts','.css'))}, 'matches': True}
    if name == 'design-components':
        parent = json.loads((root / '.scratch/nil/parents/0091-seal.json').read_text())
        assert parent['sourceHead'] == head and parent['archiveSha256'] == receipt['archiveSha256']
        assert parent['archiveFilesSha256'] == maps and parent['sourceFilesSha256'] == source
    else:
        parent = json.loads((root / '.scratch/nil/parents/0073-installed-map.json').read_text())['kit-dashboard']
        assert parent['sha256'] == receipt['archiveSha256'] and parent['files'] == maps
    manifest['packages'][name] = receipt
    print(name, 'PASS', len(source), 'Git source files;', len(maps), 'archive/pin/installed files')
manifest['lockSha256'] = sha((root / 'frontend/package-lock.json').read_bytes())
manifest['publicImportSurface'] = {'components': '@hollis-labs/design-components', 'operationsList': '@hollis-labs/kit-dashboard/layout'}
manifest['parents'] = {str(p.relative_to(root)): sha(p.read_bytes()) for p in sorted((root / '.scratch/nil/parents').rglob('*')) if p.is_file()}
(output / 'manifest.json').write_text(json.dumps(manifest, indent=2, sort_keys=True) + '\n')
