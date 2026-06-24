// Quick test of the app row parser fix
const hdrs = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'text/html'
};

fetch('https://www.airfilter-crossreference.com/convert/MANN/C28125', { headers: hdrs })
  .then(r => r.text())
  .then(html => {
    // Extract tbody content
    const tbodyRe = /<tbody>([\s\S]*?)<\/tbody>/g;
    let m = tbodyRe.exec(html);
    if (!m) { console.log('NO TBODY'); return; }
    const tbody = m[1];
    
    // Parse rows - cells may have newlines/spaces
    const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
    const cellRe = /<td[^>]*>([\s\S]*?)<\/td>/g;
    const rows = [];
    let rowM;
    while ((rowM = rowRe.exec(tbody)) !== null) {
      const cells = [];
      let cellM;
      const cellReCopy = new RegExp(cellRe.source, 'g');
      while ((cellM = cellReCopy.exec(rowM[1])) !== null) {
        cells.push(cellM[1].replace(/[\s\n\r]+/g, ' ').trim());
      }
      if (cells.length >= 4 && cells[0]) rows.push(cells);
    }
    console.log('ROW COUNT:', rows.length);
    console.log('FIRST 3 ROWS:', JSON.stringify(rows.slice(0,3), null, 2));
  });
