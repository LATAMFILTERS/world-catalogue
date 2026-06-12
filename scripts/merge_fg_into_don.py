#!/usr/bin/env python3
"""
merge_fg_into_don.py — Fusiona registros Fleetguard en Donaldson

Lógica:
  - DON ↔ FG vinculados (competitor_codes): fusiona brand_crossrefs + oem_codes
    de FG en DON y elimina el registro FG duplicado
  - DON sin par FG: queda igual (base DON)
  - FG sin par DON: queda igual (base FG)

Uso:
    python merge_fg_into_don.py              # dry-run (preview, sin cambios)
    python merge_fg_into_don.py --execute    # ejecuta la fusión real
"""

import json
import sys
import requests

API_BASE = "https://elimfilters-search-pro.onrender.com"
API_KEY  = "elim2026"


def run(execute: bool):
    dry_run = not execute
    label = "DRY-RUN" if dry_run else "EJECUTANDO"
    print(f"\n{'='*60}")
    print(f"  merge_fg_into_don — {label}")
    print(f"{'='*60}\n")

    r = requests.post(
        f"{API_BASE}/api/catalog/merge-fg-into-don",
        json={"key": API_KEY, "dry_run": dry_run},
        timeout=180,
    )
    r.raise_for_status()
    data = r.json()

    print(json.dumps(data, indent=2, ensure_ascii=False))

    if dry_run:
        print("\n⚠️  Preview solo. Para ejecutar:")
        print("   python merge_fg_into_don.py --execute")
    else:
        print(f"\n✅ Fusión completada:")
        print(f"   brand_crossrefs fusionados : {data.get('refs_merged', 0)}")
        print(f"   oem_codes fusionados       : {data.get('oem_merged', 0)}")
        print(f"   registros FG eliminados    : {data.get('fg_deleted', 0)}")


if __name__ == "__main__":
    execute = "--execute" in sys.argv
    run(execute)
