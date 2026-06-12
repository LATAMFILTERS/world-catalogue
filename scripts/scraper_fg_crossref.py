#!/usr/bin/env python3
"""
scraper_fg_crossref.py — Cross-references para productos Fleetguard
=====================================================================
Fuentes:
  EL8 (Lube), EH6 (Hydraulic)  → oilfilter-crossreference.com
  EF9 (Fuel),  ES9 (Fuel Sep)  → fuelfilter-crossreference.com
  EA1, EA2, EC1, ED4            → airfilter-crossreference.com

Flujo:
  1. Query DB → obtiene FG part numbers por prefijo
  2. Playwright → scrape crossrefs en las 3 fuentes
  3. API → guarda brand_crossrefs en DB (append-only)

Uso:
    python scraper_fg_crossref.py EL8
    python scraper_fg_crossref.py EH6
    python scraper_fg_crossref.py EF9 ES9
    python scraper_fg_crossref.py EA1 EA2 ED4
    python scraper_fg_crossref.py --all
    python scraper_fg_crossref.py --test LF3620
    python scraper_fg_crossref.py EL8 --dry-run
    python scraper_fg_crossref.py EL8 --start LF4000   # resume desde parte
"""

import argparse
import json
import logging
import os
import random
import sys
import time

import requests
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    handlers=[
        logging.FileHandler("scraper_fg_crossref.log", encoding="utf-8"),
        logging.StreamHandler(),
    ],
)
log = logging.getLogger(__name__)

API_BASE = "https://elimfilters-search-pro.onrender.com"
API_KEY  = "elim2026"

PROFILE_DIRS = {
    "oil":  os.path.join(os.path.expanduser("~"), ".fg_crossref_oil"),
    "fuel": os.path.join(os.path.expanduser("~"), ".fg_crossref_fuel"),
    "air":  os.path.join(os.path.expanduser("~"), ".fg_crossref_air"),
}

# Crossref site URLs — brand = FLEETGUARD
SITES = {
    "oil":  "https://www.oilfilter-crossreference.com/convert/FLEETGUARD/{part}",
    "fuel": "https://www.fuelfilter-crossreference.com/convert/FLEETGUARD/{part}",
    "air":  "https://www.airfilter-crossreference.com/convert/FLEETGUARD/{part}",
}

PREFIX_SITE = {
    "EL8": "oil",
    "EH6": "oil",
    "EF9": "fuel",
    "ES9": "fuel",
    "EA1": "air",
    "EA2": "air",
    "EC1": "air",
    "ED4": "air",
}

ALL_PREFIXES = list(PREFIX_SITE.keys())

PAUSE = (3, 7)

# JS extractor — same pattern as scraper_oilcrossref.py
_EXTRACT_JS = """() => {
    const result = {};
    const links = document.querySelectorAll('ul.compat-list li a[href*="/convert/"]');
    for (const a of links) {
        const parts = a.getAttribute('href').split('/convert/');
        if (parts.length < 2) continue;
        const segments = parts[1].split('/');
        if (segments.length < 2) continue;
        const brand = decodeURIComponent(segments[0]).toUpperCase().replace(/-FILTER$/i,'').trim();
        const code  = decodeURIComponent(segments[1]).toUpperCase().trim();
        if (!brand || !code || brand === 'FLEETGUARD') continue;
        if (!result[brand]) result[brand] = [];
        if (!result[brand].includes(code)) result[brand].push(code);
    }
    return result;
}"""


def get_fg_parts(prefixes: list) -> list:
    prefix_param = ",".join(prefixes)
    r = requests.get(f"{API_BASE}/api/catalog/fg-parts", params={"prefix": prefix_param}, timeout=30)
    r.raise_for_status()
    data = r.json()
    log.info(f"DB → {data['count']} productos FG para prefijos {prefixes}")
    return data["parts"]  # [{sku, part_number}]


def push_crossrefs(updates: list) -> dict:
    """Sends batch of {sku, brand, codes} to DB. Returns {updated, skipped}."""
    if not updates:
        return {"updated": 0, "skipped": 0}
    r = requests.post(
        f"{API_BASE}/api/enrich/brand-crossrefs-batch",
        json={"key": API_KEY, "updates": updates},
        timeout=60,
    )
    r.raise_for_status()
    return r.json()


def scrape_crossrefs(page, part: str, site: str) -> dict:
    url = SITES[site].format(part=part)
    try:
        page.goto(url, wait_until="domcontentloaded", timeout=20000)
        page.wait_for_selector("ul.compat-list", timeout=8000)
    except PWTimeout:
        return {}
    except Exception as e:
        log.warning(f"  Error {part}: {e}")
        return {}
    return page.evaluate(_EXTRACT_JS)


def _make_context(pw, site="oil"):
    return pw.chromium.launch_persistent_context(
        user_data_dir=PROFILE_DIRS[site],
        channel="chrome",
        headless=True,
        locale="en-US",
        viewport={"width": 1366, "height": 768},
        user_agent=(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        ),
        args=["--no-sandbox", "--disable-dev-shm-usage"],
    )


def _scrape_site(pw, site: str, parts: list, start_from: str, total_global: int, offset: int) -> tuple:
    """Scrape all parts for a single site. Returns (updated, skipped)."""
    total_updated = total_skipped = 0
    BATCH = 50
    ctx = _make_context(pw, site)
    page = ctx.new_page()
    batch: list = []

    for i, prod in enumerate(parts, 1):
        part = prod["part_number"].upper()
        sku  = prod["sku"]

        log.info(f"[{offset+i}/{total_global}] {part} ({sku}) site:{site}")
        crossrefs = scrape_crossrefs(page, part, site)

        if crossrefs:
            brands = list(crossrefs.keys())
            total_codes = sum(len(v) for v in crossrefs.values())
            log.info(f"  → {len(brands)} marcas | {total_codes} códigos")
            for brand, codes in crossrefs.items():
                batch.append({"sku": sku, "brand": brand, "codes": codes})
        else:
            log.info(f"  → sin crossrefs")

        if len(batch) >= BATCH or i == len(parts):
            if batch:
                result = push_crossrefs(batch)
                total_updated += result.get("updated", 0)
                total_skipped += result.get("skipped", 0)
                log.info(f"  DB push: {result.get('updated')} updated, {result.get('skipped')} skipped")
                batch = []

        time.sleep(random.uniform(*PAUSE))

    ctx.close()
    return total_updated, total_skipped


def run(prefixes: list, dry_run: bool = False, start_from: str = None):
    # Group prefixes by site
    by_site: dict = {}
    for p in prefixes:
        site = PREFIX_SITE.get(p)
        if not site:
            log.warning(f"Prefijo desconocido: {p}")
            continue
        by_site.setdefault(site, []).append(p)

    # Fetch parts per site
    parts_by_site: dict = {}
    total = 0
    for site, site_prefixes in by_site.items():
        parts = get_fg_parts(site_prefixes)
        for p in parts:
            p["site"] = site
        parts_by_site[site] = parts
        total += len(parts)

    log.info(f"Total a scrapear: {total} productos FG")

    # Apply --start filter (applies to the full flattened list)
    if start_from:
        start_from = start_from.upper()
        found = False
        for site in list(parts_by_site.keys()):
            if found:
                break
            for idx, p in enumerate(parts_by_site[site]):
                if p["part_number"].upper() == start_from:
                    parts_by_site[site] = parts_by_site[site][idx:]
                    found = True
                    break
            else:
                if not found:
                    parts_by_site[site] = []
        log.info(f"Reanudando desde {start_from}")

    if dry_run:
        log.info("[DRY-RUN] Muestra primeros 5 por sitio:")
        for site, parts in parts_by_site.items():
            for p in parts[:5]:
                log.info(f"  {p['sku']} / {p['part_number']} → site:{site}")
        return

    total_updated = total_skipped = 0

    with sync_playwright() as pw:
        offset = 0
        for site, parts in parts_by_site.items():
            if not parts:
                continue
            u, s = _scrape_site(pw, site, parts, start_from, total, offset)
            total_updated += u
            total_skipped += s
            offset += len(parts)

    log.info(f"\n✅ Completado — DB updated: {total_updated} | skipped: {total_skipped}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("prefixes", nargs="*", help="EL8 EH6 EF9 ES9 EA1 EA2 EC1 ED4")
    parser.add_argument("--all",      action="store_true", help="Todos los prefijos FG")
    parser.add_argument("--dry-run",  action="store_true")
    parser.add_argument("--start",    default=None, help="Reanudar desde este part_number")
    parser.add_argument("--test",     default=None, help="Probar un part_number individual")
    args = parser.parse_args()

    if args.test:
        # Quick test for a single part number
        part = args.test.upper()
        # Determine site from prefix
        prefix = part[:3]
        site = PREFIX_SITE.get(prefix, "oil")
        with sync_playwright() as pw:
            ctx = _make_context(pw, site)
            page = ctx.new_page()
            result = scrape_crossrefs(page, part, site)
            ctx.close()
        print(f"\n=== CROSSREFS para {part} (site:{site}) ===")
        if result:
            for brand, codes in sorted(result.items()):
                print(f"  {brand:25} {codes}")
        else:
            print("  (sin resultados)")
        sys.exit(0)

    if args.all:
        prefixes = ALL_PREFIXES
    elif args.prefixes:
        prefixes = [p.upper() for p in args.prefixes]
    else:
        print("Uso: python scraper_fg_crossref.py EL8 EH6 ...")
        print("     python scraper_fg_crossref.py --all")
        print("     python scraper_fg_crossref.py --test LF3620")
        sys.exit(1)

    run(prefixes, dry_run=args.dry_run, start_from=args.start)
