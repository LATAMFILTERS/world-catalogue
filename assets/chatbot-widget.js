/**
 * ELIMFILTERS Chatbot Widget v2.0
 * Dark industrial design with gold accents
 * Embed: <script src="/assets/chatbot-widget.js" data-api="https://your-server.com"></script>
 */

(function () {
  const API_URL = (document.currentScript && document.currentScript.dataset.api)
    || 'https://world-catalogue-production.up.railway.app';

  // ─── STYLES ──────────────────────────────────────────────────────────────
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=JetBrains+Mono:wght@700&display=swap');

    #ef-chat-root * { box-sizing: border-box; margin: 0; padding: 0; }

    /* Toggle Button */
    #ef-chat-toggle {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 60px;
      height: 60px;
      background: #e8c94a;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      z-index: 9998;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(232,201,74,0.4), 0 0 0 0 rgba(232,201,74,0.4);
      transition: transform 250ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 250ms ease;
      animation: ef-pulse 3s ease-in-out infinite;
    }
    #ef-chat-toggle:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 28px rgba(232,201,74,0.6), 0 0 0 8px rgba(232,201,74,0.1);
    }
    #ef-chat-toggle svg { transition: transform 300ms cubic-bezier(0.34,1.56,0.64,1); }
    #ef-chat-toggle.open svg { transform: rotate(45deg); }

    @keyframes ef-pulse {
      0%, 100% { box-shadow: 0 4px 20px rgba(232,201,74,0.4), 0 0 0 0 rgba(232,201,74,0.3); }
      50% { box-shadow: 0 4px 20px rgba(232,201,74,0.4), 0 0 0 10px rgba(232,201,74,0); }
    }

    /* Notification badge */
    #ef-chat-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      width: 18px;
      height: 18px;
      background: #ef4444;
      border-radius: 50%;
      border: 2px solid #080808;
      font-size: 10px;
      font-weight: 700;
      color: white;
      font-family: Inter, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transform: scale(0);
      transition: all 300ms cubic-bezier(0.34,1.56,0.64,1);
    }
    #ef-chat-badge.visible {
      opacity: 1;
      transform: scale(1);
    }

    /* Panel */
    #ef-chat-panel {
      position: fixed;
      bottom: 96px;
      right: 24px;
      width: 380px;
      height: 560px;
      background: #0d0d0d;
      border: 1px solid #222;
      border-radius: 16px;
      box-shadow: 0 24px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(232,201,74,0.05);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      z-index: 9999;
      font-family: 'Inter', sans-serif;
      opacity: 0;
      transform: translateY(16px) scale(0.97);
      pointer-events: none;
      transition: opacity 350ms cubic-bezier(0.4,0,0.2,1),
                  transform 350ms cubic-bezier(0.34,1.56,0.64,1);
    }
    #ef-chat-panel.visible {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: all;
    }

    /* Panel Header */
    .ef-panel-header {
      padding: 16px 20px;
      background: #111;
      border-bottom: 1px solid #1a1a1a;
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }
    .ef-header-icon {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #e8c94a, #b89a30);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .ef-header-info { flex: 1; }
    .ef-header-name {
      font-size: 14px;
      font-weight: 700;
      color: #fff;
      letter-spacing: 0.3px;
    }
    .ef-header-status {
      display: flex;
      align-items: center;
      gap: 5px;
      margin-top: 2px;
    }
    .ef-status-dot {
      width: 6px;
      height: 6px;
      background: #22c55e;
      border-radius: 50%;
      animation: ef-blink 2s ease-in-out infinite;
    }
    @keyframes ef-blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    .ef-status-text {
      font-size: 11px;
      color: #888;
    }
    .ef-close-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: #555;
      padding: 4px;
      border-radius: 6px;
      transition: color 200ms, background 200ms;
      display: flex;
    }
    .ef-close-btn:hover { color: #fff; background: #1a1a1a; }

    /* Messages */
    #ef-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      scrollbar-width: thin;
      scrollbar-color: #222 transparent;
    }
    #ef-chat-messages::-webkit-scrollbar { width: 4px; }
    #ef-chat-messages::-webkit-scrollbar-track { background: transparent; }
    #ef-chat-messages::-webkit-scrollbar-thumb { background: #222; border-radius: 4px; }

    /* Message bubbles */
    .ef-msg {
      display: flex;
      flex-direction: column;
      max-width: 85%;
      opacity: 0;
      transform: translateY(8px);
      animation: ef-msg-in 250ms cubic-bezier(0.4,0,0.2,1) forwards;
    }
    @keyframes ef-msg-in {
      to { opacity: 1; transform: translateY(0); }
    }
    .ef-msg.user { align-self: flex-end; align-items: flex-end; }
    .ef-msg.bot  { align-self: flex-start; align-items: flex-start; }

    .ef-bubble {
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 13.5px;
      line-height: 1.5;
      word-break: break-word;
    }
    .ef-msg.user .ef-bubble {
      background: linear-gradient(135deg, #e8c94a, #d4b53a);
      color: #000;
      font-weight: 500;
      border-bottom-right-radius: 4px;
    }
    .ef-msg.bot .ef-bubble {
      background: #141414;
      color: #ddd;
      border: 1px solid #1e1e1e;
      border-bottom-left-radius: 4px;
    }
    .ef-msg-time {
      font-size: 10px;
      color: #444;
      margin-top: 4px;
      padding: 0 2px;
    }

    /* Filter result card inside message */
    .ef-filter-card {
      background: #0d0d0d;
      border: 1px solid #2a2a2a;
      border-left: 3px solid #e8c94a;
      border-radius: 8px;
      padding: 10px 12px;
      margin-top: 8px;
      font-size: 12px;
    }
    .ef-filter-sku {
      font-family: 'JetBrains Mono', monospace;
      font-size: 16px;
      font-weight: 700;
      color: #e8c94a;
      letter-spacing: 1px;
    }
    .ef-filter-meta {
      display: flex;
      gap: 6px;
      margin-top: 6px;
      flex-wrap: wrap;
    }
    .ef-tag {
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .ef-tag-type { background: rgba(232,201,74,0.12); color: #e8c94a; }
    .ef-tag-hd   { background: rgba(34,197,94,0.12); color: #22c55e; }
    .ef-tag-ld   { background: rgba(59,130,246,0.12); color: #3b82f6; }
    .ef-tag-marine { background: rgba(6,182,212,0.12); color: #06b6d4; }

    /* Typing indicator */
    .ef-typing {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 10px 14px;
      background: #141414;
      border: 1px solid #1e1e1e;
      border-radius: 12px;
      border-bottom-left-radius: 4px;
      width: fit-content;
    }
    .ef-dot {
      width: 6px;
      height: 6px;
      background: #555;
      border-radius: 50%;
      animation: ef-typing-dot 1.2s ease-in-out infinite;
    }
    .ef-dot:nth-child(2) { animation-delay: 0.2s; }
    .ef-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes ef-typing-dot {
      0%, 60%, 100% { transform: translateY(0); background: #555; }
      30% { transform: translateY(-6px); background: #e8c94a; }
    }

    /* Quick replies */
    .ef-quick-replies {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 8px 16px 4px;
    }
    .ef-quick-btn {
      background: transparent;
      border: 1px solid #2a2a2a;
      border-radius: 20px;
      padding: 5px 12px;
      font-size: 12px;
      color: #888;
      cursor: pointer;
      font-family: Inter, sans-serif;
      transition: all 200ms;
      white-space: nowrap;
    }
    .ef-quick-btn:hover {
      border-color: #e8c94a;
      color: #e8c94a;
      background: rgba(232,201,74,0.05);
    }

    /* Input area */
    .ef-input-area {
      padding: 12px 16px;
      background: #0d0d0d;
      border-top: 1px solid #1a1a1a;
      display: flex;
      gap: 10px;
      align-items: flex-end;
      flex-shrink: 0;
    }
    #ef-chat-input {
      flex: 1;
      background: #141414;
      border: 1px solid #222;
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 13px;
      color: #fff;
      font-family: Inter, sans-serif;
      resize: none;
      min-height: 40px;
      max-height: 100px;
      line-height: 1.4;
      transition: border-color 200ms, box-shadow 200ms;
      outline: none;
    }
    #ef-chat-input:focus {
      border-color: #e8c94a;
      box-shadow: 0 0 0 3px rgba(232,201,74,0.08);
    }
    #ef-chat-input::placeholder { color: #444; }
    #ef-chat-send {
      width: 40px;
      height: 40px;
      background: #e8c94a;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: background 200ms, transform 150ms cubic-bezier(0.34,1.56,0.64,1);
    }
    #ef-chat-send:hover { background: #f0d060; transform: scale(1.08); }
    #ef-chat-send:active { transform: scale(0.95); }
    #ef-chat-send:disabled { background: #2a2a2a; cursor: not-allowed; transform: none; }
    #ef-chat-send svg { color: #000; }

    /* Powered by */
    .ef-footer {
      text-align: center;
      padding: 6px;
      font-size: 10px;
      color: #333;
      letter-spacing: 0.5px;
      flex-shrink: 0;
    }

    /* Mobile */
    @media (max-width: 480px) {
      #ef-chat-panel { width: calc(100vw - 16px); right: 8px; bottom: 80px; height: 70vh; }
    }
  `;

  // ─── HTML ─────────────────────────────────────────────────────────────────
  const QUICK_REPLIES = [
    '¿Cómo buscar un filtro?',
    'Cross-reference',
    'Especificaciones técnicas',
    'Contactar soporte'
  ];

  function createWidget() {
    const root = document.createElement('div');
    root.id = 'ef-chat-root';
    root.innerHTML = `
      <style>${css}</style>
      <button id="ef-chat-toggle" aria-label="Abrir soporte ELIMFILTERS">
        <span id="ef-chat-badge">1</span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </button>
      <div id="ef-chat-panel" role="dialog" aria-label="ELIMFILTERS Support">
        <div class="ef-panel-header">
          <div class="ef-header-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
            </svg>
          </div>
          <div class="ef-header-info">
            <div class="ef-header-name">ELIMFILTERS Support</div>
            <div class="ef-header-status">
              <div class="ef-status-dot"></div>
              <span class="ef-status-text">Activo · responde al instante</span>
            </div>
          </div>
          <button class="ef-close-btn" id="ef-chat-close" aria-label="Cerrar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div id="ef-chat-messages"></div>
        <div class="ef-quick-replies">
          ${QUICK_REPLIES.map(q => `<button class="ef-quick-btn">${q}</button>`).join('')}
        </div>
        <div class="ef-input-area">
          <textarea id="ef-chat-input" placeholder="Escribe un código de filtro o consulta..." rows="1"></textarea>
          <button id="ef-chat-send" aria-label="Enviar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        <div class="ef-footer">ELIMFILTERS · Powered by AI</div>
      </div>
    `;
    document.body.appendChild(root);
  }

  // ─── LOGIC ────────────────────────────────────────────────────────────────
  let isOpen = false;
  let isLoading = false;

  function formatTime() {
    return new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  }

  function getDutyTagClass(duty) {
    if (!duty) return 'ef-tag-type';
    const d = duty.toUpperCase();
    if (d.includes('HEAVY')) return 'ef-tag-hd';
    if (d.includes('LIGHT')) return 'ef-tag-ld';
    if (d.includes('MARINE')) return 'ef-tag-marine';
    return 'ef-tag-type';
  }

  function addMessage(text, sender, filters) {
    const msgs = document.getElementById('ef-chat-messages');
    const msg = document.createElement('div');
    msg.className = `ef-msg ${sender}`;

    let filterHTML = '';
    if (filters && filters.length > 0) {
      filterHTML = filters.slice(0, 2).map(f => `
        <div class="ef-filter-card">
          <div class="ef-filter-sku">${f.sku || f.elimfilters_sku}</div>
          <div class="ef-filter-meta">
            ${f.filter_type ? `<span class="ef-tag ef-tag-type">${f.filter_type}</span>` : ''}
            ${f.duty ? `<span class="ef-tag ${getDutyTagClass(f.duty)}">${f.duty}</span>` : ''}
          </div>
        </div>
      `).join('');
    }

    msg.innerHTML = `
      <div class="ef-bubble">${text.replace(/\n/g, '<br>')}${filterHTML}</div>
      <span class="ef-msg-time">${formatTime()}</span>
    `;
    msgs.appendChild(msg);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function showTyping() {
    const msgs = document.getElementById('ef-chat-messages');
    const typing = document.createElement('div');
    typing.id = 'ef-typing-indicator';
    typing.className = 'ef-msg bot';
    typing.innerHTML = `
      <div class="ef-typing">
        <div class="ef-dot"></div>
        <div class="ef-dot"></div>
        <div class="ef-dot"></div>
      </div>
    `;
    msgs.appendChild(typing);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function hideTyping() {
    const t = document.getElementById('ef-typing-indicator');
    if (t) t.remove();
  }

  async function sendMessage(text) {
    if (!text || isLoading) return;
    isLoading = true;

    const input = document.getElementById('ef-chat-input');
    const sendBtn = document.getElementById('ef-chat-send');
    input.value = '';
    input.style.height = 'auto';
    sendBtn.disabled = true;

    addMessage(text, 'user');
    showTyping();

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      hideTyping();
      addMessage(data.message, 'bot', data.filters);
    } catch {
      hideTyping();
      addMessage('❌ Error de conexión. Intente nuevamente.', 'bot');
    } finally {
      isLoading = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  function togglePanel() {
    isOpen = !isOpen;
    const panel = document.getElementById('ef-chat-panel');
    const toggle = document.getElementById('ef-chat-toggle');
    const badge = document.getElementById('ef-chat-badge');

    panel.classList.toggle('visible', isOpen);
    toggle.classList.toggle('open', isOpen);
    badge.classList.remove('visible');

    if (isOpen && document.getElementById('ef-chat-messages').children.length === 0) {
      setTimeout(() => {
        addMessage('¡Hola! Soy el asistente técnico de ELIMFILTERS 🔧\n\nPuede preguntarme por:\n• Equivalencias de filtros (ej: P552100)\n• Especificaciones técnicas\n• Códigos OEM y cross-references', 'bot');
      }, 300);
    }

    if (isOpen) document.getElementById('ef-chat-input').focus();
  }

  function init() {
    createWidget();

    // Show badge after 3s
    setTimeout(() => {
      document.getElementById('ef-chat-badge').classList.add('visible');
    }, 3000);

    document.getElementById('ef-chat-toggle').addEventListener('click', togglePanel);
    document.getElementById('ef-chat-close').addEventListener('click', togglePanel);

    // Send button
    document.getElementById('ef-chat-send').addEventListener('click', () => {
      sendMessage(document.getElementById('ef-chat-input').value.trim());
    });

    // Enter key
    document.getElementById('ef-chat-input').addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(e.target.value.trim());
      }
    });

    // Auto-resize textarea
    document.getElementById('ef-chat-input').addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 100) + 'px';
    });

    // Quick replies
    document.querySelectorAll('.ef-quick-btn').forEach(btn => {
      btn.addEventListener('click', () => sendMessage(btn.textContent));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
