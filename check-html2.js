const https = require('https');

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml'
      }
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302)
        return fetchPage(res.headers.location).then(resolve).catch(reject);
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function main() {
  // Fuel - buscar donde estan los codigos de filtros equivalentes
  console.log('=== FUEL FILTER - HTML completo ===\n');
  const { body } = await fetchPage('https://www.fuelfilter-crossreference.com/convert/DONALDSON/P550440');

  // Buscar todas las tablas
  const tables = body.match(/<table[\s\S]*?<\/table>/gi) || [];
  console.log(`Tablas encontradas: ${tables.length}`);
  tables.forEach((t, i) => {
    console.log(`\n--- Tabla ${i+1} (primeros 600 chars) ---`);
    console.log(t.substring(0, 600));
  });

  // Buscar sección de cross-reference (puede ser una lista, div, etc)
  const pIdx = body.indexOf('P550440');
  const crossIdx = body.toLowerCase().indexOf('cross');
  const altIdx = body.toLowerCase().indexOf('altern');
  const replIdx = body.toLowerCase().indexOf('replac');

  console.log('\n--- Contexto alrededor de "cross" ---');
  if (crossIdx >= 0) console.log(body.substring(Math.max(0, crossIdx-100), crossIdx+500));

  console.log('\n--- Contexto alrededor de "replac" ---');
  if (replIdx >= 0) console.log(body.substring(Math.max(0, replIdx-100), replIdx+500));

  // Buscar JSON embebido
  const jsonMatches = body.match(/\{[^{}]{100,}\}/g) || [];
  console.log(`\nJSONs embebidos: ${jsonMatches.length}`);
  jsonMatches.slice(0, 3).forEach((j, i) => {
    console.log(`\nJSON ${i+1}: ${j.substring(0, 300)}`);
  });
}

main().catch(e => console.error(e.message));
