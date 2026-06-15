#!/usr/bin/env python3
"""
build_donaldson_matrix.py
=========================
Builds cross-reference matrices from existing donaldson_*_results.json files.
No scraping needed — runs in seconds from local data.

Outputs (all in scripts/ directory):
  donaldson_competitor_matrix.json   — {elimfilters_sku: [{manufacturer, code}, ...]}
  donaldson_oem_matrix.json          — {elimfilters_sku: [{manufacturer, code}, ...]}
  donaldson_crossref_flat.csv        — flat CSV: sku | category | don_pn | brand | code | type
  donaldson_import_ready.jsonl       — one DB row per part, ready for /api/import/donaldson

Usage:
    python3 build_donaldson_matrix.py
    python3 build_donaldson_matrix.py --stats
    python3 build_donaldson_matrix.py --category lube
"""

import argparse
import csv
import json
import os
import re
import glob
import sys
from collections import defaultdict

SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))

CATEGORIES = [
    "lube", "air", "air-intake", "cabin",
    "fuel", "hydraulic", "coolant", "air-dryer",
]

# ── parsers (same as import_donaldson_v2.py) ──────────────────────────────────

def _parse_mm(text):
    if not text:
        return None
    m = re.search(r'\((\d+\.?\d*)\s*mm\)', str(text))
    if m:
        return float(m.group(1))
    m = re.search(r'(\d+\.?\d*)\s*mm', str(text))
    return float(m.group(1)) if m else None

def _parse_psi(text):
    if not text:
        return None
    m = re.search(r'(\d+\.?\d*)\s*psi', str(text))
    return float(m.group(1)) if m else None

def _parse_micron(text):
    if not text:
        return None
    m = re.search(r'(\d+\.?\d*)\s*micron', str(text), re.IGNORECASE)
    return float(m.group(1)) if m else None


# ── load all categories ────────────────────────────────────────────────────────

def load_all(category_filter=None):
    rows = []
    cats = [category_filter] if category_filter else CATEGORIES
    for cat in cats:
        fpath = os.path.join(SCRIPTS_DIR, f"donaldson_{cat}_results.json")
        if not os.path.exists(fpath):
            print(f"  [skip] {fpath} not found", file=sys.stderr)
            continue
        with open(fpath, encoding="utf-8") as f:
            data = json.load(f)
        for p in data:
            p["_category"] = cat
        rows.extend(data)
        print(f"  [{cat}] {len(data)} parts loaded")
    return rows


# ── map one product to DB-ready row ───────────────────────────────────────────

def map_to_db_row(p):
    attrs = p.get("attributes") or {}
    dims  = p.get("dimensions") or {}

    od_mm = None
    if dims.get("od", {}).get("mm"):
        try: od_mm = float(dims["od"]["mm"])
        except (ValueError, TypeError): pass
    if od_mm is None:
        od_mm = _parse_mm(attrs.get("Outer Diameter"))

    height_mm = None
    if dims.get("length", {}).get("mm"):
        try: height_mm = float(dims["length"]["mm"])
        except (ValueError, TypeError): pass
    if height_mm is None:
        height_mm = _parse_mm(attrs.get("Length"))

    thread      = dims.get("thread") or attrs.get("Thread Size") or None
    gasket_od   = _parse_mm(attrs.get("Gasket OD"))
    gasket_id   = _parse_mm(attrs.get("Gasket ID"))
    burst       = _parse_psi(attrs.get("Collapse Burst"))
    micron      = _parse_micron(attrs.get("Efficiency 99%") or attrs.get("Efficiency 50%") or "")
    iso_std     = attrs.get("Efficiency Test Std") or None
    nominal_eff = attrs.get("Efficiency 99%") or attrs.get("Beta Ratio") or None
    install     = attrs.get("Style") or None
    media_type  = attrs.get("Media Type") or None

    oem_raw = p.get("oem_codes") or []
    oem_codes = [{"manufacturer": o["manufacturer"], "code": o["part_number"]}
                 for o in oem_raw if o.get("manufacturer") and o.get("part_number")]

    brand_crossrefs = p.get("brand_crossrefs") or {}
    competitor_codes = []
    for brand, codes in brand_crossrefs.items():
        for code in (codes or []):
            competitor_codes.append({"manufacturer": brand, "code": code})

    return {
        "sku":                   p.get("sku_elimfilters"),
        "codigo_base":           p.get("part_number"),
        "description":           p.get("description_elimfilters"),
        "filter_type":           p.get("category") or p.get("_category"),
        "sub_type":              media_type,
        "technology":            p.get("technology"),
        "installation_type":     install,
        "thread_size":           thread,
        "outer_diameter_mm":     od_mm,
        "height_mm":             height_mm,
        "gasket_od_mm":          gasket_od,
        "gasket_id_mm":          gasket_id,
        "iso_test_method":       iso_std,
        "micron_rating":         micron,
        "nominal_efficiency":    nominal_eff,
        "burst_pressure_psi":    burst,
        "collapse_pressure_psi": None,
        "duty":                  "HEAVY_DUTY",
        "oem_codes":             oem_codes,
        "competitor_codes":      competitor_codes,
        "brand_crossrefs":       brand_crossrefs,
        "alternatives":          p.get("alternatives") or [],
        "equipment_applications": p.get("equipment") or [],
    }


# ── build matrices ─────────────────────────────────────────────────────────────

def build_competitor_matrix(products):
    """
    {elimfilters_sku: [{manufacturer, code}, ...]}
    Includes Donaldson itself + brand_crossrefs.
    """
    matrix = {}
    for p in products:
        sku = p.get("sku_elimfilters")
        if not sku:
            continue
        entries = []
        don_pn = p.get("part_number")
        if don_pn:
            entries.append({"manufacturer": "DONALDSON", "code": don_pn})
        for alt in (p.get("alternatives") or []):
            entries.append({"manufacturer": "DONALDSON", "code": alt})
        for brand, codes in (p.get("brand_crossrefs") or {}).items():
            for code in (codes or []):
                entries.append({"manufacturer": brand, "code": code})
        if entries:
            if sku not in matrix:
                matrix[sku] = []
            matrix[sku].extend(entries)
    return matrix


def build_oem_matrix(products):
    """
    {elimfilters_sku: [{manufacturer, code}, ...]}
    OEM codes only.
    """
    matrix = {}
    for p in products:
        sku = p.get("sku_elimfilters")
        if not sku:
            continue
        oem_raw = p.get("oem_codes") or []
        entries = [{"manufacturer": o["manufacturer"], "code": o["part_number"]}
                   for o in oem_raw if o.get("manufacturer") and o.get("part_number")]
        if entries:
            matrix[sku] = entries
    return matrix


def build_flat_csv(products):
    """
    Flat rows: sku | category | don_pn | brand | code | code_type
    Includes: donaldson alt codes, brand crossrefs, OEM codes.
    """
    rows = []
    for p in products:
        sku = p.get("sku_elimfilters") or ""
        cat = p.get("category") or p.get("_category") or ""
        don = p.get("part_number") or ""

        # Donaldson alternatives
        for alt in (p.get("alternatives") or []):
            rows.append({"sku": sku, "category": cat, "don_pn": don,
                         "brand": "DONALDSON", "code": alt, "code_type": "ALTERNATIVE"})

        # Brand cross-references
        for brand, codes in (p.get("brand_crossrefs") or {}).items():
            for code in (codes or []):
                rows.append({"sku": sku, "category": cat, "don_pn": don,
                             "brand": brand, "code": code, "code_type": "CROSSREF"})

        # OEM codes
        for o in (p.get("oem_codes") or []):
            if o.get("manufacturer") and o.get("part_number"):
                rows.append({"sku": sku, "category": cat, "don_pn": don,
                             "brand": o["manufacturer"], "code": o["part_number"],
                             "code_type": "OEM"})
    return rows


# ── write outputs ──────────────────────────────────────────────────────────────

def write_json(data, filename):
    path = os.path.join(SCRIPTS_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    print(f"  ✓ {filename} ({os.path.getsize(path):,} bytes)")
    return path


def write_jsonl(rows, filename):
    path = os.path.join(SCRIPTS_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        for row in rows:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")
    print(f"  ✓ {filename} ({len(rows):,} rows, {os.path.getsize(path):,} bytes)")
    return path


def write_csv(rows, filename):
    path = os.path.join(SCRIPTS_DIR, filename)
    if not rows:
        print(f"  ! {filename} — no rows to write")
        return path
    with open(path, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    print(f"  ✓ {filename} ({len(rows):,} rows, {os.path.getsize(path):,} bytes)")
    return path


# ── stats ──────────────────────────────────────────────────────────────────────

def print_stats(products, comp_matrix, oem_matrix, flat_rows):
    total = len(products)
    with_sku   = sum(1 for p in products if p.get("sku_elimfilters"))
    with_bc    = sum(1 for p in products if p.get("brand_crossrefs"))
    with_oem   = sum(1 for p in products if p.get("oem_codes"))
    with_equip = sum(1 for p in products if p.get("equipment"))
    with_desc  = sum(1 for p in products if p.get("description_elimfilters"))

    total_comp = sum(len(v) for v in comp_matrix.values())
    total_oem  = sum(len(v) for v in oem_matrix.values())

    crossref_rows = [r for r in flat_rows if r["code_type"] == "CROSSREF"]
    oem_rows      = [r for r in flat_rows if r["code_type"] == "OEM"]
    alt_rows      = [r for r in flat_rows if r["code_type"] == "ALTERNATIVE"]

    brands = set(r["brand"] for r in flat_rows)

    print(f"\n── DONALDSON MATRIX STATS ──")
    print(f"  Total parts        : {total:,}")
    print(f"  With ELIM SKU      : {with_sku:,}")
    print(f"  With description   : {with_desc:,}")
    print(f"  With brand crossref: {with_bc:,}")
    print(f"  With OEM codes     : {with_oem:,}")
    print(f"  With equipment     : {with_equip:,}")
    print(f"\n  Competitor matrix  : {len(comp_matrix):,} SKUs → {total_comp:,} codes")
    print(f"  OEM matrix         : {len(oem_matrix):,} SKUs → {total_oem:,} codes")
    print(f"\n  Flat CSV breakdown :")
    print(f"    CROSSREF rows    : {len(crossref_rows):,}")
    print(f"    OEM rows         : {len(oem_rows):,}")
    print(f"    ALTERNATIVE rows : {len(alt_rows):,}")
    print(f"    Unique brands    : {len(brands):,}")

    # Top brands by crossref count
    brand_counts = defaultdict(int)
    for r in crossref_rows:
        brand_counts[r["brand"]] += 1
    top = sorted(brand_counts.items(), key=lambda x: -x[1])[:10]
    if top:
        print(f"\n  Top crossref brands:")
        for brand, count in top:
            print(f"    {brand:<25} {count:,}")


# ── main ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--stats",    action="store_true", help="Print stats only")
    parser.add_argument("--category", default=None, help="Single category (e.g. lube)")
    args = parser.parse_args()

    print("\nLoading Donaldson results files...")
    products = load_all(args.category)
    print(f"Total: {len(products):,} parts\n")

    if not products:
        print("No data found. Run scraper_donaldson.py first.", file=sys.stderr)
        sys.exit(1)

    print("Building matrices...")
    comp_matrix = build_competitor_matrix(products)
    oem_matrix  = build_oem_matrix(products)
    flat_rows   = build_flat_csv(products)

    print("\nBuilding DB import rows...")
    db_rows = []
    for p in products:
        row = map_to_db_row(p)
        if row["sku"] and row["codigo_base"]:
            db_rows.append(row)
    print(f"  {len(db_rows):,} valid import rows")

    if args.stats:
        print_stats(products, comp_matrix, oem_matrix, flat_rows)
        return

    print("\nWriting outputs...")
    write_json(comp_matrix, "donaldson_competitor_matrix.json")
    write_json(oem_matrix,  "donaldson_oem_matrix.json")
    write_csv(flat_rows,    "donaldson_crossref_flat.csv")
    write_jsonl(db_rows,    "donaldson_import_ready.jsonl")

    print_stats(products, comp_matrix, oem_matrix, flat_rows)
    print(f"\nDone. Use donaldson_import_ready.jsonl to import to DB (no scraping needed).")


if __name__ == "__main__":
    main()
