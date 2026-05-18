const { Groq } = require('groq-sdk');
const { Logger } = require('../utils/logger');

class IntentClassifierAgent {
    static client = null;
    static model = process.env.GROQ_MODEL || 'mixtral-8x7b-32768';

    static async initialize() {
        if (!this.client) {
            this.client = new Groq({
                apiKey: process.env.GROQ_API_KEY
            });
        }
        return this.client;
    }

    static SUPPORTED_INTENTS = {
        CROSS_REFERENCE_SEARCH: 'Looking for equivalent/alternative to a specific OEM or part code',
        MACHINE_LOOKUP: 'Looking for filter for a specific machine/vehicle/equipment',
        PRODUCT_SEARCH: 'Searching for filters by category, type, or specifications',
        TECHNICAL_SPEC_REQUEST: 'Asking for technical information about filter specifications',
        INVENTORY_REQUEST: 'Checking availability or inventory of a product'
    };

    static async classify(query) {
        try {
            await this.initialize();

            const systemPrompt = `You are an industrial filter query classifier for Elimfilters.

Classify the user query into ONE of these intents:

1. CROSS_REFERENCE_SEARCH - Looking for equivalent/alternative to a specific OEM or part code
   Examples: "equivalent to LF9009", "what code replaces P502380", "alternatives to Donaldson X"

2. MACHINE_LOOKUP - Looking for filter for a specific machine/vehicle/equipment
   Examples: "filter for Caterpillar 320D", "air filter for Toyota Camry 2015"

3. PRODUCT_SEARCH - Searching for filters by category, type, or specifications
   Examples: "oil filters", "fuel water separator", "cabin air filter"

4. TECHNICAL_SPEC_REQUEST - Asking for technical information about filter specifications
   Examples: "what is micron rating", "efficiency standards", "filter materials"

5. INVENTORY_REQUEST - Checking availability or inventory
   Examples: "is LF9009 in stock", "availability of EL8-001"

Respond ONLY with valid JSON:
{
  "intent": "INTENT_NAME",
  "confidence": 0.85,
  "reasoning": "brief explanation"
}`;

            const response = await this.client.chat.completions.create({
                model: this.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: query }
                ],
                temperature: 0.1,
                max_tokens: 200
            });

            try {
                const result = JSON.parse(response.choices[0].message.content);

                const isValid = Object.keys(this.SUPPORTED_INTENTS).includes(result.intent);
                if (!isValid) {
                    Logger.warn('Unrecognized intent returned, defaulting to PRODUCT_SEARCH', {
                        returned: result.intent
                    });
                    result.intent = 'PRODUCT_SEARCH';
                    result.confidence = 0.5;
                    result.reasoning = 'Defaulted to PRODUCT_SEARCH for unrecognized intent';
                }

                return {
                    query,
                    intent: result.intent,
                    confidence: Math.min(result.confidence, 1.0),
                    reasoning: result.reasoning || '',
                    timestamp: new Date().toISOString()
                };
            } catch (parseErr) {
                Logger.warn('Intent classification parse error, defaulting to PRODUCT_SEARCH', {
                    error: parseErr.message
                });
                return {
                    query,
                    intent: 'PRODUCT_SEARCH',
                    confidence: 0.5,
                    reasoning: 'Parse error - defaulted to PRODUCT_SEARCH',
                    timestamp: new Date().toISOString()
                };
            }
        } catch (err) {
            Logger.error('Intent classification failed', { error: err.message });
            return {
                query,
                intent: 'PRODUCT_SEARCH',
                confidence: 0.0,
                error: err.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    static async extractEntities(query) {
        try {
            await this.initialize();

            const systemPrompt = `Extract technical entities from the industrial filter query.

Return ONLY valid JSON:
{
  "codes": ["any OEM/part codes mentioned"],
  "machines": ["vehicle/machine brands/models mentioned"],
  "technologies": ["filter types mentioned (oil, air, fuel, hydraulic, etc)"],
  "specifications": ["technical specs mentioned (micron, efficiency, etc)"],
  "keywords": ["other relevant technical keywords"]
}`;

            const response = await this.client.chat.completions.create({
                model: this.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: query }
                ],
                temperature: 0.1,
                max_tokens: 300
            });

            try {
                return JSON.parse(response.choices[0].message.content);
            } catch {
                Logger.warn('Entity extraction parse error, returning empty entities');
                return {
                    codes: [],
                    machines: [],
                    technologies: [],
                    specifications: [],
                    keywords: []
                };
            }
        } catch (err) {
            Logger.error('Entity extraction failed', { error: err.message });
            return {
                codes: [],
                machines: [],
                technologies: [],
                specifications: [],
                keywords: []
            };
        }
    }
}

module.exports = { IntentClassifierAgent };
