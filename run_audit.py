#!/usr/bin/env python3
"""Full Knowledge Graph readiness audit - all 20 queries"""
import psycopg2
import psycopg2.extras
import json
import sys

conn = psycopg2.connect(
    host='ballast.proxy.rlwy.net',
    port=18263,
    database='railway',
    user='postgres',
    password='qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm',
    sslmode='require'
)
conn.autocommit = True
cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

def run_query(label, sql):
    print(f"\n{'='*60}")
    print(f"=== {label} ===")
    print('='*60)
    try:
        cur.execute(sql)
        rows = cur.fetchall()
        for row in rows:
            print(json.dumps(dict(row), default=str))
        print(f"[{len(rows)} rows]")
    except Exception as e:
        print(f"ERROR: {e}")

run_query("Q1: Technology audit",
    "SELECT technology, COUNT(*) as cnt FROM elimfilters_catalog GROUP BY technology ORDER BY cnt DESC")

run_query("Q2: Filter type audit",
    "SELECT filter_type, COUNT(*) as cnt FROM elimfilters_catalog GROUP BY filter_type ORDER BY cnt DESC")

run_query("Q3: Total products and basic completeness",
    """SELECT
      COUNT(*) as total,
      COUNT(CASE WHEN technology IS NOT NULL AND technology != '' THEN 1 END) as has_technology,
      COUNT(CASE WHEN oem_codes IS NOT NULL AND jsonb_array_length(oem_codes) > 0 THEN 1 END) as has_oem,
      COUNT(CASE WHEN competitor_codes IS NOT NULL AND jsonb_array_length(competitor_codes) > 0 THEN 1 END) as has_competitor,
      COUNT(CASE WHEN equipment_applications IS NOT NULL AND jsonb_array_length(equipment_applications) > 0 THEN 1 END) as has_equipment,
      COUNT(CASE WHEN description IS NOT NULL AND description != '' THEN 1 END) as has_description,
      COUNT(CASE WHEN outer_diameter_mm IS NOT NULL THEN 1 END) as has_od,
      COUNT(CASE WHEN height_mm IS NOT NULL THEN 1 END) as has_height,
      COUNT(CASE WHEN thread_size IS NOT NULL AND thread_size != '' THEN 1 END) as has_thread,
      COUNT(CASE WHEN iso_test_method IS NOT NULL AND iso_test_method != '' THEN 1 END) as has_iso,
      COUNT(CASE WHEN burst_pressure_psi IS NOT NULL THEN 1 END) as has_burst,
      COUNT(CASE WHEN collapse_pressure_psi IS NOT NULL THEN 1 END) as has_collapse,
      COUNT(CASE WHEN alternatives IS NOT NULL AND jsonb_array_length(alternatives) > 0 THEN 1 END) as has_alternatives,
      COUNT(CASE WHEN brand_crossrefs IS NOT NULL AND brand_crossrefs != '{}'::jsonb THEN 1 END) as has_brand_crossrefs
    FROM elimfilters_catalog""")

run_query("Q4: Equipment manufacturers unique list (top 100)",
    """SELECT
      UPPER(TRIM(elem->>'manufacturer')) as manufacturer,
      COUNT(*) as product_count
    FROM elimfilters_catalog,
         jsonb_array_elements(COALESCE(equipment_applications, '[]'::jsonb)) AS elem
    WHERE elem->>'manufacturer' IS NOT NULL
      AND elem->>'manufacturer' != ''
    GROUP BY UPPER(TRIM(elem->>'manufacturer'))
    ORDER BY product_count DESC
    LIMIT 100""")

run_query("Q5: Equipment applications sample",
    """SELECT sku, equipment_applications
    FROM elimfilters_catalog
    WHERE equipment_applications IS NOT NULL
      AND jsonb_array_length(equipment_applications) > 0
    LIMIT 10""")

run_query("Q6: OEM codes format sample",
    """SELECT sku, oem_codes
    FROM elimfilters_catalog
    WHERE oem_codes IS NOT NULL
      AND jsonb_array_length(oem_codes) > 0
    LIMIT 15""")

run_query("Q7: Competitor codes format sample",
    """SELECT sku, competitor_codes
    FROM elimfilters_catalog
    WHERE competitor_codes IS NOT NULL
      AND jsonb_array_length(competitor_codes) > 0
    LIMIT 15""")

run_query("Q8: Brand crossrefs format sample",
    """SELECT sku, brand_crossrefs
    FROM elimfilters_catalog
    WHERE brand_crossrefs IS NOT NULL
      AND brand_crossrefs != '{}'::jsonb
    LIMIT 10""")

run_query("Q9: OEM manufacturer distribution (top 50)",
    """SELECT
      UPPER(TRIM(elem->>'manufacturer')) as manufacturer,
      COUNT(*) as count
    FROM elimfilters_catalog,
         jsonb_array_elements(COALESCE(oem_codes, '[]'::jsonb)) AS elem
    WHERE elem->>'manufacturer' IS NOT NULL
    GROUP BY UPPER(TRIM(elem->>'manufacturer'))
    ORDER BY count DESC
    LIMIT 50""")

run_query("Q10: Competitor brand distribution (top 30)",
    """SELECT
      UPPER(TRIM(elem->>'manufacturer')) as brand,
      COUNT(*) as count
    FROM elimfilters_catalog,
         jsonb_array_elements(COALESCE(competitor_codes, '[]'::jsonb)) AS elem
    WHERE elem->>'manufacturer' IS NOT NULL
    GROUP BY UPPER(TRIM(elem->>'manufacturer'))
    ORDER BY count DESC
    LIMIT 30""")

run_query("Q11a: pgvector check",
    "SELECT extname, extversion FROM pg_extension WHERE extname = 'vector'")

run_query("Q11b: All extensions",
    "SELECT extname, extversion FROM pg_extension ORDER BY extname")

run_query("Q12: Duty distribution",
    "SELECT duty, COUNT(*) as cnt FROM elimfilters_catalog GROUP BY duty ORDER BY cnt DESC")

run_query("Q13: Filter type + technology cross",
    "SELECT filter_type, technology, COUNT(*) as cnt FROM elimfilters_catalog GROUP BY filter_type, technology ORDER BY filter_type, cnt DESC")

run_query("Q14: Alternatives format sample",
    """SELECT sku, alternatives
    FROM elimfilters_catalog
    WHERE alternatives IS NOT NULL
      AND jsonb_array_length(alternatives) > 0
    LIMIT 20""")

run_query("Q15: Sub_type distribution (top 30)",
    """SELECT sub_type, COUNT(*) as cnt
    FROM elimfilters_catalog
    GROUP BY sub_type
    ORDER BY cnt DESC
    LIMIT 30""")

run_query("Q16: Description format sample",
    """SELECT sku, LEFT(description::text, 200) as desc_preview
    FROM elimfilters_catalog
    WHERE description IS NOT NULL AND description != ''
    LIMIT 10""")

run_query("Q17: Null/empty analysis by filter_type",
    """SELECT
      filter_type,
      COUNT(*) as total,
      COUNT(CASE WHEN oem_codes IS NOT NULL AND jsonb_array_length(oem_codes) > 0 THEN 1 END) as has_oem,
      COUNT(CASE WHEN equipment_applications IS NOT NULL AND jsonb_array_length(equipment_applications) > 0 THEN 1 END) as has_equip,
      COUNT(CASE WHEN technology IS NOT NULL AND technology != '' THEN 1 END) as has_tech
    FROM elimfilters_catalog
    GROUP BY filter_type
    ORDER BY total DESC""")

run_query("Q18: Existing tables in DB",
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename")

run_query("Q19: Column list of elimfilters_catalog",
    """SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = 'elimfilters_catalog'
    ORDER BY ordinal_position""")

print("\n" + "="*60)
print("=== Q20: Kit tables ===")
print("="*60)

for tbl in ['maintenance_kits', 'kit_components']:
    try:
        cur.execute(f"SELECT * FROM {tbl} LIMIT 10")
        rows = cur.fetchall()
        print(f"\n-- {tbl} sample ({len(rows)} rows shown) --")
        for row in rows:
            print(json.dumps(dict(row), default=str))
        cur.execute(f"SELECT COUNT(*) as cnt FROM {tbl}")
        cnt = cur.fetchone()
        print(f"-- {tbl} total count: {cnt['cnt']} --")
    except Exception as e:
        print(f"{tbl} ERROR: {e}")

cur.close()
conn.close()
print("\n\nAUDIT COMPLETE")
