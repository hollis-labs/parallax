#!/usr/bin/env python3
"""Verify actual installed bytes against the explicit local candidate archive."""
from pathlib import Path
import hashlib
import json
import tarfile

root = Path(__file__).resolve().parents[1]
proof = root / '.scratch/operations-list'
proof.mkdir(parents=True, exist_ok=True)
sha = lambda data: hashlib.sha256(data).hexdigest()
packages = {}
for name, filename in [
    ('kit-dashboard', 'hollis-labs-kit-dashboard-0.4.0-cw0073-reviewed-candidate.tgz'),
    ('design-components', 'hollis-labs-design-components-0.4.0-cw0036.tgz'),
]:
    archive = root / 'third_party' / filename
    installed = root / 'frontend/node_modules/@hollis-labs' / name
    with tarfile.open(archive) as packed:
        expected = {member.name.removeprefix('package/'): sha(packed.extractfile(member).read())
                    for member in packed.getmembers() if member.isfile()}
    actual = {str(file.relative_to(installed)): sha(file.read_bytes())
              for file in installed.rglob('*') if file.is_file()}
    if expected != actual:
        mismatch = [key for key in expected.keys() | actual.keys() if expected.get(key) != actual.get(key)]
        raise SystemExit(f'{name}: installed/archive mismatch: {mismatch}')
    surfaces = {key: value for key, value in actual.items() if key.endswith(('.js', '.d.ts', '.css'))}
    packages[name] = {'archive': str(archive.relative_to(root)), 'sha256': sha(archive.read_bytes()),
                      'files': expected, 'installedFiles': actual, 'jsTypesCss': surfaces, 'equal': True}
    print(f'PASS {name}: {len(actual)} installed files exactly match {filename}; {len(surfaces)} JS/types/CSS files; SHA256 {packages[name]["sha256"]}')
runtime = root / 'frontend/node_modules/@hollis-labs/design-app-runtime'
packages['design-app-runtime'] = {'origin': 'registry baseline 0.4.0, unchanged',
    'jsTypesCss': {str(file.relative_to(runtime)): sha(file.read_bytes()) for file in sorted(runtime.rglob('*')) if file.is_file() and str(file).endswith(('.js', '.d.ts', '.css'))}}
(proof / 'installed-map.json').write_text(json.dumps(packages, indent=2, sort_keys=True) + '\n')
