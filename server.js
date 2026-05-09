require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// -------------------- SECURITY --------------------
app.use(helmet({ contentSecurityPolicy: false }));

const allowedOrigins = [
    'https://elimfilters.com',
    'https://www.elimfilters.com',
    'https://world-catalogue-production.up.railway.app',
    'http://localhost:3000',
    'http://localhost:8080'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            return callback(null, false); // no rompe el server
        }
    },
    methods: ['GET'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// -------------------- RATE LIMIT --------------------
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Demasiadas solicitudes. Intenta en 15 minutos.' }
});
app.use('/api/', limiter);

app.use(express.json());

// -------------------- DATABASE CHECK --------------------
if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL no definida');
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
});

pool.on('error', (err) => {
    console.error('❌ Error PostgreSQL pool:', err.message);
});

// -------------------- SAFE SELECT --------------------
const SAFE_FIELDS = `
sku, base_code, technology, category, description,
media_type, outer_diameter, inner_diameter, length,
efficiency, type, style, competitor_codes, oem_codes,
cross_references, applications
`;

// -------------------- HEALTH --------------------
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// -------------------- SEARCH --------------------
app.get('/api/search', async (req, res) => {
    const q = (req.query.q || '').toUpperCase().trim();

    if (!q || q.length < 2) {
        return res.status(400).json({ error: 'Minimo 2 caracteres' });
    }
    if (q.length > 50) {
        return res.status(400).json({ error: 'Busqueda demasiado larga' });
    }

    try {
        const result = await pool.query(
            `SELECT ${SAFE_FIELDS}
             FROM filters
             WHERE UPPER(sku) LIKE $1
                OR UPPER(base_code) LIKE $1
                OR competitor_codes::text ILIKE $2
             ORDER BY sku
             LIMIT 20`,
            [q + '%', '%' + q + '%']
        );

        res.json({ results: result.rows, count: result.rows.length });

    } catch (err) {
        console.error('❌ /api/search:', err.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// -------------------- FILTER BY SKU --------------------
app.get('/api/filter/:sku', async (req, res) => {
    const sku = (req.params.sku || '').toUpperCase().trim();

    if (!sku || sku.length > 20) {
        return res.status(400).json({ error: 'SKU invalido' });
    }

    try {
        const result = await pool.query(
            `SELECT ${SAFE_FIELDS}
             FROM filters
             WHERE UPPER(sku) = $1
             LIMIT 1`,
            [sku]
        );

        if (!result.rows.length) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json(result.rows[0]);

    } catch (err) {
        console.error('❌ /api/filter:', err.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// -------------------- CROSS REF --------------------
app.get('/api/cross-reference/:code', async (req, res) => {
    const code = (req.params.code || '').toUpperCase().trim();

    if (!code || code.length < 3 || code.length > 30) {
        return res.status(400).json({ error: 'Codigo invalido' });
    }

    try {
        const result = await pool.query(
            `SELECT ${SAFE_FIELDS}
             FROM filters
             WHERE competitor_codes::text ILIKE $1
                OR oem_codes::text ILIKE $1
             LIMIT 10`,
            ['%' + code + '%']
        );

        res.json({ results: result.rows, count: result.rows.length });

    } catch (err) {
        console.error('❌ cross-reference:', err.message);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// -------------------- STATIC --------------------
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// -------------------- START SERVER (FIX RAILWAY) --------------------
const PORT = process.env.PORT || 8080;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ELIMFILTERS API corriendo en puerto ${PORT}`);
    console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
