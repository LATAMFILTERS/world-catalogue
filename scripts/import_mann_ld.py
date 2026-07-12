"""
import_mann_ld.py — Import Mann Filter LD products into elimfilters_catalog

Reads mann_master.jsonl (output of scraper_mann_master.py) and POSTs batches
to /api/import/mann.

SKU generation rules (enforced server-side):
  Oil Filter   → EL3 + last 4 digits of Mann code  (e.g. ML 1003 → EL31003)
  Air Filter   → EA3 + last 4 digits
  Cabin Filter → EC3 + last 4 digits
  Fuel Filter  → EF3 + last 4 digits
  duty = LIGHT_DUTY for all records.
  codigo_base  = last 4 digits of Mann part number (digits only, no symbols).

Usage:
    python3 import_mann_ld.py --file C:\\mann\\mann_master.jsonl
    python3 import_mann_ld.py --file C:\\mann\\mann_master.jsonl --dry-run
    python3 import_mann_ld.py --file C:\\mann\\mann_master.jsonl --filter-type "Oil Filter"
    python3 import_mann_ld.py --file C:\\mann\\mann_master.jsonl --start ML1003

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

API_BASE = "https://part-search.elimfilters.com"
API_KEY  = None  # set via --api-key argument
BATCH    = 10    # conservative: some products have 300+ fitment rows
MAX_FITMENT = 150  # truncate to avoid 413 on large products

# Maps scraper filter_type strings → server-side filter_type_raw key
FILTER_TYPE_ALIASES = {
    'oil filter':    'Oil Filter',
    'fuel filter':   'Fuel Filter',
    'air filter':    'Air Filter',
    'cabin filter':  'Cabin Filter',
    # German fallbacks from scraper
    'olfilter':      'Oil Filter',
    'kraftstofffilter': 'Fuel Filter',
    'luftfilter':    'Air Filter',
    'innenraumfilter': 'Cabin Filter',
    # Short-form aliases from mann_ld_import_ready.jsonl
    'air':   'Air Filter',
    'cabin': 'Cabin Filter',
    'fuel':  'Fuel Filter',
    'lube':  'Oil Filter',
}

# Only these 4 LD types are supported
SUPPORTED_TYPES = {'Oil Filter', 'Fuel Filter', 'Air Filter', 'Cabin Filter'}

# Mann part-number prefix → filter type (fallback when scraper couldn't detect type)
# Used for the ~149 records where filter_type is empty in mann_master.jsonl
MANN_PREFIX_TYPE = {
    # Oil filters (longest prefixes first to avoid false matches)
    'CUK':  'Cabin Filter',  # CUK 2028, CUK1000 — must come before 'CU' and 'C'
    'FP':   'Cabin Filter',  # FP 21 000-2 (FreciousPlus cabin)
    'CU':   'Air Filter',    # CU 2028 — before 'C'
    'WK':   'Fuel Filter',   # WK 1060/6 — before 'W'
    'ML':   'Oil Filter',    # ML 1003, ML1003
    'HU':   'Oil Filter',    # HU 711/51, HU6013Y, HU7048Z (with or without space)
    'MW':   'Oil Filter',    # MW68, MW65, MW713 (motorcycle oil filters)
    'MH':   'Oil Filter',    # MH66, MH68, MH69 (motorcycle)
    'LC':   'Cabin Filter',  # LC8003X, LC8100, LC5001X (cabin)
    'LA':   'Cabin Filter',  # LA 157
    'KC':   'Fuel Filter',   # KC 64
    'KL':   'Fuel Filter',   # KL 174
    'PU':   'Fuel Filter',   # PU 999/1
    'CF':   'Air Filter',    # CF series
    'CP':   'Air Filter',    # CP series
    'SP':   'Oil Filter',    # SP series
    # Single-letter prefixes (catch-all, lowest priority)
    'W':    'Oil Filter',    # W 940/21, W7069, W6031 — after WK
    'C':    'Air Filter',    # C 1040/2, C6010, C118 — after CUK/CU/CF/CP
    'H':    'Oil Filter',    # H4001X
    'P':    'Fuel Filter',   # P 945/2 — after PU
}


def infer_type_from_prefix(mann_code: str) -> str | None:
    """Infer filter type from Mann part number prefix when scraper didn't detect it."""
    code = mann_code.strip().upper()
    # Try longest prefix first to avoid false matches
    for prefix, ftype in sorted(MANN_PREFIX_TYPE.items(), key=lambda x: -len(x[0])):
        if code.startswith(prefix.upper()):
            return ftype
    return None


def normalize_filter_type(raw: str, mann_code: str = '') -> str | None:
    """Normalise scraper filterType string to one of the 4 supported LD types.
    Falls back to prefix-based inference when raw is empty."""
    if raw:
        key = raw.strip().lower()
        result = FILTER_TYPE_ALIASES.get(key)
        if result:
            return result
    # Fallback: infer from part number prefix
    if mann_code:
        return infer_type_from_prefix(mann_code)
    return None


def flatten_oe_numbers(oe_numbers: dict) -> list:
    """Convert scraper's {manufacturer: [codes]} dict into
    [{"manufacturer": mfr, "code": code}, ...] as stored in oem_codes."""
    out = []
    for mfr, codes in (oe_numbers or {}).items():
        for code in codes:
            out.append({'manufacturer': mfr, 'code': code})
    return out


def parse_dim_mm(val) -> float | None:
    """Extract a float mm value from strings like '118 mm' or '4.65 inch (118 mm)'."""
    if val is None:
        return None
    m = re.search(r'\((\d+\.?\d*)\s*mm\)', str(val))
    if m:
        return float(m.group(1))
    m = re.search(r'(\d+\.?\d*)\s*mm', str(val))
    if m:
        return float(m.group(1))
    return None


def map_row(record: dict) -> dict | None:
    """
    Map a mann_master.jsonl record to the /api/import/mann row format.
    Inserts a bare row (empty OE/fitment) when the mann-filter.com detail
    scrape had nothing (404, or page had no data) as long as the filter
    type can still be determined from the MANN part-number prefix — this
    lets crossref data (from a different source) attach to the SKU later.
    Returns None only when the filter type can't be determined at all,
    or the type isn't one of the 4 supported LD types.
    """
    ft_raw = normalize_filter_type(record.get('filter_type', ''), record.get('sku', ''))
    if ft_raw not in SUPPORTED_TYPES:
        return None

    dims = record.get('dimensions') or {}

    fitment = record.get('fitment') or []
    if len(fitment) > MAX_FITMENT:
        fitment = fitment[:MAX_FITMENT]

    return {
        'sku':             record['sku'],
        'mann_part_number': record['sku'],
        'filter_type':     ft_raw,
        'description':     (record.get('description') or '')[:600] or None,
        'oem_codes':       flatten_oe_numbers(record.get('oe_numbers')),
        'equipment_applications': fitment,
        'outer_diameter_mm': parse_dim_mm(dims.get('A') or dims.get('OD') or dims.get('Outer Diameter')),
        'height_mm':       parse_dim_mm(dims.get('H') or dims.get('Height')),
    }


def post_batch(rows: list, dry_run: bool) -> dict:
    if dry_run:
        log.info(f"  [DRY] would POST {len(rows)} rows")
        return {'success': True, 'inserted': 0, 'updated': 0, 'errors': []}

    url = f"{API_BASE}/api/import/mann"
    try:
        resp = requests.post(
            url,
            json={'products': rows},
            headers={'Authorization': f'Bearer {API_KEY}', 'Content-Type': 'application/json'},
            timeout=180,
        )
    except requests.exceptions.Timeout:
        if len(rows) > 1:
            mid = len(rows) // 2
            log.warning(f"  timeout — splitting {len(rows)} rows into {mid}+{len(rows)-mid} and retrying")
            r1 = post_batch(rows[:mid], dry_run)
            r2 = post_batch(rows[mid:], dry_run)
            return {
                'success':  True,
                'inserted': r1.get('inserted', 0) + r2.get('inserted', 0),
                'updated':  r1.get('updated', 0)  + r2.get('updated', 0),
                'errors':   (r1.get('errors') or []) + (r2.get('errors') or []),
            }
        # single row still times out — record it as an error and move on
        log.error(f"  timeout on single row {rows[0].get('sku')} — skipping")
        return {'success': True, 'inserted': 0, 'updated': 0,
                'errors': [{'sku': rows[0].get('sku'), 'error': 'request timeout'}]}

    # If payload too large, split in half and retry recursively
    if resp.status_code == 413 and len(rows) > 1:
        mid = len(rows) // 2
        log.warning(f"  413 payload too large — splitting {len(rows)} rows into {mid}+{len(rows)-mid}")
        r1 = post_batch(rows[:mid], dry_run)
        r2 = post_batch(rows[mid:], dry_run)
        return {
            'success':  True,
            'inserted': r1.get('inserted', 0) + r2.get('inserted', 0),
            'updated':  r1.get('updated', 0)  + r2.get('updated', 0),
            'errors':   (r1.get('errors') or []) + (r2.get('errors') or []),
        }
    if resp.status_code >= 400:
        log.error(f"  Server error {resp.status_code}: {resp.text[:1000]}")
    resp.raise_for_status()
    return resp.json()


def run(jsonl_path: Path, dry_run: bool, filter_type: str | None, start_from: str | None, errors_file: Path | None = None):
    if not jsonl_path.exists():
        log.error(f"File not found: {jsonl_path}")
        sys.exit(1)

    total_read = 0
    total_skipped_type = 0
    total_skipped_empty = 0
    total_inserted = 0
    total_updated = 0
    total_errors = 0
    all_error_details = []

    batch = []
    started = start_from is None

    with open(jsonl_path, encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                record = json.loads(line)
            except json.JSONDecodeError:
                continue

            # --start support: skip until we hit the target MANN code
            if not started:
                if record.get('sku', '').upper() == start_from.upper():
                    started = True
                else:
                    continue

            total_read += 1

            mapped = map_row(record)
            if mapped is None:
                sku_code = record.get('sku', '')
                ft = normalize_filter_type(record.get('filter_type', ''), sku_code)
                if ft not in SUPPORTED_TYPES:
                    total_skipped_type += 1
                else:
                    total_skipped_empty += 1
                continue

            # --filter-type filter
            if filter_type and mapped['filter_type'].lower() != filter_type.lower():
                continue

            batch.append(mapped)

            if len(batch) >= BATCH:
                result = post_batch(batch, dry_run)
                total_inserted += result.get('inserted', 0)
                total_updated  += result.get('updated', 0)
                batch_errors = result.get('errors', []) or []
                total_errors  += len(batch_errors)
                all_error_details.extend(batch_errors)
                log.info(
                    f"  Batch {total_read}: +{result.get('inserted',0)} ins "
                    f"+{result.get('updated',0)} upd {len(batch_errors)} err"
                )
                for ed in batch_errors[:5]:
                    log.warning(f"    ERR {ed.get('sku')}: {ed.get('error')}")
                batch = []
                time.sleep(0.3)

    # flush remaining
    if batch:
        result = post_batch(batch, dry_run)
        total_inserted += result.get('inserted', 0)
        total_updated  += result.get('updated', 0)
        batch_errors = result.get('errors', []) or []
        total_errors  += len(batch_errors)
        all_error_details.extend(batch_errors)

    log.info(f"\n{'='*55}")
    log.info(f"Mann LD Import Summary {'(DRY RUN)' if dry_run else ''}")
    log.info(f"  Records read       : {total_read:,}")
    log.info(f"  Skipped (no type)  : {total_skipped_type:,}")
    log.info(f"  Skipped (empty)    : {total_skipped_empty:,}")
    log.info(f"  Inserted           : {total_inserted:,}")
    log.info(f"  Updated            : {total_updated:,}")
    log.info(f"  Errors             : {total_errors:,}")

    if all_error_details:
        log.info(f"\n  First 20 errors:")
        for ed in all_error_details[:20]:
            log.warning(f"    {ed.get('sku')}: {ed.get('error')}")
        if errors_file:
            import json as _json
            errors_file.write_text(_json.dumps(all_error_details, indent=2), encoding='utf-8')
            log.info(f"\n  All {len(all_error_details)} error details saved to: {errors_file}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Import Mann LD JSONL into elimfilters_catalog')
    parser.add_argument('--file',        default=r'C:\mann\mann_master.jsonl',
                        help='Path to mann_master.jsonl (default: C:\\mann\\mann_master.jsonl)')
    parser.add_argument('--api-key',     default=None,
                        help='ADMIN_KEY from Render environment (required for live import)')
    parser.add_argument('--dry-run',     action='store_true',
                        help='Parse and map rows but do not POST to API')
    parser.add_argument('--filter-type', default=None,
                        help='Import only this type: "Oil Filter", "Air Filter", etc.')
    parser.add_argument('--start',       default=None,
                        help='Resume from this MANN code (e.g. ML1003)')
    parser.add_argument('--errors-file', default=None,
                        help='Save all error details to this JSON file (e.g. C:\\mann\\errors.json)')
    args = parser.parse_args()

    if not args.dry_run and not args.api_key:
        print('ERROR: --api-key is required for live import. Use --dry-run to test without it.')
        sys.exit(1)

    API_KEY = args.api_key  # set globally before run()

    run(
        jsonl_path=Path(args.file),
        dry_run=args.dry_run,
        filter_type=args.filter_type,
        start_from=args.start,
        errors_file=Path(args.errors_file) if args.errors_file else None,
    )
