"""
import_donaldson.py — ELIMFILTERS Donaldson Catalog Importer
Reads scraped JSON files and sends them to the Render API for DB insertion.

Usage:
    python3 import_donaldson.py [--dry-run] [--category lube|fuel|air|...]

SKU rules (confirmed):
    EL8 — Lube/Oil
    EF9 — Fuel (primary/secondary/generic)
    ES9 — Fuel Water Separator
    ET9 — Fuel Turbine FH / Coalescing
    EA1 — Air Filter
    EA2 — Air Filter Housing
    EH6 — Hydraulic
    EW7 — Coolant/Water
    EC1 — Cabin/AC
    ED4 — Air Dryer
    EK5 — Kit HD
    EK3 — Kit LD

    Format: prefix + last 4 digits, NO dashes/spaces (e.g., EF90047)
    Alternatives (alternative_products field): rotate 4 digits left to avoid collision
"""

import json
import os
import re
import sys
import argparse
import urllib.request
import urllib.error

# ─── Config ──────────────────────────────────────────────────────────────────

API_BASE  = "https://world-catalogue.onrender.com"
API_KEY   = "elim2026"
BATCH_SIZE = 50  # rows per POST request

# Data dir: script dir by default, override with DATA_DIR env var
DATA_DIR = os.environ.get("DATA_DIR", os.path.dirname(os.path.abspath(__file__)))

# Technology assigned per prefix
TECH_MAP = {
    "EL8": "SYNTRAX™",
    "EF9": "SYNTEPORE™",
    "ES9": "HYDROCORE™",
    "ET9": "TURBOCORE™",
    "EA1": "MACROCORE™",
    "EA2": "INTEKCORE™",
    "EH6": "NANOFORCE™",
    "EW7": "THERMACORE™",
    "EC1": "MICROKAPPA™",
    "ED4": "DRYCORE™",
}

# (json_filename, filter_type, default_prefix, category_key)
CATEGORIES = [
    ("lube_filters_results.json",        "Lube Filter",          "EL8", "lube"),
    ("fuel_filters_results.json",        "Fuel Filter",          "EF9", "fuel"),
    ("air_filters_results.json",         "Air Filter",           "EA1", "air"),
    ("air_filter_housings_results.json", "Air Filter Housing",   "EA2", "air_housing"),
    ("hydraulic_filters_results.json",   "Hydraulic Filter",     "EH6", "hydraulic"),
    ("coolant_filters_results.json",     "Coolant Filter",       "EW7", "coolant"),
    ("cabin_filters_results.json",       "Cabin Filter",         "EC1", "cabin"),
    ("air_dryer_results.json",           "Air Dryer",            "ED4", "air_dryer"),
]

# ─── SKU generation ──────────────────────────────────────────────────────────

def last4_digits(code: str) -> str:
    digits = re.sub(r"[^0-9]", "", code)
    return digits[-4:] if len(digits) >= 4 else digits.zfill(4)

def rotate_left(s: str) -> str:
    return s[1:] + s[0]

def make_sku(prefix: str, code: str, used: set) -> str:
    d = last4_digits(code)
    candidate = prefix + d
    for _ in range(9):
        if candidate not in used:
            return candidate
        d = rotate_left(d)
        candidate = prefix + d
    # Last resort: sequential fallback
    for i in range(1000, 9999):
        candidate = prefix + str(i)
        if candidate not in used:
            return candidate
    raise ValueError(f"No unique SKU for {prefix}/{code}")

# ─── Fuel classification ─────────────────────────────────────────────────────

def classify_fuel(product: dict) -> tuple:
    """Returns (prefix, sub_type)."""
    attrs  = product.get("attributes", {})
    code   = product.get("base_code", "").upper()
    type_v = (attrs.get("Type", "") + " " + attrs.get("Product Type", "")).upper()
    style  = attrs.get("Style", "").upper()

    # Water Separator → ES9 (includes "Coalescing Fuel Water Separator")
    if ("WATER SEP" in type_v or "SEPARATOR" in type_v or
            "FUEL/WATER" in type_v or "COALESC" in type_v):
        inst = attrs.get("Style", "").upper()
        sub = "Fuel Filter - Water Separator"
        if "SPIN-ON" in inst or "SPIN ON" in inst:
            sub += " Spin-On"
        elif "CARTRIDGE" in inst:
            sub += " Cartridge"
        return "ES9", sub

    # Generic fuel → EF9 (ET9 = RACOR FH turbines, separate catalog)
    sub = "Fuel Filter"
    if "PRIMARY" in type_v:
        sub = "Fuel Filter - Primary"
    elif "SECONDARY" in type_v:
        sub = "Fuel Filter - Secondary"
    if "SPIN-ON" in style or "SPIN ON" in style:
        sub += " Spin-On"
    elif "CARTRIDGE" in style:
        sub += " Cartridge"
    elif "IN-LINE" in style or "INLINE" in style:
        sub += " In-Line"
    elif "SOCK" in type_v:
        sub += " Sock"
    return "EF9", sub

# ─── Attribute parsing ───────────────────────────────────────────────────────

def extract_mm(val) -> float:
    if not val:
        return None
    s = str(val)
    m = re.search(r"([\d.]+)\s*mm", s, re.IGNORECASE)
    if m:
        try:
            return float(m.group(1))
        except ValueError:
            pass
    m = re.search(r"^\s*([\d.]+)\s*$", s)
    if m:
        try:
            return float(m.group(1))
        except ValueError:
            pass
    return None

def extract_psi(val) -> float:
    if not val:
        return None
    s = str(val)
    m = re.search(r"([\d.]+)\s*(?:psi|PSI)", s)
    if m:
        try:
            return float(m.group(1))
        except ValueError:
            pass
    m = re.search(r"([\d.]+)\s*kPa", s, re.IGNORECASE)
    if m:
        try:
            return round(float(m.group(1)) * 0.145038, 1)
        except ValueError:
            pass
    return None

def parse_attrs(product: dict) -> dict:
    attrs = product.get("attributes", {})
    od_raw  = attrs.get("Outer Diameter") or product.get("od")
    len_raw = attrs.get("Length")         or product.get("len")
    return {
        "installation_type":     attrs.get("Style") or attrs.get("Installation Type"),
        "thread_size":           attrs.get("Thread Size") or product.get("thread"),
        "outer_diameter_mm":     extract_mm(od_raw),
        "height_mm":             extract_mm(len_raw),
        "gasket_od_mm":          extract_mm(attrs.get("Gasket OD")),
        "gasket_id_mm":          extract_mm(attrs.get("Gasket ID")),
        "iso_test_method":       attrs.get("ISO Test Standard") or attrs.get("ISO Standard"),
        "micron_rating":         attrs.get("Micron Rating") or attrs.get("Micron"),
        "nominal_efficiency":    attrs.get("Efficiency") or attrs.get("Nominal Efficiency"),
        "burst_pressure_psi":    extract_psi(attrs.get("Burst Pressure") or attrs.get("Burst Pressure (psi)")),
        "collapse_pressure_psi": extract_psi(attrs.get("Collapse Pressure") or attrs.get("Collapse Pressure (psi)")),
        "duty":                  attrs.get("Duty") or "HEAVY_DUTY",
    }

def parse_cross_ref(product: dict) -> list:
    return [
        {"manufacturer": c.get("manufacturer", ""), "code": c.get("part_number", "")}
        for c in product.get("cross_reference", [])
        if c.get("manufacturer") and c.get("part_number")
    ]

def parse_equipment(product: dict) -> list:
    return [
        {
            "machine": e.get("equipment") or e.get("machine", ""),
            "year":    e.get("year") or "",
            "type":    e.get("type") or "",
            "engine":  e.get("engine") or "",
        }
        for e in product.get("equipment", [])
    ]

# ─── API helpers ─────────────────────────────────────────────────────────────

def api_get_existing_skus() -> set:
    url = f"{API_BASE}/api/import/existing-skus?key={API_KEY}"
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read())
    return set(data.get("skus", []))

def api_post_batch(rows: list) -> dict:
    url  = f"{API_BASE}/api/import/donaldson"
    body = json.dumps({"key": API_KEY, "rows": rows}).encode("utf-8")
    req  = urllib.request.Request(url, data=body,
                                   headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read())

# ─── Build rows ───────────────────────────────────────────────────────────────

def build_rows(products: list, filter_type: str, prefix: str, is_fuel: bool,
               used_skus: set) -> list:
    rows = []
    for product in products:
        if "error" in product and not product.get("attributes"):
            continue
        base_code = product.get("base_code", "").strip().upper()
        if not base_code or base_code.upper().startswith("DESCONOCIDO"):
            continue

        ft, sub, pfx = filter_type, None, prefix
        if is_fuel:
            pfx, sub = classify_fuel(product)
            ft = "Fuel Filter"

        sku  = make_sku(pfx, base_code, used_skus)
        used_skus.add(sku)
        tech = TECH_MAP.get(pfx)

        dims   = parse_attrs(product)
        comp_c = parse_cross_ref(product)
        equip  = parse_equipment(product)

        rows.append({
            "sku":                    sku,
            "codigo_base":            base_code,
            "filter_type":            ft,
            "sub_type":               sub,
            "technology":             tech,
            **dims,
            "oem_codes":              [],
            "competitor_codes":       comp_c,
            "equipment_applications": equip,
        })

        # Alternative products (same body, different media)
        for alt in product.get("alternative_products", []):
            alt_code = (alt.get("code") or "").strip().upper()
            if not alt_code:
                continue
            alt_sku = make_sku(pfx, alt_code, used_skus)
            used_skus.add(alt_sku)
            rows.append({
                "sku":                    alt_sku,
                "codigo_base":            alt_code,
                "filter_type":            ft,
                "sub_type":               sub,
                "technology":             tech,
                **dims,
                "oem_codes":              [],
                "competitor_codes":       comp_c,
                "equipment_applications": equip,
            })

    return rows

# ─── Main ────────────────────────────────────────────────────────────────────

def run_import(category_filter, dry_run: bool):
    if dry_run:
        used_skus = set()
        print("DRY RUN — no API calls\n")
    else:
        print("Fetching existing SKUs from API…")
        used_skus = api_get_existing_skus()
        print(f"  {len(used_skus)} SKUs already in DB\n")

    total_rows = 0
    total_sent = 0
    total_err  = 0

    for filename, filter_type, prefix, cat_key in CATEGORIES:
        if category_filter and cat_key != category_filter:
            continue

        filepath = os.path.join(DATA_DIR, filename)
        if not os.path.exists(filepath):
            print(f"⚠️  {filename} not found — skipping {cat_key}")
            continue

        with open(filepath, "r", encoding="utf-8") as f:
            products = json.load(f)
        ok = [p for p in products if not ("error" in p and not p.get("attributes"))]
        print(f"📄 {filename}: {len(ok)}/{len(products)} valid")

        is_fuel = (cat_key == "fuel")
        rows = build_rows(ok, filter_type, prefix, is_fuel, used_skus)
        total_rows += len(rows)
        print(f"   → {len(rows)} rows (incl. alternatives)")

        if dry_run:
            for r in rows[:3]:
                print(f"   {r['sku']} | {r['codigo_base']} | {r.get('sub_type') or r['filter_type']}")
                print(f"     OD={r['outer_diameter_mm']}mm H={r['height_mm']}mm T={r['thread_size']}")
                print(f"     cross={len(r['competitor_codes'])} equip={len(r['equipment_applications'])}")
            if len(rows) > 3:
                print(f"   … and {len(rows)-3} more")
            continue

        # Send in batches
        for i in range(0, len(rows), BATCH_SIZE):
            batch = rows[i:i + BATCH_SIZE]
            try:
                result = api_post_batch(batch)
                total_sent += result.get("total", 0)
                if result.get("errors", 0):
                    total_err += result["errors"]
                print(f"   batch {i//BATCH_SIZE+1}: +{result.get('inserted',0)} ins "
                      f"{result.get('updated',0)} upd {result.get('errors',0)} err")
            except Exception as e:
                print(f"   ❌ batch {i//BATCH_SIZE+1} failed: {e}")
                total_err += len(batch)

    print(f"\n{'='*60}")
    if dry_run:
        print(f"DRY RUN — would send {total_rows} rows")
    else:
        print(f"✅ IMPORT COMPLETE — sent {total_sent} | errors {total_err}")

# ─── CLI ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Import Donaldson data into ELIMFILTERS catalog via API")
    parser.add_argument("--dry-run", action="store_true",
                        help="Show parsed output without sending to API")
    parser.add_argument("--category", default=None,
                        choices=["lube","fuel","air","air_housing","hydraulic","coolant","cabin","air_dryer"],
                        help="Import only this category")
    args = parser.parse_args()

    run_import(category_filter=args.category, dry_run=args.dry_run)
