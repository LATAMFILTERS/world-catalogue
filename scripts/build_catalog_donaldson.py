"""
build_catalog_donaldson.py — Construye el catálogo ELIMFILTERS desde los JSON
scrapeados de Donaldson.

Lee todos los archivos *_results.json de Donaldson y produce UN catálogo
unificado: catalog_donaldson.json — una entrada por código Donaldson con su
SKU ELIM generado, tipo, atributos, cross-references, alternativas y equipos.

Uso:
    python build_catalog_donaldson.py
    DATA_DIR=C:\\ruta\\a\\jsons python build_catalog_donaldson.py

Archivos de entrada (los que existan; se ignoran los faltantes):
    lube_filters_results.json        → EL8
    fuel_filters_results.json        → EF9 / ES9
    air_filters_results.json         → EA1
    air_filter_housings_results.json → EA2
    hydraulic_filters_results.json   → EH6
    coolant_filters_results.json     → EW7
    cabin_filters_results.json       → EC1
    air_dryer_results.json           → ED4
"""

import json
import os
import sys
from datetime import datetime

from catalog_common import (
    make_sku, normalize_part, elim_prefix_from_donaldson, TECH_MAP, TYPE_MAP,
)

DATA_DIR = os.environ.get("DATA_DIR", os.path.dirname(os.path.abspath(__file__)))

# (archivo_json, category_key)
SOURCES = [
    ("lube_filters_results.json",        "lube"),
    ("fuel_filters_results.json",        "fuel"),
    ("air_filters_results.json",         "air"),
    ("air_filter_housings_results.json", "air_housing"),
    ("hydraulic_filters_results.json",   "hydraulic"),
    ("coolant_filters_results.json",     "coolant"),
    ("cabin_filters_results.json",       "cabin"),
    ("air_dryer_results.json",           "air_dryer"),
]

OUTPUT = os.path.join(DATA_DIR, "catalog_donaldson.json")


def load_json(path):
    if not os.path.exists(path):
        return None
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def build():
    catalog = []
    used_skus = set()
    seen_codes = set()
    stats = {}

    for fname, cat_key in SOURCES:
        path = os.path.join(DATA_DIR, fname)
        data = load_json(path)
        if data is None:
            print(f"  · {fname}: no encontrado (saltado)")
            continue

        # Soporta tanto lista directa como objeto de progreso {results: [...]}
        if isinstance(data, dict) and "results" in data:
            data = data["results"]

        count = 0
        for prod in data:
            code = normalize_part(prod.get("part_number") or prod.get("base_code") or "")
            if not code or code in seen_codes:
                continue
            if prod.get("error"):
                continue
            seen_codes.add(code)

            attrs = prod.get("attributes", {}) or {}
            prefix = elim_prefix_from_donaldson(cat_key, attrs)
            sku = make_sku(prefix, code, used_skus)

            catalog.append({
                "elim_sku":         sku,
                "source_brand":     "Donaldson",
                "source_code":      code,
                "filter_type":      TYPE_MAP.get(prefix, "Filter"),
                "technology":       TECH_MAP.get(prefix, ""),
                "category":         cat_key,
                "description":      prod.get("description", ""),
                "attributes":       attrs,
                "cross_references": prod.get("cross_references", []),
                "alternatives":     prod.get("alternatives", []),
                "equipment":        prod.get("equipment", []),
                "scraped_at":       prod.get("scraped_at", ""),
            })
            count += 1

        stats[cat_key] = count
        print(f"  · {fname}: {count} productos → {cat_key}")

    payload = {
        "brand":      "Donaldson",
        "generated":  datetime.now().isoformat(),
        "total":      len(catalog),
        "by_category": stats,
        "products":   catalog,
    }
    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Catálogo Donaldson: {len(catalog)} productos → {OUTPUT}")
    return payload


if __name__ == "__main__":
    print(f"DATA_DIR = {DATA_DIR}\n")
    build()
