<?php
/**
 * Plugin Name: ELIMFILTERS Search Pro V11.0
 * Description: World Catalogue – pixel-perfect match.
 * Version: 11.0
 */

if (!defined('ABSPATH')) exit;

add_shortcode('elimfilters_search', function() {
    $bg_url  = 'https://elimfilters.com/wp-content/uploads/2025/12/Imagen2.png';
    $api     = 'https://world-catalogue-production.up.railway.app';
    ob_start(); ?>

<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;0,900;1,600;1,700&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">

<style>
#ef_root_v7 *, #ef_modal_v7 * { box-sizing: border-box; margin: 0; padding: 0; }

/* ══ HERO ══ */
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

/* ══ MODAL ══ */
#ef_modal_v7 {
    display: none; position: fixed; inset: 0;
    background: rgba(0,0,0,0.98); z-index: 99999; overflow-y: auto;
}
#ef_modal_v7.open { display: block; }
.ef10-close-row { display: flex; justify-content: flex-end; padding: 14px 20px 0; }
.ef10-close-btn {
    background: none; border: 1px solid #222; color: #444;
    padding: 5px 16px; cursor: pointer;
    font-family: 'Montserrat', sans-serif; font-size: 9px;
    font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase;
    transition: border-color .2s, color .2s;
}
.ef10-close-btn:hover { border-color: #555; color: #aaa; }

/* ══ SINGLE RESULT — CARD ══ */
.ef10-card { background: #0a0a0a; width: 100%; }

.ef10-header {
    display: flex; align-items: flex-start; gap: 32px;
    padding: 32px 44px 26px; border-bottom: 1px solid #111;
}
.ef10-sku {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 4.2rem; font-weight: 900; color: #FFF12D;
    letter-spacing: 2px; line-height: .95; flex-shrink: 0; white-space: nowrap;
}
.ef10-header-mid { flex: 1; min-width: 0; padding-top: 6px; }
.ef10-header-desc {
    font-family: 'Montserrat', sans-serif;
    font-size: 10.5px; font-weight: 400; color: #727272; line-height: 1.75;
}
.ef10-header-desc strong { color: #b0b0b0; font-weight: 600; }
.ef10-ts-label {
    font-family: 'Montserrat', sans-serif; font-size: 10px;
    font-weight: 700; letter-spacing: 3px; color: #e0e0e0;
    text-transform: uppercase; white-space: nowrap; flex-shrink: 0;
    padding-top: 4px; text-align: right;
}

.ef10-body { display: flex; }

/* ══ SIDEBAR ══ */
.ef10-sidebar {
    width: 90px; min-width: 90px; background: #060606;
    border-right: 1px solid #111;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 32px 8px; gap: 24px;
}
.ef10-sidebar img.ef10-logo-e  { width: 62px; height: auto; display: block; }
.ef10-sidebar img.ef10-logo-full { width: 68px; height: auto; display: block; filter: brightness(.75); }

/* ══ CONTENT ══ */
.ef10-content { flex: 1; min-width: 0; overflow: hidden; display: flex; flex-direction: column; }

/* ══ TABS ══ */
.ef10-tabs {
    display: flex; border-bottom: 1px solid #111;
    padding: 0 28px; overflow-x: auto; scrollbar-width: none; flex-shrink: 0;
}
.ef10-tabs::-webkit-scrollbar { display: none; }
.ef10-tab {
    padding: 14px 20px;
    font-family: 'Montserrat', sans-serif; font-size: 9.5px;
    font-weight: 700; letter-spacing: 2px; color: #2a2a2a;
    text-transform: uppercase; cursor: pointer; white-space: nowrap;
    border-bottom: 2px solid transparent;
    display: flex; align-items: center; gap: 8px;
    transition: color .15s, border-color .15s;
}
.ef10-tab:hover { color: #505050; }
.ef10-tab.active { color: #FFF12D; border-bottom-color: #FFF12D; }
.ef10-badge {
    background: #111; color: #353535; border-radius: 20px;
    padding: 2px 8px; font-size: 8.5px; font-weight: 700;
}
.ef10-tab.active .ef10-badge { background: rgba(255,241,45,.07); color: #FFF12D; }

/* ══ PANELS ══ */
.ef10-panel {
    display: none; overflow-y: auto; overflow-x: hidden;
    height: 420px; padding: 0 24px 24px;
    scrollbar-width: thin; scrollbar-color: #181818 #0a0a0a;
}
.ef10-panel::-webkit-scrollbar { width: 3px; }
.ef10-panel::-webkit-scrollbar-thumb { background: #181818; }
.ef10-panel.active { display: block; }

/* ══ SPECS TABLE — 4 cols ══ */
.ef10-specs-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
.ef10-specs-table td { vertical-align: middle; border-bottom: 1px solid #0e0e0e; padding: 0; }
.ef10-td-la { padding: 15px 4px 15px 20px; }
.ef10-td-va { padding: 15px 52px 15px 8px; }
.ef10-td-lb { padding: 15px 4px 15px 36px; border-left: 1px solid #1c1c1c; }
.ef10-td-vb { padding: 15px 20px 15px 8px; }
.ef10-lbl {
    display: block; font-family: 'Montserrat', sans-serif;
    font-size: 8.5px; font-weight: 700; letter-spacing: 1.5px;
    color: #484848; text-transform: uppercase;
}
.ef10-val {
    display: block; font-family: 'Barlow Condensed', sans-serif;
    font-size: 17px; font-weight: 600; color: #c8c8c8; line-height: 1.25; margin-top: 3px;
}
.ef10-val.hl { color: #FFF12D; font-style: italic; }
.ef10-val.mt { color: #272727; font-size: 15px; letter-spacing: 3px; margin-top: 3px; }

/* ══ OEM / CROSSREF — 4-col table ══ */
.ef10-codes-hdr { padding: 24px 0 12px; border-bottom: 1px solid #111; margin-bottom: 2px; }
.ef10-codes-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1.9rem; font-weight: 900; color: #e8e8e8; letter-spacing: 1px;
}
.ef10-codes-sub {
    font-family: 'Montserrat', sans-serif; font-size: 8px;
    font-weight: 700; letter-spacing: 2.5px; color: #2e2e2e;
    text-transform: uppercase; margin-top: 5px;
}
.ef10-codes-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
.ef10-codes-table thead th {
    font-family: 'Montserrat', sans-serif; font-size: 7.5px;
    font-weight: 700; letter-spacing: 2px; color: #3a3a3a;
    text-transform: uppercase; padding: 10px 12px 10px 0;
    border-bottom: 1px solid #131313; text-align: left;
}
.ef10-codes-table thead th.ef10-ct-div,
.ef10-codes-table tbody td.ef10-ct-div {
    width: 2px; padding: 0; background: #151515;
}
.ef10-codes-table tbody td {
    padding: 9px 12px 9px 0; border-bottom: 1px solid #0d0d0d; vertical-align: middle;
}
.ef10-ct-mfr {
    font-family: 'Montserrat', sans-serif; font-size: 9.5px;
    font-weight: 600; color: #777; text-transform: uppercase;
    letter-spacing: .4px;
}
.ef10-ct-code {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 16px; font-weight: 700; color: #FFF12D; letter-spacing: .5px;
}
.ef10-codes-table tbody tr:hover td { background: #0e0e0e; transition: background .1s; }

/* ══ EQUIPMENT TABLE (inside single result) ══ */
.ef10-equip-table { width: 100%; border-collapse: collapse; margin-top: 18px; }
.ef10-equip-table th {
    text-align: left; font-family: 'Montserrat', sans-serif;
    font-size: 8px; font-weight: 700; letter-spacing: 2px; color: #2d2d2d;
    text-transform: uppercase; padding: 10px 14px; border-bottom: 1px solid #111;
}
.ef10-equip-table td {
    padding: 11px 14px; color: #999; border-bottom: 1px solid #0d0d0d;
    font-family: 'Barlow Condensed', sans-serif; font-size: 15px; font-weight: 500;
}
.ef10-equip-table tr:hover td { background: #090909; transition: background .15s; }

/* ══ EMPTY ══ */
.ef10-empty {
    font-family: 'Montserrat', sans-serif; font-size: 9px; font-weight: 600;
    letter-spacing: 3px; color: #444; text-transform: uppercase;
    text-align: center; padding: 60px 0;
}

/* ══ LIST RESULTS (Equipment / VIN) ══ */
.ef-list-wrap { padding: 0 40px 40px; }
.ef-list-header {
    display: flex; align-items: baseline; gap: 20px;
    padding: 28px 0 20px; border-bottom: 1px solid #111;
}
.ef-list-query {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 2.4rem; font-weight: 900; color: #FFF12D;
    letter-spacing: 2px; text-transform: uppercase; line-height: 1;
}
.ef-list-count {
    font-family: 'Montserrat', sans-serif; font-size: 9px;
    font-weight: 700; letter-spacing: 3px; color: #333; text-transform: uppercase;
}
.ef-list-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
    gap: 10px; padding-top: 20px;
}
.ef-list-card {
    background: #0d0d0d; border: 1px solid #1a1a1a;
    padding: 18px 20px; cursor: pointer;
    transition: border-color .2s, box-shadow .2s;
}
.ef-list-card:hover {
    border-color: #FFF12D;
    box-shadow: 0 0 0 1px rgba(255,241,45,.2), 0 0 16px rgba(255,241,45,.08);
}
.ef-lc-sku {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1.8rem; font-weight: 900; color: #FFF12D;
    letter-spacing: 1px; line-height: 1;
}
.ef-lc-type {
    font-family: 'Montserrat', sans-serif; font-size: 9px;
    font-weight: 700; letter-spacing: 2px; color: #444;
    text-transform: uppercase; margin-top: 7px;
}
.ef-lc-tech {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 14px; font-weight: 600; color: #555; margin-top: 4px;
}
.ef-lc-btn {
    font-family: 'Montserrat', sans-serif; font-size: 8px;
    font-weight: 700; letter-spacing: 2px; color: #2a2a2a;
    text-transform: uppercase; margin-top: 14px; transition: color .2s;
}
.ef-list-card:hover .ef-lc-btn { color: #FFF12D; }

/* ══ GLITCH REVEAL ══ */
@keyframes ef10-glitch {
    0%   { clip-path: inset(0 0 95% 0); opacity: 0; transform: skewX(-4deg); color: #fff; }
    15%  { clip-path: inset(60% 0 10% 0); opacity: 1; transform: skewX(3deg); color: #fff; }
    30%  { clip-path: inset(20% 0 50% 0); transform: skewX(-2deg); color: #FFF12D; }
    45%  { clip-path: inset(75% 0 0 0); transform: skewX(2deg); color: #fff; }
    60%  { clip-path: inset(0 0 30% 0); transform: skewX(-1deg); color: #FFF12D; }
    75%  { clip-path: inset(0 0 0 0); transform: skewX(1deg); color: #fff; }
    88%  { clip-path: inset(0 0 0 0); transform: skewX(0); color: #FFF12D; }
    100% { clip-path: inset(0 0 0 0); transform: skewX(0); color: #FFF12D; opacity: 1; }
}
.ef10-sku.ef10-glitch-play { animation: ef10-glitch 0.45s steps(1) forwards; }

/* ══ SKELETON SHIMMER ══ */
@keyframes ef10-shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
}
.ef10-sk-line {
    border-radius: 2px;
    background: linear-gradient(90deg, #0d0d0d 25%, #1a1a1a 50%, #0d0d0d 75%);
    background-size: 1200px 100%;
    animation: ef10-shimmer 1.4s infinite linear;
}
.ef10-sk-sku  { width: 180px; height: 58px; margin-bottom: 14px; }
.ef10-sk-desc { height: 11px; margin-bottom: 8px; }
.ef10-sk-tab  { height: 10px; width: 80px; display: inline-block; margin-right: 16px; }

/* ══ ELECTRIC BORDER GLOW ══ */
.ef10-codes-table tbody tr { transition: background .1s; }
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
                <input type="text" id="ef7_q" placeholder="SEARCH BY PART NUMBER..." autocomplete="off">
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
    <div>
        <div class="ef10-close-row">
            <button class="ef10-close-btn" onclick="document.getElementById('ef_modal_v7').classList.remove('open')">&#x2715; CLOSE</button>
        </div>
        <div id="ef10_content"></div>
    </div>
</div>

<script>
(function(){
    var input      = document.getElementById('ef7_q');
    var suggest    = document.getElementById('ef7_suggest');
    var modal      = document.getElementById('ef_modal_v7');
    var content    = document.getElementById('ef10_content');
    var API        = '<?php echo esc_js($api); ?>';
    var activeType = 'part';

    /* ── Nav tab switching ── */
    document.querySelectorAll('#ef7_nav span').forEach(function(t){
        t.addEventListener('click', function(){
            document.querySelectorAll('#ef7_nav span').forEach(function(x){ x.classList.remove('active'); });
            t.classList.add('active');
            activeType = t.dataset.type;
            input.placeholder = activeType === 'part' ? 'SEARCH BY PART NUMBER...'
                              : activeType === 'vin'  ? 'ENTER VIN NUMBER...'
                              :                         'SEARCH BY EQUIPMENT / VEHICLE...';
            input.value = '';
        });
    });

    /* ── Skeleton ── */
    function showSkeleton(){
        modal.classList.add('open');
        content.innerHTML =
            '<div style="padding:32px 44px 26px">'
           +'<div class="ef10-sk-line ef10-sk-sku"></div>'
           +'<div class="ef10-sk-line ef10-sk-desc" style="width:75%"></div>'
           +'<div class="ef10-sk-line ef10-sk-desc" style="width:55%"></div>'
           +'<div style="margin-top:20px">'
           +'<span class="ef10-sk-line ef10-sk-tab"></span>'
           +'<span class="ef10-sk-line ef10-sk-tab"></span>'
           +'<span class="ef10-sk-line ef10-sk-tab"></span>'
           +'</div></div>';
    }

    function showError(msg){
        console.warn('[ELIMFILTERS] Error:', msg);
        content.innerHTML = '<p style="color:#666;font-family:\'Montserrat\',sans-serif;font-size:10px;padding:60px 44px;letter-spacing:2px;text-transform:uppercase;">'+msg+'</p>';
    }

    /* ── Main dispatcher ── */
    function search(val){
        if(!val || !val.trim()) return;
        suggest.classList.remove('open');
        val = val.trim();
        if(activeType === 'part')        searchPart(val);
        else if(activeType === 'vin')    searchVin(val);
        else                             searchEquipment(val, val);
    }

    /* ── Part Number ── */
    function searchPart(val){
        showSkeleton();
        var url = API+'/api/filters/search/part?code='+encodeURIComponent(val.toUpperCase());
        console.log('[ELIMFILTERS] Fetching:', url);
        fetch(url)
            .then(function(r){ return r.json(); })
            .then(function(d){
                console.log('[ELIMFILTERS] Response:', JSON.stringify(d));
                if(d.success && d.filters && d.filters.length > 0) renderSingle(d.filters[0]);
                else showError('No results found for "'+val+'"');
            })
            .catch(function(err){
                console.error('[ELIMFILTERS] Fetch error:', err);
                showError('Connection error — please try again');
            });
    }

    /* ── VIN: decode → equipment search ── */
    function searchVin(vin){
        vin = vin.trim().toUpperCase();
        if(vin.length < 11){ showSkeleton(); showError('Enter a valid VIN (minimum 11 characters)'); return; }
        showSkeleton();
        fetch('https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/'+encodeURIComponent(vin)+'?format=json')
            .then(function(r){ return r.json(); })
            .then(function(data){
                var res   = data.Results || [];
                var make  = '', model = '', year = '';
                res.forEach(function(r){
                    if(r.Variable === 'Make')       make  = r.Value && r.Value !== 'null' ? r.Value : '';
                    if(r.Variable === 'Model')      model = r.Value && r.Value !== 'null' ? r.Value : '';
                    if(r.Variable === 'Model Year') year  = r.Value && r.Value !== 'null' ? r.Value : '';
                });
                if(!make && !model){ showError('VIN not recognized: '+vin); return; }
                var query = [year, make, model].filter(Boolean).join(' ');
                fetchEquipment(query, 'VIN '+vin+' \u2192 '+query);
            })
            .catch(function(){ showError('Error decoding VIN — check your connection'); });
    }

    /* ── Equipment ── */
    function searchEquipment(val, label){
        showSkeleton();
        fetchEquipment(val, label);
    }

    function fetchEquipment(query, label){
        fetch(API+'/api/filters/search/equipment?model='+encodeURIComponent(query))
            .then(function(r){ return r.json(); })
            .then(function(d){
                if(d.success && d.filters && d.filters.length > 0) renderList(d.filters, label);
                else showError('No compatible filters found for: '+label);
            })
            .catch(function(){ showError('Connection error — please try again'); });
    }

    /* ── Helpers ── */
    function v(x){ return (x !== null && x !== undefined && x !== '') ? x : null; }
    function mm(x){ return v(x) ? x+' mm\u00A0/\u00A0'+(parseFloat(x)/25.4).toFixed(2)+'"' : null; }
    function psi(x){ return v(x) ? x+' psi' : null; }

    function buildDesc(p){
        var sku  = p.elimfilters_sku || p.sku || '';
        var inst = p.installation_type || '';
        var type = p.filter_type || 'Filter';
        var tech = p.technology || '';
        var s = '<strong>'+sku+'</strong>';
        s += ' | '+(inst ? inst+' ' : '')+type+' Filter ';
        s += 'Engineered to exceed OEM performance in modern engines';
        if(tech) s += ', the Elimfilters\u00AE <strong>'+sku+'</strong> features advanced <strong>'+tech+'\u2122</strong> media technology for superior contaminant capture';
        s += '. Its robust construction ensures unrestricted oil flow and critical wear protection, maximizing engine life under the most demanding operating conditions.';
        return s;
    }

    function specRow(l1, v1, hl1, l2, v2, hl2){
        var d1 = v(v1), d2 = v(v2);
        var c1 = d1 ? (hl1 ? 'ef10-val hl' : 'ef10-val') : 'ef10-val mt';
        var c2 = d2 ? (hl2 ? 'ef10-val hl' : 'ef10-val') : 'ef10-val mt';
        return '<tr>'
            +'<td class="ef10-td-la"><span class="ef10-lbl">'+l1+'</span></td>'
            +'<td class="ef10-td-va"><span class="'+c1+'">'+(d1 || '&mdash;&mdash;&mdash;')+'</span></td>'
            +'<td class="ef10-td-lb"><span class="ef10-lbl">'+l2+'</span></td>'
            +'<td class="ef10-td-vb"><span class="'+c2+'">'+(d2 || '&mdash;&mdash;&mdash;')+'</span></td>'
            +'</tr>';
    }

    /* OEM / CrossRef: split in half → 4-col table */
    function codesTable(arr, title, subtitle){
        if(!arr || !arr.length) return '<div class="ef10-empty">No codes available</div>';
        var half  = Math.ceil(arr.length / 2);
        var left  = arr.slice(0, half);
        var right = arr.slice(half);
        var rows  = '';
        for(var i = 0; i < left.length; i++){
            var l  = left[i],  r  = right[i] || null;
            var lm = typeof l === 'string' ? '' : (l.manufacturer || '');
            var lc = typeof l === 'string' ? l  : (l.code || '');
            var rm = r ? (typeof r === 'string' ? '' : (r.manufacturer || '')) : '';
            var rc = r ? (typeof r === 'string' ? r  : (r.code || ''))        : '';
            rows  += '<tr>'
                +'<td class="ef10-ct-mfr">'+lm+'</td>'
                +'<td class="ef10-ct-code">'+lc+'</td>'
                +'<td class="ef10-ct-div"></td>'
                +'<td class="ef10-ct-mfr">'+rm+'</td>'
                +'<td class="ef10-ct-code">'+rc+'</td>'
                +'</tr>';
        }
        return '<div class="ef10-codes-hdr">'
            +'<div class="ef10-codes-title">'+title+'</div>'
            +'<div class="ef10-codes-sub">'+subtitle+'</div>'
            +'</div>'
            +'<table class="ef10-codes-table">'
            +'<colgroup>'
            +'<col style="width:33%"><col style="width:17%">'
            +'<col style="width:2px">'
            +'<col style="width:33%"><col style="width:17%">'
            +'</colgroup>'
            +'<thead><tr>'
            +'<th>MANUFACTURER</th><th>PART NUMBER</th>'
            +'<th class="ef10-ct-div"></th>'
            +'<th>MANUFACTURER</th><th>PART NUMBER</th>'
            +'</tr></thead>'
            +'<tbody>'+rows+'</tbody>'
            +'</table>';
    }

    function equipTable(arr){
        if(!arr || !arr.length) return '<div class="ef10-empty">No equipment data</div>';
        return '<table class="ef10-equip-table"><thead><tr>'
            +'<th>Machine / Model</th><th>Engine</th><th>Year</th><th>Type</th>'
            +'</tr></thead><tbody>'
            +arr.map(function(a){
                var m = a.machine || a.equipment || (typeof a === 'string' ? a : '\u2014');
                return '<tr>'
                    +'<td>'+m+'</td>'
                    +'<td>'+(a.engine || '\u2014')+'</td>'
                    +'<td>'+(a.year   || '\u2014')+'</td>'
                    +'<td>'+(a.type   || '\u2014')+'</td>'
                    +'</tr>';
            }).join('')
            +'</tbody></table>';
    }

    /* ════════════════════════
       RENDER — Single result
    ════════════════════════ */
    function renderSingle(p){
        var sku   = p.elimfilters_sku || p.sku || '\u2014';
        var oem   = p.oem_codes || [];
        var cross = p.competitor_codes || p.cross_references || [];
        var apps  = p.applications || p.equipment_applications || [];

        var specs =
            '<table class="ef10-specs-table">'
           +'<colgroup>'
           +'<col style="width:18%"><col style="width:30%">'
           +'<col style="width:18%"><col style="width:34%">'
           +'</colgroup><tbody>'
           +specRow('Filter Type',    v(p.filter_type),            false, 'Installation',      v(p.installation_type),        false)
           +specRow('Technology',     v(p.technology),             true,  'Thread Size',        v(p.thread_size),              false)
           +specRow('Outer Dia.',     mm(p.outer_diameter_mm),     false, 'Gasket OD',          mm(p.gasket_od_mm),            false)
           +specRow('Gasket ID',      mm(p.gasket_id_mm),          false, 'ISO Test Method',    v(p.iso_test_method),          false)
           +specRow('Micron Rating',  v(p.micron_rating),          false, 'Efficiency',         v(p.nominal_efficiency),       false)
           +specRow('Burst Pressure', psi(p.burst_pressure_psi),   false, 'Collapse Pressure',  psi(p.collapse_pressure_psi),  false)
           +(v(p.anti_drainback) ? specRow('Anti-Drainback', v(p.anti_drainback), false, 'Duty', v(p.duty), false) : '')
           +'</tbody></table>';

        content.innerHTML =
            '<div class="ef10-card">'
           +'<div class="ef10-header">'
           +  '<div class="ef10-sku" id="ef10-sku-el">'+sku+'</div>'
           +  '<div class="ef10-header-mid"><div class="ef10-header-desc">'+buildDesc(p)+'</div></div>'
           +  '<div class="ef10-ts-label">Technical<br>Specifications</div>'
           +'</div>'
           +'<div class="ef10-body">'
           +  '<div class="ef10-sidebar">'
           +    '<img class="ef10-logo-e" src="https://elimfilters.com/wp-content/uploads/2025/11/AE6A9C09-F12F-4AA4-8021-EAF6F448860E.webp" alt="E">'
           +    '<img class="ef10-logo-full" src="https://elimfilters.com/wp-content/uploads/2025/11/logo-sin-fondo.png" alt="Elimfilters">'
           +  '</div>'
           +  '<div class="ef10-content">'
           +    '<div class="ef10-tabs">'
           +      '<div class="ef10-tab active" data-tab="specs">Specifications</div>'
           +      '<div class="ef10-tab" data-tab="oem">OEM Codes <span class="ef10-badge">'+oem.length+'</span></div>'
           +      '<div class="ef10-tab" data-tab="cross">Cross Reference <span class="ef10-badge">'+cross.length+'</span></div>'
           +      '<div class="ef10-tab" data-tab="equip">Equipment <span class="ef10-badge">'+apps.length+'</span></div>'
           +    '</div>'
           +    '<div class="ef10-panel active" id="ef10p-specs">'+specs+'</div>'
           +    '<div class="ef10-panel" id="ef10p-oem">'+codesTable(oem, 'OEM CODES', 'ORIGINAL EQUIPMENT MANUFACTURER PART NUMBERS')+'</div>'
           +    '<div class="ef10-panel" id="ef10p-cross">'+codesTable(cross, 'CROSS REFERENCE CODES', 'COMPETITOR PART NUMBERS')+'</div>'
           +    '<div class="ef10-panel" id="ef10p-equip">'+equipTable(apps)+'</div>'
           +  '</div>'
           +'</div>'
           +'</div>';

        /* Glitch reveal on SKU */
        var skuEl = content.querySelector('#ef10-sku-el');
        if(skuEl){
            skuEl.classList.remove('ef10-glitch-play');
            void skuEl.offsetWidth;
            skuEl.classList.add('ef10-glitch-play');
        }

        /* Tab switching */
        content.querySelectorAll('.ef10-tab').forEach(function(tab){
            tab.addEventListener('click', function(){
                content.querySelectorAll('.ef10-tab').forEach(function(t){ t.classList.remove('active'); });
                content.querySelectorAll('.ef10-panel').forEach(function(pn){ pn.classList.remove('active'); });
                tab.classList.add('active');
                content.querySelector('#ef10p-'+tab.dataset.tab).classList.add('active');
            });
        });
    }

    /* ════════════════════════
       RENDER — List results
    ════════════════════════ */
    window.efOpenSingle = function(f){ renderSingle(f); };

    function renderList(filters, label){
        var cards = filters.map(function(f){
            var sku  = f.elimfilters_sku || f.sku || '\u2014';
            var type = f.filter_type || '';
            var tech = f.technology ? f.technology+'\u2122' : '';
            var duty = f.duty || '';
            var sub  = [tech, duty].filter(Boolean).join(' \u00B7 ');
            var enc  = btoa(unescape(encodeURIComponent(JSON.stringify(f))));
            return '<div class="ef-list-card" onclick="efOpenSingle(JSON.parse(decodeURIComponent(escape(atob(\''+enc+'\')))))">'
                +'<div class="ef-lc-sku">'+sku+'</div>'
                +(type ? '<div class="ef-lc-type">'+type+'</div>' : '')
                +(sub  ? '<div class="ef-lc-tech">'+sub+'</div>'  : '')
                +'<div class="ef-lc-btn">VER FICHA \u2192</div>'
                +'</div>';
        }).join('');

        content.innerHTML =
            '<div class="ef-list-wrap">'
           +'<div class="ef-list-header">'
           +  '<div class="ef-list-query">'+label.toUpperCase()+'</div>'
           +  '<div class="ef-list-count">'+filters.length+' COMPATIBLE FILTERS</div>'
           +'</div>'
           +'<div class="ef-list-grid">'+cards+'</div>'
           +'</div>';
    }

    /* ── Input events ── */
    input.addEventListener('input', function(){
        var val = this.value.toUpperCase().trim();
        if(val.length < 2){ suggest.classList.remove('open'); return; }
        suggest.innerHTML = '<div class="ef7-suggest-item" onclick="window._ef7run(\''+val.replace(/'/g,"\\'")+'\')">'+val+'</div>';
        suggest.classList.add('open');
    });

    window._ef7run = function(val){ input.value = val; search(val); };
    document.getElementById('ef7_btn').onclick = function(){ search(input.value); };
    input.onkeypress = function(e){ if(e.which === 13) search(input.value); };
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape') modal.classList.remove('open'); });
})();
</script>

<?php return ob_get_clean(); });
