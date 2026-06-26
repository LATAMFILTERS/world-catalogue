#!/usr/bin/env python3
"""
import_wix_crossrefs.py — Add WIX cross-reference numbers to existing LD products
===================================================================================
Reads C:\\mann\\wix_crossrefs.jsonl (output of scraper_wix_crossrefs.py) and
UPDATEs competitor_codes in elimfilters_catalog for each matching Mann LD SKU.

Validation: WIX part numbers are validated against the expected range for the
filter type of the Mann SKU, preventing cross-type false matches.

  Oil Filter   WIX: 51xxx, 57xxx
  Air Filter   WIX: 42xxx, 46xxx, 49xxx
  Cabin Filter WIX: 24xxx
  Fuel Filter  WIX: 33xxx

Usage:
    python import_wix_crossrefs.py
    python import_wix_crossrefs.py --dry-run
    python import_wix_crossrefs.py --stats
    python import_wix_crossrefs.py --input C:\\mann\\wix_crossrefs.jsonl
"""

import argparse
import json
import logging
import sys
import time
from pathlib import Path

import requests

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger(__name__)

API_BASE    = "https://elimfilters-search-pro.onrender.com"
API_KEY     = ""
INPUT_FILE  = Path(r"C:\mann\wix_crossrefs.jsonl")
BATCH       = 50

# WIX number prefix ranges by filter type
# Key: filter_type as stored in DB | Value: list of valid WIX number prefixes (2-3 digits)
WIX_TYPE_PREFIXES = {
    'Oil Filter':      ['51', '57'],
    'Air Filter':      ['42', '46', '49'],
    'Cabin Filter':    ['24'],
    'Fuel Filter':     ['33'],
    'Hydraulic Filter':['58', '51'],  # WIX hydraulic overlaps with oil
}

# Mann SKU prefix → filter type (to resolve type without DB lookup)
MANN_SKU_TO_TYPE = {
    'EL3': 'Oil Filter',
    'EA3': 'Air Filter',
    'EC3': 'Cabin Filter',
    'EF3': 'Fuel Filter',
}

# Mann part number letter prefix → filter type (direct from scraper output)
MANN_PN_TO_TYPE = {
    'W':   'Oil Filter',    # W 940/21, W 712/75
    'HU':  'Oil Filter',    # HU 711/51
    'ML':  'Oil Filter',    # ML 1003
    'OX':  'Oil Filter',    # OX 153
    'C':   'Air Filter',    # C 2540, C 1040/2  (NOT cabin — cabin is CU)
    'CU':  'Cabin Filter',  # CU 1828
    'CF':  'Cabin Filter',  # CF 500/1
    'FP':  'Cabin Filter',  # FP 23
    'WK':  'Fuel Filter',   # WK 1060/6
    'PU':  'Fuel Filter',   # PU 999
    'KC':  'Fuel Filter',   # KC 200
}


def wix_prefix(wix_num: str) -> str:
    """Return 2-digit prefix of a WIX number string."""
    return (wix_num or '').strip()[:2]


def infer_type_from_mann_pn(mann_pn: str) -> str | None:
    """Infer filter type from Mann part number prefix (e.g. 'W 940/21' → 'Oil Filter')."""
    pn = (mann_pn or '').strip().upper()
    for prefix, ftype in sorted(MANN_PN_TO_TYPE.items(), key=lambda x: -len(x[0])):
        if pn.startswith(prefix):
            return ftype
    return None


def validate_wix_numbers(mann_pn: str, wix_nums: list[str], filter_type: str | None = None) -> list[str]:
    """
    Return only WIX numbers that match the expected type for this Mann SKU.
    If filter_type is unknown, keeps all (no false rejection).
    """
    if not filter_type:
        filter_type = infer_type_from_mann_pn(mann_pn)
    if not filter_type:
        return wix_nums  # can't validate, keep all

    valid_prefixes = WIX_TYPE_PREFIXES.get(filter_type, [])
    if not valid_prefixes:
        return wix_nums

    validated = []
    rejected  = []
    for wn in wix_nums:
        px = wix_prefix(wn)
        if px in valid_prefixes:
            validated.append(wn)
        else:
            rejected.append(wn)

    if rejected:
        log.debug(f"  {mann_pn} ({filter_type}): rejected WIX {rejected} (wrong type)")

    return validated


def load_jsonl(path: Path) -> list[dict]:
    records = []
    with open(path, encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    records.append(json.loads(line))
                except json.JSONDecodeError as e:
                    log.warning(f"  bad line: {e}")
    return records


def post_batch(rows: list[dict], dry_run: bool) -> dict:
    """POST a batch of {mann_sku, wix_numbers} to /api/update/wix-crossrefs."""
    if dry_run:
        for r in rows[:3]:
            log.info(f"  [DRY] {r['mann_sku']} → WIX {r['wix_numbers']}")
        return {'updated': len(rows), 'skipped': 0, 'errors': 0}

    url  = f"{API_BASE}/api/update/wix-crossrefs"
    resp = requests.post(
        url,
        json={'rows': rows},
        headers={
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
        },
        timeout=120,
    )
    if resp.status_code == 200:
        return resp.json()
    log.error(f"  HTTP {resp.status_code}: {resp.text[:300]}")
    return {'updated': 0, 'skipped': 0, 'errors': len(rows)}


def run(args):
    global API_KEY
    API_KEY = args.api_key

    path = Path(args.input)
    if not path.exists():
        log.error(f"File not found: {path}")
        sys.exit(1)

    records = load_jsonl(path)
    log.info(f"Loaded {len(records):,} records from {path.name}")

    # Build rows: validate WIX numbers per type
    rows = []
    skipped_no_wix   = 0
    skipped_no_match = 0
    total_rejected   = 0

    for rec in records:
        mann_sku = (rec.get('sku') or '').strip().upper()
        wix_raw  = rec.get('wix') or []

        if not mann_sku:
            continue
        if not wix_raw:
            skipped_no_wix += 1
            continue

        # Infer filter type from Mann part number
        filter_type = infer_type_from_mann_pn(mann_sku)

        # Validate WIX numbers
        wix_valid = validate_wix_numbers(mann_sku, [str(w) for w in wix_raw], filter_type)
        rejected  = len(wix_raw) - len(wix_valid)
        total_rejected += rejected

        if not wix_valid:
            skipped_no_match += 1
            continue

        rows.append({
            'mann_sku':    mann_sku,
            'wix_numbers': wix_valid,
            'filter_type': filter_type or '',
        })

    log.info(f"Rows with valid WIX: {len(rows):,}")
    log.info(f"Skipped (no WIX):    {skipped_no_wix:,}")
    log.info(f"Skipped (all rejected): {skipped_no_match:,}")
    log.info(f"WIX numbers rejected (type mismatch): {total_rejected:,}")

    if args.dry_run:
        log.info("── DRY RUN ──")
        post_batch(rows[:5], dry_run=True)
        return

    if not rows:
        log.info("Nothing to update.")
        return

    total_updated = total_errors = 0
    for i in range(0, len(rows), BATCH):
        batch  = rows[i:i + BATCH]
        result = post_batch(batch, dry_run=False)
        total_updated += result.get('updated', 0)
        total_errors  += result.get('errors', 0)
        done = min(i + BATCH, len(rows))
        log.info(f"  [{done}/{len(rows)}] updated={result.get('updated',0)} "
                 f"err={result.get('errors',0)}")
        if i + BATCH < len(rows):
            time.sleep(0.2)

    log.info(f"\n{'='*55}")
    log.info(f"WIX Cross-reference Import Summary")
    log.info(f"  Rows processed : {len(rows):,}")
    log.info(f"  DB updated     : {total_updated:,}")
    log.info(f"  Errors         : {total_errors:,}")
    log.info(f"  Type rejected  : {total_rejected:,}")


def stats(args):
    path = Path(args.input)
    records = load_jsonl(path)

    total       = len(records)
    with_wix    = [r for r in records if r.get('wix')]
    no_wix      = total - len(with_wix)
    total_wix   = sum(len(r['wix']) for r in with_wix)
    multi_match = [r for r in with_wix if len(r['wix']) > 1]

    # Type mismatch stats
    rejected_total = 0
    type_mismatches = []
    for r in with_wix:
        mann_pn    = r.get('sku', '')
        filter_type = infer_type_from_mann_pn(mann_pn)
        valid      = validate_wix_numbers(mann_pn, [str(w) for w in r['wix']], filter_type)
        rejected   = len(r['wix']) - len(valid)
        if rejected:
            rejected_total += rejected
            type_mismatches.append({'sku': mann_pn, 'wix': r['wix'], 'valid': valid})

    print(f"\nWIX Cross-reference Stats — {path.name}")
    print(f"  Total SKUs          : {total:,}")
    print(f"  With WIX match      : {len(with_wix):,}  ({len(with_wix)/total*100:.1f}%)")
    print(f"  No WIX match        : {no_wix:,}")
    print(f"  Total WIX numbers   : {total_wix:,}")
    print(f"  Multi-match (>1 WIX): {len(multi_match):,}")
    print(f"  Type mismatches     : {rejected_total:,} WIX numbers rejected")

    if type_mismatches:
        print(f"\n  Sample type mismatches (first 5):")
        for m in type_mismatches[:5]:
            print(f"    {m['sku']:<20} wix={m['wix']}  valid={m['valid']}")

    if multi_match:
        print(f"\n  Sample multi-matches (first 5):")
        for r in multi_match[:5]:
            print(f"    {r['sku']:<20} → WIX {r['wix']}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--input',    default=str(INPUT_FILE), help='Path to wix_crossrefs.jsonl')
    parser.add_argument('--api-key',  default='', help='x-api-key')
    parser.add_argument('--dry-run',  action='store_true')
    parser.add_argument('--stats',    action='store_true')
    args = parser.parse_args()

    if args.stats:
        stats(args)
    else:
        run(args)
