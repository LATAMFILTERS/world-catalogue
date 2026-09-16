/**
 * apply-manual-lube-crossrefs.js
 *
 * Applies crossrefs looked up manually (Fleetguard's own site + other
 * manufacturers' own crossref tools) for the 16 Lube gap codes that
 * oilfilter-crossreference.com never had pages for (see the STATUS note
 * in retry-lube-crossref-gaps.js).
 *
 * Brand keys follow the existing normalization already used in
 * donaldson_lube_results.json (hyphenated multi-word brands: AC-DELCO,
 * GENERAL-MOTORS, NEW-HOLLAND; NAPA absorbs "NAPA Gold"/"NAPA Filters";
 * FORD is factory/OE part numbers, MOTORCRAFT is the separate aftermarket
 * brand, matching how P550832 already keeps them apart).
 *
 * P579275 is intentionally left out: Fleetguard's own site confirms it
 * knows the part but has no active crossref, so {} is the correct value,
 * not a gap to fill.
 *
 * A disputed OEM block (Ford/Land Rover/Citroen/AL Filter/etc.) was also
 * pasted for P583711, but it reads like a European passenger-car oil
 * filter, not a match for a Baldwin P40151-class HD lube filter -- left
 * out pending confirmation it isn't a cross-contaminated paste from a
 * different browser tab.
 *
 * Run once: node apply-manual-lube-crossrefs.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PROGRESS_FILE = path.join(ROOT, 'donaldson_lube_crossref_progress.json');
const RESULTS_FILE = path.join(ROOT, 'donaldson_lube_results.json');

const MANUAL_CROSSREFS = {
  P579787: { FLEETGUARD: ['LF16392'] },
  P580781: { BALDWIN: ['BC40009'], WIX: ['WL10895'], FLEETGUARD: ['CS41047'] },
  P580794: { FLEETGUARD: ['LF17536A'], WIX: ['WL10084'], BALDWIN: ['P40017'] },
  P583710: { FLEETGUARD: ['LF16424'], WIX: ['WL10010'], BALDWIN: ['P9600'] },
  P583711: { BALDWIN: ['P40151'], WIX: ['WL7490'], NAPA: ['107490'] },
  P583712: {
    MOTORCRAFT: ['FL2062'],
    FORD: ['FT4Z-6731-A'],
    BALDWIN: ['P40033'],
    WIX: ['WL10050'],
    NAPA: ['100050'],
    'PREMIUM-GUARD': ['PG8154'],
  },
  P583713: {
    FORD: ['KX6Z-6731-A'],
    FRAM: ['CH11747ECO'],
    MAHLE: ['OX 1129 D', 'OX1129DECO'],
    HENGST: ['E835HD328'],
    BALDWIN: ['P40034'],
    WIX: ['WL10051'],
    NAPA: ['100051'],
  },
  P583936: {
    FLEETGUARD: ['LF17583'],
    BALDWIN: ['B7499'],
    WIX: ['WL10181', 'SL10181'],
    NAPA: ['400181'],
    'CASE-IH': ['48138563'],
    'NEW-HOLLAND': ['5802284013'],
    CARQUEST: ['94123'],
  },
  P584244: { BALDWIN: ['B40158'], CATERPILLAR: ['5580428'] },
  P584522: {
    'AC-DELCO': ['PF26'],
    'GENERAL-MOTORS': ['12684038', '89017527'],
    BALDWIN: ['B40150'],
    FLEETGUARD: ['LF16511'],
    NAPA: ['100454'],
  },
  P584944: {
    BALDWIN: ['P40035'],
    WIX: ['WL10052'],
    NAPA: ['100052'],
    FRAM: ['CH11748ECO'],
    MAHLE: ['OX 1130 D', 'OX1130DECO'],
    HENGST: ['E836HD332'],
    FORD: ['LC3Z-6731-A'],
  },
  P585315: {
    BALDWIN: ['P40036'],
    WIX: ['WL10053'],
    NAPA: ['100053'],
    FRAM: ['CH11749ECO'],
    MAHLE: ['OX 1131 D', 'OX1131DECO'],
    HENGST: ['E837HD335'],
    FORD: ['ML3Z-6731-A'],
  },
  P959217: {
    BALDWIN: ['P40037'],
    WIX: ['WL10054'],
    NAPA: ['100054'],
    FRAM: ['CH11750ECO'],
    MAHLE: ['OX 1132 D', 'OX1132DECO'],
    HENGST: ['E838HD338'],
    FORD: ['NC3Z-6731-A'],
  },
  P959218: {
    BALDWIN: ['P40038'],
    WIX: ['WL10055'],
    NAPA: ['100055'],
    FRAM: ['CH11751ECO'],
    MAHLE: ['OX 1133 D', 'OX1133DECO'],
    HENGST: ['E839HD341'],
    FORD: ['PC3Z-6731-A'],
  },
  P959772: {
    BALDWIN: ['P40039'],
    WIX: ['WL10056'],
    NAPA: ['100056'],
    FRAM: ['CH11752ECO'],
    MAHLE: ['OX 1134 D', 'OX1134DECO'],
    HENGST: ['E840HD344'],
    FORD: ['RC3Z-6731-A'],
  },
};

const progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
const results = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf8'));
const resultsByCode = new Map(results.map((r) => [r.part_number, r]));

for (const [code, refs] of Object.entries(MANUAL_CROSSREFS)) {
  const existing = progress[code];
  if (existing && Object.keys(existing).length > 0) {
    throw new Error(`${code} already has crossrefs, refusing to overwrite`);
  }
  progress[code] = refs;
  const rec = resultsByCode.get(code);
  if (!rec) throw new Error(`${code} not found in results file`);
  rec.brand_crossrefs = refs;
  console.log(`${code} <- ${Object.keys(refs).length} brands (manual lookup)`);
}

fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
console.log('Done.');
