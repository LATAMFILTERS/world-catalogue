const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'part-search', 'index.html');
const syntraxPath = path.join(__dirname, '..', 'frontend', 'out', 'technologies', 'syntrax', 'index.html');

const approvedCss = `
/* ELIMFILTERS approved Part Search typography */
html, body, button, input, select, textarea {
  font-family: 'Barlow', sans-serif !important;
}
.intro-label, .mode-tab, .logo-badge, .duty-chip, .btn-search,
.footer-line, .status-msg, .field-label, .results-count,
.results-mode, .ac-val, .ac-type {
  font-family: 'Barlow Condensed', sans-serif !important;
}
.input-icon { display: none !important; }
.input-wrap input {
  font-family: 'Barlow', sans-serif !important;
  font-size: 1rem !important;
  font-weight: 400 !important;
  letter-spacing: .02em !important;
  padding: .95rem 1rem !important;
}
.input-wrap input::placeholder {
  color: rgba(255,255,255,.34) !important;
  opacity: 1 !important;
}
.btn-search {
  min-width: 220px !important;
  min-height: 56px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: .9rem 2.25rem !important;
  font-family: 'Barlow Condensed', sans-serif !important;
  font-size: 1rem !important;
  font-weight: 600 !important;
  line-height: 1 !important;
  letter-spacing: .18em !important;
  text-transform: uppercase !important;
  overflow: hidden !important;
}
.btn-search::before, .btn-search::after {
  content: none !important;
  display: none !important;
}
@media (max-width: 640px) {
  #ui { justify-content: flex-start !important; padding: 7.5rem 1rem 3rem !important; }
  .intro-label {
    width: 100% !important;
    max-width: 22rem !important;
    margin: 0 auto 2rem !important;
    font-size: clamp(1.55rem, 7.5vw, 2.15rem) !important;
    line-height: 1.12 !important;
    text-align: center !important;
  }
  #search-panel { width: 100% !important; max-width: 100% !important; }
  .mode-tabs { display: grid !important; grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
  .mode-tab {
    width: 100% !important;
    min-width: 0 !important;
    padding: .7rem .25rem !important;
    font-size: .82rem !important;
    letter-spacing: .08em !important;
  }
  .input-wrap { min-height: 58px !important; }
  .input-wrap input { width: 100% !important; font-size: 1rem !important; padding: 1rem !important; }
  .btn-search {
    width: min(100%, 360px) !important;
    min-width: 0 !important;
    min-height: 58px !important;
    font-size: 1rem !important;
    letter-spacing: .2em !important;
  }
}
`;

try {
  let html = fs.readFileSync(indexPath, 'utf8');

  html = html
    .replace(
      /https:\/\/fonts\.googleapis\.com\/css2\?family=Outfit[^"']*display=swap/g,
      'https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700&family=Barlow+Condensed:wght@400;500;600;700&display=swap'
    )
    .replace(/'Outfit'\s*,\s*sans-serif/g, "'Barlow', sans-serif")
    .replace(/'JetBrains Mono'\s*,\s*monospace/g, "'Barlow Condensed', sans-serif")
    .replace(/(<button\b[^>]*class=["'][^"']*btn-search[^"']*["'][^>]*>)[\s\S]*?(<\/button>)/gi, '$1SEARCH$2')
    .replace(/<span\b[^>]*class=["'][^"']*input-icon[^"']*["'][^>]*>[\s\S]*?<\/span>/gi, '');

  const marker = '/* ELIMFILTERS approved Part Search typography */';
  if (!html.includes(marker)) {
    html = html.replace('</style>', `${approvedCss}\n</style>`);
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[part-search-ui] applied');
} catch (error) {
  console.error('[part-search-ui] failed:', error.message);
  process.exitCode = 1;
}

const syntraxContentLayer = `
<style id="syntrax-content-fix">
/* SYNTRAX: compact 12-industry application grid */
#syntrax-applications-grid {
  display: grid !important;
  grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
  gap: 1rem !important;
  margin-top: 2rem !important;
}
#syntrax-applications-grid .syntrax-industry-card {
  min-height: 165px;
  background: #000;
  border: 1px solid rgba(255,255,255,0.08);
  padding: 1.5rem;
  box-sizing: border-box;
}
#syntrax-applications-grid h3 {
  margin: 0 0 .8rem;
  color: #FFF12D;
  font-family: var(--font-display);
  font-size: .98rem;
  font-weight: 700;
  line-height: 1.15;
  text-transform: uppercase;
}
#syntrax-applications-grid p {
  margin: 0;
  color: rgba(255,255,255,.62);
  font-family: var(--font-body);
  font-size: .82rem;
  line-height: 1.55;
}
@media (max-width: 1050px) {
  #syntrax-applications-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
}
@media (max-width: 760px) {
  #syntrax-applications-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
}
@media (max-width: 520px) {
  #syntrax-applications-grid { grid-template-columns: 1fr !important; }
  #syntrax-applications-grid .syntrax-industry-card { min-height: auto; }
}
</style>
<script id="syntrax-content-script">
(function () {
  var industries = [
    ['HEAVY TRANSPORT', 'Long-haul diesel engines operating under high soot loads and extended oil drain intervals.'],
    ['POWER GENERATION', 'Continuous-duty generator sets requiring stable lubricant cleanliness for maximum uptime.'],
    ['AGRICULTURE', 'Seasonal equipment exposed to moisture, oxidation and long storage periods.'],
    ['MINING', 'Heavy-duty engines operating in abrasive dust environments with extreme contamination loads.'],
    ['CONSTRUCTION', 'High-load equipment working continuously under severe vibration and airborne contaminants.'],
    ['MANUFACTURING', 'Compressors, pumps and prime movers requiring precise lubrication control.'],
    ['OIL & GAS', 'Engines and auxiliary equipment operating across demanding upstream and downstream environments.'],
    ['MARINE', 'Propulsion and auxiliary engines exposed to humidity, salt and continuous operation.'],
    ['RAILWAY', 'Locomotive diesel engines operating under prolonged high-load duty cycles.'],
    ['AUTOBUSES Y TRANSPORTE', 'Passenger fleets requiring extended service intervals and dependable engine protection.'],
    ['AUTOMOTIVE', 'Light-duty gasoline and diesel engines requiring stable lubrication protection.'],
    ['WASTE MUNICIPAL', 'Refuse fleets operating under repetitive stop-and-go severe-duty conditions.']
  ];

  function normalize(value) {
    return String(value || '').replace(/TM/g, '™').replace(/\s+/g, ' ').trim().toUpperCase();
  }

  function removeRepeatedSpecs() {
    document.querySelectorAll('main section').forEach(function (section) {
      var text = normalize(section.textContent);
      if (text.indexOf('PROTECTION LAYERS') !== -1 &&
          text.indexOf('OUTER INTERCEPT') !== -1 &&
          text.indexOf('BYPASS VALVE') !== -1 &&
          text.indexOf('OIL COMPATIBILITY') !== -1) {
        section.remove();
      }
    });
  }

  function rebuildApplications() {
    var heading = Array.from(document.querySelectorAll('main h2')).find(function (el) {
      return normalize(el.textContent).indexOf('WHERE SYNTRAX™ PROTECTS') !== -1;
    });
    if (!heading) return false;

    var section = heading.closest('section');
    if (!section) return false;

    var intro = heading.parentElement && heading.parentElement.querySelector('p');
    if (intro) {
      intro.textContent = 'Validated across every major engine application where lubricant cleanliness directly affects asset reliability.';
      intro.style.maxWidth = '760px';
    }

    var grids = Array.from(section.querySelectorAll('div')).filter(function (el) {
      var style = el.getAttribute('style') || '';
      return style.indexOf('grid-template-columns') !== -1 && el.querySelector('h3');
    });
    var grid = grids[grids.length - 1];
    if (!grid) return false;

    grid.id = 'syntrax-applications-grid';
    grid.removeAttribute('style');
    grid.innerHTML = industries.map(function (item) {
      return '<div class="syntrax-industry-card"><h3>' + item[0] + '</h3><p>' + item[1] + '</p></div>';
    }).join('');
    return true;
  }

  function applySyntraxContent() {
    removeRepeatedSpecs();
    return rebuildApplications();
  }

  applySyntraxContent();
  document.addEventListener('DOMContentLoaded', applySyntraxContent, { once: true });
  window.addEventListener('load', applySyntraxContent, { once: true });
  var observer = new MutationObserver(function () {
    if (applySyntraxContent()) observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(function () { observer.disconnect(); applySyntraxContent(); }, 5000);
})();
</script>`;

try {
  let syntraxHtml = fs.readFileSync(syntraxPath, 'utf8');
  syntraxHtml = syntraxHtml
    .replace(/<style id="syntrax-specs-grid-fix">[\s\S]*?<\/style>/gi, '')
    .replace(/<style id="syntrax-content-fix">[\s\S]*?<\/style>\s*<script id="syntrax-content-script">[\s\S]*?<\/script>/gi, '');
  syntraxHtml = syntraxHtml.replace('</body>', `${syntraxContentLayer}\n</body>`);
  fs.writeFileSync(syntraxPath, syntraxHtml, 'utf8');
  console.log('[syntrax-content] applied: redundant specs removed, 12-industry grid enabled');
} catch (error) {
  console.error('[syntrax-content] failed:', error.message);
  process.exitCode = 1;
}
