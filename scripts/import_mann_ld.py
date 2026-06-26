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

API_BASE = "https://elimfilters-search-pro.onrender.com"
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
}

# Only these 4 LD types are supported
SUPPORTED_TYPES = {'Oil Filter', 'Fuel Filter', 'Air Filter', 'Cabin Filter'}


def normalize_filter_type(raw: str) -> str | None:
    """Normalise scraper filterType string to one of the 4 supported LD types."""
    if not raw:
        return None
    key = raw.strip().lower()
    return FILTER_TYPE_ALIASES.get(key)


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
    Returns None if the record should be skipped (zero OE codes + zero fitment,
    or unsupported filter type, or HTTP error during scrape).
    """
    # Skip failed scrapes
    if record.get('status', 0) not in (200, 0):
        return None
    # Skip if no data at all
    if not record.get('oe_count') and not record.get('fitment_count'):
        return None

    ft_raw = normalize_filter_type(record.get('filter_type', ''))
    if ft_raw not in SUPPORTED_TYPES:
        return None

    dims = record.get('dimensions') or {}

    fitment = record.get('fitment') or []
    if len(fitment) > MAX_FITMENT:
        fitment = fitment[:MAX_FITMENT]

    return {
        'mann_code':       record['sku'],
        'filter_type_raw': ft_raw,
        'description':     (record.get('description') or '')[:600] or None,
        'oe_numbers':      record.get('oe_numbers') or {},
        'fitment':         fitment,
        'outer_diameter_mm': parse_dim_mm(dims.get('A') or dims.get('OD') or dims.get('Outer Diameter')),
        'height_mm':       parse_dim_mm(dims.get('H') or dims.get('Height')),
    }


def post_batch(rows: list, dry_run: bool) -> dict:
    if dry_run:
        log.info(f"  [DRY] would POST {len(rows)} rows")
        return {'success': True, 'total': len(rows), 'inserted': 0, 'updated': 0, 'errors': 0, 'skipped': []}

    url = f"{API_BASE}/api/import/mann"
    resp = requests.post(
        url,
        json={'rows': rows},
        headers={'Authorization': f'Bearer {API_KEY}', 'Content-Type': 'application/json'},
        timeout=120,
    )
    # If payload too large, split in half and retry recursively
    if resp.status_code == 413 and len(rows) > 1:
        mid = len(rows) // 2
        log.warning(f"  413 payload too large — splitting {len(rows)} rows into {mid}+{len(rows)-mid}")
        r1 = post_batch(rows[:mid], dry_run)
        r2 = post_batch(rows[mid:], dry_run)
        return {
            'success': True,
            'total':    r1['total']    + r2['total'],
            'inserted': r1['inserted'] + r2['inserted'],
            'updated':  r1['updated']  + r2['updated'],
            'errors':   r1['errors']   + r2['errors'],
            'skipped':  r1.get('skipped', []) + r2.get('skipped', []),
        }
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
    all_server_skipped = []
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
                if normalize_filter_type(record.get('filter_type', '')) not in SUPPORTED_TYPES:
                    total_skipped_type += 1
                else:
                    total_skipped_empty += 1
                continue

            # --filter-type filter
            if filter_type and mapped['filter_type_raw'].lower() != filter_type.lower():
                continue

            batch.append(mapped)

            if len(batch) >= BATCH:
                result = post_batch(batch, dry_run)
                total_inserted += result.get('inserted', 0)
                total_updated  += result.get('updated', 0)
                total_errors   += result.get('errors', 0)
                all_server_skipped.extend(result.get('skipped', []))
                batch_errors = result.get('errorDetails', [])
                all_error_details.extend(batch_errors)
                log.info(
                    f"  Batch {total_read}: +{result.get('inserted',0)} ins "
                    f"+{result.get('updated',0)} upd {result.get('errors',0)} err"
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
        total_errors   += result.get('errors', 0)
        all_server_skipped.extend(result.get('skipped', []))
        all_error_details.extend(result.get('errorDetails', []))

    log.info(f"\n{'='*55}")
    log.info(f"Mann LD Import Summary {'(DRY RUN)' if dry_run else ''}")
    log.info(f"  Records read       : {total_read:,}")
    log.info(f"  Skipped (no type)  : {total_skipped_type:,}")
    log.info(f"  Skipped (empty)    : {total_skipped_empty:,}")
    log.info(f"  Inserted           : {total_inserted:,}")
    log.info(f"  Updated            : {total_updated:,}")
    log.info(f"  Errors             : {total_errors:,}")
    if all_server_skipped:
        log.info(f"  Server skipped     : {len(all_server_skipped)} (SKU collisions)")
        for s in all_server_skipped[:10]:
            log.info(f"    {s}")

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
