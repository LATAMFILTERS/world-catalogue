#!/usr/bin/env node
import fs from 'node:fs/promises';

const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k,...v]=a.replace(/^--/,'').split('='); return [k,v.join('=')]; }));
if (!args.metadata) throw new Error('Usage: --metadata=<render-metadata.json> [--manifest=<manifest.json>]');
const metadata = JSON.parse(await fs.readFile(args.metadata, 'utf8'));
if (!metadata.edit_op) throw new Error('REJECT_OUTPUT:EDIT_OP_MISSING_OR_NULL');
const lineage = metadata.source_image_id || metadata.source_image_path || metadata.parent_gen_id || metadata.referenced_image_ids || metadata.source_lineage;
if (!lineage) throw new Error('REJECT_OUTPUT:SOURCE_LINEAGE_MISSING');
if (args.manifest) {
  const manifest = JSON.parse(await fs.readFile(args.manifest, 'utf8'));
  if (manifest.render_mode !== 'EDIT_ONLY' || manifest.manifest_status !== 'PASS') throw new Error('REJECT_OUTPUT:MANIFEST_NOT_AUTHORIZED');
  if (metadata.resolved_sku && metadata.resolved_sku !== manifest.resolved_sku) throw new Error('REJECT_OUTPUT:SKU_MISMATCH');
  if (metadata.technology && metadata.technology !== manifest.technology) throw new Error('REJECT_OUTPUT:TECHNOLOGY_MISMATCH');
  if (metadata.target_view && metadata.target_view !== manifest.target_view) throw new Error('REJECT_OUTPUT:TARGET_VIEW_MISMATCH');
}
console.log(JSON.stringify({ ok:true, result_status:'ACCEPTABLE_LINEAGE', edit_op:metadata.edit_op, lineage }, null, 2));
