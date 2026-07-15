const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'server-original.js');
let source = fs.readFileSync(target, 'utf8');
let changed = false;

const marketFunctionEnd = `      const applicationMarket = (application) => {
        const text = normalizeVehicleText([
          application?.market,
          application?.region,
          application?.model,
          application?.notes
        ].filter(Boolean).join(' '));
        if (/\\b(USA|US|NORTH AMERICA|CANADA|MEXICO)\\b/.test(text)) return 'US';
        if (/\\b(EUROPE|EUROPEAN|EUROPA|E18|D 4D)\\b/.test(text)) return 'EU';
        return 'unknown';
      };`;

const generationBlock = `${marketFunctionEnd}

      const generationYearCompatible = (application) => {
        const make = normalizeVehicleText(application?.make);
        const model = normalizeVehicleText([
          application?.model,
          application?.model_family,
          application?.model_type
        ].filter(Boolean).join(' '));

        // Toyota Corolla E210 started after the 2017 model year. Some imported
        // records contain malformed open-ended dates such as 08/10, so the
        // generation code must override that bad range rather than surface a
        // newer-generation engine for a 2017 query.
        if (make === 'TOYOTA' && model.includes('COROLLA')) {
          if (/\\bE210\\b/.test(model) && requestedYear < 2018) return false;
          if (/\\bE14\\b|\\bE15\\b/.test(model) && requestedYear > 2013) return false;
        }

        return true;
      };`;

if (source.includes(marketFunctionEnd) && !source.includes('const generationYearCompatible =')) {
  source = source.replace(marketFunctionEnd, generationBlock);
  changed = true;
  console.log('[vehicle-chat-search] generation/year sanity registry enabled');
}

const gateAnchor = `        const fuel = applicationFuel(application);
        const market = applicationMarket(application);
        if (requestedFuel === 'gasoline' && fuel === 'diesel') return -1000;`;

const gateWithGeneration = `        const fuel = applicationFuel(application);
        const market = applicationMarket(application);
        if (!generationYearCompatible(application)) return -1000;
        if (requestedFuel === 'gasoline' && fuel === 'diesel') return -1000;`;

if (source.includes(gateAnchor) && !source.includes('if (!generationYearCompatible(application))')) {
  source = source.replace(gateAnchor, gateWithGeneration);
  changed = true;
}

if (!source.includes('const generationYearCompatible =') || !source.includes('if (!generationYearCompatible(application))')) {
  throw new Error('Vehicle generation sanity checks were not applied');
}

if (changed) fs.writeFileSync(target, source, 'utf8');
