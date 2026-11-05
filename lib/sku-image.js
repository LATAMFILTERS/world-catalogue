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
  if (!/^[A-Z][A-Z0-9-]*\d[A-Z]?$/.test(wanted)) return null;
  let parsed;
  try { parsed = new URL(String(url || '')); } catch { return null; }
  // Approved legacy R2 public host: only this exact ET90010 image is allowed.
  // All other SKUs continue to require the ELIMFILTERS CDN.
  const et90010R2 = 'https://pub-fee72f3f35274550bd8a47b181823e33.r2.dev/fleetguard/page-1/01-20/ET90010.png';
  if (wanted === 'ET90010' && String(url) === et90010R2) return et90010R2;
  if (parsed.protocol !== 'https:' || parsed.hostname !== CDN_HOST || parsed.port || parsed.username || parsed.password) return null;
  let path;
  try { path = decodeURIComponent(parsed.pathname).toUpperCase(); } catch { return null; }
  const parts = path.split('/').filter(Boolean);
  if (!parts.length || parts.some((part) => part === '..' || part === '.')) return null;
  // products/<SKU>/... (canonical layout with manifest.json and approved/<sha256>.png)
  if (parts[0] === 'PRODUCTS' && parts[1] === wanted && parts.length >= 3) return String(url);
  // other uploads: the file name must START with this exact SKU followed by a separator or the
  // extension (EL82100.png, EL82100-front-approved.png, EL82100 (2).png, EL82100_v2.webp). A longer
  // or different SKU that merely shares the prefix (EL821000.png, EL82100X.png) never matches.
  const name = parts[parts.length - 1];
  const own = new RegExp(`^${escapeRegExp(wanted)}(?:[^A-Z0-9][^/]*)?\\.${IMAGE_EXT.toUpperCase()}$`);
  if (own.test(name)) return String(url);
  return null;
}

module.exports = { CDN_HOST, imageUrlForSku };
