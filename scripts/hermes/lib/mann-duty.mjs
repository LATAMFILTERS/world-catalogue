// Duty of a MANN product from its OFFICIAL application rows (mann-applications.json written by the pilot).
// Rule (Victor 2026-10-27): when 2+ MANN codes tie for an LD SKU, the LD one is the base; an HD one becomes a
// competitor code on the HD side (where Donaldson is the base). Rows are classified by make/model text:
// commercial-truck, agricultural, construction and industrial makers/models -> HD; everything else -> LD.
// LIGHT_DUTY when <= 20% of rows are HD, HEAVY_DUTY when >= 80%, otherwise MIXED (held for review).
const HD_MAKES = ['SCANIA', 'DAF', 'MAN', 'RENAULT TRUCKS', 'VOLVO TRUCKS', 'IVECO TRUCKS', 'KENWORTH', 'PETERBILT', 'FREIGHTLINER',
  'MACK', 'INTERNATIONAL', 'WESTERN STAR', 'HINO', 'UD TRUCKS', 'TATRA', 'KAMAZ', 'CATERPILLAR', 'CAT', 'KOMATSU', 'JCB', 'LIEBHERR',
  'HITACHI', 'DOOSAN', 'VOLVO CONSTRUCTION', 'CASE', 'CASE CONSTRUCTION', 'CASE IH', 'NEW HOLLAND', 'JOHN DEERE', 'CLAAS', 'FENDT',
  'MASSEY FERGUSON', 'DEUTZ-FAHR', 'DEUTZ', 'SAME', 'LAMBORGHINI TRACTORI', 'HUERLIMANN', 'LANDINI', 'VALTRA', 'STEYR', 'LINDNER',
  'MERLO', 'MANITOU', 'BOBCAT', 'TEREX', 'WACKER NEUSON', 'KUBOTA', 'YANMAR', 'PERKINS', 'CUMMINS', 'DETROIT DIESEL', 'HATZ', 'LOMBARDINI',
  'KHD', 'STILL', 'LINDE', 'JUNGHEINRICH', 'HYSTER', 'YALE', 'EVOBUS', 'SETRA', 'NEOPLAN', 'VAN HOOL', 'SOLARIS', 'TEMSA', 'OTOKAR'];
const HD_MODEL = /\b(actros|atego|axor|arocs|antos|econic|unimog|zetros|travego|tourismo|citaro|intouro|fh\d*|fm\d*|fmx|fl\d*|fe\d*|stralis|trakker|eurocargo|tgx|tgs|tgm|tgl|tga|xf|cf|lf|premium|magnum|kerax|midlum|tractor|truck|bus|coach|excavator|loader|dozer|grader|harvester|combine|forklift|generator|genset|industrial|marine)\b/i;
const up = (s) => String(s || '').toUpperCase().replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();

export function isHdRow(r) {
  const make = up(r.make);
  if (HD_MAKES.some((m) => make === m || make.startsWith(`${m} `))) return true;
  return HD_MODEL.test(`${r.model || ''} ${r.model_family || ''} ${r.model_type || ''}`);
}
export function dutyOfMannRows(rows = []) {
  const list = Array.isArray(rows) ? rows.filter((r) => r && r.make) : [];
  if (!list.length) return { duty: 'UNKNOWN', hd_share: null, rows: 0 };
  const hd = list.filter(isHdRow).length / list.length;
  return { duty: hd <= 0.2 ? 'LIGHT_DUTY' : hd >= 0.8 ? 'HEAVY_DUTY' : 'MIXED', hd_share: Number(hd.toFixed(3)), rows: list.length };
}
