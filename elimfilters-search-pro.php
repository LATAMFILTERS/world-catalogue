<?php
/**
 * Plugin Name: ELIMFILTERS Search Pro V8.0
 * Description: World Catalogue – etiquetas visibles, columnas estables, sin recorte.
 * Version: 8.0
 */

if (!defined('ABSPATH')) exit;

add_shortcode('elimfilters_search', function() {
    $bg_url      = 'https://elimfilters.com/wp-content/uploads/2025/12/Imagen2.png';
    $railway_api = 'https://world-catalogue-production.up.railway.app/api/filters/search/homologous';
    ob_start(); ?>

<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;0,900;1,600;1,700&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">

<style>
/* ── RESET ── */
#ef_root_v7 *, #ef_modal_v7 * { box-sizing: border-box; margin: 0; padding: 0; }

/* ══════════════════════════════════════════
   HERO + SEARCH BAR  (no tocar)
══════════════════════════════════════════ */
#ef_hero_v7 {
    position: relative; width: 100vw; height: 100vh; min-height: 700px;
    margin-left: calc(-50vw + 50%);
    background: url('<?php echo esc_url($bg_url); ?>') no-repeat center center;
    background-size: cover; background-attachment: fixed; overflow: hidden;
}
.ef7-stage {
    position: absolute; left: 50%; top: 6.5%; transform: translateX(-50%);
    width: min(700px, 92vw); z-index: 100;
}
.ef7-nav {
    display: grid; grid-template-columns: 1.15fr 0.7fr 1.35fr;
    align-items: center; height: 54px;
    background: rgba(0,0,0,0.95); padding: 0 18px; column-gap: 6px;
}
.ef7-nav span {
    display: flex; align-items: center; justify-content: center; height: 100%;
    font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 700;
    color: #676767; text-transform: uppercase; letter-spacing: .12em; cursor: pointer;
    transition: color .2s;
}
.ef7-nav span.active { color: #FFF12D; }
.ef7-input-row {
    display: flex; align-items: center; height: 62px;
    background: #fff; padding: 0 12px 0 24px; gap: 10px; position: relative;
}
.ef7-input-row input {
    flex: 1; height: 100%; border: none; outline: none; background: transparent;
    font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 600;
    color: #111; text-transform: uppercase;
}
.ef7-btn {
    width: 46px; height: 46px; flex-shrink: 0; background: #FFF12D; border: none;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
}
.ef7-suggest {
    display: none; position: absolute; left: 0; right: 0; top: 100%;
    background: #fff; border-top: 1px solid #eee;
    box-shadow: 0 10px 30px rgba(0,0,0,.2); z-index: 200;
}
.ef7-suggest.open { display: block; }
.ef7-suggest-item {
    padding: 14px 24px; font-family: 'Barlow Condensed', sans-serif;
    font-size: 17px; font-weight: 600; color: #111; text-transform: uppercase; cursor: pointer;
}
.ef7-suggest-item:hover { background: #f5f5f5; }

/* ══════════════════════════════════════════
   MODAL OVERLAY
══════════════════════════════════════════ */
#ef_modal_v7 {
    display: none; position: fixed; inset: 0;
    background: rgba(0,0,0,0.97); z-index: 99999;
    overflow-y: auto; padding: 28px 32px;
    font-family: 'Montserrat', sans-serif;
}
#ef_modal_v7.open { display: block; }
.ef7-modal-wrap { max-width: 1320px; width: 100%; margin: 0 auto; }

.ef7-close-row { display: flex; justify-content: flex-end; margin-bottom: 18px; }
.ef7-close-btn {
    background: none; border: 1px solid #252525; color: #555;
    padding: 7px 20px; cursor: pointer;
    font-family: 'Montserrat', sans-serif; font-size: 10px;
    font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase;
    transition: border-color .2s, color .2s;
}
.ef7-close-btn:hover { border-color: #666; color: #ccc; }

/* ══════════════════════════════════════════
   RESULT CARD
══════════════════════════════════════════ */
.ef7-card { background: #080808; width: 100%; box-shadow: 0 24px 80px rgba(0,0,0,1); }

/* ── HEADER ── */
.ef7-header { padding: 40px 48px 32px; border-bottom: 1px solid #111; }
.ef7-header-top {
    display: flex; justify-content: space-between; align-items: flex-start;
    margin-bottom: 14px;
}
.ef7-sku {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 5rem; font-weight: 900; color: #FFF12D;
    line-height: .88; letter-spacing: 4px;
}
.ef7-ts-label {
    font-family: 'Montserrat', sans-serif;
    font-size: 11px; font-weight: 700; letter-spacing: 4px;
    color: #e8e8e8; text-transform: uppercase;
    padding-top: 8px; text-align: right; white-space: nowrap;
}
.ef7-desc {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 15px; font-weight: 600; color: #555;
    letter-spacing: 2px; text-transform: uppercase; line-height: 1.5;
}

/* ── BODY ── */
.ef7-body { display: flex; }

/* ── SIDEBAR ── */
.ef7-sidebar {
    width: 130px; min-width: 130px; background: #050505;
    border-right: 1px solid #111;
    display: flex; flex-direction: column;
    align-items: center; justify-content: flex-start;
    padding: 40px 12px 32px; gap: 20px;
}
.ef7-sidebar img.ef7-logo-e   { width: 80px; height: auto; display: block; }
.ef7-sidebar img.ef7-logo-full { width: 88px; height: auto; display: block; filter: brightness(.8); }
.ef7-sidebar .ef7-gq {
    font-family: 'Montserrat', sans-serif;
    font-size: 7.5px; font-weight: 600; letter-spacing: 3px;
    color: #3a3a3a; text-transform: uppercase; text-align: center;
}

/* ── CONTENT AREA ── */
.ef7-content { flex: 1; min-width: 0; overflow: hidden; display: flex; flex-direction: column; }

/* ── TABS ── */
.ef7-tabs {
    display: flex; border-bottom: 1px solid #111;
    padding: 0 32px; overflow-x: auto; scrollbar-width: none; flex-shrink: 0;
}
.ef7-tabs::-webkit-scrollbar { display: none; }
.ef7-tab {
    padding: 16px 22px;
    font-family: 'Montserrat', sans-serif; font-size: 10.5px;
    font-weight: 700; letter-spacing: 2px; color: #2e2e2e;
    text-transform: uppercase; cursor: pointer; white-space: nowrap;
    border-bottom: 3px solid transparent;
    transition: color .18s, border-color .18s;
    display: flex; align-items: center; gap: 10px;
}
.ef7-tab:hover { color: #555; }
.ef7-tab.active { color: #FFF12D; border-bottom-color: #FFF12D; }
.ef7-badge {
    background: #141414; color: #3a3a3a; border-radius: 20px;
    padding: 2px 10px; font-size: 10px; font-weight: 700;
}
.ef7-tab.active .ef7-badge { background: rgba(255,241,45,.1); color: #FFF12D; }

/* ── PANELS ── */
.ef7-panel {
    display: none;
    overflow-y: auto; overflow-x: hidden;
    height: 380px;
    padding: 0 32px 28px;
    scrollbar-width: thin; scrollbar-color: #1c1c1c #080808;
}
.ef7-panel::-webkit-scrollbar { width: 3px; }
.ef7-panel::-webkit-scrollbar-thumb { background: #1c1c1c; }
.ef7-panel.active { display: block; }

/* ══════════════════════════════════════════
   SPECS TABLE  – 4 columnas estables
   col1: label-izq  col2: valor-izq  col3: label-der  col4: valor-der
   Anchos definidos con style inline en <col> para máxima compatibilidad
══════════════════════════════════════════ */
.ef7-specs-table {
    width: 100%; border-collapse: collapse; table-layout: fixed;
}
.ef7-specs-table td {
    padding: 0; vertical-align: top; border-bottom: 1px solid #0f0f0f;
}

/* etiquetas – padding-left: 12px para buffer contra recorte */
.ef7-lbl {
    font-family: 'Montserrat', sans-serif;
    font-size: 9.5px; font-weight: 700; letter-spacing: 2px;
    color: #505050; text-transform: uppercase;
    padding: 24px 12px 8px 12px; display: block;
}
/* valores */
.ef7-val {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 22px; font-weight: 600; color: #ddd;
    padding: 0 12px 18px 12px; display: block; line-height: 1.1;
    word-break: break-word;
}
.ef7-val.hl    { color: #FFF12D; font-style: italic; font-size: 24px; }
.ef7-val.empty { color: #222; font-size: 16px; letter-spacing: 5px; }

/* divisor vertical entre par izquierdo y par derecho */
.ef7-specs-table td.ef7-div-l { border-left: 1px solid #111; }
.ef7-specs-table td.ef7-div-l .ef7-lbl { padding-left: 24px; }
.ef7-specs-table td.ef7-div-l .ef7-val { padding-left: 24px; }

/* ══════════════════════════════════════════
   CÓDIGO GRID
══════════════════════════════════════════ */
.ef7-code-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
    gap: 10px; padding-top: 24px;
}
.ef7-code-item {
    background: #0c0c0c; border: 1px solid #161616; padding: 12px 16px; border-radius: 2px;
}
.ef7-code-mfr {
    font-family: 'Montserrat', sans-serif;
    font-size: 8.5px; font-weight: 700; letter-spacing: 2px;
    color: #303030; text-transform: uppercase; margin-bottom: 4px;
}
.ef7-code-val {
    font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 600; color: #ccc;
}

/* ══════════════════════════════════════════
   TABLA EQUIPOS
══════════════════════════════════════════ */
.ef7-equip-table { width: 100%; border-collapse: collapse; margin-top: 24px; }
.ef7-equip-table th {
    text-align: left; font-family: 'Montserrat', sans-serif;
    font-size: 8.5px; font-weight: 700; letter-spacing: 2.5px;
    color: #303030; text-transform: uppercase;
    padding: 10px 16px; border-bottom: 1px solid #131313;
}
.ef7-equip-table td {
    padding: 12px 16px; color: #aaa; border-bottom: 1px solid #0e0e0e;
    font-family: 'Barlow Condensed', sans-serif; font-size: 17px; font-weight: 500;
}
.ef7-equip-table tr:hover td { background: #0a0a0a; }

/* ══════════════════════════════════════════
   EMPTY STATE
══════════════════════════════════════════ */
.ef7-empty {
    font-family: 'Montserrat', sans-serif; font-size: 10px; font-weight: 600;
    letter-spacing: 3px; color: #1e1e1e; text-transform: uppercase;
    text-align: center; padding: 80px 0;
}
</style>

<div id="ef_root_v7">
    <div id="ef_hero_v7">
        <div class="ef7-stage">
            <div class="ef7-nav" id="ef7_nav">
                <span class="active" data-type="part">PART NUMBER</span>
                <span data-type="vin">VIN</span>
                <span data-type="application">EQUIPMENT</span>
            </div>
            <div class="ef7-input-row">
                <input type="text" id="ef7_q" placeholder="SEARCH BY CODE..." autocomplete="off">
                <button class="ef7-btn" id="ef7_btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="3">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                </button>
                <div class="ef7-suggest" id="ef7_suggest"></div>
            </div>
        </div>
    </div>
</div>

<div id="ef_modal_v7">
    <div class="ef7-modal-wrap">
        <div class="ef7-close-row">
            <button class="ef7-close-btn" onclick="document.getElementById('ef_modal_v7').classList.remove('open')">&#x2715; &nbsp;CLOSE</button>
        </div>
        <div id="ef7_content"></div>
    </div>
</div>

<script>
(function(){
    const input   = document.getElementById('ef7_q');
    const suggest = document.getElementById('ef7_suggest');
    const modal   = document.getElementById('ef_modal_v7');
    const content = document.getElementById('ef7_content');
    const API     = '<?php echo esc_url($railway_api); ?>';
    let mode = 'part';

    /* nav tabs */
    document.querySelectorAll('#ef7_nav span').forEach(t => {
        t.addEventListener('click', () => {
            document.querySelectorAll('#ef7_nav span').forEach(x => x.classList.remove('active'));
            t.classList.add('active'); mode = t.dataset.type;
        });
    });

    /* búsqueda principal */
    async function search(val) {
        if (!val) return;
        suggest.classList.remove('open');
        modal.classList.add('open');
        content.innerHTML = '<p style="color:#FFF12D;font-family:\'Barlow Condensed\',sans-serif;font-size:1.8rem;letter-spacing:3px;padding:40px 0;">CONSULTING DATABASE...</p>';
        try {
            const r = await fetch(API + '?code=' + encodeURIComponent(val.trim().toUpperCase()));
            const d = await r.json();
            const p = d.data || d.product || null;
            if (d.success && p) render(p);
            else content.innerHTML = '<p style="color:#555;font-family:\'Montserrat\',sans-serif;font-size:13px;padding:60px 0 0;letter-spacing:2px;text-transform:uppercase;">No results for \u201C' + val + '\u201D</p>';
        } catch(e) {
            content.innerHTML = '<p style="color:#c0392b;font-family:\'Montserrat\',sans-serif;font-size:12px;padding:60px 0 0;">Connection error. Check server status.</p>';
        }
    }

    /* helpers */
    function v(x)  { return (x !== null && x !== undefined && x !== '') ? x : null; }
    function mm(x) { return v(x) ? x + ' mm' : null; }

    /* fila de specs – 4 celdas: label-izq | valor-izq | label-der | valor-der */
    function specRow(l1, v1, hl1, l2, v2, hl2) {
        const d1   = v(v1), d2 = v(v2);
        const cls1 = d1 ? (hl1 ? 'ef7-val hl' : 'ef7-val') : 'ef7-val empty';
        const cls2 = d2 ? (hl2 ? 'ef7-val hl' : 'ef7-val') : 'ef7-val empty';
        return '<tr>'
            + '<td><span class="ef7-lbl">'  + l1 + '</span><span class="' + cls1 + '">' + (d1 || '\u2014\u2014\u2014') + '</span></td>'
            + '<td class="ef7-div-l"><span class="ef7-lbl">' + l2 + '</span><span class="' + cls2 + '">' + (d2 || '\u2014\u2014\u2014') + '</span></td>'
            + '</tr>';
    }

    /* códigos OEM / cross reference */
    function codes(arr) {
        if (!arr || !arr.length) return '<div class="ef7-empty">No codes available</div>';
        return '<div class="ef7-code-grid">' + arr.map(function(c) {
            var mfr  = typeof c === 'string' ? '' : (c.manufacturer || '');
            var code = typeof c === 'string' ? c  : (c.code || '');
            return '<div class="ef7-code-item">'
                + (mfr ? '<div class="ef7-code-mfr">' + mfr + '</div>' : '')
                + '<div class="ef7-code-val">' + (code || '\u2014') + '</div>'
                + '</div>';
        }).join('') + '</div>';
    }

    /* tabla de equipos */
    function equip(arr) {
        if (!arr || !arr.length) return '<div class="ef7-empty">No equipment data</div>';
        return '<table class="ef7-equip-table">'
            + '<thead><tr><th>Machine / Model</th><th>Engine</th><th>Year</th><th>Type</th></tr></thead>'
            + '<tbody>' + arr.map(function(a) {
                var m = a.machine || a.equipment || (typeof a === 'string' ? a : '\u2014');
                return '<tr><td>' + m + '</td><td>' + (a.engine||'\u2014') + '</td><td>' + (a.year||'\u2014') + '</td><td>' + (a.type||'\u2014') + '</td></tr>';
            }).join('') + '</tbody></table>';
    }

    /* descripción corta de 1 línea */
    function desc(p) {
        var parts = [];
        if (p.installation_type) parts.push(p.installation_type);
        if (p.filter_type)       parts.push(p.filter_type);
        if (p.technology)        parts.push('\u2014  ' + p.technology + '\u2122');
        if (p.thread_size)       parts.push('|  ' + p.thread_size);
        return parts.join('  ');
    }

    /* render principal */
    function render(p) {
        var sku   = p.elimfilters_sku || p.sku || '\u2014';
        var oem   = p.oem_codes || [];
        var cross = p.competitor_codes || p.cross_references || [];
        var apps  = p.applications || p.equipment_applications || [];

        /* tabla de specs – 2 celdas por fila, cada celda contiene label+valor apilados */
        var specsHTML =
            '<table class="ef7-specs-table">'
          + '<colgroup>'
          + '<col style="width:50%">'
          + '<col style="width:50%">'
          + '</colgroup>'
          + '<tbody>'
          + specRow('Filter Type',    v(p.filter_type),         false, 'Installation',     v(p.installation_type),    false)
          + specRow('Technology',     v(p.technology),          true,  'Thread Size',       v(p.thread_size),          false)
          + specRow('Outer Dia.',     mm(p.outer_diameter_mm),  false, 'Gasket OD',         mm(p.gasket_od_mm),        false)
          + specRow('Gasket ID',      mm(p.gasket_id_mm),       false, 'ISO Test Method',   v(p.iso_test_method),      false)
          + specRow('Micron Rating',  v(p.micron_rating),       false, 'Efficiency',        v(p.nominal_efficiency),   false)
          + specRow('Burst Pressure', v(p.burst_pressure_psi),  false, 'Collapse Pressure', v(p.collapse_pressure_psi),false)
          + '</tbody></table>';

        content.innerHTML =
          '<div class="ef7-card">'

          /* HEADER */
        + '<div class="ef7-header">'
        +   '<div class="ef7-header-top">'
        +     '<div class="ef7-sku">' + sku + '</div>'
        +     '<div class="ef7-ts-label">Technical Specifications</div>'
        +   '</div>'
        +   '<div class="ef7-desc">' + desc(p) + '</div>'
        + '</div>'

          /* BODY */
        + '<div class="ef7-body">'

            /* SIDEBAR */
        +   '<div class="ef7-sidebar">'
        +     '<img class="ef7-logo-e" src="https://elimfilters.com/wp-content/uploads/2025/11/cropped-AE6A9C09-F12F-4AA4-8021-EAF6F448860E.webp" alt="E">'
        +     '<img class="ef7-logo-full" src="https://elimfilters.com/wp-content/uploads/2025/11/logo-sin-fondo.png" alt="Elimfilters">'
        +     '<div class="ef7-gq">German Quality</div>'
        +   '</div>'

            /* CONTENT */
        +   '<div class="ef7-content">'

                /* TABS */
        +     '<div class="ef7-tabs">'
        +       '<div class="ef7-tab active" data-tab="specs">Specifications</div>'
        +       '<div class="ef7-tab" data-tab="oem">OEM Codes <span class="ef7-badge">' + oem.length + '</span></div>'
        +       '<div class="ef7-tab" data-tab="cross">Cross Reference <span class="ef7-badge">' + cross.length + '</span></div>'
        +       '<div class="ef7-tab" data-tab="equip">Equipment <span class="ef7-badge">' + apps.length + '</span></div>'
        +     '</div>'

                /* PANELS */
        +     '<div class="ef7-panel active" id="ef7p-specs">' + specsHTML + '</div>'
        +     '<div class="ef7-panel" id="ef7p-oem">'   + codes(oem)   + '</div>'
        +     '<div class="ef7-panel" id="ef7p-cross">' + codes(cross) + '</div>'
        +     '<div class="ef7-panel" id="ef7p-equip">' + equip(apps)  + '</div>'

        +   '</div>'  /* /content */
        + '</div>'    /* /body */
        + '</div>';   /* /card */

        /* tab switching */
        content.querySelectorAll('.ef7-tab').forEach(function(tab) {
            tab.addEventListener('click', function() {
                content.querySelectorAll('.ef7-tab').forEach(function(t)  { t.classList.remove('active'); });
                content.querySelectorAll('.ef7-panel').forEach(function(p) { p.classList.remove('active'); });
                tab.classList.add('active');
                content.querySelector('#ef7p-' + tab.dataset.tab).classList.add('active');
            });
        });
    }

    /* sugerencias */
    input.addEventListener('input', function() {
        var val = this.value.toUpperCase().trim();
        if (val.length < 2) { suggest.classList.remove('open'); return; }
        suggest.innerHTML = '<div class="ef7-suggest-item" onclick="window._ef7run(\'' + val.replace(/'/g, "\\'") + '\')">' + val + '</div>';
        suggest.classList.add('open');
    });

    window._ef7run = function(val) { input.value = val; search(val); };
    document.getElementById('ef7_btn').onclick = function() { search(input.value); };
    input.onkeypress = function(e) { if (e.which === 13) search(input.value); };
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') modal.classList.remove('open');
    });
})();
</script>

<?php return ob_get_clean(); });
