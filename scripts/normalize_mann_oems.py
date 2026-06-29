#!/usr/bin/env python3
"""
normalize_mann_oems.py
======================
Lee C:\\mann\\mann_oem_master.csv
Normaliza los códigos OEM
Escribe C:\\mann\\mann_oem_master_clean.csv

Reglas de normalización:
    5W-6017          → 5W6017
    5W 6017          → 5W6017
    001 184 96 01    → 0011849601
    A 001 184 96 01  → A0011849601
    Elimina: espacios, guiones, slashes, puntos, paréntesis
    Convierte a UPPERCASE
"""

import csv
import re
import sys
from pathlib import Path

INPUT  = Path(r"C:\mann\mann_oem_master.csv")
OUTPUT = Path(r"C:\mann\mann_oem_master_clean.csv")

_STRIP = re.compile(r'[\s\-/\.\(\)]')


def normalize_oem(code: str) -> str:
    if not code:
        return ""
    return _STRIP.sub("", str(code)).upper().strip()


def main():
    if not INPUT.exists():
        print(f"ERROR: {INPUT} not found")
        sys.exit(1)

    # Detect columns
    with open(INPUT, encoding="utf-8", newline="") as f:
        sample = csv.DictReader(f)
        cols = sample.fieldnames or []
    print(f"Columns detected: {cols}")

    # Determine OEM code column name
    oem_col = None
    for candidate in ("oem_code", "oem_number", "code", "part_number"):
        if candidate in cols:
            oem_col = candidate
            break
    if not oem_col:
        print(f"ERROR: cannot find OEM code column. Found: {cols}")
        sys.exit(1)
    print(f"Using OEM column: '{oem_col}'")

    total = skipped = written = 0

    with open(INPUT, encoding="utf-8", newline="") as fin, \
         open(OUTPUT, "w", encoding="utf-8", newline="") as fout:

        reader = csv.DictReader(fin)
        fieldnames = ["sku", "segment", "oem_brand", "oem_original", "oem_normalized"]
        writer = csv.DictWriter(fout, fieldnames=fieldnames)
        writer.writeheader()

        for row in reader:
            total += 1
            original   = row.get(oem_col, "").strip()
            normalized = normalize_oem(original)

            if not normalized or len(normalized) < 3:
                skipped += 1
                continue

            writer.writerow({
                "sku":            row.get("sku", "").strip(),
                "segment":        row.get("segment", "").strip().upper(),
                "oem_brand":      row.get("oem_brand", "").strip().upper(),
                "oem_original":   original,
                "oem_normalized": normalized,
            })
            written += 1

            if written % 10_000 == 0:
                print(f"  {written:,} rows written...")

    print(f"\n✅ Done")
    print(f"   Input rows  : {total:,}")
    print(f"   Skipped     : {skipped:,}  (empty / too short)")
    print(f"   Output rows : {written:,}")
    print(f"   Output file : {OUTPUT}")


if __name__ == "__main__":
    main()
