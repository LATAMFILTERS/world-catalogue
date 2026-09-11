const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const OUT_DIR = path.join(__dirname, 'out');

// --- Rutas muertas de WordPress/Polylang: responder 410 Gone -----------
const LEGACY_PREFIXES = [
  '/language/', '/es/', '/en/', '/zh/', '/ja/', '/fr/', '/de/', '/pt/',
  '/wp-content/', '/wp-includes/', '/wp-admin/',
];

const LEGACY_EXACT = new Set([
  '/about-elimfilters', '/agriculture-industry', '/agriculture',
  '/air-dryer-filters', '/air-filter', '/air-filtration', '/air-gas-filters',
  '/aplicaion-distribuidor-eng-3', '/aplicaion-distribuidor-eng-4',
  '/aplicaion-distribuidor-eng-5', '/application-distributor-eng-2',
  '/aquaguard-technology', '/aquaguard-tecnologia', '/automotive',
  '/buscador-de-partes', '/comments/feed', '/comprehensive-warranty-coverage',
  '/constrution-industry', '/contact-2', '/coolant-filters', '/dealer-portal',
  '/drycore-technology', '/duratech-technology', '/elimtek-tm-fuel-filtration',
  '/elimtek-tm-hidraulic', '/fuel-filter-separator', '/fuel-filters',
  '/gas-filters', '/hidraulic-filters', '/home.html', '/home',
  '/housing-intakes', '/industries-we-service', '/intekcore-technology',
  '/macrocore-technology', '/manufacturing-industrial', '/manufacturing',
  '/marine-filters', '/marine-industry', '/marine', '/oil-filtration',
  '/parts-search', '/part-search', '/power-generations-industry',
  '/premium-preview', '/privacy-policy', '/servicios-municipales',
  '/syntepore-tecnologia', '/syntrax-technology', '/system', '/technology',
  '/turbine-fuel', '/industries/forestry',
  '/technologies/turbocore-series', '/technologies/hydrocore-series',
]);

function isLegacyPath(pathname) {
  const clean = pathname.replace(/\/$/, '') || '/';
  if (LEGACY_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  if (LEGACY_EXACT.has(clean)) return true;
  if (pathname.startsWith('/wp-') && pathname.endsWith('.php')) return true;
  return false;
}

// --- /knowledge-system/<seccion>/* sin page.tsx real: redirigir 301 ----
// (mientras tanto: los enlaces internos que causaban esto ya se corrigieron
// en el c\u00f3digo fuente; esto es red de seguridad para URLs ya indexadas)
const KNOWLEDGE_SYSTEM_SECTION_REDIRECTS = {
  standards: '/knowledge-center/standards/',
  contamination: '/knowledge-center/engineering/',
  fleet: '/knowledge-center/fleet-optimization/',
  technologies: '/technologies/',
  bridges: '/knowledge-center/',
  compare: '/knowledge-center/',
  science: '/knowledge-center/',
};

function knowledgeSystemRedirectTarget(pathname) {
  const match = pathname.match(/^\/knowledge-system\/([^/]+)(\/|$)/);
  if (!match) return null;
  const section = match[1];
  // No tocar las p\u00e1ginas reales que s\u00ed existen bajo knowledge-system
  const realPages = ['faqs', 'market', 'resources'];
  if (realPages.includes(section)) return null;
  return KNOWLEDGE_SYSTEM_SECTION_REDIRECTS[section] || null;
}

function send404(res) {
  const custom404 = path.join(OUT_DIR, '404.html');
  res.status(404);
  if (fs.existsSync(custom404)) {
    res.sendFile(custom404);
  } else {
    res.send('Not found');
  }
}

app.use(express.static(OUT_DIR));

app.get('*', (req, res) => {
  const pathname = req.path;

  if (isLegacyPath(pathname)) {
    return res.status(410).send('Gone');
  }

  const ksTarget = knowledgeSystemRedirectTarget(pathname);
  if (ksTarget) {
    return res.redirect(301, ksTarget);
  }

  const filePath = path.join(OUT_DIR, pathname);

  if (fs.existsSync(`${filePath}.html`)) {
    return res.sendFile(`${filePath}.html`);
  }

  if (fs.existsSync(path.join(filePath, 'index.html'))) {
    return res.sendFile(path.join(filePath, 'index.html'));
  }

  // Antes: si nada coincid\u00eda, se serv\u00eda el index.html de la portada con
  // status 200 (soft-404). Ahora se responde un 404 real.
  return send404(res);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
