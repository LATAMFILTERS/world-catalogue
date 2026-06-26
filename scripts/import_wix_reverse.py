#!/usr/bin/env python3
"""
import_wix_reverse.py — Add FRAM/Bosch/ACDelco cross-refs to LD products via WIX reverse lookup
================================================================================================
Reads C:\\mann\\wix_reverse.jsonl (output of scraper_wix_reverse.py) and
UPDATEs competitor_codes in elimfilters_catalog for each Mann LD SKU that
already has a WIX number mapped.

Flow:
  wix_reverse.jsonl  →  {wix: "51040", refs: [{brand: "FRAM", code: "PH3387A"}, ...]}
  wix_crossrefs.jsonl → {sku: "W 940/21", wix: ["51040"]}  (bridge: WIX → Mann PN)
  DB: find product by wix number in competitor_codes → add FRAM/etc entries

Usage:
    python import_wix_reverse.py
    python import_wix_reverse.py --dry-run
    python import_wix_reverse.py --stats
    python import_wix_reverse.py --api-key TOKEN
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
WIX_REVERSE_FILE   = Path(r"C:\mann\wix_reverse.jsonl")
WIX_CROSSREFS_FILE = Path(r"C:\mann\wix_crossrefs.jsonl")
BATCH              = 50

# Brands to import as competitor_codes (LD consumer market)
ALLOWED_BRANDS = {
    'FRAM', 'FRAM EXTRAGUARD', 'FRAM ULTRA', 'FRAM TOUGH GUARD',
    'BOSCH', 'MAHLE', 'HENGST', 'PURFLUX', 'UFI',
    'AC DELCO', 'ACDELCO', 'MOTORCRAFT',
    'PUROLATOR', 'CHAMPION', 'CHAMPION LABS',
    'PREMIUM GUARD', 'NAPA', 'CARQUEST', 'PRONTO',
    'SAFEWAY', 'SUPERTECH', 'MOBIL 1',
    'SAKURA', 'COOPERS', 'COOPERSFILTERS',
    'HASTINGS', 'STP', 'CHAMP',
    'ROCKHILL FILTERS', 'ROCKHILL FILTERS (OLD)',
}

# Brands to skip — HD equipment or WIX own
SKIP_BRANDS = {
    'WIX', 'WIX EUROPE', 'WIX XP',
    'DITCH WITCH', 'PERKINS', 'INGERSOLL-RAND', 'INGERSOLL RAND',
    'JOHN DEERE', 'CATERPILLAR', 'CAT', 'KOMATSU', 'VOLVO',
    'CUMMINS', 'DETROIT DIESEL', 'INTERNATIONAL',
}


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


def build_wix_to_sku_map(crossrefs_path: Path) -> dict[str, list[str]]:
    """Build {wix_number: [mann_pn, ...]} from wix_crossrefs.jsonl."""
    wix_to_skus: dict[str, list[str]] = defaultdict(list)
    records = load_jsonl(crossrefs_path)
    for rec in records:
        sku = (rec.get('sku') or '').strip()
        for wn in (rec.get('wix') or []):
            wn = str(wn).strip()
            if wn and sku:
                wix_to_skus[wn].append(sku)
    log.info(f"WIX→SKU map: {len(wix_to_skus):,} WIX numbers, "
             f"{sum(len(v) for v in wix_to_skus.values()):,} total SKU links")
    return dict(wix_to_skus)


def post_batch(rows: list[dict], dry_run: bool) -> dict:
    """POST {mann_sku, competitor_codes} to /api/update/competitor-codes."""
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

    rev_path   = Path(args.reverse)
    xref_path  = Path(args.crossrefs)

    for p in [rev_path, xref_path]:
        if not p.exists():
            log.error(f"File not found: {p}")
            sys.exit(1)

    # Build WIX→SKU bridge
    wix_to_skus = build_wix_to_sku_map(xref_path)

    # Load reverse lookup results
    reverse_records = load_jsonl(rev_path)
    log.info(f"Loaded {len(reverse_records):,} WIX reverse records")

    # Build per-SKU competitor code additions
    # sku → {brand|code: {manufacturer, code}}
    sku_refs: dict[str, dict[str, dict]] = defaultdict(dict)
    stats_brands: dict[str, int] = defaultdict(int)
    wix_matched = 0
    wix_no_skus = 0

    for rec in reverse_records:
        wix_num = str(rec.get('wix', '')).strip()
        refs    = rec.get('refs') or []

        if not wix_num:
            continue

        skus = wix_to_skus.get(wix_num, [])
        if not skus:
            wix_no_skus += 1
            continue

        wix_matched += 1
        for ref in refs:
            brand = (ref.get('brand') or '').strip().upper()
            code  = (ref.get('code') or '').strip().upper()

            if not brand or not code:
                continue
            if brand in SKIP_BRANDS:
                continue
            if brand not in ALLOWED_BRANDS:
                continue

            for sku in skus:
                key = f"{brand}|{code}"
                sku_refs[sku][key] = {'manufacturer': brand, 'code': code}
                stats_brands[brand] += 1

    log.info(f"WIX numbers matched to SKUs : {wix_matched:,}")
    log.info(f"WIX numbers with no SKU     : {wix_no_skus:,}")
    log.info(f"SKUs to update              : {len(sku_refs):,}")
    log.info(f"Top brands found:")
    for brand, count in sorted(stats_brands.items(), key=lambda x: -x[1])[:10]:
        log.info(f"  {brand:<30} {count:>5,}")

    # Build rows
    rows = []
    for sku, codes_dict in sku_refs.items():
        rows.append({
            'mann_sku':        sku,
            'competitor_codes': list(codes_dict.values()),
        })

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
        log.info(f"  [{done}/{len(rows)}] updated={result.get('updated', 0)} "
                 f"err={result.get('errors', 0)}")
        if i + BATCH < len(rows):
            time.sleep(0.2)

    log.info(f"\n{'='*55}")
    log.info(f"WIX Reverse Import Summary")
    log.info(f"  SKUs updated    : {total_updated:,}")
    log.info(f"  Errors          : {total_errors:,}")
    log.info(f"  Brands added    : {len(stats_brands):,}")


def stats(args):
    rev_path  = Path(args.reverse)
    xref_path = Path(args.crossrefs)

    wix_to_skus = build_wix_to_sku_map(xref_path)
    records     = load_jsonl(rev_path)

    from collections import Counter
    brand_ctr  = Counter()
    with_refs  = 0
    skus_hit   = set()

    for rec in records:
        wix_num = str(rec.get('wix', '')).strip()
        refs    = [r for r in (rec.get('refs') or [])
                   if r.get('brand', '').upper() in ALLOWED_BRANDS]
        if refs:
            with_refs += 1
            for r in refs:
                brand_ctr[r['brand'].upper()] += 1
            for sku in wix_to_skus.get(wix_num, []):
                skus_hit.add(sku)

    total = len(records)
    print(f"\nWIX Reverse Stats — {rev_path.name}")
    print(f"  WIX records processed : {total:,}")
    print(f"  With LD brand refs    : {with_refs:,}  ({with_refs/max(total,1)*100:.1f}%)")
    print(f"  Mann SKUs to update   : {len(skus_hit):,}")
    print(f"\n  By brand (top 15):")
    for brand, count in brand_ctr.most_common(15):
        print(f"    {brand:<30} {count:>6,}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--reverse',   default=str(WIX_REVERSE_FILE),   help='wix_reverse.jsonl')
    parser.add_argument('--crossrefs', default=str(WIX_CROSSREFS_FILE), help='wix_crossrefs.jsonl')
    parser.add_argument('--api-key',   default='', help='Bearer token')
    parser.add_argument('--dry-run',   action='store_true')
    parser.add_argument('--stats',     action='store_true')
    args = parser.parse_args()

    if args.stats:
        stats(args)
    else:
        run(args)
