/**
 * ELIMFILTERS Chatbot Widget
 * Embed in website with:
 * <script src="https://elimfilters.com/assets/chatbot-widget.js"></script>
 */

class ElimfiltersChatbot {
  constructor(config = {}) {
    this.apiUrl = config.apiUrl || 'https://elimfilters-api.railway.app';
    this.position = config.position || 'bottom-right';
    this.language = config.language || 'es';
    this.init();
  }

  init() {
    this.createWidget();
    this.attachEventListeners();
  }

  createWidget() {
    // Create container
    const container = document.createElement('div');
    container.id = 'elimfilters-chatbot-container';
    container.style.cssText = `
      position: fixed;
      ${this.position === 'bottom-right' ? 'bottom: 20px; right: 20px;' : 'bottom: 20px; left: 20px;'}
      width: 380px;
      max-height: 600px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      z-index: 9999;
      display: none;
      flex-direction: column;
      animation: slideUp 0.3s ease-out;
    `;

    // CSS animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      #elimfilters-chatbot-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .chatbot-message {
        padding: 10px 14px;
        border-radius: 8px;
        max-width: 80%;
        word-wrap: break-word;
        font-size: 14px;
        line-height: 1.4;
      }
      .chatbot-message.user {
        align-self: flex-end;
        background: #0066cc;
        color: white;
      }
      .chatbot-message.bot {
        align-self: flex-start;
        background: #f0f0f0;
        color: #333;
      }
      .chatbot-message.error {
        align-self: flex-start;
        background: #fee;
        color: #c33;
      }
      #elimfilters-chatbot-input-area {
        display: flex;
        gap: 8px;
        padding: 12px;
        border-top: 1px solid #e0e0e0;
      }
      #elimfilters-chatbot-input {
        flex: 1;
        padding: 10px 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
      }
      #elimfilters-chatbot-input:focus {
        outline: none;
        border-color: #0066cc;
      }
      #elimfilters-chatbot-send {
        padding: 10px 16px;
        background: #0066cc;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
      }
      #elimfilters-chatbot-send:hover {
        background: #0052a3;
      }
      #elimfilters-chatbot-toggle {
        position: fixed;
        ${this.position === 'bottom-right' ? 'bottom: 20px; right: 20px;' : 'bottom: 20px; left: 20px;'}
        width: 56px;
        height: 56px;
        background: #0066cc;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        color: white;
        font-size: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        z-index: 9998;
        transition: transform 0.2s;
      }
      #elimfilters-chatbot-toggle:hover {
        transform: scale(1.1);
      }
    `;
    document.head.appendChild(style);

    // HTML structure
    container.innerHTML = `
      <div style="padding: 16px; border-bottom: 1px solid #e0e0e0; display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0; font-size: 16px; color: #0066cc;">ELIMFILTERS Support</h3>
        <button id="elimfilters-chatbot-close" style="background: none; border: none; font-size: 20px; cursor: pointer;">×</button>
      </div>
      <div id="elimfilters-chatbot-messages"></div>
      <div id="elimfilters-chatbot-input-area">
        <input id="elimfilters-chatbot-input" type="text" placeholder="Ask about filters..." />
        <button id="elimfilters-chatbot-send">Send</button>
      </div>
    `;

    document.body.appendChild(container);

    // Toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'elimfilters-chatbot-toggle';
    toggleBtn.innerHTML = '💬';
    document.body.appendChild(toggleBtn);

    this.container = container;
    this.toggleBtn = toggleBtn;
    this.messagesDiv = container.querySelector('#elimfilters-chatbot-messages');
    this.inputField = container.querySelector('#elimfilters-chatbot-input');
    this.sendBtn = container.querySelector('#elimfilters-chatbot-send');
  }

  attachEventListeners() {
    this.toggleBtn.addEventListener('click', () => this.toggle());
    this.container.querySelector('#elimfilters-chatbot-close').addEventListener('click', () => this.close());
    this.sendBtn.addEventListener('click', () => this.sendMessage());
    this.inputField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
  }

  toggle() {
    if (this.container.style.display === 'flex') {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.container.style.display = 'flex';
    this.inputField.focus();
  }

  close() {
    this.container.style.display = 'none';
  }

  async sendMessage() {
    const message = this.inputField.value.trim();
    if (!message) return;

    // Display user message
    this.addMessage(message, 'user');
    this.inputField.value = '';

    // Show loading indicator
    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'chatbot-message bot';
    loadingMsg.textContent = 'Typing...';
    this.messagesDiv.appendChild(loadingMsg);
    this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight;

    try {
      // Send to API
      const response = await fetch(`${this.apiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          language: this.language
        })
      });

      if (!response.ok) throw new Error('API error');

      const data = await response.json();

      // Remove loading message
      loadingMsg.remove();

      // Add bot response
      this.addMessage(data.message, 'bot');
    } catch (error) {
      loadingMsg.remove();
      this.addMessage('Error communicating with server. Try again later.', 'error');
    }
  }

  addMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = `chatbot-message ${sender}`;
    msg.textContent = text;
    this.messagesDiv.appendChild(msg);
    this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight;
  }
}

// Auto-initialize if data attribute is present
document.addEventListener('DOMContentLoaded', () => {
  if (document.currentScript && document.currentScript.dataset.autoInit !== 'false') {
    window.elimfiltersChatbot = new ElimfiltersChatbot({
      language: document.currentScript.dataset.language || 'es'
    });
  }
});
