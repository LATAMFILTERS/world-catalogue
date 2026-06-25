#!/usr/bin/env python3
"""
rebuild_oem_engine.py
=====================
Reconstruye las 3 tablas del OEM Resolution Engine en orden.
Muestra estadísticas de cobertura al final.
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


def api_get(path, timeout=60):
    req = urllib.request.Request(f"{API_BASE}{path}", method="GET")
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def step(title, path, payload):
    print(f"\n{'─'*55}")
    print(f"  {title}")
    print(f"{'─'*55}")
    try:
        result = api_post(path, payload)
    except urllib.error.HTTPError as e:
        print(f"  ERROR {e.code}: {e.read().decode()}")
        sys.exit(1)

    if not result.get("success"):
        print(f"  ERROR: {result.get('error')}")
        sys.exit(1)

    return result


def main():
    # ── 1. Donaldson matches ──────────────────────────────────────
    r = step(
        "1/3  Donaldson matches",
        "/api/oem/build-donaldson-matches",
        {"key": API_KEY},
    )
    don_total = int(r.get("total", 0))
    print(f"  Total filas          : {don_total:,}")
    print(f"  Via OEM code         : {int(r.get('via_oem_code', 0)):,}")
    print(f"  Via brand_crossref   : {int(r.get('via_brand_crossref', 0)):,}")
    print(f"  MANN parts únicos    : {int(r.get('mann_u', 0)):,}")
    print(f"  Donaldson únicos     : {int(r.get('don_u', 0)):,}")
    print(f"  Productos HD         : {int(r.get('productos_hd', 0)):,}")
    print(f"  Productos LD         : {int(r.get('productos_ld', 0)):,}")
    print(f"  Productos MIXED      : {int(r.get('productos_mixed', 0)):,}")

    # ── 2. Fleetguard matches ─────────────────────────────────────
    r = step(
        "2/3  Fleetguard matches",
        "/api/oem/build-fleetguard-matches",
        {"key": API_KEY},
    )
    fg_total = int(r.get("total", 0))
    print(f"  Total filas          : {fg_total:,}")
    print(f"  MANN parts únicos    : {int(r.get('mann_u', 0)):,}")
    print(f"  Fleetguard únicos    : {int(r.get('fg_u', 0)):,}")

    # ── 3. Cross-reference master ─────────────────────────────────
    r = step(
        "3/3  Cross-reference master",
        "/api/oem/build-cross-reference-master",
        {"key": API_KEY},
    )
    master_total = int(r.get("total", 0))
    print(f"  Total filas          : {master_total:,}")
    print(f"  MANN parts únicos    : {int(r.get('mann_u', 0)):,}")
    print(f"  ELIM SKUs cubiertos  : {int(r.get('elim_u', 0)):,}")
    print(f"  Via OEM code         : {int(r.get('via_oem_code', 0)):,}")
    print(f"  Via brand_crossref   : {int(r.get('via_brand_crossref', 0)):,}")

    # ── Resumen ───────────────────────────────────────────────────
    print(f"\n{'═'*55}")
    print(f"  RESUMEN OEM ENGINE")
    print(f"{'═'*55}")
    print(f"  Donaldson matches    : {don_total:,}")
    print(f"  Fleetguard matches   : {fg_total:,}")
    print(f"  Cross-ref master     : {master_total:,}")
    print(f"{'═'*55}\n")


if __name__ == "__main__":
    main()
