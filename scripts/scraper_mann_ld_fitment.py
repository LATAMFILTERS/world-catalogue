#!/usr/bin/env python3
"""
scraper_mann_ld_fitment.py
==========================
Obtiene fitment [make, model, year, engine] de mann-filter.com
para cada filtro MANN LD.

MANN-Filter es el fabricante — sitio europeo, menos bot-protection,
datos más completos y autoritativos que retailers US (Walmart/AutoZone
bloquean headless browsers con Cloudflare).

Flujo:
  1. Lee C:\\mann\\mann_classified.jsonl  → url_key por SKU LD
  2. Playwright → mann-filter.com/en-us/spare-parts/{url_key}/
  3. Extrae tabla vehicles compatible
  4. Guarda C:\\mann\\mann_ld_fitment.jsonl
  5. Cache en C:\\mann\\mann_ld_fitment_progress.json

Uso:
    python scraper_mann_ld_fitment.py --test W940/21
    python scraper_mann_ld_fitment.py --debug W940/21   # guarda HTML
    python scraper_mann_ld_fitment.py
    python scraper_mann_ld_fitment.py --start W7
    python scraper_mann_ld_fitment.py --retry-zeros
    python scraper_mann_ld_fitment.py --stats
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
INPUT_CLASSIFIED = Path(r"C:\mann\mann_classified.jsonl")
OUTPUT_FILE      = Path(r"C:\mann\mann_ld_fitment.jsonl")
PROGRESS_FILE    = Path(r"C:\mann\mann_ld_fitment_progress.json")
DEBUG_DIR        = Path(r"C:\mann\debug_html")

PROFILE_DIR = os.path.join(os.path.expanduser("~"), ".mann_fitment_profile")
MANN_BASE    = "https://www.mann-filter.com/ph-en/catalog/search-results/product.html/{url_key}.html"
MANN_SEARCH  = "https://www.mann-filter.com/ph-en/catalogsearch/result/?q={part}"
MANN_DOMAIN  = "https://www.mann-filter.com"
PAUSE        = (3, 6)


def _build_url_key(raw_key: str, sku: str) -> str:
    """Build MANN product URL slug.

    MANN ph-en URL format:
      /ph-en/catalog/search-results/product.html/{slug}_mann-filter.html
    For SKUs like W940/21 the slug uses ONLY the part before the slash: w940
    For SKUs like WK8114 (no slash) the slug is: wk8114
    """
    s = raw_key.strip().lower() if raw_key.strip() else sku.lower()

    # strip _mann-filter / -mann-filter suffix (we re-add at end)
    for sfx in ("_mann-filter", "-mann-filter"):
        if s.endswith(sfx):
            s = s[: -len(sfx)]
            break

    # replace spaces with dashes
    s = s.replace(" ", "-")

    # W940/21 → w940  (MANN URL uses only the base, not the variant suffix)
    if "/" in s:
        s = s.split("/")[0]

    s = s.strip("-")
    s += "_mann-filter"
    return s

# ── Logging ────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    handlers=[
        logging.FileHandler(r"C:\mann\scraper_mann_ld_fitment.log", encoding="utf-8"),
        logging.StreamHandler(),
    ],
)
log = logging.getLogger(__name__)


# ── Load LD SKUs with url_key from mann_classified.jsonl ───────────────────
def load_ld_items() -> list:
    """
    Returns list of {sku, url_key, segment} for LD products.
    Strips _MANN-FILTER suffix from sku and url_key.
    """
    def clean(s: str) -> str:
        for sfx in ("_mann-filter", "_mann-filter"):
            if s.lower().endswith(sfx):
                s = s[:-len(sfx)]
        return s.strip()

    seen = set()
    items = []
    with open(INPUT_CLASSIFIED, encoding="utf-8") as f:
        for line in f:
            p = json.loads(line)
            if p.get("segment", "").upper() != "LD":
                continue
            sku     = clean(p.get("sku", ""))
            url_key = clean(p.get("url_key", ""))
            if not sku or sku in seen:
                continue
            seen.add(sku)
            items.append({"sku": sku, "url_key": _build_url_key(url_key, sku)})

    log.info(f"LD items cargados: {len(items)}")
    return items


# ── Progress ────────────────────────────────────────────────────────────────
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


def append_result(row: dict):
    with open(OUTPUT_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(row, ensure_ascii=False) + "\n")


# ── Playwright ──────────────────────────────────────────────────────────────
def make_context(pw, headless: bool = False):
    return pw.chromium.launch_persistent_context(
        user_data_dir=PROFILE_DIR,
        channel="chrome",
        headless=headless,
        locale="en-US",
        viewport={"width": 1366, "height": 900},
        ignore_https_errors=True,
        user_agent=(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        ),
        args=["--disable-blink-features=AutomationControlled"],
        ignore_default_args=["--enable-automation"],
    )


# ── MANN fitment extractor ─────────────────────────────────────────────────
_MANN_FITMENT_JS = """() => {
    const rows = [];

    // Pattern 1: structured vehicle table (Make / Model / Year / Engine)
    const tables = document.querySelectorAll('table');
    for (const table of tables) {
        const ths = [...table.querySelectorAll('th')].map(h => h.textContent.trim().toLowerCase());
        const makeIdx  = ths.findIndex(h => h.includes('make') || h.includes('brand') || h.includes('manufacturer'));
        const modelIdx = ths.findIndex(h => h.includes('model') || h.includes('type'));
        const yearIdx  = ths.findIndex(h => h.includes('year') || h.includes('from') || h.includes('period'));
        const engIdx   = ths.findIndex(h => h.includes('engine') || h.includes('motor') || h.includes('displacement'));
        if (makeIdx === -1 && modelIdx === -1) continue;
        for (const tr of table.querySelectorAll('tbody tr')) {
            const cells = [...tr.querySelectorAll('td')].map(td => td.textContent.trim());
            if (!cells.length) continue;
            const row = {};
            if (makeIdx  >= 0) row.make   = cells[makeIdx]  || '';
            if (modelIdx >= 0) row.model  = cells[modelIdx] || '';
            if (yearIdx  >= 0) row.year   = cells[yearIdx]  || '';
            if (engIdx   >= 0) row.engine = cells[engIdx]   || '';
            if (row.make || row.model) rows.push(row);
        }
        if (rows.length) break;
    }

    // Pattern 2: application list items / cards
    if (!rows.length) {
        const cards = document.querySelectorAll(
            '[class*="vehicle"] [class*="item"], [class*="application"] li, ' +
            '[class*="compat"] li, [data-vehicle], [class*="car-item"]'
        );
        for (const card of cards) {
            const text = card.textContent.trim().replace(/\\s+/g, ' ');
            if (text.length > 3) rows.push({ raw: text });
        }
    }

    // Pattern 3: JSON-LD or embedded data
    if (!rows.length) {
        document.querySelectorAll('script[type="application/json"], script[type="application/ld+json"]')
            .forEach(s => {
                try {
                    const walk = (obj, depth) => {
                        if (!obj || typeof obj !== 'object' || depth > 10) return;
                        if (Array.isArray(obj)) { obj.forEach(o => walk(o, depth+1)); return; }
                        const keys = Object.keys(obj);
                        const hasVeh = keys.some(k => /make|model|vehicle|brand/i.test(k));
                        if (hasVeh && (obj.make || obj.model || obj.vehicleType)) {
                            rows.push({
                                make:   obj.make || obj.brand || obj.vehicleMake || '',
                                model:  obj.model || obj.vehicleModel || '',
                                year:   String(obj.year || obj.startYear || ''),
                                engine: obj.engine || obj.engineDescription || obj.displacement || '',
                            });
                        } else {
                            keys.forEach(k => walk(obj[k], depth+1));
                        }
                    };
                    walk(JSON.parse(s.textContent), 0);
                } catch(e) {}
            });
    }

    // Pattern 4: all text lines matching "Make Model YYYY" pattern
    if (!rows.length) {
        const bodyText = document.body?.innerText || '';
        const lines = bodyText.split('\\n').map(l => l.trim()).filter(l => l.length > 5);
        const yearRe = /\\b(19|20)\\d{2}\\b/;
        for (const line of lines) {
            if (yearRe.test(line) && line.length < 120) {
                rows.push({ raw: line });
            }
        }
    }

    return rows;
}"""


def _dismiss_cookies(page):
    for sel in [
        "button#onetrust-accept-btn-handler",
        "button:has-text('Accept All')",
        "button:has-text('Accept')",
        "[class*='cookie'] button",
        "button:has-text('OK')",
    ]:
        try:
            if page.locator(sel).is_visible(timeout=400):
                page.locator(sel).click()
                time.sleep(0.4)
                break
        except Exception:
            pass


def _load_page(page, url: str) -> int:
    """Navigate to url, wait for idle, dismiss cookies. Returns HTTP status."""
    try:
        resp = page.goto(url, wait_until="domcontentloaded", timeout=25000)
        status = resp.status if resp else 0
        try:
            page.wait_for_load_state("networkidle", timeout=8000)
        except PWTimeout:
            pass
        time.sleep(1)
        _dismiss_cookies(page)
        return status
    except PWTimeout:
        return 408


def _extract(page) -> tuple[str, list]:
    title   = page.evaluate(
        "() => document.querySelector('h1')?.textContent?.trim() || document.title || ''"
    )
    fitment = page.evaluate(_MANN_FITMENT_JS)
    return title, fitment


# JS that finds first product href from MANN search results (ph-en catalog format)
_SEARCH_RESULT_JS = """() => {
    // ph-en: product URLs contain /catalog/search-results/product.html/
    const byPath = document.querySelectorAll('a[href*="catalog/search-results/product"]');
    for (const a of byPath) {
        const href = a.getAttribute('href') || '';
        if (href.endsWith('.html') && !href.includes('?')) return a.href;
    }
    // fallback: spare-parts path (en-us locale)
    const byParts = document.querySelectorAll('a[href*="/spare-parts/"]');
    for (const a of byParts) {
        const href = a.getAttribute('href') || '';
        const tail = href.split('/spare-parts/')[1] || '';
        if (tail.length > 3 && !tail.startsWith('?') && !tail.startsWith('#')) {
            return a.href;
        }
    }
    return null;
}"""


def scrape_mann_fitment(page, sku: str, url_key: str) -> dict:
    url_key = _build_url_key(url_key, sku)
    direct  = MANN_BASE.format(url_key=url_key)
    via_search = False

    try:
        status = _load_page(page, direct)
        title, fitment = _extract(page)
        final_url = page.url

        # 404 or empty → try search to find actual product URL
        if status == 404 or not fitment:
            encoded    = quote(sku, safe="")
            search_url = MANN_SEARCH.format(part=encoded)
            log.info(f"  → fallback search: {search_url}")
            _load_page(page, search_url)

            product_url = page.evaluate(_SEARCH_RESULT_JS)
            if product_url and "/spare-parts/" in product_url:
                log.info(f"  → product found: {product_url}")
                status    = _load_page(page, product_url)
                title, fitment = _extract(page)
                final_url  = page.url
                via_search = True
            else:
                log.info(f"  → no product link found in search results")

        return {
            "status":     status,
            "url":        final_url,
            "title":      title,
            "fitment":    fitment,
            "via_search": via_search,
        }

    except PWTimeout:
        return {"status": 408, "url": direct, "title": "", "fitment": [], "via_search": False}
    except Exception as e:
        log.warning(f"  Error {sku}: {e}")
        return {"status": 0, "url": direct, "title": "", "fitment": [], "via_search": False}


# ── Main run ────────────────────────────────────────────────────────────────
def run(start_from: str = None, retry_zeros: bool = False):
    items    = load_ld_items()
    progress = load_progress()

    if retry_zeros:
        before = len(progress)
        progress = {k: v for k, v in progress.items() if v.get("fitment")}
        log.info(f"retry-zeros: {before - len(progress)} sin fitment eliminados")
        save_progress(progress)

    if start_from:
        su = start_from.upper()
        idx = next((i for i, p in enumerate(items) if p["sku"].upper() == su), None)
        if idx is None:
            log.warning(f"--start '{start_from}' no encontrado")
        else:
            items = items[idx:]
            log.info(f"Reanudando desde {start_from}")

    to_do  = [p for p in items if p["sku"] not in progress]
    cached = len(items) - len(to_do)
    log.info(f"Total: {len(items)} | Cache: {cached} | A scrapear: {len(to_do)}")

    with sync_playwright() as pw:
        ctx  = make_context(pw, headless=False)
        page = ctx.new_page()

        for item in to_do:
            sku     = item["sku"]
            url_key = item["url_key"]
            idx     = next(i+1 for i, p in enumerate(items) if p["sku"] == sku)
            log.info(f"[{idx}/{len(items)}] {sku}  url_key:{url_key}")

            result  = scrape_mann_fitment(page, sku, url_key)
            n_fit   = len(result["fitment"])

            if n_fit:
                log.info(f"  ✅ {n_fit} vehicles | {result['title'][:50]}")
            else:
                log.info(f"  ○ sin fitment | HTTP {result['status']}")

            row = {"sku": sku, "url_key": url_key, **result}
            progress[sku] = result
            save_progress(progress)
            append_result(row)

            time.sleep(random.uniform(*PAUSE))

        ctx.close()

    with_fit   = sum(1 for v in progress.values() if v.get("fitment"))
    total_rows = sum(len(v.get("fitment", [])) for v in progress.values())
    log.info(
        f"\n✅ Completado\n"
        f"   SKUs procesados   : {len(progress)}\n"
        f"   Con fitment       : {with_fit}\n"
        f"   Total vehicle rows: {total_rows:,}\n"
    )


# ── Stats ────────────────────────────────────────────────────────────────────
def stats():
    progress = load_progress()
    if not progress:
        print("No hay datos aún.")
        return
    with_fit   = sum(1 for v in progress.values() if v.get("fitment"))
    total_rows = sum(len(v.get("fitment", [])) for v in progress.values())
    print(f"\nMann LD fitment stats:")
    print(f"  Procesados       : {len(progress):,}")
    print(f"  Con fitment      : {with_fit:,}")
    print(f"  Sin fitment      : {len(progress) - with_fit:,}")
    print(f"  Total rows       : {total_rows:,}")
    if with_fit:
        top = sorted(
            ((k, len(v.get("fitment", []))) for k, v in progress.items() if v.get("fitment")),
            key=lambda x: -x[1]
        )[:5]
        print(f"\n  Top 5 por fitment:")
        for sku, n in top:
            print(f"    {sku:<20} {n} vehicles")


# ── Test one ─────────────────────────────────────────────────────────────────
def test_one(sku: str, debug: bool = False):
    # Build url_key from classified data
    url_key = None
    if INPUT_CLASSIFIED.exists():
        with open(INPUT_CLASSIFIED, encoding="utf-8") as f:
            for line in f:
                p = json.loads(line)
                raw_sku = p.get("sku", "")
                if sku.upper() in raw_sku.upper():
                    url_key = _build_url_key(p.get("url_key", ""), sku)
                    break
    if not url_key:
        url_key = _build_url_key("", sku)

    url_key = _build_url_key(url_key, sku)
    url     = MANN_BASE.format(url_key=url_key)
    log.info(f"Testing {sku}  url_key:{url_key}")
    log.info(f"  → {url}")

    with sync_playwright() as pw:
        ctx  = make_context(pw, headless=False)
        page = ctx.new_page()
        page.goto(url, wait_until="domcontentloaded", timeout=25000)
        try:
            page.wait_for_load_state("networkidle", timeout=8000)
        except PWTimeout:
            pass
        time.sleep(2)

        if debug:
            DEBUG_DIR.mkdir(parents=True, exist_ok=True)
            html_path = DEBUG_DIR / f"mann_{sku.replace('/', '-')}.html"
            html_path.write_text(page.content(), encoding="utf-8")
            diag = page.evaluate("""() => ({
                title: document.title,
                url: location.href,
                h1: document.querySelector('h1')?.textContent?.trim() || '',
                tables: document.querySelectorAll('table').length,
                total_links: document.querySelectorAll('a[href]').length,
                spare_links: [...document.querySelectorAll('a[href*="/spare-parts/"]')]
                                .map(a => a.href).slice(0, 10),
            })""")
            log.info(f"HTML guardado en {html_path}")
            print(f"\n=== DIAGNÓSTICO MANN {sku} ===")
            print(f"  Title      : {diag['title']}")
            print(f"  H1         : {diag['h1']}")
            print(f"  URL        : {diag['url']}")
            print(f"  Tables     : {diag['tables']}")
            print(f"  Total links: {diag['total_links']}")
            print(f"  /spare-parts links:")
            for lnk in diag.get("spare_links", []):
                print(f"    {lnk}")

            # also try the search fallback and show what comes back
            encoded    = quote(sku, safe="")
            search_url = MANN_SEARCH.format(part=encoded)
            print(f"\n  Trying search: {search_url}")
            page.goto(search_url, wait_until="domcontentloaded", timeout=25000)
            try:
                page.wait_for_load_state("networkidle", timeout=8000)
            except PWTimeout:
                pass
            time.sleep(1)
            product_url = page.evaluate(_SEARCH_RESULT_JS)
            print(f"  Product found: {product_url or '(none)'}")
            if product_url:
                html_path2 = DEBUG_DIR / f"mann_{sku.replace('/', '-')}_product.html"
                page.goto(product_url, wait_until="domcontentloaded", timeout=25000)
                try:
                    page.wait_for_load_state("networkidle", timeout=8000)
                except PWTimeout:
                    pass
                time.sleep(1)
                html_path2.write_text(page.content(), encoding="utf-8")
                _, fitment = _extract(page)
                print(f"  Fitment rows : {len(fitment)}")
                log.info(f"Product HTML guardado en {html_path2}")

            ctx.close()
            return

        result = scrape_mann_fitment(page, sku, url_key)
        ctx.close()

    print(f"\n=== MANN {sku} ===")
    print(f"  URL     : {result['url']}")
    print(f"  Status  : {result['status']}")
    print(f"  Title   : {result['title']}")
    print(f"  Fitment : {len(result['fitment'])} vehicles")
    if result["fitment"]:
        print()
        for r in result["fitment"][:15]:
            if "raw" in r:
                print(f"  {r['raw']}")
            else:
                print(f"  {r.get('year',''):<12} {r.get('make',''):<15} {r.get('model',''):<20} {r.get('engine','')}")
        if len(result["fitment"]) > 15:
            print(f"  ... ({len(result['fitment'])} total)")


# ── Entry point ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--test",        default=None, help="SKU a testear (ej: W940/21)")
    parser.add_argument("--debug",       default=None, help="Guardar HTML + diagnóstico")
    parser.add_argument("--start",       default=None, help="Reanudar desde este SKU")
    parser.add_argument("--retry-zeros", action="store_true")
    parser.add_argument("--stats",       action="store_true")
    args = parser.parse_args()

    if args.test:
        test_one(args.test)
    elif args.debug:
        test_one(args.debug, debug=True)
    elif args.stats:
        stats()
    else:
        run(start_from=args.start, retry_zeros=args.retry_zeros)
