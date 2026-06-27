#!/usr/bin/env python3
"""
analyze_truly_missing.py
========================
Re-analyzes fg_truly_missing.json (output of enrich_fg_crossrefs.py) and
cross-references fg_missing_crossrefs.jsonl to produce a corrected breakdown
of which brands are actually "not found" in the DB.

The old enrich script stored all matches under key 'donaldson' regardless of
actual brand. This script reads the JSONL to get the real brand for each AF.

Usage:
    python analyze_truly_missing.py --crossrefs C:\\mann\\fg_missing_crossrefs.jsonl \
                                    --missing C:\\mann\\fg_truly_missing.json \
                                    --out C:\\mann\\fg_missing_by_brand.json
"""

import argparse
import json
from collections import defaultdict
from pathlib import Path

PRIORITY_BRANDS = ['DONALDSON', 'BALDWIN', 'WIX', 'MANN', 'MANN-HUMMEL']


def find_best_brand(cross_refs: list):
    for brand in PRIORITY_BRANDS:
        for ref in cross_refs:
            if ref.get('brand', '').upper() == brand:
                return ref['brand'], ref['code']
    return None, None


def load_crossrefs(path: Path) -> dict:
    """Build dict: af_code -> list of cross_refs"""
    result = {}
    with open(path, encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line:
                rec = json.loads(line)
                result[rec['source_code'].upper()] = rec.get('cross_refs', [])
    return result


def run(args):
    crossrefs_map = load_crossrefs(Path(args.crossrefs))
    print(f"Loaded cross-refs for {len(crossrefs_map)} AF codes")

    with open(Path(args.missing), encoding='utf-8') as f:
        missing = json.load(f)
    print(f"Loaded {len(missing)} truly_missing records")

    by_brand = defaultdict(list)
    no_crossref = []
    no_priority = []

    for rec in missing:
        af = rec.get('af', '').upper()
        reason = rec.get('reason', '')

        if reason == 'no_crossrefs':
            no_crossref.append(af)
            continue
        if reason == 'no_priority_brand':
            no_priority.append({'af': af, 'brands': rec.get('brands', [])})
            continue
        if reason == 'sku_not_found':
            # Re-derive from crossrefs JSONL for accuracy
            cross_refs = crossrefs_map.get(af, [])
            brand, code = find_best_brand(cross_refs)
            if brand:
                by_brand[brand].append({'af': af, 'code': code})
            else:
                # Fallback: use whatever was stored (old format had 'donaldson' key)
                old_code = rec.get('code') or rec.get('donaldson', '')
                by_brand['UNKNOWN'].append({'af': af, 'code': old_code})

    # Summary
    print(f"\n{'='*60}")
    print(f"SKU_NOT_FOUND breakdown by actual brand:")
    total_not_found = 0
    for brand in PRIORITY_BRANDS + ['UNKNOWN']:
        count = len(by_brand.get(brand, []))
        if count:
            print(f"  {brand:<20} {count:>4} AF codes")
            total_not_found += count
    print(f"  {'TOTAL':<20} {total_not_found:>4}")
    print(f"\nNo cross-refs at all  : {len(no_crossref)}")
    print(f"No priority brand     : {len(no_priority)}")

    # Show sample of non-Donaldson brands for no_priority
    if no_priority:
        all_brands = defaultdict(int)
        for rec in no_priority:
            for b in rec.get('brands', []):
                all_brands[b] += 1
        print(f"\nTop brands in no_priority_brand records:")
        for brand, count in sorted(all_brands.items(), key=lambda x: -x[1])[:15]:
            print(f"  {brand:<30} {count:>4}")

    # Save corrected output
    out = {
        'summary': {
            'total_missing': len(missing),
            'sku_not_found_by_brand': {b: len(v) for b, v in by_brand.items()},
            'no_crossrefs': len(no_crossref),
            'no_priority_brand': len(no_priority),
        },
        'sku_not_found': {b: v for b, v in by_brand.items()},
        'no_crossrefs': no_crossref,
        'no_priority_brand': no_priority,
    }

    out_path = Path(args.out)
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print(f"\nSaved → {out_path}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--crossrefs', required=True, help='fg_missing_crossrefs.jsonl')
    parser.add_argument('--missing',   required=True, help='fg_truly_missing.json')
    parser.add_argument('--out',       required=True, help='Output JSON path')
    args = parser.parse_args()
    run(args)
