const express = require('express');
const router = express.Router();
const { DatabaseService } = require('../db/database.service');
const { Logger } = require('../utils/logger');

router.post('/', async (req, res) => {
    try {
        const { code } = req.body;

        if (!code || code.trim().length < 2) {
            return res.status(400).json({
                success: false,
                error: 'Code must be at least 2 characters'
            });
        }

        Logger.info('Cross-reference lookup requested', { code });

        const equivalents = await DatabaseService.findCrossReferences(code, 20);

        // Grounded response - only returning database-verified equivalents
        const response = {
            code,
            equivalents: equivalents || [],
            count: equivalents?.length || 0,
            dataSource: 'PostgreSQL Cross-Reference Lookup (Grounded)',
            confidence: equivalents && equivalents.length > 0 ? 1.0 : 0.0,
            timestamp: new Date().toISOString()
        };

        if (equivalents.length === 0) {
            Logger.info('No cross-references found', { code });
            response.message = 'NOT FOUND IN DATABASE';
        } else {
            Logger.info('Cross-references found', { code, count: equivalents.length });
        }

        res.json({
            success: true,
            data: response
        });
    } catch (err) {
        Logger.error('Cross-reference error', { error: err.message });
        res.status(500).json({
            success: false,
            error: 'Cross-reference lookup failed',
            message: err.message
        });
    }
});

module.exports = router;
