'use strict';

// Operator rule 2026-10-13: the Type shown to the customer. The stored
// filter_type keeps its internal key ('oil', 'water', 'other', ...) because
// the write gateway, the bot labels and several views key on it.
const BY_PREFIX = {
  EA1: 'Air', EA3: 'Air', EA2: 'Intake', EC1: 'Cabin', EC3: 'Cabin', ED4: 'Air Dryer',
  EW7: 'Coolant', EH6: 'Hydraulic', EL3: 'Lube', EL8: 'Lube', EF3: 'Fuel', EF9: 'Fuel',
};

function publicFilterType(row = {}) {
  const prefix = String(row.sku || '').slice(0, 3).toUpperCase();
  const type = String(row.filter_type || '').toLowerCase();
  if (type === 'air_dryer') return 'Air Dryer';
  if (type === 'transmission') return 'Transmission';
  if (prefix === 'ES9') return type === 'oil' ? 'Lube' : 'Fuel Separator';
  if (prefix === 'ET9') return /TURBOCORE/i.test(row.technology || '') ? 'Turbine' : 'Fuel Separator';
  return BY_PREFIX[prefix] || null;
}

// Closed list (operator rule 2026-10-13); anything else stored in sub_type is not shown.
const SUB_TYPE = /^(?:(?:Primary|Secondary)(?: |$))?(?:Radial Seal|Axial Seal|Spin On|Cartridge|Panel|Round|Cone|Obround|Finned|In Line|Strainer|Housing|Assembly)?$/;

function publicSubType(row = {}) {
  const value = typeof row.sub_type === 'string' ? row.sub_type.trim() : '';
  return value && SUB_TYPE.test(value) ? value : null;
}

module.exports = { publicFilterType, publicSubType };
