#!/usr/bin/env python3
"""
check_mann_references.py
========================
Inspecciona C:/mann/mann_enriched.jsonl y reporta
todas las marcas en el campo 'references'.
"""

import json
from collections import Counter
from pathlib import Path

INPUT = Path(r"C:\mann\mann_enriched.jsonl")

brands   = Counter()
examples = {}
total    = 0
has_refs = 0
sample_printed = False

with open(INPUT, encoding="utf-8") as f:
    for line in f:
        p = json.loads(line)
        total += 1
        refs = p.get("references", [])
        if refs:
            has_refs += 1
            # Print raw structure of first product with references
            if not sample_printed:
                print("=== RAW STRUCTURE (first product with references) ===")
                print(f"SKU: {p['sku']}")
                print(f"references: {json.dumps(refs[:3], indent=2)}")
                print("=" * 60)
                sample_printed = True
            for ref in refs:
                # Try multiple key patterns
                label = (ref.get("label") or ref.get("brand") or
                         ref.get("manufacturer") or ref.get("name") or
                         ref.get("type") or str(list(ref.keys())))
                label = str(label).strip().upper()
                values = (ref.get("value") or ref.get("values") or
                          ref.get("codes") or ref.get("numbers") or
                          [ref.get("code") or ref.get("number") or "?"])
                if isinstance(values, list):
                    for val in values:
                        if val:
                            brands[label] += 1
                            if label not in examples:
                                examples[label] = {"mann_sku": p["sku"], "ref_code": str(val)[:20]}
                else:
                    brands[label] += 1
                    if label not in examples:
                        examples[label] = {"mann_sku": p["sku"], "ref_code": str(values)[:20]}

print(f"\nTotal products  : {total:,}")
print(f"With references : {has_refs:,}")
print(f"Unique brands   : {len(brands):,}")

if brands:
    print(f"\n{'BRAND':<35} {'CODES':>8}  EXAMPLE")
    print("-" * 70)
    for brand, count in brands.most_common(30):
        ex = examples.get(brand, {})
        print(f"  {brand:<33} {count:>8,}  {ex.get('mann_sku','')} → {ex.get('ref_code','')}")

