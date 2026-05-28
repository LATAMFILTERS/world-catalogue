"""
scraper_donaldson_lube.py
Extrae los 440 filtros Lube de Donaldson → cross-refs, equipment, specs.
Ejecutar: python scraper_donaldson_lube.py
"""

import json
import time
import random
import logging
from datetime import datetime
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

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
OUTPUT_FILE = "donaldson_lube_results.json"
PROGRESS_FILE = "donaldson_lube_progress.json"

SHOW_MORE_LIMIT = 60      # máximo de clics en "Show More" por sección
PAUSE_BETWEEN = (4, 8)    # segundos de espera entre productos


# ── utilidades ─────────────────────────────────────────────────────────────

def rand_sleep(lo=None, hi=None):
    if lo is None:
        lo, hi = PAUSE_BETWEEN
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


def click_show_more(page, section_selector, max_clicks=SHOW_MORE_LIMIT):
    """Expande sección pulsando 'Show More' hasta que desaparece."""
    clicks = 0
    while clicks < max_clicks:
        try:
            btn = page.locator(
                f"{section_selector} button:has-text('Show More'), "
                f"{section_selector} a:has-text('Show More'), "
                f"{section_selector} button:has-text('show more'), "
                f"{section_selector} [class*='show-more']:visible"
            ).first
            if btn.is_visible(timeout=1500):
                btn.scroll_into_view_if_needed()
                btn.click()
                clicks += 1
                time.sleep(1.2)
            else:
                break
        except Exception:
            break
    return clicks


# ── colección de links de categoría ────────────────────────────────────────

def collect_product_links(page):
    """Navega todas las páginas de la categoría y devuelve lista de part numbers."""
    page.goto(CATEGORY_URL, timeout=60000, wait_until="networkidle")
    time.sleep(3)
    dismiss_popups(page)

    part_numbers = []
    page_num = 1

    while True:
        logging.info(f"  Página categoría {page_num} …")
        page.wait_for_load_state("networkidle", timeout=20000)

        # Links a productos — selector observado en Donaldson category pages
        links = page.locator("a.donaldson-part-details, a[href*='/product/'], a[data-partnumber]").all()

        if not links:
            # intento alternativo: cualquier link con /product/ en el href
            links = page.locator("a[href*='/store/en-us/product/']").all()

        added = 0
        for lnk in links:
            href = lnk.get_attribute("href") or ""
            pn = href.split("/product/")[-1].split("?")[0].strip().upper()
            if pn and pn not in part_numbers and len(pn) >= 4:
                part_numbers.append(pn)
                added += 1

        logging.info(f"    +{added} productos (total {len(part_numbers)})")

        # Paginación: botón "Next" o número de página
        try:
            nxt = page.locator(
                "a[aria-label='Next page'], a.next-page, "
                "li.next a, a:has-text('Next'), button:has-text('Next')"
            ).first
            if nxt.is_visible(timeout=2000):
                nxt.click()
                page_num += 1
                rand_sleep(2, 4)
            else:
                break
        except Exception:
            break

    logging.info(f"Total productos recolectados: {len(part_numbers)}")
    return part_numbers


# ── extracción por producto ─────────────────────────────────────────────────

def extract_attributes(page) -> dict:
    """Extrae especificaciones técnicas del producto."""
    attrs = {}

    # Intenta clic en pestaña Specifications
    tab_selectors = [
        "a[href='#specifications']",
        "a[href='#productSpecifications']",
        "a[href='#techSpecs']",
        "a[href='#attributes']",
        "button[data-tab='specifications']",
        "li a:has-text('Specifications')",
        "li a:has-text('Tech Specs')",
        "button:has-text('Specifications')",
    ]
    for sel in tab_selectors:
        try:
            tab = page.locator(sel).first
            if tab.is_visible(timeout=1200):
                tab.click()
                time.sleep(1.5)
                break
        except Exception:
            continue

    # dl dt/dd
    try:
        dts = page.locator("dl dt").all()
        dds = page.locator("dl dd").all()
        if dts:
            for dt, dd in zip(dts, dds):
                k = dt.inner_text().strip()
                v = dd.inner_text().strip()
                if k:
                    attrs[k] = v
    except Exception:
        pass

    # table rows
    if not attrs:
        try:
            rows = page.locator("table tr").all()
            for row in rows:
                cells = row.locator("th, td").all()
                if len(cells) >= 2:
                    k = cells[0].inner_text().strip()
                    v = cells[1].inner_text().strip()
                    if k:
                        attrs[k] = v
        except Exception:
            pass

    # div label/value patterns
    if not attrs:
        try:
            labels = page.locator("[class*='spec'] [class*='label'], [class*='attribute'] [class*='name']").all()
            values = page.locator("[class*='spec'] [class*='value'], [class*='attribute'] [class*='val']").all()
            for lbl, val in zip(labels, values):
                k = lbl.inner_text().strip()
                v = val.inner_text().strip()
                if k:
                    attrs[k] = v
        except Exception:
            pass

    return attrs


def extract_cross_refs(page) -> list:
    """Extrae cross-reference codes."""
    codes = []

    # Pestaña Cross Reference
    for sel in [
        "a[href='#crossReference']",
        "a[href='#cross-reference']",
        "a[href='#interchanges']",
        "li a:has-text('Cross Reference')",
        "li a:has-text('Interchange')",
        "button:has-text('Cross Reference')",
    ]:
        try:
            t = page.locator(sel).first
            if t.is_visible(timeout=1200):
                t.click()
                time.sleep(1.5)
                break
        except Exception:
            continue

    click_show_more(page, "[id*='cross'], [class*='cross'], [id*='interchange'], [class*='interchange']")

    try:
        items = page.locator(
            "[class*='cross'] [class*='part'], "
            "[class*='interchange'] td:first-child, "
            "[id*='cross'] td, "
            "table[class*='cross'] td"
        ).all()
        for it in items:
            t = it.inner_text().strip()
            if t and len(t) >= 3 and t not in codes:
                codes.append(t)
    except Exception:
        pass

    return codes


def extract_alternatives(page) -> list:
    """Extrae productos alternativos (Donaldson replacements/alternatives)."""
    alternatives = []

    for sel in [
        "a[href='#alternatives']",
        "a[href='#replacements']",
        "a[href='#relatedProducts']",
        "li a:has-text('Alternatives')",
        "li a:has-text('Alternative')",
        "li a:has-text('Replacement')",
        "li a:has-text('Related')",
        "button:has-text('Alternatives')",
        "button:has-text('Replacement')",
    ]:
        try:
            t = page.locator(sel).first
            if t.is_visible(timeout=1200):
                t.click()
                time.sleep(1.5)
                break
        except Exception:
            continue

    click_show_more(page, "[id*='alternative'], [class*='alternative'], [id*='replacement'], [class*='replacement']")

    try:
        items = page.locator(
            "[class*='alternative'] [class*='part'], "
            "[class*='replacement'] [class*='part'], "
            "[id*='alternative'] td, "
            "[id*='replacement'] td, "
            "table[class*='alternative'] td, "
            "table[class*='replacement'] td"
        ).all()
        for it in items:
            t = it.inner_text().strip()
            if t and len(t) >= 3 and t not in alternatives:
                alternatives.append(t)
    except Exception:
        pass

    return alternatives


def extract_equipment(page) -> list:
    """Extrae equipment applications."""
    equipment = []

    for sel in [
        "a[href='#applications']",
        "a[href='#equipment']",
        "li a:has-text('Applications')",
        "li a:has-text('Equipment')",
        "button:has-text('Applications')",
    ]:
        try:
            t = page.locator(sel).first
            if t.is_visible(timeout=1200):
                t.click()
                time.sleep(1.5)
                break
        except Exception:
            continue

    click_show_more(page, "[id*='application'], [class*='application'], [id*='equipment'], [class*='equipment']")

    try:
        rows = page.locator(
            "[class*='application'] tr, "
            "[id*='application'] tr, "
            "[class*='equipment'] tr"
        ).all()
        for row in rows:
            cells = row.locator("td").all()
            if cells:
                row_data = [c.inner_text().strip() for c in cells if c.inner_text().strip()]
                if row_data:
                    equipment.append(" | ".join(row_data))
    except Exception:
        pass

    return equipment


def scrape_product(page, part_number: str) -> dict:
    """Visita la página de un producto y extrae toda la información."""
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
        time.sleep(2)
        dismiss_popups(page)

        # Descripción
        for sel in ["h1.product-title", "h1[class*='name']", "h1", ".product-name"]:
            try:
                el = page.locator(sel).first
                if el.is_visible(timeout=800):
                    result["description"] = el.inner_text().strip()
                    break
            except Exception:
                pass

        result["attributes"] = extract_attributes(page)
        result["cross_references"] = extract_cross_refs(page)
        result["alternatives"] = extract_alternatives(page)
        result["equipment"] = extract_equipment(page)

    except PlaywrightTimeout:
        result["error"] = "timeout"
        logging.warning(f"  TIMEOUT: {part_number}")
    except Exception as e:
        result["error"] = str(e)
        logging.warning(f"  ERROR {part_number}: {e}")

    return result


# ── main ───────────────────────────────────────────────────────────────────

def load_progress():
    try:
        with open(PROGRESS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {"done": [], "results": []}


def save_progress(progress):
    with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
        json.dump(progress, f, ensure_ascii=False, indent=2)


def main():
    progress = load_progress()
    done_set = set(progress["done"])
    results = progress["results"]

    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=False, slow_mo=50)
        context = browser.new_context(
            viewport={"width": 1280, "height": 900},
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            ),
        )
        page = context.new_page()

        # ── 1. Recolectar todos los part numbers ──────────────────────────
        if not progress.get("part_numbers"):
            logging.info("=== Recolectando part numbers de la categoría Lube ===")
            part_numbers = collect_product_links(page)
            progress["part_numbers"] = part_numbers
            save_progress(progress)
        else:
            part_numbers = progress["part_numbers"]
            logging.info(f"=== Usando {len(part_numbers)} part numbers guardados ===")

        total = len(part_numbers)

        # ── 2. Scrape de cada producto ────────────────────────────────────
        for idx, pn in enumerate(part_numbers, 1):
            if pn in done_set:
                logging.info(f"[{idx}/{total}] {pn} — ya procesado, omitiendo")
                continue

            logging.info(f"[{idx}/{total}] Scraping {pn} …")
            data = scrape_product(page, pn)

            n_attrs = len(data["attributes"])
            n_cross = len(data["cross_references"])
            n_equip = len(data["equipment"])
            status = "✅" if not data["error"] else "❌"

            n_alts = len(data["alternatives"])
            logging.info(
                f"  {status} {pn} → {n_attrs} Atrib | {n_cross} Cross | {n_alts} Alt | {n_equip} Equip"
            )

            results.append(data)
            done_set.add(pn)
            progress["done"] = list(done_set)
            progress["results"] = results

            # Guardar progreso cada 5 productos
            if idx % 5 == 0:
                save_progress(progress)
                logging.info(f"  [Progreso guardado — {idx}/{total}]")

            rand_sleep()

        browser.close()

    # ── 3. Guardar resultado final ────────────────────────────────────────
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    logging.info(f"\n=== COMPLETADO ===")
    logging.info(f"Productos: {len(results)}")
    logging.info(f"Archivo:   {OUTPUT_FILE}")

    ok = sum(1 for r in results if not r["error"])
    err = len(results) - ok
    logging.info(f"Exitosos:  {ok} | Errores: {err}")


if __name__ == "__main__":
    main()
