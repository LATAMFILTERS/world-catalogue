#!/usr/bin/env python3
"""
scraper_mann_catalog.py
=======================
Enumera el catálogo completo MANN LD (Oil / Air / Fuel / Cabin)
desde mann-filter.com

Estrategia 1 — Sitemap XML (sin browser, muy rápido):
  Descarga sitemap us-en, extrae URLs de producto, filtra LD prefixes.

Estrategia 2 — Category pagination (Playwright fallback):
  Si sitemap no devuelve suficientes resultados, pagina las páginas
  de categoría de MANN con Playwright click → Next.

Output:
  C:\\mann\\mann_catalog_ld.jsonl    — un SKU por línea JSON
  C:\\mann\\mann_catalog_gaps.txt   — SKUs MANN que ELIMFILTERS no tiene aún

Uso:
    python scraper_mann_catalog.py              # enumera y guarda
    python scraper_mann_catalog.py --discover   # inspecciona estructura del sitio
    python scraper_mann_catalog.py --stats      # muestra estadísticas
    python scraper_mann_catalog.py --gaps       # imprime gaps vs ELIMFILTERS
"""

import argparse
import csv
import json
import logging
import os
import re
import sys
import time
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import urljoin, urlparse, parse_qs

from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

# ── Paths ───────────────────────────────────────────────────────────────────
INPUT_OEM_MASTER = Path(r"C:\mann\mann_oem_master_clean.csv")
INPUT_CLASSIFIED = Path(r"C:\mann\mann_classified.jsonl")
OUTPUT_FILE      = Path(r"C:\mann\mann_catalog_ld.jsonl")
GAPS_FILE        = Path(r"C:\mann\mann_catalog_gaps.txt")

PROFILE_DIR = os.path.join(os.path.expanduser("~"), ".mann_catalog_profile")
LOCALE      = "us-en"
MANN_BASE   = "https://www.mann-filter.com"

# ── LD prefix filter ─────────────────────────────────────────────────────────
# Prefixes that identify Light Duty filters (Oil / Air / Fuel / Cabin)
LD_PREFIXES = (
    "W",    # Oil filter spin-on   W940/21, W7, W712...
    "HU",   # Oil filter cartridge HU6013Y, HU925/4Y...
    "WP",   # Oil filter with pressure   WP928/82...
    "C",    # Air filter panel/element   C3698, C12120...
    "CU",   # Cabin filter (with/without activated carbon)
    "CUK",  # Cabin filter activated carbon  (before CU to match longest first)
    "WK",   # Fuel filter  WK8/79, WK614/3...
    "PU",   # Fuel filter  PU855X...
    "FP",   # Fuel filter (cartridge)
    "DB",   # Breather/drain-back (cabin adjacent)
    "LA",   # Air intake pre-filter
    "SP",   # Air filter safety element
)

# Non-LD prefixes we explicitly skip (industrial / HD)
HD_PREFIXES = (
    "LE", "LB", "P", "H",   # hydraulic / industrial
    "LC", "LI",
)

# ── Sitemaps to try ──────────────────────────────────────────────────────────
SITEMAPS = [
    f"https://www.mann-filter.com/{LOCALE}/sitemap.xml",
    "https://www.mann-filter.com/sitemap.xml",
    f"https://www.mann-filter.com/{LOCALE}/sitemap_products.xml",
]

# ── Category search URLs (Playwright fallback) ───────────────────────────────
# MANN uses AEM with category pages paginable via query params.
# Each entry: (product_type_label, candidate_URL_list)
CATEGORY_URLS = [
    ("Oil Filter",   [
        f"https://www.mann-filter.com/{LOCALE}/catalog/search-results.html?producttype=OIL",
        f"https://www.mann-filter.com/{LOCALE}/products/lube-oil-filters.html",
        f"https://www.mann-filter.com/{LOCALE}/catalog/search-results/oil-filters.html",
    ]),
    ("Air Filter",   [
        f"https://www.mann-filter.com/{LOCALE}/catalog/search-results.html?producttype=AIR",
        f"https://www.mann-filter.com/{LOCALE}/products/air-filters.html",
        f"https://www.mann-filter.com/{LOCALE}/catalog/search-results/air-filters.html",
    ]),
    ("Fuel Filter",  [
        f"https://www.mann-filter.com/{LOCALE}/catalog/search-results.html?producttype=FUEL",
        f"https://www.mann-filter.com/{LOCALE}/products/fuel-filters.html",
        f"https://www.mann-filter.com/{LOCALE}/catalog/search-results/fuel-filters.html",
    ]),
    ("Cabin Filter", [
        f"https://www.mann-filter.com/{LOCALE}/catalog/search-results.html?producttype=CABIN",
        f"https://www.mann-filter.com/{LOCALE}/products/cabin-filters.html",
        f"https://www.mann-filter.com/{LOCALE}/catalog/search-results/interior-air-filters.html",
    ]),
]

# ── Logging ─────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    handlers=[
        logging.FileHandler(r"C:\mann\scraper_mann_catalog.log", encoding="utf-8"),
        logging.StreamHandler(),
    ],
)
log = logging.getLogger(__name__)


# ── SKU extraction ────────────────────────────────────────────────────────────
_URL_KEY_RE = re.compile(
    r"/catalog/search-results/product\.html/(.+?)(?:_mann-filter)?\.html",
    re.IGNORECASE,
)
_SPACE_NORM = re.compile(r"\s+")


def url_to_sku(url: str) -> str | None:
    """Extract clean SKU from a MANN product page URL."""
    m = _URL_KEY_RE.search(url)
    if not m:
        return None
    raw = m.group(1)
    # Remove _mann-filter suffix
    for sfx in ("_mann-filter", "-mann-filter"):
        if raw.lower().endswith(sfx):
            raw = raw[: -len(sfx)]
            break
    # Restore spaces that were removed in URL (heuristic: none; SKU is URL-safe)
    sku = raw.upper()
    return sku


def is_ld(sku: str) -> bool:
    """True if SKU matches LD prefix (Oil/Air/Fuel/Cabin)."""
    u = sku.upper().strip()
    # Skip HD/industrial prefixes first
    for pfx in HD_PREFIXES:
        if u.startswith(pfx) and not any(u.startswith(ldp) for ldp in LD_PREFIXES):
            return False
    # Must match a LD prefix
    for pfx in sorted(LD_PREFIXES, key=len, reverse=True):  # longest first
        if u.startswith(pfx):
            return True
    return False


# ── Strategy 1: Sitemap ───────────────────────────────────────────────────────
def fetch_sitemap_products() -> list[dict]:
    """Download sitemap XML and extract all MANN LD product SKUs."""
    products = []
    seen = set()

    for sitemap_url in SITEMAPS:
        log.info(f"Probando sitemap: {sitemap_url}")
        try:
            req = urllib.request.Request(
                sitemap_url,
                headers={"User-Agent": "Mozilla/5.0 (compatible; catalog-bot/1.0)"},
            )
            with urllib.request.urlopen(req, timeout=15) as resp:
                raw = resp.read()
            log.info(f"  Sitemap descargado: {len(raw):,} bytes")
        except Exception as e:
            log.warning(f"  Sitemap fetch error: {e}")
            continue

        # Handle sitemap index (points to sub-sitemaps)
        try:
            root = ET.fromstring(raw)
            ns = root.tag.split("}")[0].lstrip("{") if "}" in root.tag else ""
            tag = lambda t: f"{{{ns}}}{t}" if ns else t  # noqa

            if "sitemapindex" in root.tag:
                log.info("  Es sitemap index — descargando sub-sitemaps…")
                for loc_el in root.iter(tag("loc")):
                    sub_url = loc_el.text.strip()
                    if "product" in sub_url.lower() or "catalog" in sub_url.lower():
                        products += _parse_product_sitemap(sub_url, seen)
            else:
                products += _parse_sitemap_locs(root, seen)

        except ET.ParseError as e:
            log.warning(f"  XML parse error: {e}")
            continue

        if products:
            log.info(f"  Sitemap OK → {len(products)} SKUs LD encontrados")
            break

    return products


def _parse_product_sitemap(url: str, seen: set) -> list[dict]:
    try:
        req = urllib.request.Request(
            url, headers={"User-Agent": "Mozilla/5.0 (compatible; catalog-bot/1.0)"}
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            raw = resp.read()
        root = ET.fromstring(raw)
        return _parse_sitemap_locs(root, seen)
    except Exception as e:
        log.warning(f"  Sub-sitemap error {url}: {e}")
        return []


def _parse_sitemap_locs(root: ET.Element, seen: set) -> list[dict]:
    items = []
    for el in root.iter():
        if el.tag.endswith("loc") and el.text:
            url = el.text.strip()
            if "product.html" not in url:
                continue
            sku = url_to_sku(url)
            if not sku or sku in seen:
                continue
            if is_ld(sku):
                seen.add(sku)
                items.append({"sku": sku, "source": "sitemap", "url": url})
    return items


# ── Strategy 2: Playwright category pagination ────────────────────────────────
# JS that extracts all product part numbers from MANN listing page
_CATALOG_LIST_JS = """() => {
    var results = [];
    var seen = {};

    // Try multiple selectors for product cards / tiles
    var selectors = [
        'a[href*="product.html"]',
        '.product-item-link',
        '.cmp-product-tile__link',
        '.product-tile a',
        'a[href*="_mann-filter.html"]',
        '.product-list-item a',
        'article a[href*="mann-filter"]',
    ];

    for (var si = 0; si < selectors.length; si++) {
        var links = document.querySelectorAll(selectors[si]);
        if (links.length > 0) {
            for (var li = 0; li < links.length; li++) {
                var href = links[li].getAttribute('href') || '';
                if (href.indexOf('product.html') < 0 && href.indexOf('_mann-filter') < 0) continue;
                if (seen[href]) continue;
                seen[href] = 1;
                results.push(href);
            }
        }
    }
    return results;
}"""

# JS to detect if there's a "next page" link / button
_NEXT_PAGE_JS = """() => {
    var candidates = [
        'a.next',
        'a[title="Next"]',
        '.pages-item-next a',
        'a[aria-label="Next"]',
        '.cmp-pagination__next:not([disabled]) a',
        'button.cmp-pagination__next:not([disabled])',
        '[class*="next"]:not([disabled]) a',
    ];
    for (var i = 0; i < candidates.length; i++) {
        var el = document.querySelector(candidates[i]);
        if (el) return el.getAttribute('href') || '__click__';
    }
    // Check URL-param style: look for a link with ?p=N+1
    var pLinks = document.querySelectorAll('a[href*="?p="], a[href*="&p="]');
    var currentP = 0;
    var qstr = window.location.search;
    var pm = qstr.match(/[?&]p=([0-9]+)/);
    if (pm) currentP = parseInt(pm[1]);
    for (var pi = 0; pi < pLinks.length; pi++) {
        var href = pLinks[pi].getAttribute('href');
        var hm = href.match(/[?&]p=([0-9]+)/);
        if (hm && parseInt(hm[1]) === currentP + 1) return href;
    }
    return null;
}"""


def scrape_category_playwright(page, label: str, candidate_urls: list) -> list[dict]:
    """Try each candidate URL for a category; paginate until done."""
    products = []
    seen = set()

    working_url = None
    for url in candidate_urls:
        log.info(f"  Probando URL de categoría: {url}")
        try:
            page.goto(url, timeout=20000, wait_until="domcontentloaded")
            time.sleep(2)
            links = page.evaluate(_CATALOG_LIST_JS)
            if links:
                log.info(f"  Encontrada URL de categoría con {len(links)} productos")
                working_url = url
                break
            else:
                log.info(f"  URL sin productos de listado")
        except Exception as e:
            log.warning(f"  Error cargando {url}: {e}")

    if not working_url:
        log.warning(f"  [{label}] No se encontró URL de categoría válida")
        return []

    page_num = 1
    current_url = working_url

    while True:
        log.info(f"  [{label}] Página {page_num} — {current_url}")
        try:
            if page_num > 1:
                page.goto(current_url, timeout=20000, wait_until="domcontentloaded")
                time.sleep(1.5)

            links = page.evaluate(_CATALOG_LIST_JS)
            new_count = 0
            for href in links:
                full_url = urljoin(MANN_BASE, href)
                sku = url_to_sku(full_url)
                if not sku or sku in seen:
                    continue
                if is_ld(sku):
                    seen.add(sku)
                    products.append({"sku": sku, "filter_type": label,
                                     "source": "catalog", "url": full_url})
                    new_count += 1

            log.info(f"    +{new_count} nuevos (total {len(products)})")

            # Check next page
            next_href = page.evaluate(_NEXT_PAGE_JS)
            if not next_href:
                log.info(f"  No hay más páginas")
                break

            if next_href == "__click__":
                # Need to click the Next button directly
                try:
                    for sel in ['a.next', '.pages-item-next a', '[class*="next"] a']:
                        try:
                            page.click(sel, timeout=3000)
                            time.sleep(2)
                            page_num += 1
                            current_url = page.url
                            break
                        except Exception:
                            continue
                    else:
                        log.info(f"  No se pudo hacer click en Next")
                        break
                except Exception:
                    break
            else:
                current_url = urljoin(MANN_BASE, next_href)
                page_num += 1

            time.sleep(1)

        except Exception as e:
            log.warning(f"  Error en página {page_num}: {e}")
            break

    log.info(f"  [{label}] Total: {len(products)} SKUs")
    return products


# ── Gap analysis ──────────────────────────────────────────────────────────────
def load_existing_skus() -> set:
    """Load SKUs already in ELIMFILTERS LD database."""
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


def write_gaps(catalog_skus: list[dict], existing: set):
    gaps = [p for p in catalog_skus if p["sku"] not in existing]
    with open(GAPS_FILE, "w", encoding="utf-8") as f:
        f.write(f"# MANN LD SKUs no en ELIMFILTERS ({len(gaps)} gaps)\n")
        f.write(f"# Total catálogo MANN LD: {len(catalog_skus)}\n")
        f.write(f"# En ELIMFILTERS: {len(existing)}\n\n")
        for p in sorted(gaps, key=lambda x: x["sku"]):
            f.write(f"{p['sku']}\t{p.get('filter_type','')}\t{p['url']}\n")
    log.info(f"Gaps guardados: {GAPS_FILE}  ({len(gaps)} SKUs nuevos)")


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--discover",  action="store_true", help="Inspecciona estructura del sitio")
    ap.add_argument("--stats",     action="store_true", help="Estadísticas del output")
    ap.add_argument("--gaps",      action="store_true", help="Muestra gaps vs ELIMFILTERS")
    ap.add_argument("--no-sitemap", action="store_true", help="Salta estrategia sitemap")
    ap.add_argument("--no-catalog", action="store_true", help="Salta estrategia catalog page")
    args = ap.parse_args()

    # ── Stats mode ──
    if args.stats:
        if not OUTPUT_FILE.exists():
            print("No hay output todavía. Corre sin --stats primero.")
            return
        counts = {}
        skus = []
        with open(OUTPUT_FILE, encoding="utf-8") as f:
            for line in f:
                p = json.loads(line)
                ft = p.get("filter_type", "Unknown")
                counts[ft] = counts.get(ft, 0) + 1
                skus.append(p["sku"])
        print(f"\n{'─'*50}")
        print(f"Catálogo MANN LD — {len(skus)} SKUs únicos")
        print(f"{'─'*50}")
        for ft, n in sorted(counts.items(), key=lambda x: -x[1]):
            print(f"  {ft:<25} {n:>5}")
        existing = load_existing_skus()
        gaps = [s for s in skus if s not in existing]
        print(f"{'─'*50}")
        print(f"  En ELIMFILTERS:  {len(existing)}")
        print(f"  Gaps (nuevos):   {len(gaps)}")
        return

    # ── Gaps mode ──
    if args.gaps:
        if not OUTPUT_FILE.exists():
            print("No hay output. Corre sin --gaps primero.")
            return
        catalog = []
        with open(OUTPUT_FILE, encoding="utf-8") as f:
            for line in f:
                catalog.append(json.loads(line))
        existing = load_existing_skus()
        write_gaps(catalog, existing)
        return

    # ── Collect products ──
    all_products: list[dict] = []
    seen_skus: set = set()

    # Strategy 1: Sitemap (fast, no browser)
    if not args.no_sitemap:
        log.info("=== Estrategia 1: Sitemap XML ===")
        sitemap_products = fetch_sitemap_products()
        for p in sitemap_products:
            if p["sku"] not in seen_skus:
                seen_skus.add(p["sku"])
                all_products.append(p)
        log.info(f"Sitemap: {len(sitemap_products)} SKUs LD")

    # Strategy 2: Playwright catalog pages (fallback or supplement)
    if not args.no_catalog:
        log.info("=== Estrategia 2: Playwright category pages ===")
        with sync_playwright() as pw:
            browser = pw.chromium.launch_persistent_context(
                PROFILE_DIR,
                channel="chrome",
                headless=False,
                args=["--disable-blink-features=AutomationControlled"],
                viewport={"width": 1280, "height": 900},
            )
            page = browser.pages[0] if browser.pages else browser.new_page()

            if args.discover:
                log.info("Modo discover: cargando página principal de catálogo")
                page.goto(f"https://www.mann-filter.com/{LOCALE}/catalog/", timeout=20000)
                time.sleep(3)
                # Dump navigation links
                nav_links = page.evaluate("""() => {
                    var links = document.querySelectorAll('nav a, .nav a, header a');
                    var out = [];
                    for (var i = 0; i < links.length; i++) {
                        var h = links[i].getAttribute('href') || '';
                        var t = links[i].textContent.trim().replace(/\\s+/g, ' ');
                        if (h && t && (
                            h.indexOf('filter') >= 0 || h.indexOf('catalog') >= 0 ||
                            t.toLowerCase().indexOf('filter') >= 0
                        )) {
                            out.push({href: h, text: t});
                        }
                    }
                    return out;
                }""")
                print("\n── Navigation links con 'filter' ──")
                for l in nav_links:
                    print(f"  {l['text']:30s}  {l['href']}")
                input("\nPresiona Enter para cerrar browser…")
                browser.close()
                return

            for label, candidate_urls in CATEGORY_URLS:
                log.info(f"\n{'─'*40}")
                log.info(f"Categoría: {label}")
                cat_products = scrape_category_playwright(page, label, candidate_urls)
                for p in cat_products:
                    if p["sku"] not in seen_skus:
                        seen_skus.add(p["sku"])
                        all_products.append(p)
                time.sleep(2)

            browser.close()

    # ── Save output ──
    if not all_products:
        log.warning("No se encontraron productos. Verifica URLs y sitemaps.")
        return

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        for p in sorted(all_products, key=lambda x: x["sku"]):
            f.write(json.dumps(p, ensure_ascii=False) + "\n")

    log.info(f"\n{'='*50}")
    log.info(f"Total MANN LD SKUs: {len(all_products)}")
    log.info(f"Output: {OUTPUT_FILE}")

    existing = load_existing_skus()
    write_gaps(all_products, existing)

    # Summary by type
    counts: dict = {}
    for p in all_products:
        ft = p.get("filter_type", "Unknown")
        counts[ft] = counts.get(ft, 0) + 1
    log.info("\nPor categoría:")
    for ft, n in sorted(counts.items(), key=lambda x: -x[1]):
        log.info(f"  {ft:<25} {n:>5}")


if __name__ == "__main__":
    main()
