#!/usr/bin/env python3
"""Construit l'index des fichiers pour GitHub Pages (aucune dépendance)."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'contenu'
SUPPORTED = {'.txt', '.png', '.jpg', '.jpeg', '.gif', '.webp'}

def files(folder):
    if not folder.exists():
        return []
    return [{'path': p.relative_to(ROOT).as_posix(), 'title': p.stem.replace('_', ' ').replace('-', ' ')}
            for p in sorted(folder.iterdir(), key=lambda p: p.name.lower())
            if p.is_file() and p.suffix.lower() in SUPPORTED and not p.name.startswith('.')]

archives = []
archive_root = BASE / 'archives'
if archive_root.is_dir():
    folders = [p for p in archive_root.iterdir() if p.is_dir() and p.name.isdigit()]
    for folder in sorted(folders, key=lambda p: int(p.name), reverse=True):
        archives.append({'id': folder.name, 'title': f'Semaine {folder.name}', 'files': files(folder)})

index = {'current': files(BASE / 'semaine'), 'messages': files(BASE / 'messages'), 'archives': archives}
output = ROOT / 'data' / 'index.json'
output.parent.mkdir(exist_ok=True)
output.write_text(json.dumps(index, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f"Index généré : {len(index['current'])} publication(s), {len(index['messages'])} message(s), {len(archives)} archive(s)")
