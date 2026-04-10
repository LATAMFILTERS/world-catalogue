<?php
/**
 * Plugin Name: ELIMFILTERS Search Pro V6.5
 * Description: Barra fija 6.5%, asistente reactivo y card de resultados con tabs.
 * Version: 6.4
 */

if (!defined('ABSPATH')) exit;

add_shortcode('elimfilters_search', function() {
    $bg_url     = 'https://elimfilters.com/wp-content/uploads/2025/12/Imagen2.png';
    $railway_api = 'https://world-catalogue-production.up.railway.app/api/filters/search/homologous';

    ob_start(); ?>

<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;900&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">

<style>
#ef_root_v62 * { box-sizing: border-box; margin: 0; padding: 0; }
#ef_hero_v62 {
    position: relative; width: 100vw; height: 100vh; min-height: 700px;
    margin-left: calc(-50vw + 50%);
    background: url('<?php echo esc_url($bg_url); ?>') no-repeat center center;
    background-size: cover; background-attachment: fixed; overflow: hidden;
}
/* BARRA PERFECTA AL 6.5% */
.ef_search_stage {
    position: absolute; left: 50%; top: 6.5%; transform: translateX(-50%);
    width: min(700px, 92vw); z-index: 1000;
}
.ef_nav_tabs {
    display: grid; grid-template-columns: 1.15fr 0.7fr 1.35fr;
    align-items: center; width: 100%; height: 54px;
    background: rgba(0, 0, 0, 0.95); padding: 0 18px; column-gap: 6px;
}
.ef_nav_tabs span {
    display: flex; align-items: center; justify-content: center;
    height: 100%; font-family: 'Barlow Condensed', sans-serif;
    font-size: 14px; font-weight: 700; color: #676767;
    text-transform: uppercase; letter-spacing: 0.12em; cursor: pointer;
}
.ef_nav_tabs span.active { color: #FFF12D; }
.ef_nav_tabs span.active::after {
    content: ''; position: absolute; bottom: 0; left: 16%; right: 16%; height: 2px; background: #FFF12D;
}
.ef_input_row {
    display: flex; align-items: center; width: 100%; height: 62px;
    background: #fff; padding: 0 12px 0 24px; gap: 10px; position: relative;
}
.ef_input_row input {
    flex: 1; height: 100%; border: none; outline: none; background: transparent;
    font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 600;
    color: #111; text-transform: uppercase;
}
.ef_search_btn {
    width: 46px; height: 46px; flex-shrink: 0; background: #FFF12D; border: none;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
}
.ef_suggestions {
    display: none; position: absolute; left: 0; right: 0; top: 100%;
    background: #fff; border-top: 1px solid #ececec;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2); z-index: 2000;
}
.ef_suggestions.open { display: block; }
.ef_suggestion_item {
    padding: 15px 24px; font-family: 'Barlow Condensed', sans-serif;
    font-size: 17px; font-weight: 600; color: #111; text-transform: uppercase; cursor: pointer;
}

/* ===================== MODAL ===================== */
#ef_modal_v62 {
    display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.97);
    z-index: 99999; overflow-y: auto; padding: 32px 40px;
    font-family: 'Montserrat', sans-serif;
}
#ef_modal_v62.open { display: block; }
.ef-modal-inner { max-width: 1280px; width: 100%; margin: 0 auto; }
.ef-modal-close-row {
    display: flex; justify-content: flex-end; margin-bottom: 20px;
}
.ef-modal-close-btn {
    background: none; border: 1px solid #2a2a2a; color: #666;
    padding: 8px 20px; cursor: pointer; font-size: 11px; letter-spacing: 2px;
    font-family: 'Montserrat', sans-serif; font-weight: 600;
    text-transform: uppercase; transition: all .2s;
}
.ef-modal-close-btn:hover { border-color: #555; color: #ccc; }

/* ===================== RESULT CARD ===================== */
.ef-rc {
    background: #0a0a0a; overflow: hidden; width: 100%;
    box-shadow: 0 16px 64px rgba(0,0,0,0.95);
}

/* --- Header: SKU left | description + title right --- */
.ef-rc-header {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 48px;
    padding: 36px 44px 28px;
    border-bottom: 1px solid #141414;
    align-items: start;
}
.ef-rc-sku {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 5rem; font-weight: 900; color: #FFF12D;
    line-height: 0.9; letter-spacing: 3px; white-space: nowrap;
}
.ef-rc-header-right {
    display: flex; flex-direction: column;
    justify-content: space-between; min-height: 80px;
}
.ef-rc-desc {
    font-family: 'Montserrat', sans-serif;
    font-size: 12.5px; font-weight: 400; color: #888;
    line-height: 1.75; max-width: 720px;
}
.ef-rc-desc strong { color: #bbb; font-weight: 600; }
.ef-rc-tech-spec-title {
    font-family: 'Montserrat', sans-serif;
    font-size: 10px; font-weight: 700; letter-spacing: 4px;
    color: #fff; text-transform: uppercase;
    text-align: right; margin-top: 14px;
}

/* --- Body --- */
.ef-rc-body { display: flex; }

/* --- Sidebar --- */
.ef-rc-sidebar {
    width: 120px; min-width: 120px; background: #070707;
    border-right: 1px solid #141414;
    display: flex; flex-direction: column;
    align-items: center; padding: 36px 14px 28px; gap: 18px;
}
.ef-rc-sidebar .ef-logo-mark {
    width: 78px; height: auto; object-fit: contain;
}
.ef-rc-sidebar .ef-logo-full {
    width: 84px; height: auto; object-fit: contain; filter: brightness(0.85);
}
.ef-rc-sidebar .ef-gq {
    font-family: 'Montserrat', sans-serif;
    font-size: 8px; letter-spacing: 2.5px; color: #303030;
    text-transform: uppercase; text-align: center;
    margin-top: -12px;
}

/* --- Content --- */
.ef-rc-content { flex: 1; display: flex; flex-direction: column; min-width: 0; }

/* --- Tabs --- */
.ef-rc-tabs {
    display: flex; border-bottom: 1px solid #141414;
    padding: 0 28px; overflow-x: auto; scrollbar-width: none;
}
.ef-rc-tabs::-webkit-scrollbar { display: none; }
.ef-rc-tab {
    padding: 15px 20px; font-family: 'Montserrat', sans-serif;
    font-size: 11px; font-weight: 700; letter-spacing: 1.5px;
    color: #333; cursor: pointer; text-transform: uppercase;
    border-bottom: 3px solid transparent;
    transition: color .18s, border-color .18s;
    white-space: nowrap; display: flex; align-items: center; gap: 9px;
}
.ef-rc-tab:hover { color: #666; }
.ef-rc-tab.active { color: #FFF12D; border-bottom-color: #FFF12D; }
.ef-rc-badge {
    background: #181818; color: #444; border-radius: 12px;
    padding: 2px 10px; font-size: 11px; font-weight: 700;
}
.ef-rc-tab.active .ef-rc-badge { background: rgba(255,241,45,0.08); color: #FFF12D; }

/* --- Panels --- */
.ef-rc-panel {
    display: none; height: 360px; overflow-y: auto;
    padding: 0 44px 24px;
    scrollbar-width: thin; scrollbar-color: #222 #0a0a0a;
}
.ef-rc-panel::-webkit-scrollbar { width: 4px; }
.ef-rc-panel::-webkit-scrollbar-thumb { background: #222; border-radius: 2px; }
.ef-rc-panel.active { display: block; }

/* --- Specs: 4-column grid (label | value | label | value) full width --- */
.ef-specs-grid {
    display: grid;
    grid-template-columns: 160px 1fr 160px 1fr;
    gap: 0; width: 100%;
}
.ef-specs-grid .ef-sg-label:nth-child(4n+3),
.ef-specs-grid .ef-sg-value:nth-child(4n+4) {
    border-left: 1px solid #161616;
    padding-left: 32px;
}
.ef-sg-label {
    font-family: 'Montserrat', sans-serif;
    font-size: 10px; font-weight: 700; letter-spacing: 2px;
    color: #3a3a3a; text-transform: uppercase;
    padding: 20px 16px 8px 0; border-bottom: 1px solid #121212;
}
.ef-sg-value {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 24px; font-weight: 600; color: #e0e0e0;
    padding: 16px 16px 8px 0; border-bottom: 1px solid #121212;
    line-height: 1.1;
}
.ef-sg-value.ef-hl { color: #FFF12D; font-style: italic; font-size: 26px; }
.ef-sg-value.ef-dash { color: #222; font-size: 16px; letter-spacing: 4px; }

/* --- Code grid --- */
.ef-code-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px; padding-top: 24px;
}
.ef-code-item {
    background: #0f0f0f; border: 1px solid #181818;
    border-radius: 2px; padding: 12px 16px;
}
.ef-ci-mfr {
    font-family: 'Montserrat', sans-serif;
    font-size: 9px; font-weight: 700; letter-spacing: 2px;
    color: #383838; text-transform: uppercase;
}
.ef-ci-code {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 18px; font-weight: 600; color: #d0d0d0; margin-top: 3px;
}

/* --- Equipment table --- */
.ef-equip-table { width: 100%; border-collapse: collapse; margin-top: 24px; }
.ef-equip-table th {
    text-align: left; font-family: 'Montserrat', sans-serif;
    font-size: 9px; letter-spacing: 2px;
    color: #383838; text-transform: uppercase;
    padding: 10px 14px; border-bottom: 1px solid #161616;
}
.ef-equip-table td {
    padding: 12px 14px; color: #bbb; border-bottom: 1px solid #111;
    font-family: 'Barlow Condensed', sans-serif; font-size: 17px;
}
.ef-equip-table tr:hover td { background: #0c0c0c; }

/* --- Empty state --- */
.ef-empty {
    color: #222; font-family: 'Montserrat', sans-serif;
    font-size: 11px; text-align: center;
    padding: 70px 0; letter-spacing: 3px; text-transform: uppercase;
}
</style>

<div id="ef_root_v62">
    <div id="ef_hero_v62">
        <div class="ef_search_stage">
            <div class="ef_nav_tabs" id="ef_nav_tabs">
                <span class="active" data-type="part">PART NUMBER</span>
                <span data-type="vin">VIN</span>
                <span data-type="application">EQUIPMENT</span>
            </div>
            <div class="ef_input_row">
                <input type="text" id="ef_q_v62" placeholder="SEARCH BY CODE..." autocomplete="off">
                <button class="ef_search_btn" id="ef_search_btn_v62">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="3"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </button>
                <div class="ef_suggestions" id="ef_suggestions_v62"></div>
            </div>
        </div>
    </div>

    <div id="ef_modal_v62">
        <div class="ef-modal-inner">
            <div class="ef-modal-close-row">
                <button class="ef-modal-close-btn" onclick="document.getElementById('ef_modal_v62').classList.remove('open')">✕ CLOSE</button>
            </div>
            <div id="ef_content_v62"></div>
        </div>
    </div>
</div>

<script>
(function() {
    const input      = document.getElementById('ef_q_v62');
    const suggestBox = document.getElementById('ef_suggestions_v62');
    const modal      = document.getElementById('ef_modal_v62');
    const content    = document.getElementById('ef_content_v62');
    let mode = 'part';

    /* ---- Nav tab switching ---- */
    document.querySelectorAll('#ef_nav_tabs span').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('#ef_nav_tabs span').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            mode = tab.dataset.type;
        });
    });

    /* ---- Search ---- */
    async function runSearch(val) {
        if (!val) return;
        suggestBox.classList.remove('open');
        modal.classList.add('open');
        content.innerHTML = '<h2 style="color:#FFF12D;font-family:\'Barlow Condensed\';font-size:2rem;letter-spacing:2px;">CONSULTING DATABASE...</h2>';

        try {
            const res = await fetch(`<?php echo esc_url($railway_api); ?>?code=${encodeURIComponent(val.trim().toUpperCase())}`);
            const d   = await res.json();
            const product = d.data || d.product || null;
            if (d.success && product) {
                renderCard(product);
            } else {
                content.innerHTML = '<h2 style="font-family:\'Barlow Condensed\';color:#fff;font-size:2rem;">SKU NOT FOUND</h2>';
            }
        } catch (e) {
            content.innerHTML = '<h2 style="color:#ff4444;font-family:\'Barlow Condensed\'">CONNECTION ERROR</h2><p style="color:#555;font-size:12px;margin-top:8px;">Check Railway server status.</p>';
        }
    }

    /* ---- Tech badge ---- */
    function getTech(p) {
        if (p.technology) return p.technology.replace(/™/g,'') + '™';
        const sku = (p.elimfilters_sku || p.sku || '');
        if (sku.startsWith('EH'))  return 'SINTRAX™';
        if (sku.startsWith('EF9')) return 'ET9™';
        if (sku.startsWith('EA'))  return 'MacroCore™';
        return 'NANOFORCE™';
    }

    /* ---- Single spec cell (label + value) ---- */
    function sc(label, value, highlight) {
        const empty = (value === null || value === undefined || value === '');
        const cls   = empty ? 'ef-sg-value ef-dash' : (highlight ? 'ef-sg-value ef-hl' : 'ef-sg-value');
        const v     = empty ? '———' : value;
        return `<div class="ef-sg-label">${label}</div><div class="${cls}">${v}</div>`;
    }

    /* ---- Spec pair row: two cells side by side ---- */
    function sr(l1, v1, h1, l2, v2, h2) {
        return sc(l1, v1, h1) + sc(l2, v2, h2);
    }

    /* ---- Code cards ---- */
    function codCards(arr) {
        if (!arr || arr.length === 0) return '<div class="ef-empty">No codes available</div>';
        return arr.map(c => {
            const mfr  = typeof c === 'string' ? '' : (c.manufacturer || '');
            const code = typeof c === 'string' ? c  : (c.code || '');
            return `<div class="ef-code-item">${mfr ? `<div class="ef-ci-mfr">${mfr}</div>` : ''}<div class="ef-ci-code">${code || '—'}</div></div>`;
        }).join('');
    }

    /* ---- Equipment rows ---- */
    function equipRows(arr) {
        if (!arr || arr.length === 0) return '<tr><td colspan="4" class="ef-empty">No equipment data</td></tr>';
        return arr.map(a => {
            const m = a.machine || a.equipment || (typeof a === 'string' ? a : '—');
            return `<tr><td>${m}</td><td>${a.engine||'—'}</td><td>${a.year||'—'}</td><td>${a.type||'—'}</td></tr>`;
        }).join('');
    }

    /* ---- Format mm value ---- */
    function mm(v) { return (v !== null && v !== undefined && v !== '') ? v + ' mm' : null; }

    /* ---- Build product description from available data ---- */
    function buildDesc(p) {
        const sku     = p.elimfilters_sku || p.sku || '';
        const type    = p.filter_type  || 'Filter';
        const tech    = p.technology   || '';
        const install = p.installation_type || '';
        const duty    = p.duty || '';
        const thread  = p.thread_size  || '';

        let line1 = `<strong>${sku}</strong>`;
        if (install) line1 += ` | ${install} ${type}`;
        else         line1 += ` | ${type}`;

        let line2 = `Engineered to exceed OEM performance in modern engines`;
        if (tech)   line2 += `, the Elimfilters® <strong>${sku}</strong> features advanced <strong>${tech}™</strong> media technology for superior contaminant capture`;
        line2 += `. Its robust construction ensures unrestricted flow and critical system protection`;
        if (duty)   line2 += ` under ${duty.toLowerCase()} duty operating conditions`;
        if (thread) line2 += `. Thread: <strong>${thread}</strong>`;
        line2 += `.`;

        return line1 + ' ' + line2;
    }

    /* ---- Main render ---- */
    function renderCard(p) {
        const sku   = p.elimfilters_sku || p.sku || '—';
        const oem   = p.oem_codes        || [];
        const cross = p.competitor_codes || p.cross_references || [];
        const apps  = p.applications     || p.equipment_applications || [];

        content.innerHTML = `
        <div class="ef-rc">

          <!-- HEADER: SKU left | description + title right -->
          <div class="ef-rc-header">
            <div class="ef-rc-sku">${sku}</div>
            <div class="ef-rc-header-right">
              <div class="ef-rc-desc">${buildDesc(p)}</div>
              <div class="ef-rc-tech-spec-title">Technical Specifications</div>
            </div>
          </div>

          <!-- BODY -->
          <div class="ef-rc-body">

            <!-- SIDEBAR -->
            <div class="ef-rc-sidebar">
              <img class="ef-logo-mark"
                src="https://elimfilters.com/wp-content/uploads/2025/11/cropped-AE6A9C09-F12F-4AA4-8021-EAF6F448860E.webp"
                alt="E">
              <img class="ef-logo-full"
                src="https://elimfilters.com/wp-content/uploads/2025/11/logo-sin-fondo.png"
                alt="Elimfilters">
              <div class="ef-gq">German Quality</div>
            </div>

            <!-- CONTENT -->
            <div class="ef-rc-content">

              <!-- TABS -->
              <div class="ef-rc-tabs">
                <div class="ef-rc-tab active" data-tab="specs">Specifications</div>
                <div class="ef-rc-tab" data-tab="oem">OEM Codes <span class="ef-rc-badge">${oem.length}</span></div>
                <div class="ef-rc-tab" data-tab="cross">Cross Reference <span class="ef-rc-badge">${cross.length}</span></div>
                <div class="ef-rc-tab" data-tab="equip">Equipment <span class="ef-rc-badge">${apps.length}</span></div>
              </div>

              <!-- PANEL: SPECIFICATIONS — 4 columns: label|value|label|value -->
              <div class="ef-rc-panel active" id="efp-specs">
                <div class="ef-specs-grid">
                  ${sr('Filter Type',    p.filter_type,         false, 'Installation',      p.installation_type,    false)}
                  ${sr('Technology',     p.technology,          true,  'Thread Size',        p.thread_size,          false)}
                  ${sr('Outer Dia.',     mm(p.outer_diameter_mm),false,'Gasket OD',          mm(p.gasket_od_mm),     false)}
                  ${sr('Gasket ID',      mm(p.gasket_id_mm),    false, 'ISO Test Method',    p.iso_test_method,      false)}
                  ${sr('Micron Rating',  p.micron_rating,       false, 'Efficiency',         p.nominal_efficiency,   false)}
                  ${sr('Burst Pressure', p.burst_pressure_psi,  false, 'Collapse Pressure',  p.collapse_pressure_psi,false)}
                </div>
              </div>

              <!-- PANEL: OEM CODES -->
              <div class="ef-rc-panel" id="efp-oem">
                <div class="ef-code-grid">${codCards(oem)}</div>
              </div>

              <!-- PANEL: CROSS REFERENCE -->
              <div class="ef-rc-panel" id="efp-cross">
                <div class="ef-code-grid">${codCards(cross)}</div>
              </div>

              <!-- PANEL: EQUIPMENT -->
              <div class="ef-rc-panel" id="efp-equip">
                <table class="ef-equip-table">
                  <thead><tr><th>Machine / Model</th><th>Engine</th><th>Year</th><th>Type</th></tr></thead>
                  <tbody>${equipRows(apps)}</tbody>
                </table>
              </div>

            </div><!-- /content -->
          </div><!-- /body -->
        </div><!-- /card -->`;

        /* Tab switching scoped to this card */
        content.querySelectorAll('.ef-rc-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                content.querySelectorAll('.ef-rc-tab').forEach(t => t.classList.remove('active'));
                content.querySelectorAll('.ef-rc-panel').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                content.querySelector('#efp-' + tab.dataset.tab).classList.add('active');
            });
        });
    }

    /* ---- Suggestions ---- */
    input.addEventListener('input', function() {
        const val = this.value.toUpperCase().trim();
        if (val.length < 2) { suggestBox.classList.remove('open'); return; }
        suggestBox.innerHTML = `<div class="ef_suggestion_item" onclick="window.efRun('${val}')">${val}</div>`;
        suggestBox.classList.add('open');
    });

    window.efRun = (v) => { input.value = v; runSearch(v); };
    document.getElementById('ef_search_btn_v62').onclick = () => runSearch(input.value);
    input.onkeypress = (e) => { if (e.which === 13) runSearch(input.value); };
})();
</script>

<?php return ob_get_clean(); });
