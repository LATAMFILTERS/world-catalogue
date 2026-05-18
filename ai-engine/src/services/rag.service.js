const { LLMService } = require('./llm.service');
const { ToolService } = require('./tools.service');
const { DatabaseService } = require('./database.service');

class RAGService {
    static async queryWithRAG(userQuery) {
        // Step 1: Intent classification
        const intent = await LLMService.intentClassification(userQuery);

        // Step 2: Entity extraction
        const entities = await LLMService.extractEntities(userQuery);

        // Step 3: Retrieve context from database
        let context = {
            intent: intent.intent,
            entities,
            stats: await DatabaseService.getFilterStats()
        };

        // Step 4: Execute query with tool calling
        const tools = ToolService.getToolDefinitions();
        const llmResponse = await LLMService.processQuery(userQuery, context, tools);

        // Step 5: Handle tool calls if needed
        let toolResults = null;
        if (llmResponse.toolCalls && llmResponse.toolCalls.length > 0) {
            toolResults = {};
            for (const toolCall of llmResponse.toolCalls) {
                try {
                    const result = await ToolService.executeTool(
                        toolCall.function.name,
                        JSON.parse(toolCall.function.arguments)
                    );
                    toolResults[toolCall.function.name] = result;
                } catch (err) {
                    console.error(`Tool execution error: ${toolCall.function.name}`, err);
                    toolResults[toolCall.function.name] = { error: err.message };
                }
            }
        }

        // Step 6: Final ranking if results available
        let finalResults = null;
        if (toolResults) {
            const allResults = Object.values(toolResults)
                .flat()
                .filter(r => r && !r.error);

            if (allResults.length > 0) {
                finalResults = await LLMService.rankResults(userQuery, allResults);
            }
        }

        return {
            query: userQuery,
            intent: intent.intent,
            entities,
            llmResponse: llmResponse.content,
            toolResults: toolResults ? Object.keys(toolResults) : [],
            products: finalResults || [],
            timestamp: new Date().toISOString()
        };
    }

    static async searchWithAI(query) {
        // Simpler flow for pure search
        const intent = await LLMService.intentClassification(query);
        const entities = await LLMService.extractEntities(query);

        let products = [];

        // Route by intent
        if (intent.intent === 'CROSS_REFERENCE' && entities.codes?.length > 0) {
            for (const code of entities.codes) {
                const results = await DatabaseService.findCrossReferences(code);
                products.push(...results);
            }
        } else if (intent.intent === 'PRODUCT_SEARCH') {
            products = await DatabaseService.searchFilters(query);
        } else if (entities.technologies?.length > 0) {
            for (const tech of entities.technologies) {
                const results = await DatabaseService.searchByTechnology(tech);
                products.push(...results);
            }
        } else {
            products = await DatabaseService.searchFilters(query);
        }

        // Rank results
        if (products.length > 1) {
            products = await LLMService.rankResults(query, products);
        }

        return {
            query,
            intent: intent.intent,
            entities,
            products,
            count: products.length,
            timestamp: new Date().toISOString()
        };
    }

    static async findCrossReferences(code) {
        const products = await DatabaseService.findCrossReferences(code);

        return {
            code,
            equivalents: products,
            count: products.length,
            timestamp: new Date().toISOString()
        };
    }

    static async classifyIntent(query) {
        const intent = await LLMService.intentClassification(query);
        const entities = await LLMService.extractEntities(query);

        return {
            query,
            intent: intent.intent,
            confidence: intent.confidence,
            entities,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = { RAGService };
