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
  const urls = [
    'https://www.airfilter-crossreference.com/convert/DONALDSON/P527682',
    'https://www.fuelfilter-crossreference.com/convert/DONALDSON/P550440',
    'https://www.oilfilter-crossreference.com/convert/DONALDSON/P552100'
  ];

  for (const url of urls) {
    console.log('\n=== ' + url + ' ===');
    try {
      const { status, body } = await fetchPage(url);
      console.log('Status:', status);
      // Busca tabla en el HTML
      const hasTable = body.includes('<table');
      const hasTr = body.includes('<tr');
      const hasTd = body.includes('<td');
      console.log('Tiene <table>:', hasTable);
      console.log('Tiene <tr>:', hasTr);
      console.log('Tiene <td>:', hasTd);
      // Muestra fragmento alrededor de <table> o primeros 800 chars
      const tableIdx = body.indexOf('<table');
      if (tableIdx >= 0) {
        console.log('HTML alrededor de <table>:');
        console.log(body.substring(tableIdx, tableIdx + 1000));
      } else {
        console.log('Primeros 800 chars:');
        console.log(body.substring(0, 800));
      }
    } catch (e) {
      console.log('Error:', e.message);
    }
  }
}

main();
