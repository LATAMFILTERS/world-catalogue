import crypto from 'node:crypto';
import dnsPromises, { Resolver } from 'node:dns/promises';
import axios from 'axios';

export const FRAM_WIDGET_HOST = 'fram_ymm.apacatapult.com';
export const SMTF_CONFIG_URL = 'https://showmethefilters.com/Config/ShowMeTheParts.json';

function evpBytesToKey(passphrase, salt, keyLength = 32, ivLength = 16) {
  let material = Buffer.alloc(0);
  let block = Buffer.alloc(0);
  const pass = Buffer.from(passphrase, 'utf8');
  while (material.length < keyLength + ivLength) {
    block = crypto.createHash('md5').update(Buffer.concat([block, pass, salt])).digest();
    material = Buffer.concat([material, block]);
  }
  return {
    key: material.subarray(0, keyLength),
    iv: material.subarray(keyLength, keyLength + ivLength)
  };
}

export function encryptCryptoJsAes(plaintext, passphrase) {
  const salt = crypto.randomBytes(8);
  const { key, iv } = evpBytesToKey(passphrase, salt);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return Buffer.concat([Buffer.from('Salted__'), salt, ciphertext]).toString('base64');
}export function unwrapJsonp(body = '') {
  const text = String(body).trim();
  const start = text.indexOf("('");
  const end = text.lastIndexOf("');");
  if (start < 0 || end <= start) return text;
  return text.slice(start + 2, end).replace(/\\'/g, "'").replace(/\\\\/g, '\\');
}

export async function loadPublicCatalogConfig() {
  const { data } = await axios.get(SMTF_CONFIG_URL, { timeout: 30000 });
  const config = typeof data === 'string' ? JSON.parse(data) : data;
  if (!config?.DataUrl || !config?.DefaultUserId) throw new Error('ShowMeTheFilters catalog configuration is incomplete');
  if (config.RecycleVideoDisplay1 !== true || Number(config.RecycleVideoDisplay5) !== 0) {
    throw new Error('Unsupported ShowMeTheParts cargo cipher configuration');
  }
  if (!config.RecycleVideoDisplay2 || !config.RecycleVideoDisplay3) throw new Error('Cargo parameter/passphrase unavailable');
  return {
    dataUrl: config.DataUrl,
    catalogId: config.DefaultUserId,
    cargoParameter: config.RecycleVideoDisplay2,
    passphrase: config.RecycleVideoDisplay3,
    source: SMTF_CONFIG_URL
  };
}

export function buildPlainLookup(query, config) {
  return `${query}&id=${config.catalogId}&storeid=&userid=`;
}export async function queryCatalog(query, { config, start = 0, limit = 100, timeout = 30000 } = {}) {
  const cfg = config || await loadPublicCatalogConfig();
  const plain = buildPlainLookup(query, cfg);
  const encrypted = encryptCryptoJsAes(plain, cfg.passphrase);
  const callback = `hermes_${Date.now()}`;
  const { data, status } = await axios.get(cfg.dataUrl, {
    timeout,
    responseType: 'text',
    params: {
      [cfg.cargoParameter]: encrypted,
      start,
      limit,
      callback
    }
  });
  return { status, plain, xml: unwrapJsonp(data), config: cfg };
}

function textTag(block, tag) {
  const match = String(block).match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? match[1].replace(/&amp;/g, '&').trim() : null;
}

export function parseFramSupplier(xml = '') {
  for (const match of String(xml).matchAll(/<name>([\s\S]*?)<\/name>/gi)) {
    if (/^Fram Filters$/i.test(textTag(match[1], 'data') || '')) {
      return { name: textTag(match[1], 'data'), id: textTag(match[1], 'id'), linecode: textTag(match[1], 'linecode'), brandid: textTag(match[1], 'brandid') };
    }
  }
  return null;
}export function parsePartList(xml = '') {
  const records = [];
  for (const match of String(xml).matchAll(/<partlistdata>([\s\S]*?)<\/partlistdata>/gi)) {
    const block = match[1];
    records.push({
      supplier: textTag(block, 'supplier'),
      part_number: textTag(block, 'part_no'),
      part_key: textTag(block, 'part_key'),
      part_type: textTag(block, 'part_type'),
      application_summary: textTag(block, 'bg'),
      supplier_id: textTag(block, 'supplierid'),
      brand_id: textTag(block, 'smtp_brandid'),
      aaia_brand_id: textTag(block, 'aaiabrandid'),
      image: textTag(block, 'image')
    });
  }
  return records;
}

async function resolveVia(host, server = null) {
  try {
    const addresses = server
      ? await (() => { const r = new Resolver(); r.setServers([server]); return r.resolve4(host); })()
      : await dnsPromises.resolve4(host);
    return { server: server || 'system', status: 'RESOLVED', addresses };
  } catch (error) {
    return { server: server || 'system', status: 'NOT_RESOLVED', code: error.code || null, message: error.message };
  }
}

export async function diagnoseFramWidgetDns(host = FRAM_WIDGET_HOST) {
  const results = await Promise.all([resolveVia(host), resolveVia(host, '1.1.1.1'), resolveVia(host, '8.8.8.8')]);
  const globallyMissing = results.every(item => item.status === 'NOT_RESOLVED');
  return { host, results, classification: globallyMissing ? 'UPSTREAM_PUBLIC_DNS_RECORD_MISSING' : 'DNS_RESOLUTION_AVAILABLE' };
}
export function parseTotalRecords(xml = '') {
  const match = String(xml).match(/\btotalrecords="(\d+)"/i);
  return match ? Number.parseInt(match[1], 10) : 0;
}

function decodeXmlText(value = '') {
  let text = String(value);
  for (let i = 0; i < 2; i += 1) {
    text = text
      .replace(/&amp;/gi, '&')
      .replace(/&quot;/gi, '"')
      .replace(/&apos;|&#39;/gi, "'")
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
      .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));
  }
  return text.trim();
}

export function parsePartAttributes(xml = '') {
  const records = [];
  for (const match of String(xml).matchAll(/<partsAttributes>([\s\S]*?)<\/partsAttributes>/gi)) {
    records.push({
      attribute: decodeXmlText(textTag(match[1], 'attribute') || ''),
      value: decodeXmlText(textTag(match[1], 'value') || ''),
      recno: textTag(match[1], 'recno')
    });
  }
  return records.filter(record => record.attribute);
}

export function parseApplications(xml = '') {
  const records = [];
  for (const match of String(xml).matchAll(/<partsapps>([\s\S]*?)<\/partsapps>/gi)) {
    const block = match[1];
    records.push({
      make: decodeXmlText(textTag(block, 'make') || ''),
      model: decodeXmlText(textTag(block, 'model') || ''),
      year: decodeXmlText(textTag(block, 'year') || ''),
      engine: decodeXmlText(textTag(block, 'engine') || ''),
      part_type: decodeXmlText(textTag(block, 'parttype') || ''),
      application_type: textTag(block, 'apptype') || null,
      quantity: Number.parseInt(textTag(block, 'Qty') || '1', 10) || 1
    });
  }
  return records.filter(record => record.make || record.model);
}

export function parseCrossReferences(xml = '') {
  const records = [];
  for (const match of String(xml).matchAll(/<interchangepartdata>([\s\S]*?)<\/interchangepartdata>/gi)) {
    const block = match[1];
    records.push({
      manufacturer: decodeXmlText(textTag(block, 'mfg') || ''),
      part_number: decodeXmlText(textTag(block, 'comp_no') || ''),
      source_part_number: decodeXmlText(textTag(block, 'part_no') || ''),
      part_key: textTag(block, 'part_key') || null,
      supplier: decodeXmlText(textTag(block, 'supplier') || ''),
      brand_id: textTag(block, 'smtp_brandid') || null,
      aaia_brand_id: textTag(block, 'aaiabrandid') || null,
      part_type: decodeXmlText(textTag(block, 'part_type') || '')
    });
  }
  return records.filter(record => record.manufacturer && record.part_number);
}

function normalizePartNumber(value = '') {
  return String(value).toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export async function fetchFramPartBundle(partNumber, { config, timeout = 30000 } = {}) {
  const cfg = config || await loadPublicCatalogConfig();
  const requested = normalizePartNumber(partNumber);
  const list = await queryCatalog(`lookup=partlist&partno=${encodeURIComponent(partNumber)}`, { config: cfg, limit: 100, timeout });
  const candidates = parsePartList(list.xml).filter(record => /^Fram Filters$/i.test(record.supplier || ''));
  const part = candidates.find(record => normalizePartNumber(record.part_number) === requested) || null;
  if (!part) return { found: false, requested_part_number: partNumber, candidates, config: cfg };

  const [detail, applications, crosses] = await Promise.all([
    queryCatalog(`lookup=partdetail&part=${encodeURIComponent(part.part_key)}`, { config: cfg, limit: 500, timeout }),
    queryCatalog(`lookup=app&part=${encodeURIComponent(part.part_key)}`, { config: cfg, limit: 5000, timeout }),
    queryCatalog(`lookup=partcross&part=${encodeURIComponent(part.part_key)}`, { config: cfg, limit: 5000, timeout })
  ]);

  return {
    found: true,
    requested_part_number: partNumber,
    part,
    attributes: parsePartAttributes(detail.xml),
    applications: parseApplications(applications.xml),
    cross_references: parseCrossReferences(crosses.xml),
    totals: {
      attributes: parseTotalRecords(detail.xml),
      applications: parseTotalRecords(applications.xml),
      cross_references: parseTotalRecords(crosses.xml)
    },
    source: { backend: cfg.dataUrl, catalog_id: cfg.catalogId, config_url: cfg.source }
  };
}
