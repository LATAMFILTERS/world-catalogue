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
} else if (!source.includes('strict year proximity ranking enabled') && !source.includes('const sourceYears = String(application?.year_range')) {
  throw new Error('Vehicle relevance score block not found');
}

source = source.replace('.filter(item => item.score >= bestScore - 15)', '.filter(item => item.score >= bestScore - 8)');
source = source.replace('vehicleProducts.filter(product => product.relevance_score >= topScore - 20)', 'vehicleProducts.filter(product => product.relevance_score >= topScore - 8)');
source = source.replace('const engineOptions = [...engineMap.values()].slice(0, 8);', 'const engineOptions = [...engineMap.values()].slice(0, 5);');

if (source.includes('bestScore - 15') || source.includes('topScore - 20')) {
  throw new Error('Loose vehicle ranking thresholds remain');
}

if (changed) fs.writeFileSync(target, source, 'utf8');
