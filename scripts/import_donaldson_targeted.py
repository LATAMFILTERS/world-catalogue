#!/usr/bin/env python3
"""
import_donaldson_targeted.py
============================
Importa un subconjunto específico de códigos Donaldson desde donaldson_air_results.json
como EA1 SKUs en la DB de ELIMFILTERS.

Paso 1 de 2 del flujo de auditoría Fleetguard:
  - 39 códigos ya están en donaldson_air_results.json → importar con este script
  - 184 códigos faltan → scrapearse con scraper_donaldson_targeted.py primero

El script también acepta un JSON de resultados del scraper targeted como entrada.

Usage:
    # Importar los 39 del JSON existente (usando lista de códigos del audit)
    python import_donaldson_targeted.py \
        --results E:\\scripts\\donaldson_air_results.json \
        --codes C:\\mann\\donaldson_to_scrape.txt \
        --api-key TOKEN \
        --dry-run

    # Importar resultados del scraper targeted (los 184 scraped)
    python import_donaldson_targeted.py \
        --results C:\\mann\\donaldson_targeted_results.json \
        --api-key TOKEN

    # Importar todos los códigos en el JSON (sin filtro)
    python import_donaldson_targeted.py \
        --results E:\\scripts\\donaldson_air_results.json \
        --api-key TOKEN
"""

import argparse
import json
import logging
import re
import time
from pathlib import Path

import requests

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger(__name__)

API_BASE = "https://elimfilters-search-pro.onrender.com"
BATCH_SIZE = 10


def get_headers(api_key):
    return {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
    }


# Donaldson product type detection based on description keywords
DONALDSON_TYPE_MAP = [
    (['FILTRO DE AIRE', 'AIR FILTER', 'PRIMARY', 'SECONDARY', 'PRIMARIO',
      'RADIALSEAL', 'KONEPAC', 'DURALITE', 'PANEL', 'REDONDO', 'ALETAS'],
     {'sku_prefix': 'EA1', 'filter_type': 'Air Filter', 'duty': 'HEAVY_DUTY'}),
    (['AIR FILTER HOUSING', 'CARCASA', 'HOUSING', 'AIR CLEANER ASSEMBLY'],
     {'sku_prefix': 'EA2', 'filter_type': 'Air Filter Housing', 'duty': 'HEAVY_DUTY'}),
    (['CABIN', 'CABINA', 'HABITACULO'],
     {'sku_prefix': 'EC1', 'filter_type': 'Cabin Air Filter', 'duty': 'HEAVY_DUTY'}),
    (['SECADOR', 'AIR DRYER', 'DESICCANT'],
     {'sku_prefix': 'ED4', 'filter_type': 'Air Dryer', 'duty': 'HEAVY_DUTY'}),
    (['RESPIRADERO', 'BREATHER', 'CRANKCASE'],
     {'sku_prefix': 'EA1', 'filter_type': 'Breather', 'duty': 'HEAVY_DUTY'}),
]


def resolve_donaldson_type(description: str, name: str) -> dict:
    """Detect filter type from description/name. Default to EA1 Air Filter."""
    text = f"{description} {name}".upper()
    for keywords, mapping in DONALDSON_TYPE_MAP:
        if any(kw in text for kw in keywords):
            return mapping
    return {'sku_prefix': 'EA1', 'filter_type': 'Air Filter', 'duty': 'HEAVY_DUTY'}


def donaldson_codigo_base(part_number: str) -> str:
    """
    Extract last 4 digits from Donaldson part number.
    P527682 → '7682' | P181044 → '1044' | C085002 → '5002'
    """
    digits = re.sub(r'[^0-9]', '', part_number.strip())
    if not digits:
        return '0000'
    return digits[-4:].zfill(4)


def parse_mm(val) -> float | None:
    if not val:
        return None
    m = re.search(r'\((\d+\.?\d*)\s*mm\)', str(val), re.IGNORECASE)
    if m:
        return float(m.group(1))
    m = re.search(r'(\d+\.?\d*)\s*mm', str(val), re.IGNORECASE)
    if m:
        return float(m.group(1))
    return None


def cross_refs_to_competitor_codes(cross_references: list) -> list:
    """Convert cross_references to competitor_codes format."""
    FILTER_BRANDS = {
        'DONALDSON', 'MANN', 'MANN+HUMMEL', 'MANN-HUMMEL', 'BALDWIN', 'WIX',
        'FRAM', 'PUROLATOR', 'NAPA', 'BOSCH', 'MAHLE', 'FLEETGUARD',
        'HENGST', 'SAKURA', 'LUBER-FINER', 'PARKER', 'PALL', 'HYDAC',
        'CATERPILLAR', 'CAT', 'JOHN DEERE', 'DEERE', 'KOMATSU', 'CUMMINS',
        'CASE', 'HITACHI', 'VOLVO', 'CNH', 'AGCO', 'PERKINS', 'JCB',
        'INGERSOLL RAND', 'ATLAS COPCO', 'GROVE', 'MI-JACK', 'GEHL',
    }
    result = []
    seen = set()
    for ref in (cross_references or []):
        if not isinstance(ref, dict):
            continue
        brand = (ref.get('brand') or ref.get('manufacturer') or '').strip().upper()
        code  = (ref.get('part_number') or ref.get('code') or '').strip().upper()
        if not brand or not code or len(code) < 2:
            continue
        if brand in ('BRAND', 'OEM BRAND', 'MANUFACTURER'):
            continue
        key = f"{brand}|{code}"
        if key not in seen:
            seen.add(key)
            result.append({'manufacturer': brand, 'code': code})
    return result


def map_donaldson_record(prod: dict) -> dict | None:
    """Map a donaldson_air_results.json record to import row format."""
    code = (
        prod.get('part_number') or
        prod.get('base_code') or
        prod.get('source_code') or ''
    ).strip().upper()

    if not code:
        return None
    if prod.get('error') and not prod.get('attributes') and not prod.get('cross_references'):
        return None

    desc = (prod.get('description') or '').strip()
    name = (prod.get('name') or desc or '').strip()

    type_info = resolve_donaldson_type(desc, name)
    attrs = prod.get('attributes') or {}
    if not isinstance(attrs, dict):
        attrs = {}

    specs = {str(k).strip(): str(v).strip() for k, v in attrs.items() if k and v}
    cross_refs = cross_refs_to_competitor_codes(
        prod.get('cross_references') or prod.get('crossrefs') or []
    )
    equipment_raw = prod.get('equipment') or prod.get('equipment_applications') or []
    equipment = []
    seen_eq = set()
    for eq in equipment_raw:
        if not isinstance(eq, dict):
            continue
        make  = (eq.get('make') or '').strip()
        model = (eq.get('model') or eq.get('equipment') or '').strip()
        eng   = (eq.get('engine') or eq.get('engine_code') or '').strip()
        yr    = (eq.get('year') or eq.get('year_range') or '').strip()
        if not make and not model:
            continue
        key = f"{make}|{model}|{eng}|{yr}"
        if key not in seen_eq:
            seen_eq.add(key)
            equipment.append({'make': make, 'model': model, 'engine_code': eng, 'year_range': yr})

    codigo_base = donaldson_codigo_base(code)
    od_mm = parse_mm(specs.get('Largest OD') or specs.get('OD') or specs.get('Outer Diameter'))
    h_mm  = parse_mm(specs.get('Height') or specs.get('Length'))

    return {
        'donaldson_code':  code,
        'filter_type_raw': type_info['filter_type'],
        'sku_prefix':      type_info['sku_prefix'],
        'duty':            type_info['duty'],
        'codigo_base':     codigo_base,
        'name':            name[:200] or None,
        'description':     desc[:600] or None,
        'specs':           specs,
        'competitor_codes':         cross_refs,
        'alternatives':             [p for p in (prod.get('alternatives') or []) if isinstance(p, str)],
        'equipment_applications':   equipment,
        'outer_diameter_mm':        od_mm,
        'height_mm':                h_mm,
    }


def post_batch(batch: list, api_key: str) -> tuple[int, int]:
    """POST a batch to /api/import/donaldson. Returns (ok, failed)."""
    for attempt in range(3):
        try:
            r = requests.post(
                f"{API_BASE}/api/import/donaldson",
                json={'products': batch},
                headers=get_headers(api_key),
                timeout=60,
            )
            if r.status_code == 200:
                result = r.json()
                imported = result.get('imported', len(batch))
                skipped  = result.get('skipped', 0)
                errors   = result.get('errors', [])
                if errors:
                    for e in errors[:3]:
                        log.warning(f"    Error: {e}")
                return imported, skipped
            else:
                log.error(f"    HTTP {r.status_code}: {r.text[:200]}")
                if attempt < 2:
                    time.sleep(5 * (attempt + 1))
        except requests.RequestException as e:
            log.warning(f"    Request error: {e}")
            if attempt < 2:
                time.sleep(5 * (attempt + 1))
    return 0, len(batch)


def run(args):
    results_path = Path(args.results)

    # Load results JSON
    with open(results_path, encoding='utf-8') as f:
        data = json.load(f)

    if isinstance(data, dict) and 'results' in data:
        products = data['results']
    elif isinstance(data, list):
        products = data
    else:
        products = list(data.values()) if isinstance(data, dict) else []

    log.info(f"Loaded {len(products)} products from {results_path.name}")

    # Filter to specific codes if --codes provided
    filter_codes = None
    if args.codes:
        codes_path = Path(args.codes)
        with open(codes_path, encoding='utf-8') as f:
            # Accept codes we want to IMPORT (not the "to scrape" list)
            # If user passes donaldson_to_scrape.txt, those are the 184 NOT in JSON
            # The 39 that ARE in JSON are: all codes in JSON MINUS the 184
            raw_filter = set(l.strip().upper() for l in f if l.strip())

        if args.codes_mode == 'exclude':
            # Exclude these codes (useful to import only the 39: exclude the 184)
            filter_codes = None
            products_filtered = [
                p for p in products
                if (p.get('part_number') or p.get('base_code') or '').strip().upper() not in raw_filter
            ]
            log.info(f"Excluding {len(raw_filter)} codes → {len(products_filtered)} to import")
            products = products_filtered
        else:
            # Include only these codes
            filter_codes = raw_filter
            products_filtered = [
                p for p in products
                if (p.get('part_number') or p.get('base_code') or '').strip().upper() in filter_codes
            ]
            log.info(f"Filtered to {len(filter_codes)} codes → {len(products_filtered)} found in JSON")
            products = products_filtered

    # Map records
    rows = []
    skipped_map = 0
    for prod in products:
        row = map_donaldson_record(prod)
        if row:
            rows.append(row)
        else:
            skipped_map += 1

    log.info(f"Mapped: {len(rows)} rows | Skipped (no data): {skipped_map}")

    if not rows:
        log.info("Nothing to import.")
        return

    if args.dry_run:
        log.info(f"\n[DRY-RUN] Would import {len(rows)} Donaldson EA1 SKUs:")
        for r in rows[:10]:
            log.info(f"  {r['sku_prefix']}{r['codigo_base']} ← {r['donaldson_code']} ({r['filter_type_raw']})")
        if len(rows) > 10:
            log.info(f"  ... and {len(rows)-10} more")
        return

    # Import in batches
    total_ok = 0
    total_skip = 0
    for i in range(0, len(rows), BATCH_SIZE):
        batch = rows[i:i + BATCH_SIZE]
        ok, skip = post_batch(batch, args.api_key)
        total_ok   += ok
        total_skip += skip
        log.info(f"  [{min(i+BATCH_SIZE, len(rows))}/{len(rows)}] imported={total_ok} skipped={total_skip}")
        time.sleep(0.5)

    log.info(f"\n{'='*55}")
    log.info(f"DONE: {total_ok} imported | {total_skip} skipped/errors")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Import targeted Donaldson codes as EA1 SKUs')
    parser.add_argument('--results',    required=True, help='donaldson_air_results.json or targeted scrape results')
    parser.add_argument('--api-key',    required=True)
    parser.add_argument('--codes',      default='',    help='Text file with codes to filter (one per line)')
    parser.add_argument('--codes-mode', default='exclude', choices=['include', 'exclude'],
                        help='include=only these codes | exclude=skip these codes (default: exclude)')
    parser.add_argument('--dry-run',    action='store_true')
    args = parser.parse_args()
    run(args)
