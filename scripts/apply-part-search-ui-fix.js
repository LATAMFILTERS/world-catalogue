const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'part-search', 'index.html');

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
