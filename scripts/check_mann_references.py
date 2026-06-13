#!/usr/bin/env python3
"""
check_mann_references.py
========================
Inspecciona C:\mann\mann_enriched.jsonl y reporta
todas las marcas que aparecen en el campo 'references'
(cross-references a otras marcas de filtros).
"""

import json
from collections import Counter
from pathlib import Path

INPUT = Path(r"C:\mann\mann_enriched.jsonl")

brands   = Counter()
examples = {}   # brand -> primer ejemplo {mann_sku, ref_code}
total    = 0
has_refs = 0

with open(INPUT, encoding="utf-8") as f:
    for line in f:
        p = json.loads(line)
        total += 1
        refs = p.get("references", [])
        if refs:
            has_refs += 1
            for ref in refs:
                label = ref.get("label", "UNKNOWN").strip().upper()
                for val in ref.get("value", []):
                    brands[label] += 1
                    if label not in examples:
                        examples[label] = {"mann_sku": p["sku"], "ref_code": val}

print(f"\nTotal products  : {total:,}")
print(f"With references : {has_refs:,}")
print(f"Unique brands   : {len(brands):,}")

print(f"\n{'BRAND':<35} {'CODES':>8}  EXAMPLE")
print("-" * 70)
for brand, count in brands.most_common(30):
    ex = examples.get(brand, {})
    print(f"  {brand:<33} {count:>8,}  {ex.get('mann_sku','')} → {ex.get('ref_code','')}")

# Check specifically for LD brands
ld_brands = ["FRAM", "PUROLATOR", "CHAMPION", "BOSCH", "MAHLE", "HENGST",
             "WIX", "NAPA", "BALDWIN", "AC DELCO", "MOTORCRAFT"]
print(f"\n--- LD / AUTOMOTIVE BRANDS ---")
found_any = False
for b in ld_brands:
    if b in brands:
        ex = examples[b]
        print(f"  ✅ {b:<30} {brands[b]:>6,}  {ex['mann_sku']} → {ex['ref_code']}")
        found_any = True
    else:
        print(f"  ❌ {b:<30}      0")
if not found_any:
    print("  Ninguna marca LD encontrada en references.")
