"""
fill_competitor_codes.py — Poblar competitor_codes desde brand_crossrefs de los JSON Donaldson.

Conecta DIRECTAMENTE a PostgreSQL (sin pasar por el API server de Render)
para actualizar solo los productos con competitor_codes vacío.

Uso:
    python3 fill_competitor_codes.py [--dry-run]

Requiere: pip install psycopg2-binary
"""

import argparse
import glob
import json
import logging
import os

import psycopg2
import psycopg2.extras

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

DB = {
    "host":     "ballast.proxy.rlwy.net",
    "port":     18263,
    "dbname":   "railway",
    "user":     "postgres",
    "password": "qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm",
    "sslmode":  "require",
}
BATCH   = 200
SCRIPTS = os.path.dirname(os.path.abspath(__file__))


def load_all_json():
    """Carga todos los donaldson_*_results.json y extrae (sku, competitor_codes)."""
    rows = {}  # sku → competitor_codes list
    files = sorted(glob.glob(os.path.join(SCRIPTS, "donaldson_*_results.json")))
    for fpath in files:
        cat = os.path.basename(fpath).replace("donaldson_", "").replace("_results.json", "")
        try:
            data = json.load(open(fpath, encoding="utf-8"))
        except Exception as e:
            logging.warning(f"[{cat}] No se pudo leer {fpath}: {e}")
            continue

        total = len(data)
        with_br = 0
        for p in data:
            br = p.get("brand_crossrefs") or {}
            if not br:
                continue
            sku = p.get("sku_elimfilters")
            if not sku:
                continue
            codes = []
            for brand, parts in br.items():
                for pn in (parts or []):
                    if brand and pn:
                        codes.append({"manufacturer": brand.upper(), "code": str(pn).upper()})
            if codes:
                rows[sku] = codes
                with_br += 1

        logging.info(f"[{cat:20}] {total:5} productos | {with_br:5} con brand_crossrefs")

    return rows


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Solo muestra stats, sin escribir al DB")
    args = parser.parse_args()

    rows_map = load_all_json()
    rows = [(sku, json.dumps(codes)) for sku, codes in rows_map.items()]
    logging.info(f"\nTotal productos con competitor_codes para actualizar: {len(rows)}")

    if args.dry_run:
        logging.info("DRY RUN — sin escritura al DB")
        if rows:
            logging.info(f"Ejemplo: {rows[0][0]} → {json.loads(rows[0][1])[:3]}...")
        return

    conn = psycopg2.connect(**DB)
    conn.autocommit = False
    cur  = conn.cursor()

    total_updated = 0
    for i in range(0, len(rows), BATCH):
        batch = rows[i:i + BATCH]
        psycopg2.extras.execute_batch(cur, """
            UPDATE elimfilters_catalog
            SET    competitor_codes = %s::jsonb
            WHERE  sku = %s
              AND  (competitor_codes IS NULL
                    OR jsonb_array_length(COALESCE(competitor_codes,'[]'::jsonb)) = 0)
        """, [(codes, sku) for sku, codes in batch])
        total_updated += cur.rowcount
        conn.commit()
        pct = (i + len(batch)) / len(rows) * 100
        logging.info(f"  Lote {i//BATCH+1}: {cur.rowcount} actualizados | {pct:.0f}%")

    cur.close()
    conn.close()
    logging.info(f"\nDONE: {total_updated} productos actualizados")


if __name__ == "__main__":
    main()
