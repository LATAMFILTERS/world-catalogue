'use strict';

// EBP Phase 3 — document storage adapter (ADR-0027). A four-method
// interface so a future object-storage backend requires no calling-code
// change: put(key, buffer), get(key), exists(key), remove(key).
//
// LocalFilesystemStorageAdapter is the MVP implementation. Its root
// directory defaults to a path outside any express.static root and
// outside frontend/, so nothing under it is ever served publicly by
// accident — see EBP_DOCUMENT_STORAGE_ROOT.

const fs = require('node:fs/promises');
const path = require('node:path');

const DEFAULT_ROOT = path.join(__dirname, '..', '..', 'storage', 'ebp-phase3', 'documents');

class LocalFilesystemStorageAdapter {
  constructor(root = process.env.EBP_DOCUMENT_STORAGE_ROOT || DEFAULT_ROOT) {
    this.root = root;
  }

  _resolve(key) {
    // storage_key is always server-generated (crypto.randomUUID()-based
    // path segments) — never derived from client input — but resolve
    // defensively against path traversal regardless.
    const resolved = path.resolve(this.root, key);
    if (!resolved.startsWith(path.resolve(this.root) + path.sep) && resolved !== path.resolve(this.root)) {
      throw new Error(`storage key resolves outside the storage root: ${key}`);
    }
    return resolved;
  }

  async put(key, buffer) {
    const fullPath = this._resolve(key);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, buffer, { mode: 0o600 });
  }

  async get(key) {
    return fs.readFile(this._resolve(key));
  }

  async exists(key) {
    try {
      await fs.access(this._resolve(key));
      return true;
    } catch {
      return false;
    }
  }

  async remove(key) {
    await fs.rm(this._resolve(key), { force: true });
  }
}

// storage_key convention: <manufacturer_id>/<uuid> — one subdirectory per
// manufacturer for an extra filesystem-level isolation layer beyond the
// DB-level tenant check (ADR-0027).
function buildStorageKey(manufacturerId, documentId) {
  return `${manufacturerId}/${documentId}`;
}

module.exports = { LocalFilesystemStorageAdapter, buildStorageKey, DEFAULT_ROOT };
