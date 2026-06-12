#!/usr/bin/env python3
"""
build_cross_reference_master.py
================================
Construye la tabla cross_reference_master combinando:
    mann_donaldson_matches
    mann_fleetguard_matches

Estructura final:
    oem_normalized   — clave de unión
    oem_brand        — fabricante del equipo (VOLVO, CAT, etc.)
    mann_part        — SKU MANN-FILTER
    donaldson_part   — part_number Donaldson (nullable)
    fleetguard_part  — part_number Fleetguard (nullable)
    elimfilters_sku  — SKU ELIMFILTERS (nullable, rellenar después)
    segment          — HD / LD / MIXED

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

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://catalogo_elimfilters_user:d1Ioo8q0tkdgGccNDF0axZ8mQVmduCBf"
    "@dpg-d86ju1p9rddc739lc230-a.oregon-postgres.render.com/catalogo_elimfilters"
)

def _connect(url=DATABASE_URL):
    from urllib.parse import urlparse
    p = urlparse(url)
    return psycopg2.connect(
        host=p.hostname,
        port=p.port or 5432,
        dbname=p.path.lstrip('/').split('?')[0],
        user=p.username,
        password=p.password,
        sslmode='require',
        gssencmode='disable',
    )



def check_prerequisites(cur):
    for tbl in ("mann_oem_clean", "mann_donaldson_matches", "mann_fleetguard_matches"):
        cur.execute(f"""
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables WHERE table_name = '{tbl}'
            )
        """)
        if not cur.fetchone()[0]:
            print(f"ERROR: table '{tbl}' not found. Run preceding scripts first.")
            sys.exit(1)


def main():
    try:
        conn = _connect()
    except Exception as e:
        print(f"ERROR connecting: {e}")
        sys.exit(1)

    conn.autocommit = False
    cur = conn.cursor()

    check_prerequisites(cur)

    print("Building cross_reference_master...")
    cur.execute("""
        DROP TABLE IF EXISTS cross_reference_master;

        CREATE TABLE cross_reference_master AS
        WITH base AS (
            -- All unique (mann_part, oem_normalized) pairs from mann_oem_clean
            SELECT DISTINCT
                m.sku            AS mann_part,
                m.segment,
                m.oem_brand,
                m.oem_normalized
            FROM mann_oem_clean m
            WHERE m.oem_normalized IS NOT NULL
              AND length(m.oem_normalized) >= 4
        ),
        with_don AS (
            SELECT
                b.mann_part,
                b.segment,
                b.oem_brand,
                b.oem_normalized,
                md.donaldson_part
            FROM base b
            LEFT JOIN (
                SELECT DISTINCT ON (mann_part, oem_normalized)
                    mann_part, donaldson_part, oem_normalized
                FROM mann_donaldson_matches
                ORDER BY mann_part, oem_normalized, donaldson_part
            ) md ON md.mann_part = b.mann_part
               AND md.oem_normalized = b.oem_normalized
        ),
        with_fg AS (
            SELECT
                w.mann_part,
                w.segment,
                w.oem_brand,
                w.oem_normalized,
                w.donaldson_part,
                mf.fleetguard_part
            FROM with_don w
            LEFT JOIN (
                SELECT DISTINCT ON (mann_part, oem_normalized)
                    mann_part, fleetguard_part, oem_normalized
                FROM mann_fleetguard_matches
                ORDER BY mann_part, oem_normalized, fleetguard_part
            ) mf ON mf.mann_part = w.mann_part
               AND mf.oem_normalized = w.oem_normalized
        )
        SELECT
            oem_normalized,
            oem_brand,
            mann_part,
            donaldson_part,
            fleetguard_part,
            NULL::text  AS elimfilters_sku,
            segment
        FROM with_fg
        WHERE donaldson_part IS NOT NULL
           OR fleetguard_part IS NOT NULL;

        -- Indexes for fast lookup
        CREATE INDEX ON cross_reference_master(oem_normalized);
        CREATE INDEX ON cross_reference_master(mann_part);
        CREATE INDEX ON cross_reference_master(donaldson_part);
        CREATE INDEX ON cross_reference_master(fleetguard_part);
        CREATE INDEX ON cross_reference_master(segment);
    """)
    conn.commit()

    # Stats
    cur.execute("SELECT COUNT(*) FROM cross_reference_master")
    total = cur.fetchone()[0]

    cur.execute("SELECT COUNT(DISTINCT mann_part) FROM cross_reference_master")
    mann_u = cur.fetchone()[0]

    cur.execute("SELECT COUNT(DISTINCT donaldson_part) FROM cross_reference_master WHERE donaldson_part IS NOT NULL")
    don_u = cur.fetchone()[0]

    cur.execute("SELECT COUNT(DISTINCT fleetguard_part) FROM cross_reference_master WHERE fleetguard_part IS NOT NULL")
    fg_u = cur.fetchone()[0]

    cur.execute("""
        SELECT
            COUNT(*) FILTER (WHERE donaldson_part IS NOT NULL AND fleetguard_part IS NOT NULL) AS don_and_fg,
            COUNT(*) FILTER (WHERE donaldson_part IS NOT NULL AND fleetguard_part IS NULL)     AS don_only,
            COUNT(*) FILTER (WHERE donaldson_part IS NULL     AND fleetguard_part IS NOT NULL) AS fg_only
        FROM cross_reference_master
    """)
    don_fg, don_only, fg_only = cur.fetchone()

    cur.execute("""
        SELECT segment, COUNT(*) AS n
        FROM cross_reference_master
        GROUP BY segment ORDER BY n DESC
    """)
    seg_stats = cur.fetchall()

    # Sample
    cur.execute("""
        SELECT mann_part, donaldson_part, fleetguard_part, oem_brand, oem_normalized
        FROM cross_reference_master
        WHERE donaldson_part IS NOT NULL AND fleetguard_part IS NOT NULL
        LIMIT 5
    """)
    samples = cur.fetchall()

    cur.close()
    conn.close()

    print(f"\n✅ cross_reference_master built")
    print(f"\nTotals:")
    print(f"  Total rows          : {total:,}")
    print(f"  Unique MANN parts   : {mann_u:,}")
    print(f"  Unique DON parts    : {don_u:,}")
    print(f"  Unique FG parts     : {fg_u:,}")
    print(f"\nCoverage:")
    print(f"  MANN ↔ DON + FG     : {don_fg:,}")
    print(f"  MANN ↔ DON only     : {don_only:,}")
    print(f"  MANN ↔ FG only      : {fg_only:,}")
    print(f"\nBy segment:")
    for seg, n in seg_stats:
        print(f"  {seg or '(null)':10} {n:>8,}")
    print(f"\nSample (MANN ↔ DON + FG):")
    print(f"  {'MANN':20} {'DONALDSON':20} {'FLEETGUARD':20} {'OEM BRAND':20} {'OEM CODE'}")
    for row in samples:
        print(f"  {str(row[0]):20} {str(row[1]):20} {str(row[2]):20} {str(row[3]):20} {row[4]}")


if __name__ == "__main__":
    main()
