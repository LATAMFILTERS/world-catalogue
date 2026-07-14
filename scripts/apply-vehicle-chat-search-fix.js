const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'server-original.js');
const fragmentPath = path.join(__dirname, 'vehicle-chat-search-fragment.txt');
const marker = '// VEHICLE_CHAT_SEARCH_FIX_20260714';

let source = fs.readFileSync(target, 'utf8');
if (source.includes(marker)) {
  console.log('[vehicle-chat-search] patch already applied');
  process.exit(0);
}

const anchor = "    const q = raw.toUpperCase().replace(/[-\\s]/g, '');\n";
if (!source.includes(anchor)) {
  throw new Error('Vehicle search patch anchor not found in server-original.js');
}

const fragment = fs.readFileSync(fragmentPath, 'utf8');
if (!fragment.includes(marker)) {
  throw new Error('Vehicle search fragment marker missing');
}

source = source.replace(anchor, fragment);
fs.writeFileSync(target, source, 'utf8');
console.log('[vehicle-chat-search] natural-language vehicle lookup added to /api/search');
