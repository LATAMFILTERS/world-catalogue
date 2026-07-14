const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'server-original.js');
const fragmentPath = path.join(__dirname, 'vehicle-chat-search-fragment.txt');
const marker = '// VEHICLE_CHAT_SEARCH_FIX_20260714';

let source = fs.readFileSync(target, 'utf8');
let changed = false;

// Production schema stores description as TEXT. Older backend code treated it
// as JSONB and used description->>'en', causing ordinary no-match searches to fail.
const badDescriptionSearch = `to_tsvector('english',
          COALESCE(description->>'en', '') || ' ' || COALESCE(description->>'es', '')
        ) @@ plainto_tsquery('english', $1)`;
const safeDescriptionSearch = `to_tsvector('english', COALESCE(description::text, ''))
          @@ plainto_tsquery('english', $1)`;
if (source.includes(badDescriptionSearch)) {
  source = source.replace(badDescriptionSearch, safeDescriptionSearch);
  changed = true;
  console.log('[vehicle-chat-search] text description search corrected');
}

if (!source.includes(marker)) {
  const anchor = "    const q = raw.toUpperCase().replace(/[-\\s]/g, '');\n";
  if (!source.includes(anchor)) {
    throw new Error('Vehicle search patch anchor not found in server-original.js');
  }

  const fragment = fs.readFileSync(fragmentPath, 'utf8');
  if (!fragment.includes(marker)) {
    throw new Error('Vehicle search fragment marker missing');
  }

  source = source.replace(anchor, fragment);
  changed = true;
  console.log('[vehicle-chat-search] natural-language vehicle lookup added to /api/search');
} else {
  console.log('[vehicle-chat-search] vehicle lookup already present');
}

// Replace the unindexed full-column JSON text scan. The previous query converted
// every vehicle_applications value to text and timed out. This query first uses
// exact JSONB containment for the make, then inspects only that make's rows.
const slowVehicleQuery = `        vehicleRows = await client.query(
          \`SELECT c.*
           FROM elimfilters_catalog c
           WHERE c.vehicle_applications IS NOT NULL
             AND jsonb_typeof(c.vehicle_applications) = 'array'
             AND POSITION($1::text IN UPPER(c.vehicle_applications::text)) > 0
           ORDER BY c.sku
           LIMIT 750\`,
          [primaryToken]
        );`;

const fastVehicleQuery = `        const modelToken = uniqueTokens[1] || '';
        vehicleRows = await client.query(
          \`SELECT c.*
           FROM elimfilters_catalog c
           WHERE c.duty = 'LIGHT_DUTY'
             AND c.vehicle_applications IS NOT NULL
             AND jsonb_typeof(c.vehicle_applications) = 'array'
             AND c.vehicle_applications @> jsonb_build_array(jsonb_build_object('make', $1::text))
             AND EXISTS (
               SELECT 1
               FROM jsonb_array_elements(c.vehicle_applications) AS va
               WHERE UPPER(
                 COALESCE(va->>'model','') || ' ' ||
                 COALESCE(va->>'model_family','') || ' ' ||
                 COALESCE(va->>'model_type','')
               ) LIKE $2::text
             )
           ORDER BY c.sku
           LIMIT 120\`,
          [primaryToken, '%' + modelToken + '%']
        );`;

if (source.includes(slowVehicleQuery)) {
  source = source.replace(slowVehicleQuery, fastVehicleQuery);
  changed = true;
  console.log('[vehicle-chat-search] vehicle query optimized for JSONB make/model lookup');
} else if (source.includes('POSITION($1::text IN UPPER(c.vehicle_applications::text))')) {
  throw new Error('Slow vehicle query remains but exact replacement block was not found');
}

// Open-ended legacy ranges such as "01/98 →" were previously treated as valid
// forever. Rank by proximity to the requested year and reject implausibly old
// open-ended applications so a 2017 query does not surface 1998/2006 generations.
const oldScoreBlock = `        let score = 0;
        score += year.explicit ? 60 : 5;
        if (model === modelToken) score += 35;
        else if (model.startsWith(modelToken + ' ')) score += 25;
        else score += 15;

        const queryHasCross = uniqueTokens.includes('CROSS');
        if (!queryHasCross && modelToken === 'COROLLA' && /\\bCOROLLA CROSS\\b/.test(model)) score -= 45;
        if (application?.engine_code || application?.engine) score += 8;
        if (application?.ccm) score += 4;
        return score;`;

const newScoreBlock = `        const sourceYears = String(application?.year_range || application?.year || '').trim();
        const datedStart = sourceYears.match(/\\b\\d{1,2}\\/(\\d{2}|\\d{4})\\b/);
        const fullStart = sourceYears.match(/\\b(19\\d{2}|20\\d{2})\\b/);
        const startYear = datedStart ? expandYear(datedStart[1]) : (fullStart ? Number(fullStart[1]) : null);
        const isOpenEnded = (sourceYears.includes('→') || sourceYears.includes('->')) &&
          !/\\b\\d{1,2}\\/(?:\\d{2}|\\d{4})\\s*(?:→|->)\\s*\\d{1,2}\\/(?:\\d{2}|\\d{4})\\b/.test(sourceYears);
        const ageGap = startYear ? requestedYear - startYear : null;
        if (isOpenEnded && ageGap !== null && ageGap > 12) return -1000;

        let score = 0;
        score += year.explicit ? 60 : 5;
        if (ageGap !== null && ageGap >= 0) score += Math.max(0, 32 - (ageGap * 4));
        if (model === modelToken) score += 35;
        else if (model.startsWith(modelToken + ' ')) score += 25;
        else score += 15;

        const queryHasCross = uniqueTokens.includes('CROSS');
        if (!queryHasCross && modelToken === 'COROLLA' && /\\bCOROLLA CROSS\\b/.test(model)) score -= 45;
        if (application?.engine_code || application?.engine) score += 8;
        if (application?.ccm) score += 4;
        return score;`;

if (source.includes(oldScoreBlock)) {
  source = source.replace(oldScoreBlock, newScoreBlock);
  changed = true;
  console.log('[vehicle-chat-search] strict year proximity ranking enabled');
} else if (!source.includes('const sourceYears = String(application?.year_range')) {
  throw new Error('Vehicle relevance score block not found');
}

source = source.replace('.filter(item => item.score >= bestScore - 15)', '.filter(item => item.score >= bestScore - 8)');
source = source.replace('vehicleProducts.filter(product => product.relevance_score >= topScore - 20)', 'vehicleProducts.filter(product => product.relevance_score >= topScore - 8)');
source = source.replace('const engineOptions = [...engineMap.values()].slice(0, 8);', 'const engineOptions = [...engineMap.values()].slice(0, 5);');

// A generic make/model/year query must never be treated as exact merely because
// the current catalogue happens to contain one engine. Ask the customer to confirm
// that engine (or market) before presenting the provisional filters as exact.
source = source.replace(
  'const needsEngineConfirmation = engineOptions.length > 1;',
  `const queryIncludesEngine = uniqueTokens.slice(2).some(token =>
          engineOptions.some(engine => normalizeVehicleText(engine).includes(token))
        );
        const needsEngineConfirmation = engineOptions.length > 0 && !queryIncludesEngine;`
);
source = source.replace(
  '? `Encontré varias motorizaciones para ${makeToken} ${modelToken} ${requestedYear}. Confirma el motor para darte los filtros exactos.`',
  '? `Encontré una o más aplicaciones posibles para ${makeToken} ${modelToken} ${requestedYear}. Confirma el motor o el mercado del vehículo para darte los filtros exactos.`'
);
source = source.replace(
  '? `I found several engines for ${makeToken} ${modelToken} ${requestedYear}. Confirm the engine for exact filters.`',
  '? `I found one or more possible applications for ${makeToken} ${modelToken} ${requestedYear}. Confirm the engine or vehicle market for exact filters.`'
);
source = source.replace(
  'engine_options: engineOptions,',
  "engine_options: engineOptions,\n          confirmation_required: needsEngineConfirmation ? 'engine_or_market' : null,"
);

// LD passenger-vehicle searches default to gasoline and North American market
// unless the customer explicitly requests diesel or another market. This prevents
// European diesel applications from becoming the primary answer for a generic
// Toyota Corolla query in the public US catalogue experience.
const marketAnchor = `      const normalizeVehicleText = (value) => String(value || '')
        .normalize('NFKD')
        .replace(/[\\u0300-\\u036f]/g, '')
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, ' ')
        .trim();`;

const marketBlock = `${marketAnchor}

      const normalizedVehicleQuery = normalizeVehicleText(raw);
      const requestedFuel = /\\b(DIESEL|DIESEL|D 4D|TDI|HDI|CDI|DCI|CRDI|TDCI)\\b/.test(normalizedVehicleQuery)
        ? 'diesel'
        : /\\b(GASOLINE|GASOLINA|PETROL|VVT|VVT I|VALVEMATIC)\\b/.test(normalizedVehicleQuery)
          ? 'gasoline'
          : 'gasoline';
      const requestedMarket = /\\b(EUROPE|EUROPA|EUROPEAN|EUROPEO)\\b/.test(normalizedVehicleQuery)
        ? 'EU'
        : /\\b(USA|US|UNITED STATES|ESTADOS UNIDOS|NORTH AMERICA|NORTEAMERICA)\\b/.test(normalizedVehicleQuery)
          ? 'US'
          : 'US';

      const applicationFuel = (application) => {
        const text = normalizeVehicleText([
          application?.model,
          application?.model_type,
          application?.engine_code,
          application?.engine
        ].filter(Boolean).join(' '));
        if (/\\b(DIESEL|D 4D|TDI|HDI|CDI|DCI|CRDI|TDCI|1ND TV|2AD FHV|2AD FTV)\\b/.test(text)) return 'diesel';
        if (/\\b(GASOLINE|PETROL|VVT|VVT I|VALVEMATIC|EFI)\\b/.test(text)) return 'gasoline';
        return 'unknown';
      };

      const applicationMarket = (application) => {
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

if (source.includes(marketAnchor) && !source.includes('const requestedFuel =')) {
  source = source.replace(marketAnchor, marketBlock);
  changed = true;
  console.log('[vehicle-chat-search] LD market and fuel context enabled');
}

const yearScoreAnchor = `        const year = yearEvidence(application, requestedYear);
        if (!year.covers) return -1000;`;
const fuelMarketGate = `${yearScoreAnchor}

        const fuel = applicationFuel(application);
        const market = applicationMarket(application);
        if (requestedFuel === 'gasoline' && fuel === 'diesel') return -1000;
        if (requestedFuel === 'diesel' && fuel === 'gasoline') return -1000;
        if (requestedMarket === 'US' && market === 'EU') return -1000;`;
if (source.includes(yearScoreAnchor) && !source.includes("requestedFuel === 'gasoline'")) {
  source = source.replace(yearScoreAnchor, fuelMarketGate);
  changed = true;
}

const returnScoreAnchor = `        if (application?.engine_code || application?.engine) score += 8;
        if (application?.ccm) score += 4;
        return score;`;
const returnScoreWithContext = `        if (application?.engine_code || application?.engine) score += 8;
        if (application?.ccm) score += 4;
        if (fuel === requestedFuel) score += 30;
        if (market === requestedMarket) score += 25;
        return score;`;
if (source.includes(returnScoreAnchor) && !source.includes('if (fuel === requestedFuel)')) {
  source = source.replace(returnScoreAnchor, returnScoreWithContext);
  changed = true;
}

source = source.replace(
  "vehicle: { make: makeToken, model: modelToken, year: requestedYear },\n          message,",
  "vehicle: { make: makeToken, model: modelToken, year: requestedYear },\n          selection_context: { duty: 'LIGHT_DUTY', fuel: requestedFuel, market: requestedMarket },\n          message,"
);
source = source.replace(
  "vehicle: { make: makeToken, model: modelToken, year: requestedYear },\n        message: lang === 'es' ? 'No encontré una aplicación confirmada para ese vehículo.'",
  "vehicle: { make: makeToken, model: modelToken, year: requestedYear },\n        selection_context: { duty: 'LIGHT_DUTY', fuel: requestedFuel, market: requestedMarket },\n        coverage_status: 'missing_confirmed_market_fuel_application',\n        message: lang === 'es' ? 'No encontré una aplicación confirmada de gasolina para ese vehículo y mercado. No mostraré aplicaciones diésel como sustituto.'"
);
source = source.replace(
  ": 'No confirmed application was found for that vehicle.',",
  ": 'No confirmed gasoline application was found for that vehicle and market. Diesel applications will not be shown as substitutes.',"
);

if (source.includes('bestScore - 15') || source.includes('topScore - 20')) {
  throw new Error('Loose vehicle ranking thresholds remain');
}
if (source.includes('const needsEngineConfirmation = engineOptions.length > 1;')) {
  throw new Error('Unsafe single-engine auto-confirmation remains');
}
if (!source.includes('const requestedFuel =') || !source.includes("requestedFuel === 'gasoline'")) {
  throw new Error('LD market/fuel safeguards were not applied');
}

if (changed) fs.writeFileSync(target, source, 'utf8');
