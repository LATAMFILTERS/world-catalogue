#!/usr/bin/env python3
"""
cross_mann_donaldson.py
=======================
Cruza MANN OEM numbers con OEM codes de productos Donaldson
en elimfilters_catalog (campo oem_codes JSONB).

Resultado: tabla mann_donaldson_matches

    mann_part       — SKU MANN
    mann_segment    — HD / LD / MIXED
    donaldson_part  — part_number del producto DON en elimfilters_catalog
    elimfilters_sku — SKU interno (EL8..., EH6..., etc.)
    oem_normalized  — código OEM normalizado que los une
    oem_brand       — fabricante del equipo (VOLVO, CAT, etc.)
"""

import os
import sys

try:
    import psycopg2
except ImportError:
    print("ERROR: pip install psycopg2-binary")
    sys.exit(1)

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://catalogo_elimfilters_user:d1Ioo8q0tkdgGccNDF0axZ8mQVmduCBf"
    "@dpg-d86ju1p9rddc739lc230-a.oregon-postgres.render.com/catalogo_elimfilters"
)

# Donaldson part numbers: P<digits>, BF<digits>, PA<digits>, DT<digits>
# Fleetguard:             LF<digits>, HF<digits>, FF<digits>, FS<digits>
# This regex matches Donaldson-specific patterns (adjust if needed)
DON_PART_PATTERN = r'^(P|BF|PA|DT|PX|AF1|AF2|AF3|AF4|AF5)[0-9]'


def check_prerequisites(cur):
    cur.execute("""
        SELECT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_name = 'elimfilters_catalog'
        )
    """)
    if not cur.fetchone()[0]:
        print("ERROR: table 'elimfilters_catalog' not found")
        sys.exit(1)
    cur.execute("""
        SELECT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_name = 'mann_oem_clean'
        )
    """)
    if not cur.fetchone()[0]:
        print("ERROR: table 'mann_oem_clean' not found — run load_mann_oems_postgres.py first")
        sys.exit(1)


def main():
    try:
        conn = psycopg2.connect(DATABASE_URL, sslmode="require")
    except Exception as e:
        print(f"ERROR connecting: {e}")
        sys.exit(1)

    conn.autocommit = False
    cur = conn.cursor()

    check_prerequisites(cur)

    # Count DON products in catalog
    cur.execute("""
        SELECT COUNT(*) FROM elimfilters_catalog
        WHERE oem_codes IS NOT NULL
          AND jsonb_array_length(oem_codes) > 0
          AND codigo_base ~ %s
    """, (DON_PART_PATTERN,))
    don_products = cur.fetchone()[0]
    print(f"Donaldson products with OEM codes: {don_products:,}")

    if don_products == 0:
        print("WARNING: 0 products matched DON pattern. Trying without filter...")
        cur.execute("""
            SELECT COUNT(*) FROM elimfilters_catalog
            WHERE oem_codes IS NOT NULL AND jsonb_array_length(oem_codes) > 0
        """)
        total = cur.fetchone()[0]
        print(f"Total products with OEM codes: {total:,}")
        print("Check DON_PART_PATTERN constant in script.")

    print("Step 1: Building normalized Donaldson OEM temp table...")
    cur.execute("""
        DROP TABLE IF EXISTS _don_oem_norm;
        CREATE TEMP TABLE _don_oem_norm AS
        SELECT
            p.sku                                                      AS elimfilters_sku,
            p.part_number                                              AS don_part,
            (elem->>'part_number')                                     AS oem_original,
            UPPER(REGEXP_REPLACE(
                COALESCE(elem->>'part_number', ''),
                '[\\s\\-/\\.()]', '', 'g'
            ))                                                         AS oem_normalized
        FROM elimfilters_catalog p,
             jsonb_array_elements(p.oem_codes) elem
        WHERE p.oem_codes IS NOT NULL
          AND jsonb_typeof(p.oem_codes) = 'array'
          AND (elem->>'part_number') IS NOT NULL
          AND length(UPPER(REGEXP_REPLACE(
                COALESCE(elem->>'part_number',''),
                '[\\s\\-/\\.()]','','g'))) >= 4
          AND p.codigo_base ~ %s;

        CREATE INDEX ON _don_oem_norm(oem_normalized);
    """, (DON_PART_PATTERN,))
    conn.commit()

    cur.execute("SELECT COUNT(*) FROM _don_oem_norm")
    don_oem_count = cur.fetchone()[0]
    print(f"   DON OEM rows extracted: {don_oem_count:,}")

    print("Step 2: Creating mann_donaldson_matches...")
    cur.execute("""
        DROP TABLE IF EXISTS mann_donaldson_matches;
        CREATE TABLE mann_donaldson_matches AS
        SELECT DISTINCT
            m.sku            AS mann_part,
            m.segment        AS mann_segment,
            d.don_part       AS donaldson_part,
            d.elimfilters_sku,
            m.oem_normalized,
            m.oem_brand
        FROM mann_oem_clean m
        INNER JOIN _don_oem_norm d
            ON d.oem_normalized = m.oem_normalized
        WHERE length(m.oem_normalized) >= 4;

        CREATE INDEX ON mann_donaldson_matches(mann_part);
        CREATE INDEX ON mann_donaldson_matches(donaldson_part);
        CREATE INDEX ON mann_donaldson_matches(elimfilters_sku);
        CREATE INDEX ON mann_donaldson_matches(oem_normalized);
    """)
    conn.commit()

    cur.execute("SELECT COUNT(*) FROM mann_donaldson_matches")
    total = cur.fetchone()[0]
    cur.execute("SELECT COUNT(DISTINCT mann_part), COUNT(DISTINCT donaldson_part) FROM mann_donaldson_matches")
    mann_u, don_u = cur.fetchone()
    cur.execute("""
        SELECT mann_segment, COUNT(*) FROM mann_donaldson_matches
        GROUP BY mann_segment ORDER BY 2 DESC
    """)
    segs = cur.fetchall()

    cur.close()
    conn.close()

    print(f"\n✅ mann_donaldson_matches created")
    print(f"   Total rows           : {total:,}")
    print(f"   Unique MANN parts    : {mann_u:,}")
    print(f"   Unique DON parts     : {don_u:,}")
    print("\nBy MANN segment:")
    for seg, n in segs:
        print(f"  {seg or '(null)':10} {n:>8,}")


if __name__ == "__main__":
    main()
