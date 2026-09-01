import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd(), '..');
const appDir = path.join(root, 'frontend', 'src', 'app');

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

if (violations.length) {
  console.error('[technology-css-isolation] FAIL');
  console.error('Global app CSS must not identify pages by technology hero image filenames.');
  console.error('Use semantic route/page classes or page-specific CSS modules instead.');
  for (const violation of violations) console.error(` - ${violation}`);
  process.exit(1);
}

console.log('[technology-css-isolation] PASS — no global CSS selectors depend on technology hero image filenames');
