"""
scraper_fleetguard.py — Scraper de categorías Fleetguard (Cummins/Atmus Filtration)

Estrategia: Fleetguard usa Salesforce B2B Commerce (LWC con Shadow DOM).
Los productos viven en Shadow DOM → se usan 3 capas:
  1. Interceptar respuestas API JSON (Salesforce Commerce API)
  2. Traversal recursivo de Shadow DOM en JS
  3. Selectores pierce: de Playwright

Extrae por producto: Especificaciones, Cross-References, Alternativas, Equipment.
Guarda progreso atómicamente después de cada producto.

Uso:
    python scraper_fleetguard.py --inspect <URL-categoría>
    python scraper_fleetguard.py --test    <URL-producto>
    python scraper_fleetguard.py air-precleaners [URL]
    python scraper_fleetguard.py air-precleaners --start AF4878
    python scraper_fleetguard.py air-precleaners --codes-only        # solo códigos (rápido)
    python scraper_fleetguard.py air-precleaners --kits-only         # solo maintenance_kits
    python scraper_fleetguard.py air-precleaners --no-equipment      # sin equipment tab
    python scraper_fleetguard.py air-precleaners --no-images         # sin descargar imágenes
    python scraper_fleetguard.py --download-images air-precleaners   # descarga retroactiva
    python scraper_fleetguard.py --equipment-only air-primary-secondary  # solo equipment tab (retroactivo)
    python scraper_fleetguard.py --crossref-only air-primary-secondary   # solo cross-reference (recupera oem_codes=[])
    python scraper_fleetguard.py --dump-crossref AF463 AF25728 AF836     # diagnóstico: vuelca HTML crudo del bloque cross-ref

Imágenes:
    - Se descargan en scripts/Fleetguard Scraper/images/[PN].jpg
    - URL pública generada: /images/fleetguard/[PN].jpg
    - Copiar a frontend/public/images/fleetguard/ para desplegar
    - Campos en resultado: image_src (CDN original), image_url (URL propia)

Dependencias:
    pip install playwright playwright-stealth
    playwright install chrome
"""

import json
import time
import random
import logging
import os
import sys
import urllib.request
import urllib.error
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
        logging.FileHandler("scraper_fleetguard.log", encoding="utf-8"),
        logging.StreamHandler(),
    ],
)

PROFILE_DIR = os.path.join(os.path.expanduser("~"), ".fleetguard_profile")

# Todos los resultados/progreso/matriz se guardan aquí (junto al script).
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "Fleetguard Scraper")

CATEGORY_NAME = "unknown"
CATEGORY_URL  = ""
OUTPUT_FILE   = "fleetguard_unknown_results.json"
PROGRESS_FILE = "fleetguard_unknown_progress.json"

# Si False, se omite la extracción de Equipment + Maintenance Kits (lo lento).
# Se desactiva con --no-equipment. Default: True (detalle completo).
SCRAPE_EQUIPMENT = True

# Si True, extrae SOLO part_number + maintenance_kits. Omite specs, cross-refs,
# alternativas y equipment. Modo más rápido para catálogo de kits por máquina.
# Se activa con --kits-only.
SCRAPE_KITS_ONLY = False
HEADLESS = False   # True con --headless (unattended / sin ventana)

PAUSE_BETWEEN = (4, 9)

IMAGES_DIR      = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                               "Fleetguard Scraper", "images")
PUBLIC_IMG_BASE = "/images/fleetguard"   # URL base en el sitio desplegado
SCRAPE_IMAGES   = True                   # False con --no-images

# Solo URLs CONFIRMADAS reales. Para agregar otra categoría: copiar la URL real
# desde fleetguard.com (debe incluir el ID Salesforce, ej. /0ZGPL...).
# Estado: air-precleaners ✅ (37), air-primary-secondary ✅ (942), resto pendiente.
# NOTAS DE AGRUPACIÓN (para build_catalog_fleetguard.py):
#   air-housings → agrupar resultados junto a air-primary-secondary
#   hydraulic-filter-accessories → post-filtrar: solo filtros, excluir accesorios/válvulas
CATEGORIES = {
    # ── AIR FILTRATION ────────────────────────────────────────────────────────
    "air-precleaners":              "https://www.fleetguard.com/category/products/air-filtration/air-precleaners/0ZGPL0000000FSJ4A2",
    "air-primary-secondary":        "https://www.fleetguard.com/category/products/air-filtration/primary-and-secondary-air-filters/0ZGPL0000000FSF4A2",
    "air-housings":                 "https://www.fleetguard.com/category/products/air-filtration/air-housings/0ZGPL0000000FSL4A2",
    "panel-air-filters":            "https://www.fleetguard.com/category/products/air-filtration/panel-air-filters/0ZGPL0000000FSI4A2",
    "cabin-air-filters":            "https://www.fleetguard.com/category/products/air-filtration/cabin-air-filters/0ZGPL0000000FSH4A2",
    "air-dryer":                    "https://www.fleetguard.com/category/products/air-filtration/air-dryer/0ZGPL0000000FT74AM",
    # ── LUBE FILTRATION ───────────────────────────────────────────────────────
    "lube-cartridge":               "https://www.fleetguard.com/category/products/lube-filtration/cartridge-lube-filters/0ZGPL0000000FTB4A2",
    "lube-centrifuge":              "https://www.fleetguard.com/category/products/lube-filtration/centrifuge-filters/0ZGPL0000000FSX4A2",
    # ── FUEL FILTRATION ───────────────────────────────────────────────────────
    "fuel-spin-on":                 "https://www.fleetguard.com/category/products/fuel-filtration/spin-on-fuel-filters/0ZGPL0000000FTP4A2",
    "fuel-cartridge":               "https://www.fleetguard.com/category/products/fuel-filtration/cartridge-fuel-filters/0ZGPL0000000FSf4AM",
    "fuel-cartridge-water-sep":     "https://www.fleetguard.com/category/products/fuel-filtration/cartridge-fuel-water-separators/0ZGPL0000000FTA4A2",
    "fuel-spinon-water-sep":        "https://www.fleetguard.com/category/products/fuel-filtration/spinon-fuel-water-separators/0ZGPL0000000FTQ4A2",
    "fuel-inline":                  "https://www.fleetguard.com/category/products/fuel-filtration/in-line-fuel-filters/0ZGPL0000000FTG4A2",
    # ── HYDRAULIC FILTRATION ──────────────────────────────────────────────────
    "hydraulic-spin-on":            "https://www.fleetguard.com/category/products/hydraulic-filtration/spinon-hydraulic-filters/0ZGPL0000000FSs4AM",
    "hydraulic-cartridge":          "https://www.fleetguard.com/category/products/hydraulic-filtration/cartridge-hydraulic-filters/0ZGPL0000000FSt4AM",
    "hydraulic-filter-accessories": "https://www.fleetguard.com/category/products/hydraulic-filtration/hydraulic-filter-head-accessories/0ZGPL0000000FSu4AM",
    # ── COOLANTS & CHEMICALS ──────────────────────────────────────────────────
    "coolant-filters":              "https://www.fleetguard.com/category/products/coolants-chemicals/coolant-filters/0ZGPL0000000FSP4A2",
    # ── CRANKCASE VENTILATION ─────────────────────────────────────────────────
    "crankcase-ventilation":        "https://www.fleetguard.com/category/products/crankcase-ventilation/open-crankcase-ventilation-filters/0ZGPL0000000FSc4AM",
}

# JS que traversa Shadow DOM recursivamente
# Selector confirmado: <h2 class="product-name" data-id="01tXXX">AP8404</h2>
PRODUCT_BASE_URL = "https://www.fleetguard.com/product/"

SHADOW_LINKS_JS = """
() => {
    const found = new Set();
    const PN_RE = /^[A-Z]{1,4}[0-9]{3,}[A-Z0-9-]*$/;
    function walk(root) {
        try {
            // Selector confirmado: h2/h3/.product-name con data-id (Salesforce Product2)
            root.querySelectorAll('.product-name[data-id], h2.product-name, h3.product-name, .product-name').forEach(el => {
                const pn = (el.textContent || '').trim().toUpperCase().replace(/\\s+/g,'');
                if (pn && pn.length >= 3 && pn.length <= 20) {
                    found.add('https://www.fleetguard.com/product/' + pn);
                }
            });
            // Links directos /product/
            root.querySelectorAll('a[href]').forEach(a => {
                const h = (a.href || '').split('?')[0].split('#')[0];
                if (h.includes('fleetguard.com') &&
                    (h.includes('/product/') || h.match(/\\/[A-Z]{2,}[0-9]{4,}/)) &&
                    !h.includes('/category/')) {
                    found.add(h);
                }
            });
            // Fallback: cualquier texto que parezca part number en cards de producto
            root.querySelectorAll('[class*="product-card"] *, [class*="product-tile"] *, [class*="product-item"] *').forEach(el => {
                if (el.children.length === 0) {
                    const t = (el.textContent || '').trim().toUpperCase();
                    if (PN_RE.test(t)) {
                        found.add('https://www.fleetguard.com/product/' + t);
                    }
                }
            });
            root.querySelectorAll('*').forEach(el => {
                if (el.shadowRoot) walk(el.shadowRoot);
            });
        } catch(e) {}
    }
    walk(document);
    return Array.from(found);
}
"""

SHADOW_TEXT_JS = """
() => {
    const texts = [];
    function walk(root, depth) {
        if (depth > 12) return;
        try {
            root.querySelectorAll('*').forEach(el => {
                const t = (el.textContent || '').trim();
                if (t && t.length > 2 && t.length < 200 && el.children.length === 0) {
                    const tag = el.tagName.toLowerCase();
                    if (!['script','style','meta','link'].includes(tag))
                        texts.push(t);
                }
                if (el.shadowRoot) walk(el.shadowRoot, depth + 1);
            });
        } catch(e) {}
    }
    walk(document, 0);
    // Dedup y primeros 200
    return [...new Set(texts)].slice(0, 200);
}
"""


def configure(name, url):
    global CATEGORY_NAME, CATEGORY_URL, OUTPUT_FILE, PROGRESS_FILE
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    CATEGORY_NAME = name
    CATEGORY_URL  = url
    OUTPUT_FILE   = os.path.join(OUTPUT_DIR, f"fleetguard_{name}_results.json")
    PROGRESS_FILE = os.path.join(OUTPUT_DIR, f"fleetguard_{name}_progress.json")


def rand_sleep(lo=None, hi=None):
    lo, hi = (lo, hi) if lo else PAUSE_BETWEEN
    time.sleep(random.uniform(lo, hi))


def launch_context(pw):
    return pw.chromium.launch_persistent_context(
        user_data_dir=PROFILE_DIR,
        channel="chrome",
        headless=HEADLESS,
        slow_mo=40,
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


def dismiss_popups(page):
    try:
        page.keyboard.press("Escape")
        time.sleep(0.3)
    except Exception:
        pass
    for sel in [
        "#onetrust-accept-btn-handler", "button:has-text('Accept All')",
        "button:has-text('Accept')", "button:has-text('Agree')",
        "button[aria-label='Close']", ".modal-close",
    ]:
        try:
            btn = page.query_selector(sel)
            if btn and btn.is_visible():
                btn.click()
                time.sleep(0.5)
        except Exception:
            pass


def wait_net(page, timeout=15000):
    try:
        page.wait_for_load_state("networkidle", timeout=timeout)
    except Exception:
        pass


def wait_for_tabs(page, timeout: int = 35000):
    """Espera hasta que los componentes LWC de tabs estén renderizados.
    networkidle no garantiza que Lightning Web Components hayan terminado
    de inicializarse — button.tablinks aparece vía requestAnimationFrame
    DESPUÉS de networkidle en páginas de producto Fleetguard/Salesforce."""
    try:
        page.wait_for_function(f"""() => {{
            {_SHADOW_WALK}
            return !!sw(document, 'button.tablinks', 0);
        }}""", timeout=timeout)
        time.sleep(1)  # micro-settle tras aparición del botón
    except Exception:
        pass  # Si nunca aparece, seguimos (extractor maneja fallback)
        pass


# ── Progress ─────────────────────────────────────────────────────────────────

def load_progress():
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, encoding="utf-8") as f:
            return json.load(f)
    return {"part_numbers": [], "done": [], "results": [], "started": str(datetime.now())}


def save_progress(p):
    tmp = PROGRESS_FILE + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(p, f, ensure_ascii=False, indent=2)
        f.flush()
        os.fsync(f.fileno())
    os.replace(tmp, PROGRESS_FILE)


# ── API interceptor ───────────────────────────────────────────────────────────

def make_api_listener():
    """
    Retorna (captured_list, handler). Captura respuestas JSON de interés
    junto con la petición que las originó (método + body + headers), necesario
    para re-emitir la petición cambiando el número de página.
    """
    captured = []

    def handler(response):
        ct = response.headers.get("content-type", "")
        if "json" not in ct:
            return
        url = response.url
        kw = ["product", "search", "commerce", "catalog", "category", "item", "webstore"]
        if not any(k in url.lower() for k in kw):
            return
        try:
            data = response.json()
        except Exception:
            return
        # Capturar detalles de la petición (para replay paginado)
        method, post_data, req_headers = "GET", None, {}
        try:
            req = response.request
            method = req.method
            post_data = req.post_data
            req_headers = req.headers
        except Exception:
            pass
        captured.append({
            "url": url,
            "status": response.status,
            "data": data,
            "method": method,
            "post_data": post_data,
            "req_headers": req_headers,
        })

    return captured, handler


# ── Shadow DOM helpers ────────────────────────────────────────────────────────

def shadow_links(page) -> list:
    try:
        links = page.evaluate(SHADOW_LINKS_JS)
        return links or []
    except Exception:
        return []


def pierce_links(page) -> list:
    """Playwright pierce: selector — usa .product-name confirmado en Fleetguard."""
    result = set()
    try:
        # Selector confirmado: h2.product-name con el part number como texto
        els = page.locator("pierce:.product-name").all()
        for el in els:
            pn = (el.text_content() or "").strip().upper()
            if pn and len(pn) >= 3:
                result.add(f"https://www.fleetguard.com/product/{pn}")
    except Exception:
        pass
    try:
        # Fallback: links directos
        els = page.locator("pierce:a[href*='/product/']").all()
        for el in els:
            href = el.get_attribute("href") or ""
            full = ("https://www.fleetguard.com" + href if href.startswith("/") else href).split("?")[0]
            if "fleetguard.com" in full and "/category/" not in full:
                result.add(full)
    except Exception:
        pass
    return list(result)


# ── Login mode ────────────────────────────────────────────────────────────────

def login_session():
    """
    Abre Fleetguard en el perfil persistente y espera a que inicies sesión
    manualmente. Las cookies quedan guardadas en ~/.fleetguard_profile, así
    las corridas siguientes usan tu sesión de dealer (asGuest=false) y ven el
    catálogo completo en vez del reducido de invitado.
    """
    with sync_playwright() as pw:
        ctx = launch_context(pw)
        page = ctx.new_page()
        if STEALTH:
            stealth_sync(page)
        page.goto("https://www.fleetguard.com/", timeout=60000,
                  wait_until="domcontentloaded")
        print("\n" + "=" * 70)
        print("  INICIA SESIÓN en la ventana del navegador (login de dealer).")
        print("  Cuando veas tu cuenta logueada, vuelve aquí y presiona ENTER.")
        print("  Las cookies se guardan en el perfil para las próximas corridas.")
        print("=" * 70)
        input("\n  ENTER cuando estés logueado... ")
        # Verificar estado de sesión: ¿sigue como invitado?
        try:
            ctx_data = page.evaluate("""async () => {
                try {
                    const r = await fetch('/webruntime/api/services/data/v66.0/'
                        + 'commerce/webstores', {credentials:'include'});
                    return r.status;
                } catch(e) { return -1; }
            }""")
            logging.info(f"  Sesión guardada (status webstores: {ctx_data})")
        except Exception:
            pass
        print("  ✅ Sesión guardada. Ahora corre --codes-only para ver el total real.")
        ctx.close()


# ── Inspect mode ──────────────────────────────────────────────────────────────

def inspect_page(url: str):
    """Captura APIs, Shadow DOM y screenshot para descubrir estructura."""
    captured, handler = make_api_listener()

    with sync_playwright() as pw:
        ctx = launch_context(pw)
        page = ctx.new_page()
        if STEALTH:
            stealth_sync(page)
        page.on("response", handler)

        logging.info(f"Inspeccionando: {url}")
        page.goto(url, timeout=60000, wait_until="domcontentloaded")
        time.sleep(3)
        dismiss_popups(page)

        # Esperar carga de red
        wait_net(page, 20000)
        time.sleep(5)
        wait_net(page, 10000)

        # Screenshot
        page.screenshot(path="fleetguard_inspect.png", full_page=False)
        logging.info("Screenshot: fleetguard_inspect.png")

        # Recolectar datos
        links_shadow = shadow_links(page)
        links_pierce = pierce_links(page)
        shadow_texts = page.evaluate(SHADOW_TEXT_JS)

        # API calls capturadas
        api_summary = []
        for c in captured:
            d = c["data"]
            if isinstance(d, dict):
                keys = list(d.keys())[:10]
                # Buscar arrays dentro que parezcan productos
                product_arrays = {k: len(v) for k, v in d.items() if isinstance(v, list) and len(v) > 0}
            elif isinstance(d, list):
                keys = [f"[array len={len(d)}]"]
                product_arrays = {"root": len(d)}
            else:
                keys = [str(type(d))]
                product_arrays = {}
            api_summary.append({
                "url": c["url"],
                "status": c["status"],
                "keys": keys,
                "arrays": product_arrays,
                "preview": str(d)[:400],
            })

        # Guardar todo
        out = {
            "shadow_links": links_shadow,
            "pierce_links": links_pierce,
            "api_calls": api_summary,
            "shadow_texts_sample": shadow_texts[:50],
        }
        with open("fleetguard_inspect.json", "w", encoding="utf-8") as f:
            json.dump(out, f, ensure_ascii=False, indent=2)

        # Guardar respuesta API completa (sin truncar) para ver campos de producto
        full_api = []
        for c in captured:
            full_api.append({"url": c["url"], "status": c["status"], "data": c["data"]})
        with open("fleetguard_api_full.json", "w", encoding="utf-8") as f:
            json.dump(full_api, f, ensure_ascii=False, indent=2)
        logging.info("API completa guardada: fleetguard_api_full.json")

        # Imprimir resumen
        sep = "=" * 65
        print(f"\n{sep}")
        print(f"Shadow DOM links ({len(links_shadow)}): {links_shadow[:5]}")
        print(f"Pierce links     ({len(links_pierce)}): {links_pierce[:5]}")
        print(f"\nAPI calls capturadas ({len(api_summary)}):")
        for a in api_summary:
            print(f"  [{a['status']}] {a['url'][:90]}")
            print(f"    keys: {a['keys']}")
            if a["arrays"]:
                print(f"    arrays: {a['arrays']}")
            print(f"    preview: {a['preview'][:200]}")
            print()
        print(f"\nTextos en Shadow DOM ({len(shadow_texts)}):")
        for t in shadow_texts[:40]:
            print(f"  · {t}")
        print(f"\nGuardado: fleetguard_inspect.json + fleetguard_inspect.png")
        print(sep)

        input("\nPresiona ENTER para cerrar...")
        ctx.close()


def dump_crossref_html(part_numbers: list):
    """
    Diagnóstico puntual: navega a cada producto, activa el tab CrossRef
    (si existe) y vuelca el HTML crudo de cualquier elemento relacionado con
    "Cross Reference" — tablas, contenedores, texto — a un archivo de texto.
    Sirve para ver la estructura REAL del DOM y ajustar el extractor sin
    adivinar. Uso: python scraper_fleetguard.py --dump-crossref AF463 AF25728 AF836
    """
    out_path = "fleetguard_crossref_dump.txt"
    dump_js = f"""() => {{
        // Aplana TODO el documento (cruzando shadow roots) a texto plano,
        // sin asumir estructura (tabs, tablas, headers). Luego busca TODAS
        // las apariciones de "cross reference" y vuelca ventanas de contexto
        // alrededor — el contenido tiene que estar en algún punto de ese texto,
        // sea cual sea su contenedor real.
        const buf = [];
        function walk(node, depth) {{
            if (!node || depth > 400 || buf.length > 40000) return;
            if (node.nodeType === 3) {{
                const t = node.textContent.replace(/\\s+/g, ' ').trim();
                if (t) buf.push(t);
                return;
            }}
            if (node.nodeType !== 1) return;
            if (node.shadowRoot) {{
                Array.from(node.shadowRoot.childNodes).forEach(c => walk(c, depth + 1));
            }}
            Array.from(node.childNodes).forEach(c => walk(c, depth + 1));
        }}
        walk(document.body, 0);
        const fullText = buf.join(' | ');

        const out = [];
        out.push('LONGITUD TEXTO TOTAL: ' + fullText.length + ' chars');

        const re = /cross reference/gi;
        let m;
        let n = 0;
        const seen = new Set();
        while ((m = re.exec(fullText)) !== null && n < 15) {{
            const start = Math.max(0, m.index - 250);
            const end = Math.min(fullText.length, m.index + 350);
            const window = fullText.slice(start, end);
            if (seen.has(window)) continue;
            seen.add(window);
            out.push('--- COINCIDENCIA #' + n + ' (posición ' + m.index + ') ---\\n...' + window + '...');
            n++;
        }}
        if (n === 0) out.push('(NINGUNA aparición de "cross reference" en todo el texto aplanado de la página)');

        return out.join('\\n\\n');
    }}"""

    lines = []
    with sync_playwright() as pw:
        ctx = launch_context(pw)
        page = ctx.new_page()
        if STEALTH:
            stealth_sync(page)
        for pn in part_numbers:
            url = f"https://www.fleetguard.com/product/{pn}"
            lines.append("=" * 70)
            lines.append(f"PRODUCTO: {pn}  ({url})")
            lines.append("=" * 70)
            try:
                page.goto(url, timeout=60000, wait_until="domcontentloaded")
                time.sleep(3)
                dismiss_popups(page)
                wait_net(page, 20000)
                time.sleep(3)
                wait_for_tabs(page)
                clicked = _click_tab(page, "CrossRef")
                lines.append(f"[tab CrossRef encontrado y clickeado: {clicked}]")
                # Forzar carga perezosa: recorrer la página con scroll y esperar
                # a que el contenido async (tablas/listas de cross-ref) se rellene.
                try:
                    page.evaluate("""() => {
                        const h = document.body.scrollHeight;
                        for (let y = 0; y <= h; y += 400) window.scrollTo(0, y);
                        window.scrollTo(0, 0);
                    }""")
                except Exception:
                    pass
                time.sleep(4)
                wait_net(page, 15000)
                time.sleep(4)
                dump = page.evaluate(dump_js)
                lines.append(dump or "(sin coincidencias — ni headers 'cross reference' ni <table>)")
            except Exception as e:
                lines.append(f"ERROR: {e}")
            lines.append("")
            rand_sleep()
        ctx.close()

    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    logging.info(f"✅ Volcado HTML guardado en {out_path}")
    print(f"\nAbre {out_path} y pega aquí su contenido para análisis.")


# ── Category collector ────────────────────────────────────────────────────────

def _count_products(data) -> int:
    """Cuenta productos en una respuesta API (incluye Salesforce productsPage)."""
    if isinstance(data, dict):
        # Salesforce B2B Commerce search/products → productsPage.products[]
        pp = data.get("productsPage")
        if isinstance(pp, dict) and isinstance(pp.get("products"), list):
            return len(pp["products"])
        for k in ("products", "items", "results", "productList", "records", "data"):
            v = data.get(k)
            if isinstance(v, list):
                return len(v)
    return 0


def _find_product_api(captured: list):
    """
    Busca la petición API capturada que devolvió productos.
    Retorna el dict completo de captured (url/method/post_data/data) o None.
    """
    best = None
    for c in reversed(captured):   # la más reciente primero
        if _count_products(c.get("data")) > 0:
            best = c
            break
    return best


def _find_capture(captured: list, needle: str):
    """Retorna la última captura cuya URL contiene `needle`, o None."""
    for c in reversed(captured):
        if needle in c.get("url", ""):
            return c
    return None


def _set_query(url: str, **kv) -> str:
    """Cambia/agrega parámetros de query en una URL."""
    import urllib.parse
    p = urllib.parse.urlparse(url)
    q = dict((k, v[0]) for k, v in urllib.parse.parse_qs(p.query, keep_blank_values=True).items())
    for k, v in kv.items():
        q[k] = str(v)
    return urllib.parse.urlunparse(p._replace(query=urllib.parse.urlencode(q)))


def _fetch_json(page, url: str):
    """fetch() GET JSON en el contexto del browser (usa cookies de sesión)."""
    return page.evaluate("""async (url) => {
        try {
            const r = await fetch(url, {credentials:'include',
                headers:{'Accept':'application/json'}});
            if (!r.ok) return null;
            return await r.json();
        } catch(e) { return null; }
    }""", url)


def _salesforce_product_ids(data) -> list:
    """Extrae IDs de producto (01t…) de una respuesta search/products."""
    ids = []
    pp = data.get("productsPage") if isinstance(data, dict) else None
    prods = pp.get("products") if isinstance(pp, dict) else None
    if isinstance(prods, list):
        for it in prods:
            if isinstance(it, dict):
                pid = it.get("id") or it.get("productId")
                if isinstance(pid, str) and pid.startswith("01t"):
                    ids.append(pid)
    return ids


def collect_salesforce_search(page, captured) -> set:
    """
    Paginador específico Salesforce B2B Commerce.

    Flujo real del sitio (descubierto vía api_debug):
      1. search/products?categoryId=X&page=N  → IDs de producto (base 0).
         Productos anidados en productsPage.products[]; total en productsPage.total.
      2. products?ids=<20 ids>                 → datos completos con ProductCode.

    Pagina (1), resuelve IDs→part numbers (2), arma URLs /product/{PN}.
    Retorna set de URLs, o set vacío si no hay endpoint de búsqueda.
    """
    import math

    search_cap = _find_capture(captured, "/search/products?")
    ids_cap    = _find_capture(captured, "/products?ids=")
    if not search_cap:
        return set()

    search_url = search_cap["url"]
    # total / pageSize del primer response (productsPage)
    data0 = search_cap.get("data") or {}
    pp0   = data0.get("productsPage", {}) if isinstance(data0, dict) else {}
    total = pp0.get("total") or data0.get("total") or 0
    psize = pp0.get("pageSize") or 20
    pages = math.ceil(total / psize) if total else 250
    logging.info(f"  Salesforce search: total={total}, pageSize={psize}, páginas={pages}")

    # ── Paso 1: recolectar todos los IDs paginando search/products (base 0) ──
    all_ids = []
    seen_id = set()
    empty   = 0
    for n in range(0, pages + 2):           # +2 margen por si total redondea
        url  = _set_query(search_url, page=n)
        data = _fetch_json(page, url)
        pids = _salesforce_product_ids(data) if data else []
        nuevos = 0
        for pid in pids:
            if pid not in seen_id:
                seen_id.add(pid); all_ids.append(pid); nuevos += 1
        if (n + 1) % 10 == 0 or nuevos == 0:
            logging.info(f"    search page {n}: +{nuevos} IDs (total {len(all_ids)})")
        if not pids:
            empty += 1
            if empty >= 2:
                break
        else:
            empty = 0
    logging.info(f"  IDs recolectados: {len(all_ids)}")

    # ── Paso 2: resolver IDs → part numbers vía products?ids= (lotes de 20) ──
    urls = set()
    if not ids_cap:
        logging.warning("  No se capturó endpoint products?ids= — no se pueden resolver part numbers")
        return urls
    ids_url = ids_cap["url"]
    BATCH = 20
    for i in range(0, len(all_ids), BATCH):
        chunk = all_ids[i:i + BATCH]
        url   = _set_query(ids_url, ids=",".join(chunk))
        data  = _fetch_json(page, url)
        if data:
            _extract_urls_from_api(data, urls)
        if (i // BATCH + 1) % 10 == 0:
            logging.info(f"    resueltos {len(urls)} part numbers de {len(all_ids)} IDs")
    logging.info(f"  Part numbers resueltos: {len(urls)}")
    return urls


def _replay_api_page(page, cap: dict, page_num: int):
    """
    Re-emite la petición API capturada pidiendo `page_num`. Maneja:
      - GET: cambia el parámetro de página en la query (prueba variantes).
      - POST: cambia el campo de página dentro del body JSON (prueba variantes).
    Retorna (data|None, descripcion_intento).
    """
    import urllib.parse, json as _json

    url     = cap["url"]
    method  = (cap.get("method") or "GET").upper()
    body    = cap.get("post_data")
    headers = cap.get("req_headers") or {}
    # Headers seguros para replay (sin los que rompen fetch como content-length)
    safe_headers = {k: v for k, v in headers.items()
                    if k.lower() in ("accept", "content-type", "authorization",
                                     "x-csrf-token", "x-sfdc-page-cache",
                                     "authorization-bearer")}
    safe_headers.setdefault("accept", "application/json")

    PAGE_KEYS = ("page", "pageNumber", "currentPage", "pageNo", "p")

    if method == "GET":
        parsed = urllib.parse.urlparse(url)
        params = urllib.parse.parse_qs(parsed.query, keep_blank_values=True)
        # ¿Ya hay un parámetro de página? cámbialo. Si no, prueba PAGE_KEYS.
        existing = next((k for k in PAGE_KEYS if k in params), None)
        keys_to_try = [existing] if existing else list(PAGE_KEYS)
        for key in keys_to_try:
            p2 = dict((k, v[0]) for k, v in params.items())
            p2[key] = str(page_num)
            new_url = urllib.parse.urlunparse(
                parsed._replace(query=urllib.parse.urlencode(p2)))
            data = page.evaluate("""async (args) => {
                try {
                    const r = await fetch(args.url, {credentials:'include', headers:args.h});
                    if (!r.ok) return null;
                    return await r.json();
                } catch(e) { return null; }
            }""", {"url": new_url, "h": safe_headers})
            if data and _count_products(data) > 0:
                return data, f"GET {key}={page_num}"
        return None, "GET (sin variante válida)"

    # POST: el body suele ser JSON con el número de página adentro
    parsed_body = None
    if body:
        try:
            parsed_body = _json.loads(body)
        except Exception:
            parsed_body = None

    def set_page(obj, val):
        """Busca recursivamente una clave de página y la fija. Retorna True si la halló."""
        found = False
        if isinstance(obj, dict):
            for k in list(obj.keys()):
                if k in PAGE_KEYS and isinstance(obj[k], (int, str)):
                    obj[k] = val; found = True
                elif isinstance(obj[k], (dict, list)):
                    found = set_page(obj[k], val) or found
        elif isinstance(obj, list):
            for it in obj:
                found = set_page(it, val) or found
        return found

    if isinstance(parsed_body, (dict, list)):
        import copy
        b2 = copy.deepcopy(parsed_body)
        if not set_page(b2, page_num):
            # No había clave de página → inyectar pageNumber en la raíz dict
            if isinstance(b2, dict):
                b2["pageNumber"] = page_num
        new_body = _json.dumps(b2)
        safe_headers.setdefault("content-type", "application/json")
        data = page.evaluate("""async (args) => {
            try {
                const r = await fetch(args.url, {method:'POST', credentials:'include',
                    headers: args.h, body: args.body});
                if (!r.ok) return null;
                return await r.json();
            } catch(e) { return null; }
        }""", {"url": url, "h": safe_headers, "body": new_body})
        if data and _count_products(data) > 0:
            return data, f"POST page={page_num}"
        return None, "POST (sin variante válida)"

    return None, f"{method} (body no JSON)"


def collect_product_links(page, category_url: str) -> list:
    """
    Recolecta URLs de productos de una categoría Fleetguard.

    Estrategia en 3 capas (por orden de fiabilidad):
    1. API directa: re-emite la petición Salesforce capturada (GET o POST)
       variando el número de página. Itera hasta agotar productos.
    2. Scroll: hace scroll al fondo para activar lazy rendering y extrae links.
    3. Botón/paginación UI: fallback si capas 1-2 no avanzan.
    """
    captured, handler = make_api_listener()
    page.on("response", handler)

    logging.info(f"Cargando: {category_url}")
    page.goto(category_url, timeout=60000, wait_until="domcontentloaded")
    time.sleep(4)
    dismiss_popups(page)
    wait_net(page, 20000)
    time.sleep(3)

    all_urls  = set()
    api_mode  = False
    api_cap   = None
    pg        = 1
    stale     = 0

    def harvest():
        """Extrae URLs del estado actual del DOM + respuestas capturadas."""
        for u in shadow_links(page) + pierce_links(page):
            all_urls.add(u)
        for c in captured:
            _extract_urls_from_api(c["data"], all_urls)

    # ── Extracción inicial ────────────────────────────────────────────────────
    harvest()
    logging.info(f"  Carga inicial: {len(all_urls)} URLs")

    # ── Diagnóstico: volcar TODAS las APIs capturadas (url + método + #prod) ───
    try:
        diag = [{
            "url": c["url"], "method": c.get("method"),
            "products": _count_products(c.get("data")),
            "has_body": bool(c.get("post_data")),
            "post_data": (c.get("post_data") or "")[:500],
        } for c in captured]
        diag_file = os.path.join(OUTPUT_DIR, f"fleetguard_{CATEGORY_NAME}_api_debug.json")
        with open(diag_file, "w", encoding="utf-8") as f:
            json.dump(diag, f, ensure_ascii=False, indent=2)
        logging.info(f"  Diagnóstico API → {diag_file} ({len(diag)} llamadas)")
    except Exception as e:
        logging.debug(f"  No se pudo volcar diagnóstico: {e}")

    # ── Ruta preferida: paginador Salesforce B2B Commerce (search/products) ────
    sf_urls = collect_salesforce_search(page, captured)
    if sf_urls:
        all_urls |= sf_urls
        logging.info(f"Total URLs encontradas (Salesforce): {len(all_urls)}")
        return list(all_urls)

    # ── Fallback: detectar cualquier API paginable genérica ────────────────────
    api_cap = _find_product_api(captured)
    if api_cap:
        logging.info(f"  API detectada: {api_cap['method']} "
                     f"{api_cap['url'][:70]}… ({_count_products(api_cap['data'])} prod)")
        api_mode = True

    while True:
        before = len(all_urls)

        if api_mode:
            # ── Capa 1: re-emitir petición API con la página siguiente ────────
            try:
                data, how = _replay_api_page(page, api_cap, pg + 1)
                if data:
                    _extract_urls_from_api(data, all_urls)
                    if (len(all_urls) - before) == 0:
                        # devolvió productos pero ninguno nuevo → fin real
                        logging.info(f"  API {how}: sin URLs nuevas — fin de páginas")
                        api_mode = False
                else:
                    logging.info(f"  API {how} — fin (sin más productos)")
                    api_mode = False
            except Exception as e:
                logging.warning(f"  API replay error pág {pg+1}: {e}")
                api_mode = False

        if not api_mode:
            # ── Capa 2: scroll al fondo (infinite scroll / lazy render) ───────
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            time.sleep(2)
            wait_net(page)
            harvest()

            # ── Capa 3: botón/paginación UI ───────────────────────────────────
            went = page.evaluate(f"""(targetPage) => {{
                function* allNodes(root, depth=0) {{
                    if (depth > 12) return;
                    for (const el of root.querySelectorAll('*')) {{
                        yield el;
                        if (el.shadowRoot) yield* allNodes(el.shadowRoot, depth+1);
                    }}
                }}
                const label = el =>
                    ((el.getAttribute && (el.getAttribute('aria-label') ||
                      el.getAttribute('title'))) || '').trim().toLowerCase();
                const text  = el => (el.textContent || '').trim().toLowerCase();
                const ok    = el =>
                    el.offsetParent !== null && !el.disabled &&
                    el.getAttribute('aria-disabled') !== 'true';

                const nodes = [...allNodes(document)];
                const cands = nodes.filter(el =>
                    el.tagName === 'BUTTON' || el.tagName === 'A' ||
                    (el.getAttribute && el.getAttribute('role') === 'button'));

                for (const el of cands) {{
                    if (!ok(el)) continue;
                    const l = label(el), t = text(el);
                    if (/prev/.test(l) || /prev/.test(t)) continue;
                    if (/\\bnext\\b/.test(l) || /\\bnext\\b/.test(t) ||
                        /^[›»→⟩›]$/.test(t) ||
                        l === 'next page' || l === 'go to next page') {{
                        el.click(); return 'next';
                    }}
                }}
                for (const el of cands) {{
                    if (!ok(el)) continue;
                    const cls = (el.className && el.className.toString
                                  ? el.className.toString() : '').toLowerCase();
                    if (/next/.test(cls) && !/prev/.test(cls)) {{
                        el.click(); return 'next-class';
                    }}
                }}
                for (const el of cands) {{
                    if (!ok(el)) continue;
                    if (/load more|show more|view more|see more/.test(text(el))) {{
                        el.click(); return 'more';
                    }}
                }}
                for (const el of cands) {{
                    if (!ok(el)) continue;
                    if (text(el) === String(targetPage)) {{
                        el.click(); return 'num';
                    }}
                }}
                return '';
            }}""", pg + 1)

            if not went:
                logging.info(f"  Sin más páginas en pág {pg}")
                break

            time.sleep(4)
            wait_net(page)
            harvest()

        nuevos = len(all_urls) - before
        pg    += 1
        logging.info(f"  Página {pg}: {len(all_urls)} acumuladas (+{nuevos})")

        if nuevos == 0:
            stale += 1
            if stale >= 3:
                logging.info(f"  3 páginas sin URLs nuevas — deteniendo en pág {pg}")
                break
        else:
            stale = 0

        if pg > 250:
            logging.warning("  Tope 250 páginas — deteniendo")
            break

    logging.info(f"Total URLs encontradas: {len(all_urls)}")
    return list(all_urls)


def _extract_urls_from_api(data, url_set: set):
    """Extrae URLs de producto de respuestas JSON de Salesforce Commerce."""
    if isinstance(data, dict):
        # Buscar campos comunes de Salesforce B2B Commerce
        for key in ("products", "items", "results", "productList", "records", "data"):
            if key in data and isinstance(data[key], list):
                for item in data[key]:
                    _extract_product_url(item, url_set)
        # Buscar en todos los valores
        for v in data.values():
            if isinstance(v, (dict, list)):
                _extract_urls_from_api(v, url_set)
    elif isinstance(data, list):
        for item in data:
            _extract_urls_from_api(item, url_set)


def _extract_product_url(item: dict, url_set: set):
    """Extrae URL de un item de producto Salesforce B2B Commerce.

    Salesforce puede devolver part numbers en distintos niveles:
      - item["productCode"] = "AP8404"
      - item["fields"]["ProductCode"] = "AP8404"
      - item["fields"]["ProductCode"]["value"] = "AP8404"
      - item["name"] o item["fields"]["Name"]
    La URL final es siempre /product/{partNumber}.
    """
    if not isinstance(item, dict):
        return

    # 1. URL directa si viene en el objeto
    for field in ("productUrl", "url", "pdpUrl", "slug", "productSlug", "pageUrl"):
        v = item.get(field, "")
        if v and isinstance(v, str) and len(v) > 3:
            if v.startswith("/"):
                v = "https://www.fleetguard.com" + v
            if "fleetguard.com" in v and "/category/" not in v:
                url_set.add(v.split("?")[0])
                return  # URL directa encontrada

    # 2. Part number plano en raíz
    pn = ""
    for field in ("productCode", "ProductCode", "sku", "SKU", "partNumber", "name", "Name"):
        v = item.get(field, "")
        if v and isinstance(v, str) and _looks_like_part_number(v):
            pn = v.upper(); break

    # 3. Salesforce nested fields: item["fields"]["ProductCode"] o item["fields"]["ProductCode"]["value"]
    if not pn:
        fields = item.get("fields", {})
        if isinstance(fields, dict):
            for fname in ("ProductCode", "productCode", "Name", "SKU", "PartNumber"):
                fval = fields.get(fname, "")
                if isinstance(fval, dict):
                    fval = fval.get("value", "")
                if fval and isinstance(fval, str) and _looks_like_part_number(fval):
                    pn = fval.upper(); break

    if pn:
        url_set.add(f"https://www.fleetguard.com/product/{pn}")


def _looks_like_part_number(s: str) -> bool:
    """Heurística: parte alfanumérica corta en mayúsculas (AP8404, AF1735, etc.)."""
    s = s.strip()
    # 3-20 chars, alfanumérico + guiones, no un ID largo de Salesforce
    if not (3 <= len(s) <= 20):
        return False
    if s.startswith("01t") or s.startswith("0ZG"):  # Salesforce internal IDs
        return False
    import re
    return bool(re.match(r'^[A-Za-z]{1,4}[0-9]{3,}', s))


# ── JS helpers (selectores confirmados por inspección DOM real) ──────────────
#
# Estructura confirmada de AP8404:
#   <h2 class="product-name" data-id="01t...">AP8404</h2>
#   Specs: tabla visible por defecto (dl o table)
#   Related Parts: sección con "Uses Precleaner" / "Uses Service Part"
#   Tabs: <button class="tablinks" data-name="Equipment|CrossRef">
#

_SHADOW_WALK = """
function sw(root, sel, depth) {
    if (depth > 10) return null;
    const el = root.querySelector(sel);
    if (el) return el;
    for (const n of root.querySelectorAll('*'))
        if (n.shadowRoot) { const r = sw(n.shadowRoot, sel, depth+1); if (r) return r; }
    return null;
}
"""

_SHADOW_WALK_ALL = """
function swa(root, sel, depth, out) {
    if (depth > 10) return;
    root.querySelectorAll(sel).forEach(el => out.push(el));
    root.querySelectorAll('*').forEach(n => {
        if (n.shadowRoot) swa(n.shadowRoot, sel, depth+1, out);
    });
}
"""


def _click_tab(page, data_name: str) -> bool:
    """Activa tab Fleetguard por data-name confirmado."""
    clicked = page.evaluate(f"""() => {{
        {_SHADOW_WALK}
        const btn = sw(document, 'button.tablinks[data-name="{data_name}"]', 0);
        if (btn) {{ btn.click(); return true; }}
        return false;
    }}""")
    if clicked:
        time.sleep(2)
        try:
            page.wait_for_load_state("networkidle", timeout=6000)
        except Exception:
            pass
    return bool(clicked)


def _click_tab_flexible(page, data_names: list, text_keywords: list) -> bool:
    """
    Activa un tab probando varios data-name, y si no, por texto del botón.
    Útil cuando el data-name no está confirmado (ej. Maintenance Kits).
    """
    clicked = page.evaluate(f"""(args) => {{
        {_SHADOW_WALK_ALL}
        const [names, keywords] = args;
        const btns = [];
        swa(document, 'button.tablinks, [role="tab"], button', 0, btns);
        // 1. por data-name exacto
        for (const b of btns) {{
            const dn = (b.getAttribute('data-name') || '');
            if (names.includes(dn)) {{ b.click(); return true; }}
        }}
        // 2. por texto del botón
        for (const b of btns) {{
            const t = (b.textContent || '').trim().toLowerCase();
            if (keywords.some(k => t.includes(k)) && b.offsetParent !== null) {{
                b.click(); return true;
            }}
        }}
        return false;
    }}""", [data_names, text_keywords])
    if clicked:
        time.sleep(2)
        try:
            page.wait_for_load_state("networkidle", timeout=6000)
        except Exception:
            pass
    return bool(clicked)


def _extract_maintenance_kits(page) -> list:
    """
    Lee el tab 'Maintenance Kits' y lo AGRUPA: cada kit (MK####) con la lista
    de filtros que lo componen. Esta es la lista completa de filtros que Fleetguard
    ya armó para un equipo — la que un agente IA devuelve al preguntar
    "¿qué filtros lleva un CAT 325C?".

    Estructura de la tabla (en orden):
      MK14760                      ← cabecera del kit
      AF25551 | 1 | Air            ← filtro del kit
      LF3706  | 1 | Lube
      HF35308 | 1 | Hydraulic
      ...
      MKxxxxx                      ← siguiente kit

    Retorna: [ { kit_number, filters: [ {part, qty, system}, ... ] }, ... ]
    """
    return page.evaluate(f"""() => {{
        {_SHADOW_WALK_ALL}
        const PN_RE  = /^[A-Z]{{1,4}}[0-9]{{3,}}[A-Z0-9-]*$/;
        const SYS_RE = /^(air|fuel|lube|hydraulic|cabin|coolant|water|crankcase|transmission)$/i;

        const kits = [];
        let current = null;
        const fseen = new Set();   // dedup filtros dentro del kit actual

        const trs = [];
        swa(document, 'table tr', 0, trs);
        trs.forEach(tr => {{
            const cells = Array.from(tr.querySelectorAll('td'));
            const texts = cells.map(c => c.textContent.trim().replace(/\\s+/g,' ')).filter(t => t);
            if (texts.length === 0) return;
            const first = texts[0].toUpperCase();

            // Cabecera de kit: MK####
            if (/^MK[0-9]/.test(first)) {{
                current = {{ kit_number: first, filters: [] }};
                kits.push(current);
                fseen.clear();
                return;
            }}

            // Fila de filtro: part number + columna de sistema
            const part   = first;
            const system = texts.find(t => SYS_RE.test(t)) || '';
            if (!PN_RE.test(part) || !system) return;       // no es filtro de kit → fuera
            // qty: celda numérica si existe
            const qty = texts.find(t => /^[0-9]+$/.test(t)) || '';

            // Si aparece un filtro sin cabecera previa, crear kit implícito
            if (!current) {{
                current = {{ kit_number: '', filters: [] }};
                kits.push(current);
                fseen.clear();
            }}
            if (!fseen.has(part)) {{
                fseen.add(part);
                current.filters.push({{ part, qty, system }});
            }}
        }});

        // Solo kits con al menos un filtro
        return kits.filter(k => k.filters.length > 0);
    }}""")


def _extract_specs(page) -> dict:
    """Lee la tabla de specs visible por defecto (sin activar tab)."""
    return page.evaluate(f"""() => {{
        {_SHADOW_WALK_ALL}
        const specs = {{}};
        const rows = [];
        swa(document, 'dl dt, dl dd, tr td, tr th', 0, rows);
        // dl pattern: dt → dd → dt → dd ...
        let lastKey = null;
        rows.forEach(el => {{
            const tag = el.tagName.toLowerCase();
            const t   = el.textContent.trim();
            if (!t) return;
            if (tag === 'dt') {{ lastKey = t.replace(/:$/, ''); }}
            else if (tag === 'dd' && lastKey) {{ specs[lastKey] = t; lastKey = null; }}
            else if (tag === 'td' || tag === 'th') {{
                // table: collect pairs by row
            }}
        }});
        // Also table rows (th/td pairs)
        const tables = [];
        swa(document, 'table tr', 0, tables);
        tables.forEach(row => {{
            const cells = Array.from(row.querySelectorAll('td, th'));
            if (cells.length >= 2) {{
                const k = cells[0].textContent.trim().replace(/:$/, '');
                const v = cells[1].textContent.trim();
                if (!k || !v || k.length >= 80 || specs[k]) return;
                // Excluir filas de equipment ("Make - Model") y part numbers
                if (k.includes(' - ')) return;                 // equipment row
                if (/^[A-Za-z]{{1,4}}[0-9]{{3,}}/.test(k)) return; // part number row
                if (cells.length >= 3) return;                 // equipment/kit BOM (Eq|Engine|Year|Qty)
                specs[k] = v;
            }}
        }});
        return specs;
    }}""")


def _extract_related_parts(page) -> list:
    """
    Extrae 'Related Parts' (Uses Precleaner / Uses Service Part).
    Estructura confirmada: sección con h3/h4 como label y .product-name como part numbers.
    """
    return page.evaluate(f"""() => {{
        {_SHADOW_WALK_ALL}
        const parts = [];
        const seen  = new Set();

        function push(pn) {{
            pn = (pn || '').trim().toUpperCase().replace(/^0+/, '');
            if (pn && pn.length >= 3 && !seen.has(pn)) {{
                seen.add(pn); parts.push(pn);
            }}
        }}

        // Buscar el contenedor de related parts y extraer .product-name dentro
        const containers = [];
        swa(document, '[class*="related"], [class*="Related"]', 0, containers);
        containers.forEach(c => {{
            c.querySelectorAll('.product-name, [class*="part-number"], a').forEach(el => push(el.textContent));
        }});

        // Fallback: buscar todos .product-name que NO sean el producto principal
        if (parts.length === 0) {{
            const all = [];
            swa(document, '.product-name', 0, all);
            // El primero suele ser el producto principal, saltarlo
            all.slice(1).forEach(el => push(el.textContent));
        }}

        return parts;
    }}""")


def _extract_equipment_tab(page) -> list:
    """
    Equipment tab — LECTURA RÁPIDA (como Donaldson): lee la lista de equipos de
    corrido, SIN clickear cada modelo para abrir su BOM interno (eso tomaba horas:
    737 modelos × ~8s = 5h en AF25551).

    Fuente 1: links <a class="appDataDifferentp" data-name="325C" data-engine="3126">
              Caterpillar - 325C</a>  → make/model/engine de los atributos.
    Fuente 2: tabla plana (Equipment | Engine | Year | Qty).

    Retorna lista de equipos: { equipment, make, model, engine, [year, qty] }.
    El BOM por modelo NO se extrae aquí (se decide después si hace falta).
    """
    # Fuente 1 (principal): tabla plana Equipment | Engine | Year | Qty. Req.
    # Trae las 4 columnas incluyendo year y qty.
    results = page.evaluate(f"""() => {{
        {_SHADOW_WALK_ALL}
        const rows = [];
        const seen = new Set();
        const trs = [];
        swa(document, 'table tr', 0, trs);
        trs.forEach(tr => {{
            const cells = Array.from(tr.querySelectorAll('td'));
            if (cells.length < 2) return;
            const full   = cells[0].textContent.trim().replace(/\\s+/g, ' ');
            const engine = (cells[1] || {{}}).textContent?.trim().replace(/\\s+/g,' ') || '';
            const year   = (cells[2] || {{}}).textContent?.trim() || '';
            const qty    = (cells[3] || {{}}).textContent?.trim() || '';
            if (!full || full.length < 3) return;
            if (/^equipment$/i.test(full)) return;  // encabezado
            // SOLO filas de equipo ("Marca - Modelo" / "Marca -"): excluye
            // specs (Length, Largest OD...) y cross-refs que no llevan " -".
            if (!full.includes(' -')) return;
            let make = '', model = full;
            if (full.includes(' - ')) {{
                const i = full.indexOf(' - ');
                make = full.slice(0, i).trim();
                model = full.slice(i + 3).trim();
            }} else if (full.endsWith(' -')) {{
                make = full.slice(0, -2).trim();   // "Ford -" → make=Ford, model=''
                model = '';
            }}
            const key = full + '|' + engine + '|' + year;
            if (!seen.has(key)) {{
                seen.add(key);
                rows.push({{ equipment: full, make, model, engine, year, qty }});
            }}
        }});
        return rows;
    }}""")

    # Fuente 2 (fallback): links appDataDifferentp (sin year/qty)
    if not results:
        results = page.evaluate(f"""() => {{
            {_SHADOW_WALK_ALL}
            const out  = [];
            const seen = new Set();
            const all  = [];
            swa(document, 'a.appDataDifferentp', 0, all);
            all.forEach(a => {{
                const text   = a.textContent.trim().replace(/\\s+/g, ' ');
                let   model  = a.getAttribute('data-name') || '';
                const engine = a.getAttribute('data-engine') || '';
                const full   = text || model;
                if (!full) return;
                let make = '';
                if (full.includes(' - ')) {{
                    const i = full.indexOf(' - ');
                    make = full.slice(0, i).trim();
                    if (!model) model = full.slice(i + 3).trim();
                }} else if (full.includes('-') && !model) {{
                    make  = full.split('-')[0].trim();
                    model = full.split('-').slice(1).join('-').trim();
                }}
                const key = make + '|' + model + '|' + engine;
                if (!seen.has(key)) {{
                    seen.add(key);
                    out.push({{ equipment: full, make, model, engine, year: '', qty: '' }});
                }}
            }});
            return out;
        }}""")

    return results


def _read_equipment_bom(page) -> list:
    """
    Lee la tabla BOM de la vista interna del equipo.
    Filas con encabezado de sistema (Air/Fuel/Hydraulic/Lube/Cabin) cambian el
    contexto; filas de datos tienen 4-5 celdas:
      Fleetguard Part | OEM MFG | OEM Part # | Description | Qty. Req.
    """
    return page.evaluate(f"""() => {{
        {_SHADOW_WALK_ALL}
        const out  = [];
        const seen = new Set();
        const SYS  = ['Air','Fuel','Hydraulic','Lube','Cabin','Coolant','Transmission','Crankcase'];
        let system = '';

        const trs = [];
        swa(document, 'table tr', 0, trs);
        trs.forEach(tr => {{
            const tds = Array.from(tr.querySelectorAll('td'));
            const ths = Array.from(tr.querySelectorAll('th'));
            const cells = tds.length ? tds : ths;
            const texts = cells.map(c => c.textContent.trim().replace(/\\s+/g,' '));
            const nonEmpty = texts.filter(t => t);

            // Encabezado de sistema: una sola celda con nombre de sistema
            if (nonEmpty.length === 1 && SYS.includes(nonEmpty[0])) {{
                system = nonEmpty[0]; return;
            }}
            // Fila encabezado de columnas: saltar
            if (/Fleetguard/i.test(texts[0] || '') && /OEM|Part|Description|Qty/i.test(texts.join(' '))) {{
                return;
            }}
            // Fila de datos: necesita al menos parte Fleetguard + algo más
            if (tds.length >= 2) {{
                const fg   = texts[0] || '';
                if (!fg || fg.length < 2) return;
                const row = {{
                    system,
                    fleetguard_part: fg.toUpperCase(),
                    oem_mfg:     texts[1] || '',
                    oem_part:    texts[2] || '',
                    description: texts[3] || '',
                    qty:         texts[4] || '',
                }};
                const k = system + '|' + row.fleetguard_part + '|' + row.oem_part;
                if (!seen.has(k)) {{ seen.add(k); out.push(row); }}
            }}
        }});
        return out;
    }}""")


def _extract_crossref_tab(page) -> list:
    """
    Lee tabla OEM Cross Reference (tab data-name='CrossRef').
    Columnas: OEM Brand | Part Number (o similares).
    """
    return page.evaluate(f"""() => {{
        {_SHADOW_WALK_ALL}
        const refs = [];
        const seen = new Set();
        const tableRows = [];
        swa(document, 'table tr', 0, tableRows);
        const SPEC_LABELS = ['LARGEST OD','HEIGHT','FULL LIFE EFFICIENCY','LARGEST ID',
            'RATED FLOW','APPLICABLE REGION','MEDIA TYPE','LENGTH','THREAD SIZE','WIDTH',
            'WEIGHT','EFFICIENCY','MICRON','GASKET','OD','ID',
            'EFFICIENCY TEST STD','TEST STANDARD','EFFICIENCY TEST STANDARD'];
        tableRows.forEach(tr => {{
            const cells = Array.from(tr.querySelectorAll('td, th'));
            if (cells.length < 2 || cells.length > 2) return;   // cross-ref es exactamente 2 col
            const brand = cells[0].textContent.trim();
            const pn    = cells[1].textContent.trim().toUpperCase();
            const key   = brand + '|' + pn;
            if (!brand || !pn || pn.length <= 1 || seen.has(key)) return;
            if (brand.toLowerCase() === 'brand' || pn === 'PART NUMBER') return;
            // Excluir filas de specs (no son cross-refs)
            if (SPEC_LABELS.includes(brand.toUpperCase())) return;
            if (/^(ISO|SAE|ASTM|DIN|NAS|JIS)\\s?[0-9]/.test(pn)) return;  // norma, no parte
            if (/INCH|\\bMM\\b|\\//.test(pn)) return;     // valores con unidades/dimensiones
            if (/^[0-9]+$/.test(pn)) return;              // valores numéricos puros (efficiency, etc)
            if (pn.split(' ').length > 2) return;         // texto descriptivo
            seen.add(key);
            refs.push({{ brand, part_number: pn }});
        }});

        // Fallback: sección "OEM Cross Reference" en divs/spans (sin <table>).
        // Confirmado en AF463: los pares brand/part son nodos de texto planos
        // dentro de shadow roots anidados — container.querySelectorAll NO los
        // alcanza. Usamos swa() que sí penetra shadow roots, y subimos el árbol
        // con parentNode en lugar de parentElement para cruzar shadow boundaries.
        if (refs.length === 0) {{
            const heads = [];
            swa(document, '*', 0, heads);
            const header = heads.find(h => {{
                // Buscar nodo cuyo texto propio (sin subtree) sea exactamente
                // "OEM Cross Reference" o variantes.
                const own = Array.from(h.childNodes)
                    .filter(n => n.nodeType === 3)
                    .map(n => n.textContent.trim()).join(' ').trim();
                return /^oem cross reference$/i.test(own) || /^cross reference$/i.test(own);
            }});
            if (header) {{
                // Subir hasta encontrar un contenedor con suficientes hijos con texto
                function shadowParent(n) {{
                    if (n.parentElement) return n.parentElement;
                    const r = n.parentNode;
                    return (r && r.nodeType === 11 && r.host) ? r.host : null;
                }}
                let container = shadowParent(header);
                for (let d = 0; d < 6 && container; d++) {{
                    const leafTexts = [];
                    const allEls = [];
                    swa(container, '*', 0, allEls);  // shadow-piercing
                    allEls.forEach(el => {{
                        if (el.children.length === 0 && !el.shadowRoot) {{
                            const t = el.textContent.trim();
                            if (t) leafTexts.push(t);
                        }}
                    }});
                    const idx = leafTexts.findIndex(t => /oem cross reference/i.test(t));
                    const items = idx >= 0 ? leafTexts.slice(idx + 1) : leafTexts;
                    if (items.length >= 4) {{
                        for (let j = 0; j + 1 < items.length; j += 2) {{
                            const brand = items[j];
                            const pn    = items[j + 1].toUpperCase();
                            const key   = brand + '|' + pn;
                            if (!brand || !pn || pn.length <= 1 || seen.has(key)) continue;
                            if (SPEC_LABELS.includes(brand.toUpperCase())) continue;
                            if (/^(ISO|SAE|ASTM|DIN|NAS|JIS)\\s?[0-9]/.test(pn)) continue;
                            if (/INCH|\\bMM\\b|\\//.test(pn)) continue;
                            if (/^[0-9]{6,}$/.test(pn)) continue; // numérico largo (spec value)
                            if (pn.split(' ').length > 2) continue;
                            seen.add(key);
                            refs.push({{ brand, part_number: pn }});
                        }}
                        break;
                    }}
                    container = shadowParent(container);
                }}
            }}
        }}

        return refs;
    }}""")


# ── Image extraction ─────────────────────────────────────────────────────────

def _extract_image_url(page) -> str:
    """
    Extrae la URL de la imagen principal del producto desde Shadow DOM.
    Fleetguard/Salesforce B2B: imagen en <img> dentro de componentes LWC.
    Descarta: logos, íconos, placeholders, imágenes < 80px.
    """
    return page.evaluate(f"""() => {{
        {_SHADOW_WALK_ALL}

        const SKIP_TERMS = ['logo','icon','flag','sprite','blank',
                            'placeholder','loading','avatar','arrow',
                            'chevron','caret','close','search','cart'];
        function isSkip(s) {{
            if (!s) return true;
            const l = s.toLowerCase();
            return SKIP_TERMS.some(t => l.includes(t));
        }}

        // Colectar todas las <img> traversando Shadow DOM
        const imgs = [];
        swa(document, 'img', 0, imgs);

        // Ordenar: imágenes más grandes primero (preferir foto de producto)
        const candidates = imgs
            .map(img => ({{
                src: img.src || img.getAttribute('src') || '',
                alt: img.alt || '',
                cls: (typeof img.className === 'string' ? img.className : '') || '',
                w:   img.naturalWidth  || parseInt(img.getAttribute('width')  || '0'),
                h:   img.naturalHeight || parseInt(img.getAttribute('height') || '0'),
            }}))
            .filter(c => {{
                if (!c.src || c.src.startsWith('data:')) return false;
                if (isSkip(c.src) || isSkip(c.alt) || isSkip(c.cls)) return false;
                if (c.w > 0 && c.w < 80) return false;   // ícono pequeño
                return true;
            }})
            .sort((a, b) => (b.w * b.h) - (a.w * a.h));   // mayor área primero

        return candidates.length ? candidates[0].src : null;
    }}""")


def _download_image(src_url: str, part_number: str) -> tuple:
    """
    Descarga la imagen del producto y la guarda en IMAGES_DIR.
    Retorna (local_filename, public_url) o (None, None) si falla.

    Nombre de archivo: [PART_NUMBER].[ext]
    URL pública:       /images/fleetguard/[PART_NUMBER].[ext]
    """
    if not src_url or not part_number:
        return None, None

    os.makedirs(IMAGES_DIR, exist_ok=True)

    # Determinar extensión desde URL o Content-Type
    ext = "jpg"
    path_part = src_url.split("?")[0].split("/")[-1]
    if "." in path_part:
        candidate = path_part.rsplit(".", 1)[-1].lower()
        if candidate in ("jpg", "jpeg", "png", "webp", "gif"):
            ext = "jpeg" if candidate == "jpeg" else candidate

    pn_clean   = part_number.upper().replace("/", "-")
    filename   = f"{pn_clean}.{ext}"
    local_path = os.path.join(IMAGES_DIR, filename)
    public_url = f"{PUBLIC_IMG_BASE}/{filename}"

    # No re-descargar si ya existe
    if os.path.exists(local_path) and os.path.getsize(local_path) > 500:
        return filename, public_url

    try:
        req = urllib.request.Request(
            src_url,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                                   "AppleWebKit/537.36 (KHTML, like Gecko) "
                                   "Chrome/124.0.0.0 Safari/537.36",
                     "Referer":    "https://www.fleetguard.com/"},
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            ct = resp.headers.get("Content-Type", "")
            # Ajustar extensión por Content-Type si hace falta
            if "png" in ct:
                ext = "png"
                filename   = f"{pn_clean}.png"
                local_path = os.path.join(IMAGES_DIR, filename)
                public_url = f"{PUBLIC_IMG_BASE}/{filename}"
            elif "webp" in ct:
                ext = "webp"
                filename   = f"{pn_clean}.webp"
                local_path = os.path.join(IMAGES_DIR, filename)
                public_url = f"{PUBLIC_IMG_BASE}/{filename}"
            data = resp.read()
        with open(local_path, "wb") as f:
            f.write(data)
        logging.info(f"    img: {filename} ({len(data)//1024} KB)")
        return filename, public_url
    except urllib.error.URLError as e:
        logging.warning(f"    img FAIL [{part_number}]: {e.reason}")
        return None, None
    except Exception as e:
        logging.warning(f"    img FAIL [{part_number}]: {e}")
        return None, None


def download_images_batch(results_file: str):
    """
    Modo retroactivo: lee un _results.json existente, descarga imágenes
    para cada producto usando Playwright, y actualiza image_src / image_url.
    Uso:
        python scraper_fleetguard.py --download-images air-precleaners
    """
    if not os.path.exists(results_file):
        logging.error(f"Archivo no encontrado: {results_file}")
        return

    with open(results_file, encoding="utf-8") as f:
        results = json.load(f)

    pending = [r for r in results if not r.get("image_src")]
    logging.info(f"Productos sin imagen: {len(pending)} / {len(results)}")
    if not pending:
        logging.info("Todas las imágenes ya descargadas.")
        return

    with sync_playwright() as pw:
        ctx = launch_context(pw)
        page = ctx.new_page()
        if STEALTH:
            stealth_sync(page)

        for idx, prod in enumerate(results, 1):
            if prod.get("image_src"):
                continue
            url = prod.get("url", "")
            pn  = prod.get("part_number", "")
            if not url:
                continue
            logging.info(f"[img {idx}/{len(results)}] {pn}")
            try:
                page.goto(url, timeout=60000, wait_until="domcontentloaded")
                time.sleep(3)
                dismiss_popups(page)
                try:
                    page.wait_for_load_state("networkidle", timeout=15000)
                except Exception:
                    pass
                src = _extract_image_url(page)
                if src:
                    fname, pub = _download_image(src, pn)
                    prod["image_src"] = src
                    prod["image_url"] = pub
                else:
                    prod["image_src"] = None
                    prod["image_url"] = None
                    logging.warning(f"    sin imagen: {pn}")
            except Exception as e:
                logging.warning(f"    ERROR {pn}: {e}")
            rand_sleep(3, 7)

        ctx.close()

    with open(results_file, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    downloaded = sum(1 for r in results if r.get("image_url"))
    logging.info(f"✅ Imágenes descargadas: {downloaded} / {len(results)}")


# ── Product scraper ───────────────────────────────────────────────────────────

def _is_empty(result: dict) -> bool:
    """True si no extrajo nada (0/0/0/0) — posible carga incompleta."""
    return (not result["attributes"] and not result["cross_references"]
            and not result["alternatives"] and not result["equipment"])


def _scrape_once(page, url: str, result: dict, settle: float):
    """Una pasada de extracción. settle = espera extra (s) tras cargar la página."""
    page.goto(url, timeout=60000, wait_until="domcontentloaded")
    time.sleep(settle)
    dismiss_popups(page)
    wait_net(page, 20000)
    time.sleep(settle)
    wait_for_tabs(page)  # esperar a que LWC tabs terminen de inicializarse

    # ── Part number + nombre/tipo + descripción ──────────────────────
    info = page.evaluate(f"""() => {{
        {_SHADOW_WALK}
        {_SHADOW_WALK_ALL}
        const txt = el => el ? el.textContent.trim().replace(/\\s+/g,' ') : '';

        const pnEl   = sw(document, 'h2.product-name', 0) ||
                       sw(document, '.product-name', 0);
        const pn = pnEl ? pnEl.textContent.trim().toUpperCase() : '';

        // Tipo/nombre: "Air Filter, Primary" — NO el part number, NO el párrafo.
        // Buscar texto corto que parezca tipo de producto (lleva "Filter"/"Element"
        // o una coma), distinto del código y fuera de tablas.
        let name = '';
        const titleEls = [];
        swa(document, 'h1, h2, h3, [class*="product-title"], [class*="product-type"], ' +
                      '[class*="product-name-type"], [class*="category"]', 0, titleEls);
        for (const el of titleEls) {{
            const t = txt(el);
            if (!t || t.length > 60) continue;
            if (t.toUpperCase() === pn) continue;            // es el código, saltar
            if (el.closest && el.closest('table')) continue; // dentro de tabla, saltar
            if (/filter|element|cartridge|breather|coolant|fuel|hydraulic|oil|cabin/i.test(t)) {{
                name = t; break;
            }}
        }}

        // Descripción larga: párrafo(s) que describen el producto.
        let desc = '';
        const cand = [];
        swa(document, '[class*="product-description"], [class*="productDescription"], ' +
                      '[class*="long-description"], [class*="overview"], ' +
                      '[itemprop="description"]', 0, cand);
        for (const c of cand) {{
            const t = txt(c);
            if (t.length > desc.length) desc = t;
        }}
        // Fallback: el <p> más largo, excluyendo footer/legal/login.
        if (desc.length < 40) {{
            const ps = [];
            swa(document, 'p', 0, ps);
            ps.forEach(p => {{
                const t = txt(p);
                if (/log in|sign up|privacy|cookie|nashville|all rights/i.test(t)) return;
                if (t.length > desc.length) desc = t;
            }});
        }}

        return {{ pn, name, description: desc }};
    }}""")
    result["part_number"] = info.get("pn") or result["part_number"]
    result["name"]        = info.get("name") or result["name"]
    result["description"] = info.get("description") or result.get("description", "")
    logging.info(f"    name: {result['name'][:40]!r} | desc: {len(result['description'])} ch")

    if not result["part_number"]:
        for seg in reversed(url.rstrip("/").split("/")):
            if len(seg) >= 3 and seg.replace("-", "").isalnum():
                result["part_number"] = seg.upper(); break

    # ── Imagen del producto ─────────────────────────────────────────────
    # URL generada por convención: /images/fleetguard/[PN].jpg
    # No se hace scraping ni descarga — la imagen se sirve desde CDN propio.
    pn_img = (result.get("part_number") or "").upper().replace("/", "-")
    if pn_img and not result.get("image_url"):
        result["image_src"] = None
        result["image_url"] = f"{PUBLIC_IMG_BASE}/{pn_img}.jpg"

    if not SCRAPE_KITS_ONLY:
        # ── Specs (visibles por defecto, sin tab) ────────────────────────
        result["attributes"] = _extract_specs(page)
        logging.info(f"    attr: {len(result['attributes'])}")

        # ── Related Parts / Alternativas ─────────────────────────────────
        result["alternatives"] = _extract_related_parts(page)
        logging.info(f"    alt: {len(result['alternatives'])}")

        # ── Cross Reference (tab data-name="CrossRef") ───────────────────
        _click_tab(page, "CrossRef")
        result["cross_references"] = _extract_crossref_tab(page)
        logging.info(f"    cross: {len(result['cross_references'])}")

    # ── Equipment (filas de máquinas que usan este filtro) ──────────
    if SCRAPE_EQUIPMENT and not SCRAPE_KITS_ONLY:
        _click_tab(page, "Equipment")
        result["equipment"] = _extract_equipment_tab(page)
        logging.info(f"    equip: {len(result['equipment'])}")

    # ── Maintenance Kits (kits de servicio que incluyen este filtro) ─
    # Se extrae siempre que SCRAPE_EQUIPMENT=True O SCRAPE_KITS_ONLY=True.
    if SCRAPE_EQUIPMENT or SCRAPE_KITS_ONLY:
        if _click_tab_flexible(page,
                               ["MaintenanceKits", "MaintKits", "Kits", "Maintenance"],
                               ["maintenance kit", "maintenance", "kit"]):
            result["maintenance_kits"] = _extract_maintenance_kits(page)
        logging.info(f"    kits: {len(result['maintenance_kits'])}")


def scrape_product(page, url: str) -> dict:
    result = {
        "url": url,
        "part_number": "",
        "name": "",
        "description": "",
        "image_src": None,    # URL original en CDN de Fleetguard/Salesforce
        "image_url": None,    # URL pública propia: /images/fleetguard/[PN].jpg
        "attributes": {},
        "cross_references": [],
        "alternatives": [],
        "equipment": [],
        "maintenance_kits": [],
        "error": None,
        "scraped_at": str(datetime.now()),
    }

    try:
        _scrape_once(page, url, result, settle=3)

        # Reintento si 0/0/0/0: muchas páginas (AP8404, AP8400...) cargan
        # lento y la extracción corrió antes de tiempo. Recargar con más espera.
        if _is_empty(result):
            logging.info("    ⟳ 0/0/0/0 — reintentando con espera larga")
            time.sleep(2)
            _scrape_once(page, url, result, settle=7)
            if _is_empty(result):
                logging.info("    (vacío confirmado tras reintento)")

    except PlaywrightTimeout:
        result["error"] = "timeout"
        logging.warning(f"  TIMEOUT: {url}")
    except Exception as e:
        result["error"] = str(e)
        logging.error(f"  ERROR: {url} — {e}")

    return result


def _activate_shadow_tab(page, keywords: list):
    page.evaluate("""(keywords) => {
        function findAndClick(root, depth=0) {
            if (depth > 10) return false;
            const els = root.querySelectorAll('button, a, [role="tab"], li');
            for (const el of els) {
                const t = (el.textContent || el.getAttribute('aria-label') || '').toLowerCase().trim();
                if (el.offsetParent && keywords.some(k => t.includes(k))) {
                    el.click(); return true;
                }
            }
            for (const el of root.querySelectorAll('*')) {
                if (el.shadowRoot && findAndClick(el.shadowRoot, depth+1)) return true;
            }
            return false;
        }
        findAndClick(document);
    }""", keywords)
    time.sleep(2)


def _shadow_extract_table(page) -> dict:
    return page.evaluate("""() => {
        const specs = {};
        function walk(root, depth=0) {
            if (depth > 10) return;
            root.querySelectorAll('tr').forEach(row => {
                const cells = row.querySelectorAll('td, th');
                if (cells.length >= 2) {
                    const k = cells[0].textContent.trim().replace(/:$/, '');
                    const v = cells[1].textContent.trim();
                    if (k && v && k.length < 80) specs[k] = v;
                }
            });
            root.querySelectorAll('[class*="spec"],[class*="attribute"],[class*="detail"]').forEach(el => {
                const label = el.querySelector('[class*="label"],[class*="name"],dt');
                const value = el.querySelector('[class*="value"],[class*="data"],dd');
                if (label && value) {
                    const k = label.textContent.trim().replace(/:$/, '');
                    const v = value.textContent.trim();
                    if (k && v && k.length < 80) specs[k] = v;
                }
            });
            root.querySelectorAll('*').forEach(el => {
                if (el.shadowRoot) walk(el.shadowRoot, depth+1);
            });
        }
        walk(document);
        return specs;
    }""")


def _shadow_extract_table_rows(page) -> list:
    return page.evaluate("""() => {
        const rows = [];
        const seen = new Set();
        function walk(root, depth=0) {
            if (depth > 10) return;
            root.querySelectorAll('tr').forEach(row => {
                const cells = Array.from(row.querySelectorAll('td'));
                if (cells.length >= 2) {
                    const brand = cells[0].textContent.trim();
                    const pn    = cells[1].textContent.trim();
                    const key   = brand + '|' + pn;
                    if (brand && pn && pn.length > 1 && !seen.has(key)) {
                        seen.add(key);
                        rows.push({ brand, part_number: pn.toUpperCase() });
                    }
                }
            });
            root.querySelectorAll('*').forEach(el => {
                if (el.shadowRoot) walk(el.shadowRoot, depth+1);
            });
        }
        walk(document);
        return rows;
    }""")


def _shadow_extract_part_numbers(page) -> list:
    return page.evaluate("""() => {
        const alts = [];
        const seen = new Set();
        function push(pn) {
            pn = (pn || '').trim().toUpperCase();
            if (pn && pn.length >= 3 && !seen.has(pn)) { seen.add(pn); alts.push(pn); }
        }
        function walk(root, depth=0) {
            if (depth > 10) return;
            root.querySelectorAll('[class*="alternate"],[class*="replace"],[class*="supersede"],[class*="similar"]').forEach(el => {
                const pnEl = el.querySelector('[class*="part-number"],[class*="partNumber"],[data-part]');
                if (pnEl) push(pnEl.textContent);
                else {
                    const t = el.textContent.trim();
                    if (t && t.length < 30) push(t);
                }
            });
            root.querySelectorAll('*').forEach(el => {
                if (el.shadowRoot) walk(el.shadowRoot, depth+1);
            });
        }
        walk(document);
        return alts;
    }""")


# ── Test mode ────────────────────────────────────────────────────────────────

def test_one(url: str):
    with sync_playwright() as pw:
        ctx = launch_context(pw)
        page = ctx.new_page()
        if STEALTH:
            stealth_sync(page)
        data = scrape_product(page, url)
        ctx.close()
    print(json.dumps(data, ensure_ascii=False, indent=2))


# ── Main ──────────────────────────────────────────────────────────────────────

def _code_from_url(url: str) -> str:
    """AF25551 desde https://www.fleetguard.com/product/AF25551"""
    seg = url.rstrip("/").split("/")[-1]
    return seg.strip().upper()


def collect_codes_only():
    """
    Modo rápido: solo recolecta los códigos base de la categoría (vía API +
    Shadow DOM al paginar) y los guarda. NO visita cada producto, NO extrae
    equipment/BOM. Minutos en vez de días.
    Salida: fleetguard_{cat}_codes.json
    """
    with sync_playwright() as pw:
        ctx = launch_context(pw)
        page = ctx.new_page()
        if STEALTH:
            stealth_sync(page)
        urls = collect_product_links(page, CATEGORY_URL)
        ctx.close()

    codes = sorted({_code_from_url(u) for u in urls if _code_from_url(u)})
    out = os.path.join(OUTPUT_DIR, f"fleetguard_{CATEGORY_NAME}_codes.json")
    payload = {
        "category":   CATEGORY_NAME,
        "source_url": CATEGORY_URL,
        "scraped_at": str(datetime.now()),
        "total":      len(codes),
        "codes":      codes,
    }
    with open(out, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    logging.info(f"✅ Solo códigos — {len(codes)} códigos base en {out}")


def main(start_from: str = "", recollect: bool = False):
    with sync_playwright() as pw:
        ctx = launch_context(pw)
        page = ctx.new_page()
        if STEALTH:
            stealth_sync(page)

        progress = load_progress()

        if not progress["part_numbers"] or recollect:
            # recollect=True: re-pagina la categoría y FUSIONA las URLs nuevas
            # sin perder done/results (lo ya scrapeado se conserva).
            fresh = collect_product_links(page, CATEGORY_URL)
            if recollect:
                prev = set(progress["part_numbers"])
                merged = list(progress["part_numbers"]) + [u for u in fresh if u not in prev]
                added = len(merged) - len(progress["part_numbers"])
                progress["part_numbers"] = merged
                logging.info(f"Re-recolectado — +{added} URLs nuevas (total {len(merged)})")
            else:
                progress["part_numbers"] = fresh
            save_progress(progress)
            urls = progress["part_numbers"]
        else:
            urls = progress["part_numbers"]
            logging.info(f"Reanudando — {len(urls)} URLs totales")

        # Arrancar en un producto específico (salta todo lo anterior en la lista)
        if start_from:
            sf = start_from.strip().upper()
            idx0 = next((i for i, u in enumerate(urls) if sf in u.upper()), None)
            if idx0 is None:
                logging.warning(f"⚠ '{start_from}' no está en la lista — corriendo desde el inicio")
            else:
                logging.info(f"Comenzando en {start_from} (índice {idx0}/{len(urls)})")
                urls = urls[idx0:]

        done_set = set(progress["done"])
        results  = progress["results"]
        pending  = [u for u in urls if u not in done_set]
        logging.info(f"Pendientes: {len(pending)} / {len(urls)}")

        for idx, url in enumerate(pending, 1):
            logging.info(f"[{idx}/{len(pending)}] {url}")
            data = scrape_product(page, url)

            na = len(data["attributes"])
            nc = len(data["oem_codes"])
            nl = len(data["alternatives"])
            ne = len(data["equipment"])
            nk = len(data.get("maintenance_kits", []))
            st = "✅" if not data["error"] else "❌"
            logging.info(f"  {st} {data['part_number']} → {na} Attr | {nc} Cross | {nl} Alt | {ne} Equip | {nk} Kits")

            results.append(data)
            done_set.add(url)
            progress["done"]    = list(done_set)
            progress["results"] = results
            save_progress(progress)

            rand_sleep()

        ctx.close()

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    logging.info(f"✅ Completo — {len(results)} productos en {OUTPUT_FILE}")

    build_equipment_matrix(results)


def retry_empty():
    """
    Re-scrapea solo los productos 0/0/0/0 (sin error) de una corrida previa.
    Lee el progress, actualiza in-place los que ahora sí traigan datos.
    """
    progress = load_progress()
    results = progress.get("results", [])
    if not results:
        logging.info("No hay resultados previos para reintentar.")
        return

    empties = [r for r in results
               if not r.get("error")
               and not r.get("attributes") and not r.get("cross_references")
               and not r.get("alternatives") and not r.get("equipment")]
    logging.info(f"Vacíos a reintentar: {len(empties)} / {len(results)}")
    if not empties:
        return

    with sync_playwright() as pw:
        ctx = launch_context(pw)
        page = ctx.new_page()
        if STEALTH:
            stealth_sync(page)

        for idx, old in enumerate(empties, 1):
            url = old["url"]
            logging.info(f"[retry {idx}/{len(empties)}] {url}")
            fresh = scrape_product(page, url)
            # Reemplazar in-place dentro de results
            for i, r in enumerate(results):
                if r["url"] == url:
                    results[i] = fresh
                    break
            na, nc = len(fresh["attributes"]), len(fresh["cross_references"])
            nl, ne = len(fresh["alternatives"]), len(fresh["equipment"])
            logging.info(f"  → {fresh['part_number']}: {na} Attr | {nc} Cross | {nl} Alt | {ne} Equip")
            progress["results"] = results
            save_progress(progress)
            rand_sleep()

        ctx.close()

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    logging.info(f"✅ Reintento completo — {OUTPUT_FILE}")
    build_equipment_matrix(results)


def equipment_only_run():
    """
    Re-scrapea SOLO los tabs Equipment + MaintenanceKits para productos que
    tengan equipment=[] en el _results.json existente. No toca specs/cross/alts.
    Uso: python scraper_fleetguard.py --equipment-only air-primary-secondary
    """
    if not os.path.exists(OUTPUT_FILE):
        logging.error(f"No existe {OUTPUT_FILE} — corre la categoría completa primero")
        return

    with open(OUTPUT_FILE, encoding="utf-8") as f:
        results = json.load(f)

    targets = [r for r in results
               if (not r.get("equipment") or not r.get("maintenance_kits"))
               and not r.get("error")]
    logging.info(f"Productos sin equipment y/o kits: {len(targets)} / {len(results)}")
    if not targets:
        logging.info("Todos los productos ya tienen equipment. Nada que hacer.")
        build_equipment_matrix(results)
        return

    with sync_playwright() as pw:
        ctx = launch_context(pw)
        page = ctx.new_page()
        if STEALTH:
            stealth_sync(page)

        for idx, prod in enumerate(targets, 1):
            url = prod.get("url") or f"https://www.fleetguard.com/product/{prod['part_number']}"
            logging.info(f"[equip {idx}/{len(targets)}] {url}")
            try:
                page.goto(url, timeout=60000, wait_until="domcontentloaded")
                time.sleep(3)
                dismiss_popups(page)
                wait_net(page, 20000)
                time.sleep(3)
                wait_for_tabs(page)

                # Equipment tab
                _click_tab(page, "Equipment")
                equipment = _extract_equipment_tab(page)
                if not equipment:
                    time.sleep(3)
                    _click_tab(page, "Equipment")
                    equipment = _extract_equipment_tab(page)
                prod["equipment"] = equipment

                # Maintenance Kits tab
                kits = []
                if _click_tab_flexible(page,
                                       ["MaintenanceKits", "MaintKits", "Kits", "Maintenance"],
                                       ["maintenance kit", "maintenance", "kit"]):
                    kits = _extract_maintenance_kits(page)
                prod["maintenance_kits"] = kits

                logging.info(f"  → {prod['part_number']}: {len(equipment)} equipos | {len(kits)} kits")
            except Exception as e:
                logging.warning(f"  ERROR {prod['part_number']}: {e}")
            # Guardar progreso parcial cada 10 productos
            if idx % 10 == 0:
                with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
                    json.dump(results, f, ensure_ascii=False, indent=2)
                logging.info(f"  Guardado parcial ({idx}/{len(targets)})")
            rand_sleep()

        ctx.close()

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    logging.info(f"✅ Equipment + Kits actualizados — {OUTPUT_FILE}")
    build_equipment_matrix(results)


def crossref_only_run():
    """
    Re-scrapea SOLO el cross-reference (oem_codes) para productos que tengan
    oem_codes=[] en el _results.json existente. No toca specs/equipment/kits.
    Pensado para recuperar datos perdidos por el bug de <th> en _extract_crossref_tab
    (corregido en 754ac8c5) sin tener que re-scrapear la categoría completa.
    Uso: python scraper_fleetguard.py --crossref-only air-primary-secondary
    """
    if not os.path.exists(OUTPUT_FILE):
        logging.error(f"No existe {OUTPUT_FILE} — corre la categoría completa primero")
        return

    with open(OUTPUT_FILE, encoding="utf-8") as f:
        results = json.load(f)

    targets = [r for r in results if not r.get("cross_references") and not r.get("error")]
    logging.info(f"Productos sin cross-reference: {len(targets)} / {len(results)}")
    if not targets:
        logging.info("Todos los productos ya tienen cross-reference. Nada que hacer.")
        return

    with sync_playwright() as pw:
        ctx = launch_context(pw)
        page = ctx.new_page()
        if STEALTH:
            stealth_sync(page)

        for idx, prod in enumerate(targets, 1):
            url = prod.get("url") or f"https://www.fleetguard.com/product/{prod['part_number']}"
            logging.info(f"[crossref {idx}/{len(targets)}] {url}")
            try:
                page.goto(url, timeout=60000, wait_until="domcontentloaded")
                time.sleep(3)
                dismiss_popups(page)
                wait_net(page, 20000)
                time.sleep(3)
                wait_for_tabs(page)

                _click_tab(page, "CrossRef")
                oem_codes = _extract_crossref_tab(page)
                if not oem_codes:
                    time.sleep(3)
                    _click_tab(page, "CrossRef")
                    oem_codes = _extract_crossref_tab(page)
                prod["cross_references"] = oem_codes

                logging.info(f"  → {prod['part_number']}: {len(oem_codes)} cross-refs")
            except Exception as e:
                logging.warning(f"  ERROR {prod['part_number']}: {e}")
            # Guardar progreso parcial cada 10 productos
            if idx % 10 == 0:
                with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
                    json.dump(results, f, ensure_ascii=False, indent=2)
                logging.info(f"  Guardado parcial ({idx}/{len(targets)})")
            rand_sleep()

        ctx.close()

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    logging.info(f"✅ Cross-reference actualizado — {OUTPUT_FILE}")


def build_equipment_matrix(results: list):
    """
    Construye matriz equipo → filtros para búsqueda por equipo.
    Cada equipo único agrega source_products (todos los filtros Fleetguard que usa).
    Archivo: fleetguard_{cat}_equipment_matrix.json
    """
    # key: make|model|engine → {make, model, engine, equipment, source_products}
    matrix = {}

    for prod in results:
        pn = prod.get("part_number", "")
        for eq in prod.get("equipment", []):
            if not isinstance(eq, dict):
                continue
            make   = eq.get("make", "")
            model  = eq.get("model", "")
            engine = eq.get("engine", "")
            key = f"{make}|{model}|{engine}".strip("|")
            if not key:
                continue
            if key not in matrix:
                matrix[key] = {
                    "make":            make,
                    "model":           model,
                    "engine":          engine,
                    "equipment":       eq.get("equipment", ""),
                    "source_products": [],  # todos los filtros Fleetguard que usa este equipo
                }
            entry = matrix[key]
            if pn and pn not in entry["source_products"]:
                entry["source_products"].append(pn)

    out_file = os.path.join(OUTPUT_DIR, f"fleetguard_{CATEGORY_NAME}_equipment_matrix.json")
    matrix_list = sorted(matrix.values(), key=lambda e: (e["make"], e["model"]))
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(matrix_list, f, ensure_ascii=False, indent=2)
    logging.info(f"✅ Matriz equipos — {len(matrix_list)} equipos en {out_file}")


# ── CLI ───────────────────────────────────────────────────────────────────────

def _usage():
    print(__doc__)

if __name__ == "__main__":
    argv = sys.argv[1:]
    if not argv or argv[0] in ("-h", "--help"):
        _usage(); sys.exit(0)

    if argv[0] == "--login":
        login_session(); sys.exit(0)

    if argv[0] == "--inspect":
        url = argv[1] if len(argv) > 1 else ""
        if not url: print("ERROR: --inspect necesita URL"); sys.exit(1)
        inspect_page(url); sys.exit(0)

    if argv[0] == "--test":
        url = argv[1] if len(argv) > 1 else ""
        if not url: print("ERROR: --test necesita URL de producto"); sys.exit(1)
        test_one(url); sys.exit(0)

    if argv[0] == "--dump-crossref":
        # python scraper_fleetguard.py --dump-crossref AF463 AF25728 AF836
        pns = argv[1:]
        if not pns:
            print("ERROR: --dump-crossref necesita 1+ part numbers (ej. AF463 AF25728)")
            sys.exit(1)
        dump_crossref_html(pns); sys.exit(0)

    if argv[0] == "--equipment-only":
        # python scraper_fleetguard.py --equipment-only <categoria>
        name = argv[1].lower() if len(argv) > 1 else ""
        if not name:
            print("ERROR: --equipment-only necesita la categoría (ej. air-primary-secondary)")
            sys.exit(1)
        configure(name, CATEGORIES.get(name, ""))
        logging.info(f"Solo equipment: {name}")
        equipment_only_run(); sys.exit(0)

    if argv[0] == "--crossref-only":
        # python scraper_fleetguard.py --crossref-only <categoria>
        name = argv[1].lower() if len(argv) > 1 else ""
        if not name:
            print("ERROR: --crossref-only necesita la categoría (ej. air-primary-secondary)")
            sys.exit(1)
        configure(name, CATEGORIES.get(name, ""))
        logging.info(f"Solo cross-reference: {name}")
        crossref_only_run(); sys.exit(0)

    if argv[0] == "--retry-empty":
        # python scraper_fleetguard.py --retry-empty <categoria>
        name = argv[1].lower() if len(argv) > 1 else ""
        url  = CATEGORIES.get(name, "")
        if not name:
            print("ERROR: --retry-empty necesita la categoría (ej. air-precleaners)")
            sys.exit(1)
        configure(name, url)
        logging.info(f"Reintentando vacíos: {name}")
        retry_empty(); sys.exit(0)

    if argv[0] == "--download-images":
        # python scraper_fleetguard.py --download-images air-precleaners
        name = argv[1].lower() if len(argv) > 1 else ""
        if not name:
            print("ERROR: --download-images necesita la categoría (ej. air-precleaners)")
            sys.exit(1)
        configure(name, CATEGORIES.get(name, ""))
        results_f = os.path.join(OUTPUT_DIR, f"fleetguard_{name}_results.json")
        logging.info(f"Descarga retroactiva de imágenes: {name}")
        download_images_batch(results_f); sys.exit(0)

    if argv[0] == "--batch":
        # python scraper_fleetguard.py --batch air-primary-secondary lube-cartridge fuel-spin-on
        # Corre categorías en secuencia, reanudando desde progreso existente.
        names = [a.lower() for a in argv[1:] if not a.startswith("--")]
        if not names:
            print("ERROR: --batch necesita al menos una categoría")
            print(f"Disponibles: {list(CATEGORIES.keys())}")
            sys.exit(1)
        for bname in names:
            burl = CATEGORIES.get(bname, "")
            if not burl:
                logging.warning(f"BATCH: '{bname}' no conocida — saltando")
                continue
            configure(bname, burl)
            logging.info(f"\n{'='*65}")
            logging.info(f"BATCH [{names.index(bname)+1}/{len(names)}]: {bname}")
            logging.info(f"{'='*65}")
            main()
        logging.info(f"\nBATCH COMPLETO — {len(names)} categorías procesadas")
        sys.exit(0)

    if argv[0] == "--fix-crossrefs":
        # python scraper_fleetguard.py --fix-crossrefs air-precleaners
        # Post-procesa un _results.json existente: elimina cross_references
        # que sean spec labels (Applicable Region, etc.) y guarda el JSON limpio.
        name = argv[1].lower() if len(argv) > 1 else ""
        if not name:
            print("ERROR: --fix-crossrefs necesita la categoría (ej. air-precleaners)")
            sys.exit(1)
        configure(name, CATEGORIES.get(name, ""))
        out_f = os.path.join(OUTPUT_DIR, f"fleetguard_{name}_results.json")
        if not os.path.exists(out_f):
            print(f"ERROR: {out_f} no existe"); sys.exit(1)
        with open(out_f, encoding="utf-8") as f:
            results = json.load(f)
        SPEC_LABELS_SET = {
            'LARGEST OD','HEIGHT','FULL LIFE EFFICIENCY','LARGEST ID',
            'RATED FLOW','APPLICABLE REGION','MEDIA TYPE','LENGTH',
            'THREAD SIZE','WIDTH','WEIGHT','EFFICIENCY','MICRON','GASKET',
            'OD','ID','EFFICIENCY TEST STD','TEST STANDARD',
            'EFFICIENCY TEST STANDARD','OUTLET DIAMETER','OVERALL WIDTH',
        }
        fixed = 0
        for prod in results:
            raw = prod.get("cross_references", [])
            cleaned = [
                r for r in raw
                if r.get("brand","").upper().strip() not in SPEC_LABELS_SET
                and r.get("part_number","").upper().strip() not in SPEC_LABELS_SET
            ]
            if len(cleaned) != len(raw):
                prod["cross_references"] = cleaned
                fixed += 1
        with open(out_f, "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        logging.info(f"✅ --fix-crossrefs: {fixed} productos corregidos en {out_f}")
        sys.exit(0)

    # Parsear flags en cualquier posición
    start_from = ""
    codes_only = False
    recollect  = False
    rest = []
    i = 0
    while i < len(argv):
        if argv[i] == "--start" and i + 1 < len(argv):
            start_from = argv[i + 1]; i += 2; continue
        if argv[i] == "--codes-only":
            codes_only = True; i += 1; continue
        if argv[i] == "--recollect":
            # Re-pagina la categoría y fusiona URLs nuevas al progress, sin
            # perder lo ya scrapeado (done/results se conservan).
            recollect = True; i += 1; continue
        if argv[i] == "--no-equipment":
            SCRAPE_EQUIPMENT = False; i += 1; continue
        if argv[i] == "--no-images":
            globals()["SCRAPE_IMAGES"] = False; i += 1; continue
        if argv[i] == "--headless":
            globals()["HEADLESS"] = True; i += 1; continue
        if argv[i] == "--kits-only":
            # Solo extrae part_number + maintenance_kits. Omite specs/cross/equipment.
            # Modo más rápido: útil cuando solo se necesita la lista de filtros por kit.
            globals()["SCRAPE_KITS_ONLY"] = True
            i += 1; continue
        rest.append(argv[i]); i += 1
    argv = rest

    name = argv[0].lower()
    url  = argv[1] if len(argv) > 1 else CATEGORIES.get(name, "")
    if not url:
        print(f"ERROR: categoría '{name}' no conocida.")
        print(f"Conocidas: {list(CATEGORIES.keys())}")
        sys.exit(1)

    configure(name, url)
    if codes_only:
        logging.info(f"SOLO CÓDIGOS: {name} → {url}")
        collect_codes_only()
    else:
        if SCRAPE_KITS_ONLY:
            modo = "KITS ONLY (solo maintenance_kits)"
        elif not SCRAPE_EQUIPMENT:
            modo = "detalle SIN equipment"
        else:
            modo = "detalle completo"
        logging.info(f"Iniciando ({modo}): {name} → {url}")
        main(start_from=start_from, recollect=recollect)
