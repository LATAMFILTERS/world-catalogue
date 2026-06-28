#!/usr/bin/env python3
"""
scraper_donaldson_targeted.py
==============================
Scrapes individual Donaldson product pages for a specific list of part numbers.
Uses Playwright with a persistent Chrome profile (same as debug_donaldson.py).

Input:  Text file with one Donaldson part number per line (e.g. donaldson_to_scrape.txt)
Output: JSON file with product data ready for import_donaldson_targeted.py

URL pattern: https://shop.donaldson.com/store/en-us/product/{CODE}

Data extracted:
  - part_number, name, description
  - attributes (specs: OD, height, thread, etc.)
  - cross_references (brand + part_number)
  - alternatives (replacement codes)
  - equipment (make, model, engine, year)

Usage:
    python scraper_donaldson_targeted.py \
        --codes C:\\mann\\donaldson_to_scrape.txt \
        --out C:\\mann\\donaldson_targeted_results.json

    python scraper_donaldson_targeted.py \
        --codes C:\\mann\\donaldson_to_scrape.txt \
        --out C:\\mann\\donaldson_targeted_results.json \
        --resume

Requires:
    pip install playwright playwright-stealth
    playwright install chromium  (only needed once)
"""

import argparse
import json
import logging
import os
import time
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger(__name__)

PROFILE_DIR = os.path.join(os.path.expanduser("~"), ".donaldson_profile")
BASE_URL    = "https://shop.donaldson.com/store/en-us/product"
DELAY       = 1.5   # seconds between requests

try:
    from playwright_stealth import stealth_sync
    STEALTH = True
except ImportError:
    STEALTH = False


def parse_attributes(page) -> dict:
    """Extract specs table from #attributesBody."""
    try:
        return page.evaluate("""() => {
            const body = document.getElementById('attributesBody');
            if (!body) return {};
            const attrs = {};
            body.querySelectorAll('tr').forEach(tr => {
                const cells = tr.querySelectorAll('td, th');
                if (cells.length >= 2) {
                    const k = cells[0].textContent.trim();
                    const v = cells[1].textContent.trim();
                    if (k && v && k.toLowerCase() !== 'attribute') attrs[k] = v;
                }
            });
            return attrs;
        }""")
    except Exception:
        return {}


def parse_cross_references(page) -> list:
    """Extract cross-reference table from #crossreferenceBody."""
    try:
        return page.evaluate("""() => {
            const body = document.getElementById('crossreferenceBody');
            if (!body) return [];
            const refs = [];
            body.querySelectorAll('tr').forEach(tr => {
                const cells = tr.querySelectorAll('td');
                if (cells.length >= 2) {
                    const brand = cells[0].textContent.trim();
                    const code  = cells[1].textContent.trim();
                    if (brand && code &&
                        brand.toUpperCase() !== 'BRAND' &&
                        brand.toUpperCase() !== 'MANUFACTURER') {
                        refs.push({brand: brand, part_number: code});
                    }
                }
            });
            return refs;
        }""")
    except Exception:
        return []


def parse_alternatives(page) -> list:
    """Extract replacement/alternative codes from #alternateBody."""
    try:
        return page.evaluate("""() => {
            const body = document.getElementById('alternateBody');
            if (!body) return [];
            const alts = [];
            body.querySelectorAll('a, td').forEach(el => {
                const text = el.textContent.trim().toUpperCase();
                if (text.match(/^[A-Z]{1,3}[0-9]{3,}/)) alts.push(text);
            });
            return [...new Set(alts)];
        }""")
    except Exception:
        return []


def parse_equipment(page) -> list:
    """Extract equipment applications from #equiptmentBody (Donaldson typo)."""
    try:
        return page.evaluate("""() => {
            const body = document.getElementById('equiptmentBody');
            if (!body) return [];
            const equip = [];
            body.querySelectorAll('tr').forEach(tr => {
                const cells = tr.querySelectorAll('td');
                if (cells.length >= 2) {
                    const texts = Array.from(cells).map(c => c.textContent.trim());
                    // Typical columns: Equipment, Make, Model, Engine, Year, Qty
                    if (texts.some(t => t && t.toUpperCase() !== 'MAKE' && t.toUpperCase() !== 'MODEL')) {
                        equip.push({
                            equipment: texts[0] || '',
                            make:      texts[1] || '',
                            model:     texts[2] || '',
                            engine:    texts[3] || '',
                            year:      texts[4] || '',
                        });
                    }
                }
            });
            return equip;
        }""")
    except Exception:
        return []


def parse_product_info(page) -> dict:
    """Extract product name and description from page headings/text."""
    try:
        return page.evaluate("""() => {
            // Part number heading
            const h1 = document.querySelector('h1');
            const name_el = document.querySelector('[class*="product-name"],[class*="productName"],[class*="product_name"]');
            const desc_el = document.querySelector('[class*="description"],[class*="product-description"]');

            const name = (name_el || h1 || {textContent: ''}).textContent.trim().slice(0, 300);
            const desc = (desc_el || {textContent: ''}).textContent.trim().slice(0, 600);
            return {name, desc};
        }""")
    except Exception:
        return {'name': '', 'desc': ''}


def scrape_product(page, code: str) -> dict:
    """Scrape a single Donaldson product page. Returns a result dict."""
    url = f"{BASE_URL}/{code.upper()}"
    result = {
        'part_number': code.upper(),
        'url': url,
        'name': '',
        'description': '',
        'attributes': {},
        'cross_references': [],
        'alternatives': [],
        'equipment': [],
        'error': None,
    }

    try:
        response = page.goto(url, timeout=60000, wait_until="domcontentloaded")
        time.sleep(1.5)  # wait for JS sections to render

        # Check for 404 / not found
        if response and response.status == 404:
            result['error'] = 'not_found'
            return result

        # Check title for "not found" message
        title = page.title().lower()
        if 'not found' in title or '404' in title:
            result['error'] = 'not_found'
            return result

        # Wait for product sections to load (up to 5s)
        try:
            page.wait_for_selector('#attributesBody, #crossreferenceBody, h1', timeout=5000)
        except Exception:
            pass  # continue even if timeout

        info = parse_product_info(page)
        result['name']        = info.get('name', '')
        result['description'] = info.get('desc', '')

        result['attributes']      = parse_attributes(page)
        result['cross_references'] = parse_cross_references(page)
        result['alternatives']    = parse_alternatives(page)
        result['equipment']       = parse_equipment(page)

        # Validate: if no data at all, likely bot-blocked
        if not result['attributes'] and not result['cross_references'] and not result['name']:
            result['error'] = 'no_data_bot_block'

    except Exception as e:
        result['error'] = str(e)[:200]

    return result


def load_done_codes(out_path: Path) -> set:
    """Load already-scraped codes from existing output JSON."""
    if not out_path.exists():
        return set()
    try:
        with open(out_path, encoding='utf-8') as f:
            data = json.load(f)
        if isinstance(data, list):
            return {r.get('part_number', '').upper() for r in data if r.get('part_number')}
    except Exception:
        pass
    return set()


def run(args):
    codes_path = Path(args.codes)
    out_path   = Path(args.out)

    # Load codes
    with open(codes_path, encoding='utf-8') as f:
        all_codes = [l.strip().upper() for l in f if l.strip()]
    log.info(f"Codes to scrape: {len(all_codes)}")

    # Resume support
    done = set()
    existing_results = []
    if args.resume and out_path.exists():
        done = load_done_codes(out_path)
        if done:
            with open(out_path, encoding='utf-8') as f:
                existing_results = json.load(f)
            log.info(f"Resuming — {len(done)} already done, {len(all_codes) - len(done)} remaining")

    pending = [c for c in all_codes if c not in done]
    log.info(f"Pending: {len(pending)} codes")

    if not pending:
        log.info("Nothing to scrape.")
        return

    from playwright.sync_api import sync_playwright

    results = list(existing_results)
    stats = {'ok': 0, 'not_found': 0, 'no_data': 0, 'error': 0}

    with sync_playwright() as pw:
        log.info(f"Stealth: {'YES' if STEALTH else 'NO'} | Profile: {PROFILE_DIR}")

        context = pw.chromium.launch_persistent_context(
            user_data_dir=PROFILE_DIR,
            channel="chrome",
            headless=False,
            slow_mo=50,
            locale="en-US",
            viewport={"width": 1366, "height": 768},
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            ),
            extra_http_headers={"Accept-Language": "en-US,en;q=0.9"},
            args=["--disable-blink-features=AutomationControlled"],
            ignore_default_args=["--enable-automation"],
        )

        page = context.new_page()
        if STEALTH:
            stealth_sync(page)

        try:
            for i, code in enumerate(pending, 1):
                log.info(f"  [{i}/{len(pending)}] {code}")
                result = scrape_product(page, code)
                results.append(result)

                err = result.get('error')
                if err == 'not_found':
                    stats['not_found'] += 1
                    log.info(f"    → NOT FOUND (discontinued)")
                elif err == 'no_data_bot_block':
                    stats['no_data'] += 1
                    log.warning(f"    → No data (bot block?)")
                elif err:
                    stats['error'] += 1
                    log.warning(f"    → Error: {err}")
                else:
                    stats['ok'] += 1
                    attrs_count = len(result.get('attributes', {}))
                    xrefs_count = len(result.get('cross_references', []))
                    log.info(f"    → OK  attrs={attrs_count}  xrefs={xrefs_count}  name={result['name'][:60]}")

                # Save incrementally every 10 products
                if i % 10 == 0 or i == len(pending):
                    with open(out_path, 'w', encoding='utf-8') as f:
                        json.dump(results, f, ensure_ascii=False, indent=2)
                    log.info(f"    [saved {len(results)} records → {out_path.name}]")

                time.sleep(DELAY)

        finally:
            context.close()

    # Final save
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    log.info(f"\n{'='*60}")
    log.info(f"SCRAPE COMPLETE")
    log.info(f"  OK (data found)    : {stats['ok']}")
    log.info(f"  Not found (discon.): {stats['not_found']}")
    log.info(f"  No data (blocked?) : {stats['no_data']}")
    log.info(f"  Errors             : {stats['error']}")
    log.info(f"  Output → {out_path}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Scrape individual Donaldson product pages')
    parser.add_argument('--codes',  required=True, help='Text file with Donaldson codes (one per line)')
    parser.add_argument('--out',    required=True, help='Output JSON file')
    parser.add_argument('--resume', action='store_true', help='Skip already-scraped codes')
    args = parser.parse_args()
    run(args)
