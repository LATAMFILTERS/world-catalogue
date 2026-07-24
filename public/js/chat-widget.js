/**
 * ELIMFILTERS Omnichannel Live Web Chat Widget
 * High-tech glassmorphism, instant catalog cross-reference lookup & AI assistant.
 */
(function() {
  if (window.ElimfiltersChatWidget) return;
  window.ElimfiltersChatWidget = true;

  const CONFIG = {
    apiEndpoint: "https://elimfilters-instagram-bot.onrender.com/webhook",
    brandName: "ELIMFILTERS AI",
    welcomeMessage: "¡Hola! Soy el asistente técnico oficial de ELIMFILTERS. ¿En qué puedo ayudarte hoy? Puedes darme un número de parte (ej: LF3914, P502042), un VIN o consultar sobre distribución B2B.",
    accentColor: "#10b981"
  };

  // Inject Styles
  const style = document.createElement("style");
  style.textContent = `
    .ef-chat-fab {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
      box-shadow: 0 8px 32px rgba(16, 185, 129, 0.4), 0 0 0 2px rgba(255, 255, 255, 0.2);
      cursor: pointer;
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
    }
    .ef-chat-fab:hover {
      transform: scale(1.08) rotate(5deg);
      box-shadow: 0 12px 40px rgba(16, 185, 129, 0.6), 0 0 0 3px rgba(255, 255, 255, 0.4);
    }
    .ef-chat-fab svg {
      width: 28px;
      height: 28px;
      fill: #ffffff;
      transition: transform 0.3s ease;
    }
    .ef-chat-window {
      position: fixed;
      bottom: 96px;
      right: 24px;
      width: 380px;
      max-width: calc(100vw - 32px);
      height: 540px;
      max-height: calc(100vh - 120px);
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 20px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(16, 185, 129, 0.15);
      z-index: 999999;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
      transform: translateY(20px) scale(0.95);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .ef-chat-window.open {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0) scale(1);
    }
    .ef-chat-header {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.1) 100%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .ef-chat-header-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .ef-chat-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #10b981;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      color: #fff;
      font-size: 14px;
      box-shadow: 0 0 12px rgba(16, 185, 129, 0.5);
    }
    .ef-chat-title {
      font-size: 15px;
      font-weight: 700;
      color: #f8fafc;
      margin: 0;
    }
    .ef-chat-subtitle {
      font-size: 11px;
      color: #10b981;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .ef-chat-subtitle::before {
      content: '';
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 6px #10b981;
    }
    .ef-chat-close {
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      padding: 4px;
      border-radius: 8px;
      transition: color 0.2s, background 0.2s;
    }
    .ef-chat-close:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.1);
    }
    .ef-chat-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .ef-msg {
      max-width: 85%;
      padding: 12px 16px;
      border-radius: 16px;
      font-size: 13.5px;
      line-height: 1.5;
      word-break: break-word;
    }
    .ef-msg-bot {
      background: rgba(30, 41, 59, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #e2e8f0;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
    }
    .ef-msg-user {
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
      color: #ffffff;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
    }
    .ef-chat-input-area {
      padding: 14px 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      gap: 8px;
      background: rgba(15, 23, 42, 0.9);
    }
    .ef-chat-input {
      flex: 1;
      background: rgba(30, 41, 59, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 12px;
      padding: 10px 14px;
      color: #f8fafc;
      font-size: 13.5px;
      outline: none;
      transition: border-color 0.2s;
    }
    .ef-chat-input:focus {
      border-color: #10b981;
    }
    .ef-chat-send {
      background: #10b981;
      border: none;
      border-radius: 12px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #fff;
      transition: background 0.2s, transform 0.1s;
    }
    .ef-chat-send:hover {
      background: #059669;
    }
    .ef-chat-send:active {
      transform: scale(0.95);
    }
  `;
  document.head.appendChild(style);

  // Inject DOM Elements
  const fab = document.createElement("div");
  fab.className = "ef-chat-fab";
  fab.innerHTML = `<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/></svg>`;

  const win = document.createElement("div");
  win.className = "ef-chat-window";
  win.innerHTML = `
    <div class="ef-chat-header">
      <div class="ef-chat-header-info">
        <div class="ef-chat-avatar">E</div>
        <div>
          <h4 class="ef-chat-title">${CONFIG.brandName}</h4>
          <p class="ef-chat-subtitle">En línea • Soporte B2B & Catálogo</p>
        </div>
      </div>
      <button class="ef-chat-close" id="efChatClose">✕</button>
    </div>
    <div class="ef-chat-messages" id="efChatMessages">
      <div class="ef-msg ef-msg-bot">${CONFIG.welcomeMessage}</div>
    </div>
    <div class="ef-chat-input-area">
      <input type="text" class="ef-chat-input" id="efChatInput" placeholder="Escribe tu consulta o código..." />
      <button class="ef-chat-send" id="efChatSend">➤</button>
    </div>
  `;

  document.body.appendChild(fab);
  document.body.appendChild(win);

  // Logic
  const input = document.getElementById("efChatInput");
  const sendBtn = document.getElementById("efChatSend");
  const messagesContainer = document.getElementById("efChatMessages");
  const closeBtn = document.getElementById("efChatClose");

  function toggleChat() {
    win.classList.toggle("open");
    if (win.classList.contains("open")) input.focus();
  }

  fab.addEventListener("click", toggleChat);
  closeBtn.addEventListener("click", toggleChat);

  async function handleSend() {
    const text = input.value.trim();
    if (!text) return;

    // Append User Message
    const userMsg = document.createElement("div");
    userMsg.className = "ef-msg ef-msg-user";
    userMsg.textContent = text;
    messagesContainer.appendChild(userMsg);
    input.value = "";
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Append Typing Indicator
    const typingMsg = document.createElement("div");
    typingMsg.className = "ef-msg ef-msg-bot";
    typingMsg.textContent = "Procesando con ELIMFILTERS AI...";
    messagesContainer.appendChild(typingMsg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
      // Send message to local or remote API endpoint
      const response = await fetch("/api/search?q=" + encodeURIComponent(text));
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const item = data.results[0];
          typingMsg.innerHTML = `<strong>Referencia encontrada:</strong> ${item.sku}<br>
            <strong>Tipo:</strong> ${item.type || 'Filtro Industrial'}<br>
            <a href="/results.html?q=${encodeURIComponent(item.sku)}" style="color:#10b981;font-weight:bold;text-decoration:underline;">Ver Ficha y Equivalencias DURATECH™</a>`;
        } else {
          typingMsg.textContent = "Gracias por tu consulta. He registrado tu mensaje. Para verificar equivalencias exactas de " + text + " o contactar a un distribuidor autorizado en tu país, por favor visita https://part-search.elimfilters.com.";
        }
      } else {
        typingMsg.textContent = "Para cotizaciones corporativas o cruces de número de parte, indícanos tu ciudad y país o busca en https://part-search.elimfilters.com.";
      }
    } catch {
      typingMsg.textContent = "Para cotizaciones corporativas o cruces de número de parte, visita nuestro catálogo oficial en https://part-search.elimfilters.com.";
    }
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  sendBtn.addEventListener("click", handleSend);
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSend();
  });
})();
