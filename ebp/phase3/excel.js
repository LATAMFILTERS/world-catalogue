'use strict';

// EBP Phase 3 — Excel export/import pipeline (ADR-0028). Uses exceljs
// (chosen over xlsx/SheetJS specifically for its cleaner parsing-security
// history — the highest-risk operation is parsing a Manufacturer-uploaded
// file). Locked columns carry Passport identification/required fields;
// editable columns carry offered_*/commercial/packaging values. A hidden
// metadata sheet carries batch_id/manufacturer_id/batch_item_id/
// template_version and a SHA-256 hash of the locked-column content,
// verified independently server-side at import time — Excel's native
// cell-protection is UX only, never the security boundary.

const crypto = require('node:crypto');
const ExcelJS = require('exceljs');
const validation = require('./validation');

const TEMPLATE_VERSION = 'v1';
const VISIBLE_SHEET_NAME = 'Offers';
const METADATA_SHEET_NAME = '__ebp_metadata';

// field_name is editable, not locked: this MVP export produces one row per
// Batch Item (not one row per required Passport field), so the Manufacturer
// names which required field they are answering in that row themselves.
// batch_item_id/elimfilters_code/required_value/unit/instructions are the
// ELIMFILTERS-defined, locked columns.
const LOCKED_COLUMNS = ['batch_item_id', 'elimfilters_code', 'required_value', 'unit', 'instructions'];
const EDITABLE_COLUMNS = ['field_name', 'offered_value', 'completeness_status', 'manufacturer_note', 'fob_price', 'currency', 'moq', 'lead_time_days'];
const ALL_COLUMNS = [...LOCKED_COLUMNS, ...EDITABLE_COLUMNS];

function computeLockedHash(rows) {
  const canonical = rows
    .map((r) => LOCKED_COLUMNS.map((c) => String(r[c] ?? '')).join(''))
    .join('');
  return crypto.createHash('sha256').update(canonical).digest('hex');
}

// items: [{ batch_item_id, elimfilters_code, field_name, required_value, unit, instructions }]
async function buildBatchWorkbook({ batchCode, manufacturerId, items }) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(VISIBLE_SHEET_NAME);

  sheet.columns = ALL_COLUMNS.map((key) => ({ header: key, key, width: 22 }));
  items.forEach((item) => sheet.addRow(item));

  // Native cell-protection is a UX guard only (ADR-0028 point 4) — the
  // real boundary is the hash check at import time.
  await sheet.protect('', { selectLockedCells: true, selectUnlockedCells: true });
  sheet.getRow(1).eachCell((cell, colNumber) => {
    const key = ALL_COLUMNS[colNumber - 1];
    cell.protection = { locked: true };
  });
  for (let r = 2; r <= items.length + 1; r += 1) {
    LOCKED_COLUMNS.forEach((key) => {
      const col = ALL_COLUMNS.indexOf(key) + 1;
      sheet.getCell(r, col).protection = { locked: true };
    });
    EDITABLE_COLUMNS.forEach((key) => {
      const col = ALL_COLUMNS.indexOf(key) + 1;
      sheet.getCell(r, col).protection = { locked: false };
    });
  }

  const lockedHash = computeLockedHash(items);
  const metaSheet = workbook.addWorksheet(METADATA_SHEET_NAME, { state: 'veryHidden' });
  metaSheet.addRow(['batch_code', batchCode]);
  metaSheet.addRow(['manufacturer_id', manufacturerId]);
  metaSheet.addRow(['template_version', TEMPLATE_VERSION]);
  metaSheet.addRow(['locked_hash', lockedHash]);
  await metaSheet.protect('', {});

  return workbook.xlsx.writeBuffer();
}

// Stage 1: parse + hash verification. Stage 2: row-level validation.
// Returns { errors, preview, meta } — nothing written to Postgres.
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
    return { errors: [`template_version mismatch: expected ${TEMPLATE_VERSION}, got ${meta.template_version}`], preview: null };
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
      errors: ['locked-column content does not match the original export hash — file was altered or corrupted'],
      preview: null,
    };
  }

  // Stage 2 — row-level validation, collecting ALL errors, not just the first.
  const errors = [];
  const preview = [];
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
      errors.push({ row: idx + 2, batch_item_id: row.batch_item_id, errors: rowErrors });
    } else {
      preview.push(row);
    }
  });

  if (errors.length) return { errors, preview: null };
  return { errors: [], preview, meta };
}

module.exports = { buildBatchWorkbook, parseAndValidateWorkbook, TEMPLATE_VERSION, LOCKED_COLUMNS, EDITABLE_COLUMNS, ALL_COLUMNS, VISIBLE_SHEET_NAME };
