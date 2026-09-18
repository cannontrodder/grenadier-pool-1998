#!/usr/bin/env python3
"""Build only the public practice runtime; never copy the design/evidence tree."""
import json
from pathlib import Path
import shutil
import subprocess

root = Path(__file__).resolve().parents[1]
output = root / 'out-public'
runtime = ['index.html', 'app.js', 'style.css', 'input.mjs', 'model.mjs', 'geometry.mjs', 'tuning.mjs', 'guide.mjs']
for name in runtime:
    source = root / 'practice' / name
    if not source.is_file() or source.is_symlink():
        raise SystemExit(f'Missing or linked runtime file: {name}')
if output.is_symlink():
    raise SystemExit('Refusing to replace a symlink at out-public/')
if output.exists():
    shutil.rmtree(output)
output.mkdir()
for name in runtime:
    shutil.copyfile(root / 'practice' / name, output / name)
index = output / 'index.html'
index.write_text(index.read_text().replace('../favicon.svg', './favicon.svg'))
shutil.copyfile(root / 'docs/design/favicon.svg', output / 'favicon.svg')
revision = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=root, text=True).strip()
dirty = bool(subprocess.check_output(
    ['git', 'status', '--porcelain', '--', 'practice', 'scripts/build-practice-preview.py', 'docs/design/favicon.svg'],
    cwd=root, text=True,
).strip())
(output / 'revision.json').write_text(json.dumps({'revision': revision + ('-dirty' if dirty else '')}) + '\n')
(output / '.nojekyll').touch()
expected = set(runtime) | {'favicon.svg', 'revision.json', '.nojekyll'}
if {path.name for path in output.iterdir()} != expected:
    raise SystemExit('Public bundle contained unexpected files')
print(f'Public practice preview: {len(expected)} files, revision {revision}{"-dirty" if dirty else ""}')
