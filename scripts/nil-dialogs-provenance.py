#!/usr/bin/env python3
"""Map source -> local package archive -> lock pin -> installed files. No downloads."""
import argparse, base64, hashlib, json, pathlib, subprocess, tarfile
p = argparse.ArgumentParser()
p.add_argument('--kit', required=True)
p.add_argument('--output', required=True)
a = p.parse_args()
repo = pathlib.Path(__file__).resolve().parents[1]
kit = pathlib.Path(a.kit).resolve()
pkg = json.loads((repo / 'frontend/package.json').read_text())
relative = pkg['dependencies']['@hollis-labs/design-components'].removeprefix('file:')
archive = (repo / 'frontend' / relative).resolve()
lock = json.loads((repo / 'frontend/package-lock.json').read_text())['packages']['node_modules/@hollis-labs/design-components']
sha = lambda data: hashlib.sha256(data).hexdigest()
archive_bytes = archive.read_bytes()
integrity = 'sha512-' + base64.b64encode(hashlib.sha512(archive_bytes).digest()).decode()
assert lock['integrity'] == integrity, 'lock integrity differs from archive'
installed = repo / 'frontend/node_modules/@hollis-labs/design-components'
files = {}
with tarfile.open(archive, 'r:gz') as tar:
    for entry in tar.getmembers():
        if not entry.isfile():
            continue
        relative_file = entry.name.removeprefix('package/')
        data = tar.extractfile(entry).read()
        target = installed / relative_file
        source = kit / 'packages/design-components' / relative_file
        assert target.is_file() and target.read_bytes() == data, f'installed mismatch: {relative_file}'
        assert source.is_file() and source.read_bytes() == data, f'authored/build mismatch: {relative_file}'
        files[relative_file] = sha(data)
actual_files = {str(path.relative_to(installed)) for path in installed.rglob('*') if path.is_file()}
assert actual_files == set(files), 'installed package has missing or extra files'
source_files = {str(path.relative_to(kit)): sha(path.read_bytes()) for path in (kit / 'packages/design-components/src').rglob('*') if path.is_file()}
head = lambda path: subprocess.check_output(['git', '-C', str(path), 'rev-parse', 'HEAD'], text=True).strip()
out = {'kit_head': head(kit), 'parallax_head': head(repo), 'kit_source_files': source_files,
       'archive_path': str(archive), 'archive_sha256': sha(archive_bytes), 'archive_sha512_integrity': integrity,
       'pin': relative, 'lock_entry': lock, 'installed_root': str(installed), 'files': files,
       'boundary': 'Exact local build/archive/pin/installed map; tool dependencies are not claimed as rebuilt or sourced from this archive.'}
pathlib.Path(a.output).write_text(json.dumps(out, indent=2) + '\n')
print('PASS source/build/archive/pin/installed bytes:', len(files), 'package files')
