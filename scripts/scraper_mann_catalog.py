#!/usr/bin/env python3
"""
scraper_mann_catalog.py
=======================
Enumera catálogo completo MANN LD (Oil / Air / Fuel / Cabin)
usando el mismo motor que scraper_mann_master.py.

Estrategia: catalogsearch/result/?q={prefix}&p={page}
  → misma URL base que MANN_SEARCH en scraper_mann_ld_fitment.py
  → pagina con ?p=N hasta "no hay más resultados"
  → extrae part numbers de links de producto en resultados

Prefijos LD buscados:
  Oil:   W, HU, WP
  Air:   C (excepto CU/CUK), LA, SP
  Cabin: CU, CUK
  Fuel:  WK, PU

Output:
  C:\\mann\\mann_catalog_ld.jsonl   — un SKU por línea
  C:\\mann\\mann_catalog_gaps.txt   — SKUs en MANN no en ELIMFILTERS

Uso:
    python scraper_mann_catalog.py
    python scraper_mann_catalog.py --stats
    python scraper_mann_catalog.py --gaps
"""

import argparse
import csv
import json
import logging
import os
import re
import sys
import time
from pathlib import Path
from urllib.parse import urljoin, quote

from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

# ── Paths ─────────────────────────────────────────────────────────────────────
INPUT_OEM_MASTER = Path(r"C:\mann\mann_oem_master_clean.csv")
INPUT_CLASSIFIED = Path(r"C:\mann\mann_classified.jsonl")
OUTPUT_FILE      = Path(r"C:\mann\mann_catalog_ld.jsonl")
GAPS_FILE        = Path(r"C:\mann\mann_catalog_gaps.txt")

# Misma config que scraper_mann_master.py
PROFILE_DIR  = os.path.join(os.path.expanduser("~"), ".mann_catalog_profile")
MANN_DOMAIN  = "https://www.mann-filter.com"
LOCALE       = "ph-en"   # ph-en tiene mejor cobertura de catálogo
MANN_SEARCH  = f"{MANN_DOMAIN}/{LOCALE}/catalogsearch/result/"
PAUSE        = (2, 4)

# ── Prefijos LD por categoría ──────────────────────────────────────────────────
# Longest first para evitar que "C" matchee antes que "CUK"
LD_QUERIES = [
    # (query_term, filter_type)
    ("WK",  "Fuel Filter"),
    ("WP",  "Oil Filter"),
    ("HU",  "Oil Filter"),
    ("CUK", "Cabin Filter"),
    ("CU",  "Cabin Filter"),
    ("PU",  "Fuel Filter"),
    ("LA",  "Air Filter"),
    ("SP",  "Air Filter"),
    ("W",   "Oil Filter"),
    ("C",   "Air Filter"),
]

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    handlers=[
        logging.FileHandler(r"C:\mann\scraper_mann_catalog.log", encoding="utf-8"),
        logging.StreamHandler(),
    ],
)
log = logging.getLogger(__name__)

# ── URL key → SKU ─────────────────────────────────────────────────────────────
_URL_KEY_RE = re.compile(
    r"/catalog/search-results/product\.html/(.+?)(?:_mann-filter)?\.html",
    re.IGNORECASE,
)

def url_to_sku(url: str) -> str | None:
    m = _URL_KEY_RE.search(url)
    if not m:
        return None
    raw = m.group(1)
    for sfx in ("_mann-filter", "-mann-filter"):
        if raw.lower().endswith(sfx):
            raw = raw[: -len(sfx)]
            break
    # Restore uppercase, remove trailing suffix letters kept for URL
    sku = raw.upper().replace("%20", " ").replace("%2F", "/")
    return sku.strip()

# ── LD prefix filter ──────────────────────────────────────────────────────────
LD_PREFIXES = (
    "W", "HU", "WP", "WD",          # Oil
    "C", "LA", "SP", "DB", "FP",    # Air (note: CU/CUK match before C)
    "CUK", "CU", "CF",              # Cabin
    "WK", "PU", "KC",               # Fuel
)
HD_SKIP = ("LE", "LB", "P", "H")

def is_ld(sku: str) -> bool:
    u = sku.upper().strip()
    if not u or u[0].isdigit():
        return False
    for pfx in sorted(LD_PREFIXES, key=len, reverse=True):
        if u.startswith(pfx):
            return True
    return False

# ── JS: extrae product links de página de resultados ─────────────────────────
# Mismo estilo ES5 del master scraper (channel="chrome" compatible)
_SEARCH_RESULTS_JS = """() => {
    var links = [];
    var seen  = {};

    // Selectors for product links in MANN search results / category pages
    var selectors = [
        'a[href*="product.html"]',
        'a[href*="_mann-filter.html"]',
        '.product-item-info a',
        '.product-item-link',
        'li.product-item a',
        '.products-grid a',
        '.product-list a[href*="catalog"]',
        'article a[href*="mann-filter"]',
    ];

    for (var si = 0; si < selectors.length; si++) {
        var els = document.querySelectorAll(selectors[si]);
        for (var i = 0; i < els.length; i++) {
            var href = els[i].getAttribute('href') || '';
            if (!href) continue;
            if (href.indexOf('product.html') < 0 && href.indexOf('_mann-filter') < 0) continue;
            if (seen[href]) continue;
            seen[href] = 1;
            links.push(href);
        }
    }
    return links;
}"""

# ── JS: detecta si hay página siguiente ──────────────────────────────────────
_HAS_NEXT_JS = """(currentPage) => {
    // URL param style ?p=N
    var nextHref = null;
    var pLinks = document.querySelectorAll('a[href*="?p="], a[href*="&p="]');
    for (var i = 0; i < pLinks.length; i++) {
        var href = pLinks[i].getAttribute('href') || '';
        var m = href.match(/[?&]p=([0-9]+)/);
        if (m && parseInt(m[1]) === currentPage + 1) {
            nextHref = href;
            break;
        }
    }
    if (nextHref) return nextHref;

    // Next button
    var nextBtns = [
        document.querySelector('a.next'),
        document.querySelector('.pages-item-next a'),
        document.querySelector('a[title="Next"]'),
        document.querySelector('[aria-label="Next"]'),
    ];
    for (var j = 0; j < nextBtns.length; j++) {
        if (nextBtns[j]) return nextBtns[j].getAttribute('href') || '__click__';
    }

    // Count total vs shown
    var toolbar = document.querySelector('.toolbar-amount, .search-result-info');
    if (toolbar) {
        var text = toolbar.textContent || '';
        var m2 = text.match(/(\\d+)\\s*-\\s*(\\d+)\\s*of\\s*(\\d+)/);
        if (m2 && parseInt(m2[2]) < parseInt(m2[3])) return '__more__';
    }
    return null;
}"""

# ── Playwright context (igual que master) ─────────────────────────────────────
def make_context(pw):
    return pw.chromium.launch_persistent_context(
        PROFILE_DIR,
        channel="chrome",
        headless=False,
        args=["--disable-blink-features=AutomationControlled"],
        viewport={"width": 1280, "height": 900},
        locale="en-US",
    )

# ── Scrape one search query ────────────────────────────────────────────────────
def scrape_query(page, query: str, filter_type: str, seen: set) -> list[dict]:
    results = []
    page_num = 1

    while True:
        url = f"{MANN_SEARCH}?q={quote(query)}&p={page_num}"
        log.info(f"  [{query}] Página {page_num} → {url}")

        try:
            page.goto(url, timeout=25000, wait_until="domcontentloaded")
            time.sleep(1.5)

            # Check for "no results" message
            body_text = page.evaluate("() => document.body.innerText") or ""
            no_results_phrases = [
                "no results", "your search returned no results",
                "0 results", "nothing found",
                "keine Ergebnisse", "0 Ergebnisse",
            ]
            if any(ph in body_text.lower() for ph in no_results_phrases):
                log.info(f"  [{query}] Sin resultados en página {page_num}")
                break

            # Extract product links
            links = page.evaluate(_SEARCH_RESULTS_JS)
            new_count = 0
            for href in links:
                full_url = urljoin(MANN_DOMAIN, href) if not href.startswith("http") else href
                sku = url_to_sku(full_url)
                if not sku:
                    continue
                # Filter: must start with query prefix and be LD
                if not sku.upper().startswith(query.upper()):
                    continue
                if sku in seen:
                    continue
                if is_ld(sku):
                    seen.add(sku)
                    results.append({
                        "sku":         sku,
                        "filter_type": filter_type,
                        "url_key":     re.sub(r"[^a-z0-9/]", "", sku.lower().replace(" ", "")) + "_mann-filter",
                        "source":      "catalogsearch",
                    })
                    new_count += 1

            log.info(f"  [{query}] Página {page_num}: +{new_count} nuevos (total query: {len(results)})")

            if new_count == 0 and page_num > 1:
                log.info(f"  [{query}] Página vacía — fin")
                break

            # Check next page
            next_href = page.evaluate(_HAS_NEXT_JS, page_num)
            if not next_href:
                log.info(f"  [{query}] No hay más páginas")
                break

            page_num += 1
            time.sleep(1)

        except PWTimeout:
            log.warning(f"  [{query}] Timeout en página {page_num}")
            break
        except Exception as e:
            log.warning(f"  [{query}] Error: {e}")
            break

    return results

# ── Gap analysis ───────────────────────────────────────────────────────────────
def load_existing_skus() -> set:
    def clean(s):
        s = s.strip()
        for sfx in ("_MANN-FILTER", "_MANN", "-MANN-FILTER", "-MANN"):
            if s.upper().endswith(sfx):
                s = s[: len(s) - len(sfx)]
        return s.strip().upper()

    skus = set()
    if INPUT_OEM_MASTER.exists():
        with open(INPUT_OEM_MASTER, encoding="utf-8") as f:
            for row in csv.DictReader(f):
                if row.get("segment", "").upper() == "LD":
                    s = clean(row.get("sku", ""))
                    if s:
                        skus.add(s)
    elif INPUT_CLASSIFIED.exists():
        with open(INPUT_CLASSIFIED, encoding="utf-8") as f:
            for line in f:
                p = json.loads(line)
                if p.get("segment", "").upper() == "LD":
                    s = clean(p.get("sku", ""))
                    if s:
                        skus.add(s)
    return skus

def write_gaps(catalog: list[dict], existing: set):
    gaps = [p for p in catalog if p["sku"] not in existing]
    with open(GAPS_FILE, "w", encoding="utf-8") as f:
        f.write(f"# MANN LD SKUs nuevos (no en ELIMFILTERS)\n")
        f.write(f"# Total catálogo MANN: {len(catalog)}  |  En ELIMFILTERS: {len(existing)}  |  Gaps: {len(gaps)}\n\n")
        for p in sorted(gaps, key=lambda x: x["sku"]):
            f.write(f"{p['sku']}\t{p['filter_type']}\n")
    log.info(f"Gaps: {len(gaps)} SKUs nuevos → {GAPS_FILE}")

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--stats", action="store_true")
    ap.add_argument("--gaps",  action="store_true")
    args = ap.parse_args()

    if args.stats:
        if not OUTPUT_FILE.exists():
            print("Sin output. Corre sin --stats primero.")
            return
        items, counts = [], {}
        with open(OUTPUT_FILE, encoding="utf-8") as f:
            for line in f:
                p = json.loads(line); items.append(p)
                ft = p.get("filter_type", "?")
                counts[ft] = counts.get(ft, 0) + 1
        existing = load_existing_skus()
        gaps = [p for p in items if p["sku"] not in existing]
        print(f"\nCatálogo MANN LD — {len(items)} SKUs")
        for ft, n in sorted(counts.items(), key=lambda x: -x[1]):
            print(f"  {ft:<20} {n:>5}")
        print(f"\n  En ELIMFILTERS: {len(existing)}  |  Gaps: {len(gaps)}")
        return

    if args.gaps:
        if not OUTPUT_FILE.exists():
            print("Sin output. Corre sin --gaps primero.")
            return
        items = []
        with open(OUTPUT_FILE, encoding="utf-8") as f:
            for line in f:
                items.append(json.loads(line))
        write_gaps(items, load_existing_skus())
        return

    # ── Run scrape ──
    all_products: list[dict] = []
    seen: set = set()

    with sync_playwright() as pw:
        ctx  = make_context(pw)
        page = ctx.pages[0] if ctx.pages else ctx.new_page()

        for query, filter_type in LD_QUERIES:
            log.info(f"\n{'─'*50}")
            log.info(f"Query: '{query}' → {filter_type}")
            results = scrape_query(page, query, filter_type, seen)
            all_products.extend(results)
            log.info(f"  Subtotal '{query}': {len(results)} | Acumulado: {len(all_products)}")
            time.sleep(2)

        ctx.close()

    if not all_products:
        log.warning("Sin productos. Revisa selectores JS o URL.")
        return

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        for p in sorted(all_products, key=lambda x: x["sku"]):
            f.write(json.dumps(p, ensure_ascii=False) + "\n")

    log.info(f"\n{'='*50}")
    log.info(f"Total MANN LD: {len(all_products)} SKUs → {OUTPUT_FILE}")

    existing = load_existing_skus()
    write_gaps(all_products, existing)

    counts: dict = {}
    for p in all_products:
        ft = p.get("filter_type", "?")
        counts[ft] = counts.get(ft, 0) + 1
    for ft, n in sorted(counts.items(), key=lambda x: -x[1]):
        log.info(f"  {ft:<20} {n:>5}")

if __name__ == "__main__":
    main()
