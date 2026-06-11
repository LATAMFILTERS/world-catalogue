"""
crosslink_fg_don_db.py — Cross-link Fleetguard ↔ Donaldson in DB

Uses two matching methods:
  Pass A: Donaldson brand_crossrefs['FLEETGUARD'] → JOIN Fleetguard codigo_base
  Pass B: Shared OEM codes (oem_codes manufacturer+part_number match)

Then updates competitor_codes bidirectionally:
  - Donaldson row gets {"brand":"FLEETGUARD","part_number":"LF3620","linked_sku":"EL80001"}
  - Fleetguard row gets {"brand":"DONALDSON","part_number":"P553000","linked_sku":"EL80002"}

Usage:
    DATABASE_URL=postgresql://... python crosslink_fg_don_db.py [--dry-run] [--stats-only]
"""

import asyncio, os, sys, json, argparse

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

import asyncpg

db_url = os.environ.get("DATABASE_URL")
if not db_url:
    print("ERROR: DATABASE_URL not set")
    sys.exit(1)

# ─── SQL Queries ──────────────────────────────────────────────────────────────

SQL_PASS_A = """
-- Pass A: Donaldson brand_crossrefs['FLEETGUARD'] → Fleetguard codigo_base
SELECT
    d.sku          AS don_sku,
    d.codigo_base  AS don_code,
    fg_pn.value    AS fg_code,
    f.sku          AS fg_sku
FROM elimfilters_catalog d
CROSS JOIN LATERAL jsonb_array_elements_text(d.brand_crossrefs->'FLEETGUARD') fg_pn(value)
JOIN elimfilters_catalog f
    ON upper(trim(f.codigo_base)) = upper(trim(fg_pn.value))
WHERE d.brand_crossrefs ? 'FLEETGUARD'
  AND f.sku IS NOT NULL
"""

SQL_PASS_B = """
-- Pass B: Shared OEM codes between FG and Donaldson
WITH fg_oem AS (
    SELECT
        f.sku                          AS fg_sku,
        f.codigo_base                  AS fg_code,
        upper(trim(o->>'manufacturer')) AS mfr,
        upper(trim(o->>'part_number'))  AS oem_pn
    FROM elimfilters_catalog f
    CROSS JOIN LATERAL jsonb_array_elements(f.oem_codes) o
    WHERE jsonb_array_length(f.oem_codes) > 0
),
don_oem AS (
    SELECT
        d.sku                          AS don_sku,
        d.codigo_base                  AS don_code,
        upper(trim(o->>'manufacturer')) AS mfr,
        upper(trim(o->>'part_number'))  AS oem_pn
    FROM elimfilters_catalog d
    CROSS JOIN LATERAL jsonb_array_elements(d.oem_codes) o
    WHERE jsonb_array_length(d.oem_codes) > 0
)
SELECT DISTINCT
    fg.fg_sku,
    fg.fg_code,
    don.don_sku,
    don.don_code,
    fg.mfr    AS shared_brand,
    fg.oem_pn AS shared_code
FROM fg_oem fg
JOIN don_oem don
    ON fg.oem_pn = don.oem_pn
    AND fg.mfr   = don.mfr
    AND fg.fg_sku <> don.don_sku
WHERE fg.mfr NOT IN (
    'DONALDSON','FLEETGUARD','CUMMINS FILTRATION','BALDWIN','MANN','WIX',
    'PUROLATOR','FRAM','NAPA','HASTINGS','LUBER-FINER','BOSCH','MAHLE',
    'HENGST','FILTREC','HYDAC','PALL','PARKER'
)
"""

SQL_UPDATE_DON = """
UPDATE elimfilters_catalog
SET competitor_codes = (
    CASE
        WHEN competitor_codes IS NULL THEN '[]'::jsonb
        ELSE competitor_codes
    END
    || $1::jsonb
)
WHERE sku = $2
  AND NOT (competitor_codes @> $1::jsonb)
"""

SQL_UPDATE_FG = """
UPDATE elimfilters_catalog
SET competitor_codes = (
    CASE
        WHEN competitor_codes IS NULL THEN '[]'::jsonb
        ELSE competitor_codes
    END
    || $1::jsonb
)
WHERE sku = $2
  AND NOT (competitor_codes @> $1::jsonb)
"""


async def run(dry_run=False, stats_only=False):
    import ssl as _ssl
    ssl_ctx = _ssl.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = _ssl.CERT_NONE
    conn = await asyncpg.connect(db_url, ssl=ssl_ctx, command_timeout=300)
    try:
        # ── Pass A ────────────────────────────────────────────────────────────
        print("Pass A: brand_crossrefs['FLEETGUARD'] → codigo_base ...")
        rows_a = await conn.fetch(SQL_PASS_A)
        print(f"  {len(rows_a)} pairs encontrados")

        # ── Pass B ────────────────────────────────────────────────────────────
        print("Pass B: OEM codes compartidos ...")
        rows_b = await conn.fetch(SQL_PASS_B)
        print(f"  {len(rows_b)} pairs encontrados")

        # ── Deduplicate ───────────────────────────────────────────────────────
        # Key: (don_sku, fg_sku) — prefer Pass A
        pairs = {}
        for r in rows_a:
            key = (r["don_sku"], r["fg_sku"])
            pairs[key] = {"don_sku": r["don_sku"], "don_code": r["don_code"],
                          "fg_sku": r["fg_sku"],  "fg_code": r["fg_code"],
                          "method": "BRAND_CROSSREF"}
        for r in rows_b:
            key = (r["don_sku"], r["fg_sku"])
            if key not in pairs:
                pairs[key] = {"don_sku": r["don_sku"], "don_code": r["don_code"],
                              "fg_sku": r["fg_sku"],  "fg_code": r["fg_code"],
                              "method": f"SHARED_OEM:{r['shared_brand']}:{r['shared_code']}"}

        total = len(pairs)
        fg_matched  = len({p["fg_sku"]  for p in pairs.values()})
        don_matched = len({p["don_sku"] for p in pairs.values()})

        # Stats query
        total_fg  = await conn.fetchval(
            "SELECT COUNT(*) FROM elimfilters_catalog WHERE sub_type ILIKE '%Fleetguard%'")
        total_don = await conn.fetchval(
            "SELECT COUNT(*) FROM elimfilters_catalog WHERE sub_type NOT ILIKE '%Fleetguard%' OR sub_type IS NULL")

        print(f"""
=== CROSSLINK FLEETGUARD ↔ DONALDSON (DB) ===
Fleetguard en DB:  {total_fg}
Donaldson en DB:   {total_don}

Pairs únicos:      {total}
  Pass A (brand):  {sum(1 for p in pairs.values() if p['method']=='BRAND_CROSSREF')}
  Pass B (OEM):    {sum(1 for p in pairs.values() if p['method'].startswith('SHARED_OEM'))}

FG con match:      {fg_matched} / {total_fg} ({fg_matched/total_fg*100:.1f}%)
FG sin match:      {total_fg - fg_matched} / {total_fg} ({(total_fg-fg_matched)/total_fg*100:.1f}%)
DON con match:     {don_matched} / {total_don} ({don_matched/total_don*100:.1f}%)
DON sin match:     {total_don - don_matched} / {total_don} ({(total_don-don_matched)/total_don*100:.1f}%)
""")

        if stats_only:
            return

        if dry_run:
            print("[DRY-RUN] No DB updates. Muestra primeros 5 pairs:")
            for p in list(pairs.values())[:5]:
                print(f"  DON {p['don_code']} ({p['don_sku']}) ↔ FG {p['fg_code']} ({p['fg_sku']}) [{p['method']}]")
            return

        # ── Update DB bidirectionally ─────────────────────────────────────────
        print("Actualizando competitor_codes en DB ...")
        updated_don = updated_fg = 0

        for p in pairs.values():
            # Add FG ref to DON row
            fg_entry = json.dumps([{
                "brand": "FLEETGUARD",
                "part_number": p["fg_code"],
                "linked_sku": p["fg_sku"]
            }])
            r = await conn.execute(SQL_UPDATE_DON, fg_entry, p["don_sku"])
            if r != "UPDATE 0":
                updated_don += 1

            # Add DON ref to FG row
            don_entry = json.dumps([{
                "brand": "DONALDSON",
                "part_number": p["don_code"],
                "linked_sku": p["don_sku"]
            }])
            r = await conn.execute(SQL_UPDATE_FG, don_entry, p["fg_sku"])
            if r != "UPDATE 0":
                updated_fg += 1

        print(f"✅ DON rows actualizados: {updated_don}")
        print(f"✅ FG rows actualizados:  {updated_fg}")

    finally:
        await conn.close()


API_URL = "https://elimfilters-search-pro.onrender.com/api/crosslink/fg-don"
API_KEY = "elim2026"


def run_via_api(dry_run=False, stats_only=False):
    import requests
    payload = {"key": API_KEY, "dry_run": dry_run, "stats_only": stats_only}
    print(f"→ POST {API_URL} (dry_run={dry_run}, stats_only={stats_only}) ...")
    r = requests.post(API_URL, json=payload, timeout=300)
    r.raise_for_status()
    data = r.json()
    s = data.get("stats", {})
    print(f"""
=== CROSSLINK FLEETGUARD ↔ DONALDSON ===
Fleetguard en DB:  {s.get('total_fg')}
Donaldson en DB:   {s.get('total_don')}

Pairs únicos:      {s.get('pairs')}
  Pass A (brand):  {s.get('pass_a')}
  Pass B (OEM):    {s.get('pass_b')}

FG con match:      {s.get('fg_matched')} / {s.get('total_fg')} ({s.get('fg_match_pct')}%)
FG sin match:      {s.get('fg_unmatched')} / {s.get('total_fg')}
DON con match:     {s.get('don_matched')} / {s.get('total_don')} ({s.get('don_match_pct')}%)
DON sin match:     {s.get('don_unmatched')} / {s.get('total_don')}
""")
    if not stats_only and not dry_run:
        print(f"✅ DON rows actualizados: {data.get('updated_don')}")
        print(f"✅ FG rows actualizados:  {data.get('updated_fg')}")
    if data.get("sample"):
        print("Muestra pairs:")
        for p in data["sample"]:
            print(f"  {p['don']} ↔ {p['fg']} [{p['method']}]")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run",    action="store_true")
    parser.add_argument("--stats-only", action="store_true")
    parser.add_argument("--direct",     action="store_true", help="Conectar directo a DB (requiere DATABASE_URL)")
    args = parser.parse_args()

    if args.direct:
        asyncio.run(run(dry_run=args.dry_run, stats_only=args.stats_only))
    else:
        run_via_api(dry_run=args.dry_run, stats_only=args.stats_only)
