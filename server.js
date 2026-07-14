const fs = require('fs');
const path = require('path');
const express = require('express');

const originalStatic = express.static;
const partSearchRoot = path.resolve(__dirname, 'part-search');
const partSearchIndex = path.join(partSearchRoot, 'index.html');

const finalUiFix = `
<style id="elim-part-search-final-ui">
@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800;900&family=Chakra+Petch:wght@500;600;700&display=swap');
html, body, input, select, textarea { font-family: 'Barlow', sans-serif !important; }
.intro-label, .mode-tab, .logo-badge, .duty-chip, .btn-search, .field-label,
.footer-line, .status-msg, .results-count, .results-mode, .ac-val, .ac-type {
  font-family: 'Chakra Petch', sans-serif !important;
}
.intro-label { font-weight: 600 !important; letter-spacing: .12em !important; }
.mode-tab, .duty-chip, .field-label { font-weight: 500 !important; letter-spacing: .1em !important; }
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
  overflow: hidden !important;
}
.btn-search::before, .btn-search::after { content: none !important; display: none !important; }
@media (max-width: 640px) {
  #ui { justify-content: flex-start !important; padding: 7.5rem 1rem 3rem !important; }
  .intro-label { width: 100% !important; max-width: 22rem !important; margin: 0 auto 2rem !important; font-size: clamp(1.45rem, 7vw, 2rem) !important; line-height: 1.15 !important; text-align: center !important; }
  #search-panel { width: 100% !important; max-width: 100% !important; }
  .mode-tabs { display: grid !important; grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
  .mode-tab { width: 100% !important; min-width: 0 !important; padding: .7rem .2rem !important; font-size: .78rem !important; letter-spacing: .06em !important; }
  .input-wrap { min-height: 58px !important; }
  .input-wrap input { width: 100% !important; padding: 1rem !important; }
  .btn-search { width: min(100%, 360px) !important; min-width: 0 !important; min-height: 58px !important; font-size: 1rem !important; }
}
</style>
<script id="elim-part-search-cleanup">
(function () {
  function clean() {
    document.querySelectorAll('.btn-search').forEach(function (button) { button.textContent = 'SEARCH'; });
    document.querySelectorAll('.input-icon').forEach(function (icon) { icon.remove(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', clean);
  else clean();
  window.addEventListener('load', clean);
  setTimeout(clean, 250);
})();
</script>`;

function correctedPartSearchHtml() {
  let html = fs.readFileSync(partSearchIndex, 'utf8');
  html = html
    .replace(/<link[^>]+fonts\.googleapis\.com[^>]*>/gi, '')
    .replace(/(<button\b[^>]*class=["'][^"']*btn-search[^"']*["'][^>]*>)[\s\S]*?(<\/button>)/gi, '$1SEARCH$2')
    .replace(/<span\b[^>]*class=["'][^"']*input-icon[^"']*["'][^>]*>[\s\S]*?<\/span>/gi, '')
    .replace(/<style id="elim-part-search-final-ui">[\s\S]*?<\/script>/gi, '');
  return html.replace('</body>', finalUiFix + '\n</body>');
}

express.static = function patchedStatic(root, options) {
  const resolvedRoot = path.resolve(root);
  const normalMiddleware = originalStatic.call(express, root, options);
  if (resolvedRoot !== partSearchRoot) return normalMiddleware;

  return function partSearchStatic(req, res, next) {
    if (req.path === '/' || req.path === '/index.html') {
      try {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        return res.type('html').send(correctedPartSearchHtml());
      } catch (error) {
        console.error('[part-search-ui]', error.message);
      }
    }
    return normalMiddleware(req, res, next);
  };
};

require('./server-original');
