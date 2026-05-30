"""
scraper_donaldson_lube.py  —  v4 (nuclear tab-click + verified DOM selectors)
Extrae los 351 filtros Lube de Donaldson: specs, cross-refs, alternativas, equipment.

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
        logging.FileHandler("scraper_donaldson.log", encoding="utf-8"),
        logging.StreamHandler(),
    ],
)

# Categorías conocidas: nombre → URL de búsqueda (N = id de categoría Donaldson)
CATEGORIES = {
    "lube": "https://shop.donaldson.com/store/en-us/search"
            "?N=426772457&Nr=product.language%3AEnglish&catNav=true&st=parts",
    "air":  "https://shop.donaldson.com/store/en-us/search"
            "?N=2975800598&Nr=product.language%3AEnglish&catNav=true&st=parts",
    "hydraulic": "https://shop.donaldson.com/store/en-us/search"
            "?N=2076725065&Nr=product.language%3AEnglish&catNav=true&st=parts",
    "fuel":      "https://shop.donaldson.com/store/en-us/search"
            "?N=626398726&Nr=product.language%3AEnglish&catNav=true&st=parts",
    "air-dryer": "https://shop.donaldson.com/store/en-us/search"
            "?N=2748940002&catNav=true",
    "cabin":      "https://shop.donaldson.com/store/en-us/search"
            "?N=3718375764&Nr=product.language%3AEnglish&catNav=true&st=parts",
    "air-intake": "https://shop.donaldson.com/store/en-us/search"
            "?N=2065132825&Nr=product.language%3AEnglish&catNav=true&st=parts",
}

PRODUCT_BASE  = "https://shop.donaldson.com/store/en-us/product/"
PROFILE_DIR   = os.path.join(os.path.expanduser("~"), ".donaldson_profile")

# Config activa (se fija en runtime vía configure()). Default: lube.
CATEGORY_URL  = CATEGORIES["lube"]
OUTPUT_FILE   = "donaldson_lube_results.json"
PROGRESS_FILE = "donaldson_lube_progress.json"

SHOW_MORE_LIMIT = 80
PAUSE_BETWEEN   = (5, 10)
RECOLLECT       = False   # --recollect: re-pagina y fusiona URLs sin borrar progreso


def configure(name: str, url: str):
    """Fija la categoría activa y los archivos de salida por nombre."""
    global CATEGORY_URL, OUTPUT_FILE, PROGRESS_FILE
    CATEGORY_URL  = url
    OUTPUT_FILE   = f"donaldson_{name}_results.json"
    PROGRESS_FILE = f"donaldson_{name}_progress.json"


# ── helpers ────────────────────────────────────────────────────────────────

def rand_sleep(lo=None, hi=None):
    lo, hi = (lo, hi) if lo else PAUSE_BETWEEN
    time.sleep(random.uniform(lo, hi))


def dismiss_popups(page):
    try:
        page.keyboard.press("Escape")
        time.sleep(0.4)
    except Exception:
        pass
    for sel in [
        "button.modal__close", "button[class*='close'][class*='modal']",
        "[data-dismiss='modal']", "button[aria-label='Close']",
        "button#onetrust-accept-btn-handler",
        "button:has-text('Accept All')", "button:has-text('Accept')",
        "button:has-text('Aceptar')", "button.close",
    ]:
        try:
            btn = page.locator(sel).first
            if btn.is_visible(timeout=600):
                btn.click()
                time.sleep(0.5)
        except Exception:
            pass
    try:
        ov = page.locator("[class*='overlay']:visible,[class*='backdrop']:visible").first
        if ov.is_visible(timeout=400):
            page.mouse.click(10, 10)
            time.sleep(0.4)
    except Exception:
        pass


# ── tab activation ─────────────────────────────────────────────────────────

# Map section-ID → visible tab label text
_SECTION_TO_LABEL = {
    "attributesBody":     "Attributes",
    "crossreferenceBody": "Cross Reference",
    "equiptmentBody":     "Equipment",        # typo intencional Donaldson
    "alternateBody":      "Alternate Parts",
}

def activate_tab(page, section_id: str) -> bool:
    """
    Activa el tab que controla `section_id`.
    Tres métodos en orden de especificidad:
      1. href/data-target apuntando al ID exacto
      2. data-toggle="tab" + data-target (sin href)
      3. Nuclear: cualquier elemento visible cuyo texto sea el label exacto,
         excluyendo los propios contenidos de sección
    Después de clic espera hasta 5 s a que el ID tenga contenido (td / img / tr).
    """
    label = _SECTION_TO_LABEL.get(section_id, "")

    # ── Método 1: atributos que apuntan directamente al ID ─────────────────
    clicked = page.evaluate(f"""() => {{
        const t = document.querySelector(
            'a[href="#{section_id}"], a[data-target="#{section_id}"], [data-target="#{section_id}"]'
        );
        if (t) {{ t.scrollIntoView({{behavior:'instant',block:'center'}}); t.click(); return 'm1'; }}
        return null;
    }}""")

    # ── Método 2: data-toggle="tab" con texto exacto ───────────────────────
    if not clicked and label:
        clicked = page.evaluate(f"""() => {{
            const tabs = Array.from(document.querySelectorAll('[data-toggle="tab"]'));
            const t = tabs.find(el => el.textContent.trim() === '{label}');
            if (t) {{ t.scrollIntoView({{behavior:'instant',block:'center'}}); t.click(); return 'm2'; }}
            return null;
        }}""")

    # ── Método 3: nuclear — cualquier elemento visible con ese texto exacto,
    #    excluyendo los contenedores de sección conocidos ──────────────────
    if not clicked and label:
        # Secciones a excluir para no clickar headings internos
        excl = "#attributesBody,#crossreferenceBody,#equiptmentBody,#alternateBody,.productSpecsSection"
        clicked = page.evaluate(f"""() => {{
            const excl = '{excl}';
            // Recorre TODOS los elementos; encuentra el primero visible con texto exacto
            // que NO esté dentro de una sección de contenido
            for (const el of document.querySelectorAll('*')) {{
                if (!el.offsetParent) continue;                  // oculto
                if (el.children.length > 2) continue;            // contenedor grande
                if (el.textContent.trim() !== '{label}') continue;
                if (el.closest(excl)) continue;                  // dentro de sección
                el.scrollIntoView({{behavior:'instant',block:'center'}});
                el.click();
                return 'm3:' + el.tagName;
            }}
            return null;
        }}""")

    if clicked:
        logging.info(f"    Tab #{section_id} → {clicked}")
        # Esperar hasta 5 s a que la sección tenga contenido real
        try:
            page.wait_for_function(
                f"""() => {{
                    const b = document.getElementById('{section_id}');
                    return b && (b.querySelectorAll('td,tr,img').length > 0);
                }}""",
                timeout=5000
            )
        except Exception:
            time.sleep(2)   # fallback si wait_for_function falla
    else:
        logging.warning(f"    Tab #{section_id} NO encontrado")

    return bool(clicked)


# ── Show More button ────────────────────────────────────────────────────────

def click_show_more(page, btn_id: str, max_clicks: int = SHOW_MORE_LIMIT) -> int:
    """
    Hace clic en un botón por su ID usando Playwright locator.
    Espera hasta 4 s a que sea visible (el AJAX puede tardar).
    Tras cada clic espera networkidle o 3 s.
    Para si el número de filas no cambia (progreso nulo).
    """
    clicks = 0
    prev_rows = -1
    loc = page.locator(f"#{btn_id}")
    while clicks < max_clicks:
        try:
            if not loc.is_visible(timeout=4000):
                break
            loc.scroll_into_view_if_needed(timeout=3000)
            loc.click(timeout=5000)
            clicks += 1
            try:
                page.wait_for_load_state("networkidle", timeout=7000)
            except Exception:
                time.sleep(3)
            cur = page.locator("tr").count()
            if cur == prev_rows:
                break
            prev_rows = cur
        except Exception:
            break
    if clicks:
        logging.info(f"    [{btn_id}] × {clicks}")
    return clicks


# ── Cross Reference: expandir filas "+" ────────────────────────────────────

def expand_cross_plus(page, body_id: str):
    """Expande todos los fa-plus visibles dentro de `body_id`."""
    icons = page.locator(f"#{body_id} .fa-plus")
    total = 0
    try:
        n = icons.count()
        for i in range(n):
            try:
                ic = icons.nth(i)
                if ic.is_visible(timeout=600):
                    ic.scroll_into_view_if_needed(timeout=800)
                    ic.click(timeout=2000)
                    total += 1
                    time.sleep(0.4)
            except Exception:
                pass
    except Exception:
        pass
    if total:
        logging.info(f"    fa-plus × {total}")
        time.sleep(0.8)


# ── colección de links de categoría ────────────────────────────────────────

def _extract_links_from_page(page) -> list:
    """Extrae paths PART/SKUID de los links de producto visibles en el DOM."""
    return page.evaluate("""() => {
        return Array.from(document.querySelectorAll('a[href*="/product/"]'))
            .map(a => {
                const href = a.getAttribute('href') || '';
                const path = href.split('/product/').pop().split('?')[0].trim();
                const i = path.indexOf('/');
                if (i < 0) return path.toUpperCase();
                return path.slice(0, i).toUpperCase() + path.slice(i);
            })
            .filter(p => p.length >= 4 && !p.includes(' ') && p.includes('/'));
    }""")


def collect_product_links(page):
    """
    Recolecta todos los paths PART/SKUID de la categoría.

    Estrategia dual:
    1. URL offset (&No=N): incrementa el offset ATG de 20 en 20.
       Funciona para categorías grandes (hydraulic: 2177, 99 páginas).
    2. Fallback botón "Next": si el offset no avanza, prueba clic UI.

    Para cuando 3 páginas consecutivas devuelvan 0 productos nuevos.
    """
    STEP = 20   # productos por página en Donaldson shop

    # Separar parámetros base del URL para no duplicar &No=
    import urllib.parse
    parsed = urllib.parse.urlparse(CATEGORY_URL)
    params = dict(urllib.parse.parse_qsl(parsed.query))
    params.pop("No", None)   # eliminar offset previo si existe
    base_url = urllib.parse.urlunparse(parsed._replace(
        query=urllib.parse.urlencode(params)))

    seen  = set()
    paths = []
    empty = 0
    offset = 0
    pg = 1

    while True:
        url = base_url + f"&No={offset}"
        logging.info(f"  Página {pg} (No={offset}) …")
        try:
            page.goto(url, timeout=60000, wait_until="domcontentloaded")
        except Exception:
            # Timeout en networkidle: la página cargó pero AJAX sigue activo.
            # domcontentloaded ya garantiza el HTML base con los links de producto.
            pass
        time.sleep(3)
        if pg == 1:
            dismiss_popups(page)

        raw = _extract_links_from_page(page)

        added = 0
        for p in raw:
            part = p.split('/')[0]
            if part not in seen:
                seen.add(part)
                paths.append(p)
                added += 1
        logging.info(f"    +{added} nuevos (total {len(paths)})")

        if added == 0:
            empty += 1
            if empty >= 3:
                logging.info("  3 páginas vacías consecutivas — fin")
                break
        else:
            empty = 0

        offset += STEP
        pg += 1
        rand_sleep(2, 4)

        if pg > 500:   # tope de seguridad
            logging.warning("  Tope 500 páginas — deteniendo")
            break

    logging.info(f"Total productos: {len(paths)}")
    return paths


# ── extracción por sección ──────────────────────────────────────────────────

def _real_body_id(page, primary_id: str, label: str) -> str:
    """
    Devuelve el ID real del contenedor de una sección.
    Usa el ID estándar si existe, si no busca vía href del tab.
    """
    return page.evaluate(f"""() => {{
        if (document.getElementById('{primary_id}')) return '{primary_id}';
        // Buscar tab link por texto → leer su href
        const tabs = Array.from(document.querySelectorAll('[data-toggle="tab"], .nav-tabs a, .nav a'));
        const t = tabs.find(el => el.textContent.trim() === '{label}');
        if (t) {{
            const href = (t.getAttribute('href') || t.getAttribute('data-target') || '').replace('#','');
            if (href && document.getElementById(href)) return href;
        }}
        return '';
    }}""")


def extract_attributes(page) -> dict:
    """
    Extrae specs de #attributesBody.
    - showMoreProductSpecsButton: ya expandido (display:none) si Show Less visible
    - Lee TODAS las tablas dentro del contenedor
    """
    # Solo pulsar si el botón está visible (no si ya muestra "Show Less")
    click_show_more(page, "showMoreProductSpecsButton", max_clicks=5)

    body_id = _real_body_id(page, 'attributesBody', 'Attributes') or 'attributesBody'

    raw = page.evaluate(f"""() => {{
        const attrs = {{}};
        const body  = document.getElementById('{body_id}');
        if (!body) return attrs;
        const tds = body.querySelectorAll('td');
        // Diagnóstico interno: número de td
        const _n = tds.length;
        body.querySelectorAll('table tr').forEach(tr => {{
            const cells = tr.querySelectorAll('td');
            if (cells.length < 2) return;
            const k = cells[0].textContent.trim();
            const v = cells[1].textContent.trim();
            if (k && !k.includes('Proposition 65') && !k.includes('WARNING'))
                attrs[k] = v;
        }});
        return attrs;
    }}""")

    logging.info(f"    attrs: {len(raw)}")
    return raw


def extract_alternatives(page) -> list:
    """
    Partes alternativas. SOLO se LEE el código — nunca se pulsan las tarjetas.
    Selector exclusivo: .compareListProdAlternate (clase única de alternativas),
    código en .preAlternate h5 o en data-partnumber del botón SVG.
    Esta clase NO aparece en Recently Viewed → evita el bug de 14 falsos.
    """
    raw = page.evaluate("""() => {
        const results = [];
        const push = pn => {
            pn = (pn || '').trim().toUpperCase();
            if (pn && !results.includes(pn)) results.push(pn);
        };
        // Tarjetas exclusivas de partes alternativas
        const cards = document.querySelectorAll('.compareListProdAlternate');
        cards.forEach(card => {
            const h = card.querySelector('.preAlternate h5, .preAlternate h4');
            if (h) { push(h.textContent); return; }
            const el = card.querySelector('[data-partnumber]');
            if (el) push(el.getAttribute('data-partnumber'));
        });
        // Fallback: cualquier .preAlternate dentro de #alternateBody
        if (results.length === 0) {
            const scope = document.getElementById('alternateBody');
            if (scope) {
                scope.querySelectorAll('.preAlternate h5, .preAlternate h4')
                     .forEach(el => push(el.textContent));
            }
        }
        return results;
    }""")
    logging.info(f"    alt: {len(raw)}")
    return raw


def extract_cross_refs(page) -> list:
    """
    Cross Reference OEM codes.
    1. Expande fa-plus iniciales
    2. Cicla Show More → expande fa-plus → repite
    3. Lee td[data-manufacturer] + td[data-manufacturepartnumber] span
    """
    body_id = _real_body_id(page, 'crossreferenceBody', 'Cross Reference')
    if not body_id:
        return []

    expand_cross_plus(page, body_id)

    for _ in range(60):
        showed = click_show_more(page, "showAllCrossReferenceListButton", max_clicks=1)
        if not showed:
            break
        expand_cross_plus(page, body_id)

    raw = page.evaluate(f"""() => {{
        const results = [];
        const body = document.getElementById('{body_id}');
        if (!body) return results;
        body.querySelectorAll('tr').forEach(tr => {{
            const mfr_td = tr.querySelector('td[data-manufacturer]');
            const pn_td  = tr.querySelector('td[data-manufacturepartnumber] span');
            if (!mfr_td || !pn_td) return;
            const mfr = mfr_td.textContent.replace(/[\\n\\t]/g,'').trim().replace(/^[\\s\\u00a0]+/,'');
            const pn  = pn_td.textContent.trim();
            if (mfr && pn && pn !== '-') results.push({{ manufacturer: mfr, part_number: pn }});
        }});
        return results;
    }}""")

    logging.info(f"    cross: {len(raw)}")
    return raw


def extract_equipment(page) -> list:
    """
    Equipment applications.
    Show More hasta agotar, luego lee td[data-equipment] y sus columnas.
    """
    body_id = _real_body_id(page, 'equiptmentBody', 'Equipment')
    if not body_id:
        return []

    for _ in range(200):
        if not click_show_more(page, "showMorePdpListButton", max_clicks=1):
            break

    raw = page.evaluate(f"""() => {{
        const results = [];
        const body = document.getElementById('{body_id}');
        if (!body) return results;
        body.querySelectorAll('tr').forEach(tr => {{
            const eq = tr.querySelector('td[data-equipment]');
            if (!eq) return;
            results.push({{
                equipment:     eq.textContent.trim(),
                year:          (tr.querySelector('td[data-year]')?.textContent || '').trim(),
                type:          (tr.querySelector('td[data-type] span')?.textContent || '').trim(),
                options:       (tr.querySelector('td[data-options] span')?.textContent || '').trim(),
                engine:        (tr.querySelector('td[data-engine] span')?.textContent || '').trim(),
                engine_option: (tr.querySelector('td[data-enginetypes] span')?.textContent || '').trim(),
            }});
        }});
        return results;
    }}""")

    logging.info(f"    equip: {len(raw)}")
    return raw


# ── scrape por producto ─────────────────────────────────────────────────────

def scrape_product(page, product_path: str) -> dict:
    """
    product_path: "DBL7900/11907"
    Orden de extracción:
      1. Alternate Parts  (tab activo por defecto → ya en DOM)
      2. Attributes       (activate_tab → AJAX → extract)
      3. Cross Reference  (activate_tab → AJAX → extract)
      4. Equipment        (activate_tab → AJAX → extract)
    """
    part = product_path.split('/')[0].upper()
    url  = f"{PRODUCT_BASE}{product_path}"

    result = {
        "part_number":    part,
        "url":            url,
        "description":    "",
        "attributes":     {},
        "cross_references": [],
        "alternatives":   [],
        "equipment":      [],
        "scraped_at":     datetime.now().isoformat(),
        "error":          None,
    }

    try:
        try:
            page.goto(url, timeout=60000, wait_until="domcontentloaded")
        except Exception:
            pass  # page partially loaded; AJAX tabs handled by activate_tab waits
        time.sleep(3)
        dismiss_popups(page)

        # Verificar URL real (para detectar redirects inesperados)
        real_url = page.url
        if real_url != url:
            logging.info(f"    redirect → {real_url}")

        # Descripción
        result["description"] = page.evaluate("""() => {
            for (const sel of ['.prodSubTitleMob','.prodSubTitle','h6.desLengthCheck','h6','h1']) {
                const el = document.querySelector(sel);
                if (el && el.textContent.trim()) return el.textContent.trim();
            }
            return '';
        }""")

        # ── 1. Alternate Parts (activar tab → AJAX carga carrusel) ───────
        #     Solo leemos data-partnumber; NO se pulsa cada tarjeta.
        activate_tab(page, "alternateBody")
        result["alternatives"] = extract_alternatives(page)

        # ── 2. Attributes ────────────────────────────────────────────────
        activate_tab(page, "attributesBody")
        result["attributes"] = extract_attributes(page)

        # ── 3. Cross Reference ───────────────────────────────────────────
        activate_tab(page, "crossreferenceBody")
        result["cross_references"] = extract_cross_refs(page)

        # ── 4. Equipment ─────────────────────────────────────────────────
        activate_tab(page, "equiptmentBody")
        result["equipment"] = extract_equipment(page)

    except PlaywrightTimeout:
        result["error"] = "timeout"
        logging.warning(f"  TIMEOUT: {part}")
    except Exception as e:
        result["error"] = str(e)
        logging.warning(f"  ERROR {part}: {e}")

    return result


# ── progreso ────────────────────────────────────────────────────────────────

def load_progress():
    try:
        with open(PROGRESS_FILE, encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {"done": [], "results": [], "part_numbers": []}


def save_progress(p):
    # Atomic write: temp file → rename, so a hard shutdown never corrupts the file
    tmp = PROGRESS_FILE + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(p, f, ensure_ascii=False, indent=2)
        f.flush()
        os.fsync(f.fileno())
    os.replace(tmp, PROGRESS_FILE)


# ── main ────────────────────────────────────────────────────────────────────

def main():
    progress = load_progress()
    done_set = set(progress["done"])
    results  = progress["results"]

    with sync_playwright() as pw:
        logging.info(f"Stealth: {'SI' if STEALTH else 'NO'}")
        logging.info(f"Perfil : {PROFILE_DIR}")

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

        # Recolectar paths
        if not progress["part_numbers"] or RECOLLECT:
            if RECOLLECT and progress["part_numbers"]:
                logging.info("=== Re-recolectando (--recollect): fusionando URLs nuevas ===")
            else:
                logging.info("=== Recolectando product paths ===")
            fresh = collect_product_links(page)
            if RECOLLECT:
                prev = set(p.split('/')[0] for p in progress["part_numbers"])
                added = [p for p in fresh if p.split('/')[0] not in prev]
                pns = progress["part_numbers"] + added
                logging.info(f"  +{len(added)} URLs nuevas (total {len(pns)})")
            else:
                pns = fresh
            progress["part_numbers"] = pns
            save_progress(progress)
        else:
            pns = progress["part_numbers"]
            logging.info(f"=== {len(pns)} paths en progreso ===")

        total = len(pns)

        for idx, product_path in enumerate(pns, 1):
            part = product_path.split('/')[0].upper()

            if part in done_set:
                logging.info(f"[{idx}/{total}] {part} — ya procesado")
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

            save_progress(progress)

            rand_sleep()

        context.close()

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    ok  = sum(1 for r in results if not r["error"])
    err = len(results) - ok
    logging.info(f"\n=== COMPLETADO: {ok} OK | {err} errores → {OUTPUT_FILE} ===")


def test_one(target: str):
    """
    Prueba UN producto sin tocar el progreso.
    Acepta: 'P502007/18796', un part suelto, o una URL completa.
    Imprime el resultado para verificar el fix de alternativas.
    """
    if target.startswith("http"):
        product_path = target.split("/product/").pop()
    else:
        product_path = target

    with sync_playwright() as pw:
        context = pw.chromium.launch_persistent_context(
            user_data_dir=PROFILE_DIR, channel="chrome", headless=False,
            slow_mo=60, locale="en-US", viewport={"width": 1366, "height": 768},
            user_agent=("Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                        "AppleWebKit/537.36 (KHTML, like Gecko) "
                        "Chrome/124.0.0.0 Safari/537.36"),
            extra_http_headers={"Accept-Language": "en-US,en;q=0.9"},
            args=["--disable-blink-features=AutomationControlled"],
            ignore_default_args=["--enable-automation"],
        )
        page = context.new_page()
        if STEALTH:
            stealth_sync(page)
        data = scrape_product(page, product_path)
        context.close()

    print("\n=== RESULTADO PRUEBA ===")
    print(json.dumps(data, ensure_ascii=False, indent=2))


def login_session():
    """
    Abre shop.donaldson.com en el perfil persistente y espera login manual.
    Guarda cookies en ~/.donaldson_profile para corridas futuras.
    Necesario en Mac (perfil nuevo) antes de la primera corrida.
    """
    with sync_playwright() as pw:
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
        page.goto("https://shop.donaldson.com/store/en-us/", timeout=60000,
                  wait_until="domcontentloaded")
        print("\n" + "=" * 70)
        print("  Navega el sitio de Donaldson unos segundos para establecer sesión.")
        print("  No necesitas login — solo deja que cargue y ve algún producto.")
        print("  Cuando veas productos cargados, vuelve aquí y presiona ENTER.")
        print("=" * 70)
        input("\n  ENTER cuando el sitio haya cargado bien... ")
        print("  ✅ Sesión guardada. Ahora corre:")
        print("     python3 scraper_donaldson.py hydraulic")
        context.close()


def _usage():
    print("Uso:")
    print("  python scraper_donaldson.py <categoria> [url]   # scrapea categoría")
    print("  python scraper_donaldson.py --test <url>        # prueba 1 producto")
    print("  python scraper_donaldson.py --login             # guarda sesión (Mac/perfil nuevo)")
    print(f"\nCategorías conocidas: {', '.join(CATEGORIES)}")
    print("Para una nueva categoría pasa su URL de búsqueda:")
    print('  python scraper_donaldson.py fuel "https://shop.donaldson.com/.../search?N=...&..."')


if __name__ == "__main__":
    import sys
    argv = sys.argv[1:]

    if argv and argv[0] == "--login":
        login_session()
    elif argv and argv[0] == "--test":
        if len(argv) < 2:
            _usage()
        else:
            test_one(argv[1])
    else:
        recollect = "--recollect" in argv
        argv = [a for a in argv if a != "--recollect"]
        if recollect:
            globals()["RECOLLECT"] = True

        name = (argv[0] if argv else "lube").lower()
        url  = argv[1] if len(argv) > 1 else CATEGORIES.get(name)
        if not url:
            print(f"Categoría '{name}' desconocida y sin URL.\n")
            _usage()
            sys.exit(1)
        configure(name, url)
        logging.info(f"Categoría: {name}  →  {OUTPUT_FILE}")
        main()
