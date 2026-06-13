#!/usr/bin/env python3
"""
scraper_mann_master.py
======================
Extrae TODO de mann-filter.com para cada SKU LD:
  - Tipo de filtro  (Oil Filter / Fuel Filter / Air Filter / Cabin Filter)
  - GTIN / EAN
  - Descripción ("About this item")
  - Dimensiones (A, B, C, G, H en pulgadas y mm)
  - Especificaciones técnicas (bypass valve, anti-drain, anti-siphon...)
  - OE Numbers (FIAT→[4119015,...], OPEL→[3448991,...])
  - Fitment / Vehículos (make, model_family, model_type, engine_code, ccm, kW, HP, year)

Output: C:\\mann\\mann_master.jsonl  (una línea JSON por SKU)
Cache:  C:\\mann\\mann_master_progress.json

Uso:
    python scraper_mann_master.py --test W940/21
    python scraper_mann_master.py
    python scraper_mann_master.py --start WK7014
    python scraper_mann_master.py --retry-zeros
    python scraper_mann_master.py --stats
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
INPUT_OEM_MASTER = Path(r"C:\mann\mann_oem_master_clean.csv")
OUTPUT_FILE      = Path(r"C:\mann\mann_master.jsonl")
PROGRESS_FILE    = Path(r"C:\mann\mann_master_progress.json")

PROFILE_DIR  = os.path.join(os.path.expanduser("~"), ".mann_master_profile")
MANN_LOCALES = ["us-en", "ph-en", "de-de", "gb-en"]
MANN_BASE    = "https://www.mann-filter.com/{locale}/catalog/search-results/product.html/{url_key}.html"
MANN_DOMAIN  = "https://www.mann-filter.com"
PAUSE        = (4, 8)

# ── Logging ────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    handlers=[
        logging.FileHandler(r"C:\mann\scraper_mann_master.log", encoding="utf-8"),
        logging.StreamHandler(),
    ],
)
log = logging.getLogger(__name__)


# ── URL key builder ────────────────────────────────────────────────────────
def _build_url_key(raw_key: str, sku: str) -> str:
    """W940/21 → w940/21_mann-filter  (slash kept: literal path segment on MANN site)"""
    s = raw_key.strip().lower() if raw_key.strip() else sku.lower()
    for sfx in ("_mann-filter", "-mann-filter"):
        if s.endswith(sfx):
            s = s[: -len(sfx)]
            break
    s = s.replace(" ", "-").strip("-")
    s += "_mann-filter"
    return s


# ── Master JS extractor ────────────────────────────────────────────────────
_MANN_MASTER_JS = """() => {
    // ── Column aliases: EN + DE ──────────────────────────────────────────
    const COL_ALIASES = {
        modelType:  ['Model Type',           'Fahrzeugtyp',     'Typ'],
        filterType: ['Filter Type',          'Filtertyp'],
        engineCode: ['Engine Code',          'Motorcode',       'Motor'],
        ccm:        ['ccm'],
        kw:         ['kW'],
        hp:         ['HP', 'PS'],
        year:       ['Year of Manufacture',  'Baujahr',         'Herstellungsjahr'],
    };
    const SKIP_CELLS = new Set(['-', '–', '']);
    for (const aliases of Object.values(COL_ALIASES))
        for (const a of aliases) SKIP_CELLS.add(a);

    // ── Helper: extract key-value table from an accordion item ───────────
    function kvTable(section) {
        const result = {};
        if (!section) return result;
        section.querySelectorAll('table tr').forEach(tr => {
            const cells = [...tr.querySelectorAll('td,th')]
                .map(c => c.textContent.trim().replace(/\\s+/g, ' '));
            if (cells.length >= 2 && cells[0] && cells[1])
                result[cells[0]] = cells[1];
        });
        return result;
    }

    // ── 1. Filter type & product title ───────────────────────────────────
    // MANN titles look like: "Oil Filter\nW 940/21" or "Ölfilter\nHU 6013 y"
    const titleEl = document.querySelector('.cmp-product__title, h1');
    const rawTitle = (titleEl?.textContent || document.title || '').trim().replace(/\\s+/g,' ');
    const filterType = rawTitle.split(/\\n/)[0].trim();

    // ── 2. GTIN code ─────────────────────────────────────────────────────
    const bodyText = document.body.innerText || '';
    const gtinMatch = bodyText.match(/GTIN[\\s\\w]*[:\\s]+([0-9]{8,14})/i);
    const gtin = gtinMatch ? gtinMatch[1].trim() : '';

    // ── 3. Description ("About this item") ───────────────────────────────
    let description = '';
    const aboutSection = document.querySelector('[id*="about"], [class*="about-item"], .cmp-product__description');
    if (aboutSection) {
        description = aboutSection.textContent.trim().replace(/\\s+/g,' ').substring(0, 800);
    } else {
        // Fallback: find first substantial text block on page (≥100 chars)
        for (const el of document.querySelectorAll('p, [class*="text"]')) {
            const t = el.textContent.trim().replace(/\\s+/g,' ');
            if (t.length >= 100 && t.length <= 800) { description = t; break; }
        }
    }

    // ── 4. Dimensions ────────────────────────────────────────────────────
    const dims = kvTable(document.getElementById('dimensions'));

    // Also try to extract inline dimension string from "About this item" text
    // e.g. "Outer diameter (A) = 3.661 in; Inner diameter of gasket (B) = 2.441 in; ..."
    const dimInline = {};
    const dimMatches = [...bodyText.matchAll(/([A-Z][^=]{0,40})\\(([A-Z])\\)\\s*=\\s*([0-9.]+\\s*(?:in|mm)[^;]*)/gi)];
    for (const m of dimMatches) {
        const code = m[2].toUpperCase();
        const val  = m[3].trim();
        dimInline[code] = val;
    }

    // ── 5. Technical Specifications ──────────────────────────────────────
    const specs = kvTable(document.getElementById('technicalData'));

    // ── 6. OE Numbers ────────────────────────────────────────────────────
    // Accordion item with "OE Number" in its button text
    const oeNumbers = {};
    const oeItem = [...document.querySelectorAll('.cmp-accordion__item')].find(item =>
        (item.querySelector('.cmp-accordion__button, .cmp-accordion__header')?.textContent || '').includes('OE Number')
    );
    if (oeItem) {
        const table = oeItem.querySelector('table');
        if (table) {
            let lastMake = '';
            table.querySelectorAll('tr').forEach(tr => {
                const cells = [...tr.querySelectorAll('td')]
                    .map(c => c.textContent.trim().replace(/\\s+/g, ' '))
                    .filter(c => c);
                if (!cells.length) return;
                if (cells.length === 2) {
                    // make | code  or  make (rowspan) | code
                    const [makeCell, codeCell] = cells;
                    // If first cell looks like a make name (no digits or short alphanumeric brand)
                    if (makeCell && !/^\\d/.test(makeCell)) lastMake = makeCell;
                    const target = lastMake || makeCell;
                    if (!oeNumbers[target]) oeNumbers[target] = [];
                    if (codeCell) oeNumbers[target].push(codeCell);
                } else if (cells.length === 1) {
                    // Single-cell row: either a make header (rowspan) or an OE code under lastMake
                    const val = cells[0];
                    if (!oeNumbers[val] && /^[A-Z][A-Z0-9\\s&-]{0,25}$/.test(val) && !/^[0-9]/.test(val)) {
                        // Looks like a make name
                        lastMake = val;
                        oeNumbers[lastMake] = [];
                    } else if (lastMake) {
                        oeNumbers[lastMake].push(val);
                    }
                }
            });
        } else {
            // No table: try reading raw text blocks (make name then codes)
            let lastMake = '';
            oeItem.querySelectorAll('p, li, div, span').forEach(el => {
                if (el.children.length > 2) return;
                const t = el.textContent.trim().replace(/\\s+/g, ' ');
                if (!t || t.length > 60 || t === 'OE Numbers') return;
                if (/^[A-Z][A-Z0-9\\s&-]{1,24}$/.test(t) && !/^[0-9]/.test(t)) {
                    lastMake = t;
                    if (!oeNumbers[lastMake]) oeNumbers[lastMake] = [];
                } else if (lastMake && t) {
                    oeNumbers[lastMake].push(t);
                }
            });
        }
    }

    // ── 7. Fitment / Vehicles / Applications ─────────────────────────────
    function resolveCol(colIdx, aliases) {
        for (const a of aliases) if (colIdx[a] !== undefined) return colIdx[a];
        return -1;
    }

    const fitment = [];
    document.querySelectorAll('.cmp-application-table').forEach(appDiv => {
        const table = appDiv.querySelector('table');
        if (!table) return;
        const innerPanel = appDiv.closest('.cmp-accordion__panel');
        const outerPanel = innerPanel?.parentElement?.closest('.cmp-accordion__panel');
        const modelFamily = (innerPanel?.previousElementSibling?.textContent || '').trim();
        const makeName    = (outerPanel?.previousElementSibling?.textContent  || '').trim();
        const ths = [...table.querySelectorAll('th')].map(h => h.textContent.trim());
        const colIdx = {};
        ths.forEach((h, i) => { colIdx[h] = i; });
        const c = {
            modelType:  resolveCol(colIdx, COL_ALIASES.modelType),
            engineCode: resolveCol(colIdx, COL_ALIASES.engineCode),
            ccm:        resolveCol(colIdx, COL_ALIASES.ccm),
            kw:         resolveCol(colIdx, COL_ALIASES.kw),
            hp:         resolveCol(colIdx, COL_ALIASES.hp),
            year:       resolveCol(colIdx, COL_ALIASES.year),
        };
        for (const tr of table.querySelectorAll('tbody tr')) {
            const cells = [...tr.querySelectorAll('td')]
                .map(td => td.textContent.trim().replace(/\\s+/g, ' '));
            if (!cells.length) continue;
            if (SKIP_CELLS.has(cells[0])) continue;
            const clean = v => (v === '-' || v === '–') ? '' : v;
            fitment.push({
                make:         makeName,
                model_family: modelFamily,
                model_type:   c.modelType  >= 0 ? clean(cells[c.modelType]  || '').substring(0,80) : '',
                engine_code:  c.engineCode >= 0 ? clean(cells[c.engineCode] || '').substring(0,30) : '',
                ccm:          c.ccm        >= 0 ? clean(cells[c.ccm]        || '').substring(0,10) : '',
                kw:           c.kw         >= 0 ? clean(cells[c.kw]         || '').substring(0,10) : '',
                hp:           c.hp         >= 0 ? clean(cells[c.hp]         || '').substring(0,10) : '',
                year:         c.year       >= 0 ? clean(cells[c.year]       || '').substring(0,30) : '',
            });
        }
    });
    const cleanFitment = fitment.filter(r =>
        r.make || r.model_family || r.model_type || r.engine_code || r.year
    );

    return { filterType, gtin, description, dims, dimInline, specs, oeNumbers, fitment: cleanFitment };
}"""


# ── Playwright helpers ─────────────────────────────────────────────────────
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


def _dismiss_cookies(page):
    for sel in ['button#onetrust-accept-btn-handler', 'button[id*="accept"]', '[class*="cookie"] button']:
        try:
            btn = page.query_selector(sel)
            if btn and btn.is_visible():
                btn.click()
                time.sleep(0.5)
                break
        except Exception:
            pass


def _load_page(page, url: str) -> int:
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


# ── Input loader ──────────────────────────────────────────────────────────
def load_ld_items() -> list:
    import csv

    def clean(s: str) -> str:
        s = s.strip()
        for sfx in ("_MANN-FILTER", "_MANN", "-MANN-FILTER", "-MANN"):
            if s.upper().endswith(sfx.upper()):
                s = s[: len(s) - len(sfx)]
        return s.strip()

    seen, items = set(), []
    if INPUT_OEM_MASTER.exists():
        with open(INPUT_OEM_MASTER, encoding="utf-8") as f:
            for row in csv.DictReader(f):
                if row.get("segment", "").upper() != "LD":
                    continue
                sku     = clean(row["sku"])
                url_key = clean(row.get("url_key", ""))
                if sku and sku not in seen:
                    seen.add(sku)
                    items.append({"sku": sku, "url_key": _build_url_key(url_key, sku)})
    elif INPUT_CLASSIFIED.exists():
        with open(INPUT_CLASSIFIED, encoding="utf-8") as f:
            for line in f:
                p = json.loads(line)
                if p.get("segment", "").upper() != "LD":
                    continue
                sku     = clean(p.get("sku", ""))
                url_key = clean(p.get("url_key", ""))
                if sku and sku not in seen:
                    seen.add(sku)
                    items.append({"sku": sku, "url_key": _build_url_key(url_key, sku)})

    log.info(f"LD items cargados: {len(items)}")
    return items


# ── Progress ──────────────────────────────────────────────────────────────
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


# ── Core scrape function ──────────────────────────────────────────────────
def scrape_mann_master(page, sku: str, url_key: str) -> dict:
    url_key = _build_url_key(url_key, sku)
    status  = 0
    url     = ""
    data    = {}

    try:
        for locale in MANN_LOCALES:
            direct = MANN_BASE.format(locale=locale, url_key=url_key)
            status = _load_page(page, direct)
            url    = page.url

            if status == 404:
                log.info(f"  locale:{locale} → 404")
                continue

            data   = page.evaluate(_MANN_MASTER_JS)
            n_fit  = len(data.get("fitment", []))
            n_oe   = sum(len(v) for v in data.get("oeNumbers", {}).values())

            if n_fit > 0 or n_oe > 0:
                log.info(f"  locale:{locale} → {n_fit} vehicles | {n_oe} OE codes")
                break
            else:
                log.info(f"  locale:{locale} → 200 but no fitment/OE, trying next")

        return {
            "status":        status,
            "url":           url,
            "url_key":       url_key,
            "filter_type":   data.get("filterType", ""),
            "gtin":          data.get("gtin", ""),
            "description":   data.get("description", ""),
            "dimensions":    data.get("dims", {}),
            "dims_inline":   data.get("dimInline", {}),
            "specs":         data.get("specs", {}),
            "oe_numbers":    data.get("oeNumbers", {}),
            "fitment":       data.get("fitment", []),
            "fitment_count": len(data.get("fitment", [])),
            "oe_count":      sum(len(v) for v in data.get("oeNumbers", {}).values()),
        }

    except PWTimeout:
        return {"status": 408, "url": url, "url_key": url_key,
                "filter_type": "", "gtin": "", "description": "",
                "dimensions": {}, "dims_inline": {}, "specs": {},
                "oe_numbers": {}, "fitment": [], "fitment_count": 0, "oe_count": 0}
    except Exception as e:
        log.warning(f"  Error {sku}: {e}")
        return {"status": 0, "url": url, "url_key": url_key,
                "filter_type": "", "gtin": "", "description": "",
                "dimensions": {}, "dims_inline": {}, "specs": {},
                "oe_numbers": {}, "fitment": [], "fitment_count": 0, "oe_count": 0}


# ── Main run ──────────────────────────────────────────────────────────────
def run(start_from: str = None, retry_zeros: bool = False):
    items    = load_ld_items()
    progress = load_progress()

    if retry_zeros:
        before = len(progress)
        progress = {k: v for k, v in progress.items()
                    if v.get("fitment_count", 0) > 0 or v.get("oe_count", 0) > 0}
        log.info(f"retry-zeros: {before - len(progress)} vacíos eliminados")
        save_progress(progress)

    # URL-key deduplication matrix
    from collections import defaultdict
    key_to_skus: dict[str, list] = defaultdict(list)
    for item in items:
        key_to_skus[item["url_key"]].append(item["sku"])

    pending_keys = [
        uk for uk, skus in key_to_skus.items()
        if any(s not in progress for s in skus)
    ]

    log.info(
        f"Total SKUs: {len(items)} | Unique url_keys: {len(key_to_skus)} | "
        f"Pending: {len(pending_keys)}"
    )

    if start_from:
        target = next(
            (item["url_key"] for item in items if item["sku"].upper() == start_from.upper()),
            None,
        )
        if target and target in pending_keys:
            pending_keys = pending_keys[pending_keys.index(target):]
            log.info(f"Reanudando desde {start_from} (url_key: {target})")

    with sync_playwright() as pw:
        ctx  = make_context(pw, headless=False)
        page = ctx.new_page()

        for i, url_key in enumerate(pending_keys, 1):
            skus_in_group = key_to_skus[url_key]
            log.info(
                f"[{i}/{len(pending_keys)}] {url_key}  "
                f"({len(skus_in_group)} SKU{'s' if len(skus_in_group)>1 else ''})"
            )

            result = scrape_mann_master(page, skus_in_group[0], url_key)
            n_fit  = result["fitment_count"]
            n_oe   = result["oe_count"]

            if n_fit or n_oe:
                log.info(f"  ✅ {n_fit} vehicles | {n_oe} OE codes | {result['filter_type']}")
            else:
                log.info(f"  ○ sin datos | HTTP {result['status']}")

            for sku in skus_in_group:
                if sku not in progress:
                    row = {"sku": sku, **result}
                    progress[sku] = result
                    append_result(row)

            save_progress(progress)
            time.sleep(random.uniform(*PAUSE))

        ctx.close()

    with_fit = sum(1 for v in progress.values() if v.get("fitment_count", 0) > 0)
    with_oe  = sum(1 for v in progress.values() if v.get("oe_count", 0) > 0)
    total_veh = sum(v.get("fitment_count", 0) for v in progress.values())
    total_oe  = sum(v.get("oe_count", 0) for v in progress.values())
    log.info(
        f"\n✅ Completado\n"
        f"   SKUs           : {len(progress)}\n"
        f"   Con fitment    : {with_fit}  ({total_veh:,} vehículos)\n"
        f"   Con OE codes   : {with_oe}  ({total_oe:,} códigos)\n"
    )


# ── Stats ──────────────────────────────────────────────────────────────────
def stats():
    progress = load_progress()
    if not progress:
        print("No hay datos aún.")
        return
    with_fit  = sum(1 for v in progress.values() if v.get("fitment_count", 0) > 0)
    with_oe   = sum(1 for v in progress.values() if v.get("oe_count", 0) > 0)
    total_veh = sum(v.get("fitment_count", 0) for v in progress.values())
    total_oe  = sum(v.get("oe_count", 0) for v in progress.values())
    with_gtin = sum(1 for v in progress.values() if v.get("gtin"))
    with_dims = sum(1 for v in progress.values() if v.get("dimensions"))
    with_spec = sum(1 for v in progress.values() if v.get("specs"))
    print(f"\nMANN Master Stats:")
    print(f"  Procesados     : {len(progress):,}")
    print(f"  Con fitment    : {with_fit:,}  ({total_veh:,} vehículos)")
    print(f"  Con OE codes   : {with_oe:,}  ({total_oe:,} códigos)")
    print(f"  Con GTIN       : {with_gtin:,}")
    print(f"  Con dimensiones: {with_dims:,}")
    print(f"  Con specs      : {with_spec:,}")
    top = sorted(
        ((k, v.get("fitment_count", 0)) for k, v in progress.items()),
        key=lambda x: -x[1]
    )[:5]
    print(f"\n  Top 5 por fitment:")
    for sku, n in top:
        print(f"    {sku:<20} {n:,} vehicles")


# ── Test one ──────────────────────────────────────────────────────────────
def test_one(sku: str):
    # Resolve url_key from input files
    url_key = ""
    for src in [INPUT_OEM_MASTER, INPUT_CLASSIFIED]:
        if url_key or not src.exists():
            continue
        import csv
        if src.suffix == ".csv":
            with open(src, encoding="utf-8") as f:
                for row in csv.DictReader(f):
                    if row.get("sku", "").upper().replace("_MANN-FILTER", "") == sku.upper():
                        url_key = row.get("url_key", "")
                        break
        else:
            with open(src, encoding="utf-8") as f:
                for line in f:
                    p = json.loads(line)
                    if sku.upper() in p.get("sku", "").upper():
                        url_key = p.get("url_key", "")
                        break

    url_key = _build_url_key(url_key, sku)
    log.info(f"Testing {sku}  url_key:{url_key}")

    with sync_playwright() as pw:
        ctx  = make_context(pw, headless=False)
        page = ctx.new_page()
        result = scrape_mann_master(page, sku, url_key)
        ctx.close()

    print(f"\n{'='*65}")
    print(f"MANN MASTER: {sku}")
    print(f"{'='*65}")
    print(f"  URL          : {result['url']}")
    print(f"  Status       : {result['status']}")
    print(f"  Filter type  : {result['filter_type']}")
    print(f"  GTIN         : {result['gtin']}")
    print(f"  Description  : {result['description'][:120]}...")

    print(f"\n── DIMENSIONS ──")
    for k, v in result.get("dimensions", {}).items():
        print(f"  {k:<6} {v}")
    if result.get("dims_inline"):
        print(f"  (inline: {result['dims_inline']})")

    print(f"\n── TECHNICAL SPECS ──")
    for k, v in result.get("specs", {}).items():
        print(f"  {k:<40} {v}")

    print(f"\n── OE NUMBERS ({result['oe_count']} codes) ──")
    for make, codes in result.get("oe_numbers", {}).items():
        print(f"  {make}: {codes}")

    print(f"\n── FITMENT ({result['fitment_count']} vehicles) ──")
    rows = result.get("fitment", [])
    if rows:
        hdr = f"  {'MAKE':<20} {'MODEL FAMILY':<22} {'MODEL TYPE':<25} {'ENGINE':<14} {'ccm':<7} {'kW':<6} {'YEAR'}"
        print(hdr)
        print("  " + "-"*100)
        for r in rows[:15]:
            print(f"  {r['make']:<20} {r['model_family']:<22} {r['model_type']:<25} "
                  f"{r['engine_code']:<14} {r['ccm']:<7} {r['kw']:<6} {r['year']}")
        if len(rows) > 15:
            print(f"  ... ({len(rows)} total)")


# ── Entry point ───────────────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--test",        default=None, help="SKU a testear (ej: W940/21)")
    parser.add_argument("--start",       default=None, help="Reanudar desde este SKU")
    parser.add_argument("--retry-zeros", action="store_true", help="Re-procesar sin datos")
    parser.add_argument("--stats",       action="store_true", help="Mostrar estadísticas")
    args = parser.parse_args()

    if args.test:
        test_one(args.test)
    elif args.stats:
        stats()
    else:
        run(start_from=args.start, retry_zeros=args.retry_zeros)
