import json
import os
import time
from playwright.sync_api import sync_playwright

HYDRAULIC_FILTERS_URL = "https://shop.donaldson.com/store/en-us/search?N=2076725065&Nr=product.language%3AEnglish&catNav=true&st=parts"
LAST_CODE = "R010110"
TOTAL_EXPECTED = 1720

def remover_popups(page):
    """Remove popups and chatbots"""
    try:
        page.evaluate("""() => {
            const popups = ['#chat-button', '.LPMcontainer', '.optanon-alert-box-wrapper',
                           '.osano-cm-window', '.modal-backdrop', '.modal-open',
                           '[id*="chat"]', '[class*="chat"]', 'iframe[title*="chat"]'];
            popups.forEach(s => {
                document.querySelectorAll(s).forEach(el => el.remove());
            });
            document.body.style.overflow = 'auto';
        }""")
    except:
        pass

def extraer_atributos(page):
    """Extract attributes from #attributesBody table"""
    attrs = page.evaluate("""() => {
        let data = {};
        document.querySelectorAll('#attributesBody table tr').forEach(tr => {
            const tds = tr.querySelectorAll('td');
            if (tds.length >= 2) {
                const label = tds[0].innerText.trim();
                const value = tds[1].innerText.trim();
                if (label && value) {
                    data[label] = value;
                }
            }
        });
        return data;
    }""")
    return attrs

def expandir_show_more_atributos(page):
    """Click Show More in attributes section until all expanded"""
    page.evaluate("""async () => {
        let expanded = true;
        while (expanded) {
            let btn = document.getElementById('showMoreProductSpecsButton');
            if (!btn || btn.style.display === 'none') {
                expanded = false;
            } else {
                btn.click();
                await new Promise(r => setTimeout(r, 1500));
            }
        }
    }""")
    page.wait_for_timeout(1000)

def extraer_cross_reference(page):
    """Extract cross reference data"""
    cross = page.evaluate("""() => {
        let data = [];
        document.querySelectorAll('#crossreferenceBody table tbody tr').forEach(tr => {
            const tds = tr.querySelectorAll('td');
            if (tds.length >= 2) {
                const mfr = tds[0].innerText.trim();
                const part = tds[1].innerText.trim();
                if (mfr && part && !mfr.includes('Manufacturer')) {
                    data.push({
                        manufacturer: mfr,
                        part_number: part
                    });
                }
            }
        });
        return data;
    }""")
    return cross

def expandir_show_more_cross(page):
    """Click Show More in cross reference"""
    page.evaluate("""async () => {
        let expanded = true;
        while (expanded) {
            let btn = document.getElementById('showAllCrossReferenceListButton');
            if (!btn || btn.style.display === 'none') {
                expanded = false;
            } else {
                btn.click();
                await new Promise(r => setTimeout(r, 1500));
            }
        }
    }""")
    page.wait_for_timeout(1000)

def extraer_equipment(page):
    """Extract equipment data"""
    equip = page.evaluate("""() => {
        let data = [];
        document.querySelectorAll('#equiptmentBody table tbody tr').forEach(tr => {
            const tds = tr.querySelectorAll('td');
            if (tds.length >= 5) {
                const equipment = tds[0].innerText.trim();
                const year = tds[1].innerText.trim();
                const type = tds[2].innerText.trim();
                const engine = tds[4].innerText.trim();
                if (equipment && equipment !== 'Equipment') {
                    data.push({
                        equipment: equipment,
                        year: year !== '-' ? year : null,
                        type: type,
                        engine: engine
                    });
                }
            }
        });
        return data;
    }""")
    return equip

def expandir_show_more_equipment(page):
    """Click Show More in equipment"""
    page.evaluate("""async () => {
        let expanded = true;
        while (expanded) {
            let btn = document.getElementById('showMorePdpListButton');
            if (!btn || btn.style.display === 'none') {
                expanded = false;
            } else {
                btn.click();
                await new Promise(r => setTimeout(r, 1500));
            }
        }
    }""")
    page.wait_for_timeout(1000)

def extraer_alternates(page):
    """Extract alternate products (same geometry/thread, different media)"""
    alternates = page.evaluate("""() => {
        let data = [];
        const alternateBody = document.getElementById('alternateBody');
        if (!alternateBody) return data;

        document.querySelectorAll('#alternateBody .owl-item .item').forEach(item => {
            const code = item.querySelector('pre.preAlternate h5')?.innerText?.trim();
            const desc = item.querySelector('h6.desLengthCheck')?.innerText?.trim();
            const notes = item.querySelector('.lengthCheck')?.innerText?.trim();
            const url = item.querySelector('[data-url]')?.getAttribute('data-url');

            if (code) {
                data.push({
                    code: code,
                    description: desc,
                    notes: notes,
                    url: url
                });
            }
        });

        return data;
    }""")
    return alternates

def load_existing_results(filename):
    if os.path.exists(filename):
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return []
    return []

def save_results(results, filename):
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=4, ensure_ascii=False)

def run_donaldson_hydraulic_filters():
    with sync_playwright() as p:
        user_data_dir = os.path.join(os.getcwd(), "sesion_hydraulic_filters")
        context = p.chromium.launch_persistent_context(
            user_data_dir,
            headless=True,
            ignore_https_errors=True,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--disable-dev-shm-usage",
                "--disable-gpu"
            ]
        )

        page = context.pages[0]
        page.goto(HYDRAULIC_FILTERS_URL)
        page.wait_for_timeout(2000)

