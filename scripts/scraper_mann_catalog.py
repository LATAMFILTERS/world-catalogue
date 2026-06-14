#!/usr/bin/env python3
"""
scraper_mann_catalog.py
=======================
Enumera catálogo completo MANN LD usando XML sitemaps (sin browser).

Estrategia:
  robots.txt → Sitemap: URL → sitemap index XML → sub-sitemaps de productos
  → URLs tipo /catalog/search-results/product.html/{url_key}_mann-filter.html
  → extraer SKU del url_key → filtrar LD

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
import re
import time
from pathlib import Path

import requests
import xml.etree.ElementTree as ET

# ── Paths ──────────────────────────────────────────────────────────────────────
INPUT_OEM_MASTER = Path(r"C:\mann\mann_oem_master_clean.csv")
INPUT_CLASSIFIED = Path(r"C:\mann\mann_classified.jsonl")
OUTPUT_FILE      = Path(r"C:\mann\mann_catalog_ld.jsonl")
GAPS_FILE        = Path(r"C:\mann\mann_catalog_gaps.txt")

MANN_DOMAIN = "https://www.mann-filter.com"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}

# ── Logging ────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    handlers=[
        logging.FileHandler(r"C:\mann\scraper_mann_catalog.log", encoding="utf-8"),
        logging.StreamHandler(),
    ],
)
log = logging.getLogger(__name__)

# ── LD prefix filter ───────────────────────────────────────────────────────────
LD_PREFIXES = (
    "WK", "WP", "WD", "HU", "W",      # Oil / Lube
    "CUK", "CU", "CF",                 # Cabin
    "PU", "KC",                        # Fuel
    "LA", "SP", "DB", "FP", "C",      # Air
)

def is_ld(sku: str) -> bool:
    u = sku.upper().strip()
    if not u or u[0].isdigit():
        return False
    for pfx in sorted(LD_PREFIXES, key=len, reverse=True):
        if u.startswith(pfx):
            return True
    return False

def sku_to_filter_type(sku: str) -> str:
    u = sku.upper().strip()
    for pfx in sorted(LD_PREFIXES, key=len, reverse=True):
        if u.startswith(pfx):
            if pfx in ("CUK", "CU", "CF"):
                return "Cabin Filter"
            if pfx in ("WK", "PU", "KC"):
                return "Fuel Filter"
            if pfx in ("W", "WP", "WD", "HU"):
                return "Oil Filter"
            return "Air Filter"
    return "Unknown"

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
    sku = raw.upper().replace("%20", " ").replace("%2F", "/")
    # Convert dash between digit groups back to slash (MANN URL encoding)
    sku = re.sub(r"(\d)-(\d)", r"\1/\2", sku)
    return sku.strip()

# ── Sitemap fetching ───────────────────────────────────────────────────────────
def _get(url: str, retries: int = 3) -> bytes | None:
    for attempt in range(retries):
        try:
            r = requests.get(url, headers=HEADERS, timeout=30)
            if r.status_code == 200:
                return r.content
            log.info(f"  HTTP {r.status_code}: {url}")
            return None
        except Exception as e:
            log.warning(f"  Attempt {attempt+1} error ({url}): {e}")
            time.sleep(2 ** attempt)
    return None

def _parse_xml(content: bytes) -> tuple[list[str], list[str]]:
    """Returns (sub_sitemap_locs, page_locs)."""
    sub, pages = [], []
    try:
        root = ET.fromstring(content)
        ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        sub   = [e.text.strip() for e in root.findall("sm:sitemap/sm:loc", ns) if e.text]
        pages = [e.text.strip() for e in root.findall("sm:url/sm:loc", ns) if e.text]
    except Exception as e:
        log.warning(f"  XML parse error: {e}")
    return sub, pages

def discover_sitemaps() -> list[str]:
    """Read robots.txt + fallback locations."""
    found: list[str] = []
    content = _get(f"{MANN_DOMAIN}/robots.txt")
    if content:
        for line in content.decode("utf-8", errors="replace").splitlines():
            if line.lower().startswith("sitemap:"):
                url = line.split(":", 1)[1].strip()
                log.info(f"  robots.txt → {url}")
                found.append(url)

    for url in [
        f"{MANN_DOMAIN}/sitemap.xml",
        f"{MANN_DOMAIN}/sitemap_index.xml",
        f"{MANN_DOMAIN}/ph-en/sitemap.xml",
        f"{MANN_DOMAIN}/us-en/sitemap.xml",
        f"{MANN_DOMAIN}/de-de/sitemap.xml",
    ]:
        if url not in found:
            found.append(url)
    return found

def collect_product_urls() -> list[str]:
    """Walk all sitemaps, return product URLs."""
    visited: set[str] = set()
    queue = discover_sitemaps()
    product_urls: list[str] = []

    while queue:
        url = queue.pop(0)
        if url in visited:
            continue
        visited.add(url)

        log.info(f"Sitemap: {url}")
        content = _get(url)
        if not content:
            continue

        sub, pages = _parse_xml(content)

        if sub:
            log.info(f"  → sitemap index: {len(sub)} sub-sitemaps")
            # Prioritize product/catalog sub-sitemaps
            priority, rest = [], []
            for s in sub:
                if s in visited:
                    continue
                if any(k in s.lower() for k in ("product", "catalog", "part")):
                    priority.append(s)
                else:
                    rest.append(s)
            queue = priority + rest + queue

        if pages:
            prod = [u for u in pages if "product.html" in u or "_mann-filter" in u.lower()]
            log.info(f"  → {len(pages)} URLs | {len(prod)} product URLs")
            product_urls.extend(prod)

    log.info(f"Total product URLs: {len(product_urls)}")
    return product_urls

# ── Extract LD SKUs from URLs ──────────────────────────────────────────────────
def extract_ld(product_urls: list[str]) -> list[dict]:
    results: list[dict] = []
    seen: set[str] = set()

    for url in product_urls:
        sku = url_to_sku(url)
        if not sku or sku in seen or not is_ld(sku):
            continue
        seen.add(sku)
        results.append({
            "sku":         sku,
            "filter_type": sku_to_filter_type(sku),
            "url_key":     re.sub(r"[^a-z0-9/]", "", sku.lower().replace(" ", "")) + "_mann-filter",
            "source":      "sitemap",
        })

    return results

# ── Gap analysis ───────────────────────────────────────────────────────────────
def load_existing_skus() -> set:
    def clean(s: str) -> str:
        s = s.strip()
        for sfx in ("_MANN-FILTER", "_MANN", "-MANN-FILTER", "-MANN"):
            if s.upper().endswith(sfx):
                s = s[: len(s) - len(sfx)]
        return s.strip().upper()

    skus: set[str] = set()
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
        f.write(f"# Total MANN: {len(catalog)}  |  En ELIMFILTERS: {len(existing)}  |  Gaps: {len(gaps)}\n\n")
        for p in sorted(gaps, key=lambda x: x["sku"]):
            f.write(f"{p['sku']}\t{p['filter_type']}\n")
    log.info(f"Gaps: {len(gaps)} SKUs nuevos → {GAPS_FILE}")

# ── Main ───────────────────────────────────────────────────────────────────────
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
                p = json.loads(line)
                items.append(p)
                counts[p.get("filter_type", "?")] = counts.get(p.get("filter_type", "?"), 0) + 1
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

    # ── Sitemap run ──
    log.info("Estrategia: XML sitemap (sin browser)")
    product_urls = collect_product_urls()

    if not product_urls:
        log.error("No se encontraron URLs de producto en ningún sitemap.")
        log.error(f"Verifica manualmente: {MANN_DOMAIN}/robots.txt")
        return

    all_products = extract_ld(product_urls)

    if not all_products:
        log.warning("Sin productos LD encontrados en sitemaps.")
        return

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        for p in sorted(all_products, key=lambda x: x["sku"]):
            f.write(json.dumps(p, ensure_ascii=False) + "\n")

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
