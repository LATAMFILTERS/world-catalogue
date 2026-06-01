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
from pathlib import Path

# ─── Config ──────────────────────────────────────────────────────────────────

API_BASE   = "https://part-search.elimfilters.com"
ADMIN_KEY  = os.environ.get("ADMIN_KEY", "elim2026admin")
DELAY_SEC  = 2.0

MILLARD_BASE    = "https://www.millardcatalog.com"
LIST_URL_TPL    = MILLARD_BASE + "/en/dimensions/{region}/{filter_type}"
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


# ─── List scraper — gets all SKUs from catalog list page ─────────────────────

def scrape_sku_list(ctx, region, filter_type):
    """Returns list of SKU strings from the Millard catalog list page."""
    url = LIST_URL_TPL.format(
        region=region.replace(" ", "%20"),
        filter_type=filter_type,
    )
    log.info(f"Fetching list: {url}")
    page = get_page(ctx, url)

    skus = []

    # Strategy 1: links whose href contains the product path pattern
    links = page.locator(f"a[href*='/{filter_type}/']").all()
    for link in links:
        href = link.get_attribute("href") or ""
        # Extract last path segment (the SKU)
        m = re.search(r'/([^/]+)$', href.rstrip('/'))
        if m:
            sku = m.group(1)
            if sku and sku not in skus:
                skus.append(sku)

    # Strategy 2: table rows with part numbers
    if not skus:
        rows = page.locator("table tr td:first-child, .part-number, [data-sku]").all()
        for r in rows:
            txt = r.inner_text().strip()
            if txt and re.match(r'^MC-?\d+', txt, re.I):
                sku = txt.strip()
                if sku not in skus:
                    skus.append(sku)

    # Strategy 3: any text matching MC-XXXX pattern
    if not skus:
        body = page.inner_text("body")
        found = re.findall(r'\bMC-?\d{3,6}\b', body)
        skus = list(dict.fromkeys(found))  # deduplicate preserving order

    page.close()
    log.info(f"  Found {len(skus)} SKUs on list page")
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
        # ── Dimensions ─────────────────────────────────────────────────────
        # Millard typically shows dimensions in a table or definition list.
        # Common selectors (adjust after --dump-html inspection):
        dim_selectors = [
            ".dimensions",
            ".specs",
            ".product-specs",
            "table.product-table",
            "[class*='dimen']",
            "[class*='spec']",
            ".product-details table",
        ]
        dim_text = ""
        for sel in dim_selectors:
            try:
                el = page.locator(sel).first
                if el.is_visible():
                    dim_text = el.inner_text()
                    break
            except Exception:
                pass

        if not dim_text:
            # Fall back: look for dimension patterns anywhere on page
            dim_text = page.inner_text("body")

        result["raw_text"] = dim_text[:2000]  # keep for debugging

        # Parse dimensions from text (mm values)
        dim_patterns = {
            "length_mm":    r'(?:length|largo|L)[:\s]*(\d+(?:\.\d+)?)\s*mm',
            "width_mm":     r'(?:width|ancho|W|B)[:\s]*(\d+(?:\.\d+)?)\s*mm',
            "height_mm":    r'(?:height|altura|H)[:\s]*(\d+(?:\.\d+)?)\s*mm',
            "thickness_mm": r'(?:thickness|espesor|T|depth)[:\s]*(\d+(?:\.\d+)?)\s*mm',
            "od_mm":        r'(?:OD|outer diameter|diámetro exterior)[:\s]*(\d+(?:\.\d+)?)\s*mm',
            "id_mm":        r'(?:ID|inner diameter|diámetro interior)[:\s]*(\d+(?:\.\d+)?)\s*mm',
        }
        for key, pattern in dim_patterns.items():
            m = re.search(pattern, dim_text, re.I)
            if m:
                result["dimensions"][key] = float(m.group(1))

        # ── Cross-references ────────────────────────────────────────────────
        cross_selectors = [
            ".cross-reference",
            ".references",
            ".interchanges",
            "[class*='cross']",
            "[class*='refer']",
            "table.cross",
        ]
        cross_text = ""
        for sel in cross_selectors:
            try:
                el = page.locator(sel).first
                if el.is_visible():
                    cross_text = el.inner_text()
                    break
            except Exception:
                pass

        if cross_text:
            # Each line may be "BRAND  CODE" or just "CODE"
            for line in cross_text.splitlines():
                line = line.strip()
                if not line or line.lower() in ("cross reference", "referencias", "brand", "part"):
                    continue
                parts = re.split(r'\s{2,}|\t', line)
                if len(parts) >= 2:
                    result["cross_refs"].append({"brand": parts[0], "code": parts[1]})
                elif len(parts) == 1 and re.search(r'\d', parts[0]):
                    result["cross_refs"].append({"brand": "", "code": parts[0]})

        # ── Vehicle applications ────────────────────────────────────────────
        app_selectors = [
            ".applications",
            ".vehicles",
            ".fitment",
            "[class*='appli']",
            "[class*='vehicle']",
            "table.applications",
        ]
        app_text = ""
        for sel in app_selectors:
            try:
                el = page.locator(sel).first
                if el.is_visible():
                    app_text = el.inner_text()
                    break
            except Exception:
                pass

        if app_text:
            for line in app_text.splitlines():
                line = line.strip()
                if not line or line.lower() in ("application", "vehicle", "year", "model"):
                    continue
                result["applications"].append(line)

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
                print(result["__html__"])
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
