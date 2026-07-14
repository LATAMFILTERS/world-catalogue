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
@media (max-width: 640px) {
  #ui { justify-content: flex-start !important; padding: 7.5rem 1rem 3rem !important; }
  #search-panel { width: 100% !important; max-width: 100% !important; }
  .mode-tabs { display: grid !important; grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
  .mode-tab { width: 100% !important; min-width: 0 !important; padding: .7rem .2rem !important; font-size: .78rem !important; }
  .btn-search { width: min(100%, 360px) !important; min-width: 0 !important; min-height: 58px !important; }
}
</style>
<script>
(function () {
  function normalizePartSearch() {
    document.querySelectorAll('.btn-search').forEach(function (button) {
      button.replaceChildren(document.createTextNode('SEARCH'));
    });
    document.querySelectorAll('.input-icon').forEach(function (icon) { icon.remove(); });
  }
  normalizePartSearch();
  document.addEventListener('DOMContentLoaded', normalizePartSearch);
  window.addEventListener('load', normalizePartSearch);
})();
</script>
<!-- PART_SEARCH_UI_BUILD_20260713_2115 -->`;

  html = html.replace(/<style id="part-search-approved-ui">[\s\S]*?<!-- PART_SEARCH_UI_BUILD_[^>]*-->/gi, '');
  html = html.replace('</body>', `${finalLayer}\n</body>`);

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[part-search-ui] source normalized: PART_SEARCH_UI_BUILD_20260713_2115');
} catch (error) {
  console.error('[part-search-ui]', error.message);
}

require('./server-original');
