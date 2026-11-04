'use strict';

// A product image may appear on a SKU's page only when it lives on the ELIMFILTERS CDN
// (Cloudflare R2, bucket elimfilters-renders) AND its object key names that exact SKU.
// This mirrors the key shapes accepted by lib/r2-catalog-image-sync.js, so an image can never
// be shown on the page of a different SKU even if a catalogue row points at the wrong object.
const CDN_HOST = 'cdn.elimfilters.com';
const IMAGE_EXT = '(?:png|jpe?g|webp)';

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function imageUrlForSku(url, sku) {
  const wanted = String(sku || '').trim().toUpperCase();
  if (!/^[A-Z][A-Z0-9-]*\d$/.test(wanted)) return null;
  let parsed;
  try { parsed = new URL(String(url || '')); } catch { return null; }
  if (parsed.protocol !== 'https:' || parsed.hostname !== CDN_HOST || parsed.port || parsed.username || parsed.password) return null;
  let path;
  try { path = decodeURIComponent(parsed.pathname).toUpperCase(); } catch { return null; }
  const parts = path.split('/').filter(Boolean);
  if (!parts.length || parts.some((part) => part === '..' || part === '.')) return null;
  // products/<SKU>/... (canonical layout with manifest.json and approved/<sha256>.png)
  if (parts[0] === 'PRODUCTS' && parts[1] === wanted && parts.length >= 3) return String(url);
  // legacy uploads: <SKU>.png or <SKU>-...-approved[-opt].png, never a different SKU
  const name = parts[parts.length - 1];
  const legacy = new RegExp(`^${escapeRegExp(wanted)}(?:-(?:[A-Z0-9-]+-)?APPROVED(?:-OPT)?)?\\.${IMAGE_EXT.toUpperCase()}$`);
  if (legacy.test(name)) return String(url);
  return null;
}

module.exports = { CDN_HOST, imageUrlForSku };
