const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.static(__dirname));

const pool = new Pool({
    connectionString: "postgresql://postgres:qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm@ballast.proxy.rlwy.net:18263/railway",
    ssl: { rejectUnauthorized: false }
});

// Esta es la ruta exacta que dispara tu barra de búsqueda
app.get('/api/filters/search/part', async (req, res) => {
    const code = (req.query.code || '').toUpperCase();
    try {
        const result = await pool.query(
            "SELECT * FROM elimfilters_catalog WHERE UPPER(sku) =  OR  = ANY(oem_codes) OR  = ANY(cross_references) LIMIT 1",
            [code]
        );
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'No encontrado' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.use((req, res) => res.sendFile(path.join(__dirname, 'index.html')));

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => console.log('?? NODE_SERVER_ACTIVE_ON_PORT_' + PORT));
