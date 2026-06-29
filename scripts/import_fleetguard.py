"""
import_fleetguard.py — Import all fleetguard_*_results.json into elimfilters_catalog

Usage:
    python3 import_fleetguard.py [--dry-run] [--category lube-cartridge]

Steps:
    1. Read all fleetguard_*_results.json (or single category)
    2. Map fields to DB schema
    3. POST batches of 20 to /api/import/donaldson (same endpoint, same schema)
    4. Print summary

Requires: requests (pip3 install requests)
"""

import argparse
import json
import os
import re
import sys
import glob
import time
import logging

import requests

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

API_URL  = "https://elimfilters-search-pro.onrender.com/api/import/donaldson"
API_KEY  = "elim2026"
BATCH    = 20

# Brands that are filter competitors (not OEM equipment makers)
COMPETITOR_BRANDS = {
    "DONALDSON", "BALDWIN", "MANN", "WIX", "PUROLATOR", "FRAM", "NAPA",
    "HASTINGS", "LUBER-FINER", "FLEETGUARD", "CUMMINS FILTRATION",
    "BOSCH", "MAHLE", "HENGST", "FILTREC", "HYDAC", "PALL", "PARKER",
    "AC DELCO", "ACDELCO", "MOTORCRAFT", "CHAMPION", "K&N", "RACOR",
    "FACET", "TRIPAC", "ALLIANCE", "PREMIUM GUARD", "INTERFIL",
}

BASE_DIR = os.environ.get(
    "FG_DIR",
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "Fleetguard Scraper")
)

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from catalog_common import make_sku, normalize_part, elim_prefix_from_fleetguard, TECH_MAP, TYPE_MAP


def parse_mm(text):
    if not text:
        return None
    m = re.search(r'\((\d+\.?\d*)\s*mm\)', str(text))
    if m:
        return float(m.group(1))
    m = re.search(r'(\d+\.?\d*)\s*mm', str(text), re.IGNORECASE)
    if m:
        return float(m.group(1))
    m = re.search(r'(\d+\.?\d*)\s*in', str(text), re.IGNORECASE)
    if m:
        return round(float(m.group(1)) * 25.4, 2)
    return None


def parse_float(text):
    if not text:
        return None
    m = re.search(r'(\d+\.?\d*)', str(text))
    return float(m.group(1)) if m else None


def attr_get(attrs, *keys):
    """Case-insensitive attribute lookup."""
    if not attrs:
        return None
    attrs_upper = {k.upper(): v for k, v in attrs.items()}
    for key in keys:
        v = attrs_upper.get(key.upper())
        if v:
            return str(v)
    return None


def split_crossrefs(cross_references):
    """
    Split FG cross_references [{brand, part_number}] into oem_codes and competitor_codes.
    Returns (oem_codes, competitor_codes) as lists of {brand/manufacturer, part_number}.
    """
    oem_codes = []
    competitor_codes = []
    seen = set()

    for ref in (cross_references or []):
        brand = (ref.get("brand") or ref.get("manufacturer") or "").strip()
        pn = normalize_part(ref.get("part_number") or "")
        if not brand or not pn:
            continue
        key = f"{brand.upper()}|{pn}"
        if key in seen:
            continue
        seen.add(key)

        if brand.upper() in COMPETITOR_BRANDS or any(cb in brand.upper() for cb in COMPETITOR_BRANDS):
            competitor_codes.append({"brand": brand, "part_number": pn})
        else:
            oem_codes.append({"manufacturer": brand, "part_number": pn})

    return oem_codes, competitor_codes


def flatten_alternatives(alternatives):
    """Handle both flat list ['P553000'] and grouped [{label, parts:[...]}] formats."""
    if not alternatives:
        return []
    flat = []
    for a in alternatives:
        if isinstance(a, str):
            pn = normalize_part(a)
            if pn:
                flat.append(pn)
        elif isinstance(a, dict):
            for p in a.get("parts", []):
                pn = normalize_part(p)
                if pn:
                    flat.append(pn)
    return list(dict.fromkeys(flat))  # deduplicate preserving order


def map_product(prod, category, used_skus):
    """Map Fleetguard scraped product → DB row dict."""
    code = normalize_part(prod.get("part_number") or "")
    if not code or prod.get("error"):
        return None

    attrs = prod.get("attributes") or {}

    # Generate SKU
    prefix = elim_prefix_from_fleetguard(code, category)
    sku = make_sku(prefix, code, used_skus)

    # Dimensions
    od_mm     = parse_mm(attr_get(attrs, "LARGEST OD", "OD", "Outer Diameter", "DIÁMETRO EXTERIOR"))
    height_mm = parse_mm(attr_get(attrs, "HEIGHT", "LENGTH", "ALTURA", "LONGITUD", "LONGITUD TOTAL"))
    gasket_od = parse_mm(attr_get(attrs, "GASKET OD", "GASKET", "Gasket OD"))
    gasket_id = parse_mm(attr_get(attrs, "GASKET ID", "Gasket ID"))
    thread    = attr_get(attrs, "THREAD SIZE", "TAMAÑO DE ROSCA", "Thread Size")

    # Performance
    micron_raw = attr_get(attrs, "MICRON", "EFFICIENCY", "FULL LIFE EFFICIENCY", "Efficiency Alpha 1000")
    micron = None
    if micron_raw:
        m = re.search(r'(\d+\.?\d*)\s*micron', micron_raw, re.IGNORECASE)
        if m:
            micron = float(m.group(1))

    efficiency = attr_get(attrs, "FULL LIFE EFFICIENCY", "EFFICIENCY", "NOMINAL EFFICIENCY")
    iso_test   = attr_get(attrs, "EFFICIENCY TEST STD", "TEST STANDARD", "EFFICIENCY TEST STANDARD")
    bypass_psi = parse_float(attr_get(attrs, "BYPASS VALVE", "PRESSURE VALVE"))
    burst_psi  = parse_float(attr_get(attrs, "MIN BURST PRESSURE", "HYDROSTATIC BURST", "RUPTURA HIDROSTÁTICA MÍNIMA"))

    # Style / installation type
    style = attr_get(attrs, "Style", "STYLE", "Installation", "TYPE")

    # Cross-references
    oem_codes, competitor_codes = split_crossrefs(prod.get("cross_references", []))

    # Alternatives
    alts = flatten_alternatives(prod.get("alternatives", []))

    # Equipment
    equip_apps = []
    for eq in (prod.get("equipment") or []):
        if isinstance(eq, dict):
            entry = {}
            for k in ("make", "model", "engine", "equipment", "year"):
                if eq.get(k):
                    entry[k] = eq[k]
            if entry:
                equip_apps.append(entry)

    # Description
    name = prod.get("name", "")
    description = f"ELIMFILTERS {TECH_MAP.get(prefix, '')} {TYPE_MAP.get(prefix, 'Filter')}"
    if name and name.upper() != code:
        description += f" — {name}"

    return {
        "sku":                  sku,
        "codigo_base":          code,
        "description":          description,
        "filter_type":          TYPE_MAP.get(prefix, "Filter"),
        "sub_type":             f"Fleetguard {category}",
        "technology":           TECH_MAP.get(prefix, ""),
        "installation_type":    style,
        "thread_size":          thread,
        "outer_diameter_mm":    od_mm,
        "height_mm":            height_mm,
        "gasket_od_mm":         gasket_od,
        "gasket_id_mm":         gasket_id,
        "iso_test_method":      iso_test,
        "micron_rating":        micron,
        "nominal_efficiency":   efficiency,
        "burst_pressure_psi":   burst_psi,
        "collapse_pressure_psi": bypass_psi,
        "duty":                 "HEAVY_DUTY",
        "oem_codes":            oem_codes,
        "competitor_codes":     competitor_codes,
        "brand_crossrefs":      {},
        "alternatives":         alts,
        "equipment_applications": equip_apps,
    }


def post_batch(rows, dry_run=False):
    if dry_run:
        logging.info(f"  [DRY-RUN] {len(rows)} rows")
        return {"inserted": 0, "updated": 0, "errors": 0}
    resp = requests.post(API_URL, json={"key": API_KEY, "rows": rows}, timeout=60)
    resp.raise_for_status()
    return resp.json()


def run(category_filter=None, dry_run=False):
    pattern = os.path.join(BASE_DIR, "fleetguard_*_results.json")
    files = sorted(glob.glob(pattern))
    if not files:
        logging.error(f"No fleetguard_*_results.json found in {BASE_DIR}")
        sys.exit(1)

    if category_filter:
        files = [f for f in files if category_filter in os.path.basename(f)]
        if not files:
            logging.error(f"No files matched category: {category_filter}")
            sys.exit(1)

    used_skus = set()
    seen_codes = set()
    total_inserted = total_updated = total_errors = total_skipped = 0

    for fpath in files:
        category = os.path.basename(fpath).replace("fleetguard_", "").replace("_results.json", "")
        with open(fpath, encoding="utf-8") as f:
            data = json.load(f)
        if isinstance(data, dict) and "results" in data:
            data = data["results"]

        logging.info(f"\n→ {category} ({len(data)} products)")
        batch = []
        cat_inserted = cat_updated = cat_errors = cat_skipped = 0

        for prod in data:
            code = normalize_part(prod.get("part_number") or "")
            if not code or code in seen_codes or prod.get("error"):
                cat_skipped += 1
                continue
            seen_codes.add(code)

            row = map_product(prod, category, used_skus)
            if not row:
                cat_skipped += 1
                continue
            batch.append(row)

            if len(batch) >= BATCH:
                result = post_batch(batch, dry_run)
                cat_inserted += result.get("inserted", 0)
                cat_updated  += result.get("updated", 0)
                cat_errors   += result.get("errors", 0)
                batch = []
                time.sleep(0.3)

        if batch:
            result = post_batch(batch, dry_run)
            cat_inserted += result.get("inserted", 0)
            cat_updated  += result.get("updated", 0)
            cat_errors   += result.get("errors", 0)

        logging.info(f"  ✅ {category}: +{cat_inserted} new | ~{cat_updated} updated | ✗{cat_errors} err | skip {cat_skipped}")
        total_inserted += cat_inserted
        total_updated  += cat_updated
        total_errors   += cat_errors
        total_skipped  += cat_skipped

    print(f"\n{'='*50}")
    print(f"IMPORT FLEETGUARD COMPLETO")
    print(f"  Insertados: {total_inserted}")
    print(f"  Actualizados: {total_updated}")
    print(f"  Errores: {total_errors}")
    print(f"  Saltados: {total_skipped}")
    print(f"{'='*50}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Import Fleetguard JSONs → elimfilters_catalog DB")
    parser.add_argument("--dry-run", action="store_true", help="Parse only, no API calls")
    parser.add_argument("--category", help="Single category (e.g. lube-cartridge)")
    args = parser.parse_args()
    run(category_filter=args.category, dry_run=args.dry_run)
