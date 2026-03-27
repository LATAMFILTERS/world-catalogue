<?php
/**
 * Plugin Name: ELIMFILTERS Search Pro V130
 * Description: V130 - Modal de resultados rediseñado: layout profesional con imagen, specs grid, OEM Codes, Cross Reference Codes y equipo compatible.
 * Version: 1.30.0
 */

if (!defined('ABSPATH')) exit;

/* ──────────────────────────────────────────────
   AJAX HANDLER
────────────────────────────────────────────── */
add_action('wp_ajax_ef_search_v130', 'ef_v130_handler');
add_action('wp_ajax_nopriv_ef_search_v130', 'ef_v130_handler');
function ef_v130_handler() {
    $q = isset($_GET['q']) ? sanitize_text_field($_GET['q']) : '';
    $url = 'https://world-catalogue-production.up.railway.app/api/filters/search/homologous?code=' . urlencode($q);
    $response = wp_remote_get($url, ['timeout' => 20, 'sslverify' => false]);
    if (is_wp_error($response)) {
        wp_send_json(['success' => false, 'payload' => null]);
        return;
    }
    wp_send_json(['success' => true, 'payload' => json_decode(wp_remote_retrieve_body($response), true)]);
}

/* ──────────────────────────────────────────────
   SHORTCODE
────────────────────────────────────────────── */
add_shortcode('elimfilters_search', 'ef_v130_render');
function ef_v130_render() {
    $ajax_url = admin_url('admin-ajax.php');
    ob_start();
    ?>
<!-- Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Roboto:wght@300;400;500&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet">

<style>
/* ── HERO SECTION ── */
#ef-hero-v130 {
    position: relative !important;
    width: 100vw !important;
    margin-left: calc(-50vw + 50%) !important;
    background: url('https://elimfilters.com/wp-content/uploads/2025/12/Imagen2.png') no-repeat center center;
    background-size: cover;
    height: 100vh !important;
    min-height: 600px;
    overflow: hidden;
}

/* ── SEARCH BOX ── */
#ef-box-v130 {
    position: absolute;
    top: 15%;
    left: 50%;
    transform: translateX(-50%);
    width: 90%;
    max-width: 440px;
    z-index: 100;
    background: #000;
    box-shadow: 0 10px 30px rgba(0,0,0,0.8);
}
.ef-tabs-v130 {
    display: flex;
    border-bottom: 1px solid #1a1a1a;
}
.ef-tab-v130 {
    flex: 1;
    padding: 12px 0;
    color: #fff;
    font-family: 'Oswald', sans-serif;
    text-align: center;
    cursor: pointer;
    text-transform: uppercase;
    font-size: 11px;
    letter-spacing: 1px;
    opacity: 0.35;
    border-bottom: 2px solid transparent;
    transition: opacity 0.2s, border-color 0.2s, color 0.2s;
}
.ef-tab-v130.active {
    opacity: 1;
    border-bottom: 2px solid #FDB714;
    color: #FDB714;
}
.ef-bar-v130 {
    padding: 15px 20px 8px 20px;
}
.ef-input-wrap-v130 {
    display: flex;
    align-items: center;
    background: #fff;
    border-radius: 1px;
    padding: 0 12px;
    height: 42px;
}
.ef-input-v130 {
    flex: 1;
    border: none !important;
    background: transparent !important;
    padding: 0 8px !important;
    font-family: 'Roboto', sans-serif;
    font-size: 14px;
    outline: none !important;
    color: #000 !important;
    box-shadow: none !important;
}
.ef-legend-v130 {
    color: #555;
    font-family: 'Roboto', sans-serif;
    font-size: 9px;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    padding-bottom: 12px;
}

/* ── MODAL OVERLAY ── */
#ef-modal-v130 {
    display: none;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    background: rgba(0,0,0,0.96) !important;
    z-index: 999999 !important;
    align-items: flex-start;
    justify-content: center;
    overflow-y: auto;
    padding: 20px 15px;
    box-sizing: border-box;
}
#ef-modal-v130.ef-open {
    display: flex !important;
}

/* ── MODAL CARD ── */
.ef-card-v130 {
    position: relative;
    width: 100%;
    max-width: 1000px;
    background: #0a0a0a;
    border: 1px solid #1e1e1e;
    color: #fff;
    font-family: 'Roboto', sans-serif;
    margin: auto;
    box-sizing: border-box;
}

/* ── CLOSE BUTTON ── */
.ef-close-v130 {
    position: absolute !important;
    top: 14px !important;
    right: 18px !important;
    color: #666 !important;
    font-size: 22px !important;
    cursor: pointer !important;
    line-height: 1 !important;
    z-index: 10 !important;
    background: none !important;
    border: none !important;
    transition: color 0.2s;
}
.ef-close-v130:hover { color: #FDB714 !important; }

/* ── PRODUCT HEADER ── */
.ef-header-v130 {
    display: flex;
    align-items: flex-start;
    gap: 0;
    border-bottom: 1px solid #1a1a1a;
    padding: 28px 32px 24px 32px;
}
.ef-sku-title-v130 {
    font-family: 'Oswald', sans-serif !important;
    font-size: 56px !important;
    font-weight: 700 !important;
    color: #FDB714 !important;
    letter-spacing: 2px !important;
    line-height: 1 !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    min-width: 200px;
    flex-shrink: 0;
}
.ef-desc-v130 {
    flex: 1;
    color: #888;
    font-family: 'Roboto', sans-serif;
    font-size: 13px;
    font-style: italic;
    font-weight: 300;
    margin: 6px 0 0 32px;
    line-height: 1.65;
    padding-top: 6px;
}

/* ── SPECS PANEL LAYOUT (image + specs side by side) ── */
.ef-specs-body-v130 {
    display: flex;
    gap: 0;
    align-items: flex-start;
}
.ef-specs-img-col-v130 {
    flex: 0 0 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding-right: 24px;
}
.ef-img-wrap-v130 {
    width: 180px;
    height: 180px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0a0a0a;
    border: 1px solid #1a1a1a;
    position: relative;
    overflow: hidden;
}
.ef-img-wrap-v130 img.ef-product-img {
    max-width: 160px;
    max-height: 160px;
    width: auto;
    height: auto;
    display: block;
    object-fit: contain;
}
/* CSS placeholder shown when image fails */
.ef-img-wrap-v130.ef-no-img::before {
    content: '';
    display: block;
    width: 60px;
    height: 60px;
    border: 2px solid #222;
    border-radius: 50%;
    position: absolute;
}
.ef-img-wrap-v130.ef-no-img::after {
    content: 'NO IMAGE';
    display: block;
    font-family: 'Oswald', sans-serif;
    font-size: 9px;
    letter-spacing: 2px;
    color: #2a2a2a;
    position: absolute;
    bottom: 12px;
}
.ef-specs-img-col-v130 img.ef-logo-img {
    width: 100px;
    height: auto;
    display: block;
    opacity: 0.75;
}
.ef-specs-content-v130 {
    flex: 1;
    min-width: 0;
}

/* ── SECTION TABS ── */
.ef-section-tabs-v130 {
    display: flex;
    border-bottom: 1px solid #1a1a1a;
    background: #060606;
}
.ef-stab-v130 {
    padding: 14px 22px;
    font-family: 'Oswald', sans-serif;
    font-size: 11px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #555;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: color 0.2s, border-color 0.2s;
    white-space: nowrap;
}
.ef-stab-v130:hover { color: #999; }
.ef-stab-v130.ef-stab-active {
    color: #FDB714;
    border-bottom: 2px solid #FDB714;
}
.ef-stab-count-v130 {
    display: inline-block;
    background: #1a1a1a;
    color: #666;
    font-size: 9px;
    padding: 1px 6px;
    margin-left: 6px;
    border-radius: 10px;
    font-family: 'Roboto Mono', monospace;
    vertical-align: middle;
}
.ef-stab-active .ef-stab-count-v130 {
    background: #2a2000;
    color: #FDB714;
}

/* ── TAB PANELS ── */
.ef-panel-v130 {
    display: none;
    padding: 28px 32px 32px 32px;
}
.ef-panel-v130.ef-panel-active { display: block; }

/* ── SPECS GRID ── */
.ef-specs-grid-v130 {
    width: 100%;
    border-collapse: collapse;
}
.ef-specs-grid-v130 tr:nth-child(odd) td { background: #0e0e0e; }
.ef-specs-grid-v130 tr:nth-child(even) td { background: #080808; }
.ef-specs-grid-v130 td {
    padding: 11px 14px;
    font-size: 12px;
    border: none;
    vertical-align: middle;
}
.ef-spec-label-v130 {
    color: #555 !important;
    font-family: 'Roboto', sans-serif !important;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    font-size: 11px !important;
    width: 22%;
    white-space: nowrap;
}
.ef-spec-val-v130 {
    color: #ddd !important;
    font-family: 'Roboto Mono', monospace !important;
    font-size: 12px !important;
    width: 28%;
}
.ef-spec-divider-v130 {
    width: 1px;
    background: #1a1a1a;
    padding: 0 !important;
}

/* ── OEM / CROSS REF TABLE ── */
.ef-ref-section-v130 {}
.ef-ref-table-v130 {
    width: 100%;
    border-collapse: collapse;
}
.ef-ref-table-v130 thead th {
    font-family: 'Oswald', sans-serif;
    font-size: 10px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #555;
    padding: 0 14px 12px 14px;
    text-align: left;
    border-bottom: 1px solid #1a1a1a;
    font-weight: 500;
}
.ef-ref-table-v130 tbody tr:nth-child(odd) td { background: #0e0e0e; }
.ef-ref-table-v130 tbody tr:nth-child(even) td { background: #080808; }
.ef-ref-table-v130 tbody td {
    padding: 10px 14px;
    font-size: 13px;
    border: none;
    vertical-align: middle;
}
.ef-ref-mfr-v130 {
    color: #888 !important;
    font-family: 'Roboto', sans-serif !important;
    font-size: 12px !important;
    width: 28%;
}
.ef-ref-code-v130 {
    color: #FDB714 !important;
    font-family: 'Roboto Mono', monospace !important;
    font-weight: 500 !important;
    font-size: 13px !important;
    letter-spacing: 0.5px !important;
    width: 20%;
}
.ef-ref-divider-v130 {
    width: 1px !important;
    background: #1a1a1a !important;
    padding: 0 !important;
}
.ef-ref-empty-v130 {
    text-align: center;
    padding: 40px 20px !important;
    color: #333 !important;
    font-family: 'Oswald', sans-serif !important;
    font-size: 13px !important;
    letter-spacing: 1px !important;
    text-transform: uppercase !important;
    background: transparent !important;
}

/* ── SECTION HEADER ── */
.ef-section-hdr-v130 {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 18px;
}
.ef-section-hdr-v130 h3 {
    font-family: 'Oswald', sans-serif !important;
    font-size: 15px !important;
    font-weight: 600 !important;
    color: #fff !important;
    letter-spacing: 2px !important;
    text-transform: uppercase !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
}
.ef-section-hdr-v130::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #1a1a1a;
}

/* ── LOADING ── */
.ef-loading-v130 {
    text-align: center;
    padding: 80px 40px;
    font-family: 'Oswald', sans-serif;
    color: #FDB714;
    font-size: 16px;
    letter-spacing: 3px;
    text-transform: uppercase;
}
.ef-loading-v130::after {
    content: '';
    display: block;
    width: 40px;
    height: 2px;
    background: #FDB714;
    margin: 16px auto 0;
    animation: ef-pulse 1.2s ease-in-out infinite;
}
@keyframes ef-pulse {
    0%, 100% { opacity: 0.2; transform: scaleX(0.5); }
    50% { opacity: 1; transform: scaleX(1); }
}

/* ── ERROR ── */
.ef-error-v130 {
    text-align: center;
    padding: 60px 40px;
    font-family: 'Oswald', sans-serif;
    color: #555;
    font-size: 14px;
    letter-spacing: 2px;
    text-transform: uppercase;
}
.ef-error-v130 span {
    display: block;
    font-size: 11px;
    color: #333;
    margin-top: 8px;
    letter-spacing: 1px;
}

/* ── RESPONSIVE ── */
@media (max-width: 680px) {
    .ef-header-v130 { flex-direction: column; padding: 20px 16px 16px; gap: 8px; }
    .ef-sku-title-v130 { font-size: 36px !important; min-width: unset; }
    .ef-desc-v130 { margin: 4px 0 0 0; font-size: 12px; }
    .ef-panel-v130 { padding: 20px 16px 24px 16px; }
    .ef-specs-body-v130 { flex-direction: column; }
    .ef-specs-img-col-v130 { flex: none; width: 100%; padding-right: 0; padding-bottom: 20px; flex-direction: row; gap: 16px; align-items: center; }
    .ef-img-wrap-v130 { width: 80px; height: 80px; }
    .ef-img-wrap-v130 img.ef-product-img { max-width: 70px; max-height: 70px; }
    .ef-specs-grid-v130 tr { display: block; }
    .ef-specs-grid-v130 td { display: block; width: 100% !important; }
    .ef-spec-divider-v130 { display: none; }
    .ef-stab-v130 { padding: 12px 14px; font-size: 10px; }
    #ef-modal-v130 { padding: 10px; }
    .ef-ref-divider-v130 { display: none; }
    .ef-ref-table-v130 td.ef-ref-mfr-v130:nth-child(4),
    .ef-ref-table-v130 td.ef-ref-code-v130:nth-child(5) { display: none; }
}
</style>

<!-- ── HERO WRAPPER ── -->
<div id="ef-hero-v130">
    <div id="ef-box-v130">
        <div class="ef-tabs-v130">
            <div class="ef-tab-v130 active" data-place="Search SKU, OEM or Cross..." onclick="efT130(this)">PART NUMBER</div>
            <div class="ef-tab-v130" data-place="Enter 17-digit VIN number..." onclick="efT130(this)">VIN</div>
            <div class="ef-tab-v130" data-place="Search by Engine or Model..." onclick="efT130(this)">EQUIPMENT</div>
        </div>
        <div class="ef-bar-v130">
            <div class="ef-input-wrap-v130">
                <span style="color:#999; font-size:14px;">&#128269;</span>
                <input type="text"
                       id="ef-q-v130"
                       class="ef-input-v130"
                       placeholder="Search SKU, OEM or Cross..."
                       onkeypress="if(event.key==='Enter') efS130()"
                       autocomplete="off">
            </div>
        </div>
        <div class="ef-legend-v130">Universal search across 10,000+ technical references</div>
    </div>
</div>

<!-- ── MODAL (outside hero, fixed on viewport) ── -->
<div id="ef-modal-v130" role="dialog" aria-modal="true">
    <div id="ef-body-v130" class="ef-card-v130">
        <!-- content injected by JS -->
    </div>
</div>

<script>
(function() {
    /* ── TAB SWITCH (search bar) ── */
    window.efT130 = function(el) {
        document.querySelectorAll('.ef-tab-v130').forEach(function(t){ t.classList.remove('active'); });
        el.classList.add('active');
        var inp = document.getElementById('ef-q-v130');
        inp.placeholder = el.getAttribute('data-place');
        inp.value = '';
        inp.focus();
    };

    /* ── CLOSE MODAL ── */
    window.efClose130 = function() {
        document.getElementById('ef-modal-v130').classList.remove('ef-open');
    };

    /* ── ESC key closes modal ── */
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') efClose130();
    });

    /* ── CLICK OUTSIDE CARD closes modal ── */
    document.getElementById('ef-modal-v130').addEventListener('click', function(e) {
        if (e.target === this) efClose130();
    });

    /* ── SECTION TAB SWITCH (inside modal) ── */
    window.efSTab130 = function(tabId) {
        document.querySelectorAll('.ef-stab-v130').forEach(function(t){ t.classList.remove('ef-stab-active'); });
        document.querySelectorAll('.ef-panel-v130').forEach(function(p){ p.classList.remove('ef-panel-active'); });
        document.querySelector('[data-stab="' + tabId + '"]').classList.add('ef-stab-active');
        document.getElementById('ef-panel-' + tabId).classList.add('ef-panel-active');
    };

    /* ── SEARCH ── */
    window.efS130 = function() {
        var v = document.getElementById('ef-q-v130').value.trim();
        if (!v) return;

        var modal  = document.getElementById('ef-modal-v130');
        var body   = document.getElementById('ef-body-v130');

        body.innerHTML = '<div class="ef-loading-v130">Consulting Database</div>';
        modal.classList.add('ef-open');
        modal.scrollTop = 0;

        fetch('<?php echo esc_js($ajax_url); ?>?action=ef_search_v130&q=' + encodeURIComponent(v))
            .then(function(r){ return r.json(); })
            .then(function(res) {
                var payload = res.payload || {};
                if (!payload.success || !payload.data) {
                    body.innerHTML = '<div class="ef-error-v130">No results found<span>' + v.toUpperCase() + ' — verify the code and try again</span></div>';
                    return;
                }
                renderV130(payload.data);
            })
            .catch(function() {
                body.innerHTML = '<div class="ef-error-v130">Connection error<span>Could not reach the database. Please try again.</span></div>';
            });
    };

    /* ── RENDER ── */
    function renderV130(d) {
        var body = document.getElementById('ef-body-v130');

        /* ── field mapping (real DB schema) ── */
        var sku        = (d.elimfilters_sku || d['ELIMFILTERS SKU'] || d.sku || '---').toString().toUpperCase();
        var filterType = d.filter_type || d['Filter Type'] || d.filterType || '';
        var tech       = d.elimfilters_technology || d['ELIMFILTERS Technology'] || '';
        var instType   = d.installation_type || d.installationType || d.subtype || '';
        var oemCodes   = Array.isArray(d.oem_codes) ? d.oem_codes : [];
        var crossCodes = Array.isArray(d.competitor_codes) ? d.competitor_codes : [];
        var equipment  = Array.isArray(d.applications) ? d.applications : [];
        var imgSrc     = (d.images && d.images.catalog) ? d.images.catalog : '';

        /* ── professional description (fully dynamic, all ELIMFILTERS prefixes) ── */
        var desc = (function() {
            var ft    = filterType.toLowerCase();
            var it    = instType.toLowerCase();
            var skuUp = sku.toUpperCase();

            /* ── official technology fallback table by SKU prefix ── */
            var TECH_BY_PREFIX = {
                'EA1': 'MACROCORE',  'EA2': 'INTEKCORE',
                'EF9': 'SYNTEPORE',  'ES9': 'AQUAGUARD',
                'EL8': 'SINTRAX',    'EH6': 'NANOFORCE',
                'ET9': 'AQUAGUARD',  'EW7': 'COOLTECH',
                'EC1': 'MICROKAPPA', 'ED4': 'DRYCORE',
                'ED3': 'BLUECLEAN',  'EG3': 'GASULTRA',
                'EK5': 'DURATECH',   'EK3': 'DURATECH',
                'EM9': 'MARINECLEAN'
            };

            /* detect 3-char prefix first (ED3, ED4, EK5, EK3…), then 2-char */
            var prefix3 = skuUp.substring(0, 3);
            var prefix2 = skuUp.substring(0, 2);
            var prefix  = TECH_BY_PREFIX[prefix3] ? prefix3 : prefix2;

            /* tech: use DB field if populated, else look up official table */
            var techName = tech ? tech.replace(/\u2122/g, '').trim() : '';
            if (!techName && TECH_BY_PREFIX[prefix3]) techName = TECH_BY_PREFIX[prefix3];
            else if (!techName && TECH_BY_PREFIX[prefix2 + '8']) techName = TECH_BY_PREFIX[prefix2 + '8']; /* e.g. EL8 */

            /* ── resolve category ── filter_type wins, then prefix fallback ── */
            var cat = 'general';
            if      (ft.indexOf('cabin') !== -1 || ft.indexOf('cabina') !== -1 || prefix3 === 'EC1') cat = 'cabin';
            else if (ft.indexOf('def') !== -1 || ft.indexOf('adblue') !== -1 || ft.indexOf('urea') !== -1 || prefix3 === 'ED3') cat = 'def';
            else if (ft.indexOf('dryer') !== -1 || ft.indexOf('secador') !== -1 || prefix3 === 'ED4') cat = 'airdryer';
            else if (ft.indexOf('gas') !== -1 || ft.indexOf('lpg') !== -1 || ft.indexOf('gnc') !== -1 || prefix3 === 'EG3') cat = 'gas';
            else if (ft.indexOf('intake') !== -1 || ft.indexOf('carcasa') !== -1 || ft.indexOf('housing') !== -1 || prefix3 === 'EA2') cat = 'intake';
            else if (ft.indexOf('air') !== -1 || ft.indexOf('aire') !== -1 || prefix2 === 'EA') cat = 'air';
            else if (ft.indexOf('turbine') !== -1 || prefix3 === 'ET9') cat = 'turbine';
            else if (ft.indexOf('separator') !== -1 || ft.indexOf('separador') !== -1 || prefix3 === 'ES9') cat = 'separator';
            else if (ft.indexOf('fuel') !== -1 || ft.indexOf('combustible') !== -1 || prefix3 === 'EF9') cat = 'fuel';
            else if (ft.indexOf('hydraul') !== -1 || ft.indexOf('hidr') !== -1 || prefix3 === 'EH6') cat = 'hydraulic';
            else if (ft.indexOf('coolant') !== -1 || ft.indexOf('refriger') !== -1 || prefix3 === 'EW7') cat = 'coolant';
            else if (ft.indexOf('marine') !== -1 || ft.indexOf('marin') !== -1 || prefix3 === 'EM9') cat = 'marine';
            else if (ft.indexOf('kit') !== -1 || prefix3 === 'EK5' || prefix3 === 'EK3') cat = 'kit';
            else if (ft.indexOf('lube') !== -1 || ft.indexOf('aceite') !== -1 || ft.indexOf('oil') !== -1 || prefix3 === 'EL8') cat = 'lube';

            /* ── attributes present on this specific product ── */
            var hasBypass    = !!(d.bypass_valve_pressure_psi || d.pressure_valve);
            var hasAntiDrain = !!(d.anti_drainback_valve);
            var hasThread    = !!(d.thread_size);
            var hasMicron    = !!(d.micron_rating);
            var hasEff       = !!(d.nominal_efficiency);
            var hasISO       = !!(d.iso_test_method);
            var hasFlow      = !!(d.rated_flow_lmin || d.rated_flow_cfm);
            var hasBeta      = !!(d.beta_ratio);

            var isSpinOn    = it.indexOf('spin') !== -1;
            var isCartridge = it.indexOf('cartridge') !== -1;
            var T           = techName ? techName + '\u2122' : '';   /* e.g. "SINTRAX™" */

            var s = '';

            /* ===== LUBE / OIL — EL8 / SINTRAX™ ===== */
            if (cat === 'lube') {
                s = 'Elimfilters\u00AE ' + skuUp + ' genuine ' + (isSpinOn ? 'spin-on ' : isCartridge ? 'cartridge ' : '') + 'lube filter';
                if (T) s += ' engineered with ' + T + ' filtration media technology';
                if (hasBypass) s += (T ? ' that combines' : ' combines') + ' full-flow and by-pass filtration into one single unit';
                s += ', developed to meet or exceed OEM engine requirements.';
                s += ' Protects your engine from wear particles, sludge and metallic debris that lead to premature bearing, ring and valve failure';
                if (hasMicron) s += ', capturing contaminants as small as ' + d.micron_rating + ' microns';
                s += ', ensuring maximum service life and unrestricted oil flow.';
                if (hasAntiDrain) s += ' Built-in anti-drainback valve maintains oil pressure film at every cold start, eliminating dry-start wear.';
                if (hasThread) s += ' Direct OEM fit with ' + d.thread_size + ' thread for tool-free installation.';
                if (T) s += ' The ' + T + ' media delivers superior dirt-holding capacity and extended drain intervals beyond conventional cellulose filters.';
            }

            /* ===== ENGINE AIR — EA1 / MACROCORE™ ===== */
            else if (cat === 'air') {
                s = 'Elimfilters\u00AE ' + skuUp + ' genuine ' + (isCartridge ? 'cartridge ' : '') + 'air filter';
                if (T) s += ' engineered with ' + T + ' high-efficiency media technology';
                s += ', developed to deliver 100% pure air to the engine and meet or exceed OEM intake protection requirements.';
                s += ' Captures dust, debris and airborne contaminants';
                if (hasMicron) s += ' down to ' + d.micron_rating + ' microns';
                s += ', ensuring optimal air-fuel ratio, combustion efficiency and engine longevity.';
                if (hasEff) s += ' Delivers ' + d.nominal_efficiency + '% multi-pass filtration efficiency';
                if (hasISO) s += (hasEff ? ' per ' : ' Validated under ') + d.iso_test_method;
                if (hasEff || hasISO) s += '.';
                if (T) s += ' ' + T + ' extended media surface provides up to 2\xd7 longer service life versus conventional cellulose filters.';
            }

            /* ===== INTAKE HOUSING — EA2 / INTEKCORE™ ===== */
            else if (cat === 'intake') {
                s = 'Elimfilters\u00AE ' + skuUp + ' heavy-duty air intake housing';
                if (T) s += ' built with ' + T + ' optimized flow-path design';
                s += ', engineered to maximize air throughput while maintaining structural integrity under extreme vibration and thermal cycling.';
                s += ' Precision-formed body ensures a perfect seal with OEM air filter elements, preventing unfiltered air bypass.';
                if (hasFlow) { var fl = d.rated_flow_cfm ? d.rated_flow_cfm + ' CFM' : d.rated_flow_lmin + ' L/min'; s += ' Rated for ' + fl + ' maximum flow.'; }
            }

            /* ===== FUEL — EF9 / SYNTEPORE™ ===== */
            else if (cat === 'fuel') {
                s = 'Elimfilters\u00AE ' + skuUp + ' genuine ' + (isSpinOn ? 'spin-on ' : isCartridge ? 'cartridge ' : '') + 'fuel filter';
                if (T) s += ' with ' + T + ' synthetic armor media — delivering 100% pure fuel to the injection system';
                s += ', developed to meet or exceed OEM requirements.';
                s += ' Protects Common Rail injectors, high-pressure pumps and fuel system components from contamination-induced wear.';
                if (hasMicron) s += ' Captures particles as small as ' + d.micron_rating + ' microns';
                if (hasEff) s += (hasMicron ? ', achieving ' : ' Achieves ') + d.nominal_efficiency + '% filtration efficiency';
                if (hasMicron || hasEff) s += '.';
                s += ' Compatible with biodiesel B20, ULSD and Tier 4 Final / Euro VI engine requirements.';
                if (hasAntiDrain) s += ' Anti-drainback valve prevents dry starts and maintains fuel prime.';
            }

            /* ===== FUEL/WATER SEPARATOR — ES9 / AQUAGUARD™ ===== */
            else if (cat === 'separator') {
                s = 'Elimfilters\u00AE ' + skuUp + ' genuine fuel/water separator';
                if (T) s += ' with ' + T + ' total moisture protection technology';
                s += ', providing complete defense against water and humidity in diesel fuel systems, meeting or exceeding OEM requirements.';
                s += ' Achieves 99% water separation efficiency, eliminating free and emulsified water that causes injector corrosion, pump wear and costly downtime.';
                if (hasFlow) { var fl2 = d.rated_flow_lmin ? d.rated_flow_lmin + ' L/min' : d.rated_flow_cfm + ' CFM'; s += ' Rated for ' + fl2 + '.'; }
                s += ' Compatible with biodiesel B20, conventional diesel and ULSD blends.';
            }

            /* ===== HYDRAULIC — EH6 / NANOFORCE™ ===== */
            else if (cat === 'hydraulic') {
                s = 'Elimfilters\u00AE ' + skuUp + ' genuine ' + (isSpinOn ? 'spin-on ' : isCartridge ? 'cartridge ' : '') + 'hydraulic filter';
                if (T) s += ' engineered with ' + T + ' precision nanofiber media for optimized high-pressure flow';
                s += ', developed to meet or exceed OEM requirements for heavy-duty hydraulic systems.';
                s += ' Removes metallic particles and contaminants that cause valve spool sticking, pump erosion and actuator failure.';
                if (hasEff) s += ' Achieves ' + d.nominal_efficiency + '% filtration efficiency';
                if (hasISO) s += (hasEff ? ' per ' : ' Validated under ') + d.iso_test_method;
                if (hasEff || hasISO) s += '.';
                if (hasBeta) s += ' Beta ratio \u03b2 = ' + d.beta_ratio + ' ensures absolute precision filtration.';
                if (d.max_pressure_psi) s += ' Rated to ' + d.max_pressure_psi + ' psi for the most demanding industrial applications.';
            }

            /* ===== TURBINE — ET9 / AQUAGUARD™ ===== */
            else if (cat === 'turbine') {
                s = 'Elimfilters\u00AE ' + skuUp + ' genuine turbine fuel/water separator';
                if (T) s += ' with ' + T + ' Aquabloc\u00AE media — maximum protection and smooth flow for turbine systems';
                s += ', developed to meet or exceed OEM requirements for industrial turbines and generators.';
                s += ' Achieves 99% water separation efficiency, protecting precision injection components from water contamination, corrosion and premature failure.';
                if (hasFlow) { var fl3 = d.rated_flow_lmin ? d.rated_flow_lmin + ' L/min' : d.rated_flow_cfm + ' CFM'; s += ' Rated for ' + fl3 + ' flow capacity.'; }
                s += ' Available in multiple service intervals (1000FH, 900FH, 500FH) to match your maintenance schedule.';
            }

            /* ===== COOLANT — EW7 / COOLTECH™ ===== */
            else if (cat === 'coolant') {
                s = 'Elimfilters\u00AE ' + skuUp + ' genuine coolant filter';
                if (T) s += ' with ' + T + ' corrosion control and thermal balance technology';
                s += ', developed to protect heavy-duty cooling systems and meet or exceed OEM service requirements.';
                s += ' Removes abrasive particles from coolant circuits while delivering integrated corrosion inhibitor protection for radiators, water pumps and cylinder liners.';
                s += ' Compatible with OAT, NOAT and conventional extended-life coolant formulations.';
            }

            /* ===== CABIN AIR — EC1 / MICROKAPPA™ ===== */
            else if (cat === 'cabin') {
                s = 'Elimfilters\u00AE ' + skuUp + ' genuine cabin air filter';
                if (T) s += ' with ' + T + ' multi-layer allergen protection technology';
                s += ', engineered to deliver pure air and protect occupant health inside the cab.';
                s += ' Captures 99.5% of pollen, dust, bacteria and fine particulate matter';
                s += ', with an activated carbon layer that absorbs harmful gases, odors and VOCs';
                s += ', while safeguarding your HVAC system from dirt accumulation.';
                s += ' Recommended replacement every 12\u201315 months or 15,000 km for optimal air quality.';
            }

            /* ===== AIR DRYER — ED4 / DRYCORE™ ===== */
            else if (cat === 'airdryer') {
                s = 'Elimfilters\u00AE ' + skuUp + ' genuine air dryer cartridge';
                if (T) s += ' with ' + T + ' total moisture elimination technology';
                s += ', designed for complete removal of humidity from compressed air and pneumatic brake systems, meeting or exceeding OEM requirements.';
                s += ' Prevents corrosion in air lines, valves and brake components, and protects against system freeze-up in cold climates.';
                s += ' Essential for maintaining safe, reliable air brake performance on heavy-duty trucks and buses.';
            }

            /* ===== DEF / ADBLUE — ED3 / BLUECLEAN™ ===== */
            else if (cat === 'def') {
                s = 'Elimfilters\u00AE ' + skuUp + ' genuine DEF/AdBlue filter';
                if (T) s += ' with ' + T + ' maximum urea purity technology';
                s += ', engineered to protect SCR (Selective Catalytic Reduction) systems in Tier 4 Final and Euro VI compliant engines.';
                s += ' Removes crystalline deposits, particulates and contaminants from DEF/AdBlue fluid that degrade injector nozzles and dosing pumps.';
                s += ' Ensures precise urea concentration for optimal NOx reduction and regulatory compliance.';
            }

            /* ===== GAS — EG3 / GASULTRA™ ===== */
            else if (cat === 'gas') {
                s = 'Elimfilters\u00AE ' + skuUp + ' genuine gas filter';
                if (T) s += ' engineered with ' + T + ' precision gas filtration technology';
                s += ', developed for LPG and CNG (GNC) engine fuel systems meeting or exceeding OEM requirements.';
                s += ' Removes contaminants, moisture and particulates from gaseous fuel before combustion, protecting injectors, pressure regulators and combustion chamber components.';
                s += ' Ensures clean, precise fuel delivery for maximum engine efficiency and reduced emissions.';
            }

            /* ===== MARINE — EM9 / MARINECLEAN™ ===== */
            else if (cat === 'marine') {
                s = 'Elimfilters\u00AE ' + skuUp + ' genuine marine ' + (isSpinOn ? 'spin-on ' : isCartridge ? 'cartridge ' : '') + 'filter';
                if (T) s += ' with ' + T + ' anti-corrosion protection technology for open-water purity';
                s += ', engineered to withstand the extreme demands of saltwater and freshwater marine environments, meeting or exceeding OEM specifications.';
                s += ' Features a marine-grade corrosion-resistant body and robust seal that prevents leaks under intense vibration, pressure and temperature cycling.';
                s += ' Protects inboard, outboard and marine diesel engines from wear particles and water ingress.';
                if (hasAntiDrain) s += ' Anti-drainback valve ensures immediate lubrication at every engine start.';
            }

            /* ===== SERVICE KITS — EK5 / EK3 / DURATECH™ ===== */
            else if (cat === 'kit') {
                var isHD = prefix3 === 'EK5' || ft.indexOf('heavy') !== -1;
                s = 'Elimfilters\u00AE ' + skuUp + ' complete ' + (isHD ? 'Heavy Duty' : 'Light Duty') + ' service kit';
                if (T) s += ' with ' + T + ' components';
                s += ' — everything you need in one box for a full ' + (isHD ? 'major heavy-duty' : 'light-duty vehicle') + ' service.';
                s += ' Includes all filters required for a single scheduled maintenance event, saving time on ordering and ensuring every critical fluid is filtered with genuine ELIMFILTERS quality.';
            }

            /* ===== GENERAL ===== */
            else {
                s = 'Elimfilters\u00AE ' + skuUp + ' genuine industrial filter';
                if (T) s += ' engineered with ' + T + ' filtration technology';
                s += ', developed to meet or exceed OEM filtration requirements.';
                s += ' Provides reliable contaminant removal to protect critical equipment components and extend service life under demanding operating conditions.';
            }

            /* ── if MongoDB has a hand-written narrative, use it instead ── */
            return d.marketing_narrative || d.Description || s;
        })();

        /* ── spec pairs — ordered per ELIMFILTERS field spec ── */
        var specPairs = [];
        if (filterType)                        specPairs.push(['Filter Type',       filterType]);
        if (instType)                          specPairs.push(['Installation',      instType]);
        if (tech)                              specPairs.push(['Technology',        tech]);
        if (d.thread_size)                     specPairs.push(['Thread Size',       d.thread_size]);
        if (d.height_mm)                       specPairs.push(['Height',            d.height_mm + ' mm / ' + (d.height_inch || '--') + '"']);
        if (d.outer_diameter_mm)               specPairs.push(['Outer Dia.',        d.outer_diameter_mm + ' mm / ' + (d.outer_diameter_inch || '--') + '"']);
        if (d.inner_diameter_mm)               specPairs.push(['Inner Dia.',        d.inner_diameter_mm + ' mm / ' + (d.inner_diameter_inch || '--') + '"']);
        if (d.gasket_od_mm)                    specPairs.push(['Gasket OD',         d.gasket_od_mm + ' mm / ' + (d.gasket_od_inch || '--') + '"']);
        if (d.gasket_id_mm)                    specPairs.push(['Gasket ID',         d.gasket_id_mm + ' mm / ' + (d.gasket_id_inch || '--') + '"']);
        if (d.iso_test_method)                 specPairs.push(['ISO Test Method',   d.iso_test_method]);
        if (d.micron_rating)                   specPairs.push(['Micron Rating',     d.micron_rating]);
        if (d.beta_ratio)                      specPairs.push(['Beta Ratio',        d.beta_ratio]);
        if (d.nominal_efficiency)              specPairs.push(['Efficiency',        d.nominal_efficiency + '%']);
        if (d.max_pressure_psi)                specPairs.push(['Max Pressure',      d.max_pressure_psi + ' psi']);
        if (d.rated_flow_lmin && d.rated_flow_gpm) specPairs.push(['Rated Flow', d.rated_flow_lmin + ' L/min / ' + d.rated_flow_gpm + ' GPM']);
        else if (d.rated_flow_lmin)            specPairs.push(['Rated Flow',        d.rated_flow_lmin + ' L/min']);
        if (d.rated_flow_cfm)                  specPairs.push(['Rated Flow (CFM)',  d.rated_flow_cfm + ' CFM']);
        if (d.burst_pressure_psi)              specPairs.push(['Burst Pressure',    d.burst_pressure_psi + ' psi']);
        if (d.collapse_pressure_psi)           specPairs.push(['Collapse Pressure', d.collapse_pressure_psi + ' psi']);
        if (d.bypass_valve_pressure_psi)       specPairs.push(['Bypass Valve',      d.bypass_valve_pressure_psi + ' psi']);
        if (d.pressure_valve)                  specPairs.push(['Pressure Valve',    d.pressure_valve]);
        if (d.anti_drainback_valve)            specPairs.push(['Anti-Drainback',    d.anti_drainback_valve]);

        /* ── build specs table (2-column) ── */
        var specsRows = '';
        if (specPairs.length === 0) {
            specsRows = '<tr><td colspan="5" class="ef-ref-empty-v130">No specifications available</td></tr>';
        } else {
            for (var j = 0; j < specPairs.length; j += 2) {
                var a = specPairs[j], b = specPairs[j + 1];
                specsRows += '<tr>';
                specsRows += '<td class="ef-spec-label-v130">' + escHtml(a[0]) + '</td>';
                specsRows += '<td class="ef-spec-val-v130">'   + escHtml(String(a[1])) + '</td>';
                specsRows += '<td class="ef-spec-divider-v130"></td>';
                if (b) {
                    specsRows += '<td class="ef-spec-label-v130">' + escHtml(b[0]) + '</td>';
                    specsRows += '<td class="ef-spec-val-v130">'   + escHtml(String(b[1])) + '</td>';
                } else {
                    specsRows += '<td class="ef-spec-label-v130"></td><td class="ef-spec-val-v130"></td>';
                }
                specsRows += '</tr>';
            }
        }

        /* ── helper: build 2-pair-per-row table rows ── */
        function buildPairRows(arr, col1, col2, emptyMsg, col2Style) {
            if (arr.length === 0) return '<tr><td colspan="5" class="ef-ref-empty-v130">' + emptyMsg + '</td></tr>';
            var r = '';
            for (var pi = 0; pi < arr.length; pi += 2) {
                var pa = arr[pi], pb = arr[pi + 1];
                r += '<tr>';
                r += '<td class="ef-ref-mfr-v130">' + escHtml(pa[col1] || '') + '</td>';
                r += '<td class="ef-ref-code-v130"' + (col2Style ? ' style="' + col2Style + '"' : '') + '>' + escHtml(pa[col2] || '') + '</td>';
                r += '<td class="ef-ref-divider-v130"></td>';
                if (pb) {
                    r += '<td class="ef-ref-mfr-v130">' + escHtml(pb[col1] || '') + '</td>';
                    r += '<td class="ef-ref-code-v130"' + (col2Style ? ' style="' + col2Style + '"' : '') + '>' + escHtml(pb[col2] || '') + '</td>';
                } else {
                    r += '<td class="ef-ref-mfr-v130"></td><td class="ef-ref-code-v130"></td>';
                }
                r += '</tr>';
            }
            return r;
        }

        /* ── OEM codes table ── */
        var oemRows = buildPairRows(oemCodes, 'manufacturer', 'code', 'No OEM codes available', '');

        /* ── Competitor / cross reference codes table ── */
        var crossRows = buildPairRows(crossCodes, 'manufacturer', 'code', 'No cross reference codes available', '');

        /* ── Equipment / applications table ── */
        var equipRows = buildPairRows(equipment, 'machine', 'engine', 'No compatible equipment available', 'color:#ccc!important;font-family:\'Roboto\',sans-serif!important;font-size:12px!important;');

        /* ── image — wrapper with CSS fallback, no external placeholder dependency ── */
        var imgTag = imgSrc
            ? '<div class="ef-img-wrap-v130"><img class="ef-product-img" src="' + escHtml(imgSrc) + '" alt="' + escHtml(sku) + '" onerror="this.style.display=\'none\';this.parentNode.classList.add(\'ef-no-img\')"></div>'
            : '<div class="ef-img-wrap-v130 ef-no-img"></div>';

        /* ── assemble HTML ── */
        body.innerHTML =
            '<button class="ef-close-v130" onclick="efClose130()" title="Close">&times;</button>' +

            /* PRODUCT HEADER — SKU left + italic description right, no image, no badges */
            '<div class="ef-header-v130">' +
                '<h1 class="ef-sku-title-v130">' + escHtml(sku) + '</h1>' +
                (desc ? '<p class="ef-desc-v130"><em>' + escHtml(desc) + '</em></p>' : '') +
            '</div>' +

            /* SECTION TABS */
            '<div class="ef-section-tabs-v130">' +
                '<div class="ef-stab-v130 ef-stab-active" data-stab="specs" onclick="efSTab130(\'specs\')">Specifications</div>' +
                '<div class="ef-stab-v130" data-stab="oem" onclick="efSTab130(\'oem\')">OEM Codes <span class="ef-stab-count-v130">' + oemCodes.length + '</span></div>' +
                '<div class="ef-stab-v130" data-stab="cross" onclick="efSTab130(\'cross\')">Cross Reference <span class="ef-stab-count-v130">' + crossCodes.length + '</span></div>' +
                '<div class="ef-stab-v130" data-stab="equip" onclick="efSTab130(\'equip\')">Compatible Equipment <span class="ef-stab-count-v130">' + equipment.length + '</span></div>' +
            '</div>' +

            /* PANEL: SPECIFICATIONS — image col (left) + specs table (right) */
            '<div class="ef-panel-v130 ef-panel-active" id="ef-panel-specs">' +
                '<div class="ef-section-hdr-v130"><h3>Technical Specifications</h3></div>' +
                '<div class="ef-specs-body-v130">' +
                    '<div class="ef-specs-img-col-v130">' +
                        imgTag +
                        '<img class="ef-logo-img" src="https://elimfilters.com/wp-content/uploads/2025/11/logo-sin-fondo.png" alt="ELIMFILTERS">' +
                    '</div>' +
                    '<div class="ef-specs-content-v130">' +
                        '<table class="ef-specs-grid-v130"><tbody>' + specsRows + '</tbody></table>' +
                    '</div>' +
                '</div>' +
            '</div>' +

            /* PANEL: OEM CODES — 2 pairs per row */
            '<div class="ef-panel-v130" id="ef-panel-oem">' +
                '<div class="ef-section-hdr-v130"><h3>OEM Codes</h3></div>' +
                '<p style="color:#444;font-size:11px;font-family:Roboto,sans-serif;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px 0;">Original Equipment Manufacturer part numbers</p>' +
                '<table class="ef-ref-table-v130"><thead><tr><th>Manufacturer</th><th>Part Number</th><th style="width:1px;padding:0;"></th><th>Manufacturer</th><th>Part Number</th></tr></thead><tbody>' + oemRows + '</tbody></table>' +
            '</div>' +

            /* PANEL: CROSS REFERENCE — 2 pairs per row */
            '<div class="ef-panel-v130" id="ef-panel-cross">' +
                '<div class="ef-section-hdr-v130"><h3>Cross Reference Codes</h3></div>' +
                '<p style="color:#444;font-size:11px;font-family:Roboto,sans-serif;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px 0;">Equivalent part numbers from other filter brands</p>' +
                '<table class="ef-ref-table-v130"><thead><tr><th>Brand</th><th>Part Number</th><th style="width:1px;padding:0;"></th><th>Brand</th><th>Part Number</th></tr></thead><tbody>' + crossRows + '</tbody></table>' +
            '</div>' +

            /* PANEL: COMPATIBLE EQUIPMENT — 2 pairs per row */
            '<div class="ef-panel-v130" id="ef-panel-equip">' +
                '<div class="ef-section-hdr-v130"><h3>Compatible Equipment</h3></div>' +
                '<p style="color:#444;font-size:11px;font-family:Roboto,sans-serif;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px 0;">Vehicles and machinery compatible with this filter</p>' +
                '<table class="ef-ref-table-v130"><thead><tr><th>Machine</th><th>Engine</th><th style="width:1px;padding:0;"></th><th>Machine</th><th>Engine</th></tr></thead><tbody>' + equipRows + '</tbody></table>' +
            '</div>';
    }

    /* ── XSS helper ── */
    function escHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

})();
</script>
    <?php
    return ob_get_clean();
}
