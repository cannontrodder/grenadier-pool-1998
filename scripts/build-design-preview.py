#!/usr/bin/env python3
"""Copy the dependency-free design preview into Sites' supported output root."""
from pathlib import Path
import json
import shutil
import subprocess

root = Path(__file__).resolve().parents[1]
source = root / 'docs' / 'design'
output = root / 'out'
if not (source / 'index.html').is_file():
    raise SystemExit('Missing design preview entry point')
if output.is_symlink():
    raise SystemExit('Refusing to replace a symlink at out/')
if output.exists():
    shutil.rmtree(output)
shutil.copytree(source, output)
# Keep the accepted throwaway study at its historical route without merging it
# into the application. Pin source, rather than copying whichever branch is live.
study_revision = '059a7e8212999c966da0e8bacfc445acc6502c5d'
study_path = 'docs/design/touch-study'
study_files = subprocess.check_output(
    ['git', 'ls-tree', '-r', '--name-only', study_revision, '--', study_path],
    cwd=root, text=True,
).splitlines()
for name in study_files:
    target = output / 'touch-study' / Path(name).relative_to(study_path)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(subprocess.check_output(['git', 'show', f'{study_revision}:{name}'], cwd=root))
(output / 'touch-study' / 'revision.json').write_text(json.dumps({'revision': 'd4f83f24786a089113ffce74a3f4525c6be609d5'}))
if (root / 'practice' / 'index.html').exists():
    shutil.copytree(root / 'practice', output / 'practice')
    revision = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=root, text=True).strip()
    dirty = bool(subprocess.check_output(['git', 'status', '--porcelain', '--', 'practice', 'scripts/build-design-preview.py'], cwd=root, text=True).strip())
    (output / 'practice' / 'revision.json').write_text(json.dumps({'revision': revision + ('-dirty' if dirty else '')}))
print(f'Design preview: {len(list(output.rglob("*")))} entries copied to out/')
