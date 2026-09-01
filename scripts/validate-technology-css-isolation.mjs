import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd(), '..');
const appDir = path.join(root, 'frontend', 'src', 'app');
const componentsDir = path.join(root, 'frontend', 'src', 'components');

const technologyHeroAssets = [
  'mecanica-air.avif',
  'cabin-hero.avif',
  'airdryer-hero.avif',
  'intekcor-hero.avif',
  'hero-syntapore.avif',
  'syntrax.avif',
  'nanoforce-mecanico.avif',
  'THERMACORE-CAMION.avif',
  'fuellseparator-hero.avif',
  'TURBOCORE-hero.avif',
];

const cssFiles = fs.readdirSync(appDir)
  .filter((name) => name.endsWith('.css'))
  .map((name) => path.join(appDir, name));

const violations = [];

for (const file of cssFiles) {
  const source = fs.readFileSync(file, 'utf8');
  const withoutComments = source.replace(/\/\*[\s\S]*?\*\//g, '');

  for (const asset of technologyHeroAssets) {
    if (withoutComments.includes(asset)) {
      violations.push(`${path.relative(root, file)} references shared technology hero asset ${asset}`);
    }
  }
}

const mobileFixPath = path.join(componentsDir, 'MobileInternalLayoutFix.tsx');
if (fs.existsSync(mobileFixPath)) {
  const source = fs.readFileSync(mobileFixPath, 'utf8');
  if (!source.includes('const isTarget = !isTechnologies')) {
    violations.push('MobileInternalLayoutFix must explicitly exclude /technologies/* from generic DOM mutation');
  }
  if (!source.includes("main.classList.remove('technologies-page-mobile-fix')")) {
    violations.push('MobileInternalLayoutFix must remove technologies-page-mobile-fix instead of applying it');
  }
}

const chromePath = path.join(componentsDir, 'TechnologyRouteChrome.tsx');
if (fs.existsSync(chromePath)) {
  const source = fs.readFileSync(chromePath, 'utf8');
  if (source.includes("'@type': 'TechArticle'") || source.includes('articleEnrichment')) {
    violations.push('TechnologyRouteChrome must not inject a second TechArticle schema; each technology page owns its canonical article schema');
  }
}

if (violations.length) {
  console.error('[technology-css-isolation] FAIL');
  console.error('Technology routes must remain isolated from legacy global page-identification and DOM-rewrite behavior.');
  for (const violation of violations) console.error(` - ${violation}`);
  process.exit(1);
}

console.log('[technology-css-isolation] PASS — technology routes are isolated from shared-image CSS and legacy mobile DOM mutation');
