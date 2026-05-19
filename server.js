require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

process.on('uncaughtException', (err) => console.error('[uncaughtException]', err.message));
process.on('unhandledRejection', (reason) => console.error('[unhandledRejection]', reason));

const app = express();

// ── Health check — Railway requires this to confirm the app is running ──
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', service: 'world-catalogue', version: '2.0.0' });
});

app.use(cors());

// ── Static files — Next.js pre-built export ──
app.use(express.static(path.join(__dirname, 'frontend/out')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'www')));

// ── Fallback: send index.html for unknown paths ──
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'frontend/out', 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) res.status(404).send('Not found');
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[world-catalogue] Servidor corriendo en puerto ${PORT}`);
  console.log(`[world-catalogue] Sirviendo: frontend/out → public → www`);
  console.log(`[world-catalogue] Health: GET /api/status`);
});
