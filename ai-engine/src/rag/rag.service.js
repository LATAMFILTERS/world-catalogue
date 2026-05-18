const { Groq } = require('groq-sdk');
const { DatabaseService } = require('../db/database.service');
const { EmbeddingService } = require('../embeddings/embedding.service');
const { VectorSearchService } = require('../vector-search/vector-search.service');
const { IntentClassifierAgent } = require('../agents/intent-classifier.agent');
const { ToolsRegistry } = require('../tools/tools.registry');

class RAGService {
    static client = null;

    static async initialize() {
        if (!this.client) {
            this.client = new Groq({
                apiKey: process.env.GROQ_API_KEY
            });
        }
        return this.client;
    }

    static async fullRAGQuery(userQuery) {
        try {
            // Step 1: Intent Classification
            const intentResult = await IntentClassifierAgent.classify(userQuery);
            const entities = await IntentClassifierAgent.extractEntities(userQuery);

            // Step 2: Retrieve Context (RAG)
            const context = await this.retrieveContext(userQuery, intentResult.intent, entities);

            // Step 3: Build System Prompt with Context
            const systemPrompt = this.buildSystemPrompt(context, intentResult.intent);

            // Step 4: Process with Tool Calling
            const toolDefinitions = ToolsRegistry.getDefinitions();

            const response = await this.client.chat.completions.create({
                model: 'mixtral-8x7b-32768',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userQuery }
                ],
                tools: toolDefinitions.length > 0 ? toolDefinitions : undefined,
                tool_choice: toolDefinitions.length > 0 ? 'auto' : undefined,
                temperature: 0.3,
                max_tokens: 1024
            });

            // Step 5: Handle Tool Calls
            let toolResults = null;
            if (response.choices[0].message.tool_calls) {
                toolResults = {};
                for (const toolCall of response.choices[0].message.tool_calls) {
                    try {
                        const result = await ToolsRegistry.executeTool(
                            toolCall.function.name,
                            JSON.parse(toolCall.function.arguments)
                        );
                        toolResults[toolCall.function.name] = result;
                    } catch (err) {
                        console.error(`Tool ${toolCall.function.name} failed:`, err.message);
                        toolResults[toolCall.function.name] = { error: err.message };
                    }
                }
            }

            return {
                query: userQuery,
                intent: intentResult.intent,
                confidence: intentResult.confidence,
                entities,
                retrievedContext: context,
                llmResponse: response.choices[0].message.content,
                toolCalls: toolResults ? Object.keys(toolResults) : [],
                toolResults: toolResults,
                products: toolResults ? this.extractProducts(toolResults) : [],
                timestamp: new Date().toISOString()
            };
        } catch (err) {
            console.error('RAG query error:', err.message);
            throw err;
        }
    }

    static async retrieveContext(query, intent, entities) {
        const context = {
            semanticResults: [],
            keywordResults: [],
            relatedProducts: []
        };

        try {
            // Semantic search
            const semanticResults = await VectorSearchService.searchBySemanticSimilarity(query, 3);
            context.semanticResults = semanticResults;

            // Keyword search based on entities
            if (entities.codes && entities.codes.length > 0) {
                for (const code of entities.codes) {
                    const results = await DatabaseService.findCrossReferences(code, 3);
                    context.keywordResults.push(...results);
                }
            }

            if (entities.machines && entities.machines.length > 0) {
                for (const machine of entities.machines) {
                    const results = await DatabaseService.getProductsByApplication(machine, 3);
                    context.keywordResults.push(...results);
                }
            }

            // Remove duplicates
            const seenSkus = new Set();
            context.semanticResults.forEach(p => seenSkus.add(p.sku));
            context.keywordResults = context.keywordResults.filter(p => !seenSkus.has(p.sku));

            return context;
        } catch (err) {
            console.warn('Context retrieval error:', err.message);
            return context;
        }
    }

    static buildSystemPrompt(context, intent) {
        const basePrompt = `You are an industrial filter specialist AI for Elimfilters.

Your role is to help users find the right filters for their industrial needs using ONLY the retrieved context data.

IMPORTANT RULES:
1. Answer ONLY using the retrieved product data below
2. DO NOT hallucinate or invent products
3. Provide specific product SKUs when available
4. Be concise and technical
5. If information is not in the context, say "I don't have that information"

RETRIEVED CONTEXT:
`;

        let contextData = basePrompt;

        if (context.semanticResults && context.semanticResults.length > 0) {
            contextData += `\nSEMANTIC MATCHES:\n`;
            context.semanticResults.forEach(p => {
                contextData += `- SKU: ${p.sku}, Code: ${p.base_code}, Type: ${p.type}, Desc: ${p.description}\n`;
            });
        }

        if (context.keywordResults && context.keywordResults.length > 0) {
            contextData += `\nKEYWORD MATCHES:\n`;
            context.keywordResults.slice(0, 5).forEach(p => {
                contextData += `- SKU: ${p.sku}, Code: ${p.base_code}, Tech: ${p.technology}\n`;
            });
        }

        contextData += `\nINTENT: ${intent}`;

        return contextData;
    }

    static extractProducts(toolResults) {
        const products = [];
        const seenSkus = new Set();

        Object.values(toolResults).forEach(result => {
            if (result.results && Array.isArray(result.results)) {
                result.results.forEach(p => {
                    if (p.sku && !seenSkus.has(p.sku)) {
                        products.push(p);
                        seenSkus.add(p.sku);
                    }
                });
            }
            if (result.products && Array.isArray(result.products)) {
                result.products.forEach(p => {
                    if (p.sku && !seenSkus.has(p.sku)) {
                        products.push(p);
                        seenSkus.add(p.sku);
                    }
                });
            }
            if (result.equivalents && Array.isArray(result.equivalents)) {
                result.equivalents.forEach(p => {
                    if (p.sku && !seenSkus.has(p.sku)) {
                        products.push(p);
                        seenSkus.add(p.sku);
                    }
                });
            }
        });

        return products.slice(0, 10);
    }
}

module.exports = { RAGService };
