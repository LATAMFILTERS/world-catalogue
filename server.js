const fs = require('fs');
const path = require('path');

const partSearchIndex = path.join(__dirname, 'part-search', 'index.html');

try {
  let html = fs.readFileSync(partSearchIndex, 'utf8');

  html = html
    .replace(
      'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap',
      'https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700&family=Barlow+Condensed:wght@400;500;600;700&display=swap'
    )
    .replace(/(<button\b[^>]*class="[^"]*btn-search[^"]*"[^>]*>)[\s\S]*?(<\/button>)/gi, '$1SEARCH$2')
    .replace(/<span\b[^>]*class="[^"]*input-icon[^"]*"[^>]*>[\s\S]*?<\/span>/gi, '');

  if (!html.includes('/elim-ui-fix.css')) {
    html = html.replace(
      '</head>',
      '  <link rel="stylesheet" href="/elim-ui-fix.css?v=20260713c">\n</head>'
    );
  }

  fs.writeFileSync(partSearchIndex, html, 'utf8');
} catch (error) {
  console.error('[part-search-ui]', error.message);
}

require('./server-original');
