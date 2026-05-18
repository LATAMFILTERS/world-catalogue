const { Groq } = require('groq-sdk');
const { Logger } = require('../utils/logger');

class LLMService {
    static client = null;
    static model = 'mixtral-8x7b-32768';

    static ANTI_HALLUCINATION_SYSTEM_PROMPT = `You are an Industrial AI Assistant for Elimfilters.

CRITICAL OPERATING RULES - FOLLOW EXACTLY:

1. DATA SOURCE RESTRICTION:
   You can ONLY use information from:
   - RAG context (vector database results marked as "RETRIEVED CONTEXT")
   - Tool outputs (searchProducts, findCrossReference, getProductSpecs, etc.)
   - Direct PostgreSQL results from tool execution

   ALL other information is FORBIDDEN.

2. STRICT PROHIBITIONS - NEVER:
   - Invent products or SKUs
   - Create fake cross-references
   - Generate specifications not explicitly in retrieved data
   - Use general knowledge to fill gaps
   - Assume compatibility unless explicitly confirmed
   - Hallucinate OEM equivalents
   - Guess filter replacements or machine compatibility

3. MISSING DATA RESPONSE:
   If information is not found in database or tool outputs:
   Respond with EXACTLY:
   "NOT FOUND IN DATABASE"

   No exceptions. No explanations. No guesses.

4. DATA PRIORITY (if sources conflict):
   1. Tool results (highest priority)
   2. SQL query results
   3. Vector similarity results (if above 0.75 cosine similarity)

5. RESPONSE REQUIREMENTS:
   Every answer must include:
   - "Retrieved Context Used: YES" or "Retrieved Context Used: NO"
   - "Data Source: [tool name or 'vector_search' or 'sql']"
   - "Confidence: [0.0-1.0]"

   Format:
   [Your response]

   ---
   Retrieved Context Used: YES
   Data Source: findCrossReference tool
   Confidence: 0.95

6. TOOL EXECUTION REQUIREMENT:
   If a query matches these tool capabilities:
   - searchProducts: general product searches
   - findCrossReference: OEM codes, equivalents
   - getProductSpecs: technical specifications
   - searchByMachine: machine compatibility
   - getInventory: product availability

   YOU MUST CALL THE TOOL FIRST.
   Never respond without tool execution when data is required.

7. RAG VALIDATION:
   For vector search results, only use if:
   - Cosine similarity > 0.75
   - Result clearly matches query intent
   - No contradiction with tool results

8. CONTEXT INJECTION:
   When you receive "RETRIEVED CONTEXT" section:
   - Extract all listed products
   - Use ONLY these for responses
   - Never supplement with external knowledge

9. TRACEABILITY:
   Every piece of information in your response must be traceable to:
   - Specific tool result OR
   - Specific vector search result OR
   - Specific SQL query output

   If not traceable → DO NOT INCLUDE IT.

10. CONFIDENCE SCORING:
    - 1.0: Exact match in tool results with high confidence
    - 0.9: Multiple confirming sources
    - 0.8: Single tool result, clear match
    - 0.7: Vector result (similarity > 0.75)
    - 0.5: Partial match, some uncertainty
    - 0.0: Uncertain, default to "NOT FOUND IN DATABASE"

===== ANTI-HALLUCINATION HARD BOUNDARY =====

You are a GROUNDED INDUSTRIAL INTELLIGENCE ENGINE.
NOT a generative chatbot.

If in doubt: "NOT FOUND IN DATABASE"`;

    static async initialize() {
        if (!this.client) {
            this.client = new Groq({
                apiKey: process.env.GROQ_API_KEY
            });
        }
        return this.client;
    }

    static async executeWithGrounding(userQuery, systemContext = '', tools = null) {
        try {
            await this.initialize();

            // Build complete system prompt
            const completeSystemPrompt = this.ANTI_HALLUCINATION_SYSTEM_PROMPT +
                (systemContext ? `\n\n===== QUERY CONTEXT =====\n${systemContext}` : '');

            Logger.debug('LLM execution starting', {
                queryLength: userQuery.length,
                hasSystemContext: !!systemContext,
                toolCount: tools ? tools.length : 0
            });

            const response = await this.client.chat.completions.create({
                model: this.model,
                messages: [
                    { role: 'system', content: completeSystemPrompt },
                    { role: 'user', content: userQuery }
                ],
                tools: tools && tools.length > 0 ? tools : undefined,
                tool_choice: tools && tools.length > 0 ? 'auto' : undefined,
                temperature: 0.2, // Lower temperature for more grounded responses
                max_tokens: 1024
            });

            Logger.debug('LLM response generated', {
                hasToolCalls: !!response.choices[0].message.tool_calls,
                contentLength: response.choices[0].message.content?.length || 0
            });

            return {
                message: response.choices[0].message.content,
                toolCalls: response.choices[0].message.tool_calls || null,
                raw: response
            };
        } catch (err) {
            Logger.error('LLM execution failed', { error: err.message });
            throw err;
        }
    }

    static validateResponse(response, sources = {}) {
        const errors = [];

        if (!response) {
            errors.push('Response is empty');
            return { valid: false, errors };
        }

        // Check if response is "NOT FOUND IN DATABASE"
        if (response.includes('NOT FOUND IN DATABASE')) {
            return { valid: true, errors: [], type: 'not_found' };
        }

        // Check for hallucination indicators
        const hallucinationPatterns = [
            /assume.*compatible/i,
            /might.*work.*with/i,
            /probably.*equivalent/i,
            /likely.*compatible/i,
            /i think.*could/i,
            /based on my knowledge/i,
            /in general.*filters/i,
            /typically.*cross-refer/i
        ];

        for (const pattern of hallucinationPatterns) {
            if (pattern.test(response)) {
                errors.push(`Potential hallucination detected: ${pattern.source}`);
            }
        }

        // Check if response references sources
        const hasSourceReference =
            response.includes('Data Source:') ||
            response.includes('Retrieved Context Used:') ||
            response.includes('Confidence:');

        if (!hasSourceReference && !response.includes('NOT FOUND')) {
            errors.push('Response missing source attribution');
        }

        return {
            valid: errors.length === 0,
            errors: errors,
            type: 'grounded'
        };
    }

    static buildContextSection(semanticResults = [], keywordResults = [], source = 'RAG') {
        if (!semanticResults.length && !keywordResults.length) {
            return 'RETRIEVED CONTEXT:\nNo products found in database.';
        }

        let context = 'RETRIEVED CONTEXT:\n\n';

        if (semanticResults.length > 0) {
            context += 'SEMANTIC MATCHES (Vector Search):\n';
            semanticResults.forEach(p => {
                context += `- SKU: ${p.sku}, Code: ${p.base_code}, Type: ${p.type}, Description: ${p.description}\n`;
            });
            context += '\n';
        }

        if (keywordResults.length > 0) {
            context += 'KEYWORD MATCHES (SQL Search):\n';
            keywordResults.slice(0, 5).forEach(p => {
                context += `- SKU: ${p.sku}, Code: ${p.base_code}, Tech: ${p.technology}\n`;
            });
            context += '\n';
        }

        context += `Data Source: ${source}\n`;
        context += `Result Count: ${semanticResults.length + keywordResults.length}\n`;

        return context;
    }

    static formatGroundedResponse(answer, dataSource, confidence, retrievedCount) {
        return `${answer}

---
Retrieved Context Used: ${retrievedCount > 0 ? 'YES' : 'NO'}
Data Source: ${dataSource}
Confidence: ${confidence.toFixed(2)}`;
    }
}

module.exports = { LLMService };
