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

async function fileHash(p) {
  const bytes = await fs.readFile(p);
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

export async function validateArtworkAuthorityBinding(packet) {
  const a = packet?.artwork_lock;
  const g = packet?.execution_guard;
  if (!a?.authority_path || !a?.authority_sha256) throw new Error('STOP_LITHOGRAPHY_AUTHORITY_BINDING_MISSING');
  if (g?.lithography_authority_required !== true || g?.exact_master_colors_required !== true || g?.locked_artwork_layout_required !== true || g?.direct_image_generation_forbidden !== true || g?.source_referenced_transformation_only !== true) {
    throw new Error('STOP_LITHOGRAPHY_EXECUTION_GUARD_INCOMPLETE');
  }
  if (await fileHash(a.authority_path) !== a.authority_sha256) throw new Error('STOP_LITHOGRAPHY_AUTHORITY_HASH_MISMATCH');
  const authority = JSON.parse(await fs.readFile(a.authority_path, 'utf8'));
  if (authority.authorityStatus !== 'ACTIVE' || authority.recordType !== a.authority_id) throw new Error('STOP_LITHOGRAPHY_AUTHORITY_NOT_ACTIVE');
  if (a.layout_mode !== 'LOCKED_CYLINDRICAL_PRINT_LAYOUT' || a.all_other_artwork_locked !== true || a.same_artwork_both_sides !== true || a.preserve_artwork_hierarchy !== true || a.proportional_scaling_only !== true) {
    throw new Error('STOP_LITHOGRAPHY_LAYOUT_NOT_LOCKED');
  }
  if (a.body_color_hex !== '#414141' || a.lithography_color_hex !== '#CBCBCB') throw new Error('STOP_MASTER_COLOR_MISMATCH');
  if (a.body_finish !== 'SEMI_MATTE_INDUSTRIAL_COATING' || a.lithography_finish !== 'METALLIC_SILVER_SATIN') throw new Error('STOP_MASTER_FINISH_MISMATCH');
  if (a.extra_text_allowed !== false || a.extra_icons_allowed !== false || a.secondary_colors_allowed !== false) throw new Error('STOP_UNAUTHORIZED_ARTWORK_CONTENT_ALLOWED');
  if (a.official_logo_asset !== packet?.identity?.logo_asset_path) throw new Error('STOP_LITHOGRAPHY_LOGO_BINDING_MISMATCH');
  if (a.positioning_line !== authority.lockedArtwork?.brandClaim || a.descriptor !== authority.lockedArtwork?.technologyDescriptor) throw new Error('STOP_LITHOGRAPHY_COPY_BINDING_MISMATCH');
  return { authority, authority_sha256: a.authority_sha256 };
}

export function buildPrompt(packet) {
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
    `- Repaint the can body to the exact master ${a.body_color_hex}; finish is ${a.body_finish}. Do not create a lighter gray, gradient redesign, gloss redesign, or alternative metallic paint.`,
    `- Apply all printed artwork in the single exact lithography master ${a.lithography_color_hex}; finish is ${a.lithography_finish}. No pure white and no secondary print color.`,
    '- Replace manufacturer branding with the attached ELIMFILTERS logo asset exactly as provided. Never retype, redraw, restyle, approximate, or substitute the logo.',
    '- Use the attached technology artwork exactly as provided. Never retype, redraw, restyle, approximate, or substitute the technology mark.',
    `- Variable fields only: SKU ${id.elimfilters_sku} and technology ${id.technology}.`,
    `- Locked copy: claim "${a.positioning_line}" and descriptor "${a.descriptor}".`,
    '- Preserve the approved artwork hierarchy and relative positions; proportional scaling only to fit the exact container printable area.',
    '- Preserve approved installation rotation-direction marks in the upper print band when visible in the authorized layout.',
    '- The same approved artwork system applies on both sides of the cylindrical filter.',
    '',
    'Forbidden: free-form label design, invented icons, feature badges, rewritten typography, reflowed hierarchy, extra text, manufacturer branding, secondary colors, invented generic spin-on geometry, spec-sheet/infographic elements (tables, QR codes, cross-reference panels), or any change to framing/perspective. The result must read as the same physical object from the source image, repainted and relabeled under the locked ELIMFILTERS cylindrical print authority — not a new product design.'
  ].join('\n');
}

export function detectImageMime(bytes) {
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]))) {
    return { mime: 'image/png', extension: '.png' };
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mime: 'image/jpeg', extension: '.jpg' };
  }
  if (
    bytes.length >= 12
    && bytes.subarray(0, 4).toString('ascii') === 'RIFF'
    && bytes.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return { mime: 'image/webp', extension: '.webp' };
  }
  throw new Error('STOP_UNSUPPORTED_IMAGE_INPUT_FORMAT');
}

async function toImagePart(filePath) {
  const bytes = await fs.readFile(filePath);
  const detected = detectImageMime(bytes);
  const uploadName = path.basename(filePath, path.extname(filePath)) + detected.extension;
  return {
    blob: new Blob([bytes], { type: detected.mime }),
    uploadName,
    mime: detected.mime
  };
}

export async function validateExistingCandidate({
  metadata,
  imagePath,
  packetSha256,
  packet
}) {
  if (!metadata || metadata.candidate_type !== 'ELIMFILTERS_RENDER_CANDIDATE') {
    throw new Error('STOP_EXISTING_CANDIDATE_METADATA_INVALID');
  }
  if (
    metadata.status !== 'RENDER_CANDIDATE_GENERATED'
    || metadata.render_mode !== 'SOURCE_REFERENCED_TRANSFORMATION'
    || metadata.generated_sku !== packet.identity.elimfilters_sku
    || metadata.competitor_code !== packet.source.competitor_code
    || metadata.render_spec_sha256 !== packetSha256
    || metadata.lithography_authority_sha256 !== packet.artwork_lock?.authority_sha256
    || metadata.body_color_hex !== '#414141'
    || metadata.lithography_color_hex !== '#CBCBCB'
    || metadata.artwork_layout_mode !== 'LOCKED_CYLINDRICAL_PRINT_LAYOUT'
  ) {
    throw new Error('STOP_EXISTING_CANDIDATE_STALE');
  }
  const currentHash = await fileHash(imagePath);
  if (currentHash !== metadata.candidate_sha256) {
    throw new Error('STOP_EXISTING_CANDIDATE_HASH_MISMATCH');
  }
  return {
    ...metadata,
    candidate_path: imagePath,
    candidate_sha256: currentHash
  };
}

async function main() {
  if (!packetPath) {
    throw new Error('Usage: --packet=<path to *.authorized.json> [--out-dir=product-identity/render-candidates] [--model=gpt-image-2.5-sunburst-2026-09-08] [--quality=high] [--size=1024x1024] [--preflight-only=true]');
  }
  const packet = JSON.parse(await fs.readFile(packetPath, 'utf8'));
  if (packet.packet_type !== 'ELIMFILTERS_AUTHORIZED_RENDER_PACKET') throw new Error('STOP_NOT_A_RENDER_PACKET');
  if (packet.status !== 'PASS' || !packet.render_allowed) throw new Error('STOP_PACKET_NOT_PASS');
  if (
    packet.execution_guard?.chat_generation_without_this_packet_forbidden !== true
    || packet.execution_guard?.geometry_evidence_required !== true
    || packet.execution_guard?.brand_evidence_required !== true
    || packet.execution_guard?.sku_resolution_required !== true
    || packet.execution_guard?.lithography_authority_required !== true
    || packet.execution_guard?.direct_image_generation_forbidden !== true
    || packet.execution_guard?.source_referenced_transformation_only !== true
  ) {
    throw new Error('STOP_PACKET_EXECUTION_GUARD_INCOMPLETE');
  }
  if (
    packet.catalog?.competitor_code !== packet.source?.competitor_code
    || !packet.identity?.elimfilters_sku
    || !packet.identity?.technology
  ) {
    throw new Error('STOP_PACKET_IDENTITY_INCONSISTENT');
  }
  const artworkAuthority = await validateArtworkAuthorityBinding(packet);

  // Re-verify hashes at generation time (defense in depth, the packet could be stale on disk)
  const s = packet.source;
  if (await fileHash(s.official_image_path) !== s.official_image_sha256) throw new Error('STOP_SOURCE_IMAGE_HASH_MISMATCH');
  const id = packet.identity;
  if (await fileHash(id.logo_asset_path) !== id.logo_asset_sha256) throw new Error('STOP_LOGO_HASH_MISMATCH');
  if (await fileHash(id.technology_asset_path) !== id.technology_asset_sha256) throw new Error('STOP_TECHNOLOGY_ASSET_HASH_MISMATCH');

  const model = args.model || 'gpt-image-2.5-sunburst-2026-09-08';
  const quality = args.quality || 'high';
  const size = args.size || '1024x1024';
  const prompt = buildPrompt(packet);
  const packetSha256 = await fileHash(packetPath);

  const sourcePart = await toImagePart(s.official_image_path);
  const logoPart = await toImagePart(id.logo_asset_path);
  const technologyPart = await toImagePart(id.technology_asset_path);
  const outDir = args['out-dir'] || 'product-identity/render-candidates';
  const code = packet.source.competitor_code;
  const imagePath = path.join(outDir, `${code}.${packet.phase.toLowerCase()}.candidate.png`);
  const metadataPath = path.join(outDir, `${code}.${packet.phase.toLowerCase()}.candidate.json`);

  if (String(args['preflight-only'] || '').toLowerCase() === 'true') {
    console.log(JSON.stringify({
      ok: true,
      status: 'RENDER_CANDIDATE_PREFLIGHT_PASS',
      competitor_code: s.competitor_code,
      generated_sku: id.elimfilters_sku,
      technology: id.technology,
      render_spec_sha256: packetSha256,
      lithography_authority_sha256: artworkAuthority.authority_sha256,
      body_color_hex: packet.artwork_lock.body_color_hex,
      lithography_color_hex: packet.artwork_lock.lithography_color_hex,
      model,
      quality,
      size,
      source_input: { path: s.official_image_path, mime: sourcePart.mime, sha256: s.official_image_sha256 },
      logo_input: { path: id.logo_asset_path, mime: logoPart.mime, sha256: id.logo_asset_sha256 },
      technology_input: { path: id.technology_asset_path, mime: technologyPart.mime, sha256: id.technology_asset_sha256 }
    }, null, 2));
    return;
  }

  const force = String(args.force || '').toLowerCase() === 'true';
  if (!force) {
    const metadataRaw = await fs.readFile(metadataPath, 'utf8').catch(() => null);
    const imageBytesExisting = await fs.readFile(imagePath).catch(() => null);
    if (metadataRaw || imageBytesExisting) {
      if (!metadataRaw || !imageBytesExisting) {
        throw new Error('STOP_EXISTING_CANDIDATE_INCOMPLETE');
      }
      let existingMetadata;
      try {
        existingMetadata = JSON.parse(metadataRaw);
      } catch {
        throw new Error('STOP_EXISTING_CANDIDATE_METADATA_INVALID');
      }
      const validated = await validateExistingCandidate({
        metadata: existingMetadata,
        imagePath,
        packetSha256,
        packet
      });
      console.log(JSON.stringify({
        ok: true,
        status: 'RENDER_CANDIDATE_GENERATED',
        reused_existing: true,
        generated_sku: validated.generated_sku,
        candidate_path: validated.candidate_path,
        candidate_sha256: validated.candidate_sha256,
        render_spec_sha256: validated.render_spec_sha256,
        lithography_authority_sha256: validated.lithography_authority_sha256,
        body_color_hex: validated.body_color_hex,
        lithography_color_hex: validated.lithography_color_hex,
        metadata_path: metadataPath,
        metadata: validated
      }, null, 2));
      return;
    }
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('STOP_MISSING_OPENAI_API_KEY');

  const form = new FormData();
  form.append('model', model);
  form.append('prompt', prompt);
  form.append('size', size);
  form.append('quality', quality);
  form.append('output_format', 'png');
  form.append('image[]', sourcePart.blob, sourcePart.uploadName);
  form.append('image[]', logoPart.blob, logoPart.uploadName);
  form.append('image[]', technologyPart.blob, technologyPart.uploadName);

  form.append('n', '1');

  const response = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form
  });
  const openaiRequestId = response.headers.get('x-request-id') || null;

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`STOP_OPENAI_REQUEST_FAILED:${response.status}:${errText.slice(0, 500)}`);
  }

  const result = await response.json();
  const b64 = result.data?.[0]?.b64_json;
  if (!b64) throw new Error('STOP_OPENAI_NO_IMAGE_RETURNED');
  const imageBytes = Buffer.from(b64, 'base64');
  const imageSha256 = crypto.createHash('sha256').update(imageBytes).digest('hex');

  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(imagePath, imageBytes);

  const metadata = {
    schema_version: '1.0',
    candidate_type: 'ELIMFILTERS_RENDER_CANDIDATE',
    status: 'RENDER_CANDIDATE_GENERATED',
    generated_at: new Date().toISOString(),
    packet_path: path.resolve(packetPath),
    packet_sha256: packetSha256,
    render_spec_sha256: packetSha256,
    generated_sku: packet.identity.elimfilters_sku,
    elimfilters_sku: packet.identity.elimfilters_sku,
    competitor_code: code,
    render_mode: 'SOURCE_REFERENCED_TRANSFORMATION',
    model,
    quality,
    size,
    output_format: 'png',
    openai_request_id: openaiRequestId,
    source_image_sha256: s.official_image_sha256,
    logo_asset_sha256: id.logo_asset_sha256,
    technology_asset_sha256: id.technology_asset_sha256,
    lithography_authority_id: packet.artwork_lock.authority_id,
    lithography_authority_sha256: artworkAuthority.authority_sha256,
    body_color_hex: packet.artwork_lock.body_color_hex,
    lithography_color_hex: packet.artwork_lock.lithography_color_hex,
    artwork_layout_mode: packet.artwork_lock.layout_mode,
    source_input_mime: sourcePart.mime,
    logo_input_mime: logoPart.mime,
    technology_input_mime: technologyPart.mime,
    candidate_path: imagePath,
    candidate_sha256: imageSha256,
    image_path: imagePath,
    image_sha256: imageSha256,
    approval_status: 'GENERATED_UNAUDITED'
  };
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2) + '\n');

  console.log(JSON.stringify({
    ok: true,
    status: 'RENDER_CANDIDATE_GENERATED',
    generated_sku: metadata.generated_sku,
    candidate_path: imagePath,
    candidate_sha256: imageSha256,
    render_spec_sha256: packetSha256,
    lithography_authority_sha256: artworkAuthority.authority_sha256,
    body_color_hex: packet.artwork_lock.body_color_hex,
    lithography_color_hex: packet.artwork_lock.lithography_color_hex,
    metadata_path: metadataPath,
    metadata
  }, null, 2));
}

const direct = process.argv[1]
  ? import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
  : false;

if (direct) main().catch((error) => {
  console.error(JSON.stringify({ ok: false, reason: error.message }, null, 2));
  process.exit(1);
});
