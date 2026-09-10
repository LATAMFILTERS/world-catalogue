import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const file = path.join(root, 'frontend', 'src', 'components', 'HydraulicPage.tsx');

let source = fs.readFileSync(file, 'utf8');
const original = source;
const resolved = [];

function ensureReplacement({ label, legacy, migrated, replace }) {
  if (migrated.test(source)) {
    resolved.push(`${label}: already migrated`);
    return;
  }

  if (!legacy.test(source)) {
    throw new Error(`Cannot resolve ${label}: neither legacy nor migrated form was found.`);
  }

  source = replace(source);

  if (!migrated.test(source)) {
    throw new Error(`Replacement failed validation for ${label}.`);
  }

  resolved.push(`${label}: migrated`);
}

ensureReplacement({
  label: 'MeasurementProvider import',
  legacy: /import \{ AnimateIn, StaggerContainer, itemVariants \} from '\.\/AnimateIn';/,
  migrated: /import \{ useMeasurementSystem \} from '\.\/MeasurementProvider';/,
  replace: (text) => text.replace(
    /import \{ AnimateIn, StaggerContainer, itemVariants \} from '\.\/AnimateIn';/,
    "import { AnimateIn, StaggerContainer, itemVariants } from './AnimateIn';\nimport { useMeasurementSystem } from './MeasurementProvider';",
  ),
});

ensureReplacement({
  label: 'measurement hook',
  legacy: /export function HydraulicPage\(\) \{\s*return \(/,
  migrated: /const \{ formatMeasurement, formatMeasurementRange \} = useMeasurementSystem\(\);/,
  replace: (text) => text.replace(
    /export function HydraulicPage\(\) \{\s*return \(/,
    "export function HydraulicPage() {\n  const { formatMeasurement, formatMeasurementRange } = useMeasurementSystem();\n\n  return (",
  ),
});

ensureReplacement({
  label: 'hero collapse pressure',
  legacy: /Rated to 450 PSI for high-pressure circuits/,
  migrated: /Rated to \{formatMeasurement\('pressure_kpa', 3102\.6416\)\} for high-pressure circuits/,
  replace: (text) => text.replace(
    /Rated to 450 PSI for high-pressure circuits/,
    "Rated to {formatMeasurement('pressure_kpa', 3102.6416)} for high-pressure circuits",
  ),
});

ensureReplacement({
  label: 'product description collapse pressure',
  legacy: /Rated to 450 PSI collapse pressure/,
  migrated: /Rated to \{formatMeasurement\('pressure_kpa', 3102\.6416\)\} collapse pressure/,
  replace: (text) => text.replace(
    /Rated to 450 PSI collapse pressure/,
    "Rated to {formatMeasurement('pressure_kpa', 3102.6416)} collapse pressure",
  ),
});

ensureReplacement({
  label: 'product spec collapse pressure',
  legacy: />\s*450 PSI Collapse\s*</,
  migrated: /\{formatMeasurement\('pressure_kpa', 3102\.6416\)\} Collapse/,
  replace: (text) => text.replace(
    /(>\s*)450 PSI Collapse(\s*<)/,
    "$1{formatMeasurement('pressure_kpa', 3102.6416)} Collapse$2",
  ),
});

ensureReplacement({
  label: 'performance card collapse pressure',
  legacy: />\s*450 PSI\s*</,
  migrated: />\s*\{formatMeasurement\('pressure_kpa', 3102\.6416\)\}\s*</,
  replace: (text) => text.replace(
    /(>\s*)450 PSI(\s*<)/,
    "$1{formatMeasurement('pressure_kpa', 3102.6416)}$2",
  ),
});

ensureReplacement({
  label: 'mining pressure range',
  legacy: /circuits operating at 3,000[–-]5,000 PSI under continuous shock loads\./,
  migrated: /formatMeasurementRange\('pressure_kpa', 20684\.2719, 34473\.7865\)/,
  replace: (text) => text.replace(
    /\{ title: 'MINING', desc: 'Hydraulic roof supports, drill rigs and haul truck suspensions\. Guards servo valves and piston pumps in circuits operating at 3,000[–-]5,000 PSI under continuous shock loads\.' \}/,
    "{ title: 'MINING', desc: `Hydraulic roof supports, drill rigs and haul truck suspensions. Guards servo valves and piston pumps in circuits operating at ${formatMeasurementRange('pressure_kpa', 20684.2719, 34473.7865)} under continuous shock loads.` }",
  ),
});

const legacyPressurePatterns = [
  /Rated to 450 PSI for high-pressure circuits/,
  /Rated to 450 PSI collapse pressure/,
  />\s*450 PSI Collapse\s*</,
  />\s*450 PSI\s*</,
  /3,000[–-]5,000 PSI/,
];

const remaining = legacyPressurePatterns.filter((pattern) => pattern.test(source));
if (remaining.length) {
  throw new Error(`Migration validation failed: ${remaining.length} legacy pressure form(s) remain.`);
}

if (source !== original) {
  fs.writeFileSync(file, source, 'utf8');
  console.log(`Updated ${path.relative(root, file)}`);
} else {
  console.log('No changes required. HydraulicPage.tsx is already migrated.');
}

for (const item of resolved) console.log(`[ok] ${item}`);
