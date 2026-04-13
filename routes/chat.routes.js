const express = require('express');
const router = express.Router();
const chatbot = require('../services/chatbot.service');

// API key auth for distributor endpoints
const authenticateDistributor = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  // Simple key validation (extend with DB lookup if needed)
  if (!apiKey || !apiKey.startsWith('elim_')) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }

  req.distributorId = apiKey.split('_')[1];
  next();
};

/**
 * POST /api/chat
 * Web chatbot endpoint
 * Body: { message: string, language?: "es"|"en"|"pt", userId?: string }
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, language, userId } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message required' });
    }

    const response = await chatbot.chat(
      message.trim(),
      userId || req.ip,
      language
    );

    res.json(response);
  } catch (error) {
    console.error('Chat route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/chat/distributor
 * Authenticated endpoint for distributor integrations
 * Headers: x-api-key: elim_<distributor_id>
 */
router.post('/chat/distributor', authenticateDistributor, async (req, res) => {
  try {
    const { message, language } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message required' });
    }

    const response = await chatbot.chat(
      message.trim(),
      `distributor_${req.distributorId}`,
      language
    );

    // Enhanced response for distributor API
    res.json({
      ...response,
      distributorId: req.distributorId,
      apiVersion: '1.0'
    });
  } catch (error) {
    console.error('Distributor chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/chat/health
 * Health check
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'chatbot',
    timestamp: new Date()
  });
});

module.exports = router;
