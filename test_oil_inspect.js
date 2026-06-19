// On oilfilter-crossreference.com, cross-refs use different link pattern
// Let's look for ALL anchor hrefs and list-items near brand/code
const hdrs = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'text/html'
};

fetch('https://www.oilfilter-crossreference.com/convert/MANN-FILTER/W71295', { headers: hdrs })
  .then(r => r.text())
  .then(html => {
    // Look for the cross-reference section which should list brands and codes
    // Search the area between the specs section and the vehicle table
    const dtIdx = html.indexOf('<dt>');
    const tbodyIdx = html.indexOf('<tbody');
    
    if (dtIdx > -1 && tbodyIdx > -1) {
      const between = html.slice(dtIdx, tbodyIdx);
      console.log('=== BETWEEN SPECS AND TABLE ===');
      console.log(between.slice(0, 5000));
    }
  });
