module.exports = {
    groq: {
        provider: 'groq',
        models: {
            default: 'mixtral-8x7b-32768',
            fast: 'llama-3-8b-instant',
            powerful: 'llama-3-70b-versatile'
        },
        config: {
            temperature: 0.3,
            maxTokens: 1024,
            supportsTools: true
        }
    },
    openai: {
        provider: 'openai',
        models: {
            default: 'gpt-4-turbo',
            fast: 'gpt-3.5-turbo',
            powerful: 'gpt-4'
        },
        config: {
            temperature: 0.3,
            maxTokens: 1024,
            supportsTools: true
        }
    }
};
