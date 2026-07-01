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
  if (!key || !ADMIN_KEY) return res.status(403).json({ error: 'forbidden' });
  const keyBuf    = Buffer.from(key);
  const adminBuf  = Buffer.from(ADMIN_KEY);
  if (keyBuf.length !== adminBuf.length || !require('crypto').timingSafeEqual(keyBuf, adminBuf)) {
    return res.status(403).json({ error: 'forbidden' });
  }
  next();
};

// Prevent unhandled errors from crashing the process
process.on('uncaughtException', (err) => {
  const msg = (err.message || '').replace(/postgresql:\/\/[^@]+@[^/]+/gi, 'postgresql://[redacted]');
  console.error('[uncaughtException]', msg);
});
process.on('unhandledRejection', (reason) => console.error('[unhandledRejection]', reason));

const app = express();
app.set('trust proxy', 1);

// ─── HTTPS enforcement + security headers (production only) ──────────────────
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
// Import endpoints need larger body limit (max 500 rows/batch per CLAUDE.md)
app.use('/api/import', express.json({ charset: 'utf-8', limit: '2mb' }));
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
  if (!TURNSTILE_SECRET) return false; // reject if secret not configured
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
  const safeEmail   = _escHtml(email).replace(/[\r\n]/g, '');
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
    // Internal notification to distribution team
    await transporter.sendMail({
      from: '"ELIMFILTERS Web" <info@elimfilters.com>',
      to: 'distribution_network@elimfilters.com',
      replyTo: esc(email).replace(/[\r\n]/g, ''),
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

    // Confirmation email to applicant
    await transporter.sendMail({
      from: '"ELIMFILTERS Distribution" <info@elimfilters.com>',
      to: esc(email).replace(/[\r\n]/g, ''),
      subject: `Application received — ELIMFILTERS Authorized Distributor Program`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
        <body style="margin:0;padding:0;background:#000;font-family:'Helvetica Neue',Arial,sans-serif">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#000;padding:40px 20px">
            <tr><td align="center">
              <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%">

                <!-- Header -->
                <tr><td style="background:#000;border-bottom:2px solid #FFF12D;padding:32px 40px 24px">
                  <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:0.2em;color:#FFF12D;text-transform:uppercase">ELIMFILTERS® · AUTHORIZED DISTRIBUTION NETWORK</p>
                </td></tr>

                <!-- Body -->
                <tr><td style="background:#0a0a0a;border:1px solid #1a1a1a;border-top:none;padding:40px">

                  <h1 style="margin:0 0 24px;font-size:22px;font-weight:700;color:#fff;letter-spacing:-0.02em">
                    Application Received
                  </h1>

                  <p style="margin:0 0 16px;font-size:14px;line-height:1.75;color:rgba(255,255,255,0.65)">
                    Dear ${esc(contactName)},
                  </p>
                  <p style="margin:0 0 24px;font-size:14px;line-height:1.75;color:rgba(255,255,255,0.65)">
                    We have received your application for the ELIMFILTERS Authorized Distributor Program on behalf of <strong style="color:#fff">${esc(companyName)}</strong>.
                    Our commercial team will review your application and respond within <strong style="color:#fff">5 business days</strong>.
                  </p>

                  <!-- Application summary -->
                  <div style="background:#111;border:1px solid #222;border-left:3px solid #FFF12D;padding:20px 24px;margin:0 0 28px">
                    <p style="margin:0 0 12px;font-size:10px;letter-spacing:0.16em;color:#FFF12D;text-transform:uppercase">APPLICATION SUMMARY</p>
                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr><td style="font-size:12px;color:rgba(255,255,255,0.4);padding:4px 0;width:140px">Company</td><td style="font-size:12px;color:#fff;padding:4px 0">${esc(companyName)}</td></tr>
                      <tr><td style="font-size:12px;color:rgba(255,255,255,0.4);padding:4px 0">Country</td><td style="font-size:12px;color:#fff;padding:4px 0">${esc(country)}</td></tr>
                      ${state ? `<tr><td style="font-size:12px;color:rgba(255,255,255,0.4);padding:4px 0">Region</td><td style="font-size:12px;color:#fff;padding:4px 0">${esc(state)}</td></tr>` : ''}
                      <tr><td style="font-size:12px;color:rgba(255,255,255,0.4);padding:4px 0">Contact</td><td style="font-size:12px;color:#fff;padding:4px 0">${esc(contactName)}</td></tr>
                    </table>
                  </div>

                  <p style="margin:0 0 12px;font-size:13px;line-height:1.7;color:rgba(255,255,255,0.5)">
                    While your application is under review, you can explore our technical documentation:
                  </p>
                  <table cellpadding="0" cellspacing="0" style="margin:0 0 28px">
                    <tr>
                      <td style="padding-right:12px">
                        <a href="https://elimfilters.com/knowledge-system" style="display:inline-block;background:#FFF12D;color:#000;text-decoration:none;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:10px 20px">KNOWLEDGE SYSTEM →</a>
                      </td>
                      <td>
                        <a href="https://part-search.elimfilters.com" style="display:inline-block;border:1px solid rgba(255,255,255,0.2);color:rgba(255,255,255,0.65);text-decoration:none;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:10px 20px">PART SEARCH →</a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.4);line-height:1.65">
                    Questions? Reply directly to this email or contact us at
                    <a href="mailto:distribution_network@elimfilters.com" style="color:#FFF12D;text-decoration:none">distribution_network@elimfilters.com</a>
                  </p>
                </td></tr>

                <!-- Footer -->
                <tr><td style="padding:24px 40px;border:1px solid #1a1a1a;border-top:none">
                  <p style="margin:0;font-size:10px;color:rgba(255,255,255,0.2);letter-spacing:0.08em">
                    ELIMFILTERS® · Industrial Asset Protection · elimfilters.com<br>
                    This is an automated confirmation. Do not reply to this address directly.
                  </p>
                </td></tr>

              </table>
            </td></tr>
          </table>
        </body>
        </html>
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
  ssl: process.env.DB_SSL_BYPASS === 'true'
    ? { rejectUnauthorized: false }
    : { rejectUnauthorized: true },
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
    equipment_applications: row.equipment_applications || [],
    vehicle_applications: row.vehicle_applications || []
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

    const src = await client.query('SELECT * FROM elimfilters_catalog WHERE sku = $1 LIMIT 1', [sku]);
    if (!src.rows.length) return res.json({success: true, alternatives: []});

    const f = src.rows[0];
    const params = [sku, f.filter_type, f.sub_type];
    let conditions = `sku != $1 AND filter_type = $2 AND sub_type = $3`;

    if (f.thread_size) {
      conditions += ` AND thread_size = $4`;
      params.push(f.thread_size);
    } else if (f.outer_diameter_mm) {
      conditions += ` AND ABS(COALESCE(outer_diameter_mm,0) - $4) <= 5`;
      params.push(f.outer_diameter_mm);
    } else if (f.height_mm) {
      conditions += ` AND ABS(COALESCE(height_mm,0) - $4) <= 10`;
      params.push(f.height_mm);
    }

    const result = await client.query(
      `SELECT sku, name FROM elimfilters_catalog WHERE ${conditions} LIMIT 6`,
      params
    );
    res.json({success: true, alternatives: result.rows});
  } catch(e) {
    res.status(500).json({success: false, error: 'Internal server error'});
  } finally {
    client.release();
  }
});

app.get('/api/filters/search/part', searchLimiter, async (req, res) => {
  const code = (req.query.code || '').trim().toUpperCase();
  if(!code) return res.json({success: false, filters: []});
  const lang = detectLang(req);

  const client = await pool.connect();
  try {
    await client.query("SET client_encoding = 'UTF8'");

    let result = await client.query(
      'SELECT * FROM elimfilters_catalog WHERE codigo_base = $1 LIMIT 1',
      [code]
    );

    if(result.rows.length === 0) {
      result = await client.query(
        'SELECT * FROM elimfilters_catalog WHERE sku = $1 LIMIT 1',
        [code]
      );
    }

    if(result.rows.length === 0) {
      // Búsqueda exacta en oem_codes y competitor_codes (formato {code/partNumber})
      // Prioriza productos con más datos completos (campos no nulos)
      result = await client.query(
        `SELECT * FROM elimfilters_catalog WHERE
          EXISTS (
            SELECT 1 FROM jsonb_array_elements(oem_codes) AS elem(val)
            WHERE UPPER(val->>'code') = $1
               OR UPPER(val->>'partNumber') = $1
               OR (jsonb_typeof(val) = 'string' AND TRIM(UPPER(split_part(val#>>'{}', '|', 2))) = $1)
          )
          OR EXISTS (
            SELECT 1 FROM jsonb_array_elements(competitor_codes) AS elem(val)
            WHERE UPPER(val->>'code') = $1
               OR UPPER(val->>'partNumber') = $1
               OR (jsonb_typeof(val) = 'string' AND TRIM(UPPER(split_part(val#>>'{}', '|', 2))) = $1)
               OR (jsonb_typeof(val) = 'string' AND UPPER(val#>>'{}') = $1)
          )
        ORDER BY
          CASE WHEN array_length(COALESCE(alternative_codes, '{}'::jsonb[]), 1) > 0
               THEN 0
               ELSE 1
          END ASC,
          sku ASC
        LIMIT 1`,
        [code]
      );
    }

    const filters = result.rows.map(row => buildFilterData(row, lang));
    res.status(200).json({success: true, filters});
  } catch(e) {
    res.status(500).json({success: false, error: 'Internal server error'});
  } finally {
    client.release();
  }
});

app.get('/api/filters/search/vin', searchLimiter, async (req, res) => {
  const model = (req.query.model || '').trim().toUpperCase();
  const engine = req.query.engine ? req.query.engine.trim().toUpperCase() : null;

  if(!model) return res.json({success: false, filters: []});
  if(model.length > 200 || (engine && engine.length > 200)) return res.status(400).json({success: false, error: 'Input exceeds maximum length'});
  if(/^[%_]+$/.test(model)) return res.status(400).json({success: false, error: 'Invalid search term'});
  const lang = detectLang(req);

  const client = await pool.connect();
  try {
    await client.query("SET client_encoding = 'UTF8'");

    let query = `SELECT * FROM elimfilters_catalog
                 WHERE equipment_applications IS NOT NULL`;
    const params = [];

    query += ` AND equipment_applications::text ILIKE $${params.length + 1}`;
    params.push('%' + model.replace(/[%_]/g, '\\$&') + '%');

    if(engine) {
      query += ` AND equipment_applications::text ILIKE $${params.length + 1}`;
      params.push('%' + engine + '%');
    }

    query += ' LIMIT 10';

    const result = await client.query(query, params);
    const filters = result.rows.map(row => buildFilterData(row, lang));
    await enrichAlternatives(filters, client);
    res.status(200).json({success: true, filters});
  } catch(e) {
    res.status(500).json({success: false, error: 'Internal server error'});
  } finally {
    client.release();
  }
});

app.get('/api/filters/search/equipment', searchLimiter, async (req, res) => {
  const model = (req.query.model || '').trim().toUpperCase();
  const type = req.query.type ? req.query.type.trim().toUpperCase() : null;
  const engine = req.query.engine ? req.query.engine.trim().toUpperCase() : null;

  if(!model) return res.json({success: false, filters: []});
  if(model.length > 200 || (type && type.length > 100) || (engine && engine.length > 200)) return res.status(400).json({success: false, error: 'Input exceeds maximum length'});
  if(/^[%_]+$/.test(model)) return res.status(400).json({success: false, error: 'Invalid search term'});
  const lang = detectLang(req);

  const client = await pool.connect();
  try {
    await client.query("SET client_encoding = 'UTF8'");

    let query = `SELECT * FROM elimfilters_catalog
                 WHERE equipment_applications IS NOT NULL`;
    const params = [];

    query += ` AND equipment_applications::text ILIKE $${params.length + 1}`;
    params.push('%' + model.replace(/[%_]/g, '\\$&') + '%');

    if(type) {
      query += ` AND equipment_applications::text ILIKE $${params.length + 1}`;
      params.push('%' + type.replace(/[%_]/g, '\\$&') + '%');
    }

    if(engine) {
      query += ` AND equipment_applications::text ILIKE $${params.length + 1}`;
      params.push('%' + engine.replace(/[%_]/g, '\\$&') + '%');
    }

    query += ' LIMIT 10';

    const result = await client.query(query, params);
    const filters = result.rows.map(row => buildFilterData(row, lang));
    await enrichAlternatives(filters, client);
    res.status(200).json({success: true, filters});
  } catch(e) {
    res.status(500).json({success: false, error: 'Internal server error'});
  } finally {
    client.release();
  }
});

app.get('/api/filters/search/homologous', searchLimiter, async (req, res) => {
  const code = (req.query.code || '').trim().toUpperCase();
  if(!code) return res.json({success: false, filters: []});
  const lang = detectLang(req);

  const client = await pool.connect();
  try {
    await client.query("SET client_encoding = 'UTF8'");
    const result = await client.query(
      'SELECT * FROM elimfilters_catalog WHERE sku = $1 LIMIT 1',
      [code]
    );
    const filters = result.rows.map(row => buildFilterData(row, lang));
    res.status(200).json({success: true, filters});
  } catch(e) {
    res.status(500).json({success: false, error: 'Internal server error'});
  } finally {
    client.release();
  }
});








app.get('/api/catalog/stats', adminLimiter, requireAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    const [total, byType, completeness, recent] = await Promise.all([
      client.query(`SELECT COUNT(*) as total FROM elimfilters_catalog`),
      client.query(`
        SELECT filter_type, duty, COUNT(*) as count
        FROM elimfilters_catalog
        GROUP BY filter_type, duty
        ORDER BY count DESC
      `),
      client.query(`
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE jsonb_array_length(COALESCE(oem_codes,'[]'::jsonb)) > 0) as with_oem,
          COUNT(*) FILTER (WHERE jsonb_array_length(COALESCE(competitor_codes,'[]'::jsonb)) > 0) as with_competitor,
          COUNT(*) FILTER (WHERE jsonb_array_length(COALESCE(equipment_applications,'[]'::jsonb)) > 0) as with_equipment,
          COUNT(*) FILTER (WHERE iso_test_method IS NOT NULL) as with_iso,
          COUNT(*) FILTER (WHERE burst_pressure_psi IS NOT NULL) as with_burst
        FROM elimfilters_catalog
      `),
      client.query(`
        SELECT sku, filter_type, duty,
          jsonb_array_length(COALESCE(oem_codes,'[]'::jsonb)) as oem_count,
          jsonb_array_length(COALESCE(competitor_codes,'[]'::jsonb)) as comp_count,
          jsonb_array_length(COALESCE(equipment_applications,'[]'::jsonb)) as equip_count
        FROM elimfilters_catalog
        ORDER BY id DESC LIMIT 10
      `)
    ]);
    res.json({
      success: true,
      total_skus: parseInt(total.rows[0].total),
      by_type: byType.rows,
      completeness: completeness.rows[0],
      last_10_inserted: recent.rows
    });
  } catch(e) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    client.release();
  }
});



// Audit: Find incomplete products
app.get('/api/audit/incomplete-products', adminLimiter, requireAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT
        sku, codigo_base,
        CASE WHEN iso_test_method IS NULL THEN 1 ELSE 0 END +
        CASE WHEN burst_pressure_psi IS NULL THEN 1 ELSE 0 END +
        CASE WHEN collapse_pressure_psi IS NULL THEN 1 ELSE 0 END +
        CASE WHEN installation_type IS NULL THEN 1 ELSE 0 END +
        CASE WHEN thread_size IS NULL THEN 1 ELSE 0 END as null_count,
        jsonb_array_length(COALESCE(oem_codes, '[]'::jsonb)) as oem_count,
        jsonb_array_length(COALESCE(alternative_codes, '[]'::jsonb)) as alt_count
      FROM elimfilters_catalog
      WHERE sku LIKE 'EL%'
        AND (iso_test_method IS NULL OR burst_pressure_psi IS NULL
          OR collapse_pressure_psi IS NULL OR installation_type IS NULL)
      ORDER BY null_count DESC, oem_count ASC
      LIMIT 100
    `);
    res.json({ success: true, incomplete_count: result.rows.length, products: result.rows });
  } catch(e) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// ─── GET /api/admin/suspects-equipment ──────────────────────────────────────
// Returns products with ≤N equipment entries — feed to scrape_equipment.py batch mode.
// Query params: key (required), max_entries (default 5), filter_type (optional), limit (default 2000)
app.get('/api/admin/suspects-equipment', adminLimiter, requireAdmin, async (req, res) => {
  const maxEntries = parseInt(req.query.max_entries) || 5;
  const limitRows  = parseInt(req.query.limit) || 2000;
  const filterType = req.query.filter_type || null;
  const client = await pool.connect();
  try {
    const params = [maxEntries, limitRows];
    let typeFilter = '';
    if (filterType) { params.push(filterType); typeFilter = `AND filter_type ILIKE $${params.length}`; }
    const result = await client.query(`
      SELECT sku, codigo_base, filter_type,
             COALESCE(jsonb_array_length(equipment_applications), 0) AS equip_count
      FROM elimfilters_catalog
      WHERE codigo_base IS NOT NULL
        AND COALESCE(jsonb_array_length(equipment_applications), 0) <= $1
        ${typeFilter}
      ORDER BY equip_count ASC, sku ASC
      LIMIT $2
    `, params);
    res.json({ success: true, total: result.rows.length, suspects: result.rows });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    client.release();
  }
});


// ─── GET /api/pending-donaldson ──────────────────────────────────────────────
// Returns pending Donaldson products that need metadata enrichment.
app.get('/api/pending-donaldson', adminLimiter, requireAdmin, async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 100, 1000);
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT sku, codigo_base, description, filter_type, sub_type, technology,
             installation_type, thread_size,
             outer_diameter_mm, height_mm, gasket_od_mm, gasket_id_mm,
             iso_test_method, micron_rating, nominal_efficiency,
             burst_pressure_psi, collapse_pressure_psi, duty
      FROM elimfilters_catalog
      WHERE codigo_base IS NOT NULL
        AND codigo_base ~ '^P[0-9]'
        AND (
          equipment_applications IS NULL
          OR jsonb_typeof(equipment_applications) <> 'array'
          OR jsonb_array_length(equipment_applications) = 0
          OR oem_codes IS NULL
          OR jsonb_typeof(oem_codes) <> 'array'
          OR jsonb_array_length(oem_codes) = 0
        )
      ORDER BY sku
      LIMIT $1
    `, [limit]);
    res.json({ success: true, count: result.rows.length, products: result.rows });
  } catch(e) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// ─── POST /api/import/donaldson ──────────────────────────────────────────────
// Accepts batch of pre-processed rows and upserts into elimfilters_catalog.
// Requires Authorization: Bearer <ADMIN_KEY>
const VALID_FILTER_TYPES = new Set(['oil','fuel','air','cabin','hydraulic','compressed-air','water','other']);
const VALID_DUTIES = new Set(['light','standard','heavy','extreme',null,undefined,'']);
const _validateImportRow = (row) => {
  if (!row || typeof row !== 'object') return 'row must be an object';
  if (!row.sku || typeof row.sku !== 'string' || !/^[A-Z0-9\-]{2,40}$/.test(row.sku)) return `invalid sku: ${row.sku}`;
  if (!row.codigo_base || typeof row.codigo_base !== 'string' || row.codigo_base.length > 100) return `invalid codigo_base: ${row.codigo_base}`;
  if (row.filter_type && !VALID_FILTER_TYPES.has(row.filter_type)) return `invalid filter_type: ${row.filter_type}`;
  if (row.duty !== undefined && !VALID_DUTIES.has(row.duty)) return `invalid duty: ${row.duty}`;
  if (row.oem_codes !== undefined && !Array.isArray(row.oem_codes)) return 'oem_codes must be array';
  if (row.equipment_applications !== undefined && !Array.isArray(row.equipment_applications)) return 'equipment_applications must be array';
  if (row.micron_rating !== undefined && row.micron_rating !== null && typeof row.micron_rating !== 'number') return 'micron_rating must be number';
  return null;
};

app.post('/api/import/donaldson', importLimiter, requireAdmin, async (req, res) => {
  const rows = req.body.rows;
  if (!Array.isArray(rows) || rows.length === 0)
    return res.status(400).json({ error: 'rows array required' });
  if (rows.length > 500)
    return res.status(400).json({ error: 'batch size exceeds limit of 500 rows' });

  const client = await pool.connect();
  try {
    let inserted = 0, updated = 0, errors = 0;

    for (const row of rows) {
      const validationError = _validateImportRow(row);
      if (validationError) { errors++; continue; }

      // ALL codes from Donaldson's website are OEM codes regardless of brand name.
      // If the scraper sends any codes in competitor_codes, merge them into oem_codes.
      if (Array.isArray(row.competitor_codes) && row.competitor_codes.length > 0) {
        row.oem_codes = [...(row.oem_codes || []), ...row.competitor_codes];
        row.competitor_codes = [];
      }

      try {
        const result = await client.query(`
          INSERT INTO elimfilters_catalog (
            sku, codigo_base, description, filter_type, sub_type, technology,
            installation_type, thread_size,
            outer_diameter_mm, height_mm, gasket_od_mm, gasket_id_mm,
            iso_test_method, micron_rating, nominal_efficiency,
            burst_pressure_psi, collapse_pressure_psi,
            duty,
            oem_codes, competitor_codes, brand_crossrefs, alternatives, equipment_applications
          ) VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,
            $19::jsonb,$20::jsonb,$21::jsonb,$22::jsonb,$23::jsonb
          )
          ON CONFLICT (sku) DO UPDATE SET
            codigo_base           = COALESCE(EXCLUDED.codigo_base,           elimfilters_catalog.codigo_base),
            description           = COALESCE(EXCLUDED.description,           elimfilters_catalog.description),
            filter_type           = COALESCE(EXCLUDED.filter_type,           elimfilters_catalog.filter_type),
            sub_type              = COALESCE(EXCLUDED.sub_type,              elimfilters_catalog.sub_type),
            technology            = COALESCE(EXCLUDED.technology,            elimfilters_catalog.technology),
            installation_type     = COALESCE(EXCLUDED.installation_type,     elimfilters_catalog.installation_type),
            thread_size           = COALESCE(EXCLUDED.thread_size,           elimfilters_catalog.thread_size),
            outer_diameter_mm     = COALESCE(EXCLUDED.outer_diameter_mm,     elimfilters_catalog.outer_diameter_mm),
            height_mm             = COALESCE(EXCLUDED.height_mm,             elimfilters_catalog.height_mm),
            gasket_od_mm          = COALESCE(EXCLUDED.gasket_od_mm,          elimfilters_catalog.gasket_od_mm),
            gasket_id_mm          = COALESCE(EXCLUDED.gasket_id_mm,          elimfilters_catalog.gasket_id_mm),
            iso_test_method       = COALESCE(EXCLUDED.iso_test_method,       elimfilters_catalog.iso_test_method),
            micron_rating         = COALESCE(EXCLUDED.micron_rating,         elimfilters_catalog.micron_rating),
            nominal_efficiency    = COALESCE(EXCLUDED.nominal_efficiency,    elimfilters_catalog.nominal_efficiency),
            burst_pressure_psi    = COALESCE(EXCLUDED.burst_pressure_psi,    elimfilters_catalog.burst_pressure_psi),
            collapse_pressure_psi = COALESCE(EXCLUDED.collapse_pressure_psi, elimfilters_catalog.collapse_pressure_psi),
            duty                  = COALESCE(EXCLUDED.duty,                  elimfilters_catalog.duty),
            oem_codes             = CASE WHEN jsonb_array_length(EXCLUDED.oem_codes) > 0             THEN EXCLUDED.oem_codes             ELSE COALESCE(elimfilters_catalog.oem_codes,             EXCLUDED.oem_codes) END,
            competitor_codes      = CASE WHEN jsonb_array_length(EXCLUDED.competitor_codes) > 0      THEN EXCLUDED.competitor_codes      ELSE COALESCE(elimfilters_catalog.competitor_codes,      EXCLUDED.competitor_codes) END,
            brand_crossrefs       = CASE WHEN EXCLUDED.brand_crossrefs <> '{}'::jsonb               THEN EXCLUDED.brand_crossrefs       ELSE COALESCE(elimfilters_catalog.brand_crossrefs,       EXCLUDED.brand_crossrefs) END,
            alternatives          = CASE WHEN jsonb_array_length(EXCLUDED.alternatives) > 0          THEN EXCLUDED.alternatives          ELSE COALESCE(elimfilters_catalog.alternatives,          EXCLUDED.alternatives) END,
            equipment_applications = CASE WHEN jsonb_array_length(EXCLUDED.equipment_applications) > 0 THEN EXCLUDED.equipment_applications ELSE COALESCE(elimfilters_catalog.equipment_applications, EXCLUDED.equipment_applications) END
          RETURNING xmax
        `, [
          row.sku, row.codigo_base, row.description || null,
          row.filter_type || null, row.sub_type || null,
          row.technology || null,
          row.installation_type || null, row.thread_size || null,
          row.outer_diameter_mm || null, row.height_mm || null,
          row.gasket_od_mm || null, row.gasket_id_mm || null,
          row.iso_test_method || null, row.micron_rating || null,
          row.nominal_efficiency || null,
          row.burst_pressure_psi || null, row.collapse_pressure_psi || null,
          row.duty || 'HEAVY_DUTY',
          JSON.stringify(row.oem_codes || []),
          JSON.stringify(row.competitor_codes || []),
          JSON.stringify(row.brand_crossrefs || {}),
          JSON.stringify(row.alternatives || []),
          JSON.stringify(row.equipment_applications || [])
        ]);
        // xmax = 0 means insert, otherwise update
        if (result.rows && result.rows[0] && result.rows[0].xmax === '0') inserted++;
        else updated++;
      } catch (rowErr) {
        errors++;
        console.error('[import-err]', row.sku, rowErr.message);
      }
    }

    res.json({ success: true, total: rows.length, inserted, updated, errors });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// ─── POST /api/import/mann ───────────────────────────────────────────────────
// Imports Mann Filter LD products scraped from mann-filter.com (mann_master.jsonl).
// SKU generation rule: prefix (3 chars) + last 4 digits of MANN code number.
//   Oil Filter  → EL3xxxx | Air Filter → EA3xxxx
//   Cabin Filter→ EC3xxxx | Fuel Filter→ EF3xxxx
// duty is always LIGHT_DUTY. codigo_base = last 4 digits of MANN code.
// Accepts batches of up to 500 rows. Skips rows with colliding SKUs (returns them).
const MANN_FILTER_TYPE_MAP = {
  'oil filter':   { prefix: 'EL3', filter_type: 'Oil Filter' },
  'fuel filter':  { prefix: 'EF3', filter_type: 'Fuel Filter' },
  'air filter':   { prefix: 'EA3', filter_type: 'Air Filter' },
  'cabin filter': { prefix: 'EC3', filter_type: 'Cabin Filter' },
};

function mannCodeToBase(mannCode) {
  // Extract all digit groups, join, take last 4 digits.
  // "ML 1003" → "1003" | "W 940/21" → "94021" → "4021" | "HU 711/51" → "71151" → "1151"
  const digits = (mannCode || '').replace(/[^0-9]/g, '');
  if (digits.length < 4) return digits.padStart(4, '0');
  return digits.slice(-4);
}

function mannOeNumbersToOemCodes(oeNumbers) {
  // oeNumbers: {"FIAT": ["4119015", ...], "OPEL": ["3448991", ...]}
  // → [{manufacturer: "FIAT", code: "4119015"}, ...]
  const result = [];
  for (const [mfr, codes] of Object.entries(oeNumbers || {})) {
    if (Array.isArray(codes)) {
      for (const code of codes) {
        const c = String(code).trim();
        if (c) result.push({ manufacturer: mfr.trim(), code: c });
      }
    }
  }
  return result;
}

// Remove null bytes and control chars that PostgreSQL JSONB rejects
function sanitizeStr(v) {
  if (typeof v !== 'string') return v;
  // eslint-disable-next-line no-control-regex
  return v.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '').trim();
}

function mannFitmentToEquipmentApplications(fitment) {
  return (fitment || []).map(f => ({
    make:         sanitizeStr(f.make         || ''),
    model:        sanitizeStr([f.model_family, f.model_type].filter(Boolean).join(' ').trim()),
    engine_code:  sanitizeStr(f.engine_code  || ''),
    year_range:   sanitizeStr(String(f.year  || '')),
    ccm:          sanitizeStr(String(f.ccm   || '')),
    kw:           sanitizeStr(String(f.kw    || '')),
    hp:           sanitizeStr(String(f.hp    || '')),
  })).filter(a => a.make || a.model);
}

app.post('/api/import/mann', importLimiter, requireAdmin, async (req, res) => {
  const rows = req.body.rows;
  if (!Array.isArray(rows) || rows.length === 0)
    return res.status(400).json({ error: 'rows array required' });
  if (rows.length > 500)
    return res.status(400).json({ error: 'batch size exceeds 500' });

  const client = await pool.connect();
  try {
    let inserted = 0, updated = 0, errors = 0, skipped = [], errorDetails = [];

    for (const row of rows) {
      const mannCode = (row.mann_code || '').trim();
      if (!mannCode) { errors++; continue; }

      const ftKey = (row.filter_type_raw || '').toLowerCase().trim();
      const mapping = MANN_FILTER_TYPE_MAP[ftKey];
      if (!mapping) {
        errors++;
        console.error('[mann-import] unknown filter_type_raw:', row.filter_type_raw, 'sku:', mannCode);
        continue;
      }

      const codeBase = mannCodeToBase(mannCode);
      const sku      = mapping.prefix + codeBase;

      if (!/^[A-Z0-9]{5,10}$/.test(sku)) {
        errors++;
        console.error('[mann-import] invalid generated sku:', sku, 'from:', mannCode);
        continue;
      }

      const oem_codes            = mannOeNumbersToOemCodes(row.oe_numbers);
      const equipment_applications = mannFitmentToEquipmentApplications(row.fitment);

      try {
        const result = await client.query(`
          INSERT INTO elimfilters_catalog (
            sku, codigo_base, description, filter_type, duty,
            oem_codes, competitor_codes, brand_crossrefs,
            equipment_applications,
            outer_diameter_mm, height_mm
          ) VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb,$8::jsonb,$9::jsonb,$10,$11)
          ON CONFLICT (sku) DO UPDATE SET
            codigo_base            = COALESCE(EXCLUDED.codigo_base,             elimfilters_catalog.codigo_base),
            description            = COALESCE(EXCLUDED.description,             elimfilters_catalog.description),
            filter_type            = COALESCE(EXCLUDED.filter_type,             elimfilters_catalog.filter_type),
            duty                   = EXCLUDED.duty,
            oem_codes              = CASE WHEN jsonb_array_length(EXCLUDED.oem_codes) > 0
                                       THEN EXCLUDED.oem_codes
                                       ELSE COALESCE(elimfilters_catalog.oem_codes, EXCLUDED.oem_codes) END,
            competitor_codes       = COALESCE(elimfilters_catalog.competitor_codes, '[]'::jsonb),
            brand_crossrefs        = COALESCE(elimfilters_catalog.brand_crossrefs,  '{}'::jsonb),
            equipment_applications = CASE WHEN jsonb_array_length(EXCLUDED.equipment_applications) > 0
                                       THEN EXCLUDED.equipment_applications
                                       ELSE COALESCE(elimfilters_catalog.equipment_applications, EXCLUDED.equipment_applications) END,
            outer_diameter_mm      = COALESCE(EXCLUDED.outer_diameter_mm, elimfilters_catalog.outer_diameter_mm),
            height_mm              = COALESCE(EXCLUDED.height_mm,         elimfilters_catalog.height_mm)
          RETURNING xmax
        `, [
          sku, codeBase,
          row.description || null,
          mapping.filter_type,
          'LIGHT_DUTY',
          JSON.stringify(oem_codes),
          JSON.stringify([]),
          JSON.stringify({}),
          JSON.stringify(equipment_applications),
          row.outer_diameter_mm || null,
          row.height_mm || null,
        ]);
        if (result.rows && result.rows[0] && result.rows[0].xmax === '0') inserted++;
        else updated++;
      } catch (rowErr) {
        errors++;
        errorDetails.push({ sku, error: rowErr.message });
        console.error('[mann-import-err]', sku, rowErr.message);
      }
    }

    res.json({ success: true, total: rows.length, inserted, updated, errors, skipped, errorDetails });
  } catch (e) {
    console.error('[mann-import-fatal]', e.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    client.release();
  }
});


// ─── POST /api/import/fleetguard ─────────────────────────────────────────────
// Imports Fleetguard HD products scraped from fleetguard.com.
// SKU generation rule: prefix (3 chars) + numeric suffix of Fleetguard code.
//   Air Filter   → EA1 + digits  (AF25551 → EA125551)
//   Oil Filter   → EL8 + digits  (LF3706  → EL83706)
//   Fuel Filter  → EF9 + digits  (FS1000  → EF91000)
//   Hydraulic    → EH6 + digits  (HF35308 → EH635308)
// duty is always HEAVY_DUTY.
const FLEETGUARD_PREFIX_MAP = {
  'Air Filter':      { prefix: 'EA1' },
  'Oil Filter':      { prefix: 'EL8' },
  'Fuel Filter':     { prefix: 'EF9' },
  'Hydraulic Filter':{ prefix: 'EH6' },
};

app.post('/api/import/fleetguard', importLimiter, requireAdmin, async (req, res) => {
  const rows = req.body.rows;
  if (!Array.isArray(rows) || rows.length === 0)
    return res.status(400).json({ error: 'rows array required' });
  if (rows.length > 500)
    return res.status(400).json({ error: 'batch size exceeds 500' });

  const client = await pool.connect();
  try {
    let inserted = 0, updated = 0, errors = 0, skipped = [], errorDetails = [];

    for (const row of rows) {
      const fgCode = (row.fleetguard_code || '').trim().toUpperCase();
      if (!fgCode) { errors++; continue; }

      const ftRaw = (row.filter_type_raw || '').trim();
      const mapping = FLEETGUARD_PREFIX_MAP[ftRaw];
      if (!mapping) {
        errors++;
        console.error('[fg-import] unknown filter_type_raw:', ftRaw, 'code:', fgCode);
        continue;
      }

      const codeBase = (row.codigo_base || '').replace(/[^0-9]/g, '');
      if (!codeBase || codeBase.length < 3) {
        errors++;
        console.error('[fg-import] invalid codigo_base:', row.codigo_base, 'from:', fgCode);
        continue;
      }

      const sku = mapping.prefix + codeBase;
      if (!/^[A-Z0-9]{5,10}$/.test(sku)) {
        errors++;
        console.error('[fg-import] invalid generated sku:', sku, 'from:', fgCode);
        continue;
      }

      // Check for SKU collision with existing non-Fleetguard product
      const existing = await client.query(
        `SELECT sku FROM elimfilters_catalog WHERE sku = $1`, [sku]
      );
      if (existing.rows.length > 0) {
        // Already exists — update is fine (ON CONFLICT handles it)
      }

      const competitor_codes = Array.isArray(row.competitor_codes) ? row.competitor_codes : [];
      const equipment_applications = Array.isArray(row.equipment_applications)
        ? row.equipment_applications : [];

      // Add Fleetguard itself as a competitor_code so it's searchable by FG part number
      const fg_self = { manufacturer: 'FLEETGUARD', code: fgCode };
      const all_competitor_codes = [fg_self, ...competitor_codes.filter(
        c => !(c.manufacturer === 'FLEETGUARD' && c.code === fgCode)
      )];

      try {
        const result = await client.query(`
          INSERT INTO elimfilters_catalog (
            sku, codigo_base, description, filter_type, duty,
            oem_codes, competitor_codes, brand_crossrefs,
            equipment_applications,
            outer_diameter_mm, height_mm
          ) VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb,$8::jsonb,$9::jsonb,$10,$11)
          ON CONFLICT (sku) DO UPDATE SET
            codigo_base            = COALESCE(EXCLUDED.codigo_base,             elimfilters_catalog.codigo_base),
            description            = COALESCE(EXCLUDED.description,             elimfilters_catalog.description),
            filter_type            = COALESCE(EXCLUDED.filter_type,             elimfilters_catalog.filter_type),
            duty                   = EXCLUDED.duty,
            competitor_codes       = CASE WHEN jsonb_array_length(EXCLUDED.competitor_codes) > 0
                                       THEN EXCLUDED.competitor_codes
                                       ELSE COALESCE(elimfilters_catalog.competitor_codes, '[]'::jsonb) END,
            brand_crossrefs        = COALESCE(elimfilters_catalog.brand_crossrefs, '{}'::jsonb),
            equipment_applications = CASE WHEN jsonb_array_length(EXCLUDED.equipment_applications) > 0
                                       THEN EXCLUDED.equipment_applications
                                       ELSE COALESCE(elimfilters_catalog.equipment_applications, EXCLUDED.equipment_applications) END,
            outer_diameter_mm      = COALESCE(EXCLUDED.outer_diameter_mm, elimfilters_catalog.outer_diameter_mm),
            height_mm              = COALESCE(EXCLUDED.height_mm,         elimfilters_catalog.height_mm)
          RETURNING xmax
        `, [
          sku, codeBase,
          row.description || null,
          ftRaw,
          'HEAVY_DUTY',
          JSON.stringify([]),
          JSON.stringify(all_competitor_codes),
          JSON.stringify({}),
          JSON.stringify(equipment_applications),
          row.outer_diameter_mm || null,
          row.height_mm || null,
        ]);
        if (result.rows && result.rows[0] && result.rows[0].xmax === '0') inserted++;
        else updated++;
      } catch (rowErr) {
        errors++;
        errorDetails.push({ sku, fgCode, error: rowErr.message });
        console.error('[fg-import-err]', sku, fgCode, rowErr.message);
      }
    }

    res.json({ success: true, total: rows.length, inserted, updated, errors, skipped, errorDetails });
  } catch (e) {
    console.error('[fg-import-fatal]', e.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// ─── POST /api/update/wix-crossrefs ──────────────────────────────────────────
// Adds WIX cross-reference numbers to existing LD products' competitor_codes.
// Merges new WIX entries without removing existing competitor codes.
// Body: { rows: [{ mann_sku: "W940/21", wix_numbers: ["51452"], filter_type: "Oil Filter" }] }
app.post('/api/update/wix-crossrefs', importLimiter, requireAdmin, async (req, res) => {
  const rows = req.body.rows;
  if (!Array.isArray(rows) || rows.length === 0)
    return res.status(400).json({ error: 'rows array required' });
  if (rows.length > 500)
    return res.status(400).json({ error: 'batch size exceeds 500' });

  const client = await pool.connect();
  try {
    let updated = 0, skipped = 0, errors = 0;

    for (const row of rows) {
      const mannSku  = (row.mann_sku || '').trim().toUpperCase();
      const wixNums  = Array.isArray(row.wix_numbers) ? row.wix_numbers : [];
      if (!mannSku || wixNums.length === 0) { skipped++; continue; }

      // Build the ELIMFILTERS SKU from the Mann part number
      // Mann code → codigo_base (last 4 digits) → find matching LD SKU
      const mannDigits = mannSku.replace(/[^0-9]/g, '');
      if (mannDigits.length < 3) { skipped++; continue; }
      const codeBase = mannDigits.slice(-4);

      // Find the LD product by codigo_base and duty
      const found = await client.query(
        `SELECT sku, competitor_codes FROM elimfilters_catalog
         WHERE codigo_base = $1 AND duty = 'LIGHT_DUTY' LIMIT 1`,
        [codeBase]
      );
      if (found.rows.length === 0) { skipped++; continue; }

      const { sku, competitor_codes } = found.rows[0];
      const existing = Array.isArray(competitor_codes) ? competitor_codes : [];

      // Build new WIX entries, skip duplicates
      const existingWix = new Set(
        existing.filter(c => c.manufacturer === 'WIX').map(c => c.code)
      );
      const newEntries = wixNums
        .map(w => String(w).trim())
        .filter(w => w && !existingWix.has(w))
        .map(w => ({ manufacturer: 'WIX', code: w }));

      if (newEntries.length === 0) { skipped++; continue; }

      const merged = [...existing, ...newEntries];

      try {
        await client.query(
          `UPDATE elimfilters_catalog SET competitor_codes = $1::jsonb WHERE sku = $2`,
          [JSON.stringify(merged), sku]
        );
        updated++;
      } catch (rowErr) {
        errors++;
        console.error('[wix-crossref-err]', sku, mannSku, rowErr.message);
      }
    }

    res.json({ success: true, total: rows.length, updated, skipped, errors });
  } catch (e) {
    console.error('[wix-crossref-fatal]', e.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// ─── POST /api/update/competitor-codes ───────────────────────────────────────
// Merges FRAM/Bosch/ACDelco codes from WIX reverse lookup into competitor_codes.
// Finds product by mann_sku (codigo_base match, LIGHT_DUTY).
// Body: { rows: [{ mann_sku: "W940/21", competitor_codes: [{manufacturer:"FRAM",code:"PH3387A"},...] }] }
// FRAM prefix → allowed filter types (cross-type guard)
const FRAM_CODE_TO_FILTER_TYPE = {
  PH: 'Oil Filter',
  CA: 'Air Filter',
  CF: 'Cabin Filter',
  G:  'Fuel Filter',
};
function framCodeFilterType(code) {
  const c = (code || '').toUpperCase();
  for (const [prefix, ftype] of Object.entries(FRAM_CODE_TO_FILTER_TYPE)) {
    if (c.startsWith(prefix)) return ftype;
  }
  return null;
}

app.post('/api/update/competitor-codes', importLimiter, requireAdmin, async (req, res) => {
  const rows = req.body.rows;
  if (!Array.isArray(rows) || rows.length === 0)
    return res.status(400).json({ error: 'rows array required' });
  if (rows.length > 500)
    return res.status(400).json({ error: 'batch size exceeds 500' });

  const client = await pool.connect();
  try {
    let updated = 0, skipped = 0, errors = 0;

    for (const row of rows) {
      const mannSku  = (row.mann_sku || '').trim().toUpperCase();
      const newCodes = Array.isArray(row.competitor_codes) ? row.competitor_codes : [];
      if (!mannSku || newCodes.length === 0) { skipped++; continue; }

      const mannDigits = mannSku.replace(/[^0-9]/g, '');
      if (mannDigits.length < 3) { skipped++; continue; }
      const codeBase = mannDigits.slice(-4);

      const found = await client.query(
        `SELECT sku, filter_type, competitor_codes FROM elimfilters_catalog
         WHERE codigo_base = $1 AND duty = 'LIGHT_DUTY' LIMIT 1`,
        [codeBase]
      );
      if (found.rows.length === 0) { skipped++; continue; }

      const { sku, filter_type, competitor_codes } = found.rows[0];
      const existing = Array.isArray(competitor_codes) ? competitor_codes : [];

      // Build dedup key set from existing entries
      const existingKeys = new Set(existing.map(c => `${c.manufacturer}|${c.code}`));
      const toAdd = newCodes.filter(c => {
        const k = `${(c.manufacturer||'').toUpperCase()}|${(c.code||'').toUpperCase()}`;
        if (!c.manufacturer || !c.code || existingKeys.has(k)) return false;
        // FRAM = LD consumer brand only — never insert on HD SKUs
        if ((c.manufacturer||'').toUpperCase() === 'FRAM') {
          if (!sku.startsWith('EL3') && !sku.startsWith('EA3') &&
              !sku.startsWith('EC3') && !sku.startsWith('EF3')) return false;
          const expectedType = framCodeFilterType(c.code);
          if (expectedType && filter_type && expectedType !== filter_type) return false;
        }
        return true;
      }).map(c => ({ manufacturer: c.manufacturer.toUpperCase(), code: c.code.toUpperCase() }));

      if (toAdd.length === 0) { skipped++; continue; }

      const merged = [...existing, ...toAdd];
      try {
        await client.query(
          `UPDATE elimfilters_catalog SET competitor_codes = $1::jsonb WHERE sku = $2`,
          [JSON.stringify(merged), sku]
        );
        updated++;
      } catch (rowErr) {
        errors++;
        console.error('[competitor-codes-err]', sku, rowErr.message);
      }
    }

    res.json({ success: true, total: rows.length, updated, skipped, errors });
  } catch (e) {
    console.error('[competitor-codes-fatal]', e.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// ─── POST /api/cleanup/fram-crosstype ────────────────────────────────────────
// Remove FRAM codes that were assigned to wrong filter type SKUs.
// FRAM PH (oil) must not appear on Air/Cabin/Fuel SKUs.
// Runs a full-table scan and strips mismatched FRAM entries.
app.post('/api/cleanup/fram-crosstype', importLimiter, requireAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    // FRAM prefix → ONLY allowed SKU prefixes (LD consumer brand — never on HD)
    const FRAM_TYPE_MAP = {
      'PH': ['EL3'],   // FRAM Extra Guard / oil
      'XG': ['EL3'],   // FRAM Ultra Synthetic oil
      'TG': ['EL3'],   // FRAM Tough Guard oil
      'DG': ['EL3'],   // FRAM Double Guard oil
      'CA': ['EA3'],   // FRAM air
      'CF': ['EC3'],   // FRAM cabin
      'G':  ['EF3'],   // FRAM fuel
    };

    // Scan ALL products that have any competitor_codes (objects OR plain strings)
    const rows = await client.query(
      `SELECT sku, competitor_codes FROM elimfilters_catalog
       WHERE competitor_codes IS NOT NULL
         AND jsonb_array_length(competitor_codes) > 0`
    );

    let cleaned = 0;
    const debugRemoved = [];
    for (const row of rows.rows) {
      const { sku, competitor_codes } = row;
      const existing = Array.isArray(competitor_codes) ? competitor_codes : [];
      const skuPrefix = sku.slice(0, 3).toUpperCase();

      const filtered = existing.filter(c => {
        let isFram = false;
        let code = '';

        if (typeof c === 'string') {
          // Plain string format — treat as code with unknown manufacturer
          code = c.toUpperCase().trim();
          // Check if it matches any known FRAM prefix pattern
          isFram = Object.keys(FRAM_TYPE_MAP).some(pfx =>
            code.startsWith(pfx) && /^\d/.test(code.slice(pfx.length))
          );
        } else if (c && typeof c === 'object') {
          const mfr = (c.manufacturer || '').toUpperCase().trim();
          code = (c.code || '').toUpperCase().trim();
          isFram = (mfr === 'FRAM');
        }

        if (!isFram) return true; // keep non-FRAM

        // FRAM code: only keep if SKU prefix is in the allowed list
        const allowedPrefixes = FRAM_TYPE_MAP[
          Object.keys(FRAM_TYPE_MAP).find(pfx => code.startsWith(pfx))
        ] || [];
        const keep = allowedPrefixes.some(p => skuPrefix === p);
        if (!keep && debugRemoved.length < 10) debugRemoved.push({ sku, code });
        return keep;
      });

      if (filtered.length !== existing.length) {
        await client.query(
          `UPDATE elimfilters_catalog SET competitor_codes = $1::jsonb WHERE sku = $2`,
          [JSON.stringify(filtered), sku]
        );
        cleaned++;
      }
    }

    res.json({ success: true, skus_cleaned: cleaned, rows_scanned: rows.rows.length, debug_removed: debugRemoved });
  } catch (e) {
    console.error('[cleanup-fram]', e.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// ─── POST /api/update/sku-codes ──────────────────────────────────────────────
// Direct overwrite of competitor_codes by exact SKU — works for HD and LD.
// Body: { sku: "EL80047", competitor_codes: [...] }
app.post('/api/update/sku-codes', importLimiter, requireAdmin, async (req, res) => {
  const { sku, competitor_codes } = req.body || {};
  if (!sku || !Array.isArray(competitor_codes)) {
    return res.status(400).json({ error: 'sku and competitor_codes[] required' });
  }
  const client = await pool.connect();
  try {
    const r = await client.query(
      `UPDATE elimfilters_catalog SET competitor_codes = $1::jsonb WHERE sku = $2 RETURNING sku`,
      [JSON.stringify(competitor_codes), sku.trim().toUpperCase()]
    );
    if (r.rowCount === 0) return res.status(404).json({ error: 'SKU not found' });
    res.json({ success: true, sku: r.rows[0].sku, codes_count: competitor_codes.length });
  } catch (e) {
    console.error('[update/sku-codes]', e.message);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// ─── POST /api/cleanup/fram-ld-duty ──────────────────────────────────────────
// Remove FRAM codes from LD products (EL3/EA3/EC3/EF3) where the FRAM code is
// known to be HD-only (thread 3/4"-16 or 1-1/8"-16 used on Caterpillar/Cummins/
// Mack/Volvo/etc.). These were imported via WIX reverse lookup without duty
// validation, causing mixed results when searching by that FRAM code.
// Removes entries with manufacturer='FRAM' (any case) from LD SKUs only when
// the code matches HD FRAM patterns: PH3xxx, PH4xxx, PH5xxx, PH8xxx, PH9xxx.
app.post('/api/cleanup/fram-ld-duty', importLimiter, requireAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    // HD FRAM oil filter prefixes by number range (3/4"-16 and 1-1/8"-16 threads)
    // These ranges appear on Cummins/Cat/Mack/Volvo — never on passenger car LD.
    const HD_FRAM_PATTERNS = /^PH(3\d{3}|4\d{3}|5\d{3}|6\d{3}|8\d{3}|9\d{3})/i;

    const rows = await client.query(
      `SELECT sku, competitor_codes FROM elimfilters_catalog
       WHERE duty = 'LIGHT_DUTY'
         AND competitor_codes IS NOT NULL
         AND jsonb_array_length(competitor_codes) > 0`
    );

    let cleaned = 0;
    const removed = [];
    for (const row of rows.rows) {
      const existing = Array.isArray(row.competitor_codes) ? row.competitor_codes : [];
      const filtered = existing.filter(c => {
        const mfr = (c?.manufacturer || '').toUpperCase();
        const code = (c?.code || (typeof c === 'string' ? c : '')).toUpperCase().trim();
        if (mfr !== 'FRAM' && !HD_FRAM_PATTERNS.test(code)) return true;
        const isHdFram = mfr === 'FRAM' && HD_FRAM_PATTERNS.test(code);
        if (isHdFram && removed.length < 20) removed.push({ sku: row.sku, code });
        return !isHdFram;
      });
      if (filtered.length !== existing.length) {
        await client.query(
          `UPDATE elimfilters_catalog SET competitor_codes = $1::jsonb WHERE sku = $2`,
          [JSON.stringify(filtered), row.sku]
        );
        cleaned++;
      }
    }

    res.json({ success: true, ld_rows_scanned: rows.rows.length, skus_cleaned: cleaned, sample_removed: removed });
  } catch (e) {
    console.error('[cleanup-fram-ld-duty]', e.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// ─── POST /api/cleanup/fram-hd-force ─────────────────────────────────────────
// Hard SQL-based cleanup: strip ALL FRAM PH/CA/CF/G codes from HD SKUs (EL8, EA1, EC1, EF9).
// Handles any manufacturer key format (uppercase, lowercase, missing).
app.post('/api/cleanup/fram-hd-force', importLimiter, requireAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    // Step 1: find all HD SKUs that have any entry with a FRAM-pattern code
    const rows = await client.query(`
      SELECT sku, competitor_codes
      FROM elimfilters_catalog
      WHERE (
        sku LIKE 'EL8%' OR sku LIKE 'EA1%' OR sku LIKE 'EC1%' OR sku LIKE 'EF9%'
      )
      AND competitor_codes IS NOT NULL
      AND jsonb_array_length(competitor_codes) > 0
    `);

    const FRAM_CODE_PATTERN = /^(PH|CA|CF|G)\d/i;

    let cleaned = 0;
    let debug_sample = [];
    for (const row of rows.rows) {
      const { sku, competitor_codes } = row;
      const existing = Array.isArray(competitor_codes) ? competitor_codes : [];

      const filtered = existing.filter(c => {
        const mfr = (c.manufacturer || '').toUpperCase().trim();
        const code = (c.code || c.partNumber || c.part_number || '').toUpperCase().trim();
        // Remove if manufacturer is FRAM or code matches FRAM pattern
        if (mfr === 'FRAM') return false;
        if (!mfr && FRAM_CODE_PATTERN.test(code)) return false;
        return true;
      });

      if (filtered.length !== existing.length) {
        if (debug_sample.length < 5) {
          debug_sample.push({
            sku,
            removed: existing.length - filtered.length,
            sample_removed: existing.filter(c => !filtered.includes(c)).slice(0,3),
          });
        }
        await client.query(
          `UPDATE elimfilters_catalog SET competitor_codes = $1::jsonb WHERE sku = $2`,
          [JSON.stringify(filtered), sku]
        );
        cleaned++;
      }
    }

    res.json({
      success: true,
      hd_rows_scanned: rows.rows.length,
      skus_cleaned: cleaned,
      debug_sample,
    });
  } catch (e) {
    console.error('[cleanup-fram-hd-force]', e.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// ─── GET /api/debug/sku-codes ─────────────────────────────────────────────────
// Debug endpoint: return raw competitor_codes for a specific SKU.
app.get('/api/debug/sku-codes', adminLimiter, requireAdmin, async (req, res) => {
  const sku = (req.query.sku || '').trim().toUpperCase();
  if (!sku) return res.status(400).json({ error: 'sku param required' });
  const client = await pool.connect();
  try {
    const r = await client.query(
      `SELECT sku, duty, filter_type, competitor_codes FROM elimfilters_catalog WHERE sku = $1`,
      [sku]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: 'SKU not found' });
    res.json(r.rows[0]);
  } finally {
    client.release();
  }
});

// ─── GET /api/recheck-donaldson ──────────────────────────────────────────────
// Returns products that were scraped (have spec data) but are missing
// oem_codes AND/OR equipment_applications — second-pass recheck queue.
app.get('/api/recheck-donaldson', adminLimiter, requireAdmin, async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 200, 1000);
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT sku, codigo_base, description, filter_type, sub_type, technology,
             installation_type, thread_size,
             outer_diameter_mm, height_mm, gasket_od_mm, gasket_id_mm,
             iso_test_method, micron_rating, nominal_efficiency,
             burst_pressure_psi, collapse_pressure_psi, duty
      FROM elimfilters_catalog
      WHERE codigo_base IS NOT NULL
        AND codigo_base ~ '^P[0-9]'
        AND (
          outer_diameter_mm IS NOT NULL OR height_mm IS NOT NULL
          OR thread_size IS NOT NULL OR filter_type IS NOT NULL
        )
        AND (
          (oem_codes IS NULL OR jsonb_array_length(oem_codes) = 0)
          OR (equipment_applications IS NULL OR jsonb_array_length(equipment_applications) = 0)
        )
      ORDER BY sku
      LIMIT $1
    `, [limit]);
    res.json({ success: true, count: result.rows.length, products: result.rows });
  } catch(e) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// ─── GET /api/import/existing-skus ───────────────────────────────────────────
// Returns all existing SKUs so the client can avoid collisions.
app.get('/api/import/existing-skus', adminLimiter, requireAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT sku FROM elimfilters_catalog ORDER BY sku');
    res.json({ success: true, skus: result.rows.map(r => r.sku) });
  } catch (e) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    client.release();
  }
});






// ── UNIFIED SEARCH ──────────────────────────────────────────────────────────

// ─── GET /api/catalog/export ──────────────────────────────────────────────────
app.get('/api/catalog/export', adminLimiter, requireAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT sku, codigo_base, description, filter_type, sub_type, technology,
             installation_type, thread_size,
             outer_diameter_mm, height_mm, gasket_od_mm, gasket_id_mm,
             iso_test_method, micron_rating, nominal_efficiency,
             burst_pressure_psi, collapse_pressure_psi, duty
      FROM elimfilters_catalog
      ORDER BY filter_type, sku
    `);
    const cols = result.fields.map(f => f.name);
    const escape = v => v == null ? '' : (String(v).includes(',') || String(v).includes('"') || String(v).includes('\n'))
      ? '"' + String(v).replace(/"/g, '""') + '"'
      : String(v);
    const lines = [cols.join(','), ...result.rows.map(r => cols.map(c => escape(r[c])).join(','))];
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="elimfilters_catalog.csv"');
    res.send(lines.join('\r\n'));
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

app.get('/api/autocomplete', searchLimiter, async (req, res) => {
  const q = (req.query.q || '').trim().toUpperCase();
  if (q.length < 3) return res.json([]);
  
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT sku, codigo_base, oem_codes, competitor_codes
      FROM elimfilters_catalog
      WHERE sku ILIKE $1 OR codigo_base ILIKE $1 
         OR oem_codes::text ILIKE $1 OR competitor_codes::text ILIKE $1
      LIMIT 40
    `, [`%${q}%`]);

    const suggestions = new Map();
    const addMatch = (text, type) => {
      if (!text || suggestions.size >= 8) return;
      const upper = text.toUpperCase();
      if (upper.includes(q) && !suggestions.has(upper)) {
        suggestions.set(upper, { text: upper, type });
      }
    };

    result.rows.forEach(r => {
      addMatch(r.sku, 'ELIMFILTERS SKU');
      // codigo_base is internal — never surfaced as autocomplete suggestion

      const checkRefs = (arr) => {
        if (!Array.isArray(arr)) return;
        arr.forEach(ref => {
          let code = '';
          let brand = '';
          if (typeof ref === 'string') {
            const parts = ref.split(':');
            code = parts.length >= 2 ? parts.slice(1).join(':').trim() : ref.trim();
            brand = parts.length >= 2 ? parts[0].trim() : '';
          } else {
            code = ref.code || ref.partNumber || '';
            brand = ref.manufacturer || '';
          }
          try { code = decodeURIComponent(code); } catch(e){}
          
          if (code.toUpperCase().includes(q)) {
            const displayType = brand && brand.toUpperCase() !== 'UNKNOWN' && brand.toUpperCase() !== 'OEM' 
              ? `Ref (${brand.toUpperCase()})` 
              : 'Cross-Reference';
            addMatch(code, displayType);
          }
        });
      };
      
      checkRefs(r.oem_codes);
      checkRefs(r.competitor_codes);
    });

    res.json(Array.from(suggestions.values()));
  } catch(e) {
    res.status(500).json([]);
  } finally {
    client.release();
  }
});

app.get('/api/search', searchLimiter, async (req, res) => {
  const q = (req.query.q || '').trim().toUpperCase();
  if (q.length < 2) return res.status(400).json({ error: 'min 2 chars', products: [] });
  const lang = detectLang(req);

  // duty filter: 'HEAVY_DUTY' | 'LIGHT_DUTY' | null (no filter)
  const rawDuty = (req.query.duty || '').trim().toUpperCase();
  let dutyFilter = (rawDuty === 'HEAVY_DUTY' || rawDuty === 'HD') ? 'HEAVY_DUTY'
                 : (rawDuty === 'LIGHT_DUTY'  || rawDuty === 'LD') ? 'LIGHT_DUTY'
                 : null;

  // Note: PH/XG/TG/DG codes can appear as competitor_codes on both HD and LD products.
  // Do NOT auto-force LIGHT_DUTY — let the cross-reference search find the correct product.

  const client = await pool.connect();
  try {

    // ── Tiered search with match_type labels ──────────────────────────────
    // Duty clause applied to every tier — HD/LD must never mix in results.
    // dutyFilter is validated above to only be 'HEAVY_DUTY' or 'LIGHT_DUTY'.
    const dutyClause = dutyFilter === 'HEAVY_DUTY' ? "AND duty = 'HEAVY_DUTY'"
                     : dutyFilter === 'LIGHT_DUTY'  ? "AND duty = 'LIGHT_DUTY'"
                     : '';

    // Tier 1: Exact SKU or Donaldson base code match
    let result = await client.query(
      `SELECT *, 'sku' AS match_type, 0 AS match_rank
       FROM elimfilters_catalog
       WHERE (UPPER(sku) = $1 OR UPPER(codigo_base) = $1) ${dutyClause}
       LIMIT 20`,
      [q]
    );

    // Tier 2: Prefix match on SKU / codigo_base
    if (result.rows.length === 0) {
      result = await client.query(
        `SELECT *, 'sku_prefix' AS match_type, 1 AS match_rank
         FROM elimfilters_catalog
         WHERE (UPPER(sku) LIKE $1 OR UPPER(codigo_base) LIKE $1) ${dutyClause}
         ORDER BY sku
         LIMIT 20`,
        [q + '%']
      );
    }

    // Tier 3+4 combined: OEM + competitor codes — EXACT match only.
    // Cross-reference codes must match precisely; prefix matching causes false positives.
    // Duty filter enforced: HD and LD results never mixed (CLAUDE.md rule).
    if (result.rows.length === 0) {
      result = await client.query(
        `SELECT *, 'ref' AS match_type, 2 AS match_rank
         FROM elimfilters_catalog
         WHERE (
           EXISTS (
             SELECT 1 FROM jsonb_array_elements(COALESCE(oem_codes, '[]'::jsonb)) AS elem
             WHERE UPPER(elem->>'code') = $1
           )
           OR EXISTS (
             SELECT 1 FROM jsonb_array_elements(COALESCE(competitor_codes, '[]'::jsonb)) AS elem
             WHERE UPPER(elem->>'code') = $1
           )
         ) ${dutyClause}
         ORDER BY sku
         LIMIT 20`,
        [q]
      );
    }

    // Tier 5: brand_crossrefs — exact match only
    if (result.rows.length === 0) {
      result = await client.query(
        `SELECT DISTINCT ON (sku) *, 'crossref' AS match_type, 4 AS match_rank
         FROM elimfilters_catalog,
              jsonb_each(COALESCE(brand_crossrefs, '{}'::jsonb)) AS kv,
              jsonb_array_elements_text(kv.value) AS code_val
         WHERE UPPER(code_val) = $1 ${dutyClause}
         ORDER BY sku
         LIMIT 20`,
        [q]
      );
    }

    // Tier 6: Broad partial match fallback (OEM + competitor text scan)
    if (result.rows.length === 0) {
      result = await client.query(
        `SELECT DISTINCT ON (sku) *,
                CASE
                  WHEN UPPER(sku) LIKE $1 OR UPPER(codigo_base) LIKE $1 THEN 'sku_partial'
                  ELSE 'partial'
                END AS match_type,
                5 AS match_rank
         FROM elimfilters_catalog,
              jsonb_array_elements(COALESCE(oem_codes, '[]'::jsonb)) AS oem_elem
         WHERE (
           UPPER(sku) LIKE $1
           OR UPPER(codigo_base) LIKE $1
           OR UPPER(oem_elem->>'code') LIKE $1
         ) ${dutyClause}
         ORDER BY sku
         LIMIT 20`,
        ['%' + q + '%']
      );
    }

    // ── Determine human-readable match label for the frontend ─────────────
    function buildMatchLabel(row) {
      const mt = row.match_type;
      if (mt === 'sku' || mt === 'sku_prefix' || mt === 'sku_partial') {
        if (row.sku && row.sku.toUpperCase().includes(q)) return `ELIMFILTERS ${row.sku}`;
        if (row.codigo_base && row.codigo_base.toUpperCase().includes(q)) return `DONALDSON ${row.codigo_base}`;
        return null;
      }
      if (mt === 'oem' || mt === 'ref') {
        // Check OEM codes first, then competitor codes
        const oems = row.oem_codes || [];
        const oemHit = oems.find(e => e && e.code && e.code.toUpperCase().includes(q));
        if (oemHit) return `${oemHit.manufacturer || 'OEM'} ${oemHit.code}`;
        const comps = row.competitor_codes || [];
        const compHit = comps.find(e => e && e.code && e.code.toUpperCase().includes(q));
        if (compHit) return `${compHit.manufacturer || 'COMPETITOR'} ${compHit.code}`;
        return null;
      }
      if (mt === 'competitor') {
        const comps = row.competitor_codes || [];
        const hit = comps.find(e => e && e.code && e.code.toUpperCase().includes(q));
        if (hit) return `${hit.manufacturer || 'COMPETITOR'} ${hit.code}`;
        return null;
      }
      if (mt === 'crossref') {
        return `CROSS-REFERENCE ${q}`;
      }
      return null;
    }

    const products = result.rows.map(row => ({
      ...buildFilterData(row, lang),
      sku: row.sku,
      match_type: row.match_type || 'partial',
      match_label: buildMatchLabel(row)
    }));

    await enrichAlternatives(products, client);

    // ── HD/LD duty enforcement ────────────────────────────────────────────
    // Per CLAUDE.md: "an HD query must return an HD SKU and an LD query must
    // return an LD SKU. Never cross HD and LD results."
    //
    // If duty was specified in the request, results are already filtered.
    // If not specified and results contain both, flag mixed_duty so the
    // frontend can prompt the user to pick a duty class and retry.
    const hasHD = products.some(p => p.duty === 'HEAVY_DUTY');
    const hasLD = products.some(p => p.duty === 'LIGHT_DUTY');
    const mixed_duty = !dutyFilter && hasHD && hasLD;

    const { rows: [{ count: totalCatalog }] } = await client.query('SELECT COUNT(*) FROM elimfilters_catalog');

    if (mixed_duty) {
      const hd_products = products.filter(p => p.duty === 'HEAVY_DUTY');
      const ld_products = products.filter(p => p.duty === 'LIGHT_DUTY');
      res.json({
        products,
        count: products.length,
        total_catalog: parseInt(totalCatalog, 10),
        mixed_duty: true,
        duty_filter_applied: null,
        hd_products,
        ld_products,
        hd_count: hd_products.length,
        ld_count: ld_products.length,
      });
    } else {
      res.json({
        products,
        count: products.length,
        total_catalog: parseInt(totalCatalog, 10),
        mixed_duty: false,
        duty_filter_applied: dutyFilter || null,
      });
    }
  } catch (e) {
    console.error('[api/search]', e.message);
    res.status(500).json({ error: 'Search unavailable', products: [] });
  } finally {
    client.release();
  }
});

app.get('/api/stats', searchLimiter, async (req, res) => {
  const client = await pool.connect();
  try {
    const r = await client.query(
      `SELECT COUNT(*) AS total, COUNT(DISTINCT technology) AS technologies
       FROM elimfilters_catalog`
    );
    res.json({
      total: parseInt(r.rows[0].total) || 0,
      technologies: parseInt(r.rows[0].technologies) || 0,
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    console.error('[api/stats]', e.message);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});
// ─── GET /api/audit/report ───────────────────────────────────────────────────
// Full catalog data quality audit. Returns stats on completeness.
app.get('/api/audit/report', adminLimiter, requireAdmin, async (req, res) => {
  const client = await pool.connect();
  try {

    const [total, donaldson, missingOem, missingEquip, missingBoth,
           scrapedMissingOem, scrapedMissingEquip, scrapedMissingBoth,
           fullyEmpty, topMfr, topComp] = await Promise.all([

      client.query(`SELECT COUNT(*) FROM elimfilters_catalog`),

      client.query(`SELECT COUNT(*) FROM elimfilters_catalog
                    WHERE codigo_base ~ '^P[0-9]'`),

      client.query(`SELECT COUNT(*) FROM elimfilters_catalog
                    WHERE codigo_base ~ '^P[0-9]'
                    AND (oem_codes IS NULL OR jsonb_array_length(oem_codes) = 0)`),

      client.query(`SELECT COUNT(*) FROM elimfilters_catalog
                    WHERE codigo_base ~ '^P[0-9]'
                    AND (equipment_applications IS NULL OR jsonb_array_length(equipment_applications) = 0)`),

      client.query(`SELECT COUNT(*) FROM elimfilters_catalog
                    WHERE codigo_base ~ '^P[0-9]'
                    AND (oem_codes IS NULL OR jsonb_array_length(oem_codes) = 0)
                    AND (equipment_applications IS NULL OR jsonb_array_length(equipment_applications) = 0)`),

      // Scraped (has specs) but missing oem
      client.query(`SELECT COUNT(*) FROM elimfilters_catalog
                    WHERE codigo_base ~ '^P[0-9]'
                    AND (outer_diameter_mm IS NOT NULL OR height_mm IS NOT NULL OR thread_size IS NOT NULL)
                    AND (oem_codes IS NULL OR jsonb_array_length(oem_codes) = 0)`),

      // Scraped (has specs) but missing equipment
      client.query(`SELECT COUNT(*) FROM elimfilters_catalog
                    WHERE codigo_base ~ '^P[0-9]'
                    AND (outer_diameter_mm IS NOT NULL OR height_mm IS NOT NULL OR thread_size IS NOT NULL)
                    AND (equipment_applications IS NULL OR jsonb_array_length(equipment_applications) = 0)`),

      // Scraped but missing both
      client.query(`SELECT COUNT(*) FROM elimfilters_catalog
                    WHERE codigo_base ~ '^P[0-9]'
                    AND (outer_diameter_mm IS NOT NULL OR height_mm IS NOT NULL OR thread_size IS NOT NULL)
                    AND (oem_codes IS NULL OR jsonb_array_length(oem_codes) = 0)
                    AND (equipment_applications IS NULL OR jsonb_array_length(equipment_applications) = 0)`),

      // Fully empty — no specs, no crossrefs, no equipment (likely obsolete)
      client.query(`SELECT COUNT(*) FROM elimfilters_catalog
                    WHERE codigo_base ~ '^P[0-9]'
                    AND outer_diameter_mm IS NULL AND height_mm IS NULL AND thread_size IS NULL
                    AND (oem_codes IS NULL OR jsonb_array_length(oem_codes) = 0)
                    AND (equipment_applications IS NULL OR jsonb_array_length(equipment_applications) = 0)`),

      // Top OEM manufacturers
      client.query(`SELECT elem->>'manufacturer' AS mfr, COUNT(*) AS cnt
                    FROM elimfilters_catalog, jsonb_array_elements(oem_codes) AS elem
                    WHERE oem_codes IS NOT NULL AND jsonb_array_length(oem_codes) > 0
                    GROUP BY mfr ORDER BY cnt DESC LIMIT 20`),

      // Top competitor brands
      client.query(`SELECT elem->>'manufacturer' AS mfr, COUNT(*) AS cnt
                    FROM elimfilters_catalog, jsonb_array_elements(competitor_codes) AS elem
                    WHERE competitor_codes IS NOT NULL AND jsonb_array_length(competitor_codes) > 0
                    GROUP BY mfr ORDER BY cnt DESC LIMIT 20`),
    ]);

    const t = parseInt(total.rows[0].count);
    const d = parseInt(donaldson.rows[0].count);

    res.json({
      success: true,
      generated: new Date().toISOString(),
      catalog: {
        total_products: t,
        donaldson_products: d,
      },
      completeness: {
        missing_oem_codes:          { count: parseInt(missingOem.rows[0].count),    pct: ((parseInt(missingOem.rows[0].count)/d)*100).toFixed(1)+'%' },
        missing_equipment:          { count: parseInt(missingEquip.rows[0].count),  pct: ((parseInt(missingEquip.rows[0].count)/d)*100).toFixed(1)+'%' },
        missing_both:               { count: parseInt(missingBoth.rows[0].count),   pct: ((parseInt(missingBoth.rows[0].count)/d)*100).toFixed(1)+'%' },
      },
      recheck_queue: {
        scraped_missing_oem:        { count: parseInt(scrapedMissingOem.rows[0].count),   note: 'Has specs but 0 OEM codes — Show More may have been missed' },
        scraped_missing_equipment:  { count: parseInt(scrapedMissingEquip.rows[0].count), note: 'Has specs but 0 equipment apps — Show More may have been missed' },
        scraped_missing_both:       { count: parseInt(scrapedMissingBoth.rows[0].count),  note: 'Has specs but 0 of either — priority recheck targets' },
        fully_empty:                { count: parseInt(fullyEmpty.rows[0].count),          note: 'No specs, no refs, no equipment — likely obsolete Donaldson products' },
      },
      top_oem_manufacturers:   topMfr.rows,
      top_competitor_brands:   topComp.rows,
    });
  } catch(e) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    client.release();
  }
});


// ─── POST /api/ai/escalate ───────────────────────────────────────────────────
app.post('/api/ai/escalate', searchLimiter, async (req, res) => {
  const { session_id, lang, transcript, turnstileToken } = req.body || {};
  if (!transcript || typeof transcript !== 'string') {
    return res.status(400).json({ error: 'transcript required' });
  }
  if (!await _verifyTurnstile(turnstileToken, req.ip)) {
    return res.status(400).json({ error: 'Captcha verification failed' });
  }
  const safeTranscript = _escHtml(transcript.slice(0, 8000)).replace(/\n/g, '<br>');
  const safeLang = _escHtml(String(lang || 'en').slice(0, 8));
  const safeSession = _escHtml(String(session_id || '—').slice(0, 64));
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtpout.secureserver.net',
      port: 465,
      secure: true,
      auth: { user: 'info@elimfilters.com', pass: process.env.GODADDY_MAIL_PASS },
    });
    await transporter.sendMail({
      from: '"ELIMFILTERS Chat" <info@elimfilters.com>',
      to: 'support@elimfilters.com',
      subject: `[Chat] Consulta técnica — sesión ${safeSession} (${safeLang})`,
      html: `<h2>Chat escalation</h2>
             <p><b>Session:</b> ${safeSession} &nbsp;|&nbsp; <b>Lang:</b> ${safeLang}</p>
             <hr><pre style="background:#f5f5f5;padding:1rem;white-space:pre-wrap">${safeTranscript}</pre>`,
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('[escalate]', err.code || 'SMTP error');
    res.status(500).json({ error: 'mail error' });
  }
});

// ────────────────────────────────────────────────────────────────────────────

// ─── Global error handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[unhandled-error]', err.message);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Startup migration: strip LD-only FRAM codes from HD oem_codes + competitor_codes ──
// FRAM PH/XG/TG/DG codes are light-duty only and must never appear on HD SKUs.
// Cleans both columns since bulk imports mixed LD FRAM codes into oem_codes.
(async () => {
  try {
    const client = await pool.connect();
    const LD_FRAM = /^(PH|XG|TG|DG)\d/i;

    function cleanFram(arr) {
      return (Array.isArray(arr) ? arr : []).filter(c => {
        const mfr = (c.manufacturer || '').toUpperCase().trim();
        const code = (c.code || c.partNumber || '').toUpperCase().trim();
        if ((mfr === 'FRAM' || mfr === '') && LD_FRAM.test(code)) return false;
        return true;
      });
    }

    const rows = await client.query(`
      SELECT sku, oem_codes, competitor_codes
      FROM elimfilters_catalog
      WHERE duty = 'HEAVY_DUTY'
        AND (
          (oem_codes IS NOT NULL AND jsonb_array_length(oem_codes) > 0
           AND EXISTS (SELECT 1 FROM jsonb_array_elements(oem_codes) AS elem
                       WHERE UPPER(elem->>'manufacturer') = 'FRAM'
                       AND (UPPER(elem->>'code') LIKE 'PH%' OR UPPER(elem->>'code') LIKE 'XG%'
                            OR UPPER(elem->>'code') LIKE 'TG%' OR UPPER(elem->>'code') LIKE 'DG%')))
          OR
          (competitor_codes IS NOT NULL AND jsonb_array_length(competitor_codes) > 0
           AND EXISTS (SELECT 1 FROM jsonb_array_elements(competitor_codes) AS elem
                       WHERE (UPPER(elem->>'manufacturer') = 'FRAM' OR elem->>'manufacturer' IS NULL)
                       AND (UPPER(elem->>'code') LIKE 'PH%' OR UPPER(elem->>'code') LIKE 'XG%'
                            OR UPPER(elem->>'code') LIKE 'TG%' OR UPPER(elem->>'code') LIKE 'DG%')))
        )
    `);
    let cleaned = 0;
    for (const row of rows.rows) {
      const origOem = Array.isArray(row.oem_codes) ? row.oem_codes : [];
      const origComp = Array.isArray(row.competitor_codes) ? row.competitor_codes : [];
      const filtered = cleanFram(origOem);
      const filteredComp = cleanFram(origComp);
      if (filtered.length !== origOem.length || filteredComp.length !== origComp.length) {
        await client.query(
          'UPDATE elimfilters_catalog SET oem_codes = $1::jsonb, competitor_codes = $2::jsonb WHERE sku = $3',
          [JSON.stringify(filtered), JSON.stringify(filteredComp), row.sku]
        );
        cleaned++;
      }
    }
    client.release();
    if (cleaned > 0) console.log(`[startup] Cleaned LD FRAM codes from ${cleaned} HD SKUs`);
  } catch (e) {
    console.error('[startup-migration]', e.message);
  }
})();

// ─── GET /api/product/:sku ───────────────────────────────────────────────────
// Public product page endpoint — returns full SKU data + knowledge-system links.
// Used by elimfilters.com/product/[sku] pages and AI citation layer.
const KNOWLEDGE_MAP = {
  air:        { standards: ['air-intake-systems'],   contamination: ['particle-wear'],           technologies: ['macrocore'],            fleet: ['reducing-downtime'] },
  lube:       { standards: ['lube-oil-systems'],     contamination: ['particle-wear'],           technologies: ['syntrax'],              fleet: ['reducing-downtime','total-cost-ownership'] },
  oil:        { standards: ['lube-oil-systems'],     contamination: ['particle-wear'],           technologies: ['syntrax'],              fleet: ['reducing-downtime','total-cost-ownership'] },
  hydraulic:  { standards: ['hydraulic-systems'],    contamination: ['hydraulic-system'],        technologies: ['nanoforce'],            fleet: ['reducing-downtime','total-cost-ownership'] },
  fuel:       { standards: ['fuel-systems'],         contamination: ['diesel-water'],            technologies: ['syntepore','hydrocore'], fleet: ['fuel-efficiency'] },
  cabin:      { standards: ['cabin-safety-systems'], contamination: [],                          technologies: ['microkappa'],           fleet: [] },
  coolant:    { standards: [],                       contamination: [],                          technologies: ['thermacore'],           fleet: ['total-cost-ownership'] },
  turbine:    { standards: ['compressed-air-systems'], contamination: ['particle-wear'],         technologies: ['drycore'],              fleet: ['reducing-downtime'] },
  compressed: { standards: ['compressed-air-systems'], contamination: [],                       technologies: ['drycore'],              fleet: [] },
};

function getKnowledgeLinks(filterType) {
  if (!filterType) return null;
  const ft = filterType.toLowerCase();
  for (const [key, links] of Object.entries(KNOWLEDGE_MAP)) {
    if (ft.includes(key)) {
      const base = 'https://elimfilters.com/knowledge-system';
      return {
        standards:     links.standards.map(s => ({ title: s, url: `${base}/standards/${s}` })),
        contamination: links.contamination.map(c => ({ title: c, url: `${base}/contamination/${c}` })),
        technologies:  links.technologies.map(t => ({ title: t, url: `${base}/technologies/${t}` })),
        fleet:         links.fleet.map(f => ({ title: f, url: `${base}/fleet/${f}` })),
      };
    }
  }
  return null;
}

app.get('/api/product/:sku', searchLimiter, async (req, res) => {
  const sku = req.params.sku.trim().toUpperCase();
  if (!/^[A-Z]{2,3}[0-9]{4,8}[A-Z0-9]?$/.test(sku))
    return res.status(400).json({ success: false, error: 'Invalid SKU format' });

  const lang = detectLang(req);
  const client = await pool.connect();
  try {
    await client.query("SET client_encoding = 'UTF8'");
    const result = await client.query(
      'SELECT * FROM elimfilters_catalog WHERE sku = $1 LIMIT 1', [sku]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, error: 'SKU not found' });

    const row = result.rows[0];
    const product = buildFilterData(row, lang);
    const knowledge_links = getKnowledgeLinks(row.filter_type);

    res.json({
      success: true,
      product: {
        ...product,
        sku,
        duty: row.duty,
        name: row.name || null,
        url: `https://part-search.elimfilters.com/product/${sku}`,
        knowledge_links,
        canonical: {
          concept: `${row.filter_type || 'Filter'} — ${row.duty === 'HEAVY_DUTY' ? 'Heavy Duty' : 'Light Duty'}`,
          source: `https://part-search.elimfilters.com/api/product/${sku}`,
          version: '1.0',
          last_updated: new Date().toISOString().split('T')[0],
        }
      }
    });
  } catch (e) {
    console.error('[api/product]', e.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// ─── Chat API (Claude Haiku) ──────────────────────────────────────────────────
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many chat requests.' },
});

// In-memory session store: sessionId → { count, lastActivity }
const chatSessions = new Map();
const CHAT_MAX_MESSAGES = 5;
const CHAT_SESSION_TTL = 30 * 60 * 1000; // 30 min

// Clean up stale sessions every 10 min
setInterval(() => {
  const now = Date.now();
  for (const [id, s] of chatSessions) {
    if (now - s.lastActivity > CHAT_SESSION_TTL) chatSessions.delete(id);
  }
}, 10 * 60 * 1000);

const CHAT_SYSTEM_PROMPT = `You are the ELIMFILTERS Asset Protection Assistant — a concise technical assistant for industrial filtration questions.

ELIMFILTERS makes contamination control systems for 12 industries: Mining, Agriculture, Marine, Construction, Oil & Gas, Power Generation, Heavy Transport, Forestry, Military, Industrial Equipment, Rail, Stationary Engines.

Core technologies:
- MACROCORE: Air intake filtration (ISO 5011, SAE J726)
- SYNTRAX: Engine lube oil (ISO 16889, ISO 4406)
- NANOFORCE: Hydraulic systems (ISO 16889, NFPA T2.14)
- SYNTEPORE: Fuel/HPCR injectors (ASTM D6304, ISO 12937)
- HYDROCORE: Fuel water separation (ASTM D6304)
- TURBOCORE: 3-stage fuel filtration (ISO 16332)
- THERMACORE: Cooling/SCA additive
- DRYCORE: Compressed air/pneumatic (ISO 8573)
- MICROKAPPA: Cabin air/occupant health (ISO 11155, DIN 71220)
- MARINECLEAN: Marine diesel + hydraulic (IMO certified)
- INTEKCORE: Filter housing systems
- DURATECH: Fleet maintenance master kit

Key knowledge: Contamination causes 70-80% of equipment failures. ISO 4406 codes measure fluid cleanliness. ISO 16889 defines filter Beta ratios. System-level filtration extends equipment life 30-50%.

Part search: part-search.elimfilters.com (20,000+ OEM cross-references)
Knowledge system: elimfilters.com/knowledge-system
Contact: elimfilters.com/contact | support@elimfilters.com

RULES:
- Answer in 2-3 sentences maximum
- Be technical and precise, no marketing language
- Always end with a relevant link when applicable
- Never invent product specs or part numbers`;

app.post('/api/chat', chatLimiter, async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message || typeof message !== 'string' || message.length > 500) {
      return res.status(400).json({ error: 'Invalid message.' });
    }
    if (!sessionId || typeof sessionId !== 'string' || sessionId.length > 64) {
      return res.status(400).json({ error: 'Invalid session.' });
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(503).json({ error: 'Chat unavailable.' });
    }

    // Check session message count
    const session = chatSessions.get(sessionId) || { count: 0, lastActivity: Date.now() };
    if (session.count >= CHAT_MAX_MESSAGES) {
      return res.json({ reply: null, limitReached: true });
    }

    // Call Anthropic API directly (no SDK needed)
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 150,
        system: CHAT_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: message.trim() }],
      }),
    });

    if (!response.ok) {
      console.error('[api/chat] Anthropic error:', response.status);
      return res.status(502).json({ error: 'AI service unavailable.' });
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || 'I could not generate a response. Please contact support@elimfilters.com.';

    // Update session count
    session.count += 1;
    session.lastActivity = Date.now();
    chatSessions.set(sessionId, session);

    res.json({ reply, messagesLeft: CHAT_MAX_MESSAGES - session.count, limitReached: false });
  } catch (e) {
    console.error('[api/chat]', e.message);
    res.status(500).json({ error: 'Internal error.' });
  }
});

const PORT = process.env.PORT || 8080;
console.log(`[server] Starting on PORT=${PORT} (env PORT=${process.env.PORT || 'not set'})`);
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`[server] ✅ Listening on port ${PORT}`);
  console.log(`[server] ✅ ELIMFILTERS API ready`);

  // Ensure search indexes exist — runs once on startup, safe to re-run (CONCURRENTLY + IF NOT EXISTS)
  try {
    const idxClient = await pool.connect();
    await idxClient.query(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_catalog_sku_upper
        ON elimfilters_catalog (UPPER(sku));
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_catalog_codigo_base_upper
        ON elimfilters_catalog (UPPER(codigo_base));
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_catalog_duty
        ON elimfilters_catalog (duty);
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_catalog_oem_codes_gin
        ON elimfilters_catalog USING GIN (oem_codes jsonb_path_ops);
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_catalog_competitor_codes_gin
        ON elimfilters_catalog USING GIN (competitor_codes jsonb_path_ops);
      CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_catalog_brand_crossrefs_gin
        ON elimfilters_catalog USING GIN (brand_crossrefs jsonb_path_ops);
    `);
    idxClient.release();
    console.log('[server] ✅ Search indexes verified');
  } catch (e) {
    console.warn('[server] ⚠️ Index creation skipped:', e.message);
  }
});