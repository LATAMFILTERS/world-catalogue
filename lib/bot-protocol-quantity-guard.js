'use strict';

const UNITS = {
  hora:'hours',horas:'hours',hour:'hours',hours:'hours',hr:'hours',hrs:'hours',h:'hours',
  mes:'months',meses:'months',month:'months',months:'months',
  km:'kilometers',kilometro:'kilometers',kilometros:'kilometers',kilometer:'kilometers',kilometers:'kilometers',
  mile:'miles',miles:'miles',milla:'miles',millas:'miles',
  bar:'bar',bars:'bar',psi:'psi',kpa:'kpa',mpa:'mpa',nm:'nm',
  mm:'mm',cm:'cm',micra:'microns',micras:'microns',micron:'microns',microns:'microns',
  inch:'inches',inches:'inches',pulgada:'inches',pulgadas:'inches'
};
function normalized(text) {
  return String(text || '').normalize('NFKC').toLowerCase()
    .replace(/^\s*\d+[.)]\s+/gm, '');
}
function facts(text) {
  const value = normalized(text);
  const numbers = new Set(value.match(/[-+]?\d+(?:[.,]\d+)*/g) || []);
  const quantities = new Set();
  for (const match of value.matchAll(/(?<![a-z0-9])([-+]?\d+(?:[.,]\d+)*)\s*([\p{L}µ°][\p{L}µ°·]*)/gu)) {
    const unit = match[2].normalize('NFKD').replace(/\p{M}/gu, '');
    quantities.add(`${match[1]}|${UNITS[unit] || unit}`);
  }
  return { numbers, quantities };
}
// This checks numeric additions and changed units, not all semantic claims.
// Only approved/deterministic answer text is a source; a customer claim or
// conversation history must never authorize a newly generated quantity.
function isDraftQuantityGrounded(draft, approvedTexts = []) {
  if (typeof draft !== 'string' || !Array.isArray(approvedTexts)) return false;
  const allowed = { numbers: new Set(), quantities: new Set() };
  for (const source of approvedTexts.filter(value => typeof value === 'string')) {
    const current = facts(source);
    for (const number of current.numbers) allowed.numbers.add(number);
    for (const quantity of current.quantities) allowed.quantities.add(quantity);
  }
  const proposed = facts(draft);
  return [...proposed.numbers].every(value => allowed.numbers.has(value))
    && [...proposed.quantities].every(value => allowed.quantities.has(value));
}
module.exports = { isDraftQuantityGrounded };
