#!/usr/bin/env node
import fs from 'node:fs/promises';

const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const [k, ...v] = a.replace(/^--/, '').split('=');
  return [k, v.join('=')];
}));

for (const key of ['record', 'image-sha']) {
  if (!args[key]) throw new Error(`MISSING_ARGUMENT:${key}`);
}

const record = JSON.parse(await fs.readFile(args.record, 'utf8'));
const imageSha = String(args['image-sha']).toLowerCase();
const isSha = (value) => /^[a-f0-9]{64}$/i.test(String(value || ''));
const failures = [];

if (record.status !== 'APPROVED_GOLDEN_MASTER') failures.push('STATUS_NOT_APPROVED_GOLDEN_MASTER');
if (!isSha(record.approved_master_sha256)) failures.push('APPROVED_MASTER_SHA256_INVALID');
if (String(record.approved_master_sha256 || '').toLowerCase() !== imageSha) failures.push('APPROVED_MASTER_HASH_MISMATCH');

const method = record.approval_method;
if (method === 'POLICY_COMPLIANT_AUTONOMOUS') {
  if (record.release_authority !== 'branding') failures.push('RELEASE_AUTHORITY_NOT_BRANDING');
  if (record.responsible_subagent !== 'branding') failures.push('RESPONSIBLE_SUBAGENT_NOT_BRANDING');
  if (record.branding_decision !== 'APPROVED_BY_POLICY') failures.push('BRANDING_DECISION_NOT_APPROVED_BY_POLICY');
  if (record.policy_compliance_status !== 'PASS') failures.push('POLICY_COMPLIANCE_NOT_PASS');
  if (record.unresolved_findings !== 0) failures.push('UNRESOLVED_FINDINGS_NONZERO');
  if (record.exception_count !== 0) failures.push('EXCEPTION_COUNT_NONZERO');
  if (record.source_identity_status !== 'PASS') failures.push('SOURCE_IDENTITY_NOT_PASS');
  if (record.brand_identity_status !== 'PASS') failures.push('BRAND_IDENTITY_NOT_PASS');
  if (record.geometry_status !== 'PASS') failures.push('GEOMETRY_NOT_PASS');
  if (!isSha(record.audit_bundle_sha256)) failures.push('AUDIT_BUNDLE_SHA256_INVALID');

  if (String(record.sku || '').startsWith('ET9')) {
    if (record.et9_mechanical_face_status !== 'PASS') failures.push('ET9_MECHANICAL_FACE_NOT_PASS');
    if (!isSha(record.mechanical_face_reference_sha256)) failures.push('ET9_MECHANICAL_REFERENCE_SHA256_INVALID');
    if (!isSha(record.mechanical_face_zone_mask_sha256)) failures.push('ET9_MECHANICAL_ZONE_MASK_SHA256_INVALID');
  }
} else if (method === 'LEGACY_EXPLICIT_USER_APPROVAL') {
  if (record.approved_by !== 'victor') failures.push('LEGACY_APPROVER_NOT_VICTOR');
  if (!record.approved_on || String(record.approved_on) > '2026-09-18') failures.push('LEGACY_APPROVAL_OUTSIDE_CUTOFF');
} else {
  failures.push('APPROVAL_METHOD_NOT_AUTHORIZED');
}
const result = {
  ok: failures.length === 0,
  authority: method === 'POLICY_COMPLIANT_AUTONOMOUS' ? 'branding' : 'legacy_user_approval',
  approval_method: method ?? null,
  sku: record.sku ?? null,
  image_sha256: imageSha,
  failures
};

console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exit(2);
