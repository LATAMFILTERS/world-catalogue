#!/usr/bin/env node

import process from 'node:process';

const BLOCKED = /\b(insert|update|delete|merge|upsert|truncate|alter|drop|create|grant|revoke|comment|copy|vacuum|analyze|refresh|reindex|cluster|call|do|execute|prepare|deallocate|lock|set\s+role|reset|discard|listen|notify|unlisten)\b/i;
const ALLOWED_START = /^(select|with|show|explain)\b/i;

export function assertReadOnlySql(sql) {
  if (typeof sql !== 'string' || !sql.trim()) throw new Error('SQL statement is empty');
  const normalized = sql
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .trim();

  if (normalized.includes(';') && normalized.replace(/;\s*$/, '').includes(';')) {
    throw new Error('multiple SQL statements are not allowed');
  }
  if (!ALLOWED_START.test(normalized)) {
    throw new Error('only SELECT, WITH, SHOW, or EXPLAIN statements are allowed');
  }
  if (BLOCKED.test(normalized)) {
    throw new Error('write-capable or administrative SQL keyword detected');
  }
  if (/\bselect\b[\s\S]*\binto\b/i.test(normalized)) {
    throw new Error('SELECT INTO is not allowed');
  }
  if (/\bfor\s+(update|share|no\s+key\s+update|key\s+share)\b/i.test(normalized)) {
    throw new Error('row-locking SELECT clauses are not allowed');
  }
  return normalized;
}

function selfTest() {
  const allowed = [
    'SELECT * FROM elimfilters_catalog LIMIT 1',
    'WITH x AS (SELECT 1) SELECT * FROM x',
    'SHOW transaction_read_only',
    'EXPLAIN SELECT 1'
  ];
  const blocked = [
    'UPDATE elimfilters_catalog SET code = 1',
    'DELETE FROM elimfilters_catalog',
    'INSERT INTO elimfilters_catalog VALUES (1)',
    'SELECT * INTO backup FROM elimfilters_catalog',
    'SELECT * FROM elimfilters_catalog FOR UPDATE',
    'SELECT 1; DROP TABLE elimfilters_catalog'
  ];

  for (const sql of allowed) assertReadOnlySql(sql);
  for (const sql of blocked) {
    let rejected = false;
    try { assertReadOnlySql(sql); } catch { rejected = true; }
    if (!rejected) throw new Error(`self-test failed to reject: ${sql}`);
  }
  console.log('[readonly-sql-guard] self-test passed');
}

if (process.argv.includes('--self-test')) {
  selfTest();
} else if (process.argv[2]) {
  console.log(assertReadOnlySql(process.argv.slice(2).join(' ')));
} else {
  console.error('Usage: node scripts/readonly-sql-guard.mjs --self-test | "SELECT ..."');
  process.exit(1);
}
