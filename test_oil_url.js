// Test oil filter URL pattern
const sku = 'W71295';
const url = 'https://www.oilfilter-crossreference.com/filter/MANN-FILTER/' + sku;

fetch(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html'
  }
}).then(r => {
  console.log('OIL STATUS:', r.status, 'URL:', url);
  return r.text();
}).then(html => {
  console.log('HTML LENGTH:', html.length);
  const hasTable = html.includes('<tbody');
  const hasSpec = html.includes('spec-item') || html.includes('Height') || html.includes('Inner Diameter');
  const hasCross = html.includes('/filter/');
  console.log('Has table:', hasTable, '| Has specs:', hasSpec, '| Has cross-refs:', hasCross);
  
  // Inspect a snippet
  const tbodyIdx = html.indexOf('<tbody');
  if (tbodyIdx > -1) console.log('TBODY:', html.slice(tbodyIdx, tbodyIdx + 400));
  
  // Check spec area
  const specIdx = html.indexOf('spec-item');
  if (specIdx > -1) console.log('SPEC AREA:', html.slice(Math.max(0,specIdx-50), specIdx+300));
}).catch(e => console.error('ERROR:', e.message));
