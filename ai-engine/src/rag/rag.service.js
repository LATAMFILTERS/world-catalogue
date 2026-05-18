const { DatabaseService } = require('../db/database.service');
const { EmbeddingService } = require('../embeddings/embedding.service');
const { VectorSearchService } = require('../vector-search/vector-search.service');
const { IntentClassifierAgent } = require('../agents/intent-classifier.agent');
const { ToolsRegistry } = require('../tools/tools.registry');
const { Logger } = require('../utils/logger');
const { LLMService } = require('../services/llm.service');

class RAGService {
    static async initialize() {
        await LLMService.initialize();
    }

    static async fullRAGQuery(userQuery) {
        try {
            Logger.info('RAG query started', { query: userQuery.substring(0, 50) });

            // Step 1: Intent Classification
            const intentResult = await IntentClassifierAgent.classify(userQuery);
            const entities = await IntentClassifierAgent.extractEntities(userQuery);
            Logger.debug('Intent classified', { intent: intentResult.intent, confidence: intentResult.confidence });

            // Step 2: Retrieve Context (RAG)
            const context = await this.retrieveContext(userQuery, intentResult.intent, entities);
            Logger.debug('Context retrieved', {
                semanticCount: context.semanticResults.length,
                keywordCount: context.keywordResults.length
            });

            // Step 3: Build RAG Context Section
            const contextSection = LLMService.buildContextSection(
                context.semanticResults,
                context.keywordResults,
                'RAG (Vector + SQL Search)'
            );

            // Step 4: Process with Tool Calling using LLMService
            const toolDefinitions = ToolsRegistry.getDefinitions();
            Logger.debug('Tool calling setup', { toolCount: toolDefinitions.length });

            const llmResponse = await LLMService.executeWithGrounding(
                userQuery,
                contextSection,
                toolDefinitions.length > 0 ? toolDefinitions : null
            );

            // Step 5: Handle Tool Calls
            let toolResults = null;
            const toolCalls = [];
            if (llmResponse.toolCalls) {
                toolResults = {};
                for (const toolCall of llmResponse.toolCalls) {
                    try {
                        Logger.debug('Executing tool', { tool: toolCall.function.name });
                        const result = await ToolsRegistry.executeTool(
                            toolCall.function.name,
                            JSON.parse(toolCall.function.arguments)
                        );
                        toolResults[toolCall.function.name] = result;
                        toolCalls.push(toolCall.function.name);
                        Logger.debug('Tool executed successfully', { tool: toolCall.function.name });
                    } catch (err) {
                        Logger.error(`Tool execution failed: ${toolCall.function.name}`, { error: err.message });
                        toolResults[toolCall.function.name] = { error: err.message };
                    }
                }
            }

            // Step 6: Validate response for hallucinations
            const validation = LLMService.validateResponse(llmResponse.message, {
                semantic: context.semanticResults,
                keyword: context.keywordResults
            });

            if (!validation.valid && validation.errors.length > 0) {
                Logger.warn('Response validation detected issues', { errors: validation.errors });
            }

            const products = toolResults ? this.extractProducts(toolResults) : [];
            const retrievedCount = context.semanticResults.length + context.keywordResults.length;

            Logger.info('RAG query completed', {
                intent: intentResult.intent,
                toolCount: toolCalls.length,
                productCount: products.length,
                retrievedContext: retrievedCount,
                validation: validation.type
            });

            return {
                query: userQuery,
                intent: intentResult.intent,
                confidence: intentResult.confidence,
                entities,
                retrievedContext: context,
                llmResponse: llmResponse.message,
                toolCalls: toolCalls,
                toolResults: toolResults,
                products: products,
                dataSource: 'RAG with Anti-Hallucination Enforcement',
                validation: validation,
                timestamp: new Date().toISOString()
            };
        } catch (err) {
            Logger.error('RAG query failed', { query: userQuery.substring(0, 50), error: err.message });
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
            Logger.debug('Semantic search completed', { resultCount: semanticResults.length });

            // Keyword search based on entities
            if (entities.codes && entities.codes.length > 0) {
                Logger.debug('Searching for cross-references', { codeCount: entities.codes.length });
                for (const code of entities.codes) {
                    const results = await DatabaseService.findCrossReferences(code, 3);
                    context.keywordResults.push(...results);
                }
            }

            if (entities.machines && entities.machines.length > 0) {
                Logger.debug('Searching by machine compatibility', { machineCount: entities.machines.length });
                for (const machine of entities.machines) {
                    const results = await DatabaseService.getProductsByApplication(machine, 3);
                    context.keywordResults.push(...results);
                }
            }

            // Remove duplicates
            const seenSkus = new Set();
            context.semanticResults.forEach(p => seenSkus.add(p.sku));
            context.keywordResults = context.keywordResults.filter(p => !seenSkus.has(p.sku));

            Logger.debug('Context retrieval complete', {
                semanticCount: context.semanticResults.length,
                keywordCount: context.keywordResults.length
            });

            return context;
        } catch (err) {
            Logger.warn('Context retrieval error (continuing with available data)', { error: err.message });
            return context;
        }
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
