const https = require('https');

function fetch(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json, text/html, */*',
        'X-Requested-With': 'XMLHttpRequest'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function tryUrl(url) {
  try {
    const { status, body, headers } = await fetch(url);
    const ct = headers['content-type'] || '';
    const isJson = ct.includes('json') || body.trim().startsWith('[') || body.trim().startsWith('{');
    console.log(`[${status}] ${ct.split(';')[0]} | ${isJson ? 'JSON!' : 'no json'} | ${body.length} bytes | ${url}`);
    if (isJson && body.length > 50) {
      console.log('  → DATOS:', body.substring(0, 300));
    }
  } catch (e) {
    console.log(`[ERR] ${e.message} | ${url}`);
  }
}

async function main() {
  const sku = 'P550440';
  const sites = [
    { domain: 'fuelfilter-crossreference.com', label: 'FUEL' },
    { domain: 'airfilter-crossreference.com',  label: 'AIR',  sku: 'P527682' },
    { domain: 'oilfilter-crossreference.com',  label: 'OIL',  sku: 'P552100' }
  ];

  for (const site of sites) {
    const s = site.sku || sku;
    console.log(`\n=== ${site.label} (${s}) ===`);
    await tryUrl(`https://www.${site.domain}/api/convert/DONALDSON/${s}`);
    await tryUrl(`https://www.${site.domain}/api/crossreference/DONALDSON/${s}`);
    await tryUrl(`https://www.${site.domain}/api/filters/DONALDSON/${s}`);
    await tryUrl(`https://www.${site.domain}/convert/DONALDSON/${s}.json`);
    await tryUrl(`https://www.${site.domain}/data/DONALDSON/${s}`);
    await tryUrl(`https://api.${site.domain}/convert/DONALDSON/${s}`);
  }

  // Buscar scripts en el HTML del fuel site para encontrar el endpoint real
  console.log('\n=== SCRIPTS en fuel filter ===');
  const { body } = await fetch(`https://www.fuelfilter-crossreference.com/convert/DONALDSON/P550440`);
  const scripts = body.match(/<script[^>]*src="([^"]+)"/gi) || [];
  scripts.forEach(s => console.log(' ', s));
  const inlineApis = body.match(/(fetch|ajax|get|post|axios)\s*\(['"](\/[^'"]+)['"]/gi) || [];
  inlineApis.forEach(s => console.log('  API call:', s));
}

main().catch(e => console.error(e.message));
