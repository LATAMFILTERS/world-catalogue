#!/usr/bin/env python3
"""
load_mann_oems_postgres.py
==========================
Crea mann_oem_clean y carga C:/mann/mann_oem_master_clean.csv
via API (Node.js -> Render.com PostgreSQL, evita psycopg2 SSL en Windows).
"""

import csv
import json
import sys
import time
import urllib.request
import urllib.error
from pathlib import Path

INPUT      = Path(r"C:\mann\mann_oem_master_clean.csv")
API_BASE   = "https://elimfilters-search-pro.onrender.com"
API_KEY    = "elim2026"
BATCH_SIZE = 1000


def api_post(path, payload, timeout=120):
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req  = urllib.request.Request(
        f"{API_BASE}{path}",
        data=data,
        headers={"Content-Type": "application/json; charset=utf-8"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main():
    if not INPUT.exists():
        print(f"ERROR: {INPUT} not found — run normalize_mann_oems.py first")
        sys.exit(1)

    rows = []
    with open(INPUT, encoding="utf-8", newline="") as f:
        for row in csv.DictReader(f):
            rows.append({
                "sku":            row["sku"],
                "segment":        row["segment"]      or None,
                "oem_brand":      row["oem_brand"]    or None,
                "oem_original":   row["oem_original"] or None,
                "oem_normalized": row["oem_normalized"],
            })
    print(f"Loaded {len(rows):,} rows from CSV")

    print("Setting up mann_oem_clean table...")
    result = api_post("/api/oem/mann-setup", {"key": API_KEY})
    print(f"  Table ready. Existing rows: {result.get('existing_rows', 0):,}")

    total_inserted = 0
    for i in range(0, len(rows), BATCH_SIZE):
        batch = rows[i : i + BATCH_SIZE]
        result = api_post("/api/oem/mann-load-batch", {"key": API_KEY, "rows": batch})
        total_inserted += result.get("inserted", 0)
        done = min(i + BATCH_SIZE, len(rows))
        print(f"  {done:,} / {len(rows):,}  (inserted: {result.get('inserted', 0)})")
        time.sleep(0.05)

    print(f"\n✅ Done — {total_inserted:,} rows inserted into mann_oem_clean")


if __name__ == "__main__":
    main()
