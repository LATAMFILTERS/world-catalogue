#!/usr/bin/env python3
"""
scraper_fram_fitment.py
=======================
Obtiene fitment [year, make, model, engine] de fram.com para cada código FRAM
encontrado en mann_ld_crossrefs.jsonl.

Flujo:
  1. Lee C:\\mann\\mann_ld_crossrefs.jsonl  → extrae códigos FRAM únicos
  2. Playwright → scrape fram.com/products/{code}/
  3. Guarda C:\\mann\\mann_ld_fitment.jsonl  (una fila por código FRAM)
  4. Cache en C:\\mann\\fram_fitment_progress.json

Uso:
    python scraper_fram_fitment.py
    python scraper_fram_fitment.py --test PH3600
    python scraper_fram_fitment.py --debug PH3600     # guarda HTML para inspección
    python scraper_fram_fitment.py --start PH4825
    python scraper_fram_fitment.py --dry-run
    python scraper_fram_fitment.py --retry-zeros
    python scraper_fram_fitment.py --stats             # resumen sin scrapear
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
CROSSREFS_FILE  = Path(r"C:\mann\mann_ld_crossrefs.jsonl")
OUTPUT_FILE     = Path(r"C:\mann\mann_ld_fitment.jsonl")
PROGRESS_FILE   = Path(r"C:\mann\fram_fitment_progress.json")
DEBUG_DIR       = Path(r"C:\mann\debug_html")

PROFILE_DIR     = os.path.join(os.path.expanduser("~"), ".fram_fitment_profile")

WALMART_SEARCH  = "https://www.walmart.com/search?q=FRAM+{part}"
PAUSE           = (4, 8)

# ── Logging ────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    handlers=[
        logging.FileHandler(r"C:\mann\scraper_fram_fitment.log", encoding="utf-8"),
        logging.StreamHandler(),
    ],
)
log = logging.getLogger(__name__)

# ── JS extractors ──────────────────────────────────────────────────────────
# Extrae tabla de fitment del product page de FRAM
# FRAM muestra la tabla "Vehicles This Part Fits" con columnas Year/Make/Model/Engine
_FITMENT_JS = """() => {
    const rows = [];

    // Pattern 1: tabla explícita de fitment
    const tables = document.querySelectorAll('table');
    for (const table of tables) {
        const headers = [...table.querySelectorAll('th')].map(th => th.textContent.trim().toLowerCase());
        const yearIdx  = headers.findIndex(h => h.includes('year'));
        const makeIdx  = headers.findIndex(h => h.includes('make'));
        const modelIdx = headers.findIndex(h => h.includes('model'));
        const engIdx   = headers.findIndex(h => h.includes('engine') || h.includes('motor'));
        if (yearIdx === -1 && makeIdx === -1) continue;
        for (const tr of table.querySelectorAll('tbody tr')) {
            const cells = [...tr.querySelectorAll('td')].map(td => td.textContent.trim());
            if (!cells.length) continue;
            const row = {};
            if (yearIdx  >= 0) row.year   = cells[yearIdx]  || '';
            if (makeIdx  >= 0) row.make   = cells[makeIdx]  || '';
            if (modelIdx >= 0) row.model  = cells[modelIdx] || '';
            if (engIdx   >= 0) row.engine = cells[engIdx]   || '';
            if (row.year || row.make) rows.push(row);
        }
        if (rows.length) break;
    }

    // Pattern 2: lista estructurada (algunos sitios usan divs con data attrs)
    if (!rows.length) {
        const items = document.querySelectorAll('[data-year],[data-make]');
        for (const el of items) {
            rows.push({
                year:   el.getAttribute('data-year')   || '',
                make:   el.getAttribute('data-make')   || '',
                model:  el.getAttribute('data-model')  || '',
                engine: el.getAttribute('data-engine') || '',
            });
        }
    }

    // Pattern 3: JSON-LD o microdata embebido en la página
    const scripts = document.querySelectorAll('script[type="application/json"], script[type="application/ld+json"]');
    for (const s of scripts) {
        try {
            const d = JSON.parse(s.textContent);
            const vehicles = d.vehicles || d.fitment || d.applications || [];
            if (Array.isArray(vehicles) && vehicles.length) {
                for (const v of vehicles) {
                    rows.push({
                        year:   String(v.year || v.Year || ''),
                        make:   v.make || v.Make || v.brand || '',
                        model:  v.model || v.Model || '',
                        engine: v.engine || v.Engine || v.engineDescription || '',
                    });
                }
            }
        } catch(e) {}
    }

    return rows;
}"""

# Extrae metadata del producto (nombre, descripción, tipo)
_META_JS = """() => {
    const title  = document.querySelector('h1')?.textContent?.trim() || '';
    const desc   = document.querySelector('meta[name="description"]')?.content || '';
    const schema = [];
    document.querySelectorAll('script[type="application/ld+json"]').forEach(s => {
        try { schema.push(JSON.parse(s.textContent)); } catch(e) {}
    });
    return { title, desc, schema };
}"""


# ── Load FRAM codes ─────────────────────────────────────────────────────────
def load_fram_codes() -> list:
    """
    Returns list of dicts: [{fram_code, mann_skus: [...]}]
    from mann_ld_crossrefs.jsonl
    """
    if not CROSSREFS_FILE.exists():
        log.error(f"No existe {CROSSREFS_FILE} — corre primero scraper_mann_ld_crossref.py")
        sys.exit(1)

    fram_to_manns: dict = {}
    with open(CROSSREFS_FILE, encoding="utf-8") as f:
        for line in f:
            r = json.loads(line)
            fram = r.get("fram")
            if not fram:
                continue
            sku = r.get("sku", "")
            if fram not in fram_to_manns:
                fram_to_manns[fram] = []
            if sku not in fram_to_manns[fram]:
                fram_to_manns[fram].append(sku)

    result = [{"fram_code": k, "mann_skus": v} for k, v in sorted(fram_to_manns.items())]
    log.info(f"Códigos FRAM únicos a procesar: {len(result)}")
    return result


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


def _find_walmart_url(page, fram_code: str) -> str | None:
    """Searches Walmart for FRAM {code} and returns the first product URL."""
    search_url = WALMART_SEARCH.format(part=fram_code.upper())
    try:
        page.goto(search_url, wait_until="domcontentloaded", timeout=30000)
        try:
            page.wait_for_load_state("networkidle", timeout=12000)
        except PWTimeout:
            pass
        time.sleep(2.5)

        product_url = page.evaluate("""(code) => {
            const lc = code.toLowerCase();
            // Pattern 1: product link whose href contains the code
            for (const a of document.querySelectorAll('a[href*="/ip/"]')) {
                const txt = (a.textContent || '').toLowerCase();
                const href = a.getAttribute('href') || '';
                if (txt.includes(lc) || href.toLowerCase().includes(lc)) {
                    return href.startsWith('http') ? href : 'https://www.walmart.com' + href;
                }
            }
            // Pattern 2: first /ip/ link in results (most are products)
            const first = document.querySelector('a[href*="/ip/"]');
            if (first) {
                const href = first.getAttribute('href');
                return href.startsWith('http') ? href : 'https://www.walmart.com' + href;
            }
            return null;
        }""", fram_code)

        if product_url:
            log.info(f"  Walmart URL: {product_url[:90]}")
        else:
            # Diagnose
            n_links = page.evaluate("() => document.querySelectorAll('a[href]').length")
            log.info(f"  Walmart: no product link found (total <a>: {n_links})")
        return product_url

    except Exception as e:
        log.warning(f"  Walmart search error {fram_code}: {e}")
        return None


# Walmart fitment extractor — "Specifications" + "Compatible with" sections
_WM_FITMENT_JS = """() => {
    const rows = [];

    // Pattern 1: structured fitment table (Year / Make / Model / Engine)
    const tables = document.querySelectorAll('table');
    for (const table of tables) {
        const headers = [...table.querySelectorAll('th')].map(h => h.textContent.trim().toLowerCase());
        const yearIdx  = headers.findIndex(h => h.includes('year'));
        const makeIdx  = headers.findIndex(h => h.includes('make'));
        const modelIdx = headers.findIndex(h => h.includes('model'));
        const engIdx   = headers.findIndex(h => h.includes('engine'));
        if (yearIdx === -1 && makeIdx === -1) continue;
        for (const tr of table.querySelectorAll('tbody tr')) {
            const cells = [...tr.querySelectorAll('td')].map(td => td.textContent.trim());
            if (!cells.length) continue;
            const row = {};
            if (yearIdx  >= 0) row.year   = cells[yearIdx]  || '';
            if (makeIdx  >= 0) row.make   = cells[makeIdx]  || '';
            if (modelIdx >= 0) row.model  = cells[modelIdx] || '';
            if (engIdx   >= 0) row.engine = cells[engIdx]   || '';
            if (row.year || row.make) rows.push(row);
        }
        if (rows.length) break;
    }

    // Pattern 2: Walmart's __NEXT_DATA__ JSON (rich product data)
    if (!rows.length) {
        const nd = document.getElementById('__NEXT_DATA__');
        if (nd) {
            try {
                const walk = (obj, depth) => {
                    if (!obj || typeof obj !== 'object' || depth > 12) return;
                    if (Array.isArray(obj)) { obj.forEach(o => walk(o, depth+1)); return; }
                    const k = Object.keys(obj);
                    // Look for vehicleFitment or similar arrays
                    const hasYear = k.some(x => /year/i.test(x));
                    const hasMake = k.some(x => /make|brand/i.test(x));
                    if (hasYear && hasMake) {
                        rows.push({
                            year:   String(obj.year || obj.startYear || obj.endYear || ''),
                            make:   obj.make || obj.vehicleMake || obj.brand || '',
                            model:  obj.model || obj.vehicleModel || '',
                            engine: obj.engine || obj.engineDescription || obj.displacement || '',
                        });
                    } else {
                        k.forEach(key => walk(obj[key], depth+1));
                    }
                };
                walk(JSON.parse(nd.textContent), 0);
            } catch(e) {}
        }
    }

    // Pattern 3: "Compatible with" text list — "2001-2010 Ford Explorer 4.0L V6"
    if (!rows.length) {
        const allText = document.body.innerText;
        const matches = allText.match(/\\b(19|20)\\d{2}[-–](19|20)\\d{2}\\s+[A-Z][a-z]+[^\\n]{5,60}/g) || [];
        matches.forEach(m => rows.push({ raw: m.trim() }));
    }

    return rows;
}"""


def scrape_fitment(page, fram_code: str) -> dict:
    product_url = _find_walmart_url(page, fram_code)
    if not product_url:
        return {"status": 404, "url": WALMART_SEARCH.format(part=fram_code),
                "title": "", "fitment": [], "source": "walmart"}
    try:
        resp = page.goto(product_url, wait_until="domcontentloaded", timeout=30000)
        status = resp.status if resp else 0
        try:
            page.wait_for_load_state("networkidle", timeout=12000)
        except PWTimeout:
            pass
        time.sleep(2)

        fitment = page.evaluate(_WM_FITMENT_JS)
        title   = page.evaluate(
            "() => document.querySelector('h1')?.textContent?.trim() || document.title || ''"
        )

        return {
            "status":  status,
            "url":     page.url,
            "title":   title,
            "fitment": fitment,
            "source":  "walmart",
        }
    except PWTimeout:
        return {"status": 408, "url": product_url, "title": "", "fitment": [], "source": "walmart"}
    except Exception as e:
        log.warning(f"  Error {fram_code}: {e}")
        return {"status": 0, "url": product_url, "title": "", "fitment": [], "source": "walmart"}


# ── Main run ────────────────────────────────────────────────────────────────
def run(start_from: str = None, retry_zeros: bool = False):
    items    = load_fram_codes()
    progress = load_progress()

    if retry_zeros:
        before = len(progress)
        progress = {k: v for k, v in progress.items() if v.get("fitment")}
        log.info(f"retry-zeros: {before - len(progress)} entradas sin fitment eliminadas del cache")
        save_progress(progress)

    if start_from:
        start_upper = start_from.upper()
        idx = next((i for i, r in enumerate(items) if r["fram_code"].upper() == start_upper), None)
        if idx is None:
            log.warning(f"--start '{start_from}' no encontrado")
        else:
            items = items[idx:]
            log.info(f"Reanudando desde {start_from}")

    to_process = [r for r in items if r["fram_code"] not in progress]
    cached     = len(items) - len(to_process)
    log.info(f"Total: {len(items)} | Cache: {cached} | A scrapear: {len(to_process)}")

    with sync_playwright() as pw:
        ctx  = make_context(pw, headless=False)
        page = ctx.new_page()

        for i, item in enumerate(to_process, 1):
            code      = item["fram_code"]
            mann_skus = item["mann_skus"]
            global_i  = items.index(item) + 1

            log.info(f"[{global_i}/{len(items)}] {code}  (MANN: {', '.join(mann_skus[:3])})")

            result = scrape_fitment(page, code)
            n_fit  = len(result["fitment"])

            if n_fit:
                log.info(f"  ✅ {n_fit} vehicles | {result['title'][:50]}")
            else:
                log.info(f"  ○ sin fitment | HTTP {result['status']} | {result['title'][:40]}")

            row = {
                "fram_code": code,
                "mann_skus": mann_skus,
                **result,
            }

            progress[code] = result
            save_progress(progress)
            append_result(row)

            time.sleep(random.uniform(*PAUSE))

        ctx.close()

    # Summary
    with_fit = sum(1 for v in progress.values() if v.get("fitment"))
    total_vehicles = sum(len(v.get("fitment", [])) for v in progress.values())
    log.info(
        f"\n✅ Completado\n"
        f"   Códigos FRAM procesados : {len(progress)}\n"
        f"   Con fitment             : {with_fit}\n"
        f"   Total vehicle rows      : {total_vehicles:,}\n"
    )


# ── Dry run ─────────────────────────────────────────────────────────────────
def dry_run():
    if not CROSSREFS_FILE.exists():
        log.error(f"Corre primero scraper_mann_ld_crossref.py")
        return
    items = load_fram_codes()
    print(f"\n{'FRAM CODE':<15} {'MANN SKUs'}")
    print("-" * 50)
    for r in items[:20]:
        print(f"  {r['fram_code']:<13} {', '.join(r['mann_skus'][:3])}")
    print(f"\n  ... ({len(items)} total)")


# ── Stats ────────────────────────────────────────────────────────────────────
def stats():
    progress = load_progress()
    if not progress:
        print("No hay datos aún.")
        return
    with_fit    = sum(1 for v in progress.values() if v.get("fitment"))
    total_veh   = sum(len(v.get("fitment", [])) for v in progress.values())
    http_errors = sum(1 for v in progress.values() if v.get("status", 200) not in (200, 301, 302))
    print(f"\nResumen fitment FRAM:")
    print(f"  Procesados   : {len(progress):,}")
    print(f"  Con fitment  : {with_fit:,}")
    print(f"  Sin fitment  : {len(progress) - with_fit:,}")
    print(f"  HTTP errores : {http_errors:,}")
    print(f"  Total filas  : {total_veh:,}")
    if with_fit:
        # Top 5 most vehicles
        top = sorted(
            ((k, len(v.get("fitment", []))) for k, v in progress.items() if v.get("fitment")),
            key=lambda x: -x[1]
        )[:5]
        print(f"\n  Top 5 por fitment:")
        for code, n in top:
            print(f"    {code:<15} {n} vehicles")


# ── Test one ─────────────────────────────────────────────────────────────────
def test_one(fram_code: str, debug: bool = False):
    log.info(f"Testing FRAM {fram_code}")
    with sync_playwright() as pw:
        ctx  = make_context(pw, headless=False)
        page = ctx.new_page()

        # Walmart search for diagnosis
        search_url = WALMART_SEARCH.format(part=fram_code.upper())
        log.info(f"  → {search_url}")
        page.goto(search_url, wait_until="domcontentloaded", timeout=30000)
        try:
            page.wait_for_load_state("networkidle", timeout=12000)
        except PWTimeout:
            pass
        time.sleep(3)

        if debug:
            DEBUG_DIR.mkdir(parents=True, exist_ok=True)
            html_path = DEBUG_DIR / f"wm_{fram_code}.html"
            html_path.write_text(page.content(), encoding="utf-8")
            log.info(f"HTML guardado en {html_path}")
            diag = page.evaluate("""() => {
                const links = [...document.querySelectorAll('a[href*="/ip/"]')]
                    .map(a => a.getAttribute('href'))
                    .slice(0, 15);
                return {
                    title: document.title,
                    url: location.href,
                    total_links: document.querySelectorAll('a[href]').length,
                    ip_links: links,
                };
            }""")
            print(f"\n=== DIAGNÓSTICO Walmart ===")
            print(f"  Title       : {diag['title']}")
            print(f"  Final URL   : {diag['url']}")
            print(f"  Total <a>   : {diag['total_links']}")
            print(f"  /ip/ links:")
            for h in diag['ip_links']:
                print(f"    {h[:100]}")
            ctx.close()
            return

        result = scrape_fitment(page, fram_code)
        ctx.close()

    print(f"\n=== FRAM {fram_code} ===")
    print(f"  URL    : {result['url']}")
    print(f"  Status : {result['status']}")
    print(f"  Title  : {result['title']}")
    print(f"  Fitment: {len(result['fitment'])} vehicles")
    if result["fitment"]:
        print()
        print(f"  {'YEAR':<8} {'MAKE':<15} {'MODEL':<25} ENGINE")
        print("  " + "-" * 70)
        for r in result["fitment"][:20]:
            print(f"  {r.get('year',''):<8} {r.get('make',''):<15} {r.get('model',''):<25} {r.get('engine','')[:30]}")
        if len(result["fitment"]) > 20:
            print(f"  ... ({len(result['fitment'])} total)")

    # Show JSON-LD schemas found (useful for debugging)
    for s in meta.get("schema", []):
        stype = s.get("@type", "")
        if stype:
            print(f"\n  JSON-LD @type: {stype}")


# ── Entry point ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--test",        default=None, help="Probar un código FRAM")
    parser.add_argument("--debug",       default=None, help="Guardar HTML para inspección")
    parser.add_argument("--start",       default=None, help="Reanudar desde este código FRAM")
    parser.add_argument("--dry-run",     action="store_true")
    parser.add_argument("--retry-zeros", action="store_true")
    parser.add_argument("--stats",       action="store_true")
    args = parser.parse_args()

    if args.test:
        test_one(args.test)
    elif args.debug:
        test_one(args.debug, debug=True)
    elif args.dry_run:
        dry_run()
    elif args.stats:
        stats()
    else:
        run(start_from=args.start, retry_zeros=args.retry_zeros)
