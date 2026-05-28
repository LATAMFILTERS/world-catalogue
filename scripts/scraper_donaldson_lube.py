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


def click_show_more_in_section(page, max_clicks=SHOW_MORE_LIMIT):
    """Pulsa 'Show More' repetidamente hasta agotar. Detecta loop por conteo de filas."""
    clicks = 0
    prev_count = -1
    while clicks < max_clicks:
        js = """() => {
            const all = Array.from(document.querySelectorAll('button, a'));
            const btn = all.find(el => {
                if (!el.offsetParent) return false;
                const t = el.textContent.trim().replace(/\\s+/g,' ');
                return t === 'Show More' || t === 'Mostrar más' || t === 'Ver más' || t === 'Load More';
            });
            if (btn) { btn.scrollIntoView({behavior:'instant',block:'center'}); btn.click(); return true; }
            return false;
        }"""
        try:
            clicked = page.evaluate(js)
            if not clicked:
                break
            clicks += 1
            time.sleep(2)
            current = page.locator("tr, li, [class*='row']").count()
            if current == prev_count:
                break
            prev_count = current
        except Exception:
            break
    if clicks:
        logging.info(f"    Show More: {clicks} clic(s)")
    return clicks


def expand_plus_buttons(page):
    """Pulsa TODOS los botones '+' visibles en la sección activa (Cross Reference)."""
    expanded = page.evaluate("""() => {
        let count = 0;
        const btns = Array.from(document.querySelectorAll('button, a, span'));
        btns.forEach(el => {
            if (!el.offsetParent) return;
            const t = el.textContent.trim();
            // "+" solo, o "+ 5" (número de sub-items ocultos)
            if (t === '+' || /^\\+\\s*\\d+$/.test(t)) {
                el.click();
                count++;
            }
        });
        return count;
    }""")
    if expanded:
        logging.info(f"    '+' botones expandidos: {expanded}")
        time.sleep(1.5)


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


def click_btn_by_id(page, btn_id: str, max_clicks: int = SHOW_MORE_LIMIT) -> int:
    """Pulsa un botón por su ID hasta que desaparece o no hay progreso."""
    clicks = 0
    prev_count = -1
    while clicks < max_clicks:
        js = f"""() => {{
            const btn = document.getElementById('{btn_id}');
            if (btn && btn.style.display !== 'none' && btn.offsetParent !== null) {{
                btn.scrollIntoView({{behavior:'instant',block:'center'}});
                btn.click();
                return true;
            }}
            return false;
        }}"""
        if not page.evaluate(js):
            break
        clicks += 1
        time.sleep(2)
        cur = page.locator("tr").count()
        if cur == prev_count:
            break
        prev_count = cur
    if clicks:
        logging.info(f"    [{btn_id}] pulsado {clicks}x")
    return clicks


def expand_cross_ref_plus_icons(page):
    """Expande todas las filas childRows pulsando iconos fa-plus en crossreferenceBody."""
    n = page.evaluate("""() => {
        let count = 0;
        document.querySelectorAll('#crossreferenceBody .fa-plus').forEach(icon => {
            icon.click();
            count++;
        });
        return count;
    }""")
    if n:
        logging.info(f"    fa-plus expandidos: {n}")
        time.sleep(1)


# ── extracción por sección ──────────────────────────────────────────────────

def extract_attributes(page) -> dict:
    """#attributesBody — tabla de specs, Show More revela filas ocultas."""
    click_btn_by_id(page, "showMoreProductSpecsButton", max_clicks=5)
    try:
        return page.evaluate("""() => {
            const attrs = {};
            const body = document.getElementById('attributesBody');
            if (!body) return attrs;
            body.querySelectorAll('table tr').forEach(tr => {
                const cells = tr.querySelectorAll('td');
                if (cells.length >= 2) {
                    const k = cells[0].textContent.trim();
                    const v = cells[1].textContent.trim();
                    if (k && !k.includes('Proposition 65') && !k.includes('WARNING'))
                        attrs[k] = v;
                }
            });
            return attrs;
        }""")
    except Exception:
        return {}


def extract_cross_refs(page) -> list:
    """#crossreferenceBody — OEM codes: Show More + expand fa-plus child rows."""
    body = page.evaluate("() => !!document.getElementById('crossreferenceBody')")
    if not body:
        return []

    # Ciclo: Show More → expand fa-plus → repetir
    for _ in range(60):
        showed = click_btn_by_id(page, "showAllCrossReferenceListButton", max_clicks=1)
        expand_cross_ref_plus_icons(page)
        if not showed:
            break

    try:
        return page.evaluate("""() => {
            const results = [];
            const body = document.getElementById('crossreferenceBody');
            if (!body) return results;
            body.querySelectorAll('tr').forEach(tr => {
                const mfr_td = tr.querySelector('td[data-manufacturer]');
                const pn_td  = tr.querySelector('td[data-manufacturepartnumber] span');
                if (!mfr_td || !pn_td) return;
                const mfr = mfr_td.textContent.replace(/[\\n\\t]/g,'').trim()
                                  .replace(/^[\\s\\u00a0]+/,'');
                const pn  = pn_td.textContent.trim();
                if (mfr && pn && pn !== '-') {
                    results.push({ manufacturer: mfr, part_number: pn });
                }
            });
            return results;
        }""")
    except Exception:
        return []


def extract_alternatives(page) -> list:
    """#alternateBody — carousel de partes alternativas Donaldson."""
    try:
        return page.evaluate("""() => {
            const results = [];
            const body = document.getElementById('alternateBody');
            if (!body) return results;
            body.querySelectorAll('.preAlternate h5, .preAlternate h4').forEach(el => {
                const pn = el.textContent.trim();
                if (pn && !results.includes(pn)) results.push(pn);
            });
            return results;
        }""")
    except Exception:
        return []


def extract_equipment(page) -> list:
    """#equiptmentBody — equipment applications. Show More hasta agotar."""
    body = page.evaluate("() => !!document.getElementById('equiptmentBody')")
    if not body:
        return []

    for _ in range(200):
        if not click_btn_by_id(page, "showMorePdpListButton", max_clicks=1):
            break

    try:
        return page.evaluate("""() => {
            const results = [];
            const body = document.getElementById('equiptmentBody');
            if (!body) return results;
            body.querySelectorAll('tr').forEach(tr => {
                const eq  = tr.querySelector('td[data-equipment]');
                if (!eq) return;
                const yr  = tr.querySelector('td[data-year]');
                const typ = tr.querySelector('td[data-type] span');
                const opt = tr.querySelector('td[data-options] span');
                const eng = tr.querySelector('td[data-engine] span');
                const eo  = tr.querySelector('td[data-enginetypes] span');
                results.push({
                    equipment:     eq.textContent.trim(),
                    year:          yr  ? yr.textContent.trim()  : '',
                    type:          typ ? typ.textContent.trim() : '',
                    options:       opt ? opt.textContent.trim() : '',
                    engine:        eng ? eng.textContent.trim() : '',
                    engine_option: eo  ? eo.textContent.trim()  : '',
                });
            });
            return results;
        }""")
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
        # networkidle espera a que JavaScript termine de renderizar las secciones
        page.goto(url, timeout=60000, wait_until="networkidle")
        time.sleep(2)
        dismiss_popups(page)

        # Esperar explícitamente a que #attributesBody aparezca en el DOM
        try:
            page.wait_for_selector("#attributesBody", timeout=10000)
        except Exception:
            logging.warning(f"  #attributesBody no apareció en {part_number}")

        # Descripción desde el subtítulo real del producto
        desc = page.evaluate("""() => {
            const sub = document.querySelector('.prodSubTitleMob, .prodSubTitle, h1');
            return sub ? sub.textContent.trim() : '';
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
