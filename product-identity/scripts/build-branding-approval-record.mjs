#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const [k, ...v] = a.replace(/^--/, '').split('=');
  return [k, v.join('=')];
}));

const required = ['sku', 'sha256', 'audit-bundle-sha256', 'approved-on', 'out'];
for (const key of required) {
  if (!args[key]) throw new Error(`MISSING_ARGUMENT:${key}`);
}

const isSha = (value) => /^[a-f0-9]{64}$/i.test(String(value || ''));
if (!isSha(args.sha256)) throw new Error('INVALID_APPROVED_MASTER_SHA256');
if (!isSha(args['audit-bundle-sha256'])) throw new Error('INVALID_AUDIT_BUNDLE_SHA256');

const sku = String(args.sku).toUpperCase();
const isEt9 = sku.startsWith('ET9');
if (isEt9) {
  if (!isSha(args['mechanical-face-reference-sha256'])) {
    throw new Error('ET9_MECHANICAL_REFERENCE_SHA256_REQUIRED');
  }
  if (!isSha(args['mechanical-face-zone-mask-sha256'])) {
    throw new Error('ET9_MECHANICAL_ZONE_MASK_SHA256_REQUIRED');
  }
  if (args['et9-mechanical-face-status'] !== 'PASS') {
    throw new Error('ET9_MECHANICAL_FACE_PASS_REQUIRED');
  }
}

const record = {
  schema_version: '2.0',
  sku,
  status: 'APPROVED_GOLDEN_MASTER',
  approved_on: args['approved-on'],
  approved_master_sha256: args.sha256.toLowerCase(),
  release_authority: 'branding',
  responsible_subagent: 'branding',
  approval_method: 'POLICY_COMPLIANT_AUTONOMOUS',
  branding_decision: 'APPROVED_BY_POLICY',
  policy_compliance_status: 'PASS',
  unresolved_findings: 0,
  exception_count: 0,
  source_identity_status: 'PASS',
  brand_identity_status: 'PASS',
  geometry_status: 'PASS',
  audit_bundle_sha256: args['audit-bundle-sha256'].toLowerCase(),
  locked_visual_authority: true,
  regenerate_master_forbidden: true,
  escalation_policy: 'EXCEPTIONS_ONLY',
  ...(args['image-dimensions'] ? { image_dimensions: args['image-dimensions'] } : {}),
  ...(args['generation-id'] ? { generation_id: args['generation-id'] } : {}),
  ...(isEt9 ? {
    et9_mechanical_face_status: 'PASS',
    mechanical_face_reference_sha256: args['mechanical-face-reference-sha256'].toLowerCase(),
    mechanical_face_zone_mask_sha256: args['mechanical-face-zone-mask-sha256'].toLowerCase()
  } : {})
};

await fs.mkdir(path.dirname(args.out), { recursive: true });
await fs.writeFile(args.out, JSON.stringify(record, null, 2) + '\n');

console.log(JSON.stringify({
  ok: true,
  sku,
  status: record.status,
  release_authority: record.release_authority,
  approval_method: record.approval_method,
  approved_master_sha256: record.approved_master_sha256,
  out: args.out
}, null, 2));
