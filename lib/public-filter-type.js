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

module.exports = { publicFilterType };
