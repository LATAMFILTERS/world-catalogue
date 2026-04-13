const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const chatbot = require('../services/chatbot.service');

/**
 * POST /webhook/whatsapp
 * Twilio WhatsApp sandbox webhook
 * Receives incoming messages, responds via TwiML
 */
router.post('/whatsapp', async (req, res) => {
  try {
    const incomingMessage = req.body.Body;
    const senderNumber = req.body.From;

    console.log(`[WhatsApp] Incoming from ${senderNumber}: ${incomingMessage}`);

    if (!incomingMessage) {
      const twiml = new twilio.twiml.MessagingResponse();
      return res.type('text/xml').send(twiml.toString());
    }

    // Get chatbot response
    const response = await chatbot.chat(incomingMessage, senderNumber);

    // Build reply — chatbot already includes filter info
    let replyText = response.message;

    // Append support contact if not already in message
    if (!replyText.includes('support@elimfilters.com')) {
      replyText += '\n\n📧 support@elimfilters.com';
    }

    console.log(`[WhatsApp] Sending reply to ${senderNumber}`);

    // Reply via TwiML (correct way for Twilio webhooks)
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(replyText);

    res.type('text/xml').send(twiml.toString());
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message('❌ Error procesando consulta. Contacte support@elimfilters.com');
    res.type('text/xml').send(twiml.toString());
  }
});

/**
 * GET /webhook/whatsapp
 * Health check
 */
router.get('/whatsapp', (req, res) => {
  res.json({ status: 'ok', service: 'whatsapp-webhook' });
});

module.exports = router;
