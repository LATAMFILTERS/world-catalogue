const { SearchProductsTool } = require('./search-products.tool');
const { FindCrossReferenceTool } = require('./find-cross-reference.tool');
const { GetProductSpecsTool } = require('./get-product-specs.tool');
const { SearchByMachineTool } = require('./search-by-machine.tool');
const { GetInventoryTool } = require('./get-inventory.tool');

class ToolsRegistry {
    static tools = {
        searchProducts: SearchProductsTool,
        findCrossReference: FindCrossReferenceTool,
        getProductSpecs: GetProductSpecsTool,
        searchByMachine: SearchByMachineTool,
        getInventory: GetInventoryTool
    };

    static getDefinitions() {
        return Object.values(this.tools).map(Tool => Tool.definition);
    }

    static async executeTool(toolName, params) {
        const Tool = this.tools[toolName];

        if (!Tool) {
            return {
                success: false,
                error: `Unknown tool: ${toolName}`
            };
        }

        return await Tool.execute(params);
    }

    static getToolNames() {
        return Object.keys(this.tools);
    }

    static getTool(toolName) {
        return this.tools[toolName] || null;
    }

    static validateToolCall(toolName, params) {
        const Tool = this.tools[toolName];
        if (!Tool) return { valid: false, error: `Unknown tool: ${toolName}` };

        const required = Tool.definition.function.parameters.required || [];
        const missing = required.filter(key => !(key in params));

        if (missing.length > 0) {
            return { valid: false, error: `Missing required parameters: ${missing.join(', ')}` };
        }

        return { valid: true };
    }
}

module.exports = { ToolsRegistry };
