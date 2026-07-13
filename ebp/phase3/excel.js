'use strict';

// EBP Phase 3 — Excel export/import pipeline (ADR-0028, extended by
// ADR-0032 in the correction round). Uses exceljs (chosen over xlsx/
// SheetJS specifically for its cleaner parsing-security history — the
// highest-risk operation is parsing a Manufacturer-uploaded file).
//
// One row per (Batch Item × applicable PEP field) — the exact same
// pepFields.getApplicableFields() the Portal form uses, so Portal and
// Excel can never disagree about what fields exist or what "complete"
// means (ADR-0032). field_name is LOCKED: it is always populated from the
// frozen Passport snapshot, never typed or altered by the Manufacturer.
// Commercial fields (fob_price/currency/moq/lead_time_days) are read only
// from each item's FIRST row; repeated on every row of that item purely
// for the Manufacturer's convenience/visibility, never re-parsed per row.
//
// A hidden metadata sheet carries batch_id/manufacturer_id/
// template_version and a SHA-256 hash of the locked-column content,
// verified independently server-side at import time — Excel's native
// cell-protection is UX only, never the security boundary.

const crypto = require('node:crypto');
const ExcelJS = require('exceljs');
const validation = require('./validation');
const pepFields = require('./pep-fields');

const TEMPLATE_VERSION = 'v2';
const VISIBLE_SHEET_NAME = 'Offers';
const METADATA_SHEET_NAME = '__ebp_metadata';

const LOCKED_COLUMNS = ['batch_item_id', 'elimfilters_code', 'field_name', 'field_label', 'required_value', 'unit', 'tolerance', 'instructions'];
const EDITABLE_COLUMNS = [
  'offered_value',
  'offered_unit',
  'offered_tolerance',
  'completeness_status',
  'manufacturer_note',
  'fob_price',
  'currency',
  'moq',
  'lead_time_days',
];
const ALL_COLUMNS = [...LOCKED_COLUMNS, ...EDITABLE_COLUMNS];

function computeLockedHash(rows) {
  const canonical = rows.map((r) => LOCKED_COLUMNS.map((c) => String(r[c] ?? '')).join('')).join('');
  return crypto.createHash('sha256').update(canonical).digest('hex');
}

// Expands each Batch Item into one row per applicable PEP field — the
// same expansion the Portal offer form performs (ADR-0032).
function buildRowsFromBatchItems(batchItems) {
  const rows = [];
  batchItems.forEach((item) => {
    const fields = pepFields.getApplicableFields(item.manufacturer_visible_snapshot);
    fields.forEach((field) => {
      rows.push({
        batch_item_id: item.id,
        elimfilters_code: item.elimfilters_code,
        field_name: field.field_name,
        field_label: field.label,
        required_value: field.required_value ?? '',
        unit: field.unit || '',
        tolerance: field.required_tolerance ?? '',
        instructions: field.instructions || '',
        offered_value: '',
        offered_unit: '',
        offered_tolerance: '',
        completeness_status: '',
        manufacturer_note: '',
        fob_price: '',
        currency: '',
        moq: '',
        lead_time_days: '',
      });
    });
  });
  return rows;
}

// batchItems: rows from repository.listBatchItems (each with
// manufacturer_visible_snapshot) — the export builds its own rows from
// the applicable-fields expansion, never from a caller-supplied row list,
// so it can never drift from what the Portal form shows.
async function buildBatchWorkbook({ batchCode, manufacturerId, batchItems }) {
  const rows = buildRowsFromBatchItems(batchItems);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(VISIBLE_SHEET_NAME);

  sheet.columns = ALL_COLUMNS.map((key) => ({ header: key, key, width: 22 }));
  rows.forEach((row) => sheet.addRow(row));

  // Native cell-protection is a UX guard only (ADR-0028 point 4) — the
  // real boundary is the hash check at import time.
  await sheet.protect('', { selectLockedCells: true, selectUnlockedCells: true });
  sheet.getRow(1).eachCell((cell) => {
    cell.protection = { locked: true };
  });
  for (let r = 2; r <= rows.length + 1; r += 1) {
    LOCKED_COLUMNS.forEach((key) => {
      const col = ALL_COLUMNS.indexOf(key) + 1;
      sheet.getCell(r, col).protection = { locked: true };
    });
    EDITABLE_COLUMNS.forEach((key) => {
      const col = ALL_COLUMNS.indexOf(key) + 1;
      sheet.getCell(r, col).protection = { locked: false };
    });
  }

  const lockedHash = computeLockedHash(rows);
  const metaSheet = workbook.addWorksheet(METADATA_SHEET_NAME, { state: 'veryHidden' });
  metaSheet.addRow(['batch_code', batchCode]);
  metaSheet.addRow(['manufacturer_id', manufacturerId]);
  metaSheet.addRow(['template_version', TEMPLATE_VERSION]);
  metaSheet.addRow(['locked_hash', lockedHash]);
  await metaSheet.protect('', {});

  return workbook.xlsx.writeBuffer();
}

// Stage 1: parse + hash verification. Stage 2: row-level validation.
// Returns { errors, preview } — nothing written to Postgres. `preview`,
// when present, is an array of one entry PER BATCH ITEM (not per row):
// { batch_item_id, fob_price, currency, moq, lead_time_days,
//   technical_fields: [{ field_name, offered_value, unit, tolerance,
//   completeness_status, manufacturer_note }, ...] } — the exact same
// shape createOfferRevision expects, so the Excel confirm path and the
// Portal submit path call the identical service function with an
// identical payload shape (ADR-0032).
async function parseAndValidateWorkbook(buffer, expectedBatchCode, expectedManufacturerId) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const metaSheet = workbook.getWorksheet(METADATA_SHEET_NAME);
  if (!metaSheet) {
    return { errors: ['not a valid ELIMFILTERS batch workbook (missing metadata sheet) — wrong file'], preview: null };
  }
  const meta = {};
  metaSheet.eachRow((row) => {
    const [key, value] = row.values.slice(1);
    meta[key] = value;
  });

  if (meta.batch_code !== expectedBatchCode || String(meta.manufacturer_id) !== String(expectedManufacturerId)) {
    return { errors: ['this workbook does not match the requested batch (wrong template/file)'], preview: null };
  }
  if (meta.template_version !== TEMPLATE_VERSION) {
    return { errors: [`template_version mismatch: expected ${TEMPLATE_VERSION}, got ${meta.template_version} — download a fresh template`], preview: null };
  }

  const sheet = workbook.getWorksheet(VISIBLE_SHEET_NAME);
  if (!sheet) return { errors: ['missing Offers sheet'], preview: null };

  const header = sheet.getRow(1).values.slice(1).map(String);
  const rows = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const values = row.values.slice(1);
    const record = {};
    header.forEach((key, idx) => {
      record[key] = values[idx] !== undefined ? values[idx] : null;
    });
    rows.push(record);
  });

  // Stage 1 — independent server-side hash re-verification of locked content.
  const recomputedHash = computeLockedHash(rows);
  if (recomputedHash !== meta.locked_hash) {
    return {
      errors: ['locked-column content does not match the original export hash — a locked cell was altered, or the file was corrupted'],
      preview: null,
    };
  }

  // Stage 2 — row-level validation, collecting ALL errors, not just the first.
  const errors = [];
  const byItem = new Map();
  rows.forEach((row, idx) => {
    const rowErrors = [];
    if (!validation.COMPLETENESS_STATUSES.has(row.completeness_status)) {
      rowErrors.push(`completeness_status must be one of ${[...validation.COMPLETENESS_STATUSES].join(', ')}`);
    }
    if (row.completeness_status === 'ANSWERED' && (row.offered_value === null || row.offered_value === undefined || row.offered_value === '')) {
      rowErrors.push('offered_value is required when completeness_status is ANSWERED');
    }
    if (row.fob_price !== null && row.fob_price !== undefined && row.fob_price !== '') {
      const fobStr = String(row.fob_price);
      if (!validation.DECIMAL_FORMAT.test(fobStr)) {
        rowErrors.push('fob_price must be a plain decimal (e.g. 12.34), never scientific notation or a formula result');
      }
    }
    if (rowErrors.length) {
      errors.push({ row: idx + 2, batch_item_id: row.batch_item_id, field_name: row.field_name, errors: rowErrors });
      return;
    }
    if (!byItem.has(row.batch_item_id)) {
      byItem.set(row.batch_item_id, {
        batch_item_id: row.batch_item_id,
        fob_price: row.fob_price || null,
        currency: row.currency || null,
        moq: row.moq || null,
        lead_time_days: row.lead_time_days || null,
        technical_fields: [],
      });
    }
    const entry = byItem.get(row.batch_item_id);
    // The first row per item to carry commercial data wins; later rows
    // for the same item only ever contribute another technical field.
    if (!entry.fob_price && row.fob_price) entry.fob_price = row.fob_price;
    if (!entry.currency && row.currency) entry.currency = row.currency;
    if (!entry.moq && row.moq) entry.moq = row.moq;
    if (!entry.lead_time_days && row.lead_time_days) entry.lead_time_days = row.lead_time_days;
    entry.technical_fields.push({
      field_name: row.field_name,
      offered_value: row.offered_value,
      unit: row.offered_unit || null,
      tolerance: row.offered_tolerance || null,
      completeness_status: row.completeness_status,
      manufacturer_note: row.manufacturer_note || null,
    });
  });

  if (errors.length) return { errors, preview: null };
  return { errors: [], preview: [...byItem.values()] };
}

module.exports = {
  buildBatchWorkbook,
  parseAndValidateWorkbook,
  buildRowsFromBatchItems,
  TEMPLATE_VERSION,
  LOCKED_COLUMNS,
  EDITABLE_COLUMNS,
  ALL_COLUMNS,
  VISIBLE_SHEET_NAME,
};
