const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

// Serve static files from frontend public
app.use(express.static(path.join(__dirname, 'frontend', 'public')));

// Phase 5A Portal - Token validation
const VALID_TOKENS = ['phase5a-victor-2026'];

app.get('/knowledge-system/phase5a-private', (req, res) => {
  const token = req.query.token;

  if (!token || !VALID_TOKENS.includes(token)) {
    return res.status(401).send('Unauthorized - Invalid token');
  }

  // Redirect to localhost for now, or serve portal directly
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Phase 5A - Portal Privado</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js"></script>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #000; color: #fff; font-family: 'Inter', sans-serif; min-height: 100vh; }
        .container { max-width: 860px; margin: 0 auto; padding: 4rem 2rem; }
        h1 { font-size: 2rem; margin-bottom: 1rem; color: #FFF12D; }
        .message { padding: 2rem; background: rgba(255,241,45,0.05); border: 2px solid rgba(255,241,45,0.2); border-radius: 8px; text-align: center; }
        a { color: #FFF12D; text-decoration: none; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔐 Phase 5A Portal - Acceso Privado</h1>
        <div class="message">
          <p style="margin-bottom: 1rem;">✓ Token válido - Acceso autorizado</p>
          <p style="margin-bottom: 2rem;">El portal Phase 5A está disponible en:</p>
          <p><strong>http://localhost:3000/knowledge-system/phase5a-private?token=phase5a-victor-2026</strong></p>
          <p style="margin-top: 2rem; font-size: 0.9rem; color: rgba(255,255,255,0.7);">
            Nota: El portal dinámico requiere un servidor local. Usa la URL de localhost para acceder.
          </p>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.get('/knowledge-system/phase5a-private-status', (req, res) => {
  const token = req.query.token;

  if (!token || !VALID_TOKENS.includes(token)) {
    return res.status(401).send('Unauthorized');
  }

  res.json({
    status: 'integrated',
    data: {
      timestamp: new Date().toISOString(),
      stats: {
        faqsIntegrated: 0,
        validationIssuesFound: 0,
        podcastScriptReceived: false,
        improvementsSuggested: 0
      }
    }
  });
});

app.post('/api/phase5a-submit', (req, res) => {
  res.json({
    success: true,
    message: 'Use localhost for Phase 5A portal'
  });
});

app.get('/api/phase5a-submit', (req, res) => {
  res.json({
    status: 'no-data'
  });
});

app.listen(PORT, () => {
  console.log(`Phase 5A Portal server running on port ${PORT}`);
  console.log(`Access: https://phase5a-portal-server.onrender.com/knowledge-system/phase5a-private?token=phase5a-victor-2026`);
});
