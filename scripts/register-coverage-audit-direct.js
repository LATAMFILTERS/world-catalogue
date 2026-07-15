const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'server-original.js');
let source = fs.readFileSync(target, 'utf8');
const marker = '// COVERAGE_AUDIT_DIRECT_V4';
const registration = `${marker}\nconst { registerCoverageAuditEngine } = require('./src/coverage-audit-engine');\nregisterCoverageAuditEngine(app, pool, searchLimiter);\nconsole.log('[coverage-audit-engine] direct v4 registered');`;

// Remove any previous direct-registration block so this script is idempotent.
source = source.replace(
  /\n?\/\/ COVERAGE_AUDIT_DIRECT_V4\nconst \{ registerCoverageAuditEngine \} = require\('\.\/src\/coverage-audit-engine'\);\nregisterCoverageAuditEngine\(app, pool, searchLimiter\);\nconsole\.log\('\[coverage-audit-engine\] direct v4 registered'\);\n?/g,
  '\n'
);

const poolDeclaration = 'const pool = new Pool(dbConfig);';
const poolIndex = source.indexOf(poolDeclaration);
if (poolIndex === -1) {
  throw new Error('Pool declaration not found for direct coverage audit registration');
}

let insertAt = poolIndex + poolDeclaration.length;
const afterPool = source.slice(insertAt);
const poolOnMatch = afterPool.match(/^\s*\npool\.on\('connect',[\s\S]*?\n\}\);/);
if (poolOnMatch) insertAt += poolOnMatch[0].length;

source = `${source.slice(0, insertAt)}\n\n${registration}\n${source.slice(insertAt)}`;

const markerCount = (source.match(/\/\/ COVERAGE_AUDIT_DIRECT_V4/g) || []).length;
if (markerCount !== 1) throw new Error(`Expected one direct coverage registration, found ${markerCount}`);
if (!source.includes("require('./src/coverage-audit-engine')")) throw new Error('Coverage audit module require was not inserted');
if (!source.includes('registerCoverageAuditEngine(app, pool, searchLimiter)')) throw new Error('Coverage audit route registration was not inserted');

fs.writeFileSync(target, source, 'utf8');
console.log('[coverage-audit-engine] direct v4 registered');
