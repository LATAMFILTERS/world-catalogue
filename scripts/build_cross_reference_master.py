#!/usr/bin/env python3
"""
build_cross_reference_master.py
================================
Combina mann_donaldson_matches + mann_fleetguard_matches
en cross_reference_master (ejecutado server-side vía API).

Columnas: oem_normalized, oem_brand, mann_part, donaldson_part,
          fleetguard_part, elimfilters_sku (NULL), segment
"""

import json
import sys
import urllib.request
import urllib.error

API_BASE = "https://elimfilters-search-pro.onrender.com"
API_KEY  = "elim2026"


def api_post(path, payload, timeout=300):
    data = json.dumps(payload).encode("utf-8")
    req  = urllib.request.Request(
        f"{API_BASE}{path}",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main():
    print("Building cross_reference_master (server-side)...")
    try:
        result = api_post("/api/oem/build-cross-reference-master", {"key": API_KEY})
    except urllib.error.HTTPError as e:
        print(f"ERROR {e.code}: {e.read().decode()}")
        sys.exit(1)

    if not result.get("success"):
        print(f"ERROR: {result.get('error')}")
        sys.exit(1)

    print(f"\n✅ cross_reference_master built")
    print(f"\nTotals:")
    print(f"  Total rows          : {int(result['total']):,}")
    print(f"  Unique MANN parts   : {int(result['mann_u']):,}")
    print(f"  Unique DON parts    : {int(result['don_u']):,}")
    print(f"  Unique FG parts     : {int(result['fg_u']):,}")
    print(f"\nCoverage:")
    print(f"  MANN ↔ DON + FG     : {int(result['don_and_fg']):,}")
    print(f"  MANN ↔ DON only     : {int(result['don_only']):,}")
    print(f"  MANN ↔ FG only      : {int(result['fg_only']):,}")


if __name__ == "__main__":
    main()
