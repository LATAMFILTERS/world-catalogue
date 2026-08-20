import fs from 'node:fs';
import path from 'node:path';

const out = path.resolve(process.cwd(), 'out');
if (!fs.existsSync(out)) {
  console.log('[sanitize-kc-public] out not found; skipping');
  process.exit(0);
}

const roots = [
  path.join(out, 'knowledge-center'),
  path.join(out, 'api', 'citation'),
].filter(fs.existsSync);

const textExt = new Set(['.html', '.json', '.xml', '.txt']);
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (textExt.has(path.extname(entry.name).toLowerCase())) files.push(full);
  }
}
for (const root of roots) walk(root);

const literalReplacements = [
  ['Provides the sole global standardised test method', 'Provides a standardized test method'],
  ['Provides the sole global standardized test method', 'Provides a standardized test method'],
  ['ISO 16889 is the reference standard for all ELIMFILTERS fluid filter qualification.', 'ISO 16889 is used as an engineering reference where applicable to hydraulic and lubrication filter evaluation.'],
  ['Particle contamination is responsible for 70–80% of hydraulic system failures.', 'Particle contamination is a major contributor to hydraulic-system wear and failure; actual impact depends on system design, duty cycle, operating environment, and contamination control.'],
  ['maintaining 16/14/11 in a servo system extends valve spool life by 3–5× compared to uncontrolled contamination at 20/18/15.', 'maintaining an appropriate cleanliness target can materially reduce contamination-related wear; actual component life depends on the application and operating conditions.'],
  ['ISO 16889 test reports with Beta ratio data are the only valid basis for filter element selection in engineered hydraulic systems.', 'ISO 16889 Beta-ratio data provide an appropriate engineering basis for filter-element evaluation when the application requires this test method.'],
  ['Air filtration directly determines engine wear rate and volumetric efficiency.', 'Air-filtration performance influences engine wear and airflow behavior within the conditions of the approved application.'],
  ['Particle contamination in lube oil is the primary cause of bearing and piston wear.', 'Particle contamination in lube oil is an important contributor to bearing and piston wear.'],
  ['MICROKAPPA™ cabin filtration rated to the efficiency class specified for the approved application is mandatory from an occupational health standpoint — not optional equipment.', 'Cabin filtration should be selected to the efficiency class and occupational-exposure requirements applicable to the approved application and jurisdiction.'],
  ['CAT 793, Komatsu 930E class', 'large surface haul-truck class'],
  ['CAT 320–395, Komatsu PC200–800 class', 'medium-to-large excavator class'],
  ['CAT 320-395, Komatsu PC200-800 class', 'medium-to-large excavator class'],
];

const competitorPatterns = [
  /\bCaterpillar\b/gi,
  /\bKomatsu\b/gi,
  /\bDonaldson\b/gi,
  /\bFleetguard\b/gi,
  /\bMANN(?:-FILTER)?\b/gi,
];

const emoji = ['💨', '⛽', '🔧', '⚙️', '⚙', '🌡️', '🌡', '🏭', '⛏️', '⛏', '🏗️', '🏗', '🌾', '🚛', '⚓', '🛢️', '🛢', '⚡', '🚂', '🗑️', '🗑'];

let changed = 0;
for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  const before = text;

  for (const [from, to] of literalReplacements) text = text.replaceAll(from, to);
  for (const re of competitorPatterns) text = text.replace(re, 'external manufacturer');
  for (const mark of emoji) text = text.replaceAll(mark, '');

  // Public brand palette: yellow / black / white / neutral grays. Remove legacy
  // severity/status colors from KC HTML without altering the underlying meaning.
  if (file.endsWith('.html')) {
    text = text
      .replaceAll('#ff4444', '#B8B8B8')
      .replaceAll('#FF4444', '#B8B8B8')
      .replaceAll('#ff8c00', '#D7D7D7')
      .replaceAll('#FF8C00', '#D7D7D7')
      .replaceAll('#44ff88', '#FFF12D')
      .replaceAll('#44FF88', '#FFF12D');
  }

  if (text !== before) {
    fs.writeFileSync(file, text, 'utf8');
    changed += 1;
  }
}

console.log(`[sanitize-kc-public] Governed ${files.length} KC/citation files; modified ${changed}`);
