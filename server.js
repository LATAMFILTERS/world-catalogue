require('dotenv').config();
const express = require('express');
const { Client, Pool } = require('pg');
const cors = require('cors');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');

// ─── Rate Limiters ────────────────────────────────────────────────────────────
const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again in a minute.' },
});
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many admin requests.' },
});
// Higher limit for bulk import endpoints (Mann LD: ~100+ batches of 20)
const importLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many import requests.' },
});
// ─── Admin key middleware ─────────────────────────────────────────────────────
const ADMIN_KEY = process.env.ADMIN_KEY;
if (!ADMIN_KEY) throw new Error('ADMIN_KEY environment variable is required');

const _extractAdminKey = (req) => {
  const authHeader = req.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) return authHeader.slice(7).trim();
  return '';
};
const requireAdmin = (req, res, next) => {
  const key = _extractAdminKey(req);
  if (!key || key !== ADMIN_KEY) return res.status(403).json({ error: 'forbidden' });
  next();
};

// Prevent unhandled errors from crashing the process
process.on('uncaughtException', (err) => console.error('[uncaughtException]', err.message));
process.on('unhandledRejection', (reason) => console.error('[unhandledRejection]', reason));

const app = express();
app.set('trust proxy', 1);

// ─── HTTPS enforcement + security headers (production only) ────────────────────────────────────────
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure && req.get('x-forwarded-proto') !== 'https') {
    return res.redirect(301, 'https://' + req.get('host') + req.originalUrl);
  }
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});

// Healthcheck FIRST — must respond before anything else can fail
app.get('/api/status', (req, res) => res.json({ status: 'ok', version: '3.8.0' }));


app.use(cors({
  origin: [
    'https://elimfilters.com',
    'https://www.elimfilters.com',
    'https://part-search.elimfilters.com',
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Import endpoints need larger body limit (Mann fitment can be 300+ rows per product)
app.use('/api/import', express.json({ charset: 'utf-8', limit: '10mb' }));
app.use(express.json({ charset: 'utf-8', limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
const frontendStatic = express.static('frontend/out');
const partSearchStatic = express.static('part-search');

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const host = req.get('host') || req.hostname || '';
  if (host.includes('part-search')) {
    partSearchStatic(req, res, next);
  } else {
    frontendStatic(req, res, next);
  }
});
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  express.static('public')(req, res, next);
});
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  express.static('www')(req, res, next);
});

const _escHtml = (str) => String(str ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#x27;');

const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY;
async function _verifyTurnstile(token, ip) {
  if (!TURNSTILE_SECRET) return true; // skip if not configured
  try {
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: TURNSTILE_SECRET, response: token, remoteip: ip }),
    });
    const data = await r.json();
    return data.success === true;
  } catch {
    return false;
  }
}

// Contact form endpoint
app.post('/api/contact', searchLimiter, async (req, res) => {
  const { name, email, phone, company, message, turnstileToken } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (name.length > 200 || email.length > 254 || message.length > 5000 ||
      (phone && phone.length > 30) || (company && company.length > 200)) {
    return res.status(400).json({ error: 'Input exceeds maximum length' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  if (!await _verifyTurnstile(turnstileToken, req.ip)) {
    return res.status(400).json({ error: 'Captcha verification failed' });
  }
  const safeName    = _escHtml(name);
  const safeEmail   = _escHtml(email);
  const safePhone   = _escHtml(phone || '—');
  const safeCompany = _escHtml(company || '—');
  const safeMessage = _escHtml(message).replace(/\n/g, '<br>');
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtpout.secureserver.net',
      port: 465,
      secure: true,
      auth: {
        user: 'info@elimfilters.com',
        pass: process.env.GODADDY_MAIL_PASS,
      },
    });
    await transporter.sendMail({
      from: '"ELIMFILTERS Web" <info@elimfilters.com>',
      to: 'info@elimfilters.com',
      replyTo: safeEmail,
      subject: `[Web Contact] ${safeName} — ${safeCompany}`,
      html: `
        <h2 style="color:#000">New contact from elimfilters.com</h2>
        <table cellpadding="8" style="border-collapse:collapse;width:100%">
          <tr><td><b>Name</b></td><td>${safeName}</td></tr>
          <tr><td><b>Email</b></td><td>${safeEmail}</td></tr>
          <tr><td><b>Phone</b></td><td>${safePhone}</td></tr>
          <tr><td><b>Company</b></td><td>${safeCompany}</td></tr>
        </table>
        <h3>Message</h3>
        <p style="background:#f5f5f5;padding:1rem">${safeMessage}</p>
      `,
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('[contact]', err.message);
    res.status(500).json({ error: 'Failed to send email' });
  }
});


// Distributor application endpoint
app.post('/api/distributor', searchLimiter, async (req, res) => {
  const {
    companyName, legalName, contactName, email, phone,
    country, state, employees, yearsInBusiness,
    currentProducts, serviceArea, message,
  } = req.body || {};

  if (!companyName || !contactName || !email || !country) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (email.length > 254 || companyName.length > 200 || contactName.length > 200 ||
      (phone && phone.length > 30) || (message && message.length > 5000)) {
    return res.status(400).json({ error: 'Input exceeds maximum length' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  if (!await _verifyTurnstile(req.body.turnstileToken, req.ip)) {
    return res.status(400).json({ error: 'Captcha verification failed' });
  }

  const esc = _escHtml;
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtpout.secureserver.net',
      port: 465,
      secure: true,
      auth: { user: 'info@elimfilters.com', pass: process.env.GODADDY_MAIL_PASS },
    });
    await transporter.sendMail({
      from: '"ELIMFILTERS Web" <info@elimfilters.com>',
      to: 'distribution_network@elimfilters.com',
      replyTo: esc(email),
      subject: `[Distributor] ${esc(companyName)} — ${esc(country)}`,
      html: `
        <h2 style="color:#000">New distributor application — elimfilters.com</h2>
        <table cellpadding="8" style="border-collapse:collapse;width:100%;font-family:sans-serif">
          <tr style="background:#f5f5f5"><td><b>Company</b></td><td>${esc(companyName)}</td></tr>
          <tr><td><b>Legal name</b></td><td>${esc(legalName || '—')}</td></tr>
          <tr style="background:#f5f5f5"><td><b>Contact</b></td><td>${esc(contactName)}</td></tr>
          <tr><td><b>Email</b></td><td>${esc(email)}</td></tr>
          <tr style="background:#f5f5f5"><td><b>Phone</b></td><td>${esc(phone || '—')}</td></tr>
          <tr><td><b>Country</b></td><td>${esc(country)}</td></tr>
          <tr style="background:#f5f5f5"><td><b>State/Region</b></td><td>${esc(state || '—')}</td></tr>
          <tr><td><b>Employees</b></td><td>${esc(employees || '—')}</td></tr>
          <tr style="background:#f5f5f5"><td><b>Years in business</b></td><td>${esc(yearsInBusiness || '—')}</td></tr>
          <tr><td><b>Current products</b></td><td>${esc(currentProducts || '—')}</td></tr>
          <tr style="background:#f5f5f5"><td><b>Service area</b></td><td>${esc(serviceArea || '—')}</td></tr>
        </table>
        ${message ? `<h3>Additional message</h3><p style="background:#f5f5f5;padding:1rem">${esc(message).replace(/\n/g, '<br>')}</p>` : ''}
      `,
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('[distributor]', err.code || 'SMTP error');
    res.status(500).json({ error: 'Failed to send application' });
  }
});

// Middleware para encoding UTF-8 — solo rutas API, no archivos estáticos ni webhook
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
  }
  next();
});

const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL_VERIFY === 'true'
    ? { rejectUnauthorized: true }
    : { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10,
};
const pool = new Pool(dbConfig);

// Filter brands (competitors) — everything else is an OEM equipment manufacturer
const COMPETITOR_BRANDS = new Set([
  'DONALDSON','BALDWIN','FLEETGUARD','MANN','MANN+HUMMEL','MANN-HUMMEL',
  'WIX','FRAM','PUROLATOR','NAPA','AC DELCO','ACDELCO','BOSCH','MAHLE',
  'HENGST','SAKURA','HASTINGS','LUBER-FINER','LUBERFINER','PARKER',
  'PALL','HYDAC','MP FILTRI','MPFILTRI','UFI','CHAMPION','COOPERSFITERS',
  'COOPERSFILTERS','MOTORCRAFT','KNECHT','SOGEFI','FILTRON','SOFIMA',
  'FIAAM','NIPPARTS','STARLINE','CHAMPION LABS','CARQUEST','PRONTO',
  'DEFENSE','PENNZOIL','CASTROL','MOBIL','SHELL','TOTAL','DENSO',
  'TISCO','TRACTORPARTS','AGCO','ATLAS COPCO','SULLAIR','INGERSOLL RAND',
  'COMPAIR','GARDNER DENVER','QUINCY','LEROI','KOBELCO COMPRESSORS',
  'ALCO','INLINE','GOLDENROD','RACOR','PARKER RACOR','DAVCO',
  'FLEETRITE','JOHN DEERE PARTS','CAT PARTS','CASE PARTS',
  'EUROPART','DINEX','TRUCKTEC','FEBI','SWAG','MEYLE','VALEO',
  'ELOFIC','WABCO','KNORR','ALLISON','ZF',
]);

function isCompetitor(manufacturer) {
  if (!manufacturer) return false;
  const m = manufacturer.toUpperCase().trim();
  // Direct match
  if (COMPETITOR_BRANDS.has(m)) return true;
  // Partial match for common patterns
  return m.includes('FILTER') || m.includes('FILTR') || m.includes('FILTRO');
}

function parseRefs(arr){
  if(!arr) return [];
  return arr.map(item => ({
    manufacturer: item.manufacturer || item.brand || 'UNKNOWN',
    code: item.code
  }));
}

// ── Shared: resolve alternatives[] P-codes → ELIMFILTERS SKUs + inherit data ──
// Called from every search endpoint so all modes (part / VIN / equipment) benefit.
// alternatives[] is stored as codigo_base values ("P552100"). This function resolves
// them to EL-SKUs in one batch query and inherits equipment_applications /
// competitor_codes from the source product when the current product has none.
async function enrichAlternatives(products, client) {
  const withAlts = products.filter(p =>
    Array.isArray(p.alternatives) && p.alternatives.length > 0
  );
  if (!withAlts.length) return;

  const altCodes = [...new Set(withAlts.flatMap(p =>
    p.alternatives
      .map(a => typeof a === 'object' ? (a.sku || a.code || '') : String(a))
      .filter(Boolean)
      .map(c => c.toUpperCase())
  ))];
  if (!altCodes.length) return;

  const { rows } = await client.query(
    `SELECT sku, codigo_base, oem_codes, competitor_codes, equipment_applications
     FROM elimfilters_catalog
     WHERE UPPER(codigo_base) = ANY($1)`,
    [altCodes]
  );

  const altMap = {};
  rows.forEach(r => { if (r.codigo_base) altMap[r.codigo_base.toUpperCase()] = r; });

  for (const p of withAlts) {
    const resolvedSkus = [];
    for (const a of p.alternatives) {
      const cb = (typeof a === 'object' ? (a.sku || a.code || '') : String(a)).toUpperCase();
      const src = altMap[cb];
      if (!src) continue;
      if (src.sku) resolvedSkus.push(src.sku);
      if (p.equipment_applications.length === 0 && Array.isArray(src.equipment_applications) && src.equipment_applications.length) {
        p.equipment_applications = src.equipment_applications;
      }
      if (p.competitor_codes.length === 0) {
        const srcRefs = splitRefs([...parseRefs(src.oem_codes), ...parseRefs(src.competitor_codes)]);
        if (srcRefs.competitor.length) p.competitor_codes = srcRefs.competitor;
        if (p.oem_codes.length === 0 && srcRefs.oem.length) p.oem_codes = srcRefs.oem;
      }
    }
    if (resolvedSkus.length > 0) p.alternatives = resolvedSkus;
  }
}

// Split a combined refs array into { oem, competitor }
function splitRefs(arr) {
  if (!arr || !Array.isArray(arr)) return { oem: [], competitor: [] };
  const oem = [], competitor = [];
  arr.forEach(item => {
    const mfr = item.manufacturer || item.brand || '';
    if (isCompetitor(mfr)) competitor.push(item);
    else oem.push(item);
  });
  return { oem, competitor };
}

function detectLang(req) {
  if (req.query.lang) {
    const qLang = String(req.query.lang).toLowerCase().trim();
    if (qLang === 'es' || qLang === 'en' || qLang === 'pt' || qLang === 'fr' || qLang === 'it' || qLang === 'nl' || qLang === 'ru' || qLang === 'zh' || qLang === 'ja' || qLang === 'ar' || qLang === 'fa') {
      return qLang;
    }
  }
  const langs = (req.headers['accept-language'] || '').toLowerCase()
    .split(',').map(l => l.split(';')[0].trim());
  return langs.some(l => l.startsWith('es')) ? 'es' : 'en';
}

const PROPRIETARY_SUBTYPES = new Set([
  'synteq xp', 'synteq', 'ultra-web nanofiber', 'aquabloc® ii', 'aquabloc ii',
  'alpha-web™', 'alpha-web', 'synteq xp™',
]);
function safeSubtype(val, lang = 'en') {
  const text = extractText(val, lang);
  if (!text) return null;
  if (/[®™]/.test(text)) return null;
  if (PROPRIETARY_SUBTYPES.has(text.toLowerCase())) return null;
  return text;
}

function extractText(val, lang = 'en') {
  if (val === null || val === undefined) return null;
  // Already an object (JSONB from pg)
  if (typeof val === 'object' && !Array.isArray(val)) {
    return val[lang] || val.en || val.es || Object.values(val)[0] || null;
  }
  // String – may be raw text OR a JSON-encoded object
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const p = JSON.parse(trimmed);
        if (p && typeof p === 'object' && !Array.isArray(p)) {
          return p[lang] || p.en || p.es || Object.values(p)[0] || val;
        }
      } catch (_) {}
    }
    return val; // plain text
  }
  return String(val);
}

const TECH_LOGO_MAP = {
  'syntrax': 'sintrax', 'sintrax': 'sintrax',
  'nanoforce': 'nanoforce',
  'macrocore': 'macrocore',
  'intekcore': 'intekcore',
  'drycore': 'drycore',
  'duratech': 'duratech',
  'cooltech': 'cooltech',
  'syntepore': 'syntepore', 'syntapore': 'syntepore',
  'microkappa': 'microkappa',
  'gasultra': 'gasultra',
  'aquaguard': 'aquaguard',
  'marineclean': 'marineclean',
  'blueclean': 'blueclean',
};

function getTechLogo(tech) {
  if (!tech) return null;
  const key = tech.toLowerCase().replace(/[™®\s™]/g, '').trim();
  const mapped = TECH_LOGO_MAP[key];
  return mapped ? `/assets/logo-${mapped}.png` : null;
}

// Canonical technology name corrections (DB may have older/misspelled variants)
const TECH_NAME_FIXES = { 'SYNTAPORE': 'SYNTEPORE', 'SYNTAPORE™': 'SYNTEPORE™' };

function buildFilterData(row, lang = 'en'){
  let subtype = safeSubtype(row.sub_type, lang);

  // Enforce rule: No Cellulose/Celulosa media (sub_type) for any filter
  if (subtype && (subtype.toUpperCase() === 'CELLULOSE' || subtype.toUpperCase() === 'CELULOSA')) {
    subtype = lang === 'es' ? 'Híbrida' : 'Genuine Media';
  }

  // Re-classify on every response: after the consolidation migration oem_codes
  // may contain competitor filter-brand codes. Merging both arrays and running
  // splitRefs() keeps OEM equipment manufacturers and competitor filter brands
  // in the correct columns regardless of what the DB stored.
  const refs = splitRefs([...parseRefs(row.oem_codes), ...parseRefs(row.competitor_codes)]);

  return {
    elimfilters_sku: row.sku,
    description: row.description || null,
    filter_type: extractText(row.filter_type, lang),
    filter_subtype: subtype,
    technology: TECH_NAME_FIXES[row.technology] || row.technology || null,
    technology_logo: getTechLogo(TECH_NAME_FIXES[row.technology] || row.technology),
    installation_type: row.installation_type || null,
    thread_size: row.thread_size || null,
    height_mm: row.height_mm || null,
    outer_diameter_mm: row.outer_diameter_mm || null,
    gasket_od_mm: row.gasket_od_mm || null,
    gasket_id_mm: row.gasket_id_mm || null,
    iso_test_method: row.iso_test_method || null,
    micron_rating: row.micron_rating || null,
    nominal_efficiency: row.nominal_efficiency || null,
    burst_pressure_psi: row.burst_pressure_psi || null,
    collapse_pressure_psi: row.collapse_pressure_psi || null,
    duty: row.duty || null,
    oem_codes:        refs.oem,
    competitor_codes: refs.competitor,
    brand_crossrefs: row.brand_crossrefs || {},
    alternatives: row.alternatives || [],
    equipment_applications: row.equipment_applications || []
  };
}

// Duplicate status route removed — the authoritative one is at top of file (v3.8.0)








// POST /api/kits — create a kit from filter SKUs + equipment name
app.post('/api/kits', adminLimiter, requireAdmin, async (req, res) => {
  const { name, equipment_ref, filter_skus } = req.body;
  if (!name || !Array.isArray(filter_skus) || filter_skus.length === 0)
    return res.status(400).json({ success: false, error: 'name and filter_skus[] required' });
  if (name.length > 200 || (equipment_ref && equipment_ref.length > 500) || filter_skus.length > 100)
    return res.status(400).json({ success: false, error: 'Input exceeds maximum length' });

  const client = await pool.connect();
  try {

    // Determine duty from the first filter found
    const sample = await client.query(
      'SELECT duty FROM elimfilters_catalog WHERE sku = ANY($1) AND duty IS NOT NULL LIMIT 1',
      [filter_skus]
    );
    const duty = sample.rows[0]?.duty || 'LD';
    const prefix = duty === 'HD' ? 'EK3' : 'EK5';

    // Generate next kit SKU
    const last = await client.query(
      `SELECT kit_sku FROM maintenance_kits WHERE kit_sku LIKE $1 ORDER BY kit_sku DESC LIMIT 1`,
      [prefix + '%']
    );
    const nextNum = last.rows.length
      ? String(parseInt(last.rows[0].kit_sku.slice(3)) + 1).padStart(4, '0')
      : '0001';
    const kit_sku = prefix + nextNum;

    await client.query('BEGIN');
    await client.query(
      'INSERT INTO maintenance_kits (kit_sku, name, equipment_ref, duty) VALUES ($1,$2,$3,$4)',
      [kit_sku, name, equipment_ref || null, duty]
    );
    for (const fsku of filter_skus) {
      if (!/^[A-Z]{2,3}[0-9]{4,7}[A-Z0-9]?$/.test(String(fsku).trim().toUpperCase())) continue;
      await client.query(
        'INSERT INTO kit_components (kit_sku, filter_sku) VALUES ($1,$2) ON CONFLICT DO NOTHING',
        [kit_sku, fsku.toUpperCase()]
      );
    }
    await client.query('COMMIT');

    res.status(201).json({ success: true, kit_sku, duty, name, equipment_ref, filter_skus });
  } catch(e) {
    await client.query('ROLLBACK').catch(()=>{});
    console.error('[kits POST]', e.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// GET /api/kits/:kit_sku — full kit details with all component filters
app.get('/api/kits/:kit_sku', searchLimiter, async (req, res) => {
  const kit_sku = req.params.kit_sku.trim().toUpperCase();
  const lang = detectLang(req);
  const client = await pool.connect();
  try {
    await client.query("SET client_encoding = 'UTF8'");

    const kit = await client.query(
      'SELECT * FROM maintenance_kits WHERE kit_sku = $1',
      [kit_sku]
    );
    if (!kit.rows.length) return res.status(404).json({ success: false, error: 'Kit not found' });

    const components = await client.query(
      `SELECT c.*, kc.kit_sku
       FROM elimfilters_catalog c
       JOIN kit_components kc ON kc.filter_sku = c.sku
       WHERE kc.kit_sku = $1`,
      [kit_sku]
    );

    res.json({
      success: true,
      kit: {
        kit_sku: kit.rows[0].kit_sku,
        name: kit.rows[0].name,
        equipment_ref: kit.rows[0].equipment_ref,
        duty: kit.rows[0].duty,
        filters: components.rows.map(row => buildFilterData(row, lang))
      }
    });
  } catch(e) {
    console.error('[kits GET]', e.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// GET /api/filters/kits?sku=XXX — which kits contain this filter
app.get('/api/filters/kits', searchLimiter, async (req, res) => {
  const sku = (req.query.sku || '').trim().toUpperCase();
  if (!sku) return res.json({ success: false, kits: [] });
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT mk.kit_sku, mk.name, mk.equipment_ref, mk.duty
       FROM maintenance_kits mk
       JOIN kit_components kc ON kc.kit_sku = mk.kit_sku
       WHERE kc.filter_sku = $1`,
      [sku]
    );
    res.json({ success: true, kits: result.rows });
  } catch(e) {
    console.error('[filters/kits]', e.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    client.release();
  }
});


app.get('/api/filters/alternatives', searchLimiter, async (req, res) => {
  const sku = (req.query.sku || '').trim().toUpperCase();
  if (!sku) return res.json({success: false, alternatives: []});

  const client = await pool.connect();
  try {
    await client.query("SET client_encoding = 'UTF8'");
    const result = await client.query(
      `SELECT sku, codigo_base, description, filter_type, sub_type, technology,
              duty, oem_codes, competitor_codes, brand_crossrefs,
              alternatives, equipment_applications
       FROM elimfilters_catalog
       WHERE sku = $1`,
      [sku]
    );
    if (!result.rows.length) return res.json({ success: false, alternatives: [] });
    const row = result.rows[0];
    const alts = Array.isArray(row.alternatives) ? row.alternatives : [];
    if (!alts.length) return res.json({ success: true, alternatives: [] });

    const altCodes = alts
      .map(a => typeof a === 'object' ? (a.sku || a.code || '') : String(a))
      .filter(Boolean)
      .map(c => c.toUpperCase());

    const { rows: altRows } = await client.query(
      `SELECT sku, codigo_base, description, filter_type, sub_type, technology,
              duty, oem_codes, competitor_codes, brand_crossrefs,
              alternatives, equipment_applications
       FROM elimfilters_catalog
       WHERE UPPER(codigo_base) = ANY($1)`,
      [altCodes]
    );

    const lang = detectLang(req);
    res.json({ success: true, alternatives: altRows.map(r => buildFilterData(r, lang)) });
  } catch(e) {
    console.error('[filters/alternatives]', e.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    client.release();
  }
});


// ─── GET /api/search ──────────────────────────────────────────────────────────────────────────────
app.get('/api/search', searchLimiter, async (req, res) => {
  const raw = (req.query.q || req.query.sku || '').trim();
  if (!raw) return res.json({ success: false, results: [] });

  const SEARCH_KEY = process.env.SEARCH_API_KEY;
  const authHeader = req.get('authorization') || '';
  const providedKey = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!SEARCH_KEY || providedKey !== SEARCH_KEY) {
    return res.status(403).json({ error: 'forbidden' });
  }

  const lang = detectLang(req);
  const client = await pool.connect();
  try {
    await client.query("SET client_encoding = 'UTF8'");
    const q = raw.toUpperCase().replace(/[-\s]/g, '');

    // 1. Exact SKU match
    const exact = await client.query(
      `SELECT * FROM elimfilters_catalog WHERE UPPER(REPLACE(sku,'-','')) = $1 LIMIT 1`,
      [q]
    );
    if (exact.rows.length > 0) {
      const products = exact.rows.map(r => buildFilterData(r, lang));
      await enrichAlternatives(products, client);
      return res.json({ success: true, results: products, source: 'exact_sku' });
    }

    // 2. OEM / competitor cross-reference
    const oem = await client.query(
      `SELECT * FROM elimfilters_catalog
       WHERE EXISTS (
         SELECT 1 FROM jsonb_array_elements(oem_codes) AS ref
         WHERE UPPER(REPLACE(ref->>'code','-','')) = $1
       )
       OR EXISTS (
         SELECT 1 FROM jsonb_array_elements(competitor_codes) AS ref
         WHERE UPPER(REPLACE(ref->>'code','-','')) = $1
       )
       LIMIT 10`,
      [q]
    );
    if (oem.rows.length > 0) {
      const products = oem.rows.map(r => buildFilterData(r, lang));
      await enrichAlternatives(products, client);
      return res.json({ success: true, results: products, source: 'oem_crossref' });
    }

    // 3. Description full-text search
    const desc = await client.query(
      `SELECT * FROM elimfilters_catalog
       WHERE to_tsvector('english', COALESCE(description,'')) @@ plainto_tsquery('english', $1)
       LIMIT 10`,
      [raw]
    );
    if (desc.rows.length > 0) {
      const products = desc.rows.map(r => buildFilterData(r, lang));
      await enrichAlternatives(products, client);
      return res.json({ success: true, results: products, source: 'description' });
    }

    res.json({ success: true, results: [], source: 'no_match' });
  } catch (e) {
    console.error('[search]', e.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// ─── GET /api/search/vin ───────────────────────────────────────────────────────────────────────────
app.get('/api/search/vin', searchLimiter, async (req, res) => {
  const vin = (req.query.vin || '').trim().toUpperCase();
  if (!vin || vin.length !== 17) return res.status(400).json({ success: false, error: 'Invalid VIN (must be 17 chars)' });

  const SEARCH_KEY = process.env.SEARCH_API_KEY;
  const authHeader = req.get('authorization') || '';
  const providedKey = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!SEARCH_KEY || providedKey !== SEARCH_KEY) return res.status(403).json({ error: 'forbidden' });

  const lang = detectLang(req);
  const client = await pool.connect();
  try {
    await client.query("SET client_encoding = 'UTF8'");
    const { rows } = await client.query(
      `SELECT c.* FROM elimfilters_catalog c
       JOIN vin_equipment_map v ON c.sku = ANY(v.filter_skus)
       WHERE v.vin = $1
       LIMIT 20`,
      [vin]
    );
    if (!rows.length) return res.json({ success: true, results: [], source: 'vin_no_match' });
    const products = rows.map(r => buildFilterData(r, lang));
    await enrichAlternatives(products, client);
    return res.json({ success: true, results: products, source: 'vin' });
  } catch (e) {
    console.error('[search/vin]', e.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// ─── GET /api/search/equipment ─────────────────────────────────────────────────────────────────────
app.get('/api/search/equipment', searchLimiter, async (req, res) => {
  const { make, model, year, engine } = req.query;
  if (!make && !model) return res.status(400).json({ success: false, error: 'make or model required' });

  const SEARCH_KEY = process.env.SEARCH_API_KEY;
  const authHeader = req.get('authorization') || '';
  const providedKey = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!SEARCH_KEY || providedKey !== SEARCH_KEY) return res.status(403).json({ error: 'forbidden' });

  const lang = detectLang(req);
  const client = await pool.connect();
  try {
    await client.query("SET client_encoding = 'UTF8'");

    const conditions = [];
    const params = [];
    let idx = 1;

    if (make) {
      conditions.push(`EXISTS (
        SELECT 1 FROM jsonb_array_elements(equipment_applications) AS ea
        WHERE UPPER(ea->>'make') LIKE $${idx}
      )`);
      params.push('%' + make.toUpperCase() + '%');
      idx++;
    }
    if (model) {
      conditions.push(`EXISTS (
        SELECT 1 FROM jsonb_array_elements(equipment_applications) AS ea
        WHERE UPPER(ea->>'model') LIKE $${idx}
      )`);
      params.push('%' + model.toUpperCase() + '%');
      idx++;
    }
    if (year) {
      conditions.push(`EXISTS (
        SELECT 1 FROM jsonb_array_elements(equipment_applications) AS ea
        WHERE (ea->>'year_from')::int <= $${idx} AND (ea->>'year_to')::int >= $${idx}
      )`);
      params.push(parseInt(year));
      idx++;
    }
    if (engine) {
      conditions.push(`EXISTS (
        SELECT 1 FROM jsonb_array_elements(equipment_applications) AS ea
        WHERE UPPER(ea->>'engine') LIKE $${idx}
      )`);
      params.push('%' + engine.toUpperCase() + '%');
      idx++;
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    const { rows } = await client.query(
      `SELECT * FROM elimfilters_catalog ${whereClause} LIMIT 20`,
      params
    );

    const products = rows.map(r => buildFilterData(r, lang));
    await enrichAlternatives(products, client);
    res.json({ success: true, results: products, source: 'equipment' });
  } catch (e) {
    console.error('[search/equipment]', e.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// ─── GET /api/debug/sku-codes ───────────────────────────────────────────────────────────────────────
app.get('/api/debug/sku-codes', searchLimiter, async (req, res) => {
  const sku = (req.query.sku || '').trim().toUpperCase();
  if (!sku) return res.status(400).json({ error: 'sku required' });

  const ADMIN_KEY_LOCAL = process.env.ADMIN_KEY;
  const authHeader = req.get('authorization') || '';
  const providedKey = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!ADMIN_KEY_LOCAL || providedKey !== ADMIN_KEY_LOCAL) {
    return res.status(403).json({ error: 'forbidden' });
  }

  const client = await pool.connect();
  try {
    await client.query("SET client_encoding = 'UTF8'");
    const result = await client.query(
      `SELECT sku, duty, filter_type, competitor_codes, oem_codes
       FROM elimfilters_catalog WHERE sku = $1`,
      [sku]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'not found' });
    const row = result.rows[0];
    res.json({
      sku: row.sku,
      duty: row.duty,
      filter_type: row.filter_type,
      competitor_codes: row.competitor_codes,
      oem_codes: row.oem_codes,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
});

// ─── GET /api/debug/suspects-equipment ─────────────────────────────────────────────────────────
app.get('/api/debug/suspects-equipment', searchLimiter, async (req, res) => {
  const ADMIN_KEY_LOCAL = process.env.ADMIN_KEY;
  const authHeader = req.get('authorization') || '';
  const providedKey = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!ADMIN_KEY_LOCAL || providedKey !== ADMIN_KEY_LOCAL) {
    return res.status(403).json({ error: 'forbidden' });
  }

  const limit = Math.min(parseInt(req.query.limit) || 100, 500);
  const offset = parseInt(req.query.offset) || 0;
  const filter_type = req.query.filter_type || null;

  const client = await pool.connect();
  try {
    await client.query("SET client_encoding = 'UTF8'");
    const conditions = ["(equipment_applications IS NULL OR jsonb_array_length(equipment_applications) = 0)"];
    const params = [];
    let idx = 1;
    if (filter_type) {
      conditions.push(`filter_type = $${idx}`);
      params.push(filter_type);
      idx++;
    }
    params.push(limit, offset);
    const { rows } = await client.query(
      `SELECT sku, filter_type, description, duty
       FROM elimfilters_catalog
       WHERE ${conditions.join(' AND ')}
       ORDER BY sku
       LIMIT $${idx} OFFSET $${idx+1}`,
      params
    );
    const { rows: countRows } = await client.query(
      `SELECT COUNT(*) FROM elimfilters_catalog WHERE ${conditions.join(' AND ')}`,
      params.slice(0, -2)
    );
    res.json({ total: parseInt(countRows[0].count), offset, limit, results: rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
});

// ─── POST /api/import/donaldson ─────────────────────────────────────────────────────────────────────────
const FILTER_TYPE_CANONICAL = {
  'Air Filter':                'air',
  'Air Filter Housing':        'air',
  'Air Dryer':                 'air',
  'air-intake':                'air',
  'air-dryer':                 'air',
  'Lube Filter':               'oil',
  'Oil Filter':                'oil',
  'lube':                      'oil',
  'Fuel Filter':               'fuel',
  'Fuel Filter - Water Separator': 'water',
  'turbine':                   'fuel',
  'Hydraulic Filter':          'hydraulic',
  'Cabin Filter':              'cabin',
  'Coolant Filter':            'other',
  'coolant':                   'other',
};

const VALID_FILTER_TYPES = new Set(['oil','fuel','air','cabin','hydraulic','compressed-air','water','other']);

function _normalizeFilterType(raw) {
  if (!raw) return 'other';
  if (VALID_FILTER_TYPES.has(raw)) return raw;
  return FILTER_TYPE_CANONICAL[raw] || 'other';
}

function _validateImportRow(row) {
  if (!row.sku || typeof row.sku !== 'string' || !/^[A-Z0-9]{2,4}[0-9]{4}$/.test(row.sku) || row.sku.length !== 7) return `invalid sku: ${row.sku} (must be 7 chars: prefix + 4 digits)`;
  const ft = _normalizeFilterType(row.filter_type);
  if (!ft) return `invalid filter_type: ${row.filter_type}`;
  return null;
}

app.post('/api/import/donaldson', importLimiter, requireAdmin, async (req, res) => {
  const rows = Array.isArray(req.body) ? req.body : req.body?.products;
  if (!rows || !Array.isArray(rows)) return res.status(400).json({ error: 'Expected array of products' });
  if (rows.length > 500) return res.status(400).json({ error: 'Max 500 products per batch' });

  const results = { inserted: 0, updated: 0, skipped: 0, errors: [] };
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const row of rows) {
      const validErr = _validateImportRow(row);
      if (validErr) { results.errors.push({ sku: row.sku, error: validErr }); results.skipped++; continue; }

      const sku = row.sku.trim().toUpperCase();
      const ft = _normalizeFilterType(row.filter_type);

      const oem_codes        = row.oem_codes        ? JSON.stringify(row.oem_codes)        : null;
      const competitor_codes = row.competitor_codes ? JSON.stringify(row.competitor_codes) : null;
      const brand_crossrefs  = row.brand_crossrefs  ? JSON.stringify(row.brand_crossrefs)  : null;
      const alternatives     = row.alternatives     ? JSON.stringify(row.alternatives)     : null;
      const equipment_applications = row.equipment_applications ? JSON.stringify(row.equipment_applications) : null;

      try {
        const existing = await client.query('SELECT sku FROM elimfilters_catalog WHERE sku = $1', [sku]);
        if (existing.rows.length > 0) {
          // UPDATE — merge JSONB arrays (competitor_codes, oem_codes, equipment_applications)
          await client.query(`
            UPDATE elimfilters_catalog SET
              codigo_base = COALESCE($2, codigo_base),
              description = COALESCE($3, description),
              filter_type = $4,
              sub_type = COALESCE($5, sub_type),
              technology = COALESCE($6, technology),
              installation_type = COALESCE($7, installation_type),
              thread_size = COALESCE($8, thread_size),
              outer_diameter_mm = COALESCE($9, outer_diameter_mm),
              height_mm = COALESCE($10, height_mm),
              gasket_od_mm = COALESCE($11, gasket_od_mm),
              gasket_id_mm = COALESCE($12, gasket_id_mm),
              iso_test_method = COALESCE($13, iso_test_method),
              micron_rating = COALESCE($14, micron_rating),
              nominal_efficiency = COALESCE($15, nominal_efficiency),
              burst_pressure_psi = COALESCE($16, burst_pressure_psi),
              collapse_pressure_psi = COALESCE($17, collapse_pressure_psi),
              duty = COALESCE($18, duty),
              oem_codes = CASE WHEN $19::jsonb IS NOT NULL
                THEN (
                  SELECT jsonb_agg(DISTINCT elem)
                  FROM (
                    SELECT jsonb_array_elements(COALESCE(oem_codes, '[]'::jsonb))
                    UNION ALL
                    SELECT jsonb_array_elements($19::jsonb)
                  ) AS t(elem)
                )
                ELSE oem_codes END,
              competitor_codes = CASE WHEN $20::jsonb IS NOT NULL
                THEN (
                  SELECT jsonb_agg(DISTINCT elem)
                  FROM (
                    SELECT jsonb_array_elements(COALESCE(competitor_codes, '[]'::jsonb))
                    UNION ALL
                    SELECT jsonb_array_elements($20::jsonb)
                  ) AS t(elem)
                )
                ELSE competitor_codes END,
              brand_crossrefs = CASE WHEN $21::jsonb IS NOT NULL THEN $21::jsonb ELSE brand_crossrefs END,
              alternatives = CASE WHEN $22::jsonb IS NOT NULL THEN $22::jsonb ELSE alternatives END,
              equipment_applications = CASE WHEN $23::jsonb IS NOT NULL
                THEN (
                  SELECT jsonb_agg(DISTINCT elem)
                  FROM (
                    SELECT jsonb_array_elements(COALESCE(equipment_applications, '[]'::jsonb))
                    UNION ALL
                    SELECT jsonb_array_elements($23::jsonb)
                  ) AS t(elem)
                )
                ELSE equipment_applications END
            WHERE sku = $1`,
            [
              sku,
              row.codigo_base || null,
              row.description || null,
              ft,
              row.sub_type || null,
              row.technology || null,
              row.installation_type || null,
              row.thread_size || null,
              row.outer_diameter_mm || null,
              row.height_mm || null,
              row.gasket_od_mm || null,
              row.gasket_id_mm || null,
              row.iso_test_method || null,
              row.micron_rating || null,
              row.nominal_efficiency || null,
              row.burst_pressure_psi || null,
              row.collapse_pressure_psi || null,
              row.duty || null,
              oem_codes,
              competitor_codes,
              brand_crossrefs,
              alternatives,
              equipment_applications,
            ]
          );
          results.updated++;
        } else {
          await client.query(`
            INSERT INTO elimfilters_catalog (
              sku, codigo_base, description, filter_type, sub_type, technology,
              installation_type, thread_size,
              outer_diameter_mm, height_mm, gasket_od_mm, gasket_id_mm,
              iso_test_method, micron_rating, nominal_efficiency,
              burst_pressure_psi, collapse_pressure_psi,
              duty, oem_codes, competitor_codes, brand_crossrefs, alternatives, equipment_applications
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,
              $19::jsonb,$20::jsonb,$21::jsonb,$22::jsonb,$23::jsonb)`,
            [
              sku,
              row.codigo_base || null,
              row.description || null,
              ft,
              row.sub_type || null,
              row.technology || null,
              row.installation_type || null,
              row.thread_size || null,
              row.outer_diameter_mm || null,
              row.height_mm || null,
              row.gasket_od_mm || null,
              row.gasket_id_mm || null,
              row.iso_test_method || null,
              row.micron_rating || null,
              row.nominal_efficiency || null,
              row.burst_pressure_psi || null,
              row.collapse_pressure_psi || null,
              row.duty || 'HEAVY_DUTY',
              oem_codes || '[]',
              competitor_codes || '[]',
              brand_crossrefs || '{}',
              alternatives || '[]',
              equipment_applications || '[]',
            ]
          );
          results.inserted++;
        }
      } catch (rowErr) {
        results.errors.push({ sku, error: rowErr.message });
        results.skipped++;
      }
    }
    await client.query('COMMIT');
    res.json({ success: true, ...results });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('[import/donaldson]', e.message);
    res.status(500).json({ error: 'Import failed', detail: e.message });
  } finally {
    client.release();
  }
});

// ─── POST /api/import/mann ───────────────────────────────────────────────────────────────────────────────
const MANN_SKU_PREFIXES = {
  'Oil Filter':    'EL3',
  'Air Filter':    'EA3',
  'Cabin Filter':  'EC3',
  'Fuel Filter':   'EF3',
};

const MANN_FILTER_TYPES = {
  'Oil Filter':    'oil',
  'Air Filter':    'air',
  'Cabin Filter':  'cabin',
  'Fuel Filter':   'fuel',
};

app.post('/api/import/mann', importLimiter, requireAdmin, async (req, res) => {
  const rows = Array.isArray(req.body) ? req.body : req.body?.products;
  if (!rows || !Array.isArray(rows)) return res.status(400).json({ error: 'Expected array of products' });
  if (rows.length > 500) return res.status(400).json({ error: 'Max 500 products per batch' });

  const results = { inserted: 0, updated: 0, skipped: 0, collision: 0, errors: [] };
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const row of rows) {
      const mannCode = (row.mann_part_number || row.sku || '').trim().toUpperCase();
      const filterType = row.filter_type || '';
      const prefix = MANN_SKU_PREFIXES[filterType];
      if (!prefix) {
        results.errors.push({ mann: mannCode, error: `unsupported filter type for LD: ${filterType}` });
        results.skipped++;
        continue;
      }

      // Generate 4-digit codigo_base from last 4 digits of MANN code
      const digits = mannCode.replace(/[^0-9]/g, '');
      if (!digits || digits.length < 4) {
        results.errors.push({ mann: mannCode, error: `cannot extract 4 digits from ${mannCode}` });
        results.skipped++;
        continue;
      }
      const codigoBase = digits.slice(-4);
      const sku = prefix + codigoBase;

      // Collision check: if another MANN code already generated this SKU, reject
      const existing = await client.query('SELECT sku, codigo_base FROM elimfilters_catalog WHERE sku = $1', [sku]);
      if (existing.rows.length > 0 && existing.rows[0].codigo_base !== codigoBase) {
        results.errors.push({ mann: mannCode, sku, error: `SKU collision: ${sku} already used by codigo_base ${existing.rows[0].codigo_base}` });
        results.collision++;
        continue;
      }

      const oem_codes        = row.oem_codes        ? JSON.stringify(row.oem_codes)        : '[]';
      const competitor_codes = row.competitor_codes ? JSON.stringify(row.competitor_codes) : '[]';
      const equipment_applications = row.equipment_applications ? JSON.stringify(row.equipment_applications) : '[]';
      const ft = MANN_FILTER_TYPES[filterType] || 'other';

      try {
        if (existing.rows.length > 0) {
          // UPDATE: merge arrays
          await client.query(`
            UPDATE elimfilters_catalog SET
              description = COALESCE($2, description),
              filter_type = $3,
              duty = 'LIGHT_DUTY',
              oem_codes = (
                SELECT jsonb_agg(DISTINCT elem)
                FROM (
                  SELECT jsonb_array_elements(COALESCE(oem_codes,'[]'::jsonb))
                  UNION ALL
                  SELECT jsonb_array_elements($4::jsonb)
                ) AS t(elem)
              ),
              competitor_codes = (
                SELECT jsonb_agg(DISTINCT elem)
                FROM (
                  SELECT jsonb_array_elements(COALESCE(competitor_codes,'[]'::jsonb))
                  UNION ALL
                  SELECT jsonb_array_elements($5::jsonb)
                ) AS t(elem)
              ),
              equipment_applications = (
                SELECT jsonb_agg(DISTINCT elem)
                FROM (
                  SELECT jsonb_array_elements(COALESCE(equipment_applications,'[]'::jsonb))
                  UNION ALL
                  SELECT jsonb_array_elements($6::jsonb)
                ) AS t(elem)
              )
            WHERE sku = $1`,
            [sku, row.description || null, ft, oem_codes, competitor_codes, equipment_applications]
          );
          results.updated++;
        } else {
          await client.query(`
            INSERT INTO elimfilters_catalog
              (sku, codigo_base, description, filter_type, duty,
               oem_codes, competitor_codes, equipment_applications)
            VALUES ($1,$2,$3,$4,'LIGHT_DUTY',$5::jsonb,$6::jsonb,$7::jsonb)`,
            [sku, codigoBase, row.description || null, ft, oem_codes, competitor_codes, equipment_applications]
          );
          results.inserted++;
        }
      } catch (rowErr) {
        results.errors.push({ mann: mannCode, sku, error: rowErr.message });
        results.skipped++;
      }
    }
    await client.query('COMMIT');
    res.json({ success: true, ...results });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('[import/mann]', e.message);
    res.status(500).json({ error: 'Import failed', detail: e.message });
  } finally {
    client.release();
  }
});

// ─── POST /api/admin/rename-sku ──────────────────────────────────────────────────────────────────────────────
// Renames a SKU: copies all data to new_sku, deletes old_sku.
// Body: { old_sku: "EA200003", new_sku: "EA20003" }
// Both must match /^[A-Z]{2,3}[0-9]{4}$/ (3-char prefix + 4 digits).
app.post('/api/admin/rename-sku', importLimiter, requireAdmin, async (req, res) => {
  const { old_sku, new_sku } = req.body || {};
  if (!old_sku || !new_sku) return res.status(400).json({ error: 'old_sku and new_sku required' });
  if (new_sku.length !== 7) return res.status(400).json({ error: `new_sku must be exactly 7 characters: ${new_sku}` });

  const oldNorm = old_sku.trim().toUpperCase();
  const newNorm = new_sku.trim().toUpperCase();
  if (oldNorm === newNorm) return res.status(400).json({ error: 'old_sku and new_sku are identical' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const src = await client.query(`SELECT * FROM elimfilters_catalog WHERE sku = $1`, [oldNorm]);
    if (src.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: `SKU not found: ${oldNorm}` });
    }

    const conflict = await client.query(`SELECT sku FROM elimfilters_catalog WHERE sku = $1`, [newNorm]);
    if (conflict.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: `new_sku already exists: ${newNorm}` });
    }

    const row = src.rows[0];
    await client.query(`
      INSERT INTO elimfilters_catalog (
        sku, codigo_base, description, filter_type, sub_type, technology,
        installation_type, thread_size,
        outer_diameter_mm, height_mm, gasket_od_mm, gasket_id_mm,
        iso_test_method, micron_rating, nominal_efficiency,
        burst_pressure_psi, collapse_pressure_psi,
        duty, oem_codes, competitor_codes, brand_crossrefs, alternatives, equipment_applications
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,
        $19::jsonb,$20::jsonb,$21::jsonb,$22::jsonb,$23::jsonb
      )
    `, [
      newNorm, row.codigo_base, row.description, row.filter_type, row.sub_type, row.technology,
      row.installation_type, row.thread_size,
      row.outer_diameter_mm, row.height_mm, row.gasket_od_mm, row.gasket_id_mm,
      row.iso_test_method, row.micron_rating, row.nominal_efficiency,
      row.burst_pressure_psi, row.collapse_pressure_psi,
      row.duty,
      JSON.stringify(row.oem_codes || []), JSON.stringify(row.competitor_codes || []),
      JSON.stringify(row.brand_crossrefs || {}), JSON.stringify(row.alternatives || []),
      JSON.stringify(row.equipment_applications || []),
    ]);

    await client.query(`DELETE FROM elimfilters_catalog WHERE sku = $1`, [oldNorm]);
    await client.query('COMMIT');

    res.json({ success: true, renamed: { from: oldNorm, to: newNorm } });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
});

// ─── POST /api/admin/delete-sku ──────────────────────────────────────────────────────────────────────────────
// Permanently deletes a single SKU from the catalog.
// Body: { sku: "EA200003" }
app.post('/api/admin/delete-sku', importLimiter, requireAdmin, async (req, res) => {
  const { sku } = req.body || {};
  if (!sku) return res.status(400).json({ error: 'sku required' });
  const norm = sku.trim().toUpperCase();
  try {
    const result = await pool.query(`DELETE FROM elimfilters_catalog WHERE sku = $1`, [norm]);
    if (result.rowCount === 0) return res.status(404).json({ error: `SKU not found: ${norm}` });
    res.json({ success: true, deleted: norm });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── POST /api/cleanup/fram-hd-force ───────────────────────────────────────────────────────────────────────────────
// Hard SQL-based cleanup: strip ALL FRAM PH/CA/CF/G codes from HD SKUs (EL8, EA1, EC1, EF9).
// Handles any manufacturer key format (uppercase, lowercase, missing).
app.post('/api/cleanup/fram-hd-force', importLimiter, requireAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    const { rows: before } = await client.query(`
      SELECT COUNT(*) as cnt FROM elimfilters_catalog
      WHERE (sku LIKE 'EL8%' OR sku LIKE 'EA1%' OR sku LIKE 'EC1%' OR sku LIKE 'EF9%')
        AND competitor_codes @> '[{"manufacturer":"FRAM"}]'::jsonb
    `);

    await client.query(`
      UPDATE elimfilters_catalog
      SET competitor_codes = (
        SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
        FROM jsonb_array_elements(competitor_codes) AS elem
        WHERE NOT (
          UPPER(elem->>'manufacturer') = 'FRAM'
          AND (
            elem->>'code' ~ '^PH[0-9]' OR
            elem->>'code' ~ '^CA[0-9]' OR
            elem->>'code' ~ '^CF[0-9]' OR
            elem->>'code' ~ '^G[0-9]'
          )
        )
      )
      WHERE (sku LIKE 'EL8%' OR sku LIKE 'EA1%' OR sku LIKE 'EC1%' OR sku LIKE 'EF9%')
        AND competitor_codes IS NOT NULL
    `);

    res.json({ success: true, skus_affected_before: parseInt(before[0].cnt) });
  } catch (e) {
    console.error('[cleanup/fram-hd-force]', e.message);
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
});

// ─── POST /api/cleanup/oem-reclassify ─────────────────────────────────────────────────────────────────────────
// Re-runs the isCompetitor() classification on every row to fix any oem_codes/competitor_codes
// that were stored in the wrong column.
app.post('/api/cleanup/oem-reclassify', importLimiter, requireAdmin, async (req, res) => {
  const client = await pool.connect();
  let fixed = 0;
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `SELECT sku, oem_codes, competitor_codes FROM elimfilters_catalog`
    );
    for (const row of rows) {
      const allRefs = [...parseRefs(row.oem_codes), ...parseRefs(row.competitor_codes)];
      const split = splitRefs(allRefs);
      const newOem = JSON.stringify(split.oem);
      const newComp = JSON.stringify(split.competitor);
      const curOem = JSON.stringify(row.oem_codes || []);
      const curComp = JSON.stringify(row.competitor_codes || []);
      if (newOem !== curOem || newComp !== curComp) {
        await client.query(
          `UPDATE elimfilters_catalog SET oem_codes=$1::jsonb, competitor_codes=$2::jsonb WHERE sku=$3`,
          [newOem, newComp, row.sku]
        );
        fixed++;
      }
    }
    await client.query('COMMIT');
    res.json({ success: true, rows_fixed: fixed, total: rows.length });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('[cleanup/oem-reclassify]', e.message);
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
});

// ─── GET /api/admin/audit ───────────────────────────────────────────────────────────────────────────────────
app.get('/api/admin/audit', adminLimiter, requireAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("SET client_encoding = 'UTF8'");
    const [total, byType, byDuty, noEquip, noComp, noOem, malformed] = await Promise.all([
      client.query('SELECT COUNT(*) FROM elimfilters_catalog'),
      client.query('SELECT filter_type, COUNT(*) FROM elimfilters_catalog GROUP BY filter_type ORDER BY count DESC'),
      client.query('SELECT duty, COUNT(*) FROM elimfilters_catalog GROUP BY duty ORDER BY count DESC'),
      client.query("SELECT COUNT(*) FROM elimfilters_catalog WHERE equipment_applications IS NULL OR jsonb_array_length(equipment_applications) = 0"),
      client.query('SELECT COUNT(*) FROM elimfilters_catalog WHERE competitor_codes IS NULL OR jsonb_array_length(competitor_codes) = 0'),
      client.query('SELECT COUNT(*) FROM elimfilters_catalog WHERE oem_codes IS NULL OR jsonb_array_length(oem_codes) = 0'),
      client.query("SELECT COUNT(*) FROM elimfilters_catalog WHERE sku !~ '^[A-Z0-9]{2,4}[0-9]{4}$' OR length(sku) != 7"),
    ]);
    res.json({
      total: parseInt(total.rows[0].count),
      by_filter_type: byType.rows,
      by_duty: byDuty.rows,
      missing_equipment_applications: parseInt(noEquip.rows[0].count),
      missing_competitor_codes: parseInt(noComp.rows[0].count),
      missing_oem_codes: parseInt(noOem.rows[0].count),
      malformed_skus: parseInt(malformed.rows[0].count),
    });
  } catch (e) {
    console.error('[audit]', e.message);
    res.status(500).json({ error: 'Audit failed' });
  } finally {
    client.release();
  }
});

// ─── GET /api/admin/malformed-skus ────────────────────────────────────────────────────────────────────────────
// Lists all SKUs that don’t match the 7-char format ^[A-Z0-9]{2,4}[0-9]{4}$
app.get('/api/admin/malformed-skus', adminLimiter, requireAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("SET client_encoding = 'UTF8'");
    const { rows } = await client.query(
      `SELECT sku, filter_type, duty, description
       FROM elimfilters_catalog
       WHERE sku !~ '^[A-Z0-9]{2,4}[0-9]{4}$' OR length(sku) != 7
       ORDER BY sku`
    );
    res.json({ count: rows.length, skus: rows });
  } catch (e) {
    console.error('[malformed-skus]', e.message);
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
});

// ─── GET /api/ai/search ─────────────────────────────────────────────────────────────────────────────────
app.get('/api/ai/search', searchLimiter, async (req, res) => {
  const raw = (req.query.q || '').trim();
  if (!raw) return res.json({ success: false, results: [] });

  const SEARCH_KEY = process.env.SEARCH_API_KEY;
  const authHeader = req.get('authorization') || '';
  const providedKey = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!SEARCH_KEY || providedKey !== SEARCH_KEY) return res.status(403).json({ error: 'forbidden' });

  const lang = detectLang(req);
  const client = await pool.connect();
  try {
    await client.query("SET client_encoding = 'UTF8'");
    const q = raw.toUpperCase().replace(/[-\s]/g, '');

    // Try exact SKU match
    const exact = await client.query(
      `SELECT * FROM elimfilters_catalog WHERE UPPER(REPLACE(sku,'-','')) = $1 LIMIT 1`, [q]
    );
    if (exact.rows.length > 0) {
      const products = exact.rows.map(r => buildFilterData(r, lang));
      await enrichAlternatives(products, client);
      return res.json({ success: true, results: products, source: 'exact_sku' });
    }

    // OEM/competitor cross-ref
    const oem = await client.query(
      `SELECT * FROM elimfilters_catalog
       WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(oem_codes) AS ref WHERE UPPER(REPLACE(ref->>'code','-',''))=$1)
       OR    EXISTS (SELECT 1 FROM jsonb_array_elements(competitor_codes) AS ref WHERE UPPER(REPLACE(ref->>'code','-',''))=$1)
       LIMIT 10`, [q]
    );
    if (oem.rows.length > 0) {
      const products = oem.rows.map(r => buildFilterData(r, lang));
      await enrichAlternatives(products, client);
      return res.json({ success: true, results: products, source: 'oem_crossref' });
    }

    res.json({ success: true, results: [], source: 'no_match' });
  } catch (e) {
    console.error('[ai/search]', e.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// ─── POST /api/ai/escalate ───────────────────────────────────────────────────────────────────────────────
app.post('/api/ai/escalate', searchLimiter, async (req, res) => {
  const { session_id, lang, messages } = req.body || {};
  if (!session_id || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'session_id and messages[] required' });
  }

  if (!await _verifyTurnstile(req.body.turnstile_token, req.ip)) {
    return res.status(400).json({ error: 'Captcha verification failed' });
  }

  const usedLang = lang || 'en';
  const transcript = messages
    .map(m => `[${m.role === 'user' ? 'USER' : 'BOT'}] ${m.text}`)
    .join('\n');

  const safeTranscript = _escHtml(transcript);
  const safeSessionId  = _escHtml(session_id);

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtpout.secureserver.net',
      port: 465,
      secure: true,
      auth: { user: 'info@elimfilters.com', pass: process.env.GODADDY_MAIL_PASS },
    });
    await transporter.sendMail({
      from: '"ELIMFILTERS Chat" <info@elimfilters.com>',
      to: 'info@elimfilters.com',
      subject: `[Chat Escalation] Session ${safeSessionId} — ${usedLang.toUpperCase()}`,
      html: `
        <h2>Chat session escalated to human support</h2>
        <p><b>Session:</b> ${safeSessionId} | <b>Language:</b> ${usedLang}</p>
        <hr/>
        <pre style="background:#f5f5f5;padding:1rem;font-family:monospace">${safeTranscript}</pre>
      `,
    });
    res.json({ success: true });
  } catch (err) {
    console.error('[ai/escalate]', err.message);
    res.status(500).json({ error: 'Failed to send escalation email' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[server] ✅ Listening on port ${PORT}`);
  console.log(`[server] ✅ ELIMFILTERS API ready`);
});