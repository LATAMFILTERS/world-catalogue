#!/usr/bin/env python3
"""
cross_mann_donaldson.py
=======================
Cruza MANN OEM numbers con Donaldson OEM numbers.
Resultado: tabla mann_donaldson_matches

Asume que donaldson_products.oem_numbers es JSONB array:
    [{"manufacturer": "VOLVO", "part_number": "1699644"}, ...]
    ó
    [{"brand": "VOLVO", "code": "1699644"}, ...]

Si el campo es TEXT, se hace cast automático a JSONB.

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

# Detect the key that holds the OEM code in the donaldson oem_numbers array
# Tries in order: part_number, code, number, oem_number
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
            WHERE table_name = 'donaldson_products'
        )
    """)
    if not cur.fetchone()[0]:
        print("ERROR: table 'donaldson_products' not found in this database")
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
        WHERE table_name = 'donaldson_products'
          AND column_name = 'oem_numbers'
    """)
    row = cur.fetchone()
    if not row:
        print("ERROR: column 'oem_numbers' not found in donaldson_products")
        sys.exit(1)
    return row[0]  # 'jsonb', 'json', 'text', etc.


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
    print(f"donaldson_products.oem_numbers type: {col_type}")

    # Cast to JSONB if stored as text
    oem_cast = "oem_numbers" if col_type in ("jsonb", "json") else "oem_numbers::jsonb"

    print("Step 1: Building normalized Donaldson OEM temp table...")
    cur.execute(f"""
        DROP TABLE IF EXISTS _don_oem_norm;
        CREATE TEMP TABLE _don_oem_norm AS
        SELECT
            p.part_number                           AS don_part,
            {_OEM_KEY_EXPR}                         AS oem_original,
            {_NORMALIZE_EXPR}                       AS oem_normalized
        FROM donaldson_products p,
             jsonb_array_elements(
                 CASE
                     WHEN jsonb_typeof({oem_cast}) = 'array' THEN {oem_cast}
                     ELSE '[]'::jsonb
                 END
             ) elem
        WHERE p.oem_numbers IS NOT NULL
          AND {_OEM_KEY_EXPR} IS NOT NULL
          AND length({_NORMALIZE_EXPR}) >= 4;

        CREATE INDEX ON _don_oem_norm(oem_normalized);
    """)
    conn.commit()

    cur.execute("SELECT COUNT(*) FROM _don_oem_norm")
    don_count = cur.fetchone()[0]
    print(f"   Donaldson OEM rows normalized: {don_count:,}")

    print("Step 2: Creating mann_donaldson_matches...")
    cur.execute("""
        DROP TABLE IF EXISTS mann_donaldson_matches;
        CREATE TABLE mann_donaldson_matches AS
        SELECT DISTINCT
            m.sku           AS mann_part,
            m.segment       AS mann_segment,
            d.don_part      AS donaldson_part,
            m.oem_normalized,
            m.oem_brand     AS oem_brand
        FROM mann_oem_clean m
        INNER JOIN _don_oem_norm d
            ON d.oem_normalized = m.oem_normalized
        WHERE m.oem_normalized IS NOT NULL
          AND length(m.oem_normalized) >= 4;

        CREATE INDEX ON mann_donaldson_matches(mann_part);
        CREATE INDEX ON mann_donaldson_matches(donaldson_part);
        CREATE INDEX ON mann_donaldson_matches(oem_normalized);
    """)
    conn.commit()

    # Stats
    cur.execute("SELECT COUNT(*) FROM mann_donaldson_matches")
    total = cur.fetchone()[0]

    cur.execute("""
        SELECT COUNT(DISTINCT mann_part), COUNT(DISTINCT donaldson_part)
        FROM mann_donaldson_matches
    """)
    mann_u, don_u = cur.fetchone()

    cur.execute("""
        SELECT mann_segment, COUNT(*) AS n
        FROM mann_donaldson_matches
        GROUP BY mann_segment ORDER BY n DESC
    """)
    seg_stats = cur.fetchall()

    cur.close()
    conn.close()

    print(f"\n✅ mann_donaldson_matches created")
    print(f"   Total match rows     : {total:,}")
    print(f"   Unique MANN parts    : {mann_u:,}")
    print(f"   Unique Donaldson pts : {don_u:,}")
    print("\nBy MANN segment:")
    for seg, n in seg_stats:
        print(f"  {seg or '(null)':10} {n:>8,}")


if __name__ == "__main__":
    main()
