"""
import_turbines_et9.py — Importa turbinas RACOR FH series al catálogo ELIMFILTERS
Lee turbines_et9.json y sube via API a elimfilters_catalog con prefijo ET9.

Uso:
    python import_turbines_et9.py [--dry-run]
"""

import json, os, sys, argparse, urllib.request

API_BASE = "https://world-catalogue-production.up.railway.app"
API_KEY  = "elim2026"
DATA_DIR = os.environ.get("DATA_DIR", os.path.dirname(os.path.abspath(__file__)))

def api_post_batch(rows):
    url  = f"{API_BASE}/api/import/donaldson"
    body = json.dumps({"key": API_KEY, "rows": rows}).encode("utf-8")
    req  = urllib.request.Request(url, data=body,
                                   headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read())

def run(dry_run):
    path = os.path.join(DATA_DIR, "turbines_et9.json")
    with open(path, encoding="utf-8") as f:
        turbines = json.load(f)

    rows = []
    for t in turbines:
        row = {
            "sku":                    t["sku"],
            "codigo_base":            t["codigo_base"],
            "filter_type":            "Fuel Filter",
            "sub_type":               "Fuel Filter - Coalescing",
            "technology":             "AQUAGUARD/SERIES™",
            "installation_type":      t.get("installation_type"),
            "thread_size":            t.get("thread_size"),
            "outer_diameter_mm":      t.get("outer_diameter_mm"),
            "height_mm":              t.get("height_mm"),
            "gasket_od_mm":           None,
            "gasket_id_mm":           None,
            "iso_test_method":        None,
            "micron_rating":          t.get("micron_rating"),
            "nominal_efficiency":     None,
            "burst_pressure_psi":     None,
            "collapse_pressure_psi":  None,
            "duty":                   "HEAVY_DUTY",
            "oem_codes":              [],
            "competitor_codes":       [],
            "equipment_applications": t.get("equipment_applications", []),
        }
        rows.append(row)

        if dry_run:
            print(f"  {row['sku']} | {row['codigo_base']} | "
                  f"OD={row['outer_diameter_mm']}mm H={row['height_mm']}mm "
                  f"T={row['thread_size']} | {row['micron_rating'] or 'micron=depende cartucho'}")

    if dry_run:
        print(f"\nDRY RUN — {len(rows)} turbinas, sin enviar a API")
        return

    result = api_post_batch(rows)
    print(f"✅ {result.get('total',0)} turbinas ET9 importadas "
          f"(+{result.get('inserted',0)} ins / {result.get('updated',0)} upd / "
          f"{result.get('errors',0)} err)")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    run(dry_run=args.dry_run)
