#!/usr/bin/env python3
"""
scraper_mann_ld_crossref.py
============================
Busca cross-references FRAM/PUROLATOR/WIX para filtros MANN LD (light-duty).

Fuentes:
  W*              → oilfilter-crossreference.com   (aceite)
  WK*, PU*, KC*, KL* → fuelfilter-crossreference.com  (combustible)
  C*, CU*, CUK*, FP*, LA* → airfilter-crossreference.com  (aire / cabina)

Flujo:
  1. Lee C:\\mann\\mann_classified.jsonl → extrae SKUs con segment=LD
  2. Playwright scrape de cada SKU en su sitio correcto
  3. Guarda en C:\\mann\\mann_ld_crossrefs.jsonl  (append, no sobreescribe)
  4. Cache de progreso en C:\\mann\\mann_ld_crossrefs_progress.json

Uso:
    python scraper_mann_ld_crossref.py
    python scraper_mann_ld_crossref.py --start W940/21
    python scraper_mann_ld_crossref.py --test W940/21
    python scraper_mann_ld_crossref.py --dry-run
    python scraper_mann_ld_crossref.py --only-with-fram     # sólo muestra los que tienen FRAM
    python scraper_mann_ld_crossref.py --retry-zeros        # re-procesa los que tuvieron 0 resultados
"""

import argparse
import json
import logging
import os
import random
import sys
import time
from pathlib import Path
from urllib.parse import quote

from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

# ── Paths ──────────────────────────────────────────────────────────────────
INPUT_CLASSIFIED  = Path(r"C:\mann\mann_classified.jsonl")
INPUT_OEM_MASTER  = Path(r"C:\mann\mann_oem_master_clean.csv")
OUTPUT_FILE      = Path(r"C:\mann\mann_ld_crossrefs.jsonl")
PROGRESS_FILE    = Path(r"C:\mann\mann_ld_crossrefs_progress.json")

# ── Sites ──────────────────────────────────────────────────────────────────
SITES = {
    "oil":  "https://www.oilfilter-crossreference.com/convert/MANN-FILTER/{part}",
    "fuel": "https://www.fuelfilter-crossreference.com/convert/MANN-FILTER/{part}",
    "air":  "https://www.airfilter-crossreference.com/convert/MANN-FILTER/{part}",
}

PROFILE_DIRS = {
    "oil":  os.path.join(os.path.expanduser("~"), ".mann_crossref_oil"),
    "fuel": os.path.join(os.path.expanduser("~"), ".mann_crossref_fuel"),
    "air":  os.path.join(os.path.expanduser("~"), ".mann_crossref_air"),
}

# ── Prefix → site routing ──────────────────────────────────────────────────
# Longest prefix first to avoid CU matching before CUK
_PREFIX_ROUTES = [
    ("CUK", "air"),
    ("CU",  "air"),
    ("FP",  "air"),
    ("LA",  "air"),
    ("WK",  "fuel"),
    ("KC",  "fuel"),
    ("KL",  "oil"),
    ("PU",  "fuel"),
    ("W",   "oil"),
    ("C",   "air"),
    ("H",   "oil"),   # H = hydraulic, still worth trying oil
    ("DB",  "air"),   # DB cabin/breather — try air
    ("HU",  "oil"),
    ("SP",  "air"),
]

# Prefixes confirmed to return 0% crossrefs across all sites — skip entirely.
# LE / LB = industrial lube elements / specialty bulk filters (no consumer equivalents)
# Numeric (starts with digit) = OEM-only part numbers, no aftermarket crossrefs
# WK / PU / KC = fuel filters — intentar en fuelfilter-crossreference.com
_SKIP_PREFIXES = {"LE", "LB"}

def should_skip(sku: str) -> bool:
    """True if this SKU is known to return 0 crossref results on all sites."""
    u = sku.upper().strip()
    if u and u[0].isdigit():
        return True
    for pfx in _SKIP_PREFIXES:
        if u.startswith(pfx):
            return True
    return False

def prefix_to_site(sku: str) -> str:
    upper = sku.upper().lstrip()
    for prefix, site in _PREFIX_ROUTES:
        if upper.startswith(prefix):
            return site
    return "oil"   # fallback

# ── Logging ────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    handlers=[
        logging.FileHandler(r"C:\mann\scraper_mann_ld_crossref.log", encoding="utf-8"),
        logging.StreamHandler(),
    ],
)
log = logging.getLogger(__name__)

PAUSE = (3, 7)

# JS extractor — extracts all brands except MANN/MANN-FILTER
_EXTRACT_JS = """() => {
    const result = {};
    const links = document.querySelectorAll('ul.compat-list li a[href*="/convert/"]');
    for (const a of links) {
        const parts = a.getAttribute('href').split('/convert/');
        if (parts.length < 2) continue;
        const segments = parts[1].split('/');
        if (segments.length < 2) continue;
        const brand = decodeURIComponent(segments[0]).toUpperCase()
                        .replace(/-FILTER$/i,'').trim();
        const code  = decodeURIComponent(segments[1]).toUpperCase().trim();
        if (!brand || !code) continue;
        if (brand === 'MANN' || brand === 'MANN-FILTER') continue;
        if (!result[brand]) result[brand] = [];
        if (!result[brand].includes(code)) result[brand].push(code);
    }
    return result;
}"""


# ── Load input ─────────────────────────────────────────────────────────────
def load_ld_skus() -> list:
    """Returns list of unique LD SKUs from mann_oem_master_clean.csv (2,056 entries).
    Falls back to mann_classified.jsonl if CSV not found.
    Strips '_MANN-FILTER' suffix and any extra whitespace from all SKUs.
    """
    import csv

    def clean_sku(raw: str) -> str:
        s = raw.strip()
        # strip brand suffix appended during enrichment
        for suffix in ("_MANN-FILTER", "_MANN", "-MANN-FILTER", "-MANN"):
            if s.upper().endswith(suffix.upper()):
                s = s[: len(s) - len(suffix)]
        return s.strip()

    seen = set()
    skus = []

    if INPUT_OEM_MASTER.exists():
        with open(INPUT_OEM_MASTER, encoding="utf-8") as f:
            for row in csv.DictReader(f):
                if row.get("segment", "").upper() == "LD":
                    sku = clean_sku(row["sku"])
                    if sku and sku not in seen:
                        seen.add(sku)
                        skus.append(sku)
        log.info(f"LD SKUs cargados desde CSV: {len(skus)}")
    else:
        # fallback: classified JSONL
        with open(INPUT_CLASSIFIED, encoding="utf-8") as f:
            for line in f:
                p = json.loads(line)
                if p.get("segment", "").upper() == "LD":
                    sku = clean_sku(p["sku"])
                    if sku and sku not in seen:
                        seen.add(sku)
                        skus.append(sku)
        log.info(f"LD SKUs cargados desde JSONL (fallback): {len(skus)}")

    return skus


# ── Load progress cache ─────────────────────────────────────────────────────
def load_progress() -> dict:
    if PROGRESS_FILE.exists():
        with open(PROGRESS_FILE, encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_progress(progress: dict):
    tmp = str(PROGRESS_FILE) + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(progress, f, ensure_ascii=False, separators=(",", ":"))
    os.replace(tmp, str(PROGRESS_FILE))


# ── Save result row ─────────────────────────────────────────────────────────
def append_result(row: dict):
    with open(OUTPUT_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(row, ensure_ascii=False) + "\n")


# ── Playwright ──────────────────────────────────────────────────────────────
def make_context(pw, site="oil"):
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
        args=["--disable-blink-features=AutomationControlled"],
        ignore_default_args=["--enable-automation"],
    )


def scrape_one(page, sku: str, site: str) -> dict:
    encoded = quote(sku, safe="")
    url     = SITES[site].format(part=encoded)
    try:
        page.goto(url, wait_until="domcontentloaded", timeout=25000)
        try:
            page.wait_for_selector("ul.compat-list", timeout=8000)
        except PWTimeout:
            pass
        time.sleep(0.8)
        return page.evaluate(_EXTRACT_JS)
    except PWTimeout:
        return {}
    except Exception as e:
        log.warning(f"  Error {sku}: {e}")
        return {}


# ── FRAM code extractor (for SKU generation) ───────────────────────────────
def extract_fram(crossrefs: dict) -> str | None:
    """Returns first FRAM code found, or None."""
    for brand, codes in crossrefs.items():
        if "FRAM" in brand:
            return codes[0] if codes else None
    return None


# ── Main run ────────────────────────────────────────────────────────────────
def run(start_from: str = None, dry_run: bool = False, retry_zeros: bool = False):
    skus     = load_ld_skus()
    progress = load_progress()

    # retry-zeros: drop cached empty results so they get re-scraped
    if retry_zeros:
        before = len(progress)
        progress = {k: v for k, v in progress.items() if v}
        log.info(f"retry-zeros: {before - len(progress)} entradas vacías eliminadas del cache")
        save_progress(progress)

    # Apply --start
    if start_from:
        start_upper = start_from.upper()
        idx = next((i for i, s in enumerate(skus) if s.upper() == start_upper), None)
        if idx is None:
            log.warning(f"--start '{start_from}' no encontrado en lista LD")
        else:
            skus = skus[idx:]
            log.info(f"Reanudando desde {start_from} (posición {idx})")

    total = len(skus)
    log.info(f"A procesar: {total} SKUs LD")

    if dry_run:
        will_skip   = [s for s in skus if should_skip(s)]
        will_scrape = [s for s in skus if not should_skip(s)]
        log.info(f"[DRY-RUN] Skip: {len(will_skip)} | A scrapear: {len(will_scrape)}")
        log.info("[DRY-RUN] Primeros 10 que SE SCRAPEARAN:")
        for s in will_scrape[:10]:
            log.info(f"  {s} → site:{prefix_to_site(s)}")
        log.info("[DRY-RUN] Primeros 5 que SE SKIPPEAN:")
        for s in will_skip[:5]:
            log.info(f"  SKIP {s}")
        return

    # Group by site to reuse browser contexts
    by_site: dict[str, list] = {"oil": [], "fuel": [], "air": []}
    skipped = 0
    for sku in skus:
        if sku in progress:
            continue   # already done
        if should_skip(sku):
            skipped += 1
            continue   # known-zero prefix — no crossrefs on any site
        site = prefix_to_site(sku)
        by_site[site].append(sku)

    if skipped:
        log.info(f"Skip (known-zero prefixes / numeric OEM): {skipped} SKUs")

    cached = sum(1 for s in skus if s in progress)
    to_scrape = total - cached
    log.info(f"Cache: {cached} | A scrapear: {to_scrape}")

    # Process each site in turn
    with sync_playwright() as pw:
        for site, site_skus in by_site.items():
            if not site_skus:
                continue

            log.info(f"\n── Site:{site}  {len(site_skus)} SKUs ──")
            ctx  = make_context(pw, site)
            page = ctx.new_page()

            for i, sku in enumerate(site_skus, 1):
                global_idx = skus.index(sku) + 1
                log.info(f"[{global_idx}/{total}] {sku}  site:{site}")

                crossrefs = scrape_one(page, sku, site)
                fram      = extract_fram(crossrefs)

                brands      = list(crossrefs.keys())
                total_codes = sum(len(v) for v in crossrefs.values())

                if crossrefs:
                    log.info(f"  ✅ {len(brands)} marcas | {total_codes} códigos | FRAM:{fram or '—'}")
                else:
                    log.info(f"  ○ sin resultados")

                row = {
                    "sku":       sku,
                    "site":      site,
                    "crossrefs": crossrefs,
                    "fram":      fram,
                }

                progress[sku] = crossrefs
                save_progress(progress)
                append_result(row)

                time.sleep(random.uniform(*PAUSE))

            ctx.close()

    # Summary
    with_fram  = sum(1 for v in progress.values() if any("FRAM" in b for b in v))
    with_any   = sum(1 for v in progress.values() if v)
    log.info(
        f"\n✅ Completado\n"
        f"   Total procesados : {len(progress)}\n"
        f"   Con resultados   : {with_any}\n"
        f"   Con FRAM         : {with_fram}\n"
        f"   Sin ninguno      : {len(progress) - with_any}\n"
    )


# ── Test one ────────────────────────────────────────────────────────────────
def test_one(sku: str):
    site = prefix_to_site(sku)
    log.info(f"Testing {sku} on site:{site}")
    with sync_playwright() as pw:
        ctx  = make_context(pw, site)
        page = ctx.new_page()
        result = scrape_one(page, sku, site)
        ctx.close()

    print(f"\n=== CROSSREFS para {sku} (site:{site}) ===")
    if result:
        for brand, codes in sorted(result.items()):
            print(f"  {brand:25} {codes}")
        fram = extract_fram(result)
        print(f"\n  → FRAM: {fram or '(ninguno)'}")
    else:
        print("  (sin resultados)")


# ── Report ──────────────────────────────────────────────────────────────────
def report_with_fram():
    if not OUTPUT_FILE.exists():
        print("No existe el archivo de salida todavía.")
        return
    rows = []
    with open(OUTPUT_FILE, encoding="utf-8") as f:
        for line in f:
            r = json.loads(line)
            if r.get("fram"):
                rows.append(r)
    print(f"\n{len(rows)} SKUs con código FRAM:\n")
    print(f"{'MANN SKU':<20} {'FRAM':<15} {'OTRAS MARCAS'}")
    print("-" * 70)
    for r in rows[:50]:
        others = [b for b in r["crossrefs"] if "FRAM" not in b]
        print(f"  {r['sku']:<18} {r['fram']:<15} {', '.join(others[:5])}")


# ── Entry point ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--start",         default=None,  help="Reanudar desde este SKU")
    parser.add_argument("--test",          default=None,  help="Probar un SKU individual")
    parser.add_argument("--dry-run",       action="store_true")
    parser.add_argument("--retry-zeros",   action="store_true", help="Re-procesar SKUs sin resultados")
    parser.add_argument("--only-with-fram",action="store_true", help="Mostrar sólo los que tienen FRAM")
    args = parser.parse_args()

    if args.test:
        test_one(args.test)
        sys.exit(0)

    if args.only_with_fram:
        report_with_fram()
        sys.exit(0)

    run(
        start_from  = args.start,
        dry_run     = args.dry_run,
        retry_zeros = args.retry_zeros,
    )
