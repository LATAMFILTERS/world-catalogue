const Groq = require('groq-sdk');
const { Pool } = require('pg');

class ChatbotService {
  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });

    this.db = new Pool({
      host: 'ballast.proxy.rlwy.net',
      port: 18263,
      database: 'railway',
      user: 'postgres',
      password: 'qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm',
      client_encoding: 'UTF8',
      ssl: { rejectUnauthorized: false }
    });

    this.systemPrompts = {
      es: `Eres asistente técnico de ELIMFILTERS, experto en filtros industriales, automotrices y marinos.

CONTEXTO:
- Filtros: aire (EA1), aceite (EL8), combustible (EF9), hidráulico (EH6), cabina (EC1)
- SKU: prefijo + 4 dígitos (ej: EL81808)
- TRILOGY: STANDARD, PERFORMANCE, ELITE (variantes de medio)
- DUTY: Heavy Duty (HD), Light Duty (LD), Marine
- Cross-ref: Donaldson (HD), FRAM (LD)

REGLAS:
1. Responde en español salvo que pidan otro idioma
2. Si piden código OEM → busca en DB, da SKU equivalente
3. Si no sabes → sugiere contactar soporte@elimfilters.com
4. Técnico pero accesible para mecánicos/distribuidores

Responde conciso, máx 3 líneas salvo explicaciones técnicas.`,

      en: `You're ELIMFILTERS technical support, expert in industrial, automotive, marine filters.

CONTEXT:
- Filter types: air (EA1), oil (EL8), fuel (EF9), hydraulic (EH6), cabin (EC1)
- SKU format: prefix + 4 digits (eg: EL81808)
- TRILOGY: STANDARD, PERFORMANCE, ELITE (media variants)
- DUTY: Heavy Duty (HD), Light Duty (LD), Marine
- Cross-ref: Donaldson (HD), FRAM (LD)

RULES:
1. Answer in English unless customer requests other language
2. OEM code inquiry → search DB, return SKU equivalent
3. Unknown → suggest support@elimfilters.com
4. Technical but accessible for mechanics/distributors

Keep responses concise, max 3 lines unless technical explanation needed.`,

      pt: `Você é assistente técnico ELIMFILTERS, especialista em filtros industriais, automotivos e marinhos.

CONTEXTO:
- Tipos: ar (EA1), óleo (EL8), combustível (EF9), hidráulico (EH6), cabine (EC1)
- SKU: prefixo + 4 dígitos (ex: EL81808)
- TRILOGY: STANDARD, PERFORMANCE, ELITE (variantes de mídia)
- DUTY: Heavy Duty (HD), Light Duty (LD), Marine
- Cross-ref: Donaldson (HD), FRAM (LD)

REGRAS:
1. Responda em português, a menos que solicitem outro idioma
2. Consulta de código OEM → busque BD, retorne SKU equivalente
3. Desconhecido → sugira contato suporte@elimfilters.com
4. Técnico mas acessível para mecânicos/distribuidores

Respostas concisas, máx 3 linhas salvo explicações técnicas.`
    };
  }

  detectLanguage(text) {
    const textLower = text.toLowerCase();

    // Portuguese indicators
    if (text.match(/\b(olá|oi|qual|como|obrigad|filtro de|qual é)\b/i)) return 'pt';

    // English indicators
    if (text.match(/\b(hello|hi|what|how|thanks|filter|which)\b/i)) return 'en';

    // Default Spanish
    return 'es';
  }

  async searchFilterDB(query) {
    try {
      const result = await this.db.query(`
        SELECT
          sku, codigo_base, filter_type, technology,
          duty, oem_codes, competitor_codes,
          height_mm, outer_diameter_mm, micron_rating
        FROM elimfilters_catalog
        WHERE
          sku ILIKE $1
          OR codigo_base ILIKE $1
          OR (oem_codes @> $2)
        LIMIT 5
      `, [
        `%${query}%`,
        JSON.stringify([{ code: query }])
      ]);

      return result.rows;
    } catch (error) {
      console.error('DB search error:', error);
      return [];
    }
  }

  async chat(userMessage, userId = 'anonymous', language = null) {
    const detectedLang = language || this.detectLanguage(userMessage);
    const systemPrompt = this.systemPrompts[detectedLang] || this.systemPrompts.es;

    // Search DB for filter context
    const filters = await this.searchFilterDB(userMessage);

    let context = '';
    if (filters.length > 0) {
      context = '\n\nFILTROS ENCONTRADOS EN DB:\n';
      filters.forEach(f => {
        context += `- SKU: ${f.sku}, Tipo: ${f.filter_type}, DUTY: ${f.duty}\n`;
      });
    }

    try {
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: systemPrompt + context
          },
          { role: 'user', content: userMessage }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.5,
        max_tokens: 500
      });

      return {
        message: completion.choices[0].message.content,
        language: detectedLang,
        filters: filters,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Groq error:', error);
      return {
        message: this.getErrorMessage(detectedLang),
        language: detectedLang,
        error: true
      };
    }
  }

  getErrorMessage(language) {
    const messages = {
      es: '❌ Error procesando tu consulta. Intenta nuevamente o contacta soporte@elimfilters.com',
      en: '❌ Error processing your request. Try again or contact support@elimfilters.com',
      pt: '❌ Erro ao processar sua consulta. Tente novamente ou contacte suporte@elimfilters.com'
    };
    return messages[language] || messages.es;
  }

  async close() {
    await this.db.end();
  }
}

module.exports = new ChatbotService();
