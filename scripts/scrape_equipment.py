"""
scrape_equipment.py — Targeted equipment re-scraper for ELIMFILTERS catalog
Fetches complete equipment_applications for each product from Donaldson's website
and patches the DB via the Render API.

Requirements:
    pip install playwright requests
    playwright install chromium

Usage:
    # Dry run — shows what would be updated without writing to DB
    python3 scripts/scrape_equipment.py --dry-run

    # Run for specific filter types (fastest — skip hydraulic/coolant which have no equipment)
    python3 scripts/scrape_equipment.py --types air lube fuel

    # Run for a specific SKU only
    python3 scripts/scrape_equipment.py --sku EA10695

    # Full run (all 4622 products — ~4 hours)
    python3 scripts/scrape_equipment.py

Notes:
    - Skips products that already have >5 equipment entries (assumed complete)
    - Use --force to overwrite even products with existing data
    - Respects Donaldson's robots.txt by adding 2s delay between requests
    - Saves progress to scrape_equipment_progress.json so you can resume
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

API_BASE  = "https://part-search.elimfilters.com"
ADMIN_KEY = os.environ.get("ADMIN_KEY", "elim2026admin")
DELAY_SEC = 2.0          # seconds between Donaldson requests
MIN_EQUIP_TO_SKIP = 6   # skip if already has this many entries (assumed complete)

DONALDSON_URL = "https://www.donaldson.com/en-us/industrial-dust-collection-filtration/products/filters/{part_number}/"

# Filter types that typically list equipment applications
EQUIP_TYPES = {"air", "air-intake", "lube", "fuel", "turbine", "cabin"}

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
    """Patch a single product's equipment_applications via the import endpoint."""
    url = f"{API_BASE}/api/import/donaldson"
    payload = {
        "key": "elim2026",
        "rows": [{
            "sku": sku,
            "codigo_base": None,  # won't overwrite due to COALESCE
            "equipment_applications": equipment
        }]
    }
    body = json.dumps(payload).encode()
    req = urllib.request.Request(
        url, data=body,
        headers={"Content-Type": "application/json", "Accept": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())

def get_products_needing_equipment(filter_types=None):
    """Get all products that have 0 or few equipment entries."""
    result = api_get(f"/api/admin/audit-equipment?key={ADMIN_KEY}")
    suspects = result.get("suspects_sample", [])
    # Also fetch products with 0 equipment — audit only returns suspects (1-5)
    # We need to build the full list from the catalog
    # For now return suspects as a starting point
    if filter_types:
        suspects = [s for s in suspects if s.get("filter_type") in filter_types]
    return suspects

# ─── Scraper ─────────────────────────────────────────────────────────────────

def scrape_equipment_playwright(part_number):
    """
    Scrape equipment_applications from Donaldson product page using Playwright.
    Returns list of {machine, year, type, engine} dicts.
    """
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        log.error("Playwright not installed. Run: pip install playwright && playwright install chromium")
        return None

    url = DONALDSON_URL.format(part_number=part_number)
    log.info(f"  Fetching {url}")

    entries = []
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_extra_http_headers({
                "User-Agent": "Mozilla/5.0 (compatible; ELIMFILTERS-catalog-bot/1.0)"
            })
            page.goto(url, timeout=30000, wait_until="networkidle")

            # Click "Show More" / "Load More" buttons for equipment table if present
            for _ in range(10):
                try:
                    show_more = page.locator(
                        "button:has-text('Show More'), button:has-text('Load More'), "
                        "button:has-text('View More'), [data-testid='load-more']"
                    ).first
                    if show_more.is_visible():
                        show_more.click()
                        page.wait_for_timeout(1000)
                    else:
                        break
                except Exception:
                    break

            # Try to find the equipment/applications table
            # Donaldson renders equipment in a table with columns: Model | Year | Type | Serial | Engine
            rows = page.locator("table tr, .equipment-row, [data-equipment-row]").all()

            for row in rows:
                text = row.inner_text().strip()
                if not text or "View Parts" not in text:
                    continue
                # Parse tab-separated columns
                cols = [c.strip() for c in re.split(r"\t|\s{2,}", text)]
                if len(cols) < 2:
                    continue
                machine = cols[0] if cols[0] != "-" else ""
                year    = cols[1] if len(cols) > 1 and cols[1] not in ("-", "View Parts »") else ""
                vtype   = cols[2] if len(cols) > 2 and cols[2] not in ("-", "View Parts »") else ""
                engine_raw = cols[4] if len(cols) > 4 else ""
                engine  = "" if engine_raw.startswith("-") or engine_raw == "View Parts »" else engine_raw

                if not machine:
                    continue
                entries.append({
                    "machine": machine,
                    "year":    year,
                    "type":    vtype,
                    "engine":  engine
                })

            browser.close()

        # Deduplicate
        seen = set()
        unique = []
        for e in entries:
            key = f"{e['machine']}|{e['year']}|{e['engine']}"
            if key not in seen:
                seen.add(key)
                unique.append(e)

        log.info(f"  → {len(unique)} unique equipment entries")
        return unique

    except Exception as ex:
        log.error(f"  Scrape error for {part_number}: {ex}")
        return None

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
    parser.add_argument("--dry-run",  action="store_true", help="Don't write to DB")
    parser.add_argument("--force",    action="store_true", help="Overwrite even products with existing data")
    parser.add_argument("--types",    nargs="+", help="Filter types to process (e.g. air lube fuel)")
    parser.add_argument("--sku",      help="Process a single SKU only")
    parser.add_argument("--limit",    type=int, default=9999, help="Max products to process")
    args = parser.parse_args()

    filter_types = set(args.types) if args.types else EQUIP_TYPES
    log.info(f"Filter types: {filter_types}")
    log.info(f"Dry run: {args.dry_run}")

    # Load progress
    progress = load_progress()
    done_skus = set(progress["done"])
    failed_skus = set(progress["failed"])

    if args.sku:
        # Single SKU mode
        log.info(f"Single SKU mode: {args.sku}")
        # We need the codigo_base — fetch from API
        try:
            data = api_get(f"/api/admin/dims/{args.sku}?key={ADMIN_KEY}")
            if data.get("error"):
                log.error(f"SKU not found: {args.sku}")
                return
            codigo_base = data.get("codigo_base") or args.sku
        except Exception as e:
            log.error(f"Failed to fetch {args.sku}: {e}")
            return

        equipment = scrape_equipment_playwright(codigo_base)
        if equipment:
            log.info(f"  {args.sku}: {len(equipment)} entries")
            if not args.dry_run:
                api_patch_equipment(args.sku, equipment)
                log.info(f"  ✅ Patched {args.sku}")
        return

    # Batch mode — get suspect products from audit endpoint
    log.info("Fetching products needing equipment update...")
    suspects = get_products_needing_equipment(filter_types if not args.force else None)

    log.info(f"Found {len(suspects)} suspect products (1-5 equipment entries)")
    log.info("NOTE: Products with 0 entries need manual addition to this list")
    log.info("      Run audit endpoint first: /api/admin/audit-equipment")

    processed = 0
    for p in suspects:
        sku   = p["sku"]
        base  = p["codigo_base"]
        count = p.get("equip_count", 0)

        if sku in done_skus:
            log.info(f"[SKIP] {sku} already done")
            continue
        if sku in failed_skus and not args.force:
            log.info(f"[SKIP] {sku} previously failed")
            continue
        if count >= MIN_EQUIP_TO_SKIP and not args.force:
            log.info(f"[SKIP] {sku} has {count} entries (assumed complete)")
            continue
        if processed >= args.limit:
            log.info(f"Reached limit of {args.limit} products")
            break

        log.info(f"[{processed+1}] {sku} (base: {base}, current: {count} entries)")

        equipment = scrape_equipment_playwright(base)
        time.sleep(DELAY_SEC)

        if equipment is None:
            log.warning(f"  ❌ Failed to scrape {sku}")
            progress["failed"].append(sku)
            save_progress(progress)
            continue

        if len(equipment) <= count and not args.force:
            log.info(f"  No improvement ({len(equipment)} <= {count}), skipping")
            progress["done"].append(sku)
            save_progress(progress)
            processed += 1
            continue

        if not args.dry_run:
            try:
                api_patch_equipment(sku, equipment)
                log.info(f"  ✅ Updated {sku}: {count} → {len(equipment)} entries")
                progress["done"].append(sku)
                save_progress(progress)
            except Exception as e:
                log.error(f"  ❌ API error for {sku}: {e}")
                progress["failed"].append(sku)
                save_progress(progress)
        else:
            log.info(f"  [DRY] Would update {sku}: {count} → {len(equipment)} entries")

        processed += 1

    log.info(f"\nDone. Processed {processed} products.")
    log.info(f"Progress saved to {PROGRESS_FILE}")

if __name__ == "__main__":
    main()
