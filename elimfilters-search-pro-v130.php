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
.ef-product-header-v130 {
    display: flex;
    gap: 0;
    border-bottom: 1px solid #1a1a1a;
}
.ef-img-col-v130 {
    flex: 0 0 240px;
    background: #050505;
    border-right: 1px solid #1a1a1a;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px 20px;
    gap: 20px;
}
.ef-img-col-v130 img.ef-product-img {
    width: 100%;
    max-width: 180px;
    height: auto;
    display: block;
}
.ef-img-col-v130 img.ef-logo-img {
    width: 110px;
    height: auto;
    display: block;
    opacity: 0.85;
}
.ef-info-col-v130 {
    flex: 1;
    padding: 28px 32px 24px 32px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}
.ef-sku-title-v130 {
    font-family: 'Oswald', sans-serif !important;
    font-size: 48px !important;
    font-weight: 700 !important;
    color: #FDB714 !important;
    letter-spacing: 2px !important;
    line-height: 1 !important;
    margin: 0 0 6px 0 !important;
    padding: 0 !important;
    border: none !important;
}
.ef-desc-v130 {
    color: #888;
    font-size: 14px;
    font-weight: 300;
    margin: 0 0 16px 0;
    line-height: 1.5;
}
.ef-badges-v130 {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 4px;
}
.ef-badge-v130 {
    font-family: 'Oswald', sans-serif;
    font-size: 10px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    padding: 4px 12px;
    border: 1px solid #333;
    color: #aaa;
    display: inline-block;
}
.ef-badge-v130.ef-badge-type {
    border-color: #FDB714;
    color: #FDB714;
}
.ef-badge-v130.ef-badge-tier {
    border-color: #555;
    color: #888;
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
    width: 35%;
}
.ef-ref-code-v130 {
    color: #FDB714 !important;
    font-family: 'Roboto Mono', monospace !important;
    font-weight: 500 !important;
    font-size: 13px !important;
    letter-spacing: 0.5px !important;
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
    .ef-product-header-v130 { flex-direction: column; }
    .ef-img-col-v130 {
        flex: none;
        flex-direction: row;
        border-right: none;
        border-bottom: 1px solid #1a1a1a;
        padding: 20px;
        justify-content: space-between;
    }
    .ef-img-col-v130 img.ef-product-img { max-width: 80px; }
    .ef-info-col-v130 { padding: 20px; }
    .ef-sku-title-v130 { font-size: 32px !important; }
    .ef-panel-v130 { padding: 20px 16px 24px 16px; }
    .ef-specs-grid-v130 tr { display: block; }
    .ef-specs-grid-v130 td { display: block; width: 100% !important; }
    .ef-spec-divider-v130 { display: none; }
    .ef-stab-v130 { padding: 12px 14px; font-size: 10px; }
    #ef-modal-v130 { padding: 10px; }
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

        /* ── professional description (generated from product data) ── */
        var desc = (function() {
            var ft = filterType.toLowerCase();
            var it = instType.toLowerCase();
            var hasBypass     = !!(d.bypass_valve_pressure_psi || d.pressure_valve);
            var hasAntiDrain  = !!(d.anti_drainback_valve);
            var isSpinOn      = it.indexOf('spin') !== -1;
            var isCartridge   = it.indexOf('cartridge') !== -1;
            var techName      = tech ? tech.trim() : '';

            /* filter category label */
            var catLabel = 'filtration';
            if (ft.indexOf('lube') !== -1 || ft.indexOf('aceite') !== -1)           catLabel = 'lube filtration';
            else if (ft.indexOf('fuel') !== -1 || ft.indexOf('combustible') !== -1) catLabel = 'fuel filtration';
            else if (ft.indexOf('hydraul') !== -1 || ft.indexOf('hidr') !== -1)     catLabel = 'hydraulic filtration';
            else if (ft.indexOf('air') !== -1 || ft.indexOf('aire') !== -1)         catLabel = 'air filtration';
            else if (ft.indexOf('turbine') !== -1)                                  catLabel = 'turbine filtration';

            /* format label */
            var formatLabel = isSpinOn ? 'spin-on' : isCartridge ? 'cartridge' : '';

            /* open sentence */
            var sentence = 'Elimfilters\u00AE ' + sku + ' genuine ' + (formatLabel ? formatLabel + ' ' : '') + catLabel.replace(' filtration','') + ' filter';

            /* technology clause — placed before bypass */
            if (techName) {
                sentence += ' engineered with ' + techName + '\u2122 filtration media technology';
            }

            /* bypass clause */
            if (hasBypass && techName) {
                sentence += ' that combines full-flow and by-pass filtration into one single unit';
            } else if (hasBypass) {
                sentence += ' combines full-flow and by-pass filtration into one single unit';
            }

            sentence += ', developed to meet or exceed OEM requirements.';

            /* second sentence based on category */
            var s2 = '';
            if (ft.indexOf('lube') !== -1 || ft.indexOf('aceite') !== -1) {
                s2 = ' Engineered to protect your engine from wear particles that can lead to premature failure, ensuring maximum service life and oil flow efficiency.';
                if (hasAntiDrain) s2 += ' Features anti-drainback valve to maintain oil pressure at startup.';
            } else if (ft.indexOf('fuel') !== -1 || ft.indexOf('combustible') !== -1) {
                s2 = ' Provides superior water separation and particle removal to protect fuel system components and injection equipment.';
            } else if (ft.indexOf('hydraul') !== -1 || ft.indexOf('hidr') !== -1) {
                s2 = ' Delivers consistent hydraulic system protection by removing contaminants that cause valve and pump wear.';
            } else if (ft.indexOf('air') !== -1 || ft.indexOf('aire') !== -1) {
                s2 = ' Protects engine intake from dust, debris and airborne contaminants, ensuring optimal air-fuel ratio and combustion efficiency.';
            } else {
                s2 = ' Provides reliable filtration performance engineered to meet stringent industrial standards.';
            }

            /* technology closing statement */
            if (techName) {
                s2 += ' The ' + techName + '\u2122 technology delivers superior dirt-holding capacity and extended service intervals beyond conventional filters.';
            }

            return sentence + s2;
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

        /* ── OEM codes table ── */
        var oemRows = oemCodes.length === 0
            ? '<tr><td colspan="2" class="ef-ref-empty-v130">No OEM codes available</td></tr>'
            : oemCodes.map(function(i) {
                return '<tr><td class="ef-ref-mfr-v130">' + escHtml(i.manufacturer || '') + '</td><td class="ef-ref-code-v130">' + escHtml(i.code || '') + '</td></tr>';
              }).join('');

        /* ── Competitor / cross reference codes table ── */
        var crossRows = crossCodes.length === 0
            ? '<tr><td colspan="2" class="ef-ref-empty-v130">No cross reference codes available</td></tr>'
            : crossCodes.map(function(i) {
                return '<tr><td class="ef-ref-mfr-v130">' + escHtml(i.manufacturer || '') + '</td><td class="ef-ref-code-v130">' + escHtml(i.code || '') + '</td></tr>';
              }).join('');

        /* ── Equipment / applications table ── */
        var equipRows = equipment.length === 0
            ? '<tr><td colspan="2" class="ef-ref-empty-v130">No compatible equipment available</td></tr>'
            : equipment.map(function(i) {
                return '<tr><td class="ef-ref-mfr-v130">' + escHtml(i.machine || '') + '</td><td class="ef-ref-code-v130" style="color:#ccc!important;font-family:\'Roboto\',sans-serif!important;font-size:12px!important;">' + escHtml(i.engine || '') + '</td></tr>';
              }).join('');

        /* ── badges ── */
        var badges = '';
        if (filterType) badges += '<span class="ef-badge-v130 ef-badge-type">' + escHtml(filterType) + '</span>';
        if (instType)   badges += '<span class="ef-badge-v130 ef-badge-tier">' + escHtml(instType) + '</span>';
        if (tech)       badges += '<span class="ef-badge-v130 ef-badge-tier" style="border-color:#2a4a2a;color:#5a9a5a;">' + escHtml(tech) + '</span>';

        /* ── image ── */
        var imgTag = '<img class="ef-product-img" src="' + (imgSrc ? escHtml(imgSrc) : 'https://elimfilters.com/wp-content/uploads/2025/11/placeholder.png') + '" alt="' + escHtml(sku) + '" onerror="this.src=\'https://elimfilters.com/wp-content/uploads/2025/11/placeholder.png\'">';

        /* ── assemble HTML ── */
        body.innerHTML =
            '<button class="ef-close-v130" onclick="efClose130()" title="Close">&times;</button>' +

            /* PRODUCT HEADER */
            '<div class="ef-product-header-v130">' +
                '<div class="ef-img-col-v130">' +
                    imgTag +
                    '<img class="ef-logo-img" src="https://elimfilters.com/wp-content/uploads/2025/11/logo-sin-fondo.png" alt="ELIMFILTERS">' +
                '</div>' +
                '<div class="ef-info-col-v130">' +
                    '<h1 class="ef-sku-title-v130">' + escHtml(sku) + '</h1>' +
                    (desc ? '<p class="ef-desc-v130">' + escHtml(desc) + '</p>' : '') +
                    (badges ? '<div class="ef-badges-v130">' + badges + '</div>' : '') +
                '</div>' +
            '</div>' +

            /* SECTION TABS */
            '<div class="ef-section-tabs-v130">' +
                '<div class="ef-stab-v130 ef-stab-active" data-stab="specs" onclick="efSTab130(\'specs\')">Specifications</div>' +
                '<div class="ef-stab-v130" data-stab="oem" onclick="efSTab130(\'oem\')">OEM Codes <span class="ef-stab-count-v130">' + oemCodes.length + '</span></div>' +
                '<div class="ef-stab-v130" data-stab="cross" onclick="efSTab130(\'cross\')">Cross Reference <span class="ef-stab-count-v130">' + crossCodes.length + '</span></div>' +
                '<div class="ef-stab-v130" data-stab="equip" onclick="efSTab130(\'equip\')">Compatible Equipment <span class="ef-stab-count-v130">' + equipment.length + '</span></div>' +
            '</div>' +

            /* PANEL: SPECIFICATIONS */
            '<div class="ef-panel-v130 ef-panel-active" id="ef-panel-specs">' +
                '<div class="ef-section-hdr-v130"><h3>Technical Specifications</h3></div>' +
                '<table class="ef-specs-grid-v130"><tbody>' + specsRows + '</tbody></table>' +
            '</div>' +

            /* PANEL: OEM CODES */
            '<div class="ef-panel-v130" id="ef-panel-oem">' +
                '<div class="ef-section-hdr-v130"><h3>OEM Codes</h3></div>' +
                '<p style="color:#444;font-size:11px;font-family:Roboto,sans-serif;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px 0;">Original Equipment Manufacturer part numbers</p>' +
                '<table class="ef-ref-table-v130"><thead><tr><th>Manufacturer</th><th>Part Number</th></tr></thead><tbody>' + oemRows + '</tbody></table>' +
            '</div>' +

            /* PANEL: CROSS REFERENCE */
            '<div class="ef-panel-v130" id="ef-panel-cross">' +
                '<div class="ef-section-hdr-v130"><h3>Cross Reference Codes</h3></div>' +
                '<p style="color:#444;font-size:11px;font-family:Roboto,sans-serif;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px 0;">Equivalent part numbers from other filter brands</p>' +
                '<table class="ef-ref-table-v130"><thead><tr><th>Brand</th><th>Part Number</th></tr></thead><tbody>' + crossRows + '</tbody></table>' +
            '</div>' +

            /* PANEL: COMPATIBLE EQUIPMENT */
            '<div class="ef-panel-v130" id="ef-panel-equip">' +
                '<div class="ef-section-hdr-v130"><h3>Compatible Equipment</h3></div>' +
                '<p style="color:#444;font-size:11px;font-family:Roboto,sans-serif;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px 0;">Vehicles and machinery compatible with this filter</p>' +
                '<table class="ef-ref-table-v130"><thead><tr><th>Machine</th><th>Engine</th></tr></thead><tbody>' + equipRows + '</tbody></table>' +
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
