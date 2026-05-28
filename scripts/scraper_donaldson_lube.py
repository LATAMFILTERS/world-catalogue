"""
scraper_donaldson_lube.py
Extrae los 440 filtros Lube de Donaldson: specs, cross-refs, alternativas, equipment.
Ejecutar:
    pip install playwright playwright-stealth
    playwright install chrome
    python scraper_donaldson_lube.py
"""

import json
import time
import random
import logging
import os
from datetime import datetime
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

try:
    from playwright_stealth import stealth_sync
    STEALTH = True
except ImportError:
    STEALTH = False

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    handlers=[
        logging.FileHandler("scraper_lube.log", encoding="utf-8"),
        logging.StreamHandler(),
    ],
)

CATEGORY_URL = (
    "https://shop.donaldson.com/store/en-us/search"
    "?N=426772457&Nr=product.language%3AEnglish&catNav=true&st=parts"
)
PRODUCT_BASE = "https://shop.donaldson.com/store/en-us/product/"
OUTPUT_FILE   = "donaldson_lube_results.json"
PROGRESS_FILE = "donaldson_lube_progress.json"
PROFILE_DIR   = os.path.join(os.path.expanduser("~"), ".donaldson_profile")

SHOW_MORE_LIMIT  = 60
PAUSE_BETWEEN    = (5, 10)


# ── utilidades ─────────────────────────────────────────────────────────────

def rand_sleep(lo=None, hi=None):
    lo, hi = (lo, hi) if lo else PAUSE_BETWEEN
    time.sleep(random.uniform(lo, hi))


def dismiss_popups(page):
    for sel in [
        "button#onetrust-accept-btn-handler",
        "button.cookie-accept",
        "[aria-label='Close']",
        "button.close",
        ".modal-close",
    ]:
        try:
            btn = page.locator(sel).first
            if btn.is_visible(timeout=1500):
                btn.click()
                time.sleep(0.8)
        except Exception:
            pass


def click_show_more(page, section_sel, max_clicks=SHOW_MORE_LIMIT):
    """Expande 'Show More' detectando cuando no hay progreso para evitar loops."""
    clicks = 0
    prev_html = ""
    stuck = 0
    while clicks < max_clicks:
        try:
            # Buscar botón Show More EN TODA LA PÁGINA (no solo en section_sel)
            # porque los selectores de sección a veces no coinciden
            btn = page.locator(
                "button:has-text('Show More'):visible, "
                "a:has-text('Show More'):visible, "
                "button:has-text('show more'):visible"
            ).first
            if not btn.is_visible(timeout=1000):
                break
            # Verificar que el contenido cambia tras cada clic (anti-loop)
            current_html = page.content()[:2000]
            if current_html == prev_html:
                stuck += 1
                if stuck >= 2:
                    logging.warning("  Show More sin cambios — saliendo del loop")
                    break
            else:
                stuck = 0
            prev_html = current_html
            btn.scroll_into_view_if_needed()
            btn.click()
            clicks += 1
            time.sleep(1.5)
        except Exception:
            break
    return clicks


# ── colección de links ──────────────────────────────────────────────────────

def collect_product_links(page):
    page.goto(CATEGORY_URL, timeout=60000, wait_until="networkidle")
    time.sleep(4)
    dismiss_popups(page)

    part_numbers = []
    page_num = 1

    while True:
        logging.info(f"  Página categoría {page_num} …")
        page.wait_for_load_state("networkidle", timeout=25000)

        links = page.locator(
            "a.donaldson-part-details, a[href*='/product/'], a[data-partnumber]"
        ).all()
        if not links:
            links = page.locator("a[href*='/store/en-us/product/']").all()

        added = 0
        for lnk in links:
            href = lnk.get_attribute("href") or ""
            pn = href.split("/product/")[-1].split("?")[0].split("/")[0].strip().upper()
            if pn and pn not in part_numbers and len(pn) >= 3 and " " not in pn:
                part_numbers.append(pn)
                added += 1

        logging.info(f"    +{added} (total {len(part_numbers)})")

        try:
            nxt = page.locator(
                "a[aria-label='Next page'], a.next-page, "
                "li.next a, a:has-text('Next'), button:has-text('Next')"
            ).first
            if nxt.is_visible(timeout=2000):
                nxt.click()
                page_num += 1
                rand_sleep(2, 5)
            else:
                break
        except Exception:
            break

    logging.info(f"Total: {len(part_numbers)}")
    return part_numbers


# ── extracción por producto ─────────────────────────────────────────────────

def click_tab(page, selectors):
    for sel in selectors:
        try:
            t = page.locator(sel).first
            if t.is_visible(timeout=1200):
                t.click()
                time.sleep(1.8)
                return True
        except Exception:
            pass
    return False


def extract_attributes(page):
    click_tab(page, [
        "a[href='#specifications']", "a[href='#productSpecifications']",
        "a[href='#techSpecs']", "a[href='#attributes']",
        "li a:has-text('Specifications')", "li a:has-text('Tech Specs')",
        "button:has-text('Specifications')",
    ])
    attrs = {}
    try:
        dts = page.locator("dl dt").all()
        dds = page.locator("dl dd").all()
        for dt, dd in zip(dts, dds):
            k = dt.inner_text().strip()
            v = dd.inner_text().strip()
            if k:
                attrs[k] = v
    except Exception:
        pass
    if not attrs:
        try:
            for row in page.locator("table tr").all():
                cells = row.locator("th, td").all()
                if len(cells) >= 2:
                    k = cells[0].inner_text().strip()
                    v = cells[1].inner_text().strip()
                    if k:
                        attrs[k] = v
        except Exception:
            pass
    return attrs


def extract_list(page, tab_selectors, section_sel, item_sel):
    click_tab(page, tab_selectors)
    click_show_more(page, section_sel)
    items = []
    try:
        for el in page.locator(item_sel).all():
            t = el.inner_text().strip()
            if t and len(t) >= 2 and t not in items:
                items.append(t)
    except Exception:
        pass
    return items


def extract_cross_refs(page):
    return extract_list(
        page,
        tab_selectors=[
            "a[href='#crossReference']", "a[href='#cross-reference']",
            "a[href='#interchanges']", "li a:has-text('Cross Reference')",
            "li a:has-text('Interchange')", "button:has-text('Cross Reference')",
        ],
        section_sel="[id*='cross'], [class*='cross'], [id*='interchange']",
        item_sel=(
            "[class*='cross'] [class*='part'], "
            "[class*='interchange'] td:first-child, "
            "[id*='cross'] td, table[class*='cross'] td"
        ),
    )


def extract_alternatives(page):
    return extract_list(
        page,
        tab_selectors=[
            "a[href='#alternatives']", "a[href='#replacements']",
            "a[href='#relatedProducts']", "li a:has-text('Alternatives')",
            "li a:has-text('Replacement')", "button:has-text('Alternatives')",
        ],
        section_sel="[id*='alternative'], [class*='alternative'], [id*='replacement']",
        item_sel=(
            "[class*='alternative'] [class*='part'], "
            "[class*='replacement'] [class*='part'], "
            "[id*='alternative'] td, [id*='replacement'] td"
        ),
    )


def extract_equipment(page):
    click_tab(page, [
        "a[href='#applications']", "a[href='#equipment']",
        "li a:has-text('Applications')", "li a:has-text('Equipment')",
        "button:has-text('Applications')",
    ])
    click_show_more(page, "[id*='application'], [class*='application'], [id*='equipment']")
    equipment = []
    try:
        for row in page.locator(
            "[class*='application'] tr, [id*='application'] tr, [class*='equipment'] tr"
        ).all():
            cells = row.locator("td").all()
            if cells:
                parts = [c.inner_text().strip() for c in cells if c.inner_text().strip()]
                if parts:
                    equipment.append(" | ".join(parts))
    except Exception:
        pass
    return equipment


def scrape_product(page, part_number):
    url = f"{PRODUCT_BASE}{part_number}"
    result = {
        "part_number": part_number,
        "url": url,
        "description": "",
        "attributes": {},
        "cross_references": [],
        "alternatives": [],
        "equipment": [],
        "scraped_at": datetime.utcnow().isoformat(),
        "error": None,
    }
    try:
        page.goto(url, timeout=45000, wait_until="domcontentloaded")
        time.sleep(3)
        dismiss_popups(page)
        for sel in ["h1.product-title", "h1[class*='name']", "h1", ".product-name"]:
            try:
                el = page.locator(sel).first
                if el.is_visible(timeout=800):
                    result["description"] = el.inner_text().strip()
                    break
            except Exception:
                pass
        result["attributes"]      = extract_attributes(page)
        result["cross_references"] = extract_cross_refs(page)
        result["alternatives"]    = extract_alternatives(page)
        result["equipment"]       = extract_equipment(page)
    except PlaywrightTimeout:
        result["error"] = "timeout"
        logging.warning(f"  TIMEOUT: {part_number}")
    except Exception as e:
        result["error"] = str(e)
        logging.warning(f"  ERROR {part_number}: {e}")
    return result


# ── progreso ───────────────────────────────────────────────────────────────

def load_progress():
    try:
        with open(PROGRESS_FILE, encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {"done": [], "results": [], "part_numbers": []}


def save_progress(p):
    with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
        json.dump(p, f, ensure_ascii=False, indent=2)


# ── main ───────────────────────────────────────────────────────────────────

def main():
    progress  = load_progress()
    done_set  = set(progress["done"])
    results   = progress["results"]

    with sync_playwright() as pw:
        logging.info(f"Stealth: {'SI' if STEALTH else 'NO (pip install playwright-stealth)'}")
        logging.info(f"Perfil Chrome: {PROFILE_DIR}")

        context = pw.chromium.launch_persistent_context(
            user_data_dir=PROFILE_DIR,
            channel="chrome",
            headless=False,
            slow_mo=80,
            viewport={"width": 1366, "height": 768},
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            ),
            args=["--disable-blink-features=AutomationControlled"],
            ignore_default_args=["--enable-automation"],
        )

        page = context.new_page()
        if STEALTH:
            stealth_sync(page)

        # ── 1. Recolectar part numbers ─────────────────────────────────
        if not progress["part_numbers"]:
            logging.info("=== Recolectando links categoría Lube (440) ===")
            pns = collect_product_links(page)
            progress["part_numbers"] = pns
            save_progress(progress)
        else:
            pns = progress["part_numbers"]
            logging.info(f"=== {len(pns)} part numbers en progreso ===")

        total = len(pns)

        # ── 2. Scrape por producto ─────────────────────────────────────
        for idx, pn in enumerate(pns, 1):
            if pn in done_set:
                logging.info(f"[{idx}/{total}] {pn} ya procesado")
                continue

            logging.info(f"[{idx}/{total}] {pn} …")
            data = scrape_product(page, pn)

            na = len(data["attributes"])
            nc = len(data["cross_references"])
            nl = len(data["alternatives"])
            ne = len(data["equipment"])
            st = "✅" if not data["error"] else "❌"
            logging.info(f"  {st} {pn} → {na} Attr | {nc} Cross | {nl} Alt | {ne} Equip")

            results.append(data)
            done_set.add(pn)
            progress["done"]    = list(done_set)
            progress["results"] = results

            if idx % 5 == 0:
                save_progress(progress)

            rand_sleep()

        context.close()

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    ok  = sum(1 for r in results if not r["error"])
    err = len(results) - ok
    logging.info(f"\n=== COMPLETADO: {ok} OK | {err} errores → {OUTPUT_FILE} ===")


if __name__ == "__main__":
    main()
