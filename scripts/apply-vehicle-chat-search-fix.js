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

if (changed) fs.writeFileSync(target, source, 'utf8');
