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
INPUT_CLASSIFIED  = Path(r"C:\mann\mann_classified.jsonl")
INPUT_OEM_MASTER  = Path(r"C:\mann\mann_oem_master_clean.csv")
CATALOG_GAPS_FILE = Path(r"C:\mann\mann_catalog_gaps.txt")   # output de scraper_mann_catalog.py
OUTPUT_FILE       = Path(r"C:\mann\mann_master.jsonl")
PROGRESS_FILE     = Path(r"C:\mann\mann_master_progress.json")

PROFILE_DIR      = os.path.join(os.path.expanduser("~"), ".mann_master_profile")
PROFILE_DIR_GAPS = os.path.join(os.path.expanduser("~"), ".mann_master_gaps_profile")
MANN_LOCALES = ["us-en", "ph-en", "de-de", "gb-en", "cn-zh"]
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
    """HU 6014/1 Z → hu6014/1z_mann-filter  (spaces removed, slash kept as path segment)"""
    s = raw_key.strip().lower() if raw_key.strip() else sku.lower()
    for sfx in ("_mann-filter", "-mann-filter"):
        if s.endswith(sfx):
            s = s[: -len(sfx)]
            break
    s = s.replace(" ", "").strip("-")
    s += "_mann-filter"
    return s


# ── Master JS extractor ────────────────────────────────────────────────────
# NOTE: avoid matchAll, optional chaining (?.), and {n,m} in inline regex
# literals — all cause SyntaxError: Unexpected number on certain Chrome builds
# used via Playwright channel="chrome".
_MANN_MASTER_JS = """() => {
    var COL_ALIASES = {
        modelType:  ['Model Type', 'Fahrzeugtyp', 'Typ'],
        filterType: ['Filter Type', 'Filtertyp'],
        engineCode: ['Engine Code', 'Motorcode', 'Motor'],
        ccm:        ['ccm'],
        kw:         ['kW'],
        hp:         ['HP', 'PS'],
        year:       ['Year of Manufacture', 'Baujahr', 'Herstellungsjahr'],
    };
    var SKIP_CELLS = {'-':1, '\\u2013':1, '':1};
    var aliasKeys = Object.keys(COL_ALIASES);
    for (var ai = 0; ai < aliasKeys.length; ai++) {
        var alist = COL_ALIASES[aliasKeys[ai]];
        for (var aj = 0; aj < alist.length; aj++) SKIP_CELLS[alist[aj]] = 1;
    }

    function kvTable(section) {
        var result = {};
        if (!section) return result;
        var rows = section.querySelectorAll('table tr');
        for (var i = 0; i < rows.length; i++) {
            var cells = rows[i].querySelectorAll('td,th');
            if (cells.length >= 2) {
                var k = cells[0].textContent.trim().replace(/\\s+/g, ' ');
                var v = cells[1].textContent.trim().replace(/\\s+/g, ' ');
                if (k && v) result[k] = v;
            }
        }
        return result;
    }

    function resolveCol(colIdx, aliases) {
        for (var i = 0; i < aliases.length; i++) {
            if (colIdx[aliases[i]] !== undefined) return colIdx[aliases[i]];
        }
        return -1;
    }

    function getText(el) {
        return el ? el.textContent.trim().replace(/\\s+/g, ' ') : '';
    }

    // 1+2. Body text (shared by filterType and GTIN)
    var bodyText = document.body ? (document.body.innerText || '') : '';
    var btLower  = bodyText.toLowerCase();

    // 1. Filter type — search body text for known filter type phrases (works across locales)
    var filterType = '';
    var typePatterns = ['Oil Filter', 'Fuel Filter', 'Air Filter', 'Cabin Filter',
                        'Hydraulic Filter', 'Olfilter', 'Luftfilter', 'Kraftstofffilter',
                        'Innenraumfilter'];
    for (var tpi = 0; tpi < typePatterns.length; tpi++) {
        if (btLower.indexOf(typePatterns[tpi].toLowerCase()) >= 0) {
            filterType = typePatterns[tpi]; break;
        }
    }
    // Fallback: document.title before the pipe, cut at "Filter" word (skip "MANN-FILTER")
    if (!filterType) {
        var ptitle = document.title || '';
        var bpipe  = ptitle.indexOf(' | ') >= 0 ? ptitle.split(' | ')[0] : ptitle;
        var bplc   = bpipe.toLowerCase();
        var fidx   = bplc.indexOf('filter');
        if (fidx >= 0 && bpipe.substring(0, fidx).toLowerCase().indexOf('mann') < 0) {
            filterType = bpipe.substring(0, fidx + 6).trim();
        }
    }

    // 2. GTIN — find "GTIN" then extract first run of 8+ digits after it
    var gtin = '';
    var gtinIdx = bodyText.indexOf('GTIN');
    if (gtinIdx >= 0) {
        var chunk = bodyText.substring(gtinIdx, gtinIdx + 50);
        var gm = chunk.match(/(\\d+)/);
        if (gm && gm[1].length >= 8) gtin = gm[1].substring(0, 14);
    }

    // 3. Description
    var description = '';
    var aboutEl = document.querySelector('[class*="about-item"]') ||
                  document.querySelector('.cmp-product__description');
    if (aboutEl) {
        description = getText(aboutEl).substring(0, 800);
    } else {
        var pTags = document.querySelectorAll('p');
        for (var pi = 0; pi < pTags.length; pi++) {
            var pt = getText(pTags[pi]);
            if (pt.length >= 100 && pt.length <= 800) { description = pt; break; }
        }
    }

    // 4. Dimensions table
    var dims = kvTable(document.getElementById('dimensions'));

    // 5. Technical specs table
    var specs = kvTable(document.getElementById('technicalData'));

    // 6. OE Numbers accordion — click button to expand (synchronous, works for CSS-hidden)
    var oeNumbers = {};
    var allItems = document.querySelectorAll('.cmp-accordion__item');
    var oeItem = null;
    for (var ii = 0; ii < allItems.length; ii++) {
        var btn = allItems[ii].querySelector('.cmp-accordion__button') ||
                  allItems[ii].querySelector('.cmp-accordion__header');
        if (btn && btn.textContent.indexOf('OE Number') >= 0) {
            oeItem = allItems[ii];
            try { btn.click(); } catch(e) {}  // expand outer panel
            break;
        }
    }
    if (oeItem) {
        var oePanel = oeItem.querySelector('.cmp-accordion__panel');
        if (oePanel) {
            // OE Numbers uses a NESTED accordion: outer=OE Numbers, inner=one item per make.
            // Each inner item has: button title = make name, panel = OE codes (may be hidden in DOM).
            var nestedItems = oePanel.querySelectorAll('.cmp-accordion__item');
            for (var ni = 0; ni < nestedItems.length; ni++) {
                var makeTitle = nestedItems[ni].querySelector('.cmp-accordion__title');
                var makeName  = makeTitle ? makeTitle.textContent.trim().replace(/\\s+/g, ' ') : '';
                if (!makeName) continue;
                // Click to expand inner panel (makes content readable even if AJAX)
                var innerBtn = nestedItems[ni].querySelector('.cmp-accordion__button');
                if (innerBtn) { try { innerBtn.click(); } catch(e) {} }
                // Read codes from inner panel — look for table cells first, then raw text lines
                var innerPanel = nestedItems[ni].querySelector('.cmp-accordion__panel');
                if (!innerPanel) continue;
                var codes = [];
                var codeTds = innerPanel.querySelectorAll('td');
                if (codeTds.length) {
                    for (var cdi = 0; cdi < codeTds.length; cdi++) {
                        var cdt = codeTds[cdi].textContent.trim().replace(/\\s+/g, ' ');
                        if (cdt) codes.push(cdt);
                    }
                } else {
                    // Fallback: split raw text by double-space or newline
                    var raw = innerPanel.textContent.trim().replace(/\\s*\\n\\s*/g, '\\n');
                    var lines = raw.split('\\n');
                    for (var li = 0; li < lines.length; li++) {
                        var lv = lines[li].trim();
                        if (lv && lv.length > 2) codes.push(lv);
                    }
                }
                if (codes.length) oeNumbers[makeName] = codes;
            }
        }
    }

    // 7. Fitment / Vehicles
    var fitment = [];
    var appDivs = document.querySelectorAll('.cmp-application-table');
    for (var di = 0; di < appDivs.length; di++) {
        var appDiv = appDivs[di];
        var appTable = appDiv.querySelector('table');
        if (!appTable) continue;
        var innerPanel = appDiv.closest('.cmp-accordion__panel');
        var outerPanel = innerPanel && innerPanel.parentElement
                         ? innerPanel.parentElement.closest('.cmp-accordion__panel') : null;
        var prevInner = innerPanel ? innerPanel.previousElementSibling : null;
        var prevOuter = outerPanel ? outerPanel.previousElementSibling : null;
        var modelFamily = getText(prevInner);
        var makeName    = getText(prevOuter);
        var ths = appTable.querySelectorAll('th');
        var colIdx = {};
        for (var ti = 0; ti < ths.length; ti++) colIdx[ths[ti].textContent.trim()] = ti;
        var c = {
            modelType:  resolveCol(colIdx, COL_ALIASES.modelType),
            engineCode: resolveCol(colIdx, COL_ALIASES.engineCode),
            ccm:        resolveCol(colIdx, COL_ALIASES.ccm),
            kw:         resolveCol(colIdx, COL_ALIASES.kw),
            hp:         resolveCol(colIdx, COL_ALIASES.hp),
            year:       resolveCol(colIdx, COL_ALIASES.year),
        };
        var tbodyRows = appTable.querySelectorAll('tbody tr');
        for (var tri = 0; tri < tbodyRows.length; tri++) {
            var tds = tbodyRows[tri].querySelectorAll('td');
            var cells = [];
            for (var tdi = 0; tdi < tds.length; tdi++)
                cells.push(tds[tdi].textContent.trim().replace(/\\s+/g, ' '));
            if (!cells.length) continue;
            if (SKIP_CELLS[cells[0]]) continue;
            function clean(v) { return (v === '-' || v === '\\u2013') ? '' : (v || ''); }
            fitment.push({
                make:         makeName,
                model_family: modelFamily,
                model_type:   c.modelType  >= 0 ? clean(cells[c.modelType]).substring(0, 80)  : '',
                engine_code:  c.engineCode >= 0 ? clean(cells[c.engineCode]).substring(0, 30) : '',
                ccm:          c.ccm        >= 0 ? clean(cells[c.ccm]).substring(0, 10)        : '',
                kw:           c.kw         >= 0 ? clean(cells[c.kw]).substring(0, 10)         : '',
                hp:           c.hp         >= 0 ? clean(cells[c.hp]).substring(0, 10)         : '',
                year:         c.year       >= 0 ? clean(cells[c.year]).substring(0, 30)       : '',
            });
        }
    }
    var cleanFitment = [];
    for (var fii = 0; fii < fitment.length; fii++) {
        var fr = fitment[fii];
        if (fr.make || fr.model_family || fr.model_type || fr.engine_code || fr.year)
            cleanFitment.push(fr);
    }

    return {
        filterType: filterType,
        gtin: gtin,
        description: description,
        dims: dims,
        dimInline: {},
        specs: specs,
        oeNumbers: oeNumbers,
        fitment: cleanFitment
    };
}"""


# ── Playwright helpers ─────────────────────────────────────────────────────
def make_context(pw, headless: bool = False, profile_dir: str = None):
    return pw.chromium.launch_persistent_context(
        user_data_dir=profile_dir or PROFILE_DIR,
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


def load_gap_items() -> list:
    """Lee los SKUs gap de mann_catalog_gaps.txt (output de scraper_mann_catalog.py)."""
    if not CATALOG_GAPS_FILE.exists():
        log.error(f"No se encuentra {CATALOG_GAPS_FILE} — corre scraper_mann_catalog.py primero")
        return []
    seen, items = set(), []
    with open(CATALOG_GAPS_FILE, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            parts = line.split("\t")
            sku = parts[0].strip().upper()
            if sku and sku not in seen:
                seen.add(sku)
                items.append({"sku": sku, "url_key": _build_url_key("", sku)})
    log.info(f"Gap items cargados desde catalog_gaps: {len(items)}")
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
    data      = {}
    saved_oe  = {}  # OE codes captured from us-en; merged after fitment cascade

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

            # OE Numbers accordion may be collapsed — click to expand then re-read
            if n_oe == 0 and n_fit > 0:
                try:
                    page.click('.cmp-accordion__button:has-text("OE Number")', timeout=3000)
                    time.sleep(0.8)
                    data2  = page.evaluate(_MANN_MASTER_JS)
                    n_oe2  = sum(len(v) for v in data2.get("oeNumbers", {}).values())
                    if n_oe2 > 0:
                        data  = data2
                        n_oe  = n_oe2
                        log.info(f"  OE accordion expanded → {n_oe} OE codes")
                except Exception:
                    pass

            # Preserve OE codes from us-en (best source); cascade continues for fitment
            if locale == "us-en" and n_oe > 0:
                saved_oe = data.get("oeNumbers", {})

            log.info(f"  locale:{locale} → {n_fit} vehicles | {n_oe} OE codes")

            if n_fit > 0:
                break  # have fitment — done cascading
            else:
                log.info(f"  no fitment, trying next locale")

        # Merge us-en OE into whichever locale won fitment
        if saved_oe and not data.get("oeNumbers"):
            data["oeNumbers"] = saved_oe
            log.info(f"  merged us-en OE → {sum(len(v) for v in saved_oe.values())} codes")

        # OE fallback: us-en has OE Numbers section; ph-en/de-de often do not.
        # OE content is AJAX-loaded after accordion click — must wait for networkidle.
        n_oe = sum(len(v) for v in data.get("oeNumbers", {}).values())
        if n_oe == 0 and status == 200:
            try:
                oe_url = MANN_BASE.format(locale="us-en", url_key=url_key)
                oe_st  = _load_page(page, oe_url)
                if oe_st == 200:
                    oe_clicked = False
                    for sel in [
                        'button:has-text("OE Number")',
                        '.cmp-accordion__button:has-text("OE")',
                        'text=OE Numbers',
                    ]:
                        try:
                            page.click(sel, timeout=2000)
                            oe_clicked = True
                            break
                        except Exception:
                            continue
                    if oe_clicked:
                        try:
                            page.wait_for_load_state("networkidle", timeout=6000)
                        except PWTimeout:
                            pass
                        time.sleep(0.5)
                    data2 = page.evaluate(_MANN_MASTER_JS)
                    n_oe2 = sum(len(v) for v in data2.get("oeNumbers", {}).values())
                    log.info(f"  us-en OE fallback: clicked={oe_clicked} codes={n_oe2}")
                    if n_oe2 > 0:
                        data["oeNumbers"] = data2["oeNumbers"]
                    if data2.get("filterType") and not data.get("filterType"):
                        data["filterType"] = data2["filterType"]
            except Exception as e:
                log.info(f"  OE fallback error: {e}")

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
def run(start_from: str = None, retry_zeros: bool = False, from_gaps: bool = False):
    items = load_gap_items() if from_gaps else load_ld_items()
    # Gaps use separate output/progress to keep base run intact
    out_file  = Path(r"C:\mann\mann_master_gaps.jsonl") if from_gaps else OUTPUT_FILE
    prog_file = Path(r"C:\mann\mann_master_gaps_progress.json") if from_gaps else PROGRESS_FILE
    progress  = json.load(open(prog_file, encoding="utf-8")) if prog_file.exists() else {}

    def _save(prog: dict):
        tmp = str(prog_file) + ".tmp"
        with open(tmp, "w", encoding="utf-8") as _f:
            json.dump(prog, _f, ensure_ascii=False, separators=(",", ":"))
        os.replace(tmp, str(prog_file))

    def _append(row: dict):
        with open(out_file, "a", encoding="utf-8") as _f:
            _f.write(json.dumps(row, ensure_ascii=False) + "\n")

    if retry_zeros:
        before = len(progress)
        progress = {k: v for k, v in progress.items()
                    if v.get("fitment_count", 0) > 0 or v.get("oe_count", 0) > 0}
        log.info(f"retry-zeros: {before - len(progress)} vacíos eliminados")
        _save(progress)

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

    profile = PROFILE_DIR_GAPS if from_gaps else PROFILE_DIR
    with sync_playwright() as pw:
        ctx  = make_context(pw, headless=False, profile_dir=profile)
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
                    _append(row)

            _save(progress)
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

    # OE diagnostic: if 0 codes, dump raw panel HTML so we can see the structure
    if result["oe_count"] == 0:
        with sync_playwright() as pw:
            ctx2  = make_context(pw, headless=False)
            page2 = ctx2.new_page()
            oe_url = MANN_BASE.format(locale="us-en", url_key=_build_url_key("", sku))
            _load_page(page2, oe_url)
            for sel in ['button:has-text("OE Number")', 'text=OE Numbers']:
                try:
                    page2.click(sel, timeout=2000)
                    break
                except Exception:
                    pass
            try:
                page2.wait_for_load_state("networkidle", timeout=6000)
            except PWTimeout:
                pass
            time.sleep(1)
            oe_diag = page2.evaluate("""() => {
                var items = document.querySelectorAll('.cmp-accordion__item');
                for (var i = 0; i < items.length; i++) {
                    var btn = items[i].querySelector('.cmp-accordion__button') ||
                              items[i].querySelector('.cmp-accordion__header');
                    if (btn && btn.textContent.indexOf('OE Number') >= 0) {
                        return {
                            found: true,
                            btnText: btn.textContent.trim(),
                            panelHTML: items[i].innerHTML.substring(0, 1200)
                        };
                    }
                }
                return {found: false, btnText: '', panelHTML: ''};
            }""")
            ctx2.close()
        print(f"\n── OE DIAGNOSTIC ──")
        print(f"  OE accordion found : {oe_diag['found']}")
        print(f"  Button text        : {oe_diag['btnText']!r}")
        print(f"  Panel HTML (first 1200 chars):")
        print(oe_diag['panelHTML'])

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
    parser.add_argument("--from-gaps",   action="store_true",
                        help="Procesar 6,042 gap SKUs de mann_catalog_gaps.txt (fase 2)")
    args = parser.parse_args()

    if args.test:
        test_one(args.test)
    elif args.stats:
        stats()
    else:
        run(start_from=args.start, retry_zeros=args.retry_zeros, from_gaps=args.from_gaps)
