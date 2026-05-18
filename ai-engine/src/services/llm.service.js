const { Groq } = require('groq-sdk');
const { ToolService } = require('./tools.service');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

class LLMService {
    static async processQuery(query, context = {}, tools = []) {
        const systemPrompt = `You are an industrial filter specialist AI for Elimfilters.
Your role is to help users find the right filters using technical knowledge about:
- OEM codes and cross-references
- Filter types (oil, air, fuel, hydraulic, cabin, marine, turbine, separator, coolant, dryer)
- Machine compatibility
- Filter specifications (micron rating, efficiency, media type, dimensions)
- Alternative/equivalent products

Always provide specific product SKUs when available.
Be concise and technical.
If unsure, ask for clarification.

Context:
${JSON.stringify(context, null, 2)}`;

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: query }
        ];

        try {
            const response = await groq.chat.completions.create({
                model: 'mixtral-8x7b-32768',
                messages,
                tools: tools.length > 0 ? tools : undefined,
                tool_choice: tools.length > 0 ? 'auto' : undefined,
                temperature: 0.3,
                max_tokens: 1024
            });

            return {
                content: response.choices[0].message.content,
                toolCalls: response.choices[0].message.tool_calls || [],
                finishReason: response.choices[0].finish_reason
            };
        } catch (err) {
            console.error('GROQ Error:', err.message);
            throw new Error(`LLM processing failed: ${err.message}`);
        }
    }

    static async intentClassification(query) {
        const systemPrompt = `Classify the user's filter search intent into ONE category:
- CROSS_REFERENCE: Looking for equivalent/alternative to a specific code
- MACHINE_LOOKUP: Looking for filter for a specific machine/vehicle/equipment
- PRODUCT_SEARCH: Looking for filters by specifications
- COMPATIBILITY: Looking for compatible products
- TECHNICAL_QUESTION: Technical question about filters
- OTHER: Something else

Respond with ONLY the category name, nothing else.`;

        const response = await groq.chat.completions.create({
            model: 'mixtral-8x7b-32768',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: query }
            ],
            temperature: 0.1,
            max_tokens: 50
        });

        const intent = response.choices[0].message.content.trim();
        return {
            intent,
            confidence: 0.9,
            query
        };
    }

    static async extractEntities(query) {
        const systemPrompt = `Extract technical entities from the industrial filter query.
Return JSON with:
{
  "codes": ["any OEM/part codes"],
  "machines": ["vehicle/machine brands/models"],
  "technologies": ["filter types mentioned"],
  "specifications": ["any technical specs mentioned"],
  "quantities": ["any quantities"]
}
If not found, use empty arrays.`;

        const response = await groq.chat.completions.create({
            model: 'mixtral-8x7b-32768',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: query }
            ],
            temperature: 0.1,
            max_tokens: 200
        });

        try {
            return JSON.parse(response.choices[0].message.content);
        } catch {
            return {
                codes: [],
                machines: [],
                technologies: [],
                specifications: [],
                quantities: []
            };
        }
    }

    static async rankResults(query, results) {
        if (!results || results.length === 0) return [];

        const systemPrompt = `You are ranking filter search results by relevance.
Given the user query and list of products, rank them from most to least relevant.
Respond with a JSON array of indices in ranked order.
Example: [0, 2, 1, 3]`;

        const prompt = `Query: "${query}"

Products:
${results.map((r, i) => `${i}. SKU: ${r.sku}, Code: ${r.base_code}, Type: ${r.type}, Desc: ${r.description}`).join('\n')}

Rank by relevance (most relevant first). Return ONLY the array like [0, 2, 1, ...]`;

        const response = await groq.chat.completions.create({
            model: 'mixtral-8x7b-32768',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            temperature: 0.1,
            max_tokens: 100
        });

        try {
            const ranking = JSON.parse(response.choices[0].message.content);
            return ranking.map(idx => results[idx]).filter(Boolean);
        } catch {
            return results;
        }
    }
}

module.exports = { LLMService };
