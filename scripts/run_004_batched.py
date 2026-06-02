"""
run_004_batched.py
Populates kg_product_equipment in batches of 100 SKUs.
Each batch is a separate short-lived query — avoids Render/PgBouncer timeout.
Idempotent: ON CONFLICT DO NOTHING.

Usage:
  python scripts/run_004_batched.py
"""
import asyncio, os, sys
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

import asyncpg

db_url = os.environ.get("DATABASE_URL")
if not db_url:
    print("ERROR: DATABASE_URL not set")
    sys.exit(1)

BATCH_SIZE = 25

# Normalization aliases — identical to 004_populate_product_equipment.sql
MAKE_ALIASES_SQL = """
WITH
make_aliases (raw_upper, canonical_slug) AS (
  VALUES
    ('CUMMINS', 'cummins'), ('CUMMINS INC.', 'cummins'), ('CUMMINS INC', 'cummins'),
    ('CATERPILLAR', 'caterpillar'), ('CATERPILLAR INC.', 'caterpillar'), ('CAT', 'caterpillar'),
    ('JOHN DEERE', 'john-deere'), ('JOHNDEERE', 'john-deere'), ('JD', 'john-deere'),
    ('VOLVO', 'volvo'), ('VOLVO TRUCKS', 'volvo'), ('VOLVO PENTA', 'volvo'),
    ('KOMATSU', 'komatsu'), ('KOMATSU LTD.', 'komatsu'),
    ('KENWORTH', 'kenworth'), ('KENWORTH TRUCK', 'kenworth'),
    ('PETERBILT', 'peterbilt'), ('PETERBILT MOTORS', 'peterbilt'),
    ('FREIGHTLINER', 'freightliner'), ('FREIGHTLINER LLC', 'freightliner'),
    ('MACK', 'mack'), ('MACK TRUCKS', 'mack'),
    ('MERCEDES-BENZ', 'mercedes-benz'), ('MERCEDES BENZ', 'mercedes-benz'), ('MERCEDES', 'mercedes-benz'),
    ('LIEBHERR', 'liebherr'), ('LIEBHERR GROUP', 'liebherr'),
    ('CASE IH', 'case-ih'), ('CASE', 'case'),
    ('NEW HOLLAND', 'new-holland'), ('NEW HOLLAND AGRICULTURE', 'new-holland'),
    ('JCB', 'jcb'), ('J.C. BAMFORD', 'jcb'), ('J.C. BAMFORD EXCAVATORS', 'jcb'),
    ('HITACHI', 'hitachi'), ('HITACHI CONSTRUCTION', 'hitachi'),
    ('DOOSAN', 'doosan'), ('DOOSAN INFRACORE', 'doosan'),
    ('KOBELCO', 'kobelco'), ('KOBELCO CONSTRUCTION', 'kobelco'),
    ('HYUNDAI', 'hyundai'), ('HYUNDAI CONSTRUCTION', 'hyundai'),
    ('INTERNATIONAL', 'navistar'), ('NAVISTAR', 'navistar'), ('INTERNATIONAL HARVESTER', 'navistar'),
    ('FENDT', 'fendt'), ('CLAAS', 'claas'),
    ('MASSEY FERGUSON', 'massey-ferguson'), ('MASSEY-FERGUSON', 'massey-ferguson'), ('MF', 'massey-ferguson'),
    ('DEUTZ', 'deutz'), ('DEUTZ AG', 'deutz'), ('DEUTZ-FAHR', 'deutz-fahr'), ('SAME', 'same'),
    ('KUBOTA', 'kubota'), ('KUBOTA CORPORATION', 'kubota'),
    ('YANMAR', 'yanmar'), ('YANMAR CO.', 'yanmar'),
    ('PERKINS', 'perkins'), ('PERKINS ENGINES', 'perkins'),
    ('DETROIT', 'detroit'), ('DETROIT DIESEL', 'detroit'),
    ('ISUZU', 'isuzu'), ('ISUZU MOTORS', 'isuzu'),
    ('HINO', 'hino'), ('HINO MOTORS', 'hino'),
    ('MITSUBISHI', 'mitsubishi'), ('FORD', 'ford'), ('FORD MOTOR', 'ford'), ('FORD MOTOR COMPANY', 'ford'),
    ('MTU', 'mtu'), ('MTU FRIEDRICHSHAFEN', 'mtu'), ('BAUDOUIN', 'baudouin'),
    ('SCANIA', 'scania'), ('SCANIA AB', 'scania'),
    ('DAF', 'daf'), ('DAF TRUCKS', 'daf'), ('IVECO', 'iveco'),
    ('MAN', 'man'), ('MAN TRUCK & BUS', 'man'), ('MAN TRUCK AND BUS', 'man'),
    ('ATLAS COPCO', 'atlas-copco'), ('INGERSOLL RAND', 'ingersoll-rand'), ('INGERSOLL-RAND', 'ingersoll-rand'),
    ('GARDNER DENVER', 'gardner-denver')
),
raw_elements AS (
  SELECT
    ec.sku AS product_sku,
    elem,
    CASE
      WHEN jsonb_typeof(elem) = 'string'    THEN UPPER(TRIM(elem #>> '{}'))
      WHEN elem->>'equipment' IS NOT NULL   THEN UPPER(TRIM(elem->>'equipment'))
      WHEN elem->>'model'     IS NOT NULL   THEN UPPER(TRIM(elem->>'model'))
      WHEN elem->>'machine'   IS NOT NULL   THEN UPPER(TRIM(elem->>'machine'))
      ELSE NULL
    END AS primary_name_upper,
    CASE
      WHEN jsonb_typeof(elem) = 'string'    THEN 'format_4_plain_string'
      WHEN elem->>'equipment' IS NOT NULL   THEN 'format_1_or_3_equipment_field'
      WHEN elem->>'model'     IS NOT NULL   THEN 'format_2_model_machine'
      ELSE 'unknown'
    END AS source_format
  FROM elimfilters_catalog ec,
       jsonb_array_elements(COALESCE(ec.equipment_applications, '[]'::jsonb)) AS elem
  WHERE ec.sku = ANY($1)
    AND ec.equipment_applications IS NOT NULL
    AND jsonb_array_length(ec.equipment_applications) > 0
    AND elem IS NOT NULL
),
make_model_extracted AS (
  SELECT
    product_sku, primary_name_upper, source_format,
    CASE
      WHEN primary_name_upper LIKE 'INTERNATIONAL HARVESTER%' THEN 'INTERNATIONAL HARVESTER'
      WHEN primary_name_upper LIKE 'NEW HOLLAND%'             THEN 'NEW HOLLAND'
      WHEN primary_name_upper LIKE 'MASSEY FERGUSON%'         THEN 'MASSEY FERGUSON'
      WHEN primary_name_upper LIKE 'MASSEY-FERGUSON%'         THEN 'MASSEY-FERGUSON'
      WHEN primary_name_upper LIKE 'MERCEDES-BENZ%'           THEN 'MERCEDES-BENZ'
      WHEN primary_name_upper LIKE 'MERCEDES BENZ%'           THEN 'MERCEDES BENZ'
      WHEN primary_name_upper LIKE 'GARDNER DENVER%'          THEN 'GARDNER DENVER'
      WHEN primary_name_upper LIKE 'INGERSOLL-RAND%'          THEN 'INGERSOLL-RAND'
      WHEN primary_name_upper LIKE 'INGERSOLL RAND%'          THEN 'INGERSOLL RAND'
      WHEN primary_name_upper LIKE 'ATLAS COPCO%'             THEN 'ATLAS COPCO'
      WHEN primary_name_upper LIKE 'DETROIT DIESEL%'          THEN 'DETROIT DIESEL'
      WHEN primary_name_upper LIKE 'JOHN DEERE%'              THEN 'JOHN DEERE'
      WHEN primary_name_upper LIKE 'CASE IH%'                 THEN 'CASE IH'
      WHEN primary_name_upper LIKE 'MAN TRUCK%'               THEN 'MAN TRUCK & BUS'
      WHEN primary_name_upper LIKE 'DAF TRUCKS%'              THEN 'DAF TRUCKS'
      WHEN primary_name_upper LIKE 'VOLVO TRUCKS%'            THEN 'VOLVO TRUCKS'
      WHEN primary_name_upper LIKE 'HINO MOTORS%'             THEN 'HINO MOTORS'
      WHEN primary_name_upper LIKE 'PERKINS ENGINES%'         THEN 'PERKINS ENGINES'
      WHEN primary_name_upper LIKE 'KOMATSU LTD%'             THEN 'KOMATSU LTD.'
      WHEN primary_name_upper LIKE 'CATERPILLAR INC%'         THEN 'CATERPILLAR INC.'
      WHEN primary_name_upper LIKE 'CUMMINS INC%'             THEN 'CUMMINS INC.'
      WHEN primary_name_upper LIKE 'DEUTZ-FAHR%'              THEN 'DEUTZ-FAHR'
      ELSE SPLIT_PART(primary_name_upper, ' ', 1)
    END AS raw_make_upper
  FROM raw_elements
  WHERE primary_name_upper IS NOT NULL
    AND LENGTH(TRIM(primary_name_upper)) >= 3
),
resolved AS (
  SELECT
    mme.product_sku,
    COALESCE(ma.canonical_slug,
      LOWER(REGEXP_REPLACE(REGEXP_REPLACE(mme.raw_make_upper,'[^A-Z0-9]+','-','g'),'^-|-$','','g'))
    ) AS make_slug,
    LOWER(REGEXP_REPLACE(REGEXP_REPLACE(TRIM(SUBSTR(mme.primary_name_upper,
      CASE
        WHEN mme.raw_make_upper = 'INTERNATIONAL HARVESTER' THEN LENGTH('INTERNATIONAL HARVESTER')+2
        WHEN mme.raw_make_upper = 'NEW HOLLAND'             THEN LENGTH('NEW HOLLAND')+2
        WHEN mme.raw_make_upper = 'MASSEY FERGUSON'         THEN LENGTH('MASSEY FERGUSON')+2
        WHEN mme.raw_make_upper = 'MASSEY-FERGUSON'         THEN LENGTH('MASSEY-FERGUSON')+2
        WHEN mme.raw_make_upper = 'MERCEDES-BENZ'           THEN LENGTH('MERCEDES-BENZ')+2
        WHEN mme.raw_make_upper = 'MERCEDES BENZ'           THEN LENGTH('MERCEDES BENZ')+2
        WHEN mme.raw_make_upper = 'GARDNER DENVER'          THEN LENGTH('GARDNER DENVER')+2
        WHEN mme.raw_make_upper = 'INGERSOLL-RAND'          THEN LENGTH('INGERSOLL-RAND')+2
        WHEN mme.raw_make_upper = 'INGERSOLL RAND'          THEN LENGTH('INGERSOLL RAND')+2
        WHEN mme.raw_make_upper = 'ATLAS COPCO'             THEN LENGTH('ATLAS COPCO')+2
        WHEN mme.raw_make_upper = 'DETROIT DIESEL'          THEN LENGTH('DETROIT DIESEL')+2
        WHEN mme.raw_make_upper = 'JOHN DEERE'              THEN LENGTH('JOHN DEERE')+2
        WHEN mme.raw_make_upper = 'CASE IH'                 THEN LENGTH('CASE IH')+2
        WHEN mme.raw_make_upper = 'MAN TRUCK & BUS'         THEN LENGTH('MAN TRUCK')+2
        WHEN mme.raw_make_upper = 'DAF TRUCKS'              THEN LENGTH('DAF TRUCKS')+2
        WHEN mme.raw_make_upper = 'VOLVO TRUCKS'            THEN LENGTH('VOLVO TRUCKS')+2
        WHEN mme.raw_make_upper = 'HINO MOTORS'             THEN LENGTH('HINO MOTORS')+2
        WHEN mme.raw_make_upper = 'PERKINS ENGINES'         THEN LENGTH('PERKINS ENGINES')+2
        WHEN mme.raw_make_upper = 'KOMATSU LTD.'            THEN LENGTH('KOMATSU LTD.')+2
        WHEN mme.raw_make_upper = 'CATERPILLAR INC.'        THEN LENGTH('CATERPILLAR INC.')+2
        WHEN mme.raw_make_upper = 'CUMMINS INC.'            THEN LENGTH('CUMMINS INC.')+2
        WHEN mme.raw_make_upper = 'DEUTZ-FAHR'              THEN LENGTH('DEUTZ-FAHR')+2
        ELSE LENGTH(mme.raw_make_upper)+2
      END
    )),'[^A-Z0-9]+','-','g'),'^-|-$','','g')) AS model_slug,
    mme.source_format
  FROM make_model_extracted mme
  LEFT JOIN make_aliases ma ON ma.raw_upper = mme.raw_make_upper
),
linked AS (
  SELECT r.product_sku, em.id AS model_id, r.source_format AS notes
  FROM resolved r
  JOIN kg_equipment_makes mk ON mk.slug = r.make_slug
  JOIN kg_equipment_models em ON em.make_id = mk.id AND em.slug = r.model_slug
  WHERE r.model_slug IS NOT NULL
    AND LENGTH(r.model_slug) >= 2
    AND r.model_slug != '-'
)
INSERT INTO kg_product_equipment (product_sku, model_id, notes)
SELECT DISTINCT product_sku, model_id, notes FROM linked
ON CONFLICT (product_sku, model_id) DO NOTHING
"""


async def run():
    # Connection for fetching SKU list (short query)
    conn = await asyncpg.connect(db_url, ssl="require")
    skus = [r["sku"] for r in await conn.fetch("""
        SELECT sku FROM elimfilters_catalog
        WHERE equipment_applications IS NOT NULL
          AND jsonb_array_length(equipment_applications) > 0
        ORDER BY sku
    """)]
    await conn.close()

    total = len(skus)
    print(f"Total SKUs con equipment: {total}")
    print(f"Lotes de {BATCH_SIZE}: {(total + BATCH_SIZE - 1) // BATCH_SIZE}\n")

    inserted_total = 0
    errors = 0

    for batch_start in range(0, total, BATCH_SIZE):
        batch = skus[batch_start:batch_start + BATCH_SIZE]
        batch_num = batch_start // BATCH_SIZE + 1
        total_batches = (total + BATCH_SIZE - 1) // BATCH_SIZE

        try:
            conn = await asyncpg.connect(db_url, ssl="require")
            result = await conn.execute(MAKE_ALIASES_SQL, batch, timeout=90)
            await conn.close()

            # result is like "INSERT 0 N"
            n = int(result.split()[-1]) if result else 0
            inserted_total += n
            print(f"[{batch_num}/{total_batches}] SKUs {batch_start+1}–{batch_start+len(batch)}: +{n} filas")
        except Exception as e:
            errors += 1
            print(f"[{batch_num}/{total_batches}] ERROR: {e!r}")

    print(f"\n{'='*50}")
    print(f"Total filas insertadas: {inserted_total}")
    print(f"Errores de lote:        {errors}")

    # Final count
    conn = await asyncpg.connect(db_url, ssl="require")
    total_pe = await conn.fetchval("SELECT COUNT(*) FROM kg_product_equipment")
    linked = await conn.fetchval("SELECT COUNT(DISTINCT product_sku) FROM kg_product_equipment")
    await conn.close()
    print(f"kg_product_equipment total: {total_pe}")
    print(f"Productos con link:         {linked} / {total}")


asyncio.run(run())
