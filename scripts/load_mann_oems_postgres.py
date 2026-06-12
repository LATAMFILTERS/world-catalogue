#!/usr/bin/env python3
"""
load_mann_oems_postgres.py
==========================
Crea la tabla mann_oem_clean en PostgreSQL
y carga C:\\mann\\mann_oem_master_clean.csv

Requiere:
    pip install psycopg2-binary

Variables de entorno (o editar DB_CONFIG abajo):
    PG_HOST      default: localhost
    PG_PORT      default: 5432
    PG_DATABASE  default: mann
    PG_USER      default: postgres
    PG_PASSWORD  default: (vacío)
"""

import csv
import os
import sys
from pathlib import Path

try:
    import psycopg2
    from psycopg2.extras import execute_values
except ImportError:
    print("ERROR: psycopg2 not installed. Run: pip install psycopg2-binary")
    sys.exit(1)

INPUT = Path(r"C:\mann\mann_oem_master_clean.csv")

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://catalogo_elimfilters_user:d1Ioo8q0tkdgGccNDF0axZ8mQVmduCBf"
    "@dpg-d86ju1p9rddc739lc230-a.oregon-postgres.render.com/catalogo_elimfilters"
    "?sslmode=require"
)

DDL = """
DROP TABLE IF EXISTS mann_oem_clean;

CREATE TABLE mann_oem_clean (
    id             SERIAL PRIMARY KEY,
    sku            TEXT NOT NULL,
    segment        TEXT,
    oem_brand      TEXT,
    oem_original   TEXT,
    oem_normalized TEXT NOT NULL,
    CONSTRAINT uq_mann_oem UNIQUE (sku, oem_normalized)
);

CREATE INDEX idx_mann_oem_norm ON mann_oem_clean(oem_normalized);
CREATE INDEX idx_mann_oem_sku  ON mann_oem_clean(sku);
CREATE INDEX idx_mann_oem_seg  ON mann_oem_clean(segment);
"""

BATCH_SIZE = 2000


def main():
    if not INPUT.exists():
        print(f"ERROR: {INPUT} not found")
        print("Run normalize_mann_oems.py first.")
        sys.exit(1)

    # Read CSV
    rows = []
    with open(INPUT, encoding="utf-8", newline="") as f:
        for row in csv.DictReader(f):
            rows.append((
                row["sku"],
                row["segment"] or None,
                row["oem_brand"] or None,
                row["oem_original"] or None,
                row["oem_normalized"],
            ))
    print(f"Loaded {len(rows):,} rows from CSV")

    # Connect
    try:
        conn = psycopg2.connect(DATABASE_URL)
    except Exception as e:
        print(f"ERROR connecting to DB: {e}")
        sys.exit(1)

    cur = conn.cursor()

    print("Creating table mann_oem_clean...")
    cur.execute(DDL)
    conn.commit()

    print(f"Inserting {len(rows):,} rows in batches of {BATCH_SIZE}...")
    total_inserted = 0

    for i in range(0, len(rows), BATCH_SIZE):
        batch = rows[i:i + BATCH_SIZE]
        execute_values(
            cur,
            """
            INSERT INTO mann_oem_clean
                (sku, segment, oem_brand, oem_original, oem_normalized)
            VALUES %s
            ON CONFLICT (sku, oem_normalized) DO NOTHING
            """,
            batch,
            page_size=BATCH_SIZE,
        )
        conn.commit()
        total_inserted += len(batch)
        print(f"  {total_inserted:,} / {len(rows):,}")

    # Final stats
    cur.execute("SELECT COUNT(*) FROM mann_oem_clean")
    db_count = cur.fetchone()[0]

    cur.execute("""
        SELECT segment, COUNT(*) AS n
        FROM mann_oem_clean
        GROUP BY segment
        ORDER BY n DESC
    """)
    seg_stats = cur.fetchall()

    cur.close()
    conn.close()

    print(f"\n✅ Done — mann_oem_clean contains {db_count:,} rows")
    print("\nBy segment:")
    for seg, n in seg_stats:
        print(f"  {seg or '(null)':10} {n:>8,}")


if __name__ == "__main__":
    main()
