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
    """Navega la categoría Lube y devuelve paths completos (PART/SKUID)."""
    page.goto(CATEGORY_URL, timeout=60000, wait_until="networkidle")
    time.sleep(4)
    dismiss_popups(page)

    seen_parts = set()
    product_paths = []   # "DBL7900/11907" — path completo para URL correcta
    page_num = 1

    while True:
        logging.info(f"  Página {page_num} …")
        try:
            page.wait_for_load_state("networkidle", timeout=20000)
        except Exception:
            pass

        # Guardar path completo (PART/SKUID) para evitar redireccionamiento incorrecto
        paths = page.evaluate("""() => {
            const anchors = Array.from(document.querySelectorAll('a[href*="/product/"]'));
            return anchors.map(a => {
                const href = a.getAttribute('href') || '';
                // Extrae todo después de /product/ (ej. "DBL7900/11907")
                const path = href.split('/product/').pop().split('?')[0].trim().toUpperCase();
                return path;
            }).filter(p => p.length >= 4 && !p.includes(' ') && p.includes('/'));
        }""")

        added = 0
        for path in paths:
            part = path.split('/')[0]  # "DBL7900" — solo para deduplicar
            if part not in seen_parts:
                seen_parts.add(part)
                product_paths.append(path)
                added += 1

        logging.info(f"    +{added} nuevos (total {len(product_paths)})")

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

    logging.info(f"Total productos: {len(product_paths)}")
    return product_paths


def click_btn_by_id(page, btn_id: str, max_clicks: int = SHOW_MORE_LIMIT) -> int:
    """Pulsa botón por ID. Espera hasta 5s para que el AJAX lo haga visible."""
    clicks = 0
    prev_rows = -1
    loc = page.locator(f"#{btn_id}")
    while clicks < max_clicks:
        try:
            # 5s de espera: el AJAX puede tardar más que 1.5s
            if not loc.is_visible(timeout=5000):
                break
            loc.scroll_into_view_if_needed(timeout=3000)
            loc.click(timeout=5000)
            clicks += 1
            # Esperar a que el contenido nuevo cargue
            try:
                page.wait_for_load_state("networkidle", timeout=8000)
            except Exception:
                time.sleep(3)
            cur_rows = page.locator("tr").count()
            if cur_rows == prev_rows:
                break
            prev_rows = cur_rows
        except Exception:
            break
    if clicks:
        logging.info(f"    [{btn_id}] pulsado {clicks}x")
    return clicks


def expand_cross_ref_plus_icons(page):
    """Expande filas childRows: hace clic en cada fa-plus visible en crossreferenceBody."""
    # Clic en todos los + visibles usando Playwright locator (más fiable)
    icons = page.locator("#crossreferenceBody .fa-plus")
    total = 0
    try:
        count = icons.count()
        for i in range(count):
            try:
                ic = icons.nth(i)
                if ic.is_visible(timeout=800):
                    ic.scroll_into_view_if_needed(timeout=1000)
                    ic.click(timeout=2000)
                    total += 1
                    time.sleep(0.4)
            except Exception:
                pass
    except Exception:
        pass
    if total:
        logging.info(f"    fa-plus expandidos: {total}")
        time.sleep(1)


# ── extracción por sección ──────────────────────────────────────────────────

def _find_section_body(page, primary_id: str, tab_label: str):
    """Devuelve el elemento contenedor: primero por ID estándar, luego por href del tab."""
    return page.evaluate(f"""() => {{
        // 1. ID estándar
        let el = document.getElementById('{primary_id}');
        if (el && el.querySelectorAll('td, li, img').length > 0) return el;

        // 2. Buscar tab por texto → leer su href → obtener contenedor real
        const tabs = Array.from(document.querySelectorAll(
            '[data-toggle="tab"], .nav-tabs a, .nav a, [role="tab"]'
        ));
        const tab = tabs.find(t => t.textContent.trim() === '{tab_label}');
        if (tab) {{
            const href = tab.getAttribute('href') || tab.getAttribute('data-target') || '';
            const id   = href.replace('#', '');
            if (id) el = document.getElementById(id);
        }}
        return el || null;
    }}""")


def extract_attributes(page) -> dict:
    """Attributes table — Show More para filas ocultas."""
    click_btn_by_id(page, "showMoreProductSpecsButton", max_clicks=5)
    try:
        return page.evaluate("""() => {
            const attrs = {};
            // Primary ID
            let body = document.getElementById('attributesBody');
            // Fallback 1: via tab href
            if (!body || body.querySelectorAll('td').length === 0) {
                const tabs = Array.from(document.querySelectorAll(
                    '[data-toggle="tab"], .nav-tabs a, .nav a, [role="tab"], a'
                ));
                const tab = tabs.find(t => t.textContent.trim() === 'Attributes');
                if (tab) {
                    const href = (tab.getAttribute('href') || tab.getAttribute('data-target') || '').replace('#','');
                    if (href) body = document.getElementById(href);
                }
            }
            // Fallback 2: por heading H2/H3 "Attributes" → tabla hermana
            if (!body || body.querySelectorAll('td').length === 0) {
                const hdgs = Array.from(document.querySelectorAll('h2, h3, h4'));
                const h = hdgs.find(el => el.textContent.trim() === 'Attributes');
                if (h) {
                    let node = h.nextElementSibling;
                    for (let i = 0; i < 8 && node; i++) {
                        if (node.querySelectorAll('table tr td').length > 0) { body = node; break; }
                        node = node.nextElementSibling;
                    }
                    if (!body || body.querySelectorAll('td').length === 0)
                        body = h.parentElement;
                }
            }
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


def _get_body_id(page, primary_id: str, tab_label: str) -> str:
    """Devuelve el ID real del contenedor: primero primary_id, luego el href del tab."""
    return page.evaluate(f"""() => {{
        const el = document.getElementById('{primary_id}');
        if (el) return '{primary_id}';
        const tabs = Array.from(document.querySelectorAll(
            '[data-toggle="tab"], .nav-tabs a, .nav a, [role="tab"]'
        ));
        const tab = tabs.find(t => t.textContent.trim() === '{tab_label}');
        if (tab) {{
            const href = (tab.getAttribute('href') || tab.getAttribute('data-target') || '').replace('#','');
            if (href && document.getElementById(href)) return href;
        }}
        return '';
    }}""")


def extract_cross_refs(page) -> list:
    """Cross Reference — OEM codes: Show More + expand fa-plus child rows."""
    body_id = _get_body_id(page, 'crossreferenceBody', 'Cross Reference')
    if not body_id:
        return []

    # Expandir + icons de la carga inicial (ya visibles sin Show More)
    expand_cross_ref_plus_icons(page)

    # Ciclo Show More: cargar más fabricantes → expandir sus + icons
    for _ in range(60):
        showed = click_btn_by_id(page, "showAllCrossReferenceListButton", max_clicks=1)
        if not showed:
            break
        expand_cross_ref_plus_icons(page)

    try:
        return page.evaluate(f"""() => {{
            const results = [];
            const body = document.getElementById('{body_id}');
            if (!body) return results;
            body.querySelectorAll('tr').forEach(tr => {{
                const mfr_td = tr.querySelector('td[data-manufacturer]');
                const pn_td  = tr.querySelector('td[data-manufacturepartnumber] span');
                if (!mfr_td || !pn_td) return;
                const mfr = mfr_td.textContent.replace(/[\\n\\t]/g,'').trim()
                                  .replace(/^[\\s\\u00a0]+/,'');
                const pn  = pn_td.textContent.trim();
                if (mfr && pn && pn !== '-') {{
                    results.push({{ manufacturer: mfr, part_number: pn }});
                }}
            }});
            return results;
        }}""")
    except Exception:
        return []


def extract_alternatives(page) -> list:
    """Carousel partes alternativas. data-partnumber es el selector más fiable."""
    try:
        return page.evaluate("""() => {
            const results = [];

            // Buscar contenedor: ID estándar o via tab href
            let body = document.getElementById('alternateBody');
            if (!body || body.querySelectorAll('[data-partnumber]').length === 0) {
                const tabs = Array.from(document.querySelectorAll(
                    '[data-toggle="tab"], .nav-tabs a, .nav a, [role="tab"]'
                ));
                const tab = tabs.find(t => t.textContent.trim() === 'Alternate Parts');
                if (tab) {
                    const href = (tab.getAttribute('href') || tab.getAttribute('data-target') || '').replace('#','');
                    if (href) body = document.getElementById(href);
                }
            }

            const scope = body || document;
            scope.querySelectorAll('[data-partnumber]').forEach(el => {
                const pn = el.getAttribute('data-partnumber').trim().toUpperCase();
                if (pn && !results.includes(pn)) results.push(pn);
            });
            if (results.length === 0) {
                scope.querySelectorAll('.preAlternate h5, .preAlternate h4').forEach(el => {
                    const pn = el.textContent.trim().toUpperCase();
                    if (pn && !results.includes(pn)) results.push(pn);
                });
            }
            return results;
        }""")
    except Exception:
        return []


def extract_equipment(page) -> list:
    """Equipment applications. Show More hasta agotar."""
    body_id = _get_body_id(page, 'equiptmentBody', 'Equipment')
    if not body_id:
        return []

    for _ in range(200):
        if not click_btn_by_id(page, "showMorePdpListButton", max_clicks=1):
            break

    try:
        return page.evaluate(f"""() => {{
            const results = [];
            const body = document.getElementById('{body_id}');
            if (!body) return results;
            body.querySelectorAll('tr').forEach(tr => {{
                const eq  = tr.querySelector('td[data-equipment]');
                if (!eq) return;
                const yr  = tr.querySelector('td[data-year]');
                const typ = tr.querySelector('td[data-type] span');
                const opt = tr.querySelector('td[data-options] span');
                const eng = tr.querySelector('td[data-engine] span');
                const eo  = tr.querySelector('td[data-enginetypes] span');
                results.push({{
                    equipment:     eq.textContent.trim(),
                    year:          yr  ? yr.textContent.trim()  : '',
                    type:          typ ? typ.textContent.trim() : '',
                    options:       opt ? opt.textContent.trim() : '',
                    engine:        eng ? eng.textContent.trim() : '',
                    engine_option: eo  ? eo.textContent.trim()  : '',
                }});
            }});
            return results;
        }}""")
    except Exception:
        return []


# ── scrape por producto ─────────────────────────────────────────────────────

_TAB_LABELS = {
    "attributesBody":     ["Attributes"],
    "crossreferenceBody": ["Cross Reference"],
    "equiptmentBody":     ["Equipment"],
    "alternateBody":      ["Alternate Parts"],
}


def click_tab(page, section_id: str) -> bool:
    """Activa tab por href/data-target; fallback por texto exacto en nav."""
    # ── Método 1: selector por atributo ──────────────────────────────────
    method = page.evaluate(f"""() => {{
        const t = document.querySelector(
            'a[href="#{section_id}"], a[data-target="#{section_id}"], [data-target="#{section_id}"]'
        );
        if (t) {{ t.scrollIntoView({{behavior:'instant',block:'center'}}); t.click(); return 'href'; }}
        return null;
    }}""")

    # ── Método 2: data-toggle="tab" con texto exacto (Bootstrap cualquier clase) ──
    if not method:
        for label in _TAB_LABELS.get(section_id, []):
            method = page.evaluate(f"""() => {{
                const tabs = Array.from(document.querySelectorAll(
                    '[data-toggle="tab"], .nav-tabs a, .nav a, [role="tab"]'
                ));
                const t = tabs.find(el => el.textContent.trim() === '{label}');
                if (t) {{ t.scrollIntoView({{behavior:'instant',block:'center'}}); t.click(); return 'text'; }}
                return null;
            }}""")
            if method:
                break

    # ── Método 3: cualquier <a> o <li>/<button> visible con texto exacto ────
    if not method:
        for label in _TAB_LABELS.get(section_id, []):
            method = page.evaluate(f"""() => {{
                const all = Array.from(document.querySelectorAll('a, button, li'));
                const t = all.find(el =>
                    el.offsetParent !== null &&
                    el.textContent.trim() === '{label}'
                );
                if (t) {{ t.scrollIntoView({{behavior:'instant',block:'center'}}); t.click(); return 'any'; }}
                return null;
            }}""")
            if method:
                break

    if method:
        logging.info(f"    Tab #{section_id} activado ({method})")
        time.sleep(3)   # más pausa para AJAX tras clic de tab
    else:
        logging.warning(f"    Tab #{section_id} NO encontrado — sección puede estar ausente")
    return bool(method)


def scrape_product(page, product_path: str) -> dict:
    """
    product_path: "DBL7900/11907" — path completo con SKU para URL exacta.
    Si se pasa solo "DBL7900" (progreso antiguo) también funciona vía redirect.
    """
    part_number = product_path.split('/')[0].upper()
    url = f"{PRODUCT_BASE}{product_path}"
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
        page.goto(url, timeout=90000, wait_until="networkidle")
        time.sleep(2)
        dismiss_popups(page)

        # Descripción del producto (siempre visible en header)
        desc = page.evaluate("""() => {
            for (const sel of ['.prodSubTitleMob', '.prodSubTitle', 'h6.product-description',
                               '.product-title h6', 'h6']) {
                const el = document.querySelector(sel);
                if (el && el.textContent.trim()) return el.textContent.trim();
            }
            return '';
        }""")
        result["description"] = desc

        # ── ALTERNATE PARTS (tab activo por defecto, ya cargado) ──────────
        result["alternatives"] = extract_alternatives(page)

        # ── ATTRIBUTES (clic tab → carga AJAX → extraer) ──────────────────
        click_tab(page, "attributesBody")
        result["attributes"] = extract_attributes(page)

        # ── CROSS REFERENCE ───────────────────────────────────────────────
        click_tab(page, "crossreferenceBody")
        result["cross_references"] = extract_cross_refs(page)

        # ── EQUIPMENT ─────────────────────────────────────────────────────
        click_tab(page, "equiptmentBody")   # typo intencional de Donaldson
        result["equipment"] = extract_equipment(page)

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

        # 1. Recolectar product paths (PART/SKUID)
        if not progress["part_numbers"]:
            logging.info("=== Recolectando product paths ===")
            paths = collect_product_links(page)
            progress["part_numbers"] = paths
            save_progress(progress)
        else:
            paths = progress["part_numbers"]
            logging.info(f"=== {len(paths)} paths en progreso ===")

        total = len(paths)

        # 2. Scrape por producto
        for idx, product_path in enumerate(paths, 1):
            part = product_path.split('/')[0].upper()

            if part in done_set:
                logging.info(f"[{idx}/{total}] {part} ya procesado")
                continue

            logging.info(f"[{idx}/{total}] {part} …")
            data = scrape_product(page, product_path)

            na = len(data["attributes"])
            nc = len(data["cross_references"])
            nl = len(data["alternatives"])
            ne = len(data["equipment"])
            st = "✅" if not data["error"] else "❌"
            logging.info(f"  {st} {part} → {na} Attr | {nc} Cross | {nl} Alt | {ne} Equip")

            results.append(data)
            done_set.add(part)
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
