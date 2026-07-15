const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'server-original.js');
let source = fs.readFileSync(target, 'utf8');
let changed = false;

// Install a generation/year guard directly inside scoreApplication. This avoids
// relying on malformed imported year ranges such as E210 "08/10 →".
const scoreAnchor = `        const year = yearEvidence(application, requestedYear);
        if (!year.covers) return -1000;`;

const guardedScore = `        const generationModel = normalizeVehicleText([
          application?.model,
          application?.model_family,
          application?.model_type
        ].filter(Boolean).join(' '));
        if (make === 'TOYOTA' && generationModel.includes('COROLLA')) {
          if (/\\bE210\\b/.test(generationModel) && requestedYear < 2018) return -1000;
          if (/\\bE14\\b|\\bE15\\b/.test(generationModel) && requestedYear > 2013) return -1000;
        }

        const year = yearEvidence(application, requestedYear);
        if (!year.covers) return -1000;`;

if (source.includes(scoreAnchor) && !source.includes("generationModel.includes('COROLLA')")) {
  source = source.replace(scoreAnchor, guardedScore);
  changed = true;
}

// Add a visible logic version to the successful and no-match responses so the
// phone test proves which deployment is actually serving the request.
source = source.replace(
  "source: 'vehicle_natural_language_ranked',",
  "source: 'vehicle_natural_language_ranked',\n          vehicle_logic_version: '20260714-generation-v2',"
);
source = source.replace(
  "source: 'vehicle_no_match',",
  "source: 'vehicle_no_match',\n        vehicle_logic_version: '20260714-generation-v2',"
);

if (!source.includes("generationModel.includes('COROLLA')")) {
  throw new Error('Inline Corolla generation guard was not applied');
}
if (!source.includes("vehicle_logic_version: '20260714-generation-v2'")) {
  throw new Error('Vehicle logic deployment marker was not applied');
}

if (changed || !fs.readFileSync(target, 'utf8').includes("vehicle_logic_version: '20260714-generation-v2'")) {
  fs.writeFileSync(target, source, 'utf8');
}
console.log('[vehicle-chat-search] generation/year sanity v2 enabled');