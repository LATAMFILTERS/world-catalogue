import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const file = path.join(root, 'frontend', 'src', 'components', 'HydraulicPage.tsx');

let source = fs.readFileSync(file, 'utf8');
const original = source;

function replaceOnce(before, after, label) {
  const count = source.split(before).length - 1;
  if (count === 0) {
    if (source.includes(after)) {
      console.log(`[already migrated] ${label}`);
      return;
    }
    throw new Error(`Expected source not found for: ${label}`);
  }
  if (count !== 1) throw new Error(`Expected exactly one match for ${label}; found ${count}`);
  source = source.replace(before, after);
  console.log(`[migrated] ${label}`);
}

replaceOnce(
  "import { AnimateIn, StaggerContainer, itemVariants } from './AnimateIn';",
  "import { AnimateIn, StaggerContainer, itemVariants } from './AnimateIn';\nimport { useMeasurementSystem } from './MeasurementProvider';",
  'MeasurementProvider import',
);

replaceOnce(
  "export function HydraulicPage() {\n  return (",
  "export function HydraulicPage() {\n  const { formatMeasurement, formatMeasurementRange } = useMeasurementSystem();\n\n  return (",
  'measurement hook',
);

replaceOnce(
  '99.99% filtration efficiency with integrated water separation. Rated to 450 PSI for high-pressure circuits — protecting pumps, valves, actuators and servo components from particulate abrasion, water ingress and fluid degradation.',
  "99.99% filtration efficiency with integrated water separation. Rated to {formatMeasurement('pressure_kpa', 3102.6416)} for high-pressure circuits — protecting pumps, valves, actuators and servo components from particulate abrasion, water ingress and fluid degradation.",
  'hero collapse pressure',
);

replaceOnce(
  'ELIMFILTERS hydraulic filters are engineered for the most demanding fluid power circuits. The high-collapse glass fiber media achieves 99.99% single-pass efficiency, capturing particles down to 3 microns absolute before they reach precision-clearance components. A coalescing water separation stage removes free and emulsified water from the fluid stream — the primary cause of hydraulic pump cavitation, valve spool corrosion and fluid oxidation acceleration. Rated to 450 PSI collapse pressure, these elements hold structural integrity under the full shock-load range of mobile and industrial hydraulic systems.',
  "ELIMFILTERS hydraulic filters are engineered for the most demanding fluid power circuits. The high-collapse glass fiber media achieves 99.99% single-pass efficiency, capturing particles down to 3 microns absolute before they reach precision-clearance components. A coalescing water separation stage removes free and emulsified water from the fluid stream — the primary cause of hydraulic pump cavitation, valve spool corrosion and fluid oxidation acceleration. Rated to {formatMeasurement('pressure_kpa', 3102.6416)} collapse pressure, these elements hold structural integrity under the full shock-load range of mobile and industrial hydraulic systems.",
  'product description collapse pressure',
);

replaceOnce(
  '                      450 PSI Collapse',
  "                      {formatMeasurement('pressure_kpa', 3102.6416)} Collapse",
  'product spec collapse pressure',
);

replaceOnce(
  '                  450 PSI',
  "                  {formatMeasurement('pressure_kpa', 3102.6416)}",
  'performance card collapse pressure',
);

replaceOnce(
  "                { title: 'MINING', desc: 'Hydraulic roof supports, drill rigs and haul truck suspensions. Guards servo valves and piston pumps in circuits operating at 3,000–5,000 PSI under continuous shock loads.' },",
  "                { title: 'MINING', desc: `Hydraulic roof supports, drill rigs and haul truck suspensions. Guards servo valves and piston pumps in circuits operating at ${formatMeasurementRange('pressure_kpa', 20684.2719, 34473.7865)} under continuous shock loads.` },",
  'mining pressure range',
);

if (source === original) {
  console.log('No changes required. HydraulicPage.tsx is already migrated.');
  process.exit(0);
}

fs.writeFileSync(file, source, 'utf8');
console.log(`Updated ${path.relative(root, file)}`);
