#!/usr/bin/env python3
"""
import_fleetguard_hd.py — Import Fleetguard HD products into elimfilters_catalog

Reads the output of scraper_fleetguard_CORREGIDO.py (fleetguard_*_results.json or
fleetguard_*_progress.json) and POSTs batches to /api/import/fleetguard.

SKU generation rules (enforced server-side):
  Air Filter      → EA1 + last 4 digits  (e.g. AF25551 → EA15551, AF26412 → EA16412)
  Lube/Oil Filter → EL8 + last 4 digits  (e.g. LF3706  → EL83706)
  Fuel Filter     → EF9 + last 4 digits  (e.g. FS1000  → EF91000)
  Hydraulic       → EH6 + last 4 digits  (e.g. HF35308 → EH65308)
  duty = HEAVY_DUTY for all records.

Fleetguard part number → SKU mapping:
  1. Strip the letter prefix (AF, LF, FS, HF, etc.)
  2. Take the LAST 4 digits as codigo_base (same rule as LD)
  3. Prepend the 3-char type prefix

Usage:
    python import_fleetguard_hd.py --file "E:\\scripts\\Fleetguard Scraper\\fleetguard_air-primary-secondary_results.json"
    python import_fleetguard_hd.py --file "E:\\scripts\\Fleetguard Scraper\\fleetguard_air-primary-secondary_progress.json"
    python import_fleetguard_hd.py --file "E:\\scripts\\Fleetguard Scraper\\fleetguard_air-primary-secondary_progress.json" --dry-run
    python import_fleetguard_hd.py --file "E:\\scripts\\Fleetguard Scraper\\fleetguard_air-primary-secondary_progress.json" --start AF25551

Requires: requests  (pip install requests)
"""

import argparse
import json
import logging
import re
import sys
import time
from pathlib import Path

import requests

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger(__name__)

API_BASE = "https://elimfilters-search-pro.onrender.com"
API_KEY  = None
BATCH    = 20
MAX_EQUIPMENT = 200  # truncate large equipment lists to avoid 413


# ── Fleetguard part number prefix → filter type + SKU prefix ────────────────
#
# Fleetguard part number prefixes (confirmed from catalog):
#   AF = Air Filter (primary/secondary)
#   AF = Air Precleaner (same prefix, distinguished by name)
#   LF = Lube/Oil Filter (cartridge)
#   FS = Fuel/Water Separator spin-on
#   FF = Fuel Filter spin-on
#   HF = Hydraulic Filter spin-on
#
FLEETGUARD_PREFIX_MAP = {
    'AF': {'sku_prefix': 'EA1', 'filter_type': 'Air Filter'},
    'LF': {'sku_prefix': 'EL8', 'filter_type': 'Oil Filter'},
    'FS': {'sku_prefix': 'EF9', 'filter_type': 'Fuel Filter'},
    'FF': {'sku_prefix': 'EF9', 'filter_type': 'Fuel Filter'},
    'HF': {'sku_prefix': 'EH6', 'filter_type': 'Hydraulic Filter'},
}

# Fallback: map by name keywords when prefix is ambiguous
NAME_TYPE_MAP = [
    (['air precleaner', 'air filter', 'primary air', 'secondary air'],
     {'sku_prefix': 'EA1', 'filter_type': 'Air Filter'}),
    (['lube filter', 'oil filter', 'lube cartridge'],
     {'sku_prefix': 'EL8', 'filter_type': 'Oil Filter'}),
    (['fuel filter', 'fuel/water', 'water separator'],
     {'sku_prefix': 'EF9', 'filter_type': 'Fuel Filter'}),
    (['hydraulic filter'],
     {'sku_prefix': 'EH6', 'filter_type': 'Hydraulic Filter'}),
]


def resolve_filter_type(part_number: str, name: str) -> dict | None:
    """Return {sku_prefix, filter_type} or None if unrecognised."""
    pn = (part_number or '').strip().upper()
    # Try 2-char prefix first
    prefix2 = pn[:2]
    if prefix2 in FLEETGUARD_PREFIX_MAP:
        return FLEETGUARD_PREFIX_MAP[prefix2]
    # Try 1-char prefix
    prefix1 = pn[:1]
    for k, v in FLEETGUARD_PREFIX_MAP.items():
        if k.startswith(prefix1) and re.match(r'^[A-Z]+[0-9]', pn):
            return v
    # Fallback: name keyword
    name_lc = (name or '').lower()
    for keywords, mapping in NAME_TYPE_MAP:
        if any(kw in name_lc for kw in keywords):
            return mapping
    return None


def fleetguard_code_base(part_number: str) -> str:
    """
    Extract the numeric suffix from a Fleetguard part number.
    AF25551 → '5551' | AF26412 → '6412' | LF3706 → '3706' | HF35308 → '5308'
    Always last 4 digits — same rule as LD codigo_base.
    """
    digits = re.sub(r'^[A-Za-z]+', '', part_number.strip())
    digits = re.sub(r'[^0-9]', '', digits)
    if not digits:
        return '0000'
    return digits[-4:].zfill(4)


def cross_refs_to_competitor_codes(cross_references: list) -> list:
    """
    Convert scraper cross_references [{brand, part_number}, ...]
    to DB competitor_codes format [{manufacturer, code}, ...].
    Filters out non-competitor entries.
    """
    result = []
    seen = set()
    # Brands that are actual filter manufacturers (not equipment OEMs)
    FILTER_BRANDS = {
        'DONALDSON', 'MANN', 'MANN+HUMMEL', 'MANN-HUMMEL', 'MANN FILTER',
        'BALDWIN', 'WIX', 'FRAM', 'PUROLATOR', 'NAPA', 'BOSCH', 'MAHLE',
        'HENGST', 'SAKURA', 'LUBER-FINER', 'LUBERFINER', 'PARKER',
        'PALL', 'HYDAC', 'MP FILTRI', 'UFI', 'CHAMPION', 'HASTINGS',
        'AC DELCO', 'ACDELCO', 'COOPER', 'COOPERS',
        'CATERPILLAR', 'CAT',  # CAT has filter OEM codes
        'JOHN DEERE', 'DEERE', 'KOMATSU', 'CUMMINS', 'CASE',
        'HITACHI', 'VOLVO', 'CNH', 'AGCO',
    }
    for ref in (cross_references or []):
        if not isinstance(ref, dict):
            continue
        brand = (ref.get('brand') or '').strip().upper()
        code  = (ref.get('part_number') or '').strip().upper()
        if not brand or not code or len(code) < 2:
            continue
        # Skip header rows
        if brand in ('BRAND', 'OEM BRAND', 'MANUFACTURER'):
            continue
        key = f"{brand}|{code}"
        if key not in seen:
            seen.add(key)
            result.append({'manufacturer': brand, 'code': code})
    return result


def equipment_to_applications(equipment: list) -> list:
    """
    Convert scraper equipment [{equipment, make, model, engine, year, qty}, ...]
    to DB equipment_applications format [{make, model, engine_code, year_range}, ...].
    """
    result = []
    seen = set()
    for eq in (equipment or []):
        if not isinstance(eq, dict):
            continue
        make   = (eq.get('make') or '').strip()
        model  = (eq.get('model') or '').strip()
        engine = (eq.get('engine') or '').strip()
        year   = (eq.get('year') or '').strip()
        if not make and not model:
            continue
        key = f"{make}|{model}|{engine}|{year}"
        if key in seen:
            continue
        seen.add(key)
        result.append({
            'make':        make,
            'model':       model,
            'engine_code': engine,
            'year_range':  year,
        })
    return result


def attrs_to_specs(attributes: dict) -> dict:
    """Pass through the specs dict, normalising keys."""
    if not isinstance(attributes, dict):
        return {}
    return {str(k).strip(): str(v).strip() for k, v in attributes.items() if k and v}


def map_record(record: dict) -> dict | None:
    """
    Map a Fleetguard scraper result to the /api/import/fleetguard row format.
    Returns None if the record should be skipped.
    """
    if not isinstance(record, dict):
        return None

    pn = (record.get('part_number') or '').strip().upper()
    if not pn or len(pn) < 3:
        return None

    # Skip if scraper reported an error and got nothing useful
    if record.get('error') and not record.get('attributes') and not record.get('cross_references'):
        return None

    mapping = resolve_filter_type(pn, record.get('name', ''))
    if not mapping:
        log.debug(f"  skip {pn}: unrecognised filter type (name={record.get('name', '')!r})")
        return None

    equipment = equipment_to_applications(record.get('equipment') or [])
    if len(equipment) > MAX_EQUIPMENT:
        equipment = equipment[:MAX_EQUIPMENT]

    cross_refs    = cross_refs_to_competitor_codes(record.get('cross_references') or [])
    specs         = attrs_to_specs(record.get('attributes') or {})
    codigo_base   = fleetguard_code_base(pn)
    alternatives  = [p for p in (record.get('alternatives') or []) if isinstance(p, str) and p.strip()]

    # Extract dimensions from specs dict
    od_mm  = _parse_mm(specs.get('Largest OD') or specs.get('OD') or specs.get('Outer Diameter'))
    h_mm   = _parse_mm(specs.get('Height') or specs.get('Length'))

    return {
        'fleetguard_code':   pn,
        'filter_type_raw':   mapping['filter_type'],
        'sku_prefix':        mapping['sku_prefix'],
        'codigo_base':       codigo_base,
        'name':              (record.get('name') or '')[:200] or None,
        'description':       (record.get('description') or '')[:600] or None,
        'specs':             specs,
        'competitor_codes':  cross_refs,
        'alternatives':      alternatives,
        'equipment_applications': equipment,
        'outer_diameter_mm': od_mm,
        'height_mm':         h_mm,
    }


def _parse_mm(val) -> float | None:
    if not val:
        return None
    # "4.65 inch (118 mm)" or "118 mm" or "118.0"
    m = re.search(r'\((\d+\.?\d*)\s*mm\)', str(val), re.IGNORECASE)
    if m:
        return float(m.group(1))
    m = re.search(r'(\d+\.?\d*)\s*mm', str(val), re.IGNORECASE)
    if m:
        return float(m.group(1))
    return None


def load_results(path: Path) -> list[dict]:
    """
    Load Fleetguard results from either:
    - *_results.json  → list of product dicts
    - *_progress.json → {"results": [...], ...}
    """
    with open(path, encoding='utf-8') as f:
        data = json.load(f)

    if isinstance(data, list):
        return data
    if isinstance(data, dict) and 'results' in data:
        return data['results']
    log.error(f"Unrecognised file format: {path}")
    return []


def post_batch(rows: list, dry_run: bool) -> dict:
    if dry_run:
        log.info(f"  [DRY] would POST {len(rows)} rows")
        for r in rows[:3]:
            log.info(f"    {r['fleetguard_code']} → {r['sku_prefix']}{r['codigo_base']} "
                     f"({r['filter_type_raw']}) equip={len(r['equipment_applications'])} "
                     f"cross={len(r['competitor_codes'])}")
        return {'success': True, 'total': len(rows), 'inserted': 0, 'updated': 0,
                'errors': 0, 'skipped': []}

    url  = f"{API_BASE}/api/import/fleetguard"
    resp = requests.post(
        url,
        json={'rows': rows},
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {API_KEY}',
        },
        timeout=120,
    )
    if resp.status_code == 200:
        return resp.json()
    log.error(f"  HTTP {resp.status_code}: {resp.text[:300]}")
    return {'success': False, 'total': len(rows), 'inserted': 0, 'updated': 0,
            'errors': len(rows), 'skipped': []}


def run(args):
    global API_KEY
    API_KEY = args.api_key

    path = Path(args.file)
    if not path.exists():
        log.error(f"File not found: {path}")
        sys.exit(1)

    all_records = load_results(path)
    log.info(f"Loaded {len(all_records)} records from {path.name}")

    # Map all records
    rows = []
    skipped_type = 0
    skipped_empty = 0
    for rec in all_records:
        mapped = map_record(rec)
        if mapped is None:
            if rec.get('part_number'):
                skipped_type += 1
            else:
                skipped_empty += 1
        else:
            rows.append(mapped)

    log.info(f"Mapped: {len(rows)} | skipped (no type): {skipped_type} | "
             f"skipped (no PN): {skipped_empty}")

    # Filter by type if requested
    if args.filter_type:
        ft = args.filter_type.strip()
        rows = [r for r in rows if r['filter_type_raw'].lower() == ft.lower()]
        log.info(f"After --filter-type '{ft}': {len(rows)} rows")

    # Start from a specific part number
    if args.start:
        sf = args.start.strip().upper()
        idx = next((i for i, r in enumerate(rows) if r['fleetguard_code'] == sf), None)
        if idx is None:
            log.warning(f"--start '{sf}' not found — running from beginning")
        else:
            log.info(f"Starting from {sf} (index {idx}/{len(rows)})")
            rows = rows[idx:]

    if not rows:
        log.info("Nothing to import.")
        return

    # Stats preview
    from collections import Counter
    type_counts = Counter(r['filter_type_raw'] for r in rows)
    log.info(f"By type: {dict(type_counts)}")

    if args.dry_run:
        log.info("── DRY RUN ──")
        post_batch(rows[:5], dry_run=True)
        return

    # Import in batches
    total_inserted = total_updated = total_errors = 0
    all_skipped = []
    all_error_details = []

    for i in range(0, len(rows), BATCH):
        batch = rows[i:i + BATCH]
        result = post_batch(batch, dry_run=False)
        total_inserted += result.get('inserted', 0)
        total_updated  += result.get('updated', 0)
        total_errors   += result.get('errors', 0)
        all_skipped    += result.get('skipped', [])
        all_error_details += result.get('errorDetails', [])

        done = min(i + BATCH, len(rows))
        log.info(f"  [{done}/{len(rows)}] +{result.get('inserted',0)} ins "
                 f"+{result.get('updated',0)} upd "
                 f"{result.get('errors',0)} err")

        if i + BATCH < len(rows):
            time.sleep(0.3)

    # Save errors file if requested
    if args.errors_file and all_error_details:
        with open(args.errors_file, 'w', encoding='utf-8') as f:
            json.dump(all_error_details, f, ensure_ascii=False, indent=2)
        log.info(f"Error details → {args.errors_file}")

    log.info(f"\n{'='*55}")
    log.info(f"Fleetguard Import Summary")
    log.info(f"  Total rows     : {len(rows):,}")
    log.info(f"  Inserted       : {total_inserted:,}")
    log.info(f"  Updated        : {total_updated:,}")
    log.info(f"  Errors         : {total_errors:,}")
    if all_skipped:
        log.info(f"  Collisions     : {len(all_skipped)} (duplicate SKUs)")


def stats(args):
    path = Path(args.file)
    records = load_results(path)
    rows = [map_record(r) for r in records]
    rows = [r for r in rows if r]

    from collections import Counter
    type_counts = Counter(r['filter_type_raw'] for r in rows)
    has_equip   = sum(1 for r in rows if r['equipment_applications'])
    has_cross   = sum(1 for r in rows if r['competitor_codes'])
    total_equip = sum(len(r['equipment_applications']) for r in rows)
    total_cross = sum(len(r['competitor_codes']) for r in rows)

    print(f"\nFleetguard Import Stats — {path.name}")
    print(f"  Total records  : {len(records):,}")
    print(f"  Importable     : {len(rows):,}")
    print(f"  By type        : {dict(type_counts)}")
    print(f"  With equipment : {has_equip:,} ({total_equip:,} rows)")
    print(f"  With cross-refs: {has_cross:,} ({total_cross:,} refs)")

    if rows:
        sample = rows[:3]
        print(f"\n  Sample:")
        for r in sample:
            print(f"    {r['fleetguard_code']:<10} → {r['sku_prefix']}{r['codigo_base']:<6} "
                  f"| {r['filter_type_raw']:<18} | eq={len(r['equipment_applications'])} "
                  f"cr={len(r['competitor_codes'])}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Import Fleetguard HD products')
    parser.add_argument('--file',         required=True, help='Path to *_results.json or *_progress.json')
    parser.add_argument('--api-key',      default='',    help='x-api-key for the import endpoint')
    parser.add_argument('--dry-run',      action='store_true')
    parser.add_argument('--stats',        action='store_true', help='Show stats without importing')
    parser.add_argument('--filter-type',  default='',    help='Only import this filter type (e.g. "Air Filter")')
    parser.add_argument('--start',        default='',    help='Start from this Fleetguard part number')
    parser.add_argument('--errors-file',  default='',    help='Save error details to this JSON file')
    args = parser.parse_args()

    if args.stats:
        stats(args)
    else:
        run(args)
