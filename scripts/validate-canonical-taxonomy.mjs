import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const binaryExt = new Set(['.png','.jpg','.jpeg','.gif','.webp','.avif','.ico','.pdf','.zip','.gz','.tar','.mp4','.mov','.woff','.woff2','.ttf','.eot','.db','.sqlite','.sqlite3']);

// Prebuild governance is intentionally limited to active canonical/deployable
// taxonomy sources. Historical reports, migrations, tests, backups and archived
// evidence may preserve retired labels for provenance and must not block builds.
// The postbuild public-governance gate separately scans the complete generated
// public output and fails if a retired identifier is emitted to users/crawlers.
const activeFiles = new Set([
  'CLAUDE.md',
  'docs/brand/AUDIT.md',
  'docs/brand/TECHNOLOGY_REGISTRY.md',
  'docs/brand/SYSTEM_REGISTRY.md',
  'docs/brand/PRODUCT_REGISTRY.md',
  'docs/brand/PROBLEM_REGISTRY.md',
]);

const activePrefixes = [
  'frontend/src/app/technologies/',
  'frontend/src/app/commercial-lines/',
];

// DURACTECH is canonical. DURATECH is allowed only inside the explicit legacy
// migration shim required to migrate Google's previously indexed URL.
const legacyMigrationPrefix = 'frontend/src/app/commercial-lines/duratech/';
const retiredDuratech = Buffer.from('4455524154454348', 'hex').toString('utf8');

const forbidden = [
  '53594e5445504f5245',
  '53594e5445464f52',
  '434f4f4c54454348',
  '4455524154454348',
  '4e414e4f434f5245',
  '49534f4755415244',
  '50554c5345434f5245',
  '454c494d434f5245',
  '44494553454c434f5245',
  '545552424f434f5245',
  '5457454c564520544543484e4f4c4f47494553',
  '31322050524f505249455441525920544543484e4f4c4f47494553',
].map((hex) => Buffer.from(hex, 'hex').toString('utf8'));

function isActiveSurface(rel) {
  return activeFiles.has(rel) || activePrefixes.some((prefix) => rel.startsWith(prefix));
}

const violations = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(root, full).replaceAll('\\', '/');

    if (entry.isDirectory()) {
      // Prune directories that cannot contain an active surface.
      const couldContainActive = [...activeFiles, ...activePrefixes].some((target) =>
        target === rel || target.startsWith(`${rel}/`) || rel.startsWith(target)
      );
      if (couldContainActive) walk(full);
      continue;
    }

    if (!isActiveSurface(rel)) continue;
    if (binaryExt.has(path.extname(entry.name).toLowerCase())) continue;

    const upperPath = rel.toUpperCase();
    const isLegacyShim = rel.startsWith(legacyMigrationPrefix);
    for (const token of forbidden) {
      if (isLegacyShim && token === retiredDuratech) continue;
      if (upperPath.includes(token)) violations.push(`${rel} [path]`);
    }

    let text;
    try { text = fs.readFileSync(full, 'utf8'); } catch { continue; }
    const upper = text.toUpperCase();
    for (const token of forbidden) {
      if (isLegacyShim && token === retiredDuratech) continue;
      if (upper.includes(token)) violations.push(`${rel} [content]`);
    }
  }
}

walk(root);

if (violations.length) {
  console.error('Canonical taxonomy guard failed on active canonical/deployable surfaces:');
  for (const item of [...new Set(violations)].sort()) console.error(`- ${item}`);
  process.exit(1);
}

console.log('Canonical taxonomy guard passed on active canonical/deployable surfaces.');
