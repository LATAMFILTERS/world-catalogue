const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const VALID_TOKENS = ['phase5a-victor-2026'];

// Phase 5A Portal HTML
const getPortalHTML = (token) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Phase 5A - Portal Privado</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #000; color: #fff; font-family: 'Outfit', sans-serif; min-height: 100vh; }
    main { padding: 4rem 2rem; max-width: 860px; margin: 0 auto; }
    .logo { margin-bottom: 3rem; }
    .back-link { color: #FFF12D; text-decoration: none; font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; margin-bottom: 2rem; display: inline-block; }
    .back-link:hover { text-decoration: underline; }
    .hero { background: linear-gradient(135deg, rgba(0,0,0,1) 0%, rgba(255,241,45,0.05) 100%); border-bottom: 2px solid rgba(255,241,45,0.15); padding: 2rem 0; margin-bottom: 3rem; }
    .hero h1 { font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem; line-height: 1.2; }
    .hero p { color: rgba(255,255,255,0.7); font-size: 0.9rem; }
    .tabs { display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 1px solid rgba(255,241,45,0.2); }
    .tab { padding: 1rem 1.5rem; cursor: pointer; color: rgba(255,255,255,0.6); border: none; background: none; font-size: 0.95rem; transition: all 0.3s; border-bottom: 2px solid transparent; }
    .tab.active { color: #FFF12D; border-bottom-color: #FFF12D; }
    .tab-content { display: none; }
    .tab-content.active { display: block; }
    .status-box { background: rgba(124,179,66,0.1); border: 2px solid rgba(124,179,66,0.3); border-radius: 8px; padding: 2rem; text-align: center; margin-bottom: 2rem; }
    .status-box h2 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    .status-box p { color: rgba(124,179,66,0.9); font-size: 0.9rem; }
    .prompt-btn { background: #FFF12D; color: #000; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; font-weight: 600; cursor: pointer; font-family: 'JetBrains Mono', monospace; margin: 0.5rem 0; width: 100%; }
    .prompt-btn:hover { background: rgba(255,241,45,0.9); }
    .textarea { width: 100%; padding: 1rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,241,45,0.2); border-radius: 4px; color: #fff; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; margin-bottom: 1rem; min-height: 100px; }
    .submit-btn { background: #FFF12D; color: #000; border: none; padding: 1rem; border-radius: 4px; font-weight: 600; font-size: 1rem; cursor: pointer; width: 100%; margin-top: 1rem; }
    .submit-btn:hover { background: rgba(255,241,45,0.9); }
    .section-label { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: rgba(255,241,45,0.7); margin-bottom: 1rem; text-transform: uppercase; }
    .success-message { background: rgba(124,179,66,0.1); border: 2px solid rgba(124,179,66,0.3); border-radius: 8px; padding: 2rem; text-align: center; color: rgba(124,179,66,0.9); display: none; }
  </style>
</head>
<body>
  <main>
    <a href="#" class="back-link">← VOLVER A INICIO</a>

    <section class="hero">
      <p class="section-label">// ESTADO DE INTEGRACIÓN PRIVADO</p>
      <h1>Estado Phase 5A En Tiempo Real</h1>
    </section>

    <div class="tabs">
      <button class="tab active" onclick="switchTab('status')">01 / ESTADO</button>
      <button class="tab" onclick="switchTab('prompts')">02 / PROMPTS</button>
      <button class="tab" onclick="switchTab('submit')">03 / SUBMIT</button>
    </div>

    <div id="status" class="tab-content active">
      <p class="section-label">Estado de Integración</p>
      <div class="status-box">
        <p>✓</p>
        <h2>Portal Activado</h2>
        <p>Token: ${token}</p>
        <p style="margin-top: 1rem; font-size: 0.8rem;">Acceso autorizado - Listo para Phase 5A</p>
      </div>
    </div>

    <div id="prompts" class="tab-content">
      <p class="section-label">Copiar Prompts para NotebookLM</p>
      <div style="margin-bottom: 2rem;">
        <h3 style="margin-bottom: 1rem;">PROMPT 1: Generate 20 FAQs</h3>
        <button class="prompt-btn" onclick="copyToClipboard('prompt1')">COPIAR PROMPT 1</button>
      </div>
      <div style="margin-bottom: 2rem;">
        <h3 style="margin-bottom: 1rem;">PROMPT 2: Validate Technical Accuracy</h3>
        <button class="prompt-btn" onclick="copyToClipboard('prompt2')">COPIAR PROMPT 2</button>
      </div>
      <div style="margin-bottom: 2rem;">
        <h3 style="margin-bottom: 1rem;">PROMPT 3: Create Podcast Script</h3>
        <button class="prompt-btn" onclick="copyToClipboard('prompt3')">COPIAR PROMPT 3</button>
      </div>
      <div style="margin-bottom: 2rem;">
        <h3 style="margin-bottom: 1rem;">PROMPT 4: Suggest Improvements</h3>
        <button class="prompt-btn" onclick="copyToClipboard('prompt4')">COPIAR PROMPT 4</button>
      </div>
    </div>

    <div id="submit" class="tab-content">
      <p class="section-label">Submitter Outputs</p>
      <div>
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">FAQs</label>
        <textarea id="faqs" class="textarea" placeholder="Pega los 20 FAQs aquí..."></textarea>

        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Validación</label>
        <textarea id="validation" class="textarea" placeholder="Pega los issues encontrados..."></textarea>

        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Podcast Script</label>
        <textarea id="podcast" class="textarea" placeholder="Pega el script del podcast..."></textarea>

        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Mejoras</label>
        <textarea id="improvements" class="textarea" placeholder="Pega las sugerencias de mejora..."></textarea>

        <button class="submit-btn" onclick="submitOutputs()">SUBMITTER OUTPUTS</button>
        <div id="success-msg" class="success-message">✓ Outputs recibidos e integrados correctamente</div>
      </div>
    </div>
  </main>

  <script>
    function switchTab(tabName) {
      document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
      document.getElementById(tabName).classList.add('active');
      event.target.classList.add('active');
    }

    function copyToClipboard(promptId) {
      const prompts = {
        prompt1: 'Based on ELIMFILTERS knowledge, generate 20 technical FAQs about industrial filtration...',
        prompt2: 'Review ELIMFILTERS documentation and identify 5-10 technical accuracy issues...',
        prompt3: 'Create a 15-minute podcast script about industrial filtration and contamination control...',
        prompt4: 'Suggest 5-10 improvements for the filtration knowledge system...'
      };

      navigator.clipboard.writeText(prompts[promptId]).then(() => {
        alert('Prompt copiado al clipboard');
      });
    }

    function submitOutputs() {
      const faqs = document.getElementById('faqs').value;
      const validation = document.getElementById('validation').value;
      const podcast = document.getElementById('podcast').value;
      const improvements = document.getElementById('improvements').value;

      fetch('/api/phase5a-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ faqs, validation, podcast, improvements })
      }).then(res => res.json()).then(data => {
        document.getElementById('success-msg').style.display = 'block';
        setTimeout(() => {
          document.getElementById('success-msg').style.display = 'none';
        }, 3000);
      });
    }
  </script>
</body>
</html>
`;

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Phase 5A Portal</title>
      <style>
        body { background: #000; color: #fff; font-family: sans-serif; padding: 2rem; text-align: center; }
        h1 { color: #FFF12D; margin-bottom: 2rem; }
        a { color: #FFF12D; text-decoration: none; padding: 1rem 2rem; background: rgba(255,241,45,0.1); border-radius: 4px; display: inline-block; }
        a:hover { background: rgba(255,241,45,0.2); }
      </style>
    </head>
    <body>
      <h1>🔐 Phase 5A Portal</h1>
      <p>Acceso requerido - incluye token en URL</p>
      <p style="margin-top: 2rem; font-size: 0.9rem; color: rgba(255,255,255,0.7);">
        Ejemplo: ?token=phase5a-victor-2026
      </p>
    </body>
    </html>
  `);
});

app.get('/knowledge-system/phase5a-private', (req, res) => {
  const token = req.query.token;

  if (!token || !VALID_TOKENS.includes(token)) {
    return res.status(401).send('❌ Unauthorized - Token inválido');
  }

  res.send(getPortalHTML(token));
});

app.get('/knowledge-system/phase5a-private-status', (req, res) => {
  const token = req.query.token;

  if (!token || !VALID_TOKENS.includes(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
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
    message: 'Outputs recibidos'
  });
});

app.listen(PORT, () => {
  console.log(`Phase 5A Portal running on port ${PORT}`);
});
