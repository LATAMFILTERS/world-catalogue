#!/usr/bin/env python3
"""
cross_mann_fleetguard.py
========================
Cruza MANN OEM numbers con OEM codes de productos Fleetguard
en elimfilters_catalog (campo oem_codes JSONB).

Resultado: tabla mann_fleetguard_matches

    mann_part       — SKU MANN
    mann_segment    — HD / LD / MIXED
    fleetguard_part — part_number del producto FG en elimfilters_catalog
    elimfilters_sku — SKU interno
    oem_normalized  — código OEM que los une
    oem_brand       — fabricante del equipo
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
    "?sslmode=require"
)

# Fleetguard part number patterns
FG_PART_PATTERN = r'^(LF|HF|FF|FS|WF|AF0|CV|CC|SCA|RS)[0-9]'


def check_prerequisites(cur):
    for tbl in ("elimfilters_catalog", "mann_oem_clean"):
        cur.execute(f"""
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables WHERE table_name = '{tbl}'
            )
        """)
        if not cur.fetchone()[0]:
            print(f"ERROR: table '{tbl}' not found")
            sys.exit(1)


def main():
    try:
        conn = psycopg2.connect(DATABASE_URL)
    except Exception as e:
        print(f"ERROR connecting: {e}")
        sys.exit(1)

    conn.autocommit = False
    cur = conn.cursor()

    check_prerequisites(cur)

    cur.execute("""
        SELECT COUNT(*) FROM elimfilters_catalog
        WHERE oem_codes IS NOT NULL
          AND jsonb_array_length(oem_codes) > 0
          AND codigo_base ~ %s
    """, (FG_PART_PATTERN,))
    fg_products = cur.fetchone()[0]
    print(f"Fleetguard products with OEM codes: {fg_products:,}")

    print("Step 1: Building normalized Fleetguard OEM temp table...")
    cur.execute("""
        DROP TABLE IF EXISTS _fg_oem_norm;
        CREATE TEMP TABLE _fg_oem_norm AS
        SELECT
            p.sku                                                      AS elimfilters_sku,
            p.part_number                                              AS fg_part,
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

        CREATE INDEX ON _fg_oem_norm(oem_normalized);
    """, (FG_PART_PATTERN,))
    conn.commit()

    cur.execute("SELECT COUNT(*) FROM _fg_oem_norm")
    fg_oem_count = cur.fetchone()[0]
    print(f"   FG OEM rows extracted: {fg_oem_count:,}")

    print("Step 2: Creating mann_fleetguard_matches...")
    cur.execute("""
        DROP TABLE IF EXISTS mann_fleetguard_matches;
        CREATE TABLE mann_fleetguard_matches AS
        SELECT DISTINCT
            m.sku            AS mann_part,
            m.segment        AS mann_segment,
            f.fg_part        AS fleetguard_part,
            f.elimfilters_sku,
            m.oem_normalized,
            m.oem_brand
        FROM mann_oem_clean m
        INNER JOIN _fg_oem_norm f
            ON f.oem_normalized = m.oem_normalized
        WHERE length(m.oem_normalized) >= 4;

        CREATE INDEX ON mann_fleetguard_matches(mann_part);
        CREATE INDEX ON mann_fleetguard_matches(fleetguard_part);
        CREATE INDEX ON mann_fleetguard_matches(elimfilters_sku);
        CREATE INDEX ON mann_fleetguard_matches(oem_normalized);
    """)
    conn.commit()

    cur.execute("SELECT COUNT(*) FROM mann_fleetguard_matches")
    total = cur.fetchone()[0]
    cur.execute("SELECT COUNT(DISTINCT mann_part), COUNT(DISTINCT fleetguard_part) FROM mann_fleetguard_matches")
    mann_u, fg_u = cur.fetchone()
    cur.execute("""
        SELECT mann_segment, COUNT(*) FROM mann_fleetguard_matches
        GROUP BY mann_segment ORDER BY 2 DESC
    """)
    segs = cur.fetchall()

    cur.close()
    conn.close()

    print(f"\n✅ mann_fleetguard_matches created")
    print(f"   Total rows            : {total:,}")
    print(f"   Unique MANN parts     : {mann_u:,}")
    print(f"   Unique FG parts       : {fg_u:,}")
    print("\nBy MANN segment:")
    for seg, n in segs:
        print(f"  {seg or '(null)':10} {n:>8,}")


if __name__ == "__main__":
    main()
