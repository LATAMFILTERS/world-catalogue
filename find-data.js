const https = require('https');

function fetch(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function analyze(label, url, knownBrands) {
  console.log(`\n=== ${label} ===`);
  const html = await fetch(url);
  console.log(`Total bytes: ${html.length}`);

  // Buscar script tags con contenido (no src)
  const inlineScripts = html.match(/<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi) || [];
  console.log(`Scripts inline: ${inlineScripts.length}`);
  inlineScripts.forEach((s, i) => {
    if (s.length > 200) {
      console.log(`\n  Script ${i+1} (${s.length} bytes):`);
      console.log('  ' + s.substring(0, 400));
    }
  });

  // Buscar marcas conocidas de filtros
  for (const brand of knownBrands) {
    const idx = html.indexOf(brand);
    if (idx >= 0) {
      console.log(`\n  MARCA "${brand}" encontrada en pos ${idx}:`);
      console.log('  ' + html.substring(Math.max(0, idx-50), idx+150));
      break;
    }
  }

  // Buscar patrones tipo lista o div con filtros
  const listItems = html.match(/<li[^>]*>[\s\S]{5,80}<\/li>/gi) || [];
  if (listItems.length > 0) {
    console.log(`\n  Items de lista: ${listItems.length}`);
    listItems.slice(0, 5).forEach(li => console.log('  ', li.replace(/<[^>]+>/g, '').trim()));
  }
}

async function main() {
  const brands = ['FLEETGUARD', 'MANN', 'BALDWIN', 'WIX', 'FRAM', 'PUROLATOR', 'RACOR', 'PARKER'];

  await analyze('FUEL P550440', 'https://www.fuelfilter-crossreference.com/convert/DONALDSON/P550440', brands);
  await analyze('AIR P527682',  'https://www.airfilter-crossreference.com/convert/DONALDSON/P527682', brands);
  await analyze('OIL P552100',  'https://www.oilfilter-crossreference.com/convert/DONALDSON/P552100', brands);
}

main().catch(e => console.error(e.message));
