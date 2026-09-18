#!/usr/bin/env python3
"""Copy the dependency-free design preview into Sites' supported output root."""
from pathlib import Path
import shutil

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
print(f'Design preview: {len(list(output.rglob("*")))} entries copied to out/')
