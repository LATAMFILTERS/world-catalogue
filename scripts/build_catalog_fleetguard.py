"""
build_catalog_fleetguard.py — Construye el catálogo ELIMFILTERS desde los JSON
scrapeados de Fleetguard.

Produce DOS cosas:

  1. catalog_fleetguard.json
     Una entrada por código Fleetguard (igual que Donaldson) con su SKU ELIM,
     tipo, atributos, cross-references, alternativas.

  2. KITS_Fleetguard/  (subcarpeta)
     Los "kits" por equipo: cada equipo único agrega el BOM completo de filtros
     que usa (Air/Fuel/Hydraulic/Lube/Cabin). Ideal para búsqueda por equipo en
     part-search. Genera:
       - KITS_Fleetguard/kits.json   → todos los kits (equipo → filtros)
       - KITS_Fleetguard/index.json  → índice {make, model, engine, n_filtros}

Uso:
    python build_catalog_fleetguard.py
    DATA_DIR=C:\\ruta\\a\\jsons python build_catalog_fleetguard.py

Entrada: todos los fleetguard_*_results.json que existan.
"""

import json
import os
import glob
from datetime import datetime

from catalog_common import (
    make_sku, normalize_part, elim_prefix_from_fleetguard, TECH_MAP, TYPE_MAP,
)

DATA_DIR = os.environ.get("DATA_DIR", os.path.dirname(os.path.abspath(__file__)))

OUTPUT_CATALOG = os.path.join(DATA_DIR, "catalog_fleetguard.json")
KITS_DIR       = os.path.join(DATA_DIR, "KITS_Fleetguard")


def category_from_filename(fname: str) -> str:
    # fleetguard_air-precleaners_results.json → air-precleaners
    base = os.path.basename(fname)
    base = base.replace("fleetguard_", "").replace("_results.json", "")
    base = base.replace("_progress.json", "")
    return base


def load_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def build_catalog():
    catalog = []
    used_skus = set()
    seen_codes = set()
    stats = {}
    all_results = []  # para los KITS

    files = sorted(glob.glob(os.path.join(DATA_DIR, "fleetguard_*_results.json")))
    if not files:
        print("  ⚠ No se encontraron archivos fleetguard_*_results.json")

    for path in files:
        category = category_from_filename(path)
        data = load_json(path)
        if isinstance(data, dict) and "results" in data:
            data = data["results"]

        count = 0
        for prod in data:
            all_results.append(prod)
            code = normalize_part(prod.get("part_number") or "")
            if not code or code in seen_codes:
                continue
            if prod.get("error"):
                continue
            seen_codes.add(code)

            prefix = elim_prefix_from_fleetguard(code, category)
            sku = make_sku(prefix, code, used_skus)

            catalog.append({
                "elim_sku":         sku,
                "source_brand":     "Fleetguard",
                "source_code":      code,
                "filter_type":      TYPE_MAP.get(prefix, "Filter"),
                "technology":       TECH_MAP.get(prefix, ""),
                "category":         category,
                "name":             prod.get("name", ""),
                "attributes":       prod.get("attributes", {}) or {},
                "cross_references": prod.get("cross_references", []),
                "alternatives":     prod.get("alternatives", []),
                # equipment se mueve a KITS, aquí solo referencia ligera
                "equipment_models": [e.get("equipment", "") for e in prod.get("equipment", [])
                                     if isinstance(e, dict)],
                "scraped_at":       prod.get("scraped_at", ""),
            })
            count += 1

        stats[category] = count
        print(f"  · {os.path.basename(path)}: {count} productos → {category}")

    payload = {
        "brand":       "Fleetguard",
        "generated":   datetime.now().isoformat(),
        "total":       len(catalog),
        "by_category": stats,
        "products":    catalog,
    }
    with open(OUTPUT_CATALOG, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    print(f"\n✅ Catálogo Fleetguard: {len(catalog)} productos → {OUTPUT_CATALOG}")

    return all_results


def build_kits(all_results):
    """
    Agrega los equipos en KITS deduplicados. Cada kit = un equipo único con
    TODOS los filtros que usa (BOM completo), más los productos Fleetguard que
    lo referencian.
    """
    os.makedirs(KITS_DIR, exist_ok=True)
    kits = {}  # key make|model|engine → kit

    for prod in all_results:
        source_pn = normalize_part(prod.get("part_number") or "")
        for eq in prod.get("equipment", []):
            if not isinstance(eq, dict):
                continue
            make   = eq.get("make", "")
            model  = eq.get("model", "")
            engine = eq.get("engine", "")
            key = f"{make}|{model}|{engine}".strip("|")
            if not key:
                continue

            if key not in kits:
                kits[key] = {
                    "make":            make,
                    "model":           model,
                    "engine":          engine,
                    "equipment":       eq.get("equipment", ""),
                    "filters":         [],
                    "source_products": [],
                }
            kit = kits[key]
            if source_pn and source_pn not in kit["source_products"]:
                kit["source_products"].append(source_pn)

            existing = {(f.get("system",""), f.get("fleetguard_part",""), f.get("oem_part",""))
                        for f in kit["filters"]}
            for filt in eq.get("filters", []):
                if not isinstance(filt, dict):
                    continue
                fk = (filt.get("system",""), filt.get("fleetguard_part",""), filt.get("oem_part",""))
                if fk not in existing:
                    existing.add(fk)
                    kit["filters"].append(filt)

    kit_list = sorted(kits.values(), key=lambda k: (k["make"], k["model"], k["engine"]))

    # Archivo completo de kits
    kits_file = os.path.join(KITS_DIR, "kits.json")
    with open(kits_file, "w", encoding="utf-8") as f:
        json.dump({
            "generated": datetime.now().isoformat(),
            "total_kits": len(kit_list),
            "kits": kit_list,
        }, f, ensure_ascii=False, indent=2)

    # Índice ligero
    index = [{
        "make":      k["make"],
        "model":     k["model"],
        "engine":    k["engine"],
        "n_filters": len(k["filters"]),
        "n_sources": len(k["source_products"]),
    } for k in kit_list]
    index_file = os.path.join(KITS_DIR, "index.json")
    with open(index_file, "w", encoding="utf-8") as f:
        json.dump({"generated": datetime.now().isoformat(),
                   "total_kits": len(index), "index": index},
                  f, ensure_ascii=False, indent=2)

    total_filters = sum(len(k["filters"]) for k in kit_list)
    print(f"✅ KITS Fleetguard: {len(kit_list)} equipos, {total_filters} filtros")
    print(f"   → {kits_file}")
    print(f"   → {index_file}")


if __name__ == "__main__":
    print(f"DATA_DIR = {DATA_DIR}\n")
    results = build_catalog()
    print()
    build_kits(results)
