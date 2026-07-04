"""
apply_mann_crossrefs.py — Apply FRAM/WIX/Bosch/Purflux crossrefs to LD products

Reads C:\\mann\\mann_ld_crossrefs.jsonl (output of scraper_mann_ld_crossref.py)
and POSTs competitor_codes updates to /api/update/mann-crossrefs.

Each line in mann_ld_crossrefs.jsonl looks like:
  {"sku": "W940/21", "crossrefs": {"FRAM": ["PH5316"], "WIX": ["51452"], ...}}

Usage:
    python apply_mann_crossrefs.py
    python apply_mann_crossrefs.py --dry-run
    python apply_mann_crossrefs.py --file C:\\mann\\mann_ld_crossrefs.jsonl
    python apply_mann_crossrefs.py --api-key 'your-key'

Requires: requests  (pip install requests)
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

API_BASE  = "https://part-search.elimfilters.com"
API_KEY   = None
BATCH     = 50
INPUT_FILE = Path(r"C:\mann\mann_ld_crossrefs.jsonl")


def post_batch(rows: list, dry_run: bool) -> dict:
    if dry_run:
        log.info(f"  [DRY] would POST {len(rows)} crossref rows")
        return {'success': True, 'total': len(rows), 'updated': 0, 'skipped': 0, 'errors': 0}

    url = f"{API_BASE}/api/update/mann-crossrefs"
    resp = requests.post(
        url,
        json={'rows': rows},
        headers={'Authorization': f'Bearer {API_KEY}', 'Content-Type': 'application/json'},
        timeout=120,
    )
    resp.raise_for_status()
    return resp.json()


def run(input_path: Path, dry_run: bool):
    if not input_path.exists():
        log.error(f"File not found: {input_path}")
        sys.exit(1)

    total_read = 0
    total_no_crossrefs = 0
    total_updated = 0
    total_skipped = 0
    total_errors = 0

    batch = []

    with open(input_path, encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                record = json.loads(line)
            except json.JSONDecodeError:
                continue

            total_read += 1
            crossrefs = record.get('crossrefs') or {}
            if not crossrefs:
                total_no_crossrefs += 1
                continue

            batch.append({
                'sku':       record['sku'],
                'crossrefs': crossrefs,
            })

            if len(batch) >= BATCH:
                result = post_batch(batch, dry_run)
                total_updated += result.get('updated', 0)
                total_skipped += result.get('skipped', 0)
                total_errors  += result.get('errors', 0)
                log.info(
                    f"  Batch {total_read}: +{result.get('updated',0)} upd "
                    f"{result.get('skipped',0)} skip {result.get('errors',0)} err"
                )
                batch = []
                time.sleep(0.3)

    # Flush remaining
    if batch:
        result = post_batch(batch, dry_run)
        total_updated += result.get('updated', 0)
        total_skipped += result.get('skipped', 0)
        total_errors  += result.get('errors', 0)

    log.info(f"\n{'='*55}")
    log.info(f"Mann LD Crossrefs Apply {'(DRY RUN)' if dry_run else ''}")
    log.info(f"  Records read      : {total_read:,}")
    log.info(f"  No crossrefs      : {total_no_crossrefs:,}")
    log.info(f"  Updated in DB     : {total_updated:,}")
    log.info(f"  Skipped (not found): {total_skipped:,}")
    log.info(f"  Errors            : {total_errors:,}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Apply Mann LD crossrefs to catalog')
    parser.add_argument('--file',    default=str(INPUT_FILE), help='Path to mann_ld_crossrefs.jsonl')
    parser.add_argument('--api-key', default=None,            help='ADMIN_KEY')
    parser.add_argument('--dry-run', action='store_true',     help='Parse without posting')
    args = parser.parse_args()

    if not args.dry_run and not args.api_key:
        print('ERROR: --api-key is required for live import. Use --dry-run to test without it.')
        sys.exit(1)

    API_KEY = args.api_key

    run(Path(args.file), args.dry_run)
