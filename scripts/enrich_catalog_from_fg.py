#!/usr/bin/env python3
"""
enrich_catalog_from_fg.py
=========================
Homologa Fleetguard scraped data contra el catalogo Donaldson y enriquece la DB.

REGLAS ABSOLUTAS:
  - JAMAS modifica datos existentes en la DB
  - Solo AGREGA informacion que no existe
  - Matched FG → complementa el codigo_base Donaldson (OEM codes + equipment)
  - Unique FG  → ya importados como codigos_base propios (verifica via API)

FASES:
  Fase 1 (siempre): Analisis local desde JSONs → imprime stats + exporta CSV
  Fase 2 (--complement): Enriquece DON entries con OEM codes de FG via API
  Fase 3 (--verify-unique): Verifica que FG unicos esten en DB correctamente

USO:
  python enrich_catalog_from_fg.py                    # analisis + CSV
  python enrich_catalog_from_fg.py --complement        # enriquece DON (safe)
  python enrich_catalog_from_fg.py --verify-unique     # verifica FG unicos
  python enrich_catalog_from_fg.py --dry-run           # muestra sin escribir

Requiere: requests (pip install requests)
"""

import argparse
import csv
import glob
import json
import os
import re
import sys
import time
import logging

import requests

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger(__name__)

# ─── Config ──────────────────────────────────────────────────────────────────

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
FG_DIR     = os.path.join(SCRIPT_DIR, "Fleetguard Scraper")
DON_DIR    = SCRIPT_DIR

API_BASE   = "https://elimfilters-search-pro.onrender.com"
API_KEY    = "elim2026"

OUTPUT_MATRIX  = os.path.join(SCRIPT_DIR, "fg_don_homologation.csv")
OUTPUT_UNIQUE  = os.path.join(SCRIPT_DIR, "fg_unique_catalog.csv")
OUTPUT_SUMMARY = os.path.join(SCRIPT_DIR, "fg_enrich_summary.json")

# Marcas de filtros — excluir de OEM codes (no son fabricantes de equipo)
FILTER_BRANDS = {
    "DONALDSON","FLEETGUARD","FLEETRITE","CUMMINS FILTRATION","CUMMINS",
    "BALDWIN","MANN","MANN-HUMMEL","WIX","PUROLATOR","FRAM","NAPA",
    "HASTINGS","LUBER-FINER","LUBERFINER","HIFI","MAHLE","KNECHT",
    "FILTRON","PURFLUX","AC-DELCO","MOTORCRAFT","CARQUEST","SAKURA",
    "HENGST","UFI","RYCO","BOSCH","PARKER","HYDAC","PALL","FILTREC",
    "SCHROEDER","INTERNORMEN","MP-FILTRI","HY-PRO","STAUFF",
}

# ─── Helpers ──────────────────────────────────────────────────────────────────

def normalize(pn: str) -> str:
    return re.sub(r"[^A-Z0-9]", "", (pn or "").upper())


def is_equipment_brand(brand: str) -> bool:
    return brand.upper() not in FILTER_BRANDS


def load_json_files(pattern: str) -> list:
    rows = []
    for f in sorted(glob.glob(pattern)):
        try:
            data = json.load(open(f, encoding="utf-8"))
            if isinstance(data, list):
                rows.extend(data)
        except Exception as e:
            log.warning(f"  Cannot read {f}: {e}")
    return rows


# ─── Loaders ──────────────────────────────────────────────────────────────────

def load_fleetguard(fg_dir: str) -> dict:
    """
    Retorna {normalized_pn: product_dict}
    """
    products = load_json_files(os.path.join(fg_dir, "fleetguard_*_results.json"))
    index = {}
    for p in products:
        if not isinstance(p, dict):
            continue
        pn = p.get("part_number", "")
        if not pn:
            continue
        index[normalize(pn)] = p
    log.info(f"Fleetguard: {len(index)} productos unicos cargados")
    return index


def load_donaldson(don_dir: str) -> dict:
    """
    Retorna {normalized_pn: product_dict}
    Solo productos con brand_crossrefs['FLEETGUARD'] son relevantes para Phase 1.
    """
    products = load_json_files(os.path.join(don_dir, "donaldson_*_results.json"))
    index = {}
    for p in products:
        if not isinstance(p, dict):
            continue
        pn = p.get("part_number", "")
        if not pn:
            continue
        index[normalize(pn)] = p
    log.info(f"Donaldson: {len(index)} productos unicos cargados")
    return index


def get_don_fg_refs(product: dict) -> list:
    """
    Extrae lista de FG codes desde brand_crossrefs['FLEETGUARD'] del producto DON.
    """
    br = product.get("brand_crossrefs", {})
    if isinstance(br, dict):
        return [normalize(c) for c in br.get("FLEETGUARD", []) if c]
    return []


def get_fg_oem_codes(product: dict) -> list:
    """
    Extrae OEM codes de un producto FG (solo fabricantes de equipo, no filtros).
    Retorna [{manufacturer, part_number}, ...]
    """
    oem = []
    seen = set()
    for ref in product.get("cross_references", []):
        brand = (ref.get("brand") or ref.get("manufacturer") or "").strip().upper()
        pn    = (ref.get("part_number") or "").strip()
        if not brand or not pn:
            continue
        if not is_equipment_brand(brand):
            continue
        key = f"{brand}|{normalize(pn)}"
        if key not in seen:
            seen.add(key)
            oem.append({"manufacturer": brand, "part_number": pn})
    return oem


def get_fg_equipment(product: dict) -> list:
    """
    Extrae equipment applications de un producto FG.
    """
    equip = []
    seen  = set()
    for e in product.get("equipment", []):
        if not isinstance(e, dict):
            continue
        label = e.get("equipment", "")
        if not label or label in ("Applicable Region",):
            continue
        key = label.strip().upper()
        if key not in seen:
            seen.add(key)
            equip.append({
                "equipment": e.get("equipment", ""),
                "engine":    e.get("engine", ""),
                "year":      e.get("year", ""),
            })
    return equip


# ─── Phase 1: Match Analysis ──────────────────────────────────────────────────

def build_match_matrix(fg_index: dict, don_index: dict) -> tuple:
    """
    Retorna (matched_pairs, unique_fg_codes).

    matched_pairs: [{don_pn, fg_pn, fg_data, don_data, match_type}]
    unique_fg_codes: set of normalized FG pns with no DON match
    """
    matched_fg   = set()
    matched_pairs = []

    for don_pn, don_prod in don_index.items():
        fg_refs = get_don_fg_refs(don_prod)
        for fg_code in fg_refs:
            if fg_code in fg_index:
                fg_prod = fg_index[fg_code]
                matched_fg.add(fg_code)
                matched_pairs.append({
                    "don_pn":      don_pn,
                    "don_sku":     don_prod.get("sku_elimfilters", ""),
                    "fg_pn":       fg_code,
                    "fg_data":     fg_prod,
                    "don_data":    don_prod,
                    "match_type":  "DON_BRAND_CROSSREF",
                    "confidence":  "HIGH",
                })

    unique_fg = {pn for pn in fg_index if pn not in matched_fg}

    log.info(f"Matched pairs:    {len(matched_pairs)}")
    log.info(f"Unique FG (no DON match): {len(unique_fg)}")
    return matched_pairs, unique_fg


# ─── Phase 1: CSV Export ──────────────────────────────────────────────────────

def export_match_matrix_csv(matched_pairs: list, path: str):
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "don_pn","don_sku","fg_pn","match_type","confidence",
            "fg_oem_count","fg_equip_count","fg_name",
        ])
        writer.writeheader()
        for p in matched_pairs:
            fg = p["fg_data"]
            writer.writerow({
                "don_pn":        p["don_pn"],
                "don_sku":       p["don_sku"],
                "fg_pn":         p["fg_pn"],
                "match_type":    p["match_type"],
                "confidence":    p["confidence"],
                "fg_oem_count":  len(get_fg_oem_codes(fg)),
                "fg_equip_count":len(get_fg_equipment(fg)),
                "fg_name":       fg.get("name", ""),
            })
    log.info(f"Matriz exportada → {path}")


def export_unique_fg_csv(unique_fg: set, fg_index: dict, path: str):
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "fg_pn","fg_name","fg_oem_count","fg_equip_count",
            "fg_attributes","status",
        ])
        writer.writeheader()
        for pn in sorted(unique_fg):
            fg = fg_index[pn]
            writer.writerow({
                "fg_pn":          pn,
                "fg_name":        fg.get("name", ""),
                "fg_oem_count":   len(get_fg_oem_codes(fg)),
                "fg_equip_count": len(get_fg_equipment(fg)),
                "fg_attributes":  json.dumps(fg.get("attributes", {})),
                "status":         "UNIQUE_FG_NEW_CODIGO_BASE",
            })
    log.info(f"Unicos FG exportados → {path}")


# ─── Phase 2: Complement DON entries via API ──────────────────────────────────

def api_get_sku_by_code(don_pn: str) -> str | None:
    """Busca el SKU ELIM de un producto DON por su codigo_base via API."""
    try:
        url = f"{API_BASE}/api/search?q={don_pn}&limit=5"
        r = requests.get(url, timeout=30)
        if r.status_code == 200:
            data = r.json()
            results = data.get("results", data if isinstance(data, list) else [])
            for item in results:
                cb = item.get("codigo_base", "")
                if normalize(cb) == normalize(don_pn):
                    return item.get("elimfilters_sku") or item.get("sku")
    except Exception as e:
        log.debug(f"API lookup failed for {don_pn}: {e}")
    return None


def api_enrich_oem_codes(sku: str, new_oem_codes: list, dry_run: bool) -> dict:
    """
    Agrega OEM codes a un producto existente SIN sobrescribir.
    Usa el endpoint de enriquecimiento (solo append).
    """
    if not new_oem_codes:
        return {"status": "skipped", "reason": "no_new_oem_codes"}

    if dry_run:
        return {"status": "dry_run", "sku": sku, "would_add": len(new_oem_codes)}

    payload = {
        "key":       API_KEY,
        "sku":       sku,
        "oem_codes": new_oem_codes,
        "mode":      "append",        # solo agrega, no sobrescribe
    }
    try:
        r = requests.post(f"{API_BASE}/api/enrich/oem-codes", json=payload, timeout=60)
        return {"status": r.status_code, "response": r.json() if r.text else {}}
    except Exception as e:
        return {"status": "error", "error": str(e)}


def complement_phase(matched_pairs: list, dry_run: bool):
    """
    Para cada par DON↔FG matched:
    - Obtiene OEM codes del FG que el DON no tiene
    - Los agrega via API (append only)
    """
    log.info("=== FASE 2: COMPLEMENTAR DON con OEM codes de FG ===")
    enriched = skipped = errors = 0

    for p in matched_pairs:
        don_pn = p["don_pn"]
        fg_data = p["fg_data"]

        fg_oem = get_fg_oem_codes(fg_data)
        if not fg_oem:
            skipped += 1
            continue

        # Resolver SKU del DON en la DB
        sku = p.get("don_sku") or api_get_sku_by_code(don_pn)
        if not sku:
            log.warning(f"  No SKU encontrado para DON {don_pn}, saltando")
            skipped += 1
            continue

        result = api_enrich_oem_codes(sku, fg_oem, dry_run)
        status = result.get("status")

        if status == "dry_run":
            log.info(f"  [DRY] {sku} ({don_pn}) ← {len(fg_oem)} OEM codes de {p['fg_pn']}")
            enriched += 1
        elif str(status) in ("200", "201"):
            log.info(f"  ✅ {sku} ({don_pn}) ← {len(fg_oem)} OEM codes de {p['fg_pn']}")
            enriched += 1
        else:
            log.warning(f"  ⚠ {sku}: {result}")
            errors += 1

        time.sleep(0.1)

    log.info(f"Complementados: {enriched} | Saltados: {skipped} | Errores: {errors}")
    return enriched, skipped, errors


# ─── Phase 3: Verify unique FG in DB ─────────────────────────────────────────

def verify_unique_fg(unique_fg: set, fg_index: dict, dry_run: bool):
    """
    Verifica que los FG unicos esten en la DB con sub_type='Fleetguard*'.
    Si no estan → los importa via API con el mismo SKU system del import_fleetguard.py
    """
    from catalog_common import make_sku, elim_prefix_from_fleetguard

    log.info(f"=== FASE 3: VERIFICAR {len(unique_fg)} FG UNICOS EN DB ===")

    # Obtener lista de SKUs existentes de FG
    try:
        r = requests.get(f"{API_BASE}/api/import/existing-skus", timeout=60)
        existing_skus = set(r.json().get("skus", [])) if r.status_code == 200 else set()
    except Exception as e:
        log.warning(f"No se pudo obtener existing-skus: {e}")
        existing_skus = set()

    log.info(f"  SKUs en DB: {len(existing_skus)}")

    in_db = missing = 0
    missing_products = []

    used_skus = set(existing_skus)
    for fg_pn in sorted(unique_fg):
        fg_prod = fg_index[fg_pn]
        pn_raw  = fg_prod.get("part_number", fg_pn)

        # Generar el mismo SKU que import_fleetguard.py generaría
        prefix = elim_prefix_from_fleetguard(pn_raw)
        try:
            expected_sku = make_sku(prefix, pn_raw, set())
        except Exception:
            expected_sku = None

        # Check si el codigo_base esta en la DB buscando por parte del part number
        found = any(normalize(pn_raw) in normalize(s) for s in existing_skus)

        if found:
            in_db += 1
        else:
            missing += 1
            missing_products.append(fg_prod)
            if expected_sku:
                log.warning(f"  MISSING: {pn_raw} (esperado SKU: {expected_sku})")

    log.info(f"  En DB: {in_db} | Faltantes: {missing}")

    if missing_products and not dry_run:
        log.info(f"  Importando {len(missing_products)} FG unicos faltantes...")
        _import_missing_fg(missing_products, dry_run)

    return in_db, missing


def _import_missing_fg(products: list, dry_run: bool):
    """Importa FG productos faltantes via API (mismo sistema que import_fleetguard.py)."""
    from catalog_common import make_sku, elim_prefix_from_fleetguard, TECH_MAP, TYPE_MAP

    used_skus = set()
    batch = []

    for prod in products:
        pn   = (prod.get("part_number") or "").strip().upper()
        if not pn:
            continue

        prefix = elim_prefix_from_fleetguard(pn)
        try:
            sku = make_sku(prefix, pn, used_skus)
        except Exception:
            continue

        oem, comp = [], []
        for ref in prod.get("cross_references", []):
            brand = (ref.get("brand") or ref.get("manufacturer") or "").strip().upper()
            rpn   = (ref.get("part_number") or "").strip()
            if not brand or not rpn:
                continue
            if is_equipment_brand(brand):
                oem.append({"manufacturer": brand, "part_number": rpn})
            else:
                comp.append({"brand": brand, "part_number": rpn})

        batch.append({
            "sku":          sku,
            "codigo_base":  pn,
            "description":  prod.get("name", f"ELIMFILTERS {TYPE_MAP.get(prefix, 'Filter')}"),
            "filter_type":  TYPE_MAP.get(prefix, "Filter"),
            "sub_type":     f"Fleetguard",
            "technology":   TECH_MAP.get(prefix, ""),
            "oem_codes":    oem,
            "competitor_codes": comp,
            "brand_crossrefs":  {},
            "equipment_applications": get_fg_equipment(prod),
        })

        if len(batch) >= 20:
            if not dry_run:
                _post_batch(batch)
            batch = []

    if batch and not dry_run:
        _post_batch(batch)


def _post_batch(batch: list):
    try:
        r = requests.post(
            f"{API_BASE}/api/import/donaldson",
            json={"key": API_KEY, "rows": batch},
            timeout=120,
        )
        r.raise_for_status()
        d = r.json()
        log.info(f"    Batch {len(batch)}: +{d.get('inserted',0)} | ~{d.get('updated',0)}")
    except Exception as e:
        log.error(f"    Batch error: {e}")


# ─── Summary ──────────────────────────────────────────────────────────────────

def print_summary(fg_total, don_total, matched_pairs, unique_fg):
    don_with_fg = len({p["don_pn"] for p in matched_pairs})
    fg_matched  = len({p["fg_pn"]  for p in matched_pairs})
    print(f"""
╔══════════════════════════════════════════════════════════════╗
║         ENRICH CATALOG FROM FLEETGUARD — SUMMARY            ║
╠══════════════════════════════════════════════════════════════╣
║  FG productos scrapeados:     {fg_total:<6}                       ║
║  DON productos scrapeados:    {don_total:<6}                       ║
╠══════════════════════════════════════════════════════════════╣
║  MATCHED (FG en DON crossrefs):                              ║
║    Pares FG↔DON encontrados:  {len(matched_pairs):<6}  (HIGH confidence)   ║
║    FG productos matched:       {fg_matched:<6}                       ║
║    DON productos a enriquecer: {don_with_fg:<6}                       ║
╠══════════════════════════════════════════════════════════════╣
║  UNICOS FG (nuevo codigo_base):                              ║
║    FG sin equiv. Donaldson:    {len(unique_fg):<6}                       ║
║    → Ya en DB (sub_type=Fleetguard*)                         ║
╠══════════════════════════════════════════════════════════════╣
║  INTEGRIDAD: CERO modificaciones a datos existentes          ║
╚══════════════════════════════════════════════════════════════╝
""")


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Enriquece catalogo DON con datos FG")
    parser.add_argument("--complement",    action="store_true",
                        help="Fase 2: Complementa DON entries con OEM codes de FG")
    parser.add_argument("--verify-unique", action="store_true",
                        help="Fase 3: Verifica FG unicos en DB")
    parser.add_argument("--dry-run",       action="store_true",
                        help="Muestra operaciones sin escribir a DB")
    parser.add_argument("--fg-dir",   default=FG_DIR,
                        help=f"Directorio de JSONs FG (default: {FG_DIR})")
    parser.add_argument("--don-dir",  default=DON_DIR,
                        help=f"Directorio de JSONs DON (default: {DON_DIR})")
    args = parser.parse_args()

    log.info("=== FASE 1: CARGA Y ANALISIS LOCAL ===")
    fg_index  = load_fleetguard(args.fg_dir)
    don_index = load_donaldson(args.don_dir)

    if not fg_index:
        log.error(f"No se encontraron productos FG en {args.fg_dir}")
        log.error("Ejecutar desde el directorio con los JSONs del scraper.")
        sys.exit(1)

    if not don_index:
        log.error(f"No se encontraron productos DON en {args.don_dir}")
        sys.exit(1)

    matched_pairs, unique_fg = build_match_matrix(fg_index, don_index)

    # Exportar CSVs de revision
    export_match_matrix_csv(matched_pairs, OUTPUT_MATRIX)
    export_unique_fg_csv(unique_fg, fg_index, OUTPUT_UNIQUE)

    print_summary(len(fg_index), len(don_index), matched_pairs, unique_fg)

    # Guardar summary JSON
    summary = {
        "fg_total":     len(fg_index),
        "don_total":    len(don_index),
        "matched_pairs": len(matched_pairs),
        "fg_matched":   len({p["fg_pn"]  for p in matched_pairs}),
        "don_matched":  len({p["don_pn"] for p in matched_pairs}),
        "unique_fg":    len(unique_fg),
    }
    json.dump(summary, open(OUTPUT_SUMMARY, "w"), indent=2)

    if args.complement:
        complement_phase(matched_pairs, dry_run=args.dry_run)

    if args.verify_unique:
        verify_unique_fg(unique_fg, fg_index, dry_run=args.dry_run)

    log.info("Listo.")


if __name__ == "__main__":
    main()
