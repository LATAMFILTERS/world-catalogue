#!/usr/bin/env python3
"""
scraper_hd_fitment.py
=====================
Obtiene fitment HD (equipment / make / model / engine) de Donaldson y Fleetguard
para cada part en cross_reference_master.

Flujo:
  1. GET /api/oem/hd-parts  → lista de {don_part, fg_part} del DB
  2. Playwright → scrape shop.donaldson.com y fleetguard.com
  3. Guarda C:\\mann\\hd_fitment_donaldson.jsonl  y  hd_fitment_fleetguard.jsonl
  4. Cache en C:\\mann\\hd_fitment_don_progress.json / hd_fitment_fg_progress.json

Uso:
    python scraper_hd_fitment.py donaldson
    python scraper_hd_fitment.py fleetguard
    python scraper_hd_fitment.py donaldson --start P552100
    python scraper_hd_fitment.py donaldson --test P552100
    python scraper_hd_fitment.py donaldson --debug P552100
    python scraper_hd_fitment.py donaldson --dry-run
    python scraper_hd_fitment.py donaldson --retry-zeros
    python scraper_hd_fitment.py donaldson --stats
"""

import argparse
import json
import logging
import os
import random
import sys
import time
import urllib.request
import urllib.error
from pathlib import Path

from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

# ── Config ─────────────────────────────────────────────────────────────────
API_BASE = "https://elimfilters-search-pro.onrender.com"

DON_OUTPUT    = Path(r"C:\mann\hd_fitment_donaldson.jsonl")
FG_OUTPUT     = Path(r"C:\mann\hd_fitment_fleetguard.jsonl")
DON_PROGRESS  = Path(r"C:\mann\hd_fitment_don_progress.json")
FG_PROGRESS   = Path(r"C:\mann\hd_fitment_fg_progress.json")
DEBUG_DIR     = Path(r"C:\mann\debug_html")

DON_PRODUCT_BASE = "https://shop.donaldson.com/store/en-us/product/"
FG_PRODUCT_BASE  = "https://www.fleetguard.com/product/"

PROFILE_DON = os.path.join(os.path.expanduser("~"), ".hd_fitment_don")
PROFILE_FG  = os.path.join(os.path.expanduser("~"), ".hd_fitment_fg")

PAUSE = (4, 8)

# ── Logging ────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    handlers=[
        logging.FileHandler(r"C:\mann\scraper_hd_fitment.log", encoding="utf-8"),
        logging.StreamHandler(),
    ],
)
log = logging.getLogger(__name__)

# ── Shadow DOM helper (Fleetguard) ─────────────────────────────────────────
_SHADOW_WALK_ALL = """
function swa(root, sel, depth, out) {
    if (depth > 10) return;
    root.querySelectorAll(sel).forEach(el => out.push(el));
    root.querySelectorAll('*').forEach(n => {
        if (n.shadowRoot) swa(n.shadowRoot, sel, depth+1, out);
    });
}
"""

_SHADOW_WALK = """
function sw(root, sel, depth) {
    if (depth > 10) return null;
    const el = root.querySelector(sel);
    if (el) return el;
    for (const n of root.querySelectorAll('*'))
        if (n.shadowRoot) { const r = sw(n.shadowRoot, sel, depth+1); if (r) return r; }
    return null;
}
"""


# ── API helpers ─────────────────────────────────────────────────────────────
def get_hd_parts(brand: str) -> list:
    """Returns list of dicts {part, mann_part} for the given brand."""
    url = f"{API_BASE}/api/oem/hd-parts?brand={brand}"
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    key = "donaldson" if brand == "donaldson" else "fleetguard"
    parts = data.get(key, [])
    log.info(f"DB → {len(parts)} {brand.upper()} parts from cross_reference_master")
    return parts


# ── Progress ────────────────────────────────────────────────────────────────
def load_progress(path: Path) -> dict:
    if path.exists():
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_progress(path: Path, progress: dict):
    tmp = str(path) + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(progress, f, ensure_ascii=False, separators=(",", ":"))
    os.replace(tmp, str(path))


def append_result(path: Path, row: dict):
    with open(path, "a", encoding="utf-8") as f:
        f.write(json.dumps(row, ensure_ascii=False) + "\n")


# ── Playwright context ──────────────────────────────────────────────────────
def make_context(pw, profile_dir: str):
    return pw.chromium.launch_persistent_context(
        user_data_dir=profile_dir,
        channel="chrome",
        headless=True,
        locale="en-US",
        viewport={"width": 1366, "height": 900},
        user_agent=(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        ),
        args=["--disable-blink-features=AutomationControlled"],
        ignore_default_args=["--enable-automation"],
    )


# ── Donaldson equipment extractor ───────────────────────────────────────────
_DON_ACTIVATE_TAB_JS = """(tabId) => {
    const btn = document.querySelector(`button[data-tab="${tabId}"], a[data-tab="${tabId}"]`);
    if (btn) { btn.click(); return true; }
    // fallback: find by text
    for (const b of document.querySelectorAll('button,a[role="tab"]')) {
        if (b.textContent.trim().toLowerCase().includes('equipment')) {
            b.click(); return true;
        }
    }
    return false;
}"""

_DON_EQUIP_JS = """() => {
    // Try to find body id — Donaldson uses "equiptmentBody" (typo intentional)
    const bodyId = ['equiptmentBody', 'equipmentBody'].find(id => document.getElementById(id));
    if (!bodyId) return [];
    const body = document.getElementById(bodyId);
    const results = [];
    body.querySelectorAll('tr').forEach(tr => {
        const eq = tr.querySelector('td[data-equipment]');
        if (!eq) return;
        results.push({
            equipment:     eq.textContent.trim(),
            year:          (tr.querySelector('td[data-year]')?.textContent || '').trim(),
            type:          (tr.querySelector('td[data-type] span,td[data-type]')?.textContent || '').trim(),
            options:       (tr.querySelector('td[data-options] span,td[data-options]')?.textContent || '').trim(),
            engine:        (tr.querySelector('td[data-engine] span,td[data-engine]')?.textContent || '').trim(),
            engine_option: (tr.querySelector('td[data-enginetypes] span,td[data-enginetypes]')?.textContent || '').trim(),
        });
    });
    return results;
}"""

_DON_SHOW_MORE_JS = """() => {
    const btn = document.querySelector('.showMorePdpListButton, button[id*="showMore"]');
    if (btn && btn.offsetParent !== null) { btn.click(); return true; }
    return false;
}"""


def scrape_donaldson(page, part: str) -> dict:
    url = DON_PRODUCT_BASE + part.upper()
    try:
        resp = page.goto(url, wait_until="domcontentloaded", timeout=25000)
        status = resp.status if resp else 0

        # dismiss cookie/modal popups
        for sel in ["#onetrust-accept-btn-handler", "button:has-text('Accept All')",
                    "button:has-text('Accept')", "button[aria-label='Close']"]:
            try:
                if page.locator(sel).is_visible(timeout=500):
                    page.locator(sel).click()
            except Exception:
                pass

        # click Equipment tab
        page.evaluate(_DON_ACTIVATE_TAB_JS, "equiptmentBody")
        time.sleep(1.5)

        # expand Show More until exhausted (max 200 clicks)
        for _ in range(200):
            shown = page.evaluate(_DON_SHOW_MORE_JS)
            if not shown:
                break
            time.sleep(0.8)

        equipment = page.evaluate(_DON_EQUIP_JS)

        # product title
        title = ""
        try:
            title = page.title()
        except Exception:
            pass

        return {"status": status, "url": url, "title": title, "equipment": equipment}

    except PWTimeout:
        return {"status": 408, "url": url, "title": "", "equipment": []}
    except Exception as e:
        log.warning(f"  DON error {part}: {e}")
        return {"status": 0, "url": url, "title": "", "equipment": []}


# ── Fleetguard equipment extractor ─────────────────────────────────────────
_FG_CLICK_EQUIP_JS = f"""() => {{
    {_SHADOW_WALK}
    // tab button with data-name="Equipment"
    const btn = sw(document, 'button.tablinks[data-name="Equipment"]', 0);
    if (btn) {{ btn.click(); return 'tab-clicked'; }}
    // fallback: any button containing "Equipment"
    const all = [];
    function findBtns(root, depth) {{
        if (depth > 8) return;
        root.querySelectorAll('button,a[role="tab"]').forEach(b => {{
            if (b.textContent.trim().toLowerCase().includes('equipment')) all.push(b);
        }});
        root.querySelectorAll('*').forEach(n => {{
            if (n.shadowRoot) findBtns(n.shadowRoot, depth+1);
        }});
    }}
    findBtns(document, 0);
    if (all.length) {{ all[0].click(); return 'fallback-clicked'; }}
    return false;
}}"""

_FG_EQUIP_JS = f"""() => {{
    {_SHADOW_WALK_ALL}
    const rows = [];
    const seen = new Set();
    const trs = [];
    swa(document, 'table tr', 0, trs);
    trs.forEach(tr => {{
        const cells = Array.from(tr.querySelectorAll('td'));
        if (cells.length < 2) return;
        const full   = cells[0].textContent.trim().replace(/\\s+/g, ' ');
        const engine = (cells[1] || {{}}).textContent?.trim().replace(/\\s+/g,' ') || '';
        const year   = (cells[2] || {{}}).textContent?.trim() || '';
        if (!full || full.length < 3) return;
        if (/^equipment$/i.test(full)) return;
        if (!full.includes(' -')) return;
        let make = '', model = full;
        if (full.includes(' - ')) {{
            const i = full.indexOf(' - ');
            make  = full.slice(0, i).trim();
            model = full.slice(i + 3).trim();
        }} else if (full.endsWith(' -')) {{
            make  = full.slice(0, -2).trim();
            model = '';
        }}
        const key = full + '|' + engine + '|' + year;
        if (!seen.has(key)) {{
            seen.add(key);
            rows.push({{ equipment: full, make, model, engine, year }});
        }}
    }});
    // fallback: appDataDifferentp links
    if (!rows.length) {{
        const links = [];
        swa(document, 'a.appDataDifferentp', 0, links);
        links.forEach(a => {{
            const text   = a.textContent.trim().replace(/\\s+/g, ' ');
            const model  = a.getAttribute('data-name') || '';
            const engine = a.getAttribute('data-engine') || '';
            const full   = text || model;
            if (!full) return;
            let make = '';
            if (full.includes(' - ')) {{
                const i = full.indexOf(' - ');
                make = full.slice(0, i).trim();
            }}
            const key = make + '|' + model + '|' + engine;
            if (!seen.has(key)) {{
                seen.add(key);
                rows.push({{ equipment: full, make, model: model || full.split(' - ')[1] || '', engine, year: '' }});
            }}
        }});
    }}
    return rows;
}}"""


def scrape_fleetguard(page, part: str) -> dict:
    url = FG_PRODUCT_BASE + part.upper()
    try:
        resp = page.goto(url, wait_until="domcontentloaded", timeout=25000)
        status = resp.status if resp else 0

        try:
            page.wait_for_load_state("networkidle", timeout=10000)
        except PWTimeout:
            pass
        time.sleep(1.5)

        # click Equipment tab
        page.evaluate(_FG_CLICK_EQUIP_JS)
        time.sleep(2)

        equipment = page.evaluate(_FG_EQUIP_JS)

        title = ""
        try:
            title = page.title()
        except Exception:
            pass

        return {"status": status, "url": url, "title": title, "equipment": equipment}

    except PWTimeout:
        return {"status": 408, "url": url, "title": "", "equipment": []}
    except Exception as e:
        log.warning(f"  FG error {part}: {e}")
        return {"status": 0, "url": url, "title": "", "equipment": []}


# ── Run ──────────────────────────────────────────────────────────────────���──
def run(brand: str, start_from: str = None, retry_zeros: bool = False):
    brand = brand.lower()
    assert brand in ("donaldson", "fleetguard"), "brand must be donaldson or fleetguard"

    output_file   = DON_OUTPUT   if brand == "donaldson" else FG_OUTPUT
    progress_file = DON_PROGRESS if brand == "donaldson" else FG_PROGRESS
    profile_dir   = PROFILE_DON  if brand == "donaldson" else PROFILE_FG
    scrape_fn     = scrape_donaldson if brand == "donaldson" else scrape_fleetguard

    parts    = get_hd_parts(brand)
    progress = load_progress(progress_file)

    if retry_zeros:
        before = len(progress)
        progress = {k: v for k, v in progress.items() if v.get("equipment")}
        log.info(f"retry-zeros: {before - len(progress)} sin equipment eliminados del cache")
        save_progress(progress_file, progress)

    if start_from:
        su = start_from.upper()
        idx = next((i for i, p in enumerate(parts) if p["part"].upper() == su), None)
        if idx is None:
            log.warning(f"--start '{start_from}' no encontrado")
        else:
            parts = parts[idx:]
            log.info(f"Reanudando desde {start_from}")

    to_do  = [p for p in parts if p["part"] not in progress]
    cached = len(parts) - len(to_do)
    log.info(f"Total: {len(parts)} | Cache: {cached} | A scrapear: {len(to_do)}")

    with sync_playwright() as pw:
        ctx  = make_context(pw, profile_dir)
        page = ctx.new_page()

        for i, item in enumerate(to_do, 1):
            part      = item["part"]
            mann_part = item.get("mann_part", "")
            global_i  = next(j+1 for j, p in enumerate(parts) if p["part"] == part)

            log.info(f"[{global_i}/{len(parts)}] {part}  (MANN:{mann_part})  [{brand}]")

            result   = scrape_fn(page, part)
            n_equip  = len(result["equipment"])

            if n_equip:
                log.info(f"  ✅ {n_equip} equipos | {result['title'][:50]}")
            else:
                log.info(f"  ○ sin equipment | HTTP {result['status']}")

            row = {"part": part, "brand": brand, "mann_part": mann_part, **result}
            progress[part] = result
            save_progress(progress_file, progress)
            append_result(output_file, row)

            time.sleep(random.uniform(*PAUSE))

        ctx.close()

    with_eq    = sum(1 for v in progress.values() if v.get("equipment"))
    total_rows = sum(len(v.get("equipment", [])) for v in progress.values())
    log.info(
        f"\n✅ {brand.upper()} completado\n"
        f"   Procesados        : {len(progress)}\n"
        f"   Con equipment     : {with_eq}\n"
        f"   Total equip rows  : {total_rows:,}\n"
    )


# ── Stats ────────────────────────────────────────────────────────────────────
def stats(brand: str):
    progress_file = DON_PROGRESS if brand == "donaldson" else FG_PROGRESS
    progress = load_progress(progress_file)
    if not progress:
        print("No hay datos aún.")
        return
    with_eq    = sum(1 for v in progress.values() if v.get("equipment"))
    total_rows = sum(len(v.get("equipment", [])) for v in progress.values())
    print(f"\n{brand.upper()} fitment stats:")
    print(f"  Procesados       : {len(progress):,}")
    print(f"  Con equipment    : {with_eq:,}")
    print(f"  Sin equipment    : {len(progress) - with_eq:,}")
    print(f"  Total rows       : {total_rows:,}")
    if with_eq:
        top = sorted(
            ((k, len(v.get("equipment", []))) for k, v in progress.items() if v.get("equipment")),
            key=lambda x: -x[1]
        )[:5]
        print(f"\n  Top 5 por fitment:")
        for code, n in top:
            print(f"    {code:<15} {n} equipos")


# ── Test one ─────────────────────────────────────────────────────────────────
def test_one(brand: str, part: str, debug: bool = False):
    profile_dir = PROFILE_DON if brand == "donaldson" else PROFILE_FG
    scrape_fn   = scrape_donaldson if brand == "donaldson" else scrape_fleetguard

    log.info(f"Testing {brand.upper()} {part}")
    with sync_playwright() as pw:
        ctx  = make_context(pw, profile_dir)
        page = ctx.new_page()

        if debug:
            url = (DON_PRODUCT_BASE if brand == "donaldson" else FG_PRODUCT_BASE) + part.upper()
            page.goto(url, wait_until="domcontentloaded", timeout=25000)
            try:
                page.wait_for_load_state("networkidle", timeout=8000)
            except PWTimeout:
                pass
            DEBUG_DIR.mkdir(parents=True, exist_ok=True)
            html_path = DEBUG_DIR / f"{brand}_{part}.html"
            html_path.write_text(page.content(), encoding="utf-8")
            log.info(f"HTML guardado en {html_path}")
            ctx.close()
            return

        result = scrape_fn(page, part)
        ctx.close()

    print(f"\n=== {brand.upper()} {part} ===")
    print(f"  URL       : {result['url']}")
    print(f"  Status    : {result['status']}")
    print(f"  Title     : {result['title']}")
    print(f"  Equipment : {len(result['equipment'])} rows")
    if result["equipment"]:
        print()
        print(f"  {'EQUIPMENT':<35} {'YEAR':<8} {'ENGINE':<25} TYPE")
        print("  " + "-" * 80)
        for r in result["equipment"][:20]:
            print(
                f"  {r.get('equipment',''):<35}"
                f" {r.get('year',''):<8}"
                f" {r.get('engine',''):<25}"
                f" {r.get('type', r.get('options',''))}"
            )
        if len(result["equipment"]) > 20:
            print(f"  ... ({len(result['equipment'])} total)")


# ── Dry run ─────────────────────────────────────────────────────────────────
def dry_run(brand: str):
    parts = get_hd_parts(brand)
    print(f"\n{brand.upper()} — {len(parts)} parts en cross_reference_master")
    print(f"\n{'PART':<15} MANN_PART")
    print("-" * 40)
    for p in parts[:15]:
        print(f"  {p['part']:<13} {p.get('mann_part','')}")
    print(f"\n  ... ({len(parts)} total)")


# ── Entry point ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("brand",         help="donaldson | fleetguard")
    parser.add_argument("--start",       default=None)
    parser.add_argument("--test",        default=None, help="Part number a testear")
    parser.add_argument("--debug",       default=None, help="Guardar HTML para inspección")
    parser.add_argument("--dry-run",     action="store_true")
    parser.add_argument("--retry-zeros", action="store_true")
    parser.add_argument("--stats",       action="store_true")
    args = parser.parse_args()

    brand = args.brand.lower()
    if brand not in ("donaldson", "fleetguard"):
        print("brand debe ser 'donaldson' o 'fleetguard'")
        sys.exit(1)

    if args.test:
        test_one(brand, args.test)
    elif args.debug:
        test_one(brand, args.debug, debug=True)
    elif args.dry_run:
        dry_run(brand)
    elif args.stats:
        stats(brand)
    else:
        run(brand, start_from=args.start, retry_zeros=args.retry_zeros)
