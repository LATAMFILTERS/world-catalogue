const fs = require('fs');

const engineering = fs.readFileSync('frontend/src/lib/canonical-engineering.ts', 'utf8');
const families = fs.readFileSync('frontend/src/lib/product-families-data.ts', 'utf8');

describe('TURBOCORE element family and micron-grade governance', () => {
  test('2010/2020/2040 identify element families, not micron ratings', () => {
    expect(engineering).toContain('2010 serves the 500-series architecture');
    expect(engineering).toContain('2020 the 1000-series architecture');
    expect(engineering).toContain('2040 the 900-series architecture');
    expect(families).toContain('The 2010/2020/2040 number never defines the micron rating by itself.');
  });

  test('each governed family can carry approved 2, 10 or 30 micron grades', () => {
    expect(engineering).toContain('each family may be specified in 2, 10 or 30 µm grades where approved');
    expect(families).toContain('2 µm is final filtration, 10 µm secondary filtration, and 30 µm primary filtration');
  });

  test('historical suffixes remain mapped independently from family number', () => {
    expect(engineering).toContain('Historical SM/TM/PM suffixes correspond to 2/10/30 µm respectively');
    expect(families).toContain('Historical SM/TM/PM suffixes map to 2/10/30 µm');
  });
});
