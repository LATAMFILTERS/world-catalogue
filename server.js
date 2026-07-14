const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'part-search', 'index.html');

try {
  let html = fs.readFileSync(indexPath, 'utf8');

  // Apply the approved frontend typography directly to the Part Search document.
  html = html
    .replace(/<link[^>]+fonts\.googleapis\.com[^>]*>/gi, '')
    .replace(/'Outfit'\s*,\s*sans-serif/g, "'Barlow', sans-serif")
    .replace(/'JetBrains Mono'\s*,\s*monospace/g, "'Chakra Petch', sans-serif")
    .replace(/<span\b[^>]*class=["'][^"']*input-icon[^"']*["'][^>]*>[\s\S]*?<\/span>/gi, '')
    .replace(/(<button\b[^>]*class=["'][^"']*btn-search[^"']*["'][^>]*>)[\s\S]*?(<\/button>)/gi, '$1SEARCH$2')
    .replace(/(<span\b[^>]*class=["'][^"']*logo-badge[^"']*["'][^>]*>)[\s\S]*?(<\/span>)/gi, '$1HOME$2')
    .replace(/SEARCH\s*(?:â†’|→|Â→|Ã¢â€ â€™|â†’|â€º)/g, 'SEARCH');

  const finalLayer = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800;900&family=Chakra+Petch:wght@500;600;700&display=swap" rel="stylesheet">
<style id="part-search-approved-ui">
html, body, input, select, textarea { font-family: 'Barlow', sans-serif !important; }
.intro-label, .mode-tab, .logo-badge, .duty-chip, .btn-search, .field-label,
.footer-line, .status-msg, .results-count, .results-mode, .ac-val, .ac-type {
  font-family: 'Chakra Petch', sans-serif !important;
}
.input-icon { display: none !important; }
.input-wrap input {
  font-family: 'Barlow', sans-serif !important;
  font-size: 1rem !important;
  font-weight: 400 !important;
  letter-spacing: .01em !important;
  padding: .95rem 1rem !important;
}
.logo-badge {
  position: fixed !important;
  top: 1.5rem !important;
  right: 2rem !important;
  left: auto !important;
  z-index: 300 !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  min-width: 92px !important;
  min-height: 40px !important;
  padding: .65rem 1rem !important;
  border: 1px solid rgba(255,241,45,.34) !important;
  border-radius: 2px !important;
  color: #FFF12D !important;
  background: rgba(0,0,0,.72) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  font-size: .72rem !important;
  font-weight: 600 !important;
  letter-spacing: .14em !important;
  line-height: 1 !important;
  text-transform: uppercase !important;
  pointer-events: auto !important;
}
.btn-search {
  min-width: 220px !important;
  min-height: 56px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: .9rem 2.25rem !important;
  font-family: 'Chakra Petch', sans-serif !important;
  font-size: 1rem !important;
  font-weight: 600 !important;
  line-height: 1 !important;
  letter-spacing: .18em !important;
  text-transform: uppercase !important;
}
.btn-search::before, .btn-search::after { content: none !important; display: none !important; }
@media (max-width: 1024px) {
  .logo-badge {
    top: 1.25rem !important;
    right: 1.25rem !important;
    min-width: 88px !important;
    min-height: 38px !important;
  }
}
@media (max-width: 640px) {
  #ui { justify-content: flex-start !important; padding: 7.5rem 1rem 3rem !important; }
  #search-panel { width: 100% !important; max-width: 100% !important; }
  .mode-tabs { display: grid !important; grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
  .mode-tab { width: 100% !important; min-width: 0 !important; padding: .7rem .2rem !important; font-size: .78rem !important; }
  .btn-search { width: min(100%, 360px) !important; min-width: 0 !important; min-height: 58px !important; }
  .logo-badge {
    top: 1rem !important;
    right: 1rem !important;
    min-width: 78px !important;
    min-height: 36px !important;
    padding: .55rem .75rem !important;
    font-size: .66rem !important;
    letter-spacing: .12em !important;
  }
}
</style>
<script>
(function () {
  function normalizePartSearch() {
    document.querySelectorAll('.btn-search').forEach(function (button) {
      button.replaceChildren(document.createTextNode('SEARCH'));
    });
    document.querySelectorAll('.input-icon').forEach(function (icon) { icon.remove(); });
    document.querySelectorAll('.logo-badge').forEach(function (badge) {
      badge.replaceChildren(document.createTextNode('HOME'));
    });
  }
  normalizePartSearch();
  document.addEventListener('DOMContentLoaded', normalizePartSearch);
  window.addEventListener('load', normalizePartSearch);
})();
</script>
<!-- PART_SEARCH_UI_BUILD_20260713_2145 -->`;

  html = html.replace(/<style id="part-search-approved-ui">[\s\S]*?<!-- PART_SEARCH_UI_BUILD_[^>]*-->/gi, '');
  html = html.replace('</body>', `${finalLayer}\n</body>`);

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[part-search-ui] source normalized: PART_SEARCH_UI_BUILD_20260713_2145');
} catch (error) {
  console.error('[part-search-ui]', error.message);
}

require('./server-original');