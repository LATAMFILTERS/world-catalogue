import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd(), '..');
const citationDir = path.join(root, 'frontend', 'public', 'api', 'citation');
const appDir = path.join(root, 'frontend', 'src');

function readJson(name) {
  const file = path.join(citationDir, name);
  if (!fs.existsSync(file)) throw new Error(`Missing citation artifact: ${name}`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function readSource(relativePath) {
  const file = path.join(appDir, relativePath);
  if (!fs.existsSync(file)) throw new Error(`Missing governed source: ${relativePath}`);
  return fs.readFileSync(file, 'utf8');
}

const turbine = readJson('FUEL_TURBINE.json');
const standard = readJson('FUEL_WATER_SEPARATOR.json');
const turbocore = readJson('TURBOCORE.json');
const hydrocore = readJson('HYDROCORE.json');
const turbineRoute = readSource('app/technologies/[slug]/page.tsx');
const turbineEditorial = readSource('lib/turbocore-editorial.ts');
const familyData = readSource('lib/product-families-data.ts');

const turbineCanonical = JSON.stringify(turbine.canonical || {});
const standardCanonical = JSON.stringify(standard.canonical || {});
const turbocoreCanonical = JSON.stringify(turbocore.canonical || {});
const hydrocoreCanonical = JSON.stringify(hydrocore.canonical || {});

const violations = [];

if (!/TURBOCORE/i.test(turbineCanonical)) {
  violations.push('FUEL_TURBINE canonical block must identify TURBOCORE as its governing technology.');
}
if (/governed by\s+HYDROCORE|implements\s+HYDROCORE|HYDROCORE.{0,80}Turbine Series|Turbine Series.{0,80}HYDROCORE/i.test(turbineCanonical)) {
  violations.push('FUEL_TURBINE canonical block still assigns FH/FG turbine architecture to HYDROCORE.');
}
if (!/HYDROCORE/i.test(standardCanonical)) {
  violations.push('FUEL_WATER_SEPARATOR canonical block must identify HYDROCORE as its governing technology.');
}
if (/governed by\s+TURBOCORE|implements\s+TURBOCORE/i.test(standardCanonical)) {
  violations.push('FUEL_WATER_SEPARATOR canonical block must not assign standard non-turbine separators to TURBOCORE.');
}
if (!/FH|FG|turbine/i.test(turbocoreCanonical) || !/exclus|reserved|FH|FG/i.test(turbocoreCanonical)) {
  violations.push('TURBOCORE citation must preserve its FH/FG turbine-only scope.');
}
if (!/non-turbine|standard/i.test(hydrocoreCanonical)) {
  violations.push('HYDROCORE citation must preserve its standard non-turbine scope.');
}

if (!turbineRoute.includes('TURBOCORE_EDITORIAL')) {
  violations.push('The public /technologies/turbocore route must use the governed TURBOCORE editorial source.');
}
if (/paired with HYDROCORE|HYDROCORE.{0,80}filtration media/i.test(turbineRoute)) {
  violations.push('The public TURBOCORE route still contains a legacy HYDROCORE-media dependency claim.');
}
if (/paired with HYDROCORE|HYDROCORE.{0,80}filtration media/i.test(turbineEditorial)) {
  violations.push('The governed TURBOCORE editorial source must not describe HYDROCORE as its installed filtration media.');
}
if (!/TURBOCORE™ exclusively governs|governed exclusively by TURBOCORE/i.test(turbineEditorial)) {
  violations.push('The governed TURBOCORE editorial source must state the FH/FG turbine-only scope explicitly.');
}

const familyMatch = familyData.match(/'fuel-turbine':\s*\{[\s\S]*?\n\s*\},\n\s*'oil-filters':/);
if (!familyMatch) {
  violations.push('Could not locate fuel-turbine product-family source block.');
} else {
  const familyBlock = familyMatch[0];
  if (!/TURBOCORE™ exclusively governs/i.test(familyBlock)) {
    violations.push('fuel-turbine product family must identify TURBOCORE as the exclusive governing technology.');
  }
  if (/HYDROCORE™ governs the turbine|paired with HYDROCORE™/i.test(familyBlock)) {
    violations.push('fuel-turbine product family still carries a legacy HYDROCORE turbine assignment.');
  }
}

if (violations.length) {
  console.error('[fuel-technology-scope] FAIL');
  for (const violation of violations) console.error(` - ${violation}`);
  process.exit(1);
}

console.log('[fuel-technology-scope] PASS — SYNTAPORE/HYDROCORE/TURBOCORE separation remains canonical');
