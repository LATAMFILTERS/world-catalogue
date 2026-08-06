'use strict';

const fs = require('fs');
const { execFileSync } = require('child_process');

const LOCK_FILE = '.github/protocol-lock.json';
const PROTECTED_PATTERNS = [
  /^lib\/bot-protocol-.*\.js$/,
  /^lib\/bot-conversation-orchestrator\.js$/,
  /^lib\/install-bot-protocol\.js$/,
  /^server-protocol\.js$/,
  /^tests\/bot-protocol-.*\.test\.js$/,
  /^\.github\/workflows\/bot-protocol-validation\.yml$/,
  /^scripts\/verify-protocol-lock\.js$/,
  /^package\.json$/
];

function fail(message) {
  console.error(`[protocol-lock] ${message}`);
  process.exit(1);
}

function runGit(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

if (!fs.existsSync(LOCK_FILE)) fail(`${LOCK_FILE} is missing.`);

let lock;
try {
  lock = JSON.parse(fs.readFileSync(LOCK_FILE, 'utf8'));
} catch (error) {
  fail(`Invalid lock file: ${error.message}`);
}

const baseRef = process.env.GITHUB_BASE_REF;
const beforeSha = process.env.GITHUB_EVENT_BEFORE;
let range;

if (baseRef) {
  runGit(['fetch', 'origin', baseRef, '--depth=100']);
  range = `origin/${baseRef}...HEAD`;
} else if (beforeSha && !/^0+$/.test(beforeSha)) {
  range = `${beforeSha}...HEAD`;
} else {
  range = 'HEAD~1...HEAD';
}

let changedFiles = [];
try {
  changedFiles = runGit(['diff', '--name-only', range]).split('\n').filter(Boolean);
} catch (error) {
  fail(`Unable to inspect changed files for ${range}: ${error.message}`);
}

const protectedChanges = changedFiles.filter((file) =>
  PROTECTED_PATTERNS.some((pattern) => pattern.test(file))
);

if (protectedChanges.length === 0) {
  console.log('[protocol-lock] No protected protocol files changed.');
  process.exit(0);
}

if (lock.status !== 'CLOSED') {
  fail(`Protected files cannot merge while the lock is ${lock.status || 'undefined'}.`);
}

for (const field of ['scope', 'reason', 'opened_by', 'opened_at', 'closed_by', 'closed_at']) {
  if (!String(lock[field] || '').trim()) fail(`Missing required audit field: ${field}`);
}

let history = '';
try {
  history = runGit(['log', '-p', range, '--', LOCK_FILE]);
} catch (error) {
  fail(`Unable to inspect lock history: ${error.message}`);
}

if (!history.includes('"status": "OPEN"')) {
  fail('Protected changes require an OPEN lock commit in the same change range.');
}

if (!history.includes('"status": "CLOSED"')) {
  fail('Protected changes require the lock to be CLOSED before merge.');
}

console.log('[protocol-lock] Verified protected changes:');
for (const file of protectedChanges) console.log(` - ${file}`);
console.log(`[protocol-lock] Scope: ${lock.scope}`);
console.log('[protocol-lock] Lock opened, changes validated, and lock closed.');
