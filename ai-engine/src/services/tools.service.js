const { DatabaseService } = require('./database.service');

class ToolService {
    static getToolDefinitions() {
        return [
            {
                type: 'function',
                function: {
                    name: 'searchProducts',
                    description: 'Search for filters by SKU, code, or technical specs',
                    parameters: {
                        type: 'object',
                        properties: {
                            query: {
                                type: 'string',
                                description: 'Search query (SKU, part number, or technical term)'
                            },
                            limit: {
                                type: 'number',
                                description: 'Max results to return (default 10)',
                                default: 10
                            }
                        },
                        required: ['query']
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'findCrossReference',
                    description: 'Find equivalent filters and cross-references for a code',
                    parameters: {
                        type: 'object',
                        properties: {
                            code: {
                                type: 'string',
                                description: 'OEM code or competitor code to find equivalents for'
                            },
                            limit: {
                                type: 'number',
                                description: 'Max results (default 10)',
                                default: 10
                            }
                        },
                        required: ['code']
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'getProductSpecs',
                    description: 'Get detailed specifications for a specific filter by SKU',
                    parameters: {
                        type: 'object',
                        properties: {
                            sku: {
                                type: 'string',
                                description: 'Filter SKU'
                            }
                        },
                        required: ['sku']
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'searchByTechnology',
                    description: 'Find filters by technology type (oil, air, fuel, hydraulic, etc)',
                    parameters: {
                        type: 'object',
                        properties: {
                            technology: {
                                type: 'string',
                                enum: ['oil', 'air', 'fuel', 'hydraulic', 'cabin', 'marine', 'turbine', 'separator', 'coolant', 'dryer'],
                                description: 'Filter technology type'
                            },
                            limit: {
                                type: 'number',
                                description: 'Max results',
                                default: 10
                            }
                        },
                        required: ['technology']
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'getFilterStats',
                    description: 'Get overall filter catalog statistics',
                    parameters: {
                        type: 'object',
                        properties: {}
                    }
                }
            }
        ];
    }

    static async executeTool(toolName, toolInput) {
        switch (toolName) {
            case 'searchProducts':
                return await DatabaseService.searchFilters(
                    toolInput.query,
                    toolInput.limit || 10
                );

            case 'findCrossReference':
                return await DatabaseService.findCrossReferences(
                    toolInput.code,
                    toolInput.limit || 10
                );

            case 'getProductSpecs':
                const product = await DatabaseService.getFilterBySku(toolInput.sku);
                return product ? [product] : [];

            case 'searchByTechnology':
                return await DatabaseService.searchByTechnology(
                    toolInput.technology,
                    toolInput.limit || 10
                );

            case 'getFilterStats':
                return [await DatabaseService.getFilterStats()];

            default:
                throw new Error(`Unknown tool: ${toolName}`);
        }
    }
}

module.exports = { ToolService };
