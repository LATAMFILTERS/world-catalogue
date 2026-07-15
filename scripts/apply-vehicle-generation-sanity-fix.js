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
          if (/\\bE12\\b|\\bE13\\b/.test(generationModel) && requestedYear > 2008) return -1000;
          if (/\\bE20\\b|\\bE30\\b|\\bE40\\b|\\bE50\\b|\\bE60\\b|\\bE70\\b/.test(generationModel)) return -1000;
        }

        const year = yearEvidence(application, requestedYear);
        // A make/model/year query must fail closed when the imported application
        // has no explicit year or range. Otherwise legacy records from unrelated
        // generations are treated as valid for every model year.
        if (!year.covers || !year.explicit) return -1000;`;

if (source.includes(scoreAnchor) && !source.includes("generationModel.includes('COROLLA')")) {
  source = source.replace(scoreAnchor, guardedScore);
  changed = true;
} else {
  // Upgrade an already-installed v2 guard to fail closed on missing year evidence.
  source = source.replace(
    '        if (!year.covers) return -1000;',
    '        if (!year.covers || !year.explicit) return -1000;'
  );
  source = source.replace(
    "          if (/\\bE14\\b|\\bE15\\b/.test(generationModel) && requestedYear > 2013) return -1000;",
    "          if (/\\bE14\\b|\\bE15\\b/.test(generationModel) && requestedYear > 2013) return -1000;\n          if (/\\bE12\\b|\\bE13\\b/.test(generationModel) && requestedYear > 2008) return -1000;\n          if (/\\bE20\\b|\\bE30\\b|\\bE40\\b|\\bE50\\b|\\bE60\\b|\\bE70\\b/.test(generationModel)) return -1000;"
  );
}

// Add a visible logic version to successful and no-match responses so the
// phone test proves which deployment is actually serving the request.
source = source.replace(/vehicle_logic_version: '20260714-generation-v2',/g, "vehicle_logic_version: '20260714-year-evidence-v3',");
source = source.replace(
  "source: 'vehicle_natural_language_ranked',",
  "source: 'vehicle_natural_language_ranked',\n          vehicle_logic_version: '20260714-year-evidence-v3',"
);
source = source.replace(
  "source: 'vehicle_no_match',",
  "source: 'vehicle_no_match',\n        vehicle_logic_version: '20260714-year-evidence-v3',"
);

if (!source.includes("generationModel.includes('COROLLA')")) {
  throw new Error('Inline Corolla generation guard was not applied');
}
if (!source.includes('if (!year.covers || !year.explicit) return -1000;')) {
  throw new Error('Fail-closed year evidence guard was not applied');
}
if (!source.includes("vehicle_logic_version: '20260714-year-evidence-v3'")) {
  throw new Error('Vehicle logic deployment marker was not applied');
}

fs.writeFileSync(target, source, 'utf8');
console.log('[vehicle-chat-search] explicit year evidence v3 enabled');
