require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const https = require('https');

const app = express();

app.disable('x-powered-by');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet({ contentSecurityPolicy: false }));

const allowedOrigins = [
    'https://elimfilters.com',
    'https://www.elimfilters.com',
    'https://part-search.elimfilters.com',
    'http://localhost:3000',
    'http://localhost:8080'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(null, false);
    },
    methods: ['GET'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use('/api/', limiter);

if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL missing');
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 8000
});

pool.on('error', (err) => console.error('DB Pool Error:', err.message));

// ── Column selection — maps elimfilters_catalog columns to frontend field names
const SELECT_FIELDS = `
    sku,
    codigo_base AS base_code,
    CASE WHEN jsonb_typeof(description) = 'object'
         THEN COALESCE(description->>'en', description->>'es')
         ELSE description::text
    END AS description,
    CASE WHEN jsonb_typeof(filter_type) = 'object'
         THEN COALESCE(filter_type->>'en', filter_type->>'es')
         ELSE filter_type::text
    END AS category,
    sub_type AS type,
    technology,
    installation_type AS style,
    outer_diameter_mm AS outer_diameter,
    gasket_id_mm AS inner_diameter,
    height_mm AS length,
    nominal_efficiency AS efficiency,
    micron_rating,
    oem_codes,
    competitor_codes,
    equipment_applications AS applications
`;

function normalizeCodes(val) {
    if (!val || !Array.isArray(val)) return [];
    return val.map(item => {
        if (typeof item === 'string') return item;
        if (typeof item === 'object') return item.code || item.partNumber || item.sku || '';
        return String(item);
    }).filter(Boolean);
}

function normalizeRow(row) {
    return {
        ...row,
        oem_codes: normalizeCodes(row.oem_codes),
        competitor_codes: normalizeCodes(row.competitor_codes),
        cross_references: normalizeCodes(row.competitor_codes),
        applications: Array.isArray(row.applications)
            ? row.applications.filter(Boolean)
            : (row.applications ? String(row.applications).split(',').map(s => s.trim()) : [])
    };
}

// ── HEALTH ────────────────────────────────────────────────────────────────────
app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.status(200).json({ status: 'ok', db: 'connected', time: new Date().toISOString() });
    } catch (err) {
        res.status(503).json({ status: 'degraded', db: 'disconnected', time: new Date().toISOString() });
    }
});

// ── SEARCH — part number / OEM / cross-reference ──────────────────────────────
app.get('/api/search', async (req, res) => {
    try {
        const q = (req.query.q || '').toString().trim().toUpperCase();
        if (q.length < 2) return res.status(400).json({ error: 'min 2 chars' });

        const result = await pool.query(
            `SELECT ${SELECT_FIELDS}
             FROM elimfilters_catalog
             WHERE UPPER(sku) LIKE $1
                OR UPPER(codigo_base) LIKE $1
                OR UPPER(sku) ILIKE $2
                OR UPPER(codigo_base) ILIKE $2
                OR oem_codes::text ILIKE $2
                OR competitor_codes::text ILIKE $2
             ORDER BY
                CASE WHEN UPPER(sku) = $3 THEN 0
                     WHEN UPPER(sku) LIKE $1 THEN 1
                     WHEN UPPER(codigo_base) LIKE $1 THEN 2
                     ELSE 3 END
             LIMIT 20`,
            [q + '%', '%' + q + '%', q]
        );

        return res.json({ products: result.rows.map(normalizeRow), count: result.rows.length });
    } catch (err) {
        console.error('SEARCH ERROR:', err.message);
        return res.status(500).json({ error: 'server error' });
    }
});

// ── FILTER BY SKU ─────────────────────────────────────────────────────────────
app.get('/api/filter/:sku', async (req, res) => {
    try {
        const sku = (req.params.sku || '').toString().trim().toUpperCase();
        if (!sku) return res.status(400).json({ error: 'invalid sku' });

        const result = await pool.query(
            `SELECT ${SELECT_FIELDS} FROM elimfilters_catalog WHERE UPPER(sku) = $1 LIMIT 1`,
            [sku]
        );

        if (!result.rows.length) return res.status(404).json({ error: 'not found' });
        return res.json(normalizeRow(result.rows[0]));
    } catch (err) {
        console.error('FILTER ERROR:', err.message);
        return res.status(500).json({ error: 'server error' });
    }
});

// ── SEARCH BY APPLICATION / EQUIPMENT ────────────────────────────────────────
app.get('/api/search-by-application', async (req, res) => {
    try {
        const q = (req.query.q || '').toString().trim();
        if (q.length < 2) return res.status(400).json({ error: 'min 2 chars' });

        const result = await pool.query(
            `SELECT ${SELECT_FIELDS}
             FROM elimfilters_catalog
             WHERE equipment_applications::text ILIKE $1
                OR (
                    CASE WHEN jsonb_typeof(description) = 'object'
                         THEN COALESCE(description->>'en', description->>'es')
                         ELSE description::text
                    END
                ) ILIKE $1
             ORDER BY sku LIMIT 20`,
            ['%' + q + '%']
        );

        return res.json({ products: result.rows.map(normalizeRow), count: result.rows.length });
    } catch (err) {
        console.error('APPLICATION SEARCH ERROR:', err.message);
        return res.status(500).json({ error: 'server error' });
    }
});

// ── VIN SEARCH ────────────────────────────────────────────────────────────────
app.get('/api/search/vin', async (req, res) => {
    try {
        const vin = (req.query.vin || '').toString().trim().toUpperCase();
        if (!vin || vin.length < 3) return res.status(400).json({ error: 'invalid vin' });

        let searchModel = vin;
        let decoded = null;

        // 17-char VIN → decode via NHTSA
        if (/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
            decoded = await decodeVIN(vin);
            if (decoded && decoded.model) searchModel = decoded.model;
        }

        const result = await pool.query(
            `SELECT ${SELECT_FIELDS}
             FROM elimfilters_catalog
             WHERE equipment_applications::text ILIKE $1
             ORDER BY sku LIMIT 20`,
            ['%' + searchModel + '%']
        );

        return res.json({
            products: result.rows.map(normalizeRow),
            count: result.rows.length,
            decoded
        });
    } catch (err) {
        console.error('VIN SEARCH ERROR:', err.message);
        return res.status(500).json({ error: 'server error' });
    }
});

function decodeVIN(vin) {
    return new Promise((resolve) => {
        const req = https.get(
            `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`,
            (resp) => {
                let data = '';
                resp.on('data', chunk => data += chunk);
                resp.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        const get = (v) => (json.Results || []).find(r => r.Variable === v)?.Value || '';
                        const make = get('Make'), model = get('Model'), year = get('Model Year');
                        resolve(make || model ? { make, model, year } : null);
                    } catch { resolve(null); }
                });
            }
        );
        req.on('error', () => resolve(null));
        req.setTimeout(4000, () => { req.destroy(); resolve(null); });
    });
}

// ── CROSS REFERENCE ───────────────────────────────────────────────────────────
app.get('/api/cross-reference/:code', async (req, res) => {
    try {
        const code = (req.params.code || '').toString().trim().toUpperCase();
        if (code.length < 2) return res.status(400).json({ error: 'invalid code' });

        const result = await pool.query(
            `SELECT ${SELECT_FIELDS}
             FROM elimfilters_catalog
             WHERE competitor_codes::text ILIKE $1 OR oem_codes::text ILIKE $1
             LIMIT 20`,
            ['%' + code + '%']
        );

        return res.json({ results: result.rows.map(normalizeRow), count: result.rows.length });
    } catch (err) {
        console.error('CROSS REF ERROR:', err.message);
        return res.status(500).json({ error: 'server error' });
    }
});

// ── STATS ─────────────────────────────────────────────────────────────────────
app.get('/api/stats', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT COUNT(*) AS total, COUNT(DISTINCT technology) AS technologies
             FROM elimfilters_catalog`
        );
        return res.json({
            total: parseInt(result.rows[0].total) || 0,
            technologies: parseInt(result.rows[0].technologies) || 0,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error('STATS ERROR:', err.message);
        return res.status(500).json({ error: 'server error' });
    }
});

// ── STATIC + ROOT ─────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

process.on('uncaughtException', (err) => console.error('UNCAUGHT:', err));
process.on('unhandledRejection', (err) => console.error('UNHANDLED:', err));

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => console.log(`ELIMFILTERS Search API running on ${PORT}`));
