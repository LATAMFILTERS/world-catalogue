"""
patch_airdry_p951413.py — Parcha P951413 con crossrefs de P781466
Donaldson renombró P781466 → P951413, pero el crossref site conoce el código viejo.
"""
import json, time, os
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

OLD_CODE = "P781466"
NEW_CODE = "P951413"
BASE_URL = "https://www.airfilter-crossreference.com/convert/DONALDSON/{part}"
PROGRESS_FILE = "donaldson_air-dryer_crossref_progress.json"
RESULTS_FILE  = "donaldson_air-dryer_results.json"

_EXTRACT_JS = """() => {
    const result = {};
    const links = document.querySelectorAll('li a[href^="/convert/"]');
    for (const a of links) {
        const parts = a.getAttribute('href').split('/convert/');
        if (parts.length < 2) continue;
        const segments = parts[1].split('/');
        if (segments.length < 2) continue;
        const brand = decodeURIComponent(segments[0]).toUpperCase().replace(/-FILTER$/i,'').trim();
        const code  = decodeURIComponent(segments[1]).toUpperCase().trim();
        if (!brand || !code || brand === 'DONALDSON') continue;
        if (!result[brand]) result[brand] = [];
        if (!result[brand].includes(code)) result[brand].push(code);
    }
    return result;
}"""

with sync_playwright() as pw:
    ctx = pw.chromium.launch_persistent_context(
        user_data_dir=os.path.join(os.path.expanduser("~"), ".donaldson_profile_patch"),
        channel="chrome", headless=True, locale="en-US",
        viewport={"width": 1366, "height": 768},
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        args=["--disable-blink-features=AutomationControlled"],
        ignore_default_args=["--enable-automation"],
    )
    page = ctx.new_page()
    url = BASE_URL.format(part=OLD_CODE)
    print(f"Fetching {url} ...")
    page.goto(url, timeout=30000, wait_until="domcontentloaded")
    try:
        page.wait_for_function(
            "() => document.querySelectorAll('li a[href^=\"/convert/\"]').length > 0",
            timeout=15000
        )
    except PWTimeout:
        pass
    time.sleep(2)
    crossrefs = page.evaluate(_EXTRACT_JS)
    ctx.close()

print(f"Encontradas: {len(crossrefs)} marcas para {OLD_CODE}")

# Actualizar progress
with open(PROGRESS_FILE) as f:
    prog = json.load(f)
prog[NEW_CODE] = crossrefs
tmp = PROGRESS_FILE + ".tmp"
with open(tmp, "w") as f:
    json.dump(prog, f, ensure_ascii=False, indent=2)
os.replace(tmp, PROGRESS_FILE)
print(f"Progress actualizado: {NEW_CODE} → {len(crossrefs)} marcas")

# Actualizar results
with open(RESULTS_FILE) as f:
    products = json.load(f)
for p in products:
    if p.get("part_number", "").upper() == NEW_CODE:
        p["brand_crossrefs"] = crossrefs
        print(f"Results actualizado: {NEW_CODE}")
        break
with open(RESULTS_FILE, "w") as f:
    json.dump(products, f, ensure_ascii=False, indent=2)

print("DONE")
