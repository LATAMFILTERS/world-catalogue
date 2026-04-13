const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const chatbot = require('../services/chatbot.service');

// Twilio credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_WHATSAPP_FROM;

let twilioClient = null;

// Initialize Twilio client if credentials exist
if (accountSid && authToken) {
  twilioClient = twilio(accountSid, authToken);
}

/**
 * POST /webhook/whatsapp
 * Twilio WhatsApp sandbox webhook
 * Receives incoming messages and sends responses
 */
router.post('/whatsapp', async (req, res) => {
  try {
    const incomingMessage = req.body.Body;
    const senderNumber = req.body.From;
    const messageId = req.body.MessageSid;

    console.log(`[WhatsApp] Incoming from ${senderNumber}: ${incomingMessage}`);

    if (!incomingMessage) {
      return res.status(400).send('No message body');
    }

    // Get chatbot response
    const response = await chatbot.chat(incomingMessage, senderNumber);

    // Prepare reply message
    let replyText = response.message;

    // Add filter info if found
    if (response.filters && response.filters.length > 0) {
      replyText += '\n\n📦 Filtros encontrados:';
      response.filters.slice(0, 2).forEach(f => {
        replyText += `\n• SKU: ${f.sku} (${f.filter_type}, ${f.duty})`;
      });
      if (response.filters.length > 2) {
        replyText += `\n• +${response.filters.length - 2} más`;
      }
    }

    // Add support link
    replyText += '\n\n📧 Más info: support@elimfilters.com';

    // Send via Twilio (if configured)
    if (twilioClient) {
      try {
        await twilioClient.messages.create({
          body: replyText,
          from: fromNumber,
          to: senderNumber
        });
        console.log(`[WhatsApp] Sent reply to ${senderNumber}`);
      } catch (twilioError) {
        console.error('Twilio send error:', twilioError);
        // Continue despite Twilio error
      }
    }

    // Send TwiML response (required by Twilio)
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(replyText);

    res.type('text/xml');
    res.send(twiml.toString());
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    res.status(500).send('Internal server error');
  }
});

/**
 * GET /webhook/whatsapp
 * Health check for webhook endpoint
 */
router.get('/whatsapp', (req, res) => {
  res.json({
    status: 'ok',
    service: 'whatsapp-webhook',
    configured: !!twilioClient
  });
});

module.exports = router;
