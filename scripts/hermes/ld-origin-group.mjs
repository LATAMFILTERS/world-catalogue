// Vehicle origin group of an LD application payload (policy 2026-10-04: European vehicles -> MANN base,
// non-European -> FRAM base). EUROPEAN when more than half of the rows are European makes.
const EUROPEAN = ['AUDI','BMW','MINI','MERCEDES','SMART','VOLKSWAGEN','VW','SEAT','CUPRA','SKODA','PORSCHE','OPEL','VAUXHALL',
  'PEUGEOT','CITROEN','DS AUTOMOBILES','RENAULT','DACIA','FIAT','ALFA ROMEO','LANCIA','ABARTH','FERRARI','MASERATI','LAMBORGHINI',
  'VOLVO','SAAB','JAGUAR','LAND ROVER','RANGE ROVER','ROVER','MG','BENTLEY','ROLLS-ROYCE','ASTON MARTIN','LOTUS','IVECO','MAN',
  'DAF','SCANIA','ALPINA','BUGATTI','POLESTAR','LADA','TATRA','CUPRA','MCLAREN','MORGAN','TALBOT','SIMCA','TRABANT','WARTBURG','ZASTAVA','YUGO'];
const norm = (s) => String(s || '').toUpperCase().replace(/\([^)]*\)/g, ' ').replace(/[^A-Z ]/g, ' ').replace(/\s+/g, ' ').trim();
export function isEuropeanMake(make) {
  const m = norm(make);
  return EUROPEAN.some((e) => m === e || m.startsWith(`${e} `));
}
export function originGroupOf(apps = []) {
  const rows = (Array.isArray(apps) ? apps : []).filter((a) => a && a.make);
  if (!rows.length) return { group: 'UNKNOWN', european_share: null, rows: 0 };
  const eu = rows.filter((a) => isEuropeanMake(a.make)).length;
  const share = eu / rows.length;
  return { group: share > 0.5 ? 'EUROPEAN' : 'NON_EUROPEAN', european_share: Number(share.toFixed(3)), rows: rows.length };
}
