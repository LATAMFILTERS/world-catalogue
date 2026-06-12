#!/usr/bin/env python3
"""
enrich_fg_to_don_oem.py
=======================
Copia OEM codes de productos Fleetguard emparejados hacia sus equivalentes
Donaldson en la DB, usando pares Pass A (brand_crossrefs).

Append-only: JAMAS modifica datos existentes.

Uso:
    python enrich_fg_to_don_oem.py --dry-run   # preview
    python enrich_fg_to_don_oem.py             # ejecutar
"""
import argparse, requests, sys

API_URL = "https://elimfilters-search-pro.onrender.com/api/enrich/fg-to-don-oem"
API_KEY = "elim2026"

parser = argparse.ArgumentParser()
parser.add_argument("--dry-run", action="store_true")
args = parser.parse_args()

print(f"→ POST {API_URL} (dry_run={args.dry_run}) ...")
r = requests.post(API_URL, json={"key": API_KEY, "dry_run": args.dry_run}, timeout=300)
r.raise_for_status()
data = r.json()

if args.dry_run:
    print(f"\n=== PREVIEW ===")
    print(f"DON rows afectados:  {data.get('don_rows_affected')}")
    print(f"Nuevos OEM entries:  {data.get('new_oem_entries')}")
    print("\nMuestra:")
    for s in data.get("sample", []):
        print(f"  {s['don_sku']} ← +{s['new_codes']} codes | ej: {s.get('sample_entry')}")
else:
    print(f"\n✅ DON rows actualizados: {data.get('don_rows_updated')}")
    print(f"✅ Nuevos OEM entries:    {data.get('new_oem_entries')}")
