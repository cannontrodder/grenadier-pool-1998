#!/usr/bin/env python3
"""Copy the dependency-free design preview into Sites' supported output root."""
from pathlib import Path
import shutil
import json
import subprocess

root = Path(__file__).resolve().parents[1]
source = root / 'docs' / 'design'
if subprocess.check_output(['git', 'status', '--porcelain', '--', 'docs/design', 'scripts'], cwd=root, text=True).strip():
    raise SystemExit('Commit source changes before building a revision-labelled preview')
output = root / 'out'
if not (source / 'index.html').is_file():
    raise SystemExit('Missing design preview entry point')
if output.is_symlink():
    raise SystemExit('Refusing to replace a symlink at out/')
if output.exists():
    shutil.rmtree(output)
shutil.copytree(source, output)
study = output / 'touch-study'
if study.is_dir():
    revision = subprocess.check_output(['git', 'rev-parse', '--verify', 'HEAD'], cwd=root, text=True).strip()
    (study / 'revision.json').write_text(json.dumps({'revision': revision}) + '\n')
print(f'Design preview: {len(list(output.rglob("*")))} entries copied to out/')
