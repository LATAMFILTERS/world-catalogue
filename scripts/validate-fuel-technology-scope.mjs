import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd(), '..');
const citationDir = path.join(root, 'frontend', 'public', 'api', 'citation');

function readJson(name) {
  const file = path.join(citationDir, name);
  if (!fs.existsSync(file)) throw new Error(`Missing citation artifact: ${name}`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

const turbine = readJson('FUEL_TURBINE.json');
const standard = readJson('FUEL_WATER_SEPARATOR.json');
const turbocore = readJson('TURBOCORE.json');
const hydrocore = readJson('HYDROCORE.json');

const turbineCanonical = JSON.stringify(turbine.canonical || {});
const standardCanonical = JSON.stringify(standard.canonical || {});
const turbocoreCanonical = JSON.stringify(turbocore.canonical || {});
const hydrocoreCanonical = JSON.stringify(hydrocore.canonical || {});

const violations = [];

if (!/TURBOCORE/i.test(turbineCanonical)) {
  violations.push('FUEL_TURBINE canonical block must identify TURBOCORE as its governing technology.');
}
if (/governed by\\s+HYDROCORE|implements\\s+HYDROCORE|HYDROCORE.{0,80}Turbine Series|Turbine Series.{0,80}HYDROCORE/i.test(turbineCanonical)) {
  violations.push('FUEL_TURBINE canonical block still assigns FH/FG turbine architecture to HYDROCORE.');
}
if (!/HYDROCORE/i.test(standardCanonical)) {
  violations.push('FUEL_WATER_SEPARATOR canonical block must identify HYDROCORE as its governing technology.');
}
if (/governed by\\s+TURBOCORE|implements\\s+TURBOCORE/i.test(standardCanonical)) {
  violations.push('FUEL_WATER_SEPARATOR canonical block must not assign standard non-turbine separators to TURBOCORE.');
}
if (!/FH|FG|turbine/i.test(turbocoreCanonical) || !/exclus|reserved|FH|FG/i.test(turbocoreCanonical)) {
  violations.push('TURBOCORE citation must preserve its FH/FG turbine-only scope.');
}
if (!/non-turbine|standard/i.test(hydrocoreCanonical)) {
  violations.push('HYDROCORE citation must preserve its standard non-turbine scope.');
}

if (violations.length) {
  console.error('[fuel-technology-scope] FAIL');
  for (const violation of violations) console.error(` - ${violation}`);
  process.exit(1);
}

console.log('[fuel-technology-scope] PASS — SYNTAPORE/HYDROCORE/TURBOCORE separation remains canonical');
