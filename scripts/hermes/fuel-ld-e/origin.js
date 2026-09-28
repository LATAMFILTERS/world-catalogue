'use strict';
// Vehicle-make origin for LD authority selection: EUROPEAN -> MANN-FILTER, NON_EUROPEAN -> FRAM, else fail closed.
const EU = ['AUDI', 'VW', 'VOLKSWAGEN', 'SEAT', 'SKODA', 'PORSCHE', 'BMW', 'MINI', 'MERCEDES', 'SMART', 'OPEL', 'VAUXHALL', 'PEUGEOT', 'CITROEN', 'RENAULT', 'DACIA', 'FIAT', 'ALFA', 'LANCIA', 'IVECO', 'VOLVO', 'SAAB', 'SCANIA', 'MAN ', 'MAN TRUCK', 'MAN BUS', 'DAF', 'LAND ROVER', 'JAGUAR', 'ROVER', 'MWM', 'DEUTZ', 'CLAAS', 'FENDT', 'LIEBHERR', 'HATZ', 'BOMAG', 'DYNAPAC', 'JCB', 'EVOBUS', 'SETRA', 'NEOPLAN', 'MTU', 'LOMBARDINI', 'SAME', 'LAMBORGHINI', 'LANDINI', 'STEYR', 'MAGIRUS', 'ASTON MARTIN', 'BENTLEY', 'ROLLS', 'FERRARI', 'MASERATI', 'LOTUS', 'MORGAN', 'TRIUMPH', 'MG ', 'LDV', 'ALPINE', 'CUPRA', 'POLESTAR', 'LIGIER', 'MANITOU', 'GINAF', 'ASTRA', 'HAMM', 'WIRTGEN', 'SOLARIS', 'ERF', 'OPTARE', 'HEULIEZ', 'AEBI', 'VDL', 'VAN HOOL', 'MICROCAR', 'MAGNI', 'DODICH', 'STILL', 'WEIDEMANN', 'AIFO', 'SOFIM', 'NEOMAN', 'IRIZAR', 'MERLO', 'WACKER', 'KRAMER', 'KRONE', 'AMAZONE', 'PRINOTH', 'ROPA', 'LAVERDA', 'DEUTZ-FAHR', 'VM MOTORI', 'PERKINS'];
const NON_EU = ['FORD (USA)', 'CHEVROLET (USA)', 'GMC', 'CHEVROLET', 'CHRYSLER', 'DODGE', 'JEEP', 'RAM', 'CADILLAC', 'BUICK', 'LINCOLN', 'PONTIAC', 'OLDSMOBILE', 'PLYMOUTH', 'HUMMER', 'TOYOTA', 'LEXUS', 'NISSAN', 'INFINITI', 'DATSUN', 'HONDA', 'ACURA', 'MAZDA', 'MITSUBISHI', 'SUBARU', 'SUZUKI', 'ISUZU', 'DAIHATSU', 'HINO', 'HYUNDAI', 'KIA', 'GENESIS', 'SSANGYONG', 'DAEWOO', 'KUBOTA', 'YANMAR', 'KOMATSU', 'KOBELCO', 'HITACHI', 'TAKEUCHI', 'SUMITOMO', 'CATERPILLAR', 'CUMMINS', 'JOHN DEERE', 'JOHN-DEERE', 'CASE', 'NEW HOLLAND', 'KENWORTH', 'PETERBILT', 'FREIGHTLINER', 'STERLING', 'INTERNATIONAL', 'NAVISTAR', 'MACK', 'DETROIT', 'BOBCAT', 'DOOSAN', 'GEHL', 'SANY', 'BYD', 'GREAT WALL', 'CHERY', 'GEELY', 'HOLDEN', 'TATA', 'MAHINDRA', 'PROTON', 'PERODUA', 'WESTERN STAR', 'BLUE BIRD', 'THOMAS', 'ONAN', 'KOHLER', 'BRIGGS', 'ONAN', 'THERMO KING', 'CARRIER', 'CLARK', 'DITCH WITCH', 'AGCO', 'CHALLENGER', 'MASSEY', 'AG-CHEM', 'TEREX', 'GROVE', 'TESLA'];
// The marque is the text before "("; the parenthesis names the owning group (e.g. "MWM (CATERPILLAR)").
function origin(make) {
  const primary = originOf(String(make || '').split('(')[0]);
  return primary !== 'UNKNOWN' ? primary : originOf(make);
}
function originOf(make) {
  // Token match on non-alphanumeric boundaries so "(BMW)" matches BMW and "MANITOU" does not match MAN.
  const tok = (s) => ` ${String(s || '').toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim()} `;
  const m = tok(make);
  // Explicit USA variants of European makes are still European marques (e.g. "VW (USA)").
  const eu = EU.some((k) => m.includes(tok(k)));
  const non = NON_EU.some((k) => m.includes(tok(k)));
  if (eu && !non) return 'EUROPEAN';
  if (non && !eu) return 'NON_EUROPEAN';
  return 'UNKNOWN';
}

module.exports = { origin };

if (require.main === module) {
  const cases = { '(BMW)': 'EUROPEAN', MANITOU: 'EUROPEAN', 'MAN TRUCK': 'EUROPEAN', 'MWM (CATERPILLAR)': 'EUROPEAN', NISSAN: 'NON_EUROPEAN', FORD: 'UNKNOWN',
    'VW (VOLKSWAGEN) (USA)': 'EUROPEAN', 'MOXY (DOOSAN)': 'NON_EUROPEAN', 'CASE-IH (CNH GLOBAL)': 'NON_EUROPEAN', 'MITSUBISHI FUSO (DAIMLER)': 'NON_EUROPEAN' };
  for (const [make, want] of Object.entries(cases)) require('assert').strictEqual(origin(make), want, make);
  console.log('origin self-check ok');
}
