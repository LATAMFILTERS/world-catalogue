"""
scrape_millard.py — Millard cabin filter catalog scraper
Fetches dimensions, OEM cross-references, and vehicle applications
from millardcatalog.com and saves to JSON / patches the ELIMFILTERS DB.

Requirements:
    pip install playwright
    playwright install chromium

Usage:
    # Dump raw HTML of one product page (debug — sends HTML to stdout)
    python scrape_millard.py --dump-html --sku MC-2200

    # Scrape one SKU and print what was found
    python scrape_millard.py --sku MC-2200 --dry-run

    # Scrape all cabin filters for South America region
    python scrape_millard.py --region "America Del Sur" --dry-run

    # Full run — write results to millard_cabin.json
    python scrape_millard.py --region "America Del Sur" --out millard_cabin.json

    # Write to DB (via Render API)
    python scrape_millard.py --region "America Del Sur" --push-db

Regions available on Millard catalog:
    "America Del Sur"   "America Del Norte"   "Europe"   "Africa"   "Asia"

Filter types available:
    cabin-filter   air-filter   oil-filter   fuel-filter

Notes:
    - Run --dump-html first on one product to verify selectors work
    - Results saved to --out file (default: millard_scraped.json)
    - Progress saved to millard_progress.json for resumable runs
    - 2s delay between product pages
"""

import argparse
import json
import logging
import os
import re
import time
import urllib.request
from html.parser import HTMLParser
from pathlib import Path

# ─── Config ──────────────────────────────────────────────────────────────────

API_BASE   = "https://part-search.elimfilters.com"
ADMIN_KEY  = os.environ.get("ADMIN_KEY", "elim2026admin")
DELAY_SEC  = 2.0

MILLARD_BASE    = "https://www.millardcatalog.com"
PRODUCT_URL_TPL = MILLARD_BASE + "/en/millard/{region}/{filter_type}/{sku}"

PROGRESS_FILE = Path(__file__).parent / "millard_progress.json"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-8s %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)

# ─── Browser helpers ─────────────────────────────────────────────────────────

def make_browser():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        raise SystemExit("Run: pip install playwright && playwright install chromium")
    pw = sync_playwright().start()
    browser = pw.chromium.launch(headless=True)
    ctx = browser.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                   "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        locale="en-US",
        viewport={"width": 1280, "height": 900},
    )
    return pw, browser, ctx


def get_page(ctx, url, wait="networkidle", timeout=30000):
    page = ctx.new_page()
    page.goto(url, wait_until=wait, timeout=timeout)
    time.sleep(0.5)
    return page


# ─── List scraper — paginated catalog list ────────────────────────────────────

def scrape_sku_list(ctx, region, filter_type):
    """Returns list of SKU strings from the Millard catalog list pages."""
    region_enc = region.replace(" ", "%20")
    base_url   = f"{MILLARD_BASE}/en/millard/{region_enc}/{filter_type}"
    log.info(f"Fetching list: {base_url}")

    page = get_page(ctx, base_url)
    html0 = page.content()

    # ── DEBUG DUMP ── save first page HTML so we can inspect link patterns
    dump_path = Path("millard_list_debug.html")
    dump_path.write_text(html0, encoding="utf-8")
    log.info(f"  List HTML saved → {dump_path} ({len(html0)} chars)")

    # Show every unique href that contains the filter type name
    sample_hrefs = list(dict.fromkeys(
        re.findall(r'href="([^"]*' + re.escape(filter_type) + r'[^"]*)"', html0, re.I)
    ))[:8]
    log.info(f"  Sample hrefs with '{filter_type}': {sample_hrefs}")

    # Show any text matching MC-\d pattern on the page
    sample_skus = re.findall(r'\bMC-?\d{3,6}\b', html0)[:8]
    log.info(f"  Sample MC-* text on page: {sample_skus}")

    # Pattern that matches the SKU in a product link href
    sku_re = re.compile(
        r'/en/millard/[^/]+/' + re.escape(filter_type) + r'/([A-Za-z0-9][A-Za-z0-9\-]{1,15})',
        re.I,
    )

    skus: list = []
    seen: set  = set()
    page_num   = 1

    while True:
        html   = page.content() if page_num > 1 else html0
        found  = sku_re.findall(html)
        new    = [s for s in dict.fromkeys(found) if s.upper() not in seen]
        for s in new:
            seen.add(s.upper())
            skus.append(s)
        log.info(f"  Página {page_num} … +{len(new)} nuevos (total {len(skus)})")

        # Bootstrap pagination — click the enabled "next" chevron/arrow
        next_sel = (
            "ul.pagination li:not(.disabled) a[aria-label='Next'], "
            "ul.pagination li:not(.disabled) a[rel='next'], "
            "ul.pagination li:not(.disabled) a:text('»'), "
            "ul.pagination li:not(.disabled) a:text('>')"
        )
        nxt = page.locator(next_sel).first
        if nxt.count() == 0:
            log.info("  No hay más páginas")
            break
        nxt.click()
        page.wait_for_load_state("networkidle")
        time.sleep(0.5)
        page_num += 1

    page.close()
    log.info(f"Total part numbers: {len(skus)}")
    return skus


# ─── Product scraper ──────────────────────────────────────────────────────────

def scrape_product(ctx, sku, region, filter_type, dump_html=False):
    """
    Scrape one Millard product page.
    Returns dict with keys: sku, dimensions, cross_refs, applications
    """
    url = PRODUCT_URL_TPL.format(
        region=region.replace(" ", "%20"),
        filter_type=filter_type,
        sku=sku.replace(" ", "%20"),
    )
    log.info(f"  Fetching: {url}")

    try:
        page = get_page(ctx, url, timeout=30000)
    except Exception as ex:
        log.error(f"  Page load failed: {ex}")
        return None

    if dump_html:
        html = page.content()
        page.close()
        return {"__html__": html, "url": url}

    result = {
        "sku": sku,
        "url": url,
        "dimensions": {},
        "cross_refs": [],
        "applications": [],
        "raw_text": "",
    }

    try:
        # ── Product info block (dimensions + cross-refs) ────────────────────
        # Millard uses div.i_elementsTable for the product details panel
        info_text = ""
        try:
            el = page.locator("div.i_elementsTable").first
            if el.count():
                info_text = el.inner_text()
        except Exception:
            pass

        if not info_text:
            info_text = page.inner_text("body")

        result["raw_text"] = info_text[:3000]

        # Parse dimensions — Millard format: label on one line, "NNN mm" on next line
        # e.g. "H (Height)\n17 mm"  or  "L (Length)\n225 mm"
        lines = [l.strip() for l in info_text.splitlines()]
        dim_label_map = {
            "length_mm":  re.compile(r'\bL\b.*length|largo', re.I),
            "width_mm":   re.compile(r'\bW\b.*width|ancho|\bB\b.*width', re.I),
            "height_mm":  re.compile(r'\bH\b.*height|altura|thickness|espesor|\bT\b.*thick', re.I),
            "od_mm":      re.compile(r'\bOD\b|outer diameter|diámetro exterior', re.I),
            "id_mm":      re.compile(r'\bID\b|inner diameter|diámetro interior', re.I),
        }
        for i, line in enumerate(lines):
            for key, label_re in dim_label_map.items():
                if key in result["dimensions"]:
                    continue
                if label_re.search(line):
                    # value is on the same line or next non-empty line
                    candidates = [line] + (lines[i+1:i+3] if i+1 < len(lines) else [])
                    for c in candidates:
                        mv = re.search(r'(\d+(?:\.\d+)?)\s*mm', c, re.I)
                        if mv:
                            val = float(mv.group(1))
                            if 1 < val < 2000:
                                result["dimensions"][key] = val
                            break

        # ── Cross-references from i_elementsTable ──────────────────────────
        # Millard lists competitor refs as "BRAND: CODE" or in a table
        # Try to find cross-ref entries — pattern: UPPERCASE_BRAND followed by part number
        cross_pattern = re.compile(
            r'\b([A-Z][A-Z0-9\-\.& ]{1,30}?)\s*[:\-]\s*([A-Z0-9\-\/\.]{4,20})\b'
        )
        for brand, code in cross_pattern.findall(info_text):
            brand = brand.strip()
            code = code.strip()
            skip = {"HTTP", "HTTPS", "WWW", "COM", "HTML", "PHP", "EN"}
            if brand.upper() in skip or len(brand) < 2:
                continue
            result["cross_refs"].append({"brand": brand, "code": code})

        # ── Vehicle applications — parse with HTMLParser (avoids quote-escaping issues) ──
        html = page.content()
        log.info(f"  idApp_ in page HTML: {html.count('idApp_')}")

        class _AppParser(HTMLParser):
            def __init__(self):
                super().__init__(convert_charrefs=True)
                self.apps = []
                self.rows_seen = 0
                self._in_row = False
                self._onclick = ""
                self._tds = []
                self._td_buf = None

            def handle_starttag(self, tag, attrs):
                a = dict(attrs)
                if tag == "tr" and a.get("id", "").startswith("idApp_"):
                    self._in_row = True
                    self.rows_seen += 1
                    self._onclick = a.get("onclick", "")
                    self._tds = []
                    self._td_buf = None
                elif tag == "td" and self._in_row:
                    self._td_buf = ""

            def handle_endtag(self, tag):
                if tag == "td" and self._in_row and self._td_buf is not None:
                    self._tds.append(self._td_buf.strip())
                    self._td_buf = None
                elif tag == "tr" and self._in_row:
                    self._in_row = False
                    oc = self._onclick
                    # goToApp('en','America Del Sur','HYUNDAI','allSeries','','ACCENT 1.4')
                    # arg indices: 0=lang 1=region 2=brand 3=series 4=? 5=model
                    parts = re.findall(r"'([^']*)'", oc)
                    if len(parts) < 6:
                        return
                    brand = parts[2].strip()
                    model = parts[5].strip()
                    tds = self._tds
                    # tds: [img, brand, model, engine, kw, hp, cv, yr_start, yr_end, ...]
                    engine   = tds[3] if len(tds) > 3 else ""
                    yr_start = tds[7] if len(tds) > 7 else ""
                    yr_end   = tds[8] if len(tds) > 8 else ""
                    if yr_end == "-":
                        yr_end = ""
                    if brand and model:
                        self.apps.append({
                            "brand":     brand,
                            "model":     model,
                            "engine":    engine,
                            "year_from": yr_start,
                            "year_to":   yr_end,
                        })

            def handle_data(self, data):
                if self._td_buf is not None:
                    self._td_buf += data

        _p = _AppParser()
        _p.feed(html)
        log.info(f"  Parser: rows_seen={_p.rows_seen} raw_apps={len(_p.apps)}")

        seen_keys: set = set()
        for app in _p.apps:
            key = f"{app['brand']}|{app['model']}|{app['engine']}|{app['year_from']}"
            if key not in seen_keys:
                seen_keys.add(key)
                result["applications"].append(app)

    except Exception as ex:
        log.error(f"  Parse error: {ex}")

    finally:
        page.close()

    has_data = bool(result["dimensions"] or result["cross_refs"] or result["applications"])
    log.info(
        f"  → dims:{len(result['dimensions'])} refs:{len(result['cross_refs'])} "
        f"apps:{len(result['applications'])}"
    )
    return result if has_data else result  # always return for debugging


# ─── DB push helpers ──────────────────────────────────────────────────────────

def api_get(path):
    url = f"{API_BASE}{path}"
    req = urllib.request.Request(url, headers={"Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())


def push_to_db(record):
    """
    Match the Millard SKU to our catalog by cross-reference codes,
    then patch dimensions and/or cross-refs.
    """
    # Try to find matching ELIMFILTERS SKU by one of the cross-ref codes
    matched_sku = None
    for ref in record.get("cross_refs", []):
        code = ref.get("code", "")
        if not code:
            continue
        try:
            data = api_get(f"/api/search?q={urllib.request.quote(code)}&limit=5")
            hits = data.get("results", [])
            if hits:
                matched_sku = hits[0]["sku"]
                log.info(f"  Matched {code} → {matched_sku}")
                break
        except Exception:
            pass

    if not matched_sku:
        log.warning(f"  No DB match for {record['sku']}")
        return False

    # Build patch payload
    dims = record.get("dimensions", {})
    patch = {"sku": matched_sku}
    if dims.get("length_mm"):
        patch["length_mm"] = dims["length_mm"]
    if dims.get("width_mm"):
        patch["width_mm"] = dims["width_mm"]
    if dims.get("height_mm"):
        patch["height_mm"] = dims["height_mm"]
    if dims.get("od_mm"):
        patch["od_mm"] = dims["od_mm"]
    if dims.get("id_mm"):
        patch["id_mm"] = dims["id_mm"]

    if not patch:
        return False

    url = f"{API_BASE}/api/import/donaldson"
    payload = {"key": "elim2026", "rows": [patch]}
    body = json.dumps(payload).encode()
    req = urllib.request.Request(
        url, data=body,
        headers={"Content-Type": "application/json", "Accept": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        resp = json.loads(r.read())
    log.info(f"  ✅ Patched {matched_sku}: {resp}")
    return True


# ─── Progress tracking ────────────────────────────────────────────────────────

def load_progress():
    if PROGRESS_FILE.exists():
        return json.loads(PROGRESS_FILE.read_text())
    return {"done": [], "failed": []}


def save_progress(p):
    PROGRESS_FILE.write_text(json.dumps(p, indent=2))


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    ap = argparse.ArgumentParser(description="Scrape Millard cabin filter catalog")
    ap.add_argument("--sku",         help="Single SKU to process (e.g. MC-2200)")
    ap.add_argument("--region",      default="America Del Sur",
                    help="Millard region (default: 'America Del Sur')")
    ap.add_argument("--filter-type", default="cabin-filter",
                    help="Filter type slug (default: cabin-filter)")
    ap.add_argument("--dump-html",   action="store_true",
                    help="Dump raw HTML of product page and exit (for debugging selectors)")
    ap.add_argument("--dry-run",     action="store_true",
                    help="Print results without writing to DB")
    ap.add_argument("--push-db",     action="store_true",
                    help="Patch matching ELIMFILTERS products in DB")
    ap.add_argument("--out",         default="millard_scraped.json",
                    help="Output JSON file (default: millard_scraped.json)")
    ap.add_argument("--limit",       type=int, default=9999)
    args = ap.parse_args()

    pw, browser, ctx = make_browser()

    try:
        if args.sku:
            # Single SKU mode
            result = scrape_product(ctx, args.sku, args.region, args.filter_type,
                                    dump_html=args.dump_html)
            if args.dump_html:
                out_file = Path(args.out).with_suffix('.html') if args.out != "millard_scraped.json" else Path("mc2200_debug.html")
                out_file.write_text(result["__html__"], encoding="utf-8")
                log.info(f"HTML saved to {out_file}")
                return
            print(json.dumps(result, indent=2, ensure_ascii=False))
            if args.push_db and result:
                push_to_db(result)
            return

        # List mode
        skus = scrape_sku_list(ctx, args.region, args.filter_type)
        if not skus:
            log.error("No SKUs found on list page — check --region and --filter-type")
            return

        progress = load_progress()
        done_set = set(progress["done"])
        failed_set = set(progress["failed"])

        all_results = []
        processed = 0

        for sku in skus:
            if processed >= args.limit:
                break
            if sku in done_set:
                log.info(f"[SKIP] {sku} already done")
                continue

            log.info(f"[{processed+1}/{len(skus)}] {sku}")
            result = scrape_product(ctx, sku, args.region, args.filter_type)
            time.sleep(DELAY_SEC)

            if result is None:
                progress["failed"].append(sku)
                save_progress(progress)
                continue

            all_results.append(result)

            if args.push_db and not args.dry_run:
                try:
                    push_to_db(result)
                except Exception as ex:
                    log.error(f"  DB push failed: {ex}")

            progress["done"].append(sku)
            save_progress(progress)
            processed += 1

        # Save all results to JSON
        out_path = Path(args.out)
        out_path.write_text(json.dumps(all_results, indent=2, ensure_ascii=False))
        log.info(f"\nDone. {processed} products → {out_path}")

    finally:
        ctx.close()
        browser.close()
        pw.stop()


if __name__ == "__main__":
    main()
