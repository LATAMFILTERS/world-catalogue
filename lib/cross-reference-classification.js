'use strict';

const AFTERMARKET_BRANDS = new Set([
  'DONALDSON','BALDWIN','BALDWIN FILTERS','FLEETGUARD','NELSON','MANN','MANN HUMMEL','WIX','FRAM',
  'PUROLATOR','NAPA','NAPA GOLD','AC DELCO','ACDELCO','BOSCH','MAHLE','MAHLE KNECHT',
  'KNECHT','HENGST','SAKURA','HASTINGS','LUBER FINER','LUBERFINER','PARKER','PALL',
  'HYDAC','MP FILTRI','MPFILTRI','UFI','CHAMPION','COOPERS','COOPERS FILTERS',
  'MOTORCRAFT','SOGEFI','FILTRON','SOFIMA','FIAAM','NIPPARTS','STARLINE','CARQUEST',
  'PRONTO','DEFENSE','ELOFIC','ECOGARD','K&N','PREMIUM GUARD','RACOR','PARKER RACOR',
  'DAVCO','FLEETRITE','HIFI','HIFI FILTER','JURA','SCHUPP','SCT','TECFIL','TECNOCAR',
  'ALCO','CLEAN','CROSLAND','DELPHI','RYCO','SURE','WOODGATE','VMC'
]);

const OEM_BRANDS = new Set([
  'CATERPILLAR','CAT','CUMMINS','KOMATSU','JOHN DEERE','DEERE','AGCO','ATLAS COPCO',
  'SULLAIR','INGERSOLL RAND','ALLISON','ZF','CASE','CASE IH','NEW HOLLAND','HITACHI',
  'VOLVO','MERCEDES','MERCEDES BENZ','MAN','SCANIA','DAF','IVECO','RENAULT',
  'RENAULT TRUCKS','PERKINS','DETROIT DIESEL','MACK','KENWORTH','PETERBILT',
  'INTERNATIONAL','NAVISTAR','FREIGHTLINER','WESTERN STAR','ISUZU','HINO',
  'MITSUBISHI','MITSUBISHI FUSO','UD TRUCKS','NISSAN DIESEL','DOOSAN','HYUNDAI',
  'JCB','TEREX','GROVE','MANITOWOC','TADANO','LINK BELT','FIAT','CNH','VOLKSWAGEN',
  'VW','BMW','AUDI','OPEL','GM','GENERAL MOTORS','FORD','PEUGEOT','CITROEN','TOYOTA',
  'HONDA','NISSAN','MAZDA','SUBARU','SUZUKI','SEAT','SKODA','LIEBHERR'
]);

function normalizeBrandKey(value) {
  return String(value || '').toUpperCase().replace(/[Â®â„¢]/g, '').replace(/[-+]/g, ' ').replace(/\s+/g, ' ').trim();
}

function classifyReference(ref = {}) {
  const explicit = String(ref.classification || ref.source_type || '').toUpperCase();
  if (explicit === 'OEM') return 'OEM';
  if (explicit === 'AFTERMARKET' || explicit === 'COMPETITOR') return 'AFTERMARKET';
  const brand = normalizeBrandKey(ref.manufacturer || ref.brand);
  if (AFTERMARKET_BRANDS.has(brand)) return 'AFTERMARKET';
  if (OEM_BRANDS.has(brand)) return 'OEM';
  if (/\\b(FILTER|FILTERS|FILTR|FILTRO)\\b/.test(brand)) return 'AFTERMARKET';
  return 'UNKNOWN';
}

module.exports = { AFTERMARKET_BRANDS, OEM_BRANDS, normalizeBrandKey, classifyReference };
