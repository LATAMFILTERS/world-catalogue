const { DatabaseService } = require('../db/database.service');

class FindCrossReferenceTool {
    static definition = {
        type: 'function',
        function: {
            name: 'findCrossReference',
            description: 'Find equivalent or alternative filters for a specific OEM or competitor code',
            parameters: {
                type: 'object',
                properties: {
                    code: {
                        type: 'string',
                        description: 'OEM code, competitor code, or cross-reference to find equivalents for'
                    },
                    limit: {
                        type: 'number',
                        description: 'Maximum equivalents to return (default 10)',
                        default: 10
                    }
                },
                required: ['code']
            }
        }
    };

    static async execute(params) {
        try {
            const { code, limit = 10 } = params;

            if (!code || code.trim().length < 2) {
                return {
                    success: false,
                    error: 'Code must be at least 2 characters',
                    equivalents: []
                };
            }

            const equivalents = await DatabaseService.findCrossReferences(code, Math.min(limit, 50));

            return {
                success: true,
                originalCode: code,
                count: equivalents.length,
                equivalents: equivalents,
                timestamp: new Date().toISOString()
            };
        } catch (err) {
            return {
                success: false,
                error: err.message,
                equivalents: []
            };
        }
    }
}

module.exports = { FindCrossReferenceTool };
