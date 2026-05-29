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

CATEGORY_NAME = "unknown"
CATEGORY_URL  = ""
OUTPUT_FILE   = "fleetguard_unknown_results.json"
PROGRESS_FILE = "fleetguard_unknown_progress.json"

PAUSE_BETWEEN = (4, 9)

CATEGORIES = {
    "air-precleaners": "https://www.fleetguard.com/category/products/air-filtration/air-precleaners/0ZGPL0000000FSJ4A2",
    "air-primary":     "https://www.fleetguard.com/category/products/air-filtration/primary-air-elements",
    "air-safety":      "https://www.fleetguard.com/category/products/air-filtration/safety-air-elements",
    "lube":            "https://www.fleetguard.com/category/products/lube-filtration",
    "fuel":            "https://www.fleetguard.com/category/products/fuel-filtration",
    "hydraulic":       "https://www.fleetguard.com/category/products/hydraulic-filtration",
}

# JS que traversa Shadow DOM recursivamente
# Selector confirmado: <h2 class="product-name" data-id="01tXXX">AP8404</h2>
PRODUCT_BASE_URL = "https://www.fleetguard.com/product/"

SHADOW_LINKS_JS = """
() => {
    const found = new Set();
    function walk(root) {
        try {
            // Selector confirmado: h2.product-name con data-id (Salesforce Product2)
            root.querySelectorAll('.product-name[data-id], h2.product-name, h3.product-name').forEach(el => {
                const pn = (el.textContent || '').trim().toUpperCase();
                const id = el.getAttribute('data-id') || '';
                if (pn && pn.length >= 3) {
                    found.add('https://www.fleetguard.com/product/' + pn);
                }
            });
            // También buscar links directos a /product/
            root.querySelectorAll('a[href]').forEach(a => {
                const h = (a.href || '').split('?')[0].split('#')[0];
                if (h.includes('fleetguard.com') &&
                    (h.includes('/product/') || h.match(/\\/[A-Z]{2,}[0-9]{4,}/)) &&
                    !h.includes('/category/')) {
                    found.add(h);
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
    CATEGORY_NAME = name
    CATEGORY_URL  = url
    OUTPUT_FILE   = f"fleetguard_{name}_results.json"
    PROGRESS_FILE = f"fleetguard_{name}_progress.json"


def rand_sleep(lo=None, hi=None):
    lo, hi = (lo, hi) if lo else PAUSE_BETWEEN
    time.sleep(random.uniform(lo, hi))


def launch_context(pw):
    return pw.chromium.launch_persistent_context(
        user_data_dir=PROFILE_DIR,
        channel="chrome",
        headless=False,
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
    """Retorna (captured_list, handler) para capturar respuestas JSON de interés."""
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
            captured.append({"url": url, "status": response.status, "data": data})
        except Exception:
            pass

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


# ── Category collector ────────────────────────────────────────────────────────

def collect_product_links(page, category_url: str) -> list:
    """Recolecta URLs de productos usando APIs + Shadow DOM traversal."""
    captured, handler = make_api_listener()
    page.on("response", handler)

    logging.info(f"Cargando: {category_url}")
    page.goto(category_url, timeout=60000, wait_until="domcontentloaded")
    time.sleep(4)
    dismiss_popups(page)
    wait_net(page, 20000)
    time.sleep(5)

    all_urls = set()
    pg = 1

    while True:
        wait_net(page)

        # Capa 1: Shadow DOM traversal
        s_links = shadow_links(page)
        p_links = pierce_links(page)
        for u in s_links + p_links:
            all_urls.add(u)

        # Capa 2: Buscar URLs en respuestas API
        for c in captured:
            _extract_urls_from_api(c["data"], all_urls)

        logging.info(f"  Página {pg}: {len(all_urls)} productos acumulados")

        # Buscar paginación
        went = page.evaluate("""() => {
            function findInShadow(root, fn, depth=0) {
                if (depth > 8) return false;
                const result = fn(root);
                if (result) return true;
                for (const el of root.querySelectorAll('*')) {
                    if (el.shadowRoot && findInShadow(el.shadowRoot, fn, depth+1)) return true;
                }
                return false;
            }
            return findInShadow(document, root => {
                const btns = root.querySelectorAll('button, a');
                for (const b of btns) {
                    const t = (b.textContent || b.ariaLabel || '').trim().toLowerCase();
                    if ((t === 'next' || t === 'next page' || b.getAttribute('aria-label') === 'Next page')
                        && b.offsetParent && !b.disabled) {
                        b.click(); return true;
                    }
                }
                return false;
            });
        }""")
        if not went:
            break
        pg += 1
        time.sleep(4)

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
    """Extrae URL de un item de producto Salesforce."""
    if not isinstance(item, dict):
        return
    # Campos comunes de Salesforce B2B Commerce
    for field in ("productUrl", "url", "pdpUrl", "slug", "productSlug", "pageUrl"):
        v = item.get(field, "")
        if v and isinstance(v, str):
            if v.startswith("/"):
                v = "https://www.fleetguard.com" + v
            if "fleetguard.com" in v and "/category/" not in v:
                url_set.add(v.split("?")[0])
    # Buscar ID para construir URL: /product/{id}
    for id_field in ("id", "productId", "Id", "sku", "productCode"):
        v = item.get(id_field, "")
        if v and isinstance(v, str) and len(v) > 3:
            url_set.add(f"https://www.fleetguard.com/product/{v}")


# ── Product scraper ───────────────────────────────────────────────────────────

def scrape_product(page, url: str) -> dict:
    result = {
        "url": url,
        "part_number": "",
        "name": "",
        "attributes": {},
        "cross_references": [],
        "alternatives": [],
        "equipment": [],
        "error": None,
        "scraped_at": str(datetime.now()),
    }

    captured, handler = make_api_listener()
    page.on("response", handler)

    try:
        page.goto(url, timeout=60000, wait_until="domcontentloaded")
        time.sleep(3)
        dismiss_popups(page)
        wait_net(page, 15000)
        time.sleep(3)

        # Intentar sacar datos de la API primero
        for c in captured:
            _extract_product_data(c["data"], result)
            if result["part_number"] and result["attributes"]:
                break

        # Fallback: Shadow DOM con selector confirmado (.product-name)
        if not result["part_number"]:
            data = page.evaluate("""() => {
                function walkShadow(root, selector, depth=0) {
                    if (depth > 10) return null;
                    let el = root.querySelector(selector);
                    if (el) return el.textContent.trim();
                    for (const node of root.querySelectorAll('*')) {
                        if (node.shadowRoot) {
                            const t = walkShadow(node.shadowRoot, selector, depth+1);
                            if (t) return t;
                        }
                    }
                    return null;
                }
                return {
                    // Selector confirmado por inspección DOM
                    pn:   walkShadow(document, '.product-name') ||
                          walkShadow(document, 'h2.product-name') ||
                          walkShadow(document, '[class*="part-number"]') || '',
                    name: walkShadow(document, 'h1') ||
                          walkShadow(document, '[class*="product-title"]') || '',
                };
            }""")
            result["part_number"] = (data.get("pn") or "").upper()
            result["name"]        = data.get("name") or ""

        # Si aún no tiene part number, sacarlo de la URL
        if not result["part_number"]:
            segs = url.rstrip("/").split("/")
            for seg in reversed(segs):
                if len(seg) >= 4 and seg.replace("-", "").isalnum():
                    result["part_number"] = seg.upper()
                    break

        # Activar tabs via Shadow DOM y leer contenido
        _activate_shadow_tab(page, ["specification", "specs", "detail"])
        if not result["attributes"]:
            result["attributes"] = _shadow_extract_table(page)

        _activate_shadow_tab(page, ["cross", "interchange", "reference"])
        if not result["cross_references"]:
            result["cross_references"] = _shadow_extract_table_rows(page)

        _activate_shadow_tab(page, ["alternate", "replace", "supersede"])
        if not result["alternatives"]:
            result["alternatives"] = _shadow_extract_part_numbers(page)

        _activate_shadow_tab(page, ["application", "equipment", "vehicle", "fitment"])
        if not result["equipment"]:
            result["equipment"] = _shadow_extract_table_rows(page)

    except PlaywrightTimeout:
        result["error"] = "timeout"
        logging.warning(f"  TIMEOUT: {url}")
    except Exception as e:
        result["error"] = str(e)
        logging.error(f"  ERROR: {url} — {e}")
    finally:
        try:
            page.remove_listener("response", handler)
        except Exception:
            pass

    return result


def _extract_product_data(data, result: dict):
    """Extrae datos de producto desde respuesta API Salesforce."""
    if not isinstance(data, dict):
        return
    # Campos comunes de Salesforce B2B Commerce producto
    if not result["name"]:
        result["name"] = data.get("name", data.get("Name", data.get("productName", "")))
    if not result["part_number"]:
        pn = data.get("productCode", data.get("sku", data.get("partNumber", data.get("ProductCode", ""))))
        if pn:
            result["part_number"] = str(pn).upper()
    # Atributos / specs
    if not result["attributes"]:
        specs = data.get("specifications", data.get("attributes", data.get("productAttributes", {})))
        if isinstance(specs, dict) and specs:
            result["attributes"] = {str(k): str(v) for k, v in specs.items()}
        elif isinstance(specs, list):
            for s in specs:
                if isinstance(s, dict):
                    k = s.get("name", s.get("label", s.get("key", "")))
                    v = s.get("value", s.get("val", ""))
                    if k and v:
                        result["attributes"][str(k)] = str(v)
    # Cross-references
    if not result["cross_references"]:
        xrefs = data.get("crossReferences", data.get("interchanges", data.get("oemReferences", [])))
        if isinstance(xrefs, list):
            for x in xrefs:
                if isinstance(x, dict):
                    result["cross_references"].append({
                        "brand": x.get("brand", x.get("make", "unknown")),
                        "part_number": str(x.get("partNumber", x.get("number", x.get("PN", "")))).upper(),
                    })
    # Recurse into nested dicts/lists
    for v in data.values():
        if isinstance(v, (dict, list)):
            _extract_product_data(v, result)


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

def main():
    with sync_playwright() as pw:
        ctx = launch_context(pw)
        page = ctx.new_page()
        if STEALTH:
            stealth_sync(page)

        progress = load_progress()

        if not progress["part_numbers"]:
            urls = collect_product_links(page, CATEGORY_URL)
            progress["part_numbers"] = urls
            save_progress(progress)
        else:
            urls = progress["part_numbers"]
            logging.info(f"Reanudando — {len(urls)} URLs totales")

        done_set = set(progress["done"])
        results  = progress["results"]
        pending  = [u for u in urls if u not in done_set]
        logging.info(f"Pendientes: {len(pending)} / {len(urls)}")

        for idx, url in enumerate(pending, 1):
            logging.info(f"[{idx}/{len(pending)}] {url}")
            data = scrape_product(page, url)

            na = len(data["attributes"])
            nc = len(data["cross_references"])
            nl = len(data["alternatives"])
            ne = len(data["equipment"])
            st = "✅" if not data["error"] else "❌"
            logging.info(f"  {st} {data['part_number']} → {na} Attr | {nc} Cross | {nl} Alt | {ne} Equip")

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


# ── CLI ───────────────────────────────────────────────────────────────────────

def _usage():
    print(__doc__)

if __name__ == "__main__":
    argv = sys.argv[1:]
    if not argv or argv[0] in ("-h", "--help"):
        _usage(); sys.exit(0)

    if argv[0] == "--inspect":
        url = argv[1] if len(argv) > 1 else ""
        if not url: print("ERROR: --inspect necesita URL"); sys.exit(1)
        inspect_page(url); sys.exit(0)

    if argv[0] == "--test":
        url = argv[1] if len(argv) > 1 else ""
        if not url: print("ERROR: --test necesita URL de producto"); sys.exit(1)
        test_one(url); sys.exit(0)

    name = argv[0].lower()
    url  = argv[1] if len(argv) > 1 else CATEGORIES.get(name, "")
    if not url:
        print(f"ERROR: categoría '{name}' no conocida.")
        print(f"Conocidas: {list(CATEGORIES.keys())}")
        sys.exit(1)

    configure(name, url)
    logging.info(f"Iniciando: {name} → {url}")
    main()
