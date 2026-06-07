"""
fill_competitor_codes.py — Poblate competitor_codes desde brand_crossrefs de los JSON Donaldson.

El script recover-competitor-codes.js buscaba en oilfilter-crossreference.com,
que solo tiene aceite. Los datos reales están en brand_crossrefs de los JSON del
scraper. Este script los extrae y actualiza SOLO productos con competitor_codes
vacío en el DB (nunca sobreescribe datos existentes).

Uso:
    python3 fill_competitor_codes.py [--dry-run]

Requiere: pip install requests
"""

import argparse
import glob
import json
import logging
import os
import time

import requests

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

API_URL = "https://elimfilters-search-pro.onrender.com/api/migrate/fill-competitor-codes"
API_KEY = "elim2026"
BATCH   = 50
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


def post_batch(batch, dry_run=False):
    if dry_run:
        return {"success": True, "updated": len(batch), "skipped": 0, "errors": 0, "total": len(batch)}
    payload = {"key": API_KEY, "rows": batch}
    for attempt in range(4):
        try:
            r = requests.post(API_URL, json=payload, timeout=60, verify=False)
            if not r.text:
                raise ValueError("Respuesta vacía del servidor")
            return r.json()
        except Exception as e:
            wait = 2 ** attempt
            logging.warning(f"  Intento {attempt+1} fallido: {e}. Reintentando en {wait}s...")
            time.sleep(wait)
    return {"success": False, "error": "Todos los reintentos fallaron", "errors": len(batch)}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Solo muestra stats, no envía al API")
    args = parser.parse_args()

    rows_map = load_all_json()
    rows = [{"sku": sku, "competitor_codes": codes} for sku, codes in rows_map.items()]
    logging.info(f"\nTotal productos con competitor_codes para enviar: {len(rows)}")

    if args.dry_run:
        logging.info("DRY RUN — no se hacen llamadas al API")
        if rows:
            sku, codes = rows[0]["sku"], rows[0]["competitor_codes"]
            logging.info(f"Ejemplo: {sku} → {codes[:3]}...")
        return

    total_updated = total_skipped = total_errors = 0
    for i in range(0, len(rows), BATCH):
        batch = rows[i:i + BATCH]
        result = post_batch(batch)
        total_updated  += result.get("updated", 0)
        total_skipped  += result.get("skipped", 0)
        total_errors   += result.get("errors", 0)
        pct = (i + len(batch)) / len(rows) * 100
        logging.info(f"  Lote {i//BATCH+1}: {result.get('updated',0)} actualizados | "
                     f"{result.get('skipped',0)} ya tenían datos | {pct:.0f}%")

    logging.info(f"\nDONE: {total_updated} actualizados | "
                 f"{total_skipped} omitidos (ya tenían datos) | {total_errors} errores")


if __name__ == "__main__":
    main()
