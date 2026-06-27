#!/usr/bin/env python3
"""
import_fram_crossrefs.py — Add FRAM codes to LD products via FRAM→WIX→Mann bridge
====================================================================================
Reads C:\\mann\\fram_to_wix.jsonl (output of scraper_fram_ranges.py) and
C:\\mann\\wix_crossrefs.jsonl (WIX→Mann bridge).

Chain:
  FRAM PH3387A → WIX 51040  (from fram_to_wix.jsonl)
  WIX 51040 → Mann W 940/21 (from wix_crossrefs.jsonl)
  Mann W 940/21 → EL34021   (codigo_base=4021 in DB)
  → competitor_codes gets {manufacturer: "FRAM", code: "PH3387A"}

Usage:
    python import_fram_crossrefs.py
    python import_fram_crossrefs.py --dry-run
    python import_fram_crossrefs.py --stats
    python import_fram_crossrefs.py --api-key TOKEN
"""

import argparse
import json
import logging
import sys
import time
from collections import defaultdict
from pathlib import Path

import requests

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger(__name__)

API_BASE           = "https://elimfilters-search-pro.onrender.com"
API_KEY            = ""
FRAM_FILE          = Path(r"C:\mann\fram_to_wix.jsonl")
WIX_CROSSREFS_FILE = Path(r"C:\mann\wix_crossrefs.jsonl")
BATCH              = 50

# FRAM prefix → filter type (for cross-type rejection)
FRAM_PREFIX_TO_TYPE = {
    'PH': 'Oil Filter',
    'CA': 'Air Filter',
    'CF': 'Cabin Filter',
    'G':  'Fuel Filter',
}

# Mann SKU prefix letters → filter type
MANN_PN_TO_TYPE = {
    'W':  'Oil Filter',
    'HU': 'Oil Filter',
    'ML': 'Oil Filter',
    'OX': 'Oil Filter',
    'C':  'Air Filter',   # C xxxx = air (NOT CU which is cabin)
    'CU': 'Cabin Filter',
    'CF': 'Cabin Filter',
    'FP': 'Cabin Filter',
    'WK': 'Fuel Filter',
    'PU': 'Fuel Filter',
    'KC': 'Fuel Filter',
}


def fram_filter_type(fram_code: str) -> str | None:
    code = fram_code.upper()
    for prefix, ftype in sorted(FRAM_PREFIX_TO_TYPE.items(), key=lambda x: -len(x[0])):
        if code.startswith(prefix):
            return ftype
    return None


def mann_filter_type(mann_sku: str) -> str | None:
    pn = mann_sku.upper().strip()
    for prefix, ftype in sorted(MANN_PN_TO_TYPE.items(), key=lambda x: -len(x[0])):
        if pn.startswith(prefix):
            return ftype
    return None


def load_jsonl(path: Path) -> list[dict]:
    records = []
    with open(path, encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    records.append(json.loads(line))
                except json.JSONDecodeError:
                    pass
    return records


def build_wix_to_sku_map(crossrefs_path: Path) -> dict[str, list[str]]:
    """Build {wix_number: [mann_pn, ...]} from wix_crossrefs.jsonl."""
    wix_to_skus: dict[str, list[str]] = defaultdict(list)
    records = load_jsonl(crossrefs_path)
    for rec in records:
        sku = (rec.get('sku') or '').strip()
        for wn in (rec.get('wix') or []):
            wn = str(wn).strip()
            # Normalize: strip XP/MP suffix for matching
            base = wn.replace('XP', '').replace('MP', '').strip()
            if base and sku:
                wix_to_skus[base].append(sku)
            if wn and sku and wn != base:
                wix_to_skus[wn].append(sku)
    log.info(f"WIX→SKU map: {len(wix_to_skus):,} entries")
    return dict(wix_to_skus)


def post_batch(rows: list[dict], dry_run: bool) -> dict:
    if dry_run:
        for r in rows[:3]:
            codes = [f"{c['manufacturer']}:{c['code']}" for c in r['competitor_codes'][:3]]
            log.info(f"  [DRY] {r['mann_sku']} ← {', '.join(codes)}")
        return {'updated': len(rows), 'skipped': 0, 'errors': 0}

    url  = f"{API_BASE}/api/update/competitor-codes"
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
    return {'updated': 0, 'skipped': 0, 'errors': len(rows)}


def run(args):
    global API_KEY
    API_KEY = args.api_key

    for p in [Path(args.fram), Path(args.crossrefs)]:
        if not p.exists():
            log.error(f"File not found: {p}")
            sys.exit(1)

    wix_to_skus  = build_wix_to_sku_map(Path(args.crossrefs))
    fram_records = load_jsonl(Path(args.fram))
    log.info(f"FRAM records loaded: {len(fram_records):,}")

    # Build sku → {brand|code: entry}
    sku_codes: dict[str, dict[str, dict]] = defaultdict(dict)
    matched  = 0
    no_match = 0

    for rec in fram_records:
        fram_code = (rec.get('fram') or '').strip().upper()
        wix_nums  = rec.get('wix') or []

        if not fram_code or not wix_nums:
            continue

        # Find Mann SKUs via WIX bridge
        skus_found = set()
        for wn in wix_nums:
            wn_base = wn.replace('XP', '').replace('MP', '').strip()
            for candidate in [wn, wn_base]:
                for sku in wix_to_skus.get(candidate, []):
                    skus_found.add(sku)

        if not skus_found:
            no_match += 1
            continue

        fram_type = fram_filter_type(fram_code)
        matched += 1
        for sku in skus_found:
            # Reject cross-type assignments (PH=oil must not go to air/cabin/fuel SKU)
            if fram_type and mann_filter_type(sku) and fram_type != mann_filter_type(sku):
                continue
            key = f"FRAM|{fram_code}"
            sku_codes[sku][key] = {'manufacturer': 'FRAM', 'code': fram_code}

    log.info(f"FRAM codes matched to SKUs : {matched:,}")
    log.info(f"FRAM codes with no SKU     : {no_match:,}")
    log.info(f"SKUs to update             : {len(sku_codes):,}")

    rows = [
        {'mann_sku': sku, 'competitor_codes': list(codes.values())}
        for sku, codes in sku_codes.items()
    ]

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
    log.info(f"FRAM Cross-reference Import Summary")
    log.info(f"  FRAM codes matched  : {matched:,}")
    log.info(f"  SKUs updated        : {total_updated:,}")
    log.info(f"  Errors              : {total_errors:,}")


def stats(args):
    wix_to_skus  = build_wix_to_sku_map(Path(args.crossrefs))
    fram_records = load_jsonl(Path(args.fram))

    matched = no_match = total_skus = 0
    for rec in fram_records:
        fram_code = (rec.get('fram') or '').strip().upper()
        wix_nums  = rec.get('wix') or []
        skus = set()
        for wn in wix_nums:
            wn_base = wn.replace('XP', '').replace('MP', '').strip()
            for c in [wn, wn_base]:
                skus.update(wix_to_skus.get(c, []))
        if skus:
            matched += 1
            total_skus += len(skus)
        else:
            no_match += 1

    print(f"\nFRAM Import Stats:")
    print(f"  FRAM codes in file  : {len(fram_records):,}")
    print(f"  With DB match       : {matched:,}  ({matched/max(len(fram_records),1)*100:.1f}%)")
    print(f"  No DB match         : {no_match:,}")
    print(f"  Total SKU updates   : {total_skus:,}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--fram',      default=str(FRAM_FILE),          help='fram_to_wix.jsonl')
    parser.add_argument('--crossrefs', default=str(WIX_CROSSREFS_FILE), help='wix_crossrefs.jsonl')
    parser.add_argument('--api-key',   default='', help='Bearer token')
    parser.add_argument('--dry-run',   action='store_true')
    parser.add_argument('--stats',     action='store_true')
    args = parser.parse_args()

    if args.stats:
        stats(args)
    else:
        run(args)
