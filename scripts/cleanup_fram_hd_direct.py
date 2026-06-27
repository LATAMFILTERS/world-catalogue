#!/usr/bin/env python3
"""
cleanup_fram_hd_direct.py — Direct FRAM code removal from HD SKUs
==================================================================
Uses GET /api/products (or search) to fetch each HD SKU, then
PATCHes competitor_codes to remove FRAM entries.

Since /api/cleanup/fram-hd-force may not be deployed yet,
this script works with existing endpoints only.

Usage:
    python cleanup_fram_hd_direct.py --api-key TOKEN
    python cleanup_fram_hd_direct.py --api-key TOKEN --dry-run
    python cleanup_fram_hd_direct.py --api-key TOKEN --sku EL80047
"""

import argparse
import json
import logging
import re
import time
import requests

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger(__name__)

API_BASE = "https://elimfilters-search-pro.onrender.com"

HD_PREFIXES = ('EL8', 'EA1', 'EC1', 'EF9', 'EH6', 'EF9', 'ED4', 'EM9', 'ES9', 'EW7')
FRAM_CODE_RE = re.compile(r'^(PH|CA|CF|G)\d', re.IGNORECASE)


def get_headers(api_key):
    return {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
    }


def fetch_product(sku: str, api_key: str) -> dict | None:
    """Fetch a single product by SKU using search endpoint."""
    url = f"{API_BASE}/api/search"
    resp = requests.get(url, params={'q': sku, 'limit': 5}, headers=get_headers(api_key), timeout=30)
    if resp.status_code != 200:
        log.error(f"  Search failed: HTTP {resp.status_code}: {resp.text[:200]}")
        return None
    results = resp.json()
    items = results if isinstance(results, list) else results.get('results', results.get('products', []))
    for item in items:
        if (item.get('sku') or '').upper() == sku.upper():
            return item
    return None


def remove_fram_from_hd(product: dict, dry_run: bool, api_key: str) -> bool:
    """Remove FRAM codes from a HD product. Returns True if cleaned."""
    sku = product.get('sku', '')
    codes = product.get('competitor_codes') or []
    if not isinstance(codes, list):
        return False

    cleaned = []
    removed = []
    for c in codes:
        if isinstance(c, dict):
            mfr = (c.get('manufacturer') or '').upper().strip()
            code = (c.get('code') or '').upper().strip()
        elif isinstance(c, str):
            mfr = ''
            code = c.upper().strip()
        else:
            cleaned.append(c)
            continue

        is_fram = (mfr == 'FRAM') or (not mfr and FRAM_CODE_RE.match(code))
        if is_fram:
            removed.append(c)
        else:
            cleaned.append(c)

    if not removed:
        return False

    log.info(f"  {sku}: removing {len(removed)} FRAM entries: {[c.get('code','?') if isinstance(c,dict) else c for c in removed[:5]]}")

    if dry_run:
        return True

    url = f"{API_BASE}/api/update/product-codes"
    # Try the direct update endpoint
    resp = requests.post(
        url,
        json={'sku': sku, 'competitor_codes': cleaned},
        headers=get_headers(api_key),
        timeout=30,
    )
    if resp.status_code == 200:
        log.info(f"  {sku}: cleaned OK")
        return True
    # Fallback: try PATCH or PUT
    log.warning(f"  {sku}: update-product-codes failed ({resp.status_code}), trying patch-codes...")
    url2 = f"{API_BASE}/api/patch/competitor-codes"
    resp2 = requests.post(
        url2,
        json={'sku': sku, 'competitor_codes': cleaned},
        headers=get_headers(api_key),
        timeout=30,
    )
    if resp2.status_code == 200:
        log.info(f"  {sku}: patched OK via patch endpoint")
        return True
    log.error(f"  {sku}: all update attempts failed. Last: {resp2.status_code} {resp2.text[:150]}")
    return False


def run_single_sku(sku: str, api_key: str, dry_run: bool):
    log.info(f"Fetching {sku}...")
    product = fetch_product(sku, api_key)
    if not product:
        log.error(f"Product {sku} not found via search API")
        return
    log.info(f"Found: {product.get('sku')} | duty={product.get('duty')} | "
             f"codes={json.dumps(product.get('competitor_codes', [])[:5])}")
    result = remove_fram_from_hd(product, dry_run=dry_run, api_key=api_key)
    if not result:
        log.info(f"No FRAM codes found on {sku} — nothing to clean")


def run_batch(api_key: str, dry_run: bool):
    """Fetch all HD products page by page and clean FRAM codes."""
    page = 1
    page_size = 100
    total_cleaned = 0

    while True:
        url = f"{API_BASE}/api/products"
        resp = requests.get(
            url,
            params={'duty': 'HEAVY_DUTY', 'page': page, 'limit': page_size},
            headers=get_headers(api_key),
            timeout=60,
        )
        if resp.status_code != 200:
            log.error(f"Products endpoint failed: {resp.status_code} {resp.text[:200]}")
            break

        data = resp.json()
        items = data if isinstance(data, list) else data.get('products', data.get('results', []))
        if not items:
            break

        log.info(f"Page {page}: {len(items)} HD products")
        for product in items:
            sku = product.get('sku', '')
            if not any(sku.startswith(p) for p in HD_PREFIXES):
                continue
            codes = product.get('competitor_codes') or []
            has_fram = any(
                (isinstance(c, dict) and (c.get('manufacturer','').upper() == 'FRAM' or
                 (not c.get('manufacturer') and FRAM_CODE_RE.match(c.get('code','')))))
                or (isinstance(c, str) and FRAM_CODE_RE.match(c))
                for c in codes
            )
            if has_fram:
                remove_fram_from_hd(product, dry_run=dry_run, api_key=api_key)
                total_cleaned += 1
                time.sleep(0.1)

        if len(items) < page_size:
            break
        page += 1

    log.info(f"\nBatch cleanup done. HD SKUs with FRAM codes found: {total_cleaned}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--api-key', required=True)
    parser.add_argument('--sku', default='', help='Clean a specific SKU only')
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()

    if args.sku:
        run_single_sku(args.sku.upper(), args.api_key, args.dry_run)
    else:
        run_batch(args.api_key, args.dry_run)
