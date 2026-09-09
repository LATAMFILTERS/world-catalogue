const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'part-search', 'index.html');
const resultsPath = path.join(__dirname, 'part-search', 'results.html');

function normalizeMojibake(text) {
  return String(text || '')
    .replace(/â€”/g, '—')
    .replace(/â€“/g, '–')
    .replace(/â†’/g, '→')
    .replace(/Â→/g, '→')
    .replace(/Ã¢â€ â€™/g, '→')
    .replace(/â€º/g, '›')
    .replace(/â„¢/g, '™')
    .replace(/Â®/g, '®')
    .replace(/Â©/g, '©')
    .replace(/Âµ/g, 'µ')
    .replace(/â”€/g, '─');
}

try {
  let html = normalizeMojibake(fs.readFileSync(indexPath, 'utf8'));

  html = html
    .replace(/<link[^>]+fonts\.googleapis\.com[^>]*>/gi, '')
    .replace(/'Outfit'\s*,\s*sans-serif/g, "'Barlow', sans-serif")
    .replace(/'JetBrains Mono'\s*,\s*monospace/g, "'Chakra Petch', sans-serif")
    .replace(/<span\b[^>]*class=["'][^"']*input-icon[^"']*["'][^>]*>[\s\S]*?<\/span>/gi, '')
    .replace(/(<button\b[^>]*class=["'][^"']*btn-search[^"']*["'][^>]*>)[\s\S]*?(<\/button>)/gi, '$1SEARCH$2')
    .replace(/(<span\b[^>]*class=["'][^"']*logo-badge[^"']*["'][^>]*>)[\s\S]*?(<\/span>)/gi, '$1HOME$2')
    .replace(/SEARCH\s*(?:→|›)/g, 'SEARCH');

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
#logo {
  min-width: 260px !important;
  min-height: 78px !important;
  overflow: visible !important;
  left: 50% !important;
  margin-left: -130px !important;
}
.intro-label {
  font-weight: 700 !important;
  letter-spacing: -0.055em !important;
  line-height: 0.88 !important;
  text-transform: uppercase !important;
  font-size: clamp(1.55rem, 6vw, 2.4rem) !important;
  margin-bottom: 3.5rem !important;
}
#logo img {
  width: 260px !important;
  height: auto !important;
  max-width: none !important;
  display: block !important;
  object-fit: contain !important;
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
  min-width: 0 !important;
  min-height: 0 !important;
  padding: 0 !important;
  border: none !important;
  border-radius: 0 !important;
  color: rgba(255,255,255,.65) !important;
  background: transparent !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  font-size: .72rem !important;
  font-weight: 600 !important;
  letter-spacing: .14em !important;
  line-height: 1 !important;
  text-transform: uppercase !important;
  pointer-events: auto !important;
  transition: color .2s ease !important;
}
.logo-badge:hover { color: #FFF12D !important; }
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
  #logo { min-width: 220px !important; min-height: 66px !important; margin-left: -110px !important; }
  #logo img { width: 220px !important; }
  .logo-badge { top: 1.25rem !important; right: 1.25rem !important; }
}
@media (max-width: 640px) {
  #ui { justify-content: flex-start !important; padding: 7.5rem 1rem 3rem !important; }
  #search-panel { width: 100% !important; max-width: 100% !important; }
  .mode-tabs { display: grid !important; grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
  .mode-tab { width: 100% !important; min-width: 0 !important; padding: .7rem .2rem !important; font-size: .78rem !important; }
  .btn-search { width: min(100%, 360px) !important; min-width: 0 !important; min-height: 58px !important; }
  #logo { min-width: 165px !important; min-height: 52px !important; top: 1rem !important; left: 50% !important; margin-left: -82px !important; }
  #logo img { width: 165px !important; }
  .logo-badge { top: 1rem !important; right: 1rem !important; font-size: .66rem !important; letter-spacing: .12em !important; }
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
    var logo = document.getElementById('logo');
    var logoImg = logo && logo.querySelector('img');
    if (logoImg) {
      logoImg.src = 'https://elimfilters.com/assets/elimfilters-logo-white.png';
      logoImg.alt = 'ELIMFILTERS — Total Asset Protection';
    }
  }
  normalizePartSearch();
  document.addEventListener('DOMContentLoaded', normalizePartSearch);
  window.addEventListener('load', normalizePartSearch);
})();
</script>
<!-- PART_SEARCH_UI_BUILD_20260902_LOGO_CENTERED_HERO_FONTS -->`;

  html = html.replace(/<style id="part-search-approved-ui">[\s\S]*?<!-- PART_SEARCH_UI_BUILD_[^>]*-->/gi, '');
  html = html.replace('</body>', `${finalLayer}\n</body>`);

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[part-search-ui] source normalized');
} catch (error) {
  console.error('[part-search-ui]', error.message);
}

try {
  let resultsHtml = normalizeMojibake(fs.readFileSync(resultsPath, 'utf8'));

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
    HYDROCORE: 'technologies/hydrocore',
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

  function normalizedSearchQuery() {
    var params = new URLSearchParams(window.location.search || '');
    return String(params.get('q') || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  function resultLanguage() {
    var params = new URLSearchParams(window.location.search || '');
    var lang = String(params.get('lang') || document.documentElement.lang || 'en').toLowerCase();
    if (lang.indexOf('es') === 0) return 'es';
    if (lang.indexOf('pt') === 0) return 'pt';
    return 'en';
  }

  function normalizeR90DisambiguationUi(scope) {
    if (normalizedSearchQuery() !== 'R90') return;
    var root = scope || document;
    var title = root.querySelector && root.querySelector('.status-title');
    var desc = root.querySelector && root.querySelector('.status-desc');
    if (!title || !desc) {
      title = document.querySelector('.status-title');
      desc = document.querySelector('.status-desc');
    }
    if (!title || !desc) return;

    var copy = {
      en: {
        title: 'MANUFACTURER REQUIRED',
        desc: 'R90 is used by more than one manufacturer. Enter TECNOCAR R90 for the validated TECNOCAR cross-reference, or enter the complete RACOR element reference R90S, R90T, or R90P.'
      },
      es: {
        title: 'FABRICANTE REQUERIDO',
        desc: 'R90 es utilizado por más de un fabricante. Ingresa TECNOCAR R90 para la referencia validada de TECNOCAR, o ingresa la referencia completa del elemento RACOR: R90S, R90T o R90P.'
      },
      pt: {
        title: 'FABRICANTE OBRIGATÓRIO',
        desc: 'R90 é utilizado por mais de um fabricante. Digite TECNOCAR R90 para a referência TECNOCAR validada, ou digite a referência completa do elemento RACOR: R90S, R90T ou R90P.'
      }
    }[resultLanguage()];

    title.textContent = copy.title;
    desc.textContent = copy.desc;
    title.setAttribute('data-resolution', 'AMBIGUOUS_MANUFACTURER');
    desc.setAttribute('data-manufacturer-required', 'true');
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

    normalizeR90DisambiguationUi(scope);
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
          if (node.nodeType === 1) normalizeResultsUi(node.matches && node.matches('.badge-tech, .header-back, .search-summary-mode, .status-container, .status-title, .status-desc') ? node.parentNode || document : node);
        });
      });
      normalizeR90DisambiguationUi(document);
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
</script>
<!-- PART_SEARCH_RESULTS_FIXES_BUILD_20260909_R90_DISAMBIGUATION -->`;

  resultsHtml = resultsHtml
    .replace(/<script id="part-search-technology-links">[\s\S]*?<!-- PART_SEARCH_TECH_LINKS_BUILD_[^>]*-->/gi, '')
    .replace(/<style id="part-search-results-fixes">[\s\S]*?<!-- PART_SEARCH_RESULTS_FIXES_BUILD_[^>]*-->/gi, '');
  resultsHtml = resultsHtml.replace('</body>', `${resultsFixLayer}\n</body>`);

  fs.writeFileSync(resultsPath, resultsHtml, 'utf8');
  console.log('[part-search-results] technology links and R90 disambiguation normalized');
} catch (error) {
  console.error('[part-search-results]', error.message);
}

require('./server-original');
