#!/usr/bin/env python3
"""
enrich_fg_crossrefs.py
======================
Reads fg_missing_crossrefs.jsonl (output of scraper_airfilter_crossref.py),
finds each AF number's Donaldson equivalent, then either:
  A) Adds the AF code as competitor_code to the existing SKU (if Donaldson SKU exists)
  B) Reports it as truly missing (no Donaldson equivalent in DB)

Usage:
    python enrich_fg_crossrefs.py --crossrefs C:\\mann\\fg_missing_crossrefs.jsonl --api-key TOKEN
    python enrich_fg_crossrefs.py --crossrefs C:\\mann\\fg_missing_crossrefs.jsonl --api-key TOKEN --dry-run
"""

import argparse
import json
import logging
import time
from pathlib import Path

import requests

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger(__name__)

API_BASE = "https://elimfilters-search-pro.onrender.com"

PRIORITY_BRANDS = ['DONALDSON', 'BALDWIN', 'WIX', 'MANN', 'MANN-HUMMEL']


def get_headers(api_key):
    return {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
    }


def find_donaldson_code(cross_refs: list) -> str | None:
    """Extract best competitor code — Donaldson first, then Baldwin/WIX."""
    for brand in PRIORITY_BRANDS:
        for ref in cross_refs:
            if ref.get('brand', '').upper() == brand:
                return ref['brand'], ref['code']
    return None, None


def search_sku_by_code(code: str, api_key: str) -> dict | None:
    """Search DB for a SKU that has this code as competitor_code."""
    for attempt in range(3):
        try:
            r = requests.get(
                f"{API_BASE}/api/search",
                params={'q': code, 'limit': 5},
                headers=get_headers(api_key),
                timeout=45,
            )
            if r.status_code != 200:
                return None
            products = r.json().get('products', [])
            for p in products:
                for c in (p.get('competitor_codes') or []):
                    if isinstance(c, dict) and c.get('code', '').upper() == code.upper():
                        return p
            return None
        except requests.RequestException:
            if attempt < 2:
                time.sleep(5 * (attempt + 1))
            else:
                return None


def add_competitor_code(sku: str, existing_codes: list, af_code: str, api_key: str, dry_run: bool) -> bool:
    """Add AF code to existing competitor_codes if not already present."""
    already = any(
        isinstance(c, dict) and c.get('code', '').upper() == af_code.upper()
        for c in existing_codes
    )
    if already:
        return False  # already there

    new_codes = existing_codes + [{'manufacturer': 'FLEETGUARD', 'code': af_code}]

    if dry_run:
        log.info(f"  [DRY] {sku} ← FLEETGUARD {af_code}")
        return True

    r = requests.post(
        f"{API_BASE}/api/update/sku-codes",
        json={'sku': sku, 'competitor_codes': new_codes},
        headers=get_headers(api_key),
        timeout=30,
    )
    if r.status_code == 200:
        log.info(f"  {sku} ← FLEETGUARD {af_code} ✓")
        return True
    log.error(f"  {sku} update failed ({r.status_code}): {r.text[:100]}")
    return False


def run(args):
    path = Path(args.crossrefs)
    records = []
    with open(path, encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line:
                records.append(json.loads(line))

    log.info(f"Loaded {len(records)} records from {path.name}")

    stats = {
        'no_crossrefs': 0,
        'no_donaldson': 0,
        'sku_not_found': 0,
        'already_linked': 0,
        'linked': 0,
    }

    truly_missing = []  # AF codes with no match at all

    for i, rec in enumerate(records):
        af_code = rec.get('source_code', '')
        cross_refs = rec.get('cross_refs', [])

        if not cross_refs:
            stats['no_crossrefs'] += 1
            truly_missing.append({'af': af_code, 'reason': 'no_crossrefs'})
            continue

        brand, code = find_donaldson_code(cross_refs)
        if not code:
            stats['no_donaldson'] += 1
            truly_missing.append({'af': af_code, 'reason': 'no_priority_brand', 'brands': list({r['brand'] for r in cross_refs})[:5]})
            continue

        product = search_sku_by_code(code, args.api_key)
        if not product:
            stats['sku_not_found'] += 1
            truly_missing.append({'af': af_code, 'reason': 'sku_not_found', 'donaldson': code})
            if (i + 1) % 50 == 0:
                log.info(f"  [{i+1}/{len(records)}] linked={stats['linked']} not_found={stats['sku_not_found']}")
            time.sleep(0.2)
            continue

        sku = product.get('sku') or product.get('elimfilters_sku', '')
        existing = product.get('competitor_codes') or []

        result = add_competitor_code(sku, existing, af_code, args.api_key, args.dry_run)
        if result:
            stats['linked'] += 1
        else:
            stats['already_linked'] += 1

        if (i + 1) % 50 == 0:
            log.info(f"  [{i+1}/{len(records)}] linked={stats['linked']} not_found={stats['sku_not_found']} already={stats['already_linked']}")

        time.sleep(0.25)

    # Save truly missing for follow-up
    missing_path = path.parent / 'fg_truly_missing.json'
    with open(missing_path, 'w', encoding='utf-8') as f:
        json.dump(truly_missing, f, ensure_ascii=False, indent=2)

    log.info(f"\n{'='*55}")
    log.info(f"Results:")
    log.info(f"  Linked to existing SKU : {stats['linked']}")
    log.info(f"  Already linked         : {stats['already_linked']}")
    log.info(f"  SKU not found in DB    : {stats['sku_not_found']}")
    log.info(f"  No priority brand      : {stats['no_donaldson']}")
    log.info(f"  No cross-refs at all   : {stats['no_crossrefs']}")
    log.info(f"  Truly missing → {missing_path}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--crossrefs', required=True, help='Path to fg_missing_crossrefs.jsonl')
    parser.add_argument('--api-key',   required=True)
    parser.add_argument('--dry-run',   action='store_true')
    args = parser.parse_args()
    run(args)
