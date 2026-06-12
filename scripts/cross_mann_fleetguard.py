#!/usr/bin/env python3
"""
cross_mann_fleetguard.py
========================
Cruza MANN OEM numbers con Fleetguard OEM numbers.
Resultado: tabla mann_fleetguard_matches

Mismo mecanismo que cross_mann_donaldson.py
pero contra fleetguard_products.

Variables de entorno:
    PG_HOST / PG_PORT / PG_DATABASE / PG_USER / PG_PASSWORD
"""

import os
import sys

try:
    import psycopg2
except ImportError:
    print("ERROR: pip install psycopg2-binary")
    sys.exit(1)

DB_CONFIG = {
    "host":     os.getenv("PG_HOST",     "localhost"),
    "port":     int(os.getenv("PG_PORT", "5432")),
    "database": os.getenv("PG_DATABASE", "mann"),
    "user":     os.getenv("PG_USER",     "postgres"),
    "password": os.getenv("PG_PASSWORD", ""),
}

_OEM_KEY_EXPR = """COALESCE(
    elem->>'part_number',
    elem->>'code',
    elem->>'number',
    elem->>'oem_number'
)"""

_NORMALIZE_EXPR = f"""
UPPER(REGEXP_REPLACE(
    {_OEM_KEY_EXPR},
    '[\\s\\-/\\.()]', '', 'g'
))
""".strip()


def check_prerequisites(cur):
    cur.execute("""
        SELECT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_name = 'fleetguard_products'
        )
    """)
    if not cur.fetchone()[0]:
        print("ERROR: table 'fleetguard_products' not found")
        sys.exit(1)

    cur.execute("""
        SELECT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_name = 'mann_oem_clean'
        )
    """)
    if not cur.fetchone()[0]:
        print("ERROR: table 'mann_oem_clean' not found. Run load_mann_oems_postgres.py first.")
        sys.exit(1)


def detect_oem_column_type(cur):
    cur.execute("""
        SELECT data_type FROM information_schema.columns
        WHERE table_name = 'fleetguard_products'
          AND column_name = 'oem_numbers'
    """)
    row = cur.fetchone()
    if not row:
        print("ERROR: column 'oem_numbers' not found in fleetguard_products")
        sys.exit(1)
    return row[0]


def main():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
    except Exception as e:
        print(f"ERROR connecting: {e}")
        sys.exit(1)

    conn.autocommit = False
    cur = conn.cursor()

    check_prerequisites(cur)
    col_type = detect_oem_column_type(cur)
    print(f"fleetguard_products.oem_numbers type: {col_type}")

    oem_cast = "oem_numbers" if col_type in ("jsonb", "json") else "oem_numbers::jsonb"

    print("Step 1: Building normalized Fleetguard OEM temp table...")
    cur.execute(f"""
        DROP TABLE IF EXISTS _fg_oem_norm;
        CREATE TEMP TABLE _fg_oem_norm AS
        SELECT
            p.part_number                           AS fg_part,
            {_OEM_KEY_EXPR}                         AS oem_original,
            {_NORMALIZE_EXPR}                       AS oem_normalized
        FROM fleetguard_products p,
             jsonb_array_elements(
                 CASE
                     WHEN jsonb_typeof({oem_cast}) = 'array' THEN {oem_cast}
                     ELSE '[]'::jsonb
                 END
             ) elem
        WHERE p.oem_numbers IS NOT NULL
          AND {_OEM_KEY_EXPR} IS NOT NULL
          AND length({_NORMALIZE_EXPR}) >= 4;

        CREATE INDEX ON _fg_oem_norm(oem_normalized);
    """)
    conn.commit()

    cur.execute("SELECT COUNT(*) FROM _fg_oem_norm")
    fg_count = cur.fetchone()[0]
    print(f"   Fleetguard OEM rows normalized: {fg_count:,}")

    print("Step 2: Creating mann_fleetguard_matches...")
    cur.execute("""
        DROP TABLE IF EXISTS mann_fleetguard_matches;
        CREATE TABLE mann_fleetguard_matches AS
        SELECT DISTINCT
            m.sku           AS mann_part,
            m.segment       AS mann_segment,
            f.fg_part       AS fleetguard_part,
            m.oem_normalized,
            m.oem_brand     AS oem_brand
        FROM mann_oem_clean m
        INNER JOIN _fg_oem_norm f
            ON f.oem_normalized = m.oem_normalized
        WHERE m.oem_normalized IS NOT NULL
          AND length(m.oem_normalized) >= 4;

        CREATE INDEX ON mann_fleetguard_matches(mann_part);
        CREATE INDEX ON mann_fleetguard_matches(fleetguard_part);
        CREATE INDEX ON mann_fleetguard_matches(oem_normalized);
    """)
    conn.commit()

    # Stats
    cur.execute("SELECT COUNT(*) FROM mann_fleetguard_matches")
    total = cur.fetchone()[0]

    cur.execute("""
        SELECT COUNT(DISTINCT mann_part), COUNT(DISTINCT fleetguard_part)
        FROM mann_fleetguard_matches
    """)
    mann_u, fg_u = cur.fetchone()

    cur.execute("""
        SELECT mann_segment, COUNT(*) AS n
        FROM mann_fleetguard_matches
        GROUP BY mann_segment ORDER BY n DESC
    """)
    seg_stats = cur.fetchall()

    cur.close()
    conn.close()

    print(f"\n✅ mann_fleetguard_matches created")
    print(f"   Total match rows      : {total:,}")
    print(f"   Unique MANN parts     : {mann_u:,}")
    print(f"   Unique Fleetguard pts : {fg_u:,}")
    print("\nBy MANN segment:")
    for seg, n in seg_stats:
        print(f"  {seg or '(null)':10} {n:>8,}")


if __name__ == "__main__":
    main()
