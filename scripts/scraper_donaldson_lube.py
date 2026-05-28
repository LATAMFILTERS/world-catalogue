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

# Forzar inglés en la URL para evitar redirección a es-us
CATEGORY_URL = (
    "https://shop.donaldson.com/store/en-us/search"
    "?N=426772457&Nr=product.language%3AEnglish&catNav=true&st=parts"
)
PRODUCT_BASE  = "https://shop.donaldson.com/store/en-us/product/"
OUTPUT_FILE   = "donaldson_lube_results.json"
PROGRESS_FILE = "donaldson_lube_progress.json"
PROFILE_DIR   = os.path.join(os.path.expanduser("~"), ".donaldson_profile")

SHOW_MORE_LIMIT = 80
PAUSE_BETWEEN   = (5, 10)

# Nombres EXACTOS de tabs en Donaldson (verificados en producto real)
TAB_KEYWORDS = {
    "specs":  ["Attributes"],
    "alt":    ["Alternate Parts"],
    "cross":  ["Cross Reference"],
    "equip":  ["Equipment"],
}


# ── utilidades ─────────────────────────────────────────────────────────────

def rand_sleep(lo=None, hi=None):
    lo, hi = (lo, hi) if lo else PAUSE_BETWEEN
    time.sleep(random.uniform(lo, hi))


def dismiss_popups(page):
    # Cerrar modal de región/idioma de Donaldson (aparece en primera visita)
    # Primero intentar la X del modal
    try:
        page.keyboard.press("Escape")
        time.sleep(0.5)
    except Exception:
        pass

    for sel in [
        # Modal región Donaldson — botón X
        "button.modal__close",
        "button[class*='close'][class*='modal']",
        "[class*='region'] button[class*='close']",
        "[class*='region-selector'] button",
        "button[aria-label='Close']",
        "[data-dismiss='modal']",
        # Cookies
        "button#onetrust-accept-btn-handler",
        "button:has-text('Accept All')",
        "button:has-text('Accept')",
        "button:has-text('Aceptar')",
        "button.close",
        ".modal-close",
    ]:
        try:
            btn = page.locator(sel).first
            if btn.is_visible(timeout=800):
                btn.click()
                time.sleep(0.6)
        except Exception:
            pass

    # Si aún hay overlay, hacer clic fuera del modal
    try:
        overlay = page.locator("[class*='overlay']:visible, [class*='backdrop']:visible").first
        if overlay.is_visible(timeout=500):
            page.mouse.click(10, 10)
            time.sleep(0.5)
    except Exception:
        pass


def click_tab_by_keywords(page, keywords: list) -> bool:
    """Clic en tab con texto EXACTO — evita matches en nav global."""
    js = """(keywords) => {
        // Buscar todos los <a> y <button> visibles
        const candidates = Array.from(document.querySelectorAll('a, button, li > a'));
        for (const kw of keywords) {
            const match = candidates.find(el => {
                if (!el.offsetParent) return false;
                // Texto limpio del elemento (colapsando espacios)
                const txt = el.textContent.trim().replace(/\\s+/g, ' ');
                // Match EXACTO (no contains) para evitar "Attribute Search" etc.
                return txt === kw;
            });
            if (match) {
                match.scrollIntoView({behavior:'instant', block:'center'});
                match.click();
                return match.textContent.trim().replace(/\\s+/g,' ');
            }
        }
        return null;
    }"""
    try:
        result = page.evaluate(js, keywords)
        if result:
            logging.info(f"    Tab '{result}' clickeado")
            time.sleep(2.5)
            return True
        else:
            logging.info(f"    Tab '{keywords[0]}' no existe en este producto")
    except Exception as e:
        logging.warning(f"    Tab error: {e}")
    return False


def click_show_more_smart(page, max_clicks=SHOW_MORE_LIMIT):
    """Expande 'Show More', '+' y botones de expansión detectando progreso real."""
    clicks = 0
    prev_count = -1

    while clicks < max_clicks:
        # Busca botones de expandir: texto Show More / + / flechas / íconos expand
        js = """() => {
            const candidates = Array.from(document.querySelectorAll('button, a, span, div'));
            const expandBtn = candidates.find(el => {
                if (!el.offsetParent) return false;
                const txt = el.textContent.trim().toLowerCase();
                const cls = (el.className || '').toLowerCase();
                const aria = (el.getAttribute('aria-label') || '').toLowerCase();
                return (
                    txt === 'show more' ||
                    txt === 'mostrar más' ||
                    txt === 'ver más' ||
                    txt === 'load more' ||
                    txt === '+' ||
                    txt === 'more' ||
                    txt === 'expand' ||
                    cls.includes('show-more') ||
                    cls.includes('load-more') ||
                    cls.includes('expand') ||
                    cls.includes('more-btn') ||
                    aria.includes('show more') ||
                    aria.includes('expand') ||
                    (el.tagName === 'BUTTON' && /^\\+\\s*\\d+/.test(txt))
                );
            });
            if (expandBtn) {
                expandBtn.scrollIntoView({behavior:'instant', block:'center'});
                expandBtn.click();
                return expandBtn.textContent.trim().substring(0, 40);
            }
            return null;
        }"""
        try:
            clicked = page.evaluate(js)
            if not clicked:
                break
            logging.info(f"    Expandido: {clicked!r}")
            clicks += 1
            time.sleep(1.8)
            current = page.locator("tr, li").count()
            if current == prev_count:
                logging.warning("    Sin cambios tras expandir — deteniendo")
                break
            prev_count = current
        except Exception:
            break

    return clicks


# ── colección de links de categoría ────────────────────────────────────────

def collect_product_links(page):
    """Navega la categoría Lube y devuelve todos los part numbers."""
    page.goto(CATEGORY_URL, timeout=60000, wait_until="networkidle")
    time.sleep(4)
    dismiss_popups(page)

    part_numbers = []
    page_num = 1

    while True:
        logging.info(f"  Página {page_num} …")
        try:
            page.wait_for_load_state("networkidle", timeout=20000)
        except Exception:
            pass

        # Extraer part numbers vía JS — más robusto que selectores CSS
        pns = page.evaluate("""() => {
            const anchors = Array.from(document.querySelectorAll('a[href*="/product/"]'));
            return anchors.map(a => {
                const href = a.getAttribute('href') || '';
                const part = href.split('/product/').pop().split('?')[0].split('/')[0].trim().toUpperCase();
                return part;
            }).filter(p => p.length >= 4 && !p.includes(' '));
        }""")

        added = 0
        for pn in pns:
            if pn not in part_numbers:
                part_numbers.append(pn)
                added += 1

        logging.info(f"    +{added} nuevos (total {len(part_numbers)})")

        # Siguiente página — buscar en inglés y español
        next_clicked = page.evaluate("""() => {
            const btns = Array.from(document.querySelectorAll('a, button'));
            const nxt = btns.find(b =>
                b.offsetParent !== null && (
                    b.getAttribute('aria-label') === 'Next page' ||
                    b.textContent.trim() === 'Next' ||
                    b.textContent.trim() === 'Siguiente' ||
                    b.classList.contains('next-page') ||
                    (b.parentElement && b.parentElement.classList.contains('next'))
                )
            );
            if (nxt) { nxt.click(); return true; }
            return false;
        }""")

        if not next_clicked:
            logging.info("  No hay más páginas")
            break
        page_num += 1
        rand_sleep(2, 5)

    logging.info(f"Total part numbers: {len(part_numbers)}")
    return part_numbers


# ── extracción genérica de tablas ───────────────────────────────────────────

def extract_all_tables(page) -> list:
    """Extrae TODAS las filas de TODAS las tablas visibles en la página."""
    return page.evaluate("""() => {
        const rows = [];
        document.querySelectorAll('table tr').forEach(tr => {
            const cells = Array.from(tr.querySelectorAll('td, th'))
                              .map(c => c.textContent.trim())
                              .filter(t => t.length > 0);
            if (cells.length >= 1) rows.push(cells);
        });
        return rows;
    }""")


def extract_attributes(page) -> dict:
    click_tab_by_keywords(page, TAB_KEYWORDS["specs"])
    time.sleep(1)
    attrs = {}
    # dl dt/dd
    try:
        data = page.evaluate("""() => {
            const result = {};
            document.querySelectorAll('dl').forEach(dl => {
                const dts = Array.from(dl.querySelectorAll('dt'));
                const dds = Array.from(dl.querySelectorAll('dd'));
                dts.forEach((dt, i) => {
                    const k = dt.textContent.trim();
                    const v = dds[i] ? dds[i].textContent.trim() : '';
                    if (k) result[k] = v;
                });
            });
            return result;
        }""")
        attrs.update(data)
    except Exception:
        pass
    # table rows (key=col1, value=col2)
    if not attrs:
        try:
            rows = extract_all_tables(page)
            for row in rows:
                if len(row) >= 2:
                    attrs[row[0]] = row[1]
        except Exception:
            pass
    return attrs


def extract_cross_refs(page) -> list:
    click_tab_by_keywords(page, TAB_KEYWORDS["cross"])
    click_show_more_smart(page)
    try:
        rows = extract_all_tables(page)
        # Los cross-refs suelen tener columnas: BrandCode | BrandName | Type
        codes = []
        for row in rows:
            for cell in row:
                # Código válido: 3-20 chars, no es solo números, no es URL
                if 3 <= len(cell) <= 25 and not cell.startswith("http") and cell not in codes:
                    codes.append(cell)
        return codes[:500]
    except Exception:
        return []


def extract_alternatives(page) -> list:
    click_tab_by_keywords(page, TAB_KEYWORDS["alt"])
    click_show_more_smart(page)
    try:
        rows = extract_all_tables(page)
        alts = []
        for row in rows:
            line = " | ".join(row)
            if line and line not in alts:
                alts.append(line)
        return alts[:200]
    except Exception:
        return []


def extract_equipment(page) -> list:
    click_tab_by_keywords(page, TAB_KEYWORDS["equip"])
    click_show_more_smart(page)
    try:
        rows = extract_all_tables(page)
        equip = []
        for row in rows:
            if len(row) >= 2:
                line = " | ".join(row)
                if line and line not in equip:
                    equip.append(line)
        return equip[:5000]
    except Exception:
        return []


# ── scrape por producto ─────────────────────────────────────────────────────

def scrape_product(page, part_number: str) -> dict:
    url = f"{PRODUCT_BASE}{part_number}"
    result = {
        "part_number": part_number,
        "url": url,
        "description": "",
        "attributes": {},
        "cross_references": [],
        "alternatives": [],
        "equipment": [],
        "scraped_at": datetime.now().isoformat(),
        "error": None,
    }
    try:
        page.goto(url, timeout=50000, wait_until="domcontentloaded")
        time.sleep(3)
        dismiss_popups(page)

        # Descripción
        desc = page.evaluate("""() => {
            const h = document.querySelector('h1');
            return h ? h.textContent.trim() : '';
        }""")
        result["description"] = desc

        result["attributes"]       = extract_attributes(page)
        result["cross_references"] = extract_cross_refs(page)
        result["alternatives"]     = extract_alternatives(page)
        result["equipment"]        = extract_equipment(page)

    except PlaywrightTimeout:
        result["error"] = "timeout"
        logging.warning(f"  TIMEOUT: {part_number}")
    except Exception as e:
        result["error"] = str(e)
        logging.warning(f"  ERROR {part_number}: {e}")

    return result


# ── progreso ────────────────────────────────────────────────────────────────

def load_progress():
    try:
        with open(PROGRESS_FILE, encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {"done": [], "results": [], "part_numbers": []}


def save_progress(p):
    with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
        json.dump(p, f, ensure_ascii=False, indent=2)


# ── main ────────────────────────────────────────────────────────────────────

def main():
    progress = load_progress()
    done_set = set(progress["done"])
    results  = progress["results"]

    with sync_playwright() as pw:
        logging.info(f"Stealth: {'SI' if STEALTH else 'NO'}")
        logging.info(f"Perfil: {PROFILE_DIR}")

        context = pw.chromium.launch_persistent_context(
            user_data_dir=PROFILE_DIR,
            channel="chrome",
            headless=False,
            slow_mo=60,
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

        # 1. Recolectar part numbers
        if not progress["part_numbers"]:
            logging.info("=== Recolectando 440 part numbers ===")
            pns = collect_product_links(page)
            progress["part_numbers"] = pns
            save_progress(progress)
        else:
            pns = progress["part_numbers"]
            logging.info(f"=== {len(pns)} part numbers en progreso ===")

        total = len(pns)

        # 2. Scrape por producto
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
