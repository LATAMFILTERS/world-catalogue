"""
import_donaldson_v2.py — Import all donaldson_*_results.json into elimfilters_catalog

Usage:
    python3 import_donaldson_v2.py [--dry-run] [--category lube]

Steps:
    1. Read all donaldson_*_results.json (or a single category)
    2. Map fields to DB schema
    3. POST batches of 50 to /api/import/donaldson
    4. Print summary

Requires: requests (pip3 install requests)
"""

import argparse
import json
import os
import re
import sys
import time
import logging

import requests

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

API_URL  = "https://elimfilters-search-pro.onrender.com/api/import/donaldson"
API_KEY  = "elim2026"
BATCH    = 50

CATEGORIES = ["lube", "hydraulic", "air", "air-intake", "cabin",
              "air-dryer", "fuel", "fuel-separator", "coolant", "diesel-kit"]


def parse_mm(text):
    """Extract first numeric value in millimetres from attribute strings like '118 mm' or '4.65 inch (118 mm)'."""
    if not text:
        return None
    m = re.search(r'\((\d+\.?\d*)\s*mm\)', str(text))
    if m:
        return float(m.group(1))
    m = re.search(r'(\d+\.?\d*)\s*mm', str(text))
    if m:
        return float(m.group(1))
    return None


def parse_psi(text):
    """Extract PSI value from '149 psi (10.3 bar)'."""
    if not text:
        return None
    m = re.search(r'(\d+\.?\d*)\s*psi', str(text))
    return float(m.group(1)) if m else None


def parse_micron(text):
    """Extract micron number from '15 micron'."""
    if not text:
        return None
    m = re.search(r'(\d+\.?\d*)\s*micron', str(text), re.IGNORECASE)
    return float(m.group(1)) if m else None


def map_product(p):
    """Map a product dict from JSON format to DB column format."""
    attrs  = p.get("attributes") or {}
    dims   = p.get("dimensions") or {}

    # Dimensions from structured dims object (prefer) or attributes
    od_mm     = None
    if dims.get("od", {}).get("mm"):
        try:
            od_mm = float(dims["od"]["mm"])
        except (ValueError, TypeError):
            pass
    if od_mm is None:
        od_mm = parse_mm(attrs.get("Outer Diameter"))

    height_mm = None
    if dims.get("length", {}).get("mm"):
        try:
            height_mm = float(dims["length"]["mm"])
        except (ValueError, TypeError):
            pass
    if height_mm is None:
        height_mm = parse_mm(attrs.get("Length"))

    thread = dims.get("thread") or attrs.get("Thread Size") or None

    gasket_od = parse_mm(attrs.get("Gasket OD"))
    gasket_id = parse_mm(attrs.get("Gasket ID"))

    burst = parse_psi(attrs.get("Collapse Burst"))
    micron = parse_micron(attrs.get("Efficiency 99%") or attrs.get("Efficiency 50%") or "")
    iso_std = attrs.get("Efficiency Test Std") or None
    nominal_eff = attrs.get("Efficiency 99%") or attrs.get("Beta Ratio") or None
    install = attrs.get("Style") or None
    media_type = attrs.get("Media Type") or None

    # OEM codes: [{manufacturer, part_number}] → [{manufacturer, code}]
    oem_raw = p.get("oem_codes") or []
    oem_codes = [{"manufacturer": o["manufacturer"], "code": o["part_number"]}
                 for o in oem_raw if o.get("manufacturer") and o.get("part_number")]

    # brand_crossrefs: {brand: [codes]} stored as-is
    brand_crossrefs = p.get("brand_crossrefs") or {}

    # competitor_codes: flattened from brand_crossrefs
    competitor_codes = []
    for brand, codes in brand_crossrefs.items():
        for code in (codes or []):
            competitor_codes.append({"manufacturer": brand, "code": code})

    return {
        "sku":                  p.get("sku_elimfilters"),
        "codigo_base":          p.get("part_number"),
        "description":          p.get("description_elimfilters"),
        "filter_type":          p.get("category"),
        "sub_type":             media_type,
        "technology":           p.get("technology"),
        "installation_type":    install,
        "thread_size":          thread,
        "outer_diameter_mm":    od_mm,
        "height_mm":            height_mm,
        "gasket_od_mm":         gasket_od,
        "gasket_id_mm":         gasket_id,
        "iso_test_method":      iso_std,
        "micron_rating":        micron,
        "nominal_efficiency":   nominal_eff,
        "burst_pressure_psi":   burst,
        "collapse_pressure_psi": None,
        "duty":                 "HEAVY_DUTY",
        "oem_codes":            oem_codes,
        "competitor_codes":     competitor_codes,
        "brand_crossrefs":      brand_crossrefs,
        "alternatives":         p.get("alternatives") or [],
        "equipment_applications": p.get("equipment") or [],
    }


def load_category(cat, scripts_dir):
    fname = os.path.join(scripts_dir, f"donaldson_{cat}_results.json")
    if not os.path.exists(fname):
        logging.warning(f"Not found: {fname}")
        return []
    with open(fname, encoding="utf-8") as f:
        return json.load(f)


def warmup(max_wait=90):
    """Wake up Render free-tier server. Retries until /api/status returns JSON or timeout."""
    STATUS = API_URL.replace("/api/import/donaldson", "/api/status")
    logging.info(f"Warming up server (may take up to {max_wait}s on free tier)...")
    deadline = time.time() + max_wait
    attempt = 0
    while time.time() < deadline:
        attempt += 1
        try:
            resp = requests.get(STATUS, timeout=15, verify=False)
            if resp.status_code == 200 and resp.text.strip().startswith("{"):
                data = resp.json()
                logging.info(f"Server ready: {data}")
                return True
            else:
                logging.warning(f"  [{attempt}] Not ready yet (status={resp.status_code}, body={resp.text[:80]!r}). Waiting 10s...")
        except Exception as e:
            logging.warning(f"  [{attempt}] Connection error: {e}. Waiting 10s...")
        time.sleep(10)
    logging.error("Server did not wake up in time.")
    return False


def post_batch(batch, dry_run=False):
    if dry_run:
        return {"success": True, "total": len(batch), "inserted": len(batch), "updated": 0, "errors": 0}
    payload = {"key": API_KEY, "rows": batch}
    for attempt in range(4):
        try:
            resp = requests.post(API_URL, json=payload, timeout=60, verify=False)
            if not resp.text:
                raise ValueError("Empty response from server")
            return resp.json()
        except Exception as e:
            wait = 2 ** attempt
            logging.warning(f"Attempt {attempt+1} failed: {e}. Retrying in {wait}s...")
            time.sleep(wait)
    return {"success": False, "error": "All retries failed", "errors": len(batch)}


def load_file(filepath):
    """Load any *_results.json by full path."""
    if not os.path.exists(filepath):
        logging.warning(f"Not found: {filepath}")
        return []
    with open(filepath, encoding="utf-8") as f:
        return json.load(f)


def run(categories, dry_run, extra_files=None):
    scripts_dir = os.path.dirname(os.path.abspath(__file__))
    all_rows = []
    for cat in categories:
        products = load_category(cat, scripts_dir)
        mapped = [map_product(p) for p in products]
        valid  = [r for r in mapped if r["sku"] and r["codigo_base"]]
        logging.info(f"[{cat}] {len(products)} products → {len(valid)} valid rows")
        all_rows.extend(valid)
    for fpath in (extra_files or []):
        products = load_file(fpath)
        mapped = [map_product(p) for p in products]
        valid  = [r for r in mapped if r["sku"] and r["codigo_base"]]
        label = os.path.basename(fpath)
        logging.info(f"[{label}] {len(products)} products → {len(valid)} valid rows")
        all_rows.extend(valid)

    logging.info(f"Total rows to import: {len(all_rows)}")
    if dry_run:
        logging.info("DRY RUN — no API calls")
    else:
        if not warmup():
            sys.exit(1)

    total_inserted = total_updated = total_errors = 0
    for i in range(0, len(all_rows), BATCH):
        batch = all_rows[i:i + BATCH]
        result = post_batch(batch, dry_run)
        inserted = result.get("inserted", 0)
        updated  = result.get("updated", 0)
        errors   = result.get("errors", 0)
        total_inserted += inserted
        total_updated  += updated
        total_errors   += errors
        pct = (i + len(batch)) / len(all_rows) * 100
        logging.info(f"  Batch {i//BATCH+1}: {inserted} new | {updated} updated | {errors} err — {pct:.0f}%")

    logging.info(f"DONE: {total_inserted} inserted | {total_updated} updated | {total_errors} errors")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Parse only, no API calls")
    parser.add_argument("--category", help="Single Donaldson category (e.g. lube)")
    parser.add_argument("--file", action="append", dest="files", help="Extra results JSON file (e.g. parker_turbine_results.json). Repeatable.")
    parser.add_argument("--parker", action="store_true", help="Also import parker_turbine_results.json")
    args = parser.parse_args()

    cats = [args.category] if args.category else CATEGORIES
    scripts_dir = os.path.dirname(os.path.abspath(__file__))
    extra = list(args.files or [])
    if args.parker:
        extra.append(os.path.join(scripts_dir, "parker_turbine_results.json"))
    run(cats, args.dry_run, extra_files=extra)
