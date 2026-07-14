const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'server-original.js');
const fragmentPath = path.join(__dirname, 'vehicle-chat-search-fragment.txt');
const marker = '// VEHICLE_CHAT_SEARCH_FIX_20260714';

let source = fs.readFileSync(target, 'utf8');
let changed = false;

// Production schema stores description as TEXT. Older backend code treated it
// as JSONB and used description->>'en', causing every ordinary no-match search
// (for example "Caterpillar 320D") to return HTTP 500.
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

if (changed) fs.writeFileSync(target, source, 'utf8');
