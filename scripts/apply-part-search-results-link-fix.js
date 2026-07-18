const fs = require('fs');
const path = require('path');

const resultsPath = path.join(__dirname, '..', 'part-search', 'results.html');

try {
  let html = fs.readFileSync(resultsPath, 'utf8');

  const legacyExpression = "p.technology.replace(/[â„¢Â®\\s]/g, '').toLowerCase()";
  // NFKD-normalizing before stripping ™/®/© is wrong: Unicode compatibility
  // decomposition turns ™ (U+2122) into the literal letters "TM" (and ® into
  // "(R)", etc.) *before* the symbol-stripping regex runs, so the regex finds
  // nothing left to strip and "TM" survives into the slug (SYNTRAX™ →
  // "syntraxtm" instead of "syntrax") — breaking the technology link for
  // every product, not just one SKU. Strip the symbols first, then normalize.
  const buggyCanonicalExpression = "String(p.technology).normalize('NFKD').replace(/[™®©]/g, '').replace(/[^A-Za-z0-9]/g, '').toLowerCase()";
  const canonicalExpression = "String(p.technology).replace(/[™®©]/g, '').normalize('NFKD').replace(/[^A-Za-z0-9]/g, '').toLowerCase()";

  if (html.includes(legacyExpression)) {
    html = html.split(legacyExpression).join(canonicalExpression);
  } else if (html.includes(buggyCanonicalExpression)) {
    html = html.split(buggyCanonicalExpression).join(canonicalExpression);
  }

  // Also repair any already-materialized technology URLs containing a trademark symbol.
  html = html
    .replace(/\/technologies\/([a-z0-9-]+)(?:™|%E2%84%A2)\//gi, '/technologies/$1/')
    .replace(/backToSearch:\s*'[^']*BACK TO SEARCH'/, "backToSearch:      'BACK TO SEARCH'")
    .replace(/backToSearch:\s*'[^']*VOLVER AL BUSCADOR'/, "backToSearch:      'VOLVER AL BUSCADOR'")
    .replace(/backToSearch:\s*'[^']*VOLTAR AO BUSCADOR'/, "backToSearch:      'VOLTAR AO BUSCADOR'");

  fs.writeFileSync(resultsPath, html, 'utf8');
  console.log('[part-search-results-source] canonical technology slugs applied');
} catch (error) {
  console.error('[part-search-results-source] failed:', error.message);
  process.exitCode = 1;
}
