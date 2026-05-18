const { Logger } = require('../utils/logger');

class ResponseValidator {
    static validateGroundedResponse(response) {
        const errors = [];

        // Check required fields
        if (!response.query) {
            errors.push('Missing required field: query');
        }

        if (!response.llmResponse) {
            errors.push('Missing required field: llmResponse');
        }

        if (!response.dataSource) {
            errors.push('Missing required field: dataSource');
        }

        // Check for hallucination indicators
        const hallucinationPatterns = [
            { pattern: /assume.*compatible/i, reason: 'Assumes compatibility without data' },
            { pattern: /might.*work.*with/i, reason: 'Speculative compatibility claim' },
            { pattern: /probably.*equivalent/i, reason: 'Unconfirmed equivalence' },
            { pattern: /likely.*compatible/i, reason: 'Speculative compatibility' },
            { pattern: /i think.*could/i, reason: 'Speculation instead of data' },
            { pattern: /based on my knowledge/i, reason: 'Using general knowledge instead of data' },
            { pattern: /in general.*filters/i, reason: 'General knowledge not from database' },
            { pattern: /typically.*cross-refer/i, reason: 'Generalization instead of data' }
        ];

        const responseText = (response.llmResponse || '').toLowerCase();

        for (const { pattern, reason } of hallucinationPatterns) {
            if (pattern.test(responseText)) {
                errors.push(`Hallucination detected: ${reason}`);
            }
        }

        // Check if response is grounded
        const isNotFound = response.llmResponse?.includes('NOT FOUND IN DATABASE');
        const hasSourceAttribution = response.dataSource && response.dataSource !== 'unknown';
        const hasConfidence = typeof response.confidence === 'number' && response.confidence >= 0 && response.confidence <= 1;

        if (!isNotFound && !hasSourceAttribution) {
            errors.push('Response missing data source attribution');
        }

        return {
            valid: errors.length === 0,
            errors: errors,
            hasHallucinations: errors.filter(e => e.includes('Hallucination')).length > 0,
            isNotFound: isNotFound,
            isGrounded: hasSourceAttribution && errors.filter(e => e.includes('Hallucination')).length === 0
        };
    }

    static ensureDataAttribution(response) {
        if (!response.llmResponse?.includes('NOT FOUND')) {
            // Response claims to have data - must have source
            if (!response.dataSource || response.dataSource === 'unknown') {
                Logger.warn('Response has data but missing source attribution', { query: response.query });
                return {
                    ...response,
                    dataSource: 'unknown - DATA ATTRIBUTION MISSING'
                };
            }

            if (typeof response.confidence !== 'number') {
                Logger.warn('Response missing confidence score', { query: response.query });
                response.confidence = 0;
            }
        }

        return response;
    }

    static enforceFormat(response) {
        // Ensure response has all required fields
        const formatted = {
            query: response.query,
            intent: response.intent,
            confidence: response.confidence,
            llmResponse: response.llmResponse,
            dataSource: response.dataSource,
            retrievedContextUsed: (response.retrievedContext?.semanticResults?.length || 0) +
                (response.retrievedContext?.keywordResults?.length || 0) > 0,
            products: response.products || [],
            validation: response.validation || { valid: true, errors: [] },
            timestamp: response.timestamp || new Date().toISOString()
        };

        // Validate the formatted response
        const validation = this.validateGroundedResponse(formatted);
        formatted.validation = validation;

        if (validation.hasHallucinations) {
            Logger.error('HALLUCINATION DETECTED IN RESPONSE', {
                query: formatted.query,
                errors: validation.errors
            });
        }

        return formatted;
    }
}

module.exports = { ResponseValidator };
