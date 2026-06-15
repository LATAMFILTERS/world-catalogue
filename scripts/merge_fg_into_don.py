#!/usr/bin/env python3
"""
merge_fg_into_don.py — Fusiona registros Fleetguard en Donaldson (toda la DB)

Regla:
  - Donaldson es siempre el código BASE
  - Fleetguard es cross-reference competidor, NO base independiente
  - Si FG tiene par DON: FG se fusiona en DON y el registro FG se elimina
  - Si FG NO tiene par DON: se conserva como parte única de FG

Paso 1 (dry-run): python merge_fg_into_don.py
Paso 2 (ejecutar): python merge_fg_into_don.py --execute
"""

import json
import sys
import requests

API_BASE = "https://elimfilters-search-pro.onrender.com"
API_KEY  = "elim2026"


def run(execute: bool):
    dry_run = not execute
    label = "DRY-RUN (preview)" if dry_run else "EJECUTANDO — cambios reales"
    print(f"\n{'='*65}")
    print(f"  merge_fg_into_don — {label}")
    print(f"{'='*65}\n")

    r = requests.post(
        f"{API_BASE}/api/catalog/merge-fg-into-don",
        json={"key": API_KEY, "dry_run": dry_run},
        timeout=300,
    )
    r.raise_for_status()
    data = r.json()

    if dry_run:
        stats = data.get("stats", {})
        print(f"Registros FG totales en DB   : {stats.get('total_fg_records', '?')}")
        print(f"Pares FG→DON encontrados     : {stats.get('pairs_found', '?')}")
        print(f"Registros FG a ELIMINAR      : {stats.get('will_delete', '?')}")
        print(f"Registros FG ÚNICOS (keep)   : {stats.get('will_keep_as_unique_fg', '?')}")
        print(f"\nMuestra de pares (primeros 30):")
        for line in (data.get("sample") or []):
            print(f"  {line}")
        print(f"\n{data.get('note','')}")
        print(f"\nPara ejecutar:")
        print(f"   python merge_fg_into_don.py --execute")
    else:
        stats = data.get("stats", {})
        print(f"✅ Fusión completada:")
        print(f"   Pares procesados        : {stats.get('pairs_processed', 0)}")
        print(f"   Fusionados en DON       : {stats.get('merged', 0)}")
        print(f"   Registros FG eliminados : {stats.get('deleted', 0)}")
        print(f"   FG únicos conservados   : {stats.get('kept_unique_fg', 0)}")
        print(f"   Errores                 : {stats.get('errors', 0)}")
        if data.get("errors", 0):
            print(f"\n⚠️  Hubo errores — revisar logs del servidor")


if __name__ == "__main__":
    execute = "--execute" in sys.argv
    run(execute)
