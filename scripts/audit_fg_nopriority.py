#!/usr/bin/env python3
"""
audit_fg_nopriority.py
=======================
Analyzes the 63 Fleetguard AF codes that have cross-refs but no priority brand.
For each, tries to find an existing EA1/EA2 SKU via OEM brands.

Usage:
    python audit_fg_nopriority.py \\
        --crossrefs C:\\mann\\fg_missing_crossrefs.jsonl \\
        --audit-report C:\\mann\\fg_audit_report.json \\
        --api-key TOKEN \\
        --out-dir C:\\mann

    python audit_fg_nopriority.py ... --dry-run
    python audit_fg_nopriority.py ... --report-only
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

PRIORITY_BRANDS = {'DONALDSON', 'BALDWIN', 'WIX', 'MANN', 'MANN-HUMMEL', 'MANN+HUMMEL'}

OEM_BRANDS = [
    'CUMMINS', 'CATERPILLAR', 'CAT', 'KOMATSU', 'JOHN DEERE', 'DEERE',
    'MOTORCRAFT', 'FORD', 'GMC', 'MITSUBISHI', 'NEW HOLLAND', 'NEW-HOLLAND',
    'CASE', 'CASE-IH', 'CNH', 'AGCO', 'PERKINS', 'JCB', 'KUBOTA',
    'VOLVO', 'SCANIA', 'MERCEDES', 'DAF', 'IVECO', 'MAN',
]

FRAM_BRANDS = {'FRAM', 'CA', 'PH', 'CF', 'G', 'FILTERS'}

# AF codes are Fleetguard air filters - only link to EA1/EA2 SKUs
AIR_FILTER_PREFIXES = ('EA1', 'EA2')


def get_headers(api_key):
    return {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
    }


def search_by_competitor_code(code, api_key, limit=20):
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
                    for c in (p.get('competitor_codes') or []) + (p.get('oem_codes') or []):
                        if isinstance(c, dict) and c.get('code', '').upper() == code.upper():
                            matched.append(p)
                            break
                return matched
            return []
        except requests.RequestException:
            if attempt < 2:
                time.sleep(5 * (attempt + 1))
    return []


def add_competitor_code(sku, existing_codes, af_code, api_key, dry_run):
    already = any(
        isinstance(c, dict) and c.get('code', '').upper() == af_code.upper()
        for c in existing_codes
    )
    if already:
        return False

    new_codes = existing_codes + [{'manufacturer': 'FLEETGUARD', 'code': af_code}]

    if dry_run:
        log.info(f"    [DRY] {sku} <- FLEETGUARD {af_code}")
        return True

    for attempt in range(4):
        try:
            r = requests.post(
                f"{API_BASE}/api/update/sku-codes",
                json={'sku': sku, 'competitor_codes': new_codes},
                headers=get_headers(api_key),
                timeout=60,
            )
            if r.status_code == 200:
                log.info(f"    {sku} <- FLEETGUARD {af_code} OK")
                return True
            if r.status_code in (502, 503, 504):
                wait = 20 * (attempt + 1)
                log.warning(f"    {sku} {r.status_code} cold start -- retrying in {wait}s ({attempt+1}/4)")
                time.sleep(wait)
                continue
            log.error(f"    {sku} update failed ({r.status_code}): {r.text[:120]}")
            return False
        except requests.RequestException as e:
            wait = 20 * (attempt + 1)
            log.warning(f"    {sku} request error: {e} -- retrying in {wait}s")
            time.sleep(wait)
    log.error(f"    {sku} failed after 4 attempts")
    return False


def run(args):
    crossrefs_path = Path(args.crossrefs)
    audit_path     = Path(args.audit_report)
    out_dir        = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    with open(audit_path, encoding='utf-8') as f:
        audit = json.load(f)

    no_priority = audit.get('details', {}).get('NO_PRIORITY', [])
    log.info(f"NO_PRIORITY codes from audit: {len(no_priority)}")

    crossrefs_map = {}
    with open(crossrefs_path, encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            rec = json.loads(line)
            af = (rec.get('source_code') or rec.get('code') or '').strip().upper()
            if af:
                crossrefs_map[af] = rec.get('cross_refs', [])

    brand_freq   = defaultdict(list)
    oem_hits     = []
    sakura_hifi  = []
    mahle_group  = []
    unclassified = []

    for rec in no_priority:
        af     = rec['af'].upper()
        brands = rec.get('brands', [])
        refs   = crossrefs_map.get(af, [])

        for b in brands:
            brand_freq[b].append(af)

        oem_refs = []
        for ref in refs:
            brand = ref.get('brand', '').upper().strip()
            code  = ref.get('code', '').strip().upper()
            if not brand or not code:
                continue
            if any(brand.startswith(ob.upper()) or ob.upper() in brand for ob in OEM_BRANDS):
                oem_refs.append({'brand': brand, 'code': code})

        if oem_refs:
            oem_hits.append({'af': af, 'oem_refs': oem_refs})
        else:
            all_brands = {ref.get('brand', '').upper() for ref in refs}
            if all_brands & {'SAKURA', 'HIFI-FILTER', 'HIFI', 'WAKO', 'RYCO', 'UNION', 'NIPPON'}:
                sakura_hifi.append({'af': af, 'brands': list(all_brands)[:6]})
            elif all_brands & {'MAHLE', 'KNECHT', 'HENGST', 'BOSCH', 'CHAMPION', 'UFI', 'FILTRON', 'PURFLUX'}:
                mahle_group.append({'af': af, 'brands': list(all_brands)[:6]})
            else:
                unclassified.append({'af': af, 'brands': list(all_brands)[:6]})

    log.info(f"\n{'='*65}")
    log.info(f"NO_PRIORITY GROUP ANALYSIS ({len(no_priority)} codes)")
    log.info(f"{'='*65}")
    log.info(f"  OEM-searchable (CUMMINS/CAT/KOMATSU/FORD/etc): {len(oem_hits)}")
    log.info(f"  Aftermarket Asian (SAKURA/HIFI/RYCO):          {len(sakura_hifi)}")
    log.info(f"  European car (MAHLE/KNECHT/HENGST):            {len(mahle_group)}")
    log.info(f"  Unclassified:                                  {len(unclassified)}")

    log.info(f"\nAll brands present (sorted by frequency):")
    for brand, afs in sorted(brand_freq.items(), key=lambda x: -len(x[1])):
        log.info(f"  {brand:<30} {len(afs):>3} AF codes")

    log.info(f"\nOEM-searchable codes:")
    for item in oem_hits:
        refs_str = ', '.join(f"{r['brand']}:{r['code']}" for r in item['oem_refs'][:4])
        log.info(f"  {item['af']:<15} {refs_str}")

    if args.report_only:
        _save_report(out_dir, oem_hits, sakura_hifi, mahle_group, unclassified, brand_freq, [], [])
        return

    log.info(f"\nSearching DB for {len(oem_hits)} OEM-searchable codes...")
    linkable  = []
    not_found = []

    for i, item in enumerate(oem_hits, 1):
        af        = item['af']
        found_sku = None
        via_ref   = None
        existing  = []

        for ref in item['oem_refs']:
            matched = search_by_competitor_code(ref['code'], args.api_key)
            if matched:
                # Only accept EA1/EA2 (air filter) SKUs
                air_match = next(
                    (p for p in matched
                     if any((p.get('sku') or p.get('elimfilters_sku', '')).startswith(pfx)
                            for pfx in AIR_FILTER_PREFIXES)),
                    None,
                )
                if air_match is None:
                    skus = [p.get('sku') or p.get('elimfilters_sku', '') for p in matched]
                    log.warning(f"  [{i}/{len(oem_hits)}] {af} -> {ref['brand']}:{ref['code']} matched {skus} -- none are EA1/EA2, trying next ref")
                    time.sleep(0.25)
                    continue
                product   = air_match
                sku       = product.get('sku') or product.get('elimfilters_sku', '')
                found_sku = sku
                via_ref   = ref
                existing  = product.get('competitor_codes') or []
                break
            time.sleep(0.25)

        if found_sku:
            already = any(
                isinstance(c, dict) and c.get('code', '').upper() == af
                for c in existing
            )
            if already:
                log.info(f"  [{i}/{len(oem_hits)}] {af} -> already linked to {found_sku}")
                linkable.append({'af': af, 'sku': found_sku, 'via': via_ref, 'status': 'already_linked', 'existing': existing})
            else:
                log.info(f"  [{i}/{len(oem_hits)}] {af} -> {found_sku} via {via_ref['brand']}:{via_ref['code']}")
                linkable.append({'af': af, 'sku': found_sku, 'via': via_ref, 'status': 'linkable', 'existing': existing})
        else:
            not_found.append(item)

        time.sleep(0.25)

    log.info(f"\nOEM search results: {len(linkable)} found | {len(not_found)} not found")

    to_link = [l for l in linkable if l['status'] == 'linkable']
    if to_link:
        log.info(f"\nLinking {len(to_link)} AF codes via OEM cross-refs...")
        link_ok = 0
        for item in to_link:
            ok = add_competitor_code(
                item['sku'], item['existing'], item['af'], args.api_key, args.dry_run,
            )
            if ok:
                link_ok += 1
            time.sleep(0.2)
        log.info(f"  Linked: {link_ok}")

    _save_report(out_dir, oem_hits, sakura_hifi, mahle_group, unclassified, brand_freq, linkable, not_found)


def _save_report(out_dir, oem_hits, sakura_hifi, mahle_group, unclassified, brand_freq, linkable, not_found):
    report = {
        'summary': {
            'total_no_priority': len(oem_hits) + len(sakura_hifi) + len(mahle_group) + len(unclassified),
            'oem_searchable': len(oem_hits),
            'aftermarket_asian': len(sakura_hifi),
            'european_car_brands': len(mahle_group),
            'unclassified': len(unclassified),
            'oem_found_in_db': len([l for l in linkable if l['status'] in ('linkable', 'already_linked')]),
            'oem_not_found': len(not_found),
        },
        'brand_frequency': {b: v for b, v in sorted(brand_freq.items(), key=lambda x: -len(x[1]))},
        'oem_searchable': oem_hits,
        'aftermarket_asian': sakura_hifi,
        'european_car_brands': mahle_group,
        'unclassified': unclassified,
        'db_linkable': linkable,
        'db_not_found': not_found,
    }
    report_path = out_dir / 'fg_nopriority_report.json'
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    log.info(f"\nReport -> {report_path}")

    groups_path = out_dir / 'fg_nopriority_groups.txt'
    with open(groups_path, 'w', encoding='utf-8') as f:
        f.write(f"NO_PRIORITY GROUP BREAKDOWN\n{'='*60}\n\n")
        f.write(f"OEM-SEARCHABLE ({len(oem_hits)}) -- CUMMINS, CAT, KOMATSU, FORD, etc.\n")
        for item in oem_hits:
            refs = ', '.join(f"{r['brand']}:{r['code']}" for r in item['oem_refs'][:4])
            f.write(f"  {item['af']:<15} {refs}\n")
        f.write(f"\nAFTERMARKET ASIAN ({len(sakura_hifi)}) -- SAKURA, HIFI-FILTER, RYCO\n")
        for item in sakura_hifi:
            f.write(f"  {item['af']:<15} {', '.join(item['brands'][:4])}\n")
        f.write(f"\nEUROPEAN CAR BRANDS ({len(mahle_group)}) -- MAHLE, KNECHT, HENGST (likely LD)\n")
        for item in mahle_group:
            f.write(f"  {item['af']:<15} {', '.join(item['brands'][:4])}\n")
        f.write(f"\nUNCLASSIFIED ({len(unclassified)})\n")
        for item in unclassified:
            f.write(f"  {item['af']:<15} {', '.join(item['brands'][:4])}\n")
    log.info(f"Groups  -> {groups_path}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--crossrefs',    required=True)
    parser.add_argument('--audit-report', required=True)
    parser.add_argument('--api-key',      required=True)
    parser.add_argument('--out-dir',      default=r'C:\mann')
    parser.add_argument('--dry-run',      action='store_true')
    parser.add_argument('--report-only',  action='store_true')
    args = parser.parse_args()
    run(args)
