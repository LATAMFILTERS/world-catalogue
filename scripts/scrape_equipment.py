"""
scrape_equipment.py — Equipment re-scraper for ELIMFILTERS catalog
Fetches complete equipment_applications for each product from Donaldson's website
and patches the DB via the Render API.

Requirements (run locally — needs browser):
    pip install playwright requests
    playwright install chromium

Usage:
    # Dry run — shows what would be updated without writing to DB
    python3 scripts/scrape_equipment.py --dry-run

    # Run for specific filter types
    python3 scripts/scrape_equipment.py --types "Cabin Filter" "Air Filter"

    # Run for a specific SKU only
    python3 scripts/scrape_equipment.py --sku EA10695

    # Override max equipment threshold (default 5 — products with ≤5 entries are re-scraped)
    python3 scripts/scrape_equipment.py --max-entries 10

    # Full run (all products with ≤5 entries — may take hours)
    python3 scripts/scrape_equipment.py

Notes:
    - Reads suspect list from /api/admin/suspects-equipment on the Render server
    - Tries multiple Donaldson URL patterns per product (falls back until one returns equipment)
    - Clicks "Show More" up to 20 times, waits 2s each time for table to reload
    - Saves progress to scrape_equipment_progress.json so you can resume after interruption
    - Use --force to overwrite even products with existing data
"""

import argparse
import json
import os
import re
import time
import logging
import urllib.request
import urllib.error
from pathlib import Path

# ─── Config ──────────────────────────────────────────────────────────────────

API_BASE   = "https://world-catalogue.onrender.com"
ADMIN_KEY  = os.environ.get("ADMIN_KEY", "elim2026admin")
IMPORT_KEY = "elim2026"
DELAY_SEC  = 2.0   # seconds between Donaldson page requests

# Donaldson URL patterns to try per part number (in order).
# The correct path depends on the product category; we try all and take the first
# that returns equipment rows.
DONALDSON_URL_PATTERNS = [
    "https://www.donaldson.com/en-us/engine/products/filters/{part}/",
    "https://www.donaldson.com/en-us/engine/products/air-intake-systems/{part}/",
    "https://www.donaldson.com/en-us/engine/products/oil-filters/{part}/",
    "https://www.donaldson.com/en-us/engine/products/fuel-filters/{part}/",
    "https://www.donaldson.com/en-us/engine/products/hydraulic-filters/{part}/",
    "https://www.donaldson.com/en-us/industrial-dust-collection-filtration/products/filters/{part}/",
]

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-8s %(message)s",
    datefmt="%H:%M:%S"
)
log = logging.getLogger(__name__)

PROGRESS_FILE = Path(__file__).parent / "scrape_equipment_progress.json"

# ─── API helpers ─────────────────────────────────────────────────────────────

def api_get(path):
    url = f"{API_BASE}{path}"
    req = urllib.request.Request(url, headers={"Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())


def api_patch_equipment(sku, equipment):
    url  = f"{API_BASE}/api/import/donaldson"
    payload = {
        "key": IMPORT_KEY,
        "rows": [{
            "sku":                    sku,
            "codigo_base":            None,
            "equipment_applications": equipment,
        }]
    }
    body = json.dumps(payload).encode()
    req = urllib.request.Request(
        url, data=body,
        headers={"Content-Type": "application/json", "Accept": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())


def get_suspects(max_entries=5, filter_type=None):
    path = f"/api/admin/suspects-equipment?key={ADMIN_KEY}&max_entries={max_entries}&limit=5000"
    if filter_type:
        import urllib.parse
        path += f"&filter_type={urllib.parse.quote(filter_type)}"
    data = api_get(path)
    return data.get("suspects", [])

# ─── Playwright scraper ───────────────────────────────────────────────────────

def scrape_equipment_playwright(part_number):
    """
    Scrape equipment_applications from Donaldson product pages.
    Tries multiple URL patterns, clicks Show More until exhausted.
    Returns list of {machine, year, type, engine} dicts, or None on error.
    """
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        log.error("Playwright not installed. Run: pip install playwright && playwright install chromium")
        return None

    part_lower = part_number.lower()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_extra_http_headers({
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                          "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        })

        entries = []

        for url_tmpl in DONALDSON_URL_PATTERNS:
            url = url_tmpl.format(part=part_lower)
            log.info(f"  Trying: {url}")

            try:
                resp = page.goto(url, timeout=30000, wait_until="domcontentloaded")
                if resp and resp.status in (404, 410, 301, 302):
                    # 301/302 that didn't redirect to a product page — skip
                    if resp.status in (301, 302):
                        # playwright follows redirects; if status is these it's unusual
                        pass
                    else:
                        log.info(f"    → {resp.status}, trying next URL")
                        continue

                # Wait for the page to stabilise
                page.wait_for_timeout(2000)

                # Click "Show More" / "Mostrar más" up to 20 times
                for click_attempt in range(20):
                    try:
                        btn = page.locator(
                            "button:has-text('Show'), "
                            "button:has-text('More'), "
                            "button:has-text('Load'), "
                            "button:has-text('Mostrar'), "
                            "a:has-text('Show More'), "
                            "[class*='show-more'], [class*='load-more'], "
                            "[data-testid='load-more']"
                        ).first
                        if btn.is_visible(timeout=2000):
                            log.info(f"    Clicking Show More (attempt {click_attempt + 1})")
                            btn.click()
                            page.wait_for_timeout(2000)  # wait for table to reload
                        else:
                            break
                    except Exception:
                        break

                # Extract table rows
                rows = page.locator("table tr, .equipment-row, [data-equipment-row]").all()
                candidate_entries = []

                for row in rows:
                    try:
                        text = row.inner_text().strip()
                    except Exception:
                        continue
                    if not text or "View Parts" not in text:
                        continue
                    cols = [c.strip() for c in re.split(r"\t|\s{2,}", text)]
                    if len(cols) < 2:
                        continue

                    machine    = cols[0] if cols[0] not in ("-", "") else ""
                    year       = cols[1] if len(cols) > 1 and cols[1] not in ("-", "View Parts »", "") else ""
                    vtype      = cols[2] if len(cols) > 2 and cols[2] not in ("-", "View Parts »", "") else ""
                    engine_raw = cols[4] if len(cols) > 4 else ""
                    engine     = "" if engine_raw in ("-", "View Parts »", "") else engine_raw

                    if not machine:
                        continue
                    candidate_entries.append({
                        "machine": machine,
                        "year":    year,
                        "type":    vtype,
                        "engine":  engine,
                    })

                if candidate_entries:
                    log.info(f"    → Found {len(candidate_entries)} rows on this URL")
                    entries = candidate_entries
                    break  # stop trying other URL patterns
                else:
                    log.info(f"    → 0 rows, trying next URL")

            except Exception as ex:
                log.warning(f"    → Error: {ex}, trying next URL")
                continue

        browser.close()

    # Deduplicate
    seen, unique = set(), []
    for e in entries:
        key = f"{e['machine']}|{e['year']}|{e['engine']}"
        if key not in seen:
            seen.add(key)
            unique.append(e)

    log.info(f"  → {len(unique)} unique equipment entries")
    return unique

# ─── Progress tracking ────────────────────────────────────────────────────────

def load_progress():
    if PROGRESS_FILE.exists():
        return json.loads(PROGRESS_FILE.read_text())
    return {"done": [], "failed": []}


def save_progress(progress):
    PROGRESS_FILE.write_text(json.dumps(progress, indent=2))

# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Re-scrape equipment data for ELIMFILTERS catalog")
    parser.add_argument("--dry-run",     action="store_true", help="Don't write to DB")
    parser.add_argument("--force",       action="store_true", help="Overwrite even products with existing data")
    parser.add_argument("--types",       nargs="+", help="Filter types to process (e.g. 'Cabin Filter' 'Air Filter')")
    parser.add_argument("--sku",         help="Process a single SKU only")
    parser.add_argument("--max-entries", type=int, default=5, help="Re-scrape products with ≤N entries (default 5)")
    parser.add_argument("--limit",       type=int, default=9999, help="Max products to process")
    args = parser.parse_args()

    log.info(f"Dry run: {args.dry_run} | Max entries threshold: {args.max_entries}")

    progress  = load_progress()
    done_skus = set(progress["done"])
    fail_skus = set(progress["failed"])

    # ── Single SKU mode ───────────────────────────────────────────────────────
    if args.sku:
        log.info(f"Single SKU mode: {args.sku}")
        try:
            data = api_get(f"/api/filters/{args.sku}")
            if not data or data.get("error"):
                log.error(f"SKU not found: {args.sku}")
                return
            codigo_base = data.get("codigo_base") or args.sku
        except Exception as e:
            log.error(f"Failed to fetch {args.sku}: {e}")
            return

        equipment = scrape_equipment_playwright(codigo_base)
        if equipment is not None:
            log.info(f"  {args.sku}: {len(equipment)} entries found")
            if not args.dry_run:
                api_patch_equipment(args.sku, equipment)
                log.info(f"  ✅ Patched {args.sku}")
        return

    # ── Batch mode — fetch suspect list from server ───────────────────────────
    max_e = 0 if args.force else args.max_entries
    log.info(f"Fetching products with ≤{max_e} equipment entries from server...")

    filter_type = args.types[0] if args.types and len(args.types) == 1 else None
    try:
        suspects = get_suspects(max_entries=max_e, filter_type=filter_type)
    except Exception as e:
        log.error(f"Failed to fetch suspect list: {e}")
        return

    # Filter by multiple types if requested
    if args.types and len(args.types) > 1:
        types_lower = {t.lower() for t in args.types}
        suspects = [s for s in suspects if (s.get("filter_type") or "").lower() in types_lower]

    log.info(f"Total suspects: {len(suspects)}")
    pending = [s for s in suspects if s["sku"] not in done_skus and (args.force or s["sku"] not in fail_skus)]
    pending = pending[:args.limit]
    log.info(f"Pending (excluding done/failed): {len(pending)}\n")

    if not pending:
        log.info("Nothing to do. Delete scrape_equipment_progress.json to restart.")
        return

    updated = failed = skipped = 0

    for i, p in enumerate(pending):
        sku   = p["sku"]
        base  = p["codigo_base"]
        count = p.get("equip_count", 0)

        log.info(f"[{i+1}/{len(pending)}] {sku} (base: {base}, current: {count})")

        equipment = scrape_equipment_playwright(base)
        time.sleep(DELAY_SEC)

        if equipment is None:
            log.warning(f"  ❌ Failed to scrape {sku}")
            progress["failed"].append(sku)
            save_progress(progress)
            failed += 1
            continue

        if len(equipment) == 0:
            log.info(f"  → 0 results (product not found on Donaldson site)")
            progress["done"].append(sku)
            save_progress(progress)
            skipped += 1
            continue

        if len(equipment) <= count and not args.force:
            log.info(f"  → No improvement ({len(equipment)} ≤ {count}), skipping")
            progress["done"].append(sku)
            save_progress(progress)
            skipped += 1
            continue

        if not args.dry_run:
            try:
                api_patch_equipment(sku, equipment)
                log.info(f"  ✅ Updated {sku}: {count} → {len(equipment)} entries")
                progress["done"].append(sku)
                save_progress(progress)
                updated += 1
            except Exception as e:
                log.error(f"  ❌ API error for {sku}: {e}")
                progress["failed"].append(sku)
                save_progress(progress)
                failed += 1
        else:
            log.info(f"  [DRY] Would update {sku}: {count} → {len(equipment)} entries")
            updated += 1

    log.info(f"\n{'='*55}")
    log.info(f"Done. Updated: {updated} | Skipped: {skipped} | Failed: {failed}")
    log.info(f"Progress saved to {PROGRESS_FILE}")
    if failed:
        log.info("Run again to retry failed items (progress is preserved).")


if __name__ == "__main__":
    main()
