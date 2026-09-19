#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const [key, ...value] = arg.replace(/^--/, '').split('=');
  return [key, value.join('=')];
}));

const packetPath = args.packet;
if (!packetPath) {
  throw new Error('Usage: --packet=<path to *.authorized.json> [--out-dir=product-identity/render-candidates] [--model=gpt-image-1] [--size=1024x1024]');
}

async function fileHash(p) {
  const bytes = await fs.readFile(p);
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function buildPrompt(packet) {
  const g = packet.geometry_lock;
  const a = packet.artwork_lock;
  const id = packet.identity;
  return [
    'This is an image EDIT, not a new generation. The first attached image is the exact official manufacturer source photo and is the mandatory geometry authority. The other attached images are the ELIMFILTERS logo and the technology asset — use them exactly as provided, do not redraw them.',
    '',
    'Preserve exactly, with no redesign:',
    `- Overall silhouette: ${g.overall_silhouette}`,
    `- Body proportions: ${g.body_proportions}`,
    `- Top rim: ${g.top_rim}`,
    `- Mounting face / open end: ${g.baseplate_or_open_end}`,
    `- Thread geometry: ${g.thread_geometry}`,
    `- Gasket geometry: ${g.gasket_geometry}`,
    `- Inlet holes: ${g.inlet_hole_count_shape_and_positions}`,
    `- Support pattern: ${g.support_pattern}`,
    `- Camera perspective and composition: ${g.camera_perspective} ${g.composition}`,
    '',
    'Change only:',
    `- Body/container color to ${a.body_color_hex} (semi-matte industrial coating)`,
    `- Lithography/label color to ${a.lithography_color_hex} (metallic silver satin)`,
    '- Replace any manufacturer branding with the attached ELIMFILTERS logo, used exactly as provided',
    '- Add the attached technology asset badge exactly as provided',
    `- Add label text: SKU ${id.elimfilters_sku}, technology ${id.technology}, descriptor "${a.descriptor}", claim "${a.positioning_line}"`,
    '',
    'Forbidden: any manufacturer branding, secondary colors, invented generic spin-on geometry, spec-sheet/infographic elements (tables, QR codes, cross-reference panels), or any change to framing/perspective. The result must read as the same physical object from the source image, repainted and relabeled — not a new product.'
  ].join('\n');
}

async function toImagePart(filePath) {
  const bytes = await fs.readFile(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mime = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif' }[ext] || 'application/octet-stream';
  return new Blob([bytes], { type: mime });
}

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('STOP_MISSING_OPENAI_API_KEY');

  const packet = JSON.parse(await fs.readFile(packetPath, 'utf8'));
  if (packet.packet_type !== 'ELIMFILTERS_AUTHORIZED_RENDER_PACKET') throw new Error('STOP_NOT_A_RENDER_PACKET');
  if (packet.status !== 'PASS' || !packet.render_allowed) throw new Error('STOP_PACKET_NOT_PASS');

  // Re-verify hashes at generation time (defense in depth, the packet could be stale on disk)
  const s = packet.source;
  if (await fileHash(s.official_image_path) !== s.official_image_sha256) throw new Error('STOP_SOURCE_IMAGE_HASH_MISMATCH');
  const id = packet.identity;
  if (await fileHash(id.logo_asset_path) !== id.logo_asset_sha256) throw new Error('STOP_LOGO_HASH_MISMATCH');
  if (await fileHash(id.technology_asset_path) !== id.technology_asset_sha256) throw new Error('STOP_TECHNOLOGY_ASSET_HASH_MISMATCH');

  const model = args.model || 'gpt-image-1';
  const size = args.size || '1024x1024';
  const prompt = buildPrompt(packet);

  const form = new FormData();
  form.append('model', model);
  form.append('prompt', prompt);
  form.append('size', size);
  form.append('image[]', await toImagePart(s.official_image_path), path.basename(s.official_image_path));
  form.append('image[]', await toImagePart(id.logo_asset_path), path.basename(id.logo_asset_path));
  form.append('image[]', await toImagePart(id.technology_asset_path), path.basename(id.technology_asset_path));

  const response = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`STOP_OPENAI_REQUEST_FAILED:${response.status}:${errText.slice(0, 500)}`);
  }

  const result = await response.json();
  const b64 = result.data?.[0]?.b64_json;
  if (!b64) throw new Error('STOP_OPENAI_NO_IMAGE_RETURNED');
  const imageBytes = Buffer.from(b64, 'base64');
  const imageSha256 = crypto.createHash('sha256').update(imageBytes).digest('hex');

  const outDir = args['out-dir'] || 'product-identity/render-candidates';
  await fs.mkdir(outDir, { recursive: true });
  const code = packet.source.competitor_code;
  const imagePath = path.join(outDir, `${code}.${packet.phase.toLowerCase()}.candidate.png`);
  await fs.writeFile(imagePath, imageBytes);

  const metadata = {
    schema_version: '1.0',
    candidate_type: 'ELIMFILTERS_RENDER_CANDIDATE',
    generated_at: new Date().toISOString(),
    packet_path: path.resolve(packetPath),
    packet_sha256: await fileHash(packetPath),
    elimfilters_sku: packet.identity.elimfilters_sku,
    competitor_code: code,
    model,
    size,
    image_path: imagePath,
    image_sha256: imageSha256,
    approval_status: 'AWAITING_REVIEW'
  };
  const metadataPath = path.join(outDir, `${code}.${packet.phase.toLowerCase()}.candidate.json`);
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2) + '\n');

  console.log(JSON.stringify({ ok: true, image_path: imagePath, metadata_path: metadataPath, metadata }, null, 2));
}

const direct = process.argv[1]
  ? import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
  : false;

if (direct) main().catch((error) => {
  console.error(JSON.stringify({ ok: false, reason: error.message }, null, 2));
  process.exit(1);
});
