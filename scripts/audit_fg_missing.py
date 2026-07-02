#!/usr/bin/env python3
"""
audit_fg_missing.py
===================
Auditoría completa de los AF numbers de Fleetguard que no están en la DB.

Problema detectado: enrich_fg_crossrefs.py buscaba solo por competitor_code exacto
dentro de los resultados del search. Si el SKU existe pero el search no devuelve
ese resultado en los top-5, se reportaba como "not found" incorrectamente.

Este script hace una búsqueda más robusta:
1. Busca el código primario (P-series Donaldson, PA-series Baldwin, etc.)
2. Si no hay match exacto en competitor_codes, busca también por SKU/nombre
3. Clasifica cada AF en una de 4 categorías:
   A) LINKED       - Ya está como competitor_code en la DB
   B) FOUND_NO_FG  - SKU existe pero sin el AF code → agregar
   C) NO_SKU       - Código primario genuinamente no está en la DB
   D) NO_CROSSREF  - Sin cross-ref en airfilter-crossreference.com

Produce:
  fg_audit_report.json  - Reporte completo por categoría
  fg_to_link.jsonl      - Los que se pueden agregar ahora (categoría B)

Usage:
    python audit_fg_missing.py \\
        --crossrefs C:\\mann\\fg_missing_crossrefs.jsonl \\
        --api-key TOKEN \\
        --out-dir C:\\mann

    python audit_fg_missing.py \\
        --crossrefs C:\\mann\\fg_missing_crossrefs.jsonl \\
        --api-key TOKEN \\
        --out-dir C:\\mann \\
        --only-missing   # Solo re-procesa los que fallaron antes
"""

import argparse
import json
import logging
import time
from collections import defaultdict
from pathlib import Path

import requests

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger(__name__)

API_BASE = "https://elimfilters-search-pro.onrender.com"

PRIORITY_BRANDS = ['DONALDSON', 'BALDWIN', 'WIX', 'MANN', 'MANN-HUMMEL']

# Clasificación de series por marca
SERIES_BRAND = {
    'P':   'DONALDSON',   # P527682, P181059, etc.
    'PA':  'BALDWIN',     # PA1787, PA4723, etc.
    'WA':  'BALDWIN',     # WA, algunas Baldwin
    'RS':  'BALDWIN',     # RS series
    'B':   'BALDWIN',     # B-series Baldwin
    'PT':  'BALDWIN',     # PT-series
    'CA':  'FRAM',        # LD only — NEVER on HD SKUs
    'PH':  'FRAM',        # LD only — NEVER on HD SKUs
    'CF':  'FRAM',        # LD only — NEVER on HD SKUs
}


def get_headers(api_key):
    return {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
    }


def classify_code(code: str) -> str:
    """Identify brand from code prefix."""
    code_upper = code.upper().strip()
    for prefix, brand in sorted(SERIES_BRAND.items(), key=lambda x: -len(x[0])):
        if code_upper.startswith(prefix):
            return brand
    # Numeric only = probably WIX
    if code_upper.replace('-', '').replace('/', '').isdigit():
        return 'WIX'
    return 'UNKNOWN'


def find_best_ref(cross_refs: list) -> tuple:
    """Return (brand, code) of best available cross-ref, priority order."""
    for brand in PRIORITY_BRANDS:
        for ref in cross_refs:
            if ref.get('brand', '').upper() == brand:
                return ref['brand'].upper(), ref['code'].upper()
    return None, None


def search_by_competitor_code(code: str, api_key: str, limit: int = 10) -> list:
    """
    Search DB and return all products that have this exact competitor_code.
    Uses higher limit than original to reduce false negatives.
    """
    for attempt in range(3):
        try:
            r = requests.get(
                f"{API_BASE}/api/search",
                params={'q': code, 'limit': limit},
                headers=get_headers(api_key),
                timeout=45,
            )
            if r.status_code == 200:
                products = r.json().get('products', [])
                matched = []
                for p in products:
                    for c in (p.get('competitor_codes') or []):
                        if isinstance(c, dict) and c.get('code', '').upper() == code.upper():
                            matched.append(p)
                            break
                return matched
            return []
        except requests.RequestException:
            if attempt < 2:
                time.sleep(5 * (attempt + 1))
    return []


def search_by_sku(code: str, api_key: str) -> dict | None:
    """Check if this code IS a SKU directly."""
    for attempt in range(3):
        try:
            r = requests.get(
                f"{API_BASE}/api/product/{code.upper()}",
                headers=get_headers(api_key),
                timeout=45,
            )
            if r.status_code == 200:
                return r.json()
            return None
        except requests.RequestException:
            if attempt < 2:
                time.sleep(5 * (attempt + 1))
    return None


def add_competitor_code(sku: str, existing_codes: list, af_code: str, api_key: str, dry_run: bool) -> bool:
    """Add FLEETGUARD AF code to existing competitor_codes."""
    already = any(
        isinstance(c, dict) and c.get('code', '').upper() == af_code.upper()
        for c in existing_codes
    )
    if already:
        return False

    new_codes = existing_codes + [{'manufacturer': 'FLEETGUARD', 'code': af_code}]

    if dry_run:
        log.info(f"    [DRY] {sku} ← FLEETGUARD {af_code}")
        return True

    r = requests.post(
        f"{API_BASE}/api/update/sku-codes",
        json={'sku': sku, 'competitor_codes': new_codes},
        headers=get_headers(api_key),
        timeout=30,
    )
    if r.status_code == 200:
        log.info(f"    {sku} ← FLEETGUARD {af_code} ✓")
        return True
    log.error(f"    {sku} update failed ({r.status_code}): {r.text[:100]}")
    return False


def run(args):
    crossrefs_path = Path(args.crossrefs)
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    # Load all cross-refs
    all_records = []
    with open(crossrefs_path, encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line:
                all_records.append(json.loads(line))
    log.info(f"Loaded {len(all_records)} records from {crossrefs_path.name}")

    # Categories
    results = {
        'LINKED':      [],   # AF already in DB as competitor_code
        'FOUND_NO_FG': [],   # Primary code found in DB, AF not yet linked → can add
        'NO_SKU':      [],   # Primary code genuinely not in DB
        'NO_CROSSREF': [],   # No cross-refs on airfilter-crossreference.com
        'NO_PRIORITY': [],   # Cross-refs exist but no priority brand
        'FRAM_SKIP':   [],   # Only FRAM codes — LD only, never on HD SKUs
    }

    brand_stats = defaultdict(lambda: {'found': 0, 'not_found': 0})
    stats = defaultdict(int)

    total = len(all_records)

    for i, rec in enumerate(all_records):
        af_code = rec.get('source_code', '').upper()
        cross_refs = rec.get('cross_refs', [])

        if not cross_refs:
            results['NO_CROSSREF'].append({'af': af_code})
            stats['no_crossref'] += 1
            if (i + 1) % 100 == 0:
                log.info(f"  [{i+1}/{total}] linked={stats['linked']} found_no_fg={stats['found_no_fg']} no_sku={stats['no_sku']}")
            continue

        brand, code = find_best_ref(cross_refs)

        if not brand:
            # Check if only FRAM codes available
            all_brands = {r.get('brand', '').upper() for r in cross_refs}
            fram_brands = {'FRAM', 'CA', 'PH', 'CF', 'G'}
            if all_brands and all_brands.issubset(fram_brands | {'FILTERS', ''}):
                results['FRAM_SKIP'].append({'af': af_code, 'brands': list(all_brands)[:5]})
                stats['fram_skip'] += 1
            else:
                results['NO_PRIORITY'].append({
                    'af': af_code,
                    'brands': list({r['brand'] for r in cross_refs})[:8]
                })
                stats['no_priority'] += 1
            continue

        # FRAM codes are LD-only — never on HD EA1 SKUs
        detected_brand = classify_code(code)
        if detected_brand == 'FRAM':
            results['FRAM_SKIP'].append({'af': af_code, 'code': code, 'brands': [brand]})
            stats['fram_skip'] += 1
            continue

        # Search DB for this competitor code
        matched_products = search_by_competitor_code(code, args.api_key, limit=10)

        if matched_products:
            product = matched_products[0]
            sku = product.get('sku') or product.get('elimfilters_sku', '')
            existing = product.get('competitor_codes') or []

            # Check if AF is already linked
            already_fg = any(
                isinstance(c, dict) and c.get('code', '').upper() == af_code
                for c in existing
            )
            if already_fg:
                results['LINKED'].append({'af': af_code, 'sku': sku, 'via': f'{brand}:{code}'})
                stats['linked'] += 1
            else:
                results['FOUND_NO_FG'].append({
                    'af': af_code,
                    'sku': sku,
                    'primary_brand': brand,
                    'primary_code': code,
                    'existing_codes': existing,
                })
                stats['found_no_fg'] += 1
                log.info(f"  FOUND: {af_code} → {sku} (via {brand}:{code})")
            brand_stats[brand]['found'] += 1
        else:
            results['NO_SKU'].append({
                'af': af_code,
                'brand': brand,
                'code': code,
                'code_series': classify_code(code),
                'all_brands': list({r['brand'] for r in cross_refs})[:5],
            })
            stats['no_sku'] += 1
            brand_stats[brand]['not_found'] += 1

        if (i + 1) % 50 == 0:
            log.info(
                f"  [{i+1}/{total}] linked={stats['linked']} "
                f"found_no_fg={stats['found_no_fg']} no_sku={stats['no_sku']} "
                f"no_crossref={stats['no_crossref']}"
            )
        time.sleep(0.25)

    # ── Apply FOUND_NO_FG links ───────────────────────────────────────────────
    if results['FOUND_NO_FG'] and not args.report_only:
        log.info(f"\nLinking {len(results['FOUND_NO_FG'])} AF codes to existing SKUs...")
        link_ok = 0
        link_skip = 0
        for item in results['FOUND_NO_FG']:
            ok = add_competitor_code(
                item['sku'],
                item['existing_codes'],
                item['af'],
                args.api_key,
                args.dry_run,
            )
            if ok:
                link_ok += 1
            else:
                link_skip += 1
            time.sleep(0.25)
        log.info(f"  Linked: {link_ok} | Already present: {link_skip}")
        stats['newly_linked'] = link_ok
    elif args.report_only:
        log.info(f"\n[REPORT-ONLY] Would link {len(results['FOUND_NO_FG'])} AF codes")

    # ── Save report ───────────────────────────────────────────────────────────
    report = {
        'summary': {
            'total_processed': total,
            'LINKED':      len(results['LINKED']),
            'FOUND_NO_FG': len(results['FOUND_NO_FG']),
            'NO_SKU':      len(results['NO_SKU']),
            'NO_CROSSREF': len(results['NO_CROSSREF']),
            'NO_PRIORITY': len(results['NO_PRIORITY']),
            'FRAM_SKIP':   len(results['FRAM_SKIP']),
            'newly_linked_this_run': stats.get('newly_linked', 0),
        },
        'brand_stats': {b: dict(v) for b, v in brand_stats.items()},
        'no_sku_by_brand': {},
        'details': results,
    }

    # Group NO_SKU by brand
    by_brand = defaultdict(list)
    for item in results['NO_SKU']:
        by_brand[item['brand']].append(item['code'])
    report['no_sku_by_brand'] = {b: {'count': len(v), 'codes': v} for b, v in by_brand.items()}

    report_path = out_dir / 'fg_audit_report.json'
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    # Save linkable records as JSONL for re-run if needed
    linkable_path = out_dir / 'fg_to_link.jsonl'
    with open(linkable_path, 'w', encoding='utf-8') as f:
        for item in results['FOUND_NO_FG']:
            f.write(json.dumps(item, ensure_ascii=False) + '\n')

    # Save genuinely missing (NO_SKU) as plain text per brand for manual review
    for brand, data in report['no_sku_by_brand'].items():
        brand_safe = brand.replace('/', '_').replace('-', '_')
        txt_path = out_dir / f'fg_no_sku_{brand_safe.lower()}.txt'
        with open(txt_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(data['codes']))
        log.info(f"  {brand}: {data['count']} codes → {txt_path.name}")

    # ── Print summary ─────────────────────────────────────────────────────────
    log.info(f"\n{'='*65}")
    log.info(f"AUDIT COMPLETE — {total} Fleetguard AF numbers processed")
    log.info(f"{'='*65}")
    log.info(f"  Already linked (AF in DB)      : {len(results['LINKED'])}")
    log.info(f"  Found & linked this run        : {stats.get('newly_linked', 0)}")
    log.info(f"  Found but not linked (dry-run) : {len(results['FOUND_NO_FG']) if args.dry_run else 0}")
    log.info(f"  Primary code not in DB (NO_SKU): {len(results['NO_SKU'])}")
    log.info(f"  No cross-refs available        : {len(results['NO_CROSSREF'])}")
    log.info(f"  No priority brand in cross-refs: {len(results['NO_PRIORITY'])}")
    log.info(f"  FRAM-only (LD, skipped for HD) : {len(results['FRAM_SKIP'])}")
    log.info(f"")
    log.info(f"  NO_SKU breakdown by brand:")
    for brand, data in report['no_sku_by_brand'].items():
        log.info(f"    {brand:<20} {data['count']:>4} codes")
    log.info(f"")
    log.info(f"  Brand search stats:")
    for brand in PRIORITY_BRANDS:
        bs = brand_stats.get(brand, {})
        if bs:
            log.info(f"    {brand:<20} found={bs.get('found',0):>3}  not_found={bs.get('not_found',0):>3}")
    log.info(f"")
    log.info(f"  Report → {report_path}")
    log.info(f"  Linkable → {linkable_path}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Audit Fleetguard AF missing codes against DB')
    parser.add_argument('--crossrefs',   required=True, help='fg_missing_crossrefs.jsonl')
    parser.add_argument('--api-key',     required=True)
    parser.add_argument('--out-dir',     default=r'C:\mann', help='Output directory')
    parser.add_argument('--dry-run',     action='store_true', help='Simulate linking, no DB writes')
    parser.add_argument('--report-only', action='store_true', help='Only audit, never link (even without --dry-run)')
    args = parser.parse_args()
    run(args)
