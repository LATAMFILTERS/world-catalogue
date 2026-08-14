const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'part-search', 'index.html');
const resultsPath = path.join(__dirname, 'part-search', 'results.html');

try {
  let html = fs.readFileSync(indexPath, 'utf8');

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
  .logo-badge { top: 1.25rem !important; right: 1.25rem !important; min-width: 88px !important; min-height: 38px !important; }
}
@media (max-width: 640px) {
  #ui { justify-content: flex-start !important; padding: 7.5rem 1rem 3rem !important; }
  #search-panel { width: 100% !important; max-width: 100% !important; }
  .mode-tabs { display: grid !important; grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
  .mode-tab { width: 100% !important; min-width: 0 !important; padding: .7rem .2rem !important; font-size: .78rem !important; }
  .btn-search { width: min(100%, 360px) !important; min-width: 0 !important; min-height: 58px !important; }
  .logo-badge { top: 1rem !important; right: 1rem !important; min-width: 78px !important; min-height: 36px !important; padding: .55rem .75rem !important; font-size: .66rem !important; letter-spacing: .12em !important; }
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
<!-- PART_SEARCH_UI_BUILD_20260813_CANONICAL -->`;

  html = html.replace(/<style id="part-search-approved-ui">[\s\S]*?<!-- PART_SEARCH_UI_BUILD_[^>]*-->/gi, '');
  html = html.replace('</body>', `${finalLayer}\n</body>`);

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[part-search-ui] source normalized');
} catch (error) {
  console.error('[part-search-ui]', error.message);
}

try {
  let resultsHtml = fs.readFileSync(resultsPath, 'utf8');

  const resultsFixLayer = `
<style id="part-search-results-fixes">
.search-summary-mode { display: none !important; }
</style>
<script id="part-search-results-fixes-script">
(function () {
  var technologyRoutes = {
    MACROCORE: 'technologies/macrocore',
    MICROKAPPA: 'technologies/microkappa',
    DRYCORE: 'technologies/drycore',
    INTEKCORE: 'technologies/intekcore',
    SYNTAPORE: 'technologies/syntapore',
    TURBOCORE: 'technologies/turbocore',
    SYNTRAX: 'technologies/syntrax',
    NANOFORCE: 'technologies/nanoforce',
    THERMACORE: 'technologies/thermacore',
    DURATECH: 'commercial-lines/duratech',
    MARINECLEAN: 'commercial-lines/marineclean'
  };

  function canonicalTechnologyName(value) {
    return String(value || '')
      .replace(/[™®©]/g, '')
      .normalize('NFKD')
      .replace(/[^A-Za-z0-9]/g, '')
      .toUpperCase();
  }

  function normalizeResultsUi(root) {
    var scope = root || document;

    scope.querySelectorAll('.search-summary-mode').forEach(function (node) { node.remove(); });

    scope.querySelectorAll('.header-back').forEach(function (link) {
      link.textContent = 'BACK TO SEARCH';
      link.href = '/';
    });

    scope.querySelectorAll('.badge-tech').forEach(function (badge) {
      var key = canonicalTechnologyName(badge.textContent);
      var routePath = technologyRoutes[key];
      if (!routePath) {
        badge.remove();
        return;
      }
      var canonicalUrl = 'https://elimfilters.com/' + routePath + '/';
      badge.href = canonicalUrl;
      badge.target = '_blank';
      badge.rel = 'noopener noreferrer';
      badge.title = 'Learn more about ' + (badge.textContent || key).trim();
      badge.setAttribute('aria-label', 'Open ' + key + ' technology page');
    });
  }

  function start() {
    normalizeResultsUi(document);
    document.addEventListener('click', function (event) {
      var badge = event.target.closest && event.target.closest('.badge-tech');
      if (!badge) return;
      var key = canonicalTechnologyName(badge.textContent);
      var routePath = technologyRoutes[key];
      if (!routePath) return;
      event.preventDefault();
      window.open('https://elimfilters.com/' + routePath + '/', '_blank', 'noopener,noreferrer');
    });

    new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType === 1) normalizeResultsUi(node.matches && node.matches('.badge-tech, .header-back, .search-summary-mode') ? node.parentNode || document : node);
        });
      });
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
</script>
<!-- PART_SEARCH_RESULTS_FIXES_BUILD_20260813_CANONICAL -->`;

  resultsHtml = resultsHtml
    .replace(/<script id="part-search-technology-links">[\s\S]*?<!-- PART_SEARCH_TECH_LINKS_BUILD_[^>]*-->/gi, '')
    .replace(/<style id="part-search-results-fixes">[\s\S]*?<!-- PART_SEARCH_RESULTS_FIXES_BUILD_[^>]*-->/gi, '');
  resultsHtml = resultsHtml.replace('</body>', `${resultsFixLayer}\n</body>`);

  fs.writeFileSync(resultsPath, resultsHtml, 'utf8');
  console.log('[part-search-results] technology links normalized to current registry');
} catch (error) {
  console.error('[part-search-results]', error.message);
}

require('./server-original');