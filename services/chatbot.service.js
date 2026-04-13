const Groq = require('groq-sdk');
const { Pool } = require('pg');

class ChatbotService {
  constructor() {
    this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    this.db = new Pool({
      host: 'ballast.proxy.rlwy.net',
      port: 18263,
      database: 'railway',
      user: 'postgres',
      password: 'qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm',
      client_encoding: 'UTF8',
      ssl: { rejectUnauthorized: false }
    });
  }

  // Extract potential part codes from user message
  extractCodes(text) {
    // Match alphanumeric codes: P552100, LF3620, EL82100, 1R1808, etc.
    const matches = text.match(/\b([A-Z]{0,4}\d{3,8}[A-Z0-9]*)\b/gi) || [];
    return [...new Set(matches.map(c => c.toUpperCase()))];
  }

  // Search DB for filters by any code
  async searchByCode(code) {
    try {
      const result = await this.db.query(`
        SELECT
          sku, codigo_base, filter_type, duty,
          thread_size, height_mm, outer_diameter_mm,
          gasket_od_mm, micron_rating, technology,
          installation_type, nominal_efficiency,
          burst_pressure_psi, collapse_pressure_psi,
          oem_codes, competitor_codes, equipment_applications
        FROM elimfilters_catalog
        WHERE
          UPPER(sku) = $1
          OR UPPER(codigo_base) = $1
          OR EXISTS (
            SELECT 1 FROM jsonb_array_elements(oem_codes) e
            WHERE UPPER(e->>'code') = $1
               OR UPPER(e->>'partNumber') = $1
          )
          OR EXISTS (
            SELECT 1 FROM jsonb_array_elements(competitor_codes) e
            WHERE UPPER(e->>'code') = $1
          )
        LIMIT 3
      `, [code]);
      return result.rows;
    } catch (e) {
      console.error('DB search error:', e.message);
      return [];
    }
  }

  // Search by text (free search on filter_type, duty, etc.)
  async searchByText(query) {
    try {
      const result = await this.db.query(`
        SELECT sku, codigo_base, filter_type, duty,
               thread_size, height_mm, outer_diameter_mm
        FROM elimfilters_catalog
        WHERE filter_type ILIKE $1 OR duty ILIKE $1
        LIMIT 5
      `, [`%${query}%`]);
      return result.rows;
    } catch (e) {
      return [];
    }
  }

  // Format filter data for response
  formatFilterData(row, requestedInfo = 'basic') {
    const basic = {
      sku: row.sku,
      tipo: row.filter_type,
      duty: row.duty,
      rosca: row.thread_size || null,
      altura_mm: row.height_mm || null,
      diametro_ext_mm: row.outer_diameter_mm || null,
      micrones: row.micron_rating || null,
      tecnologia: row.technology || null
    };

    // Remove null values
    Object.keys(basic).forEach(k => basic[k] === null && delete basic[k]);

    const result = { ...basic };

    if (requestedInfo === 'oem' || requestedInfo === 'all') {
      result.oem_codes = (row.oem_codes || []).map(c =>
        `${c.manufacturer || ''} ${c.code || c.partNumber || ''}`.trim()
      ).filter(Boolean);
    }

    if (requestedInfo === 'crossref' || requestedInfo === 'all') {
      result.cross_references = (row.competitor_codes || []).map(c =>
        `${c.manufacturer || ''} ${c.code || ''}`.trim()
      ).filter(Boolean);
    }

    if (requestedInfo === 'equipment' || requestedInfo === 'all') {
      result.equipos = row.equipment_applications || [];
    }

    return result;
  }

  // Detect what type of info user wants
  detectRequestType(text) {
    const lower = text.toLowerCase();
    if (/oem|original equipment/i.test(lower)) return 'oem';
    if (/cross.?ref|equivalen|sustitu|compet|alternativ/i.test(lower)) return 'crossref';
    if (/equipo|aplic|vehic|maquin|motor|machine|equipment/i.test(lower)) return 'equipment';
    return 'basic';
  }

  async chat(userMessage, userId = 'anonymous') {
    const codes = this.extractCodes(userMessage);
    const requestType = this.detectRequestType(userMessage);

    // Search DB for all detected codes
    let filters = [];
    for (const code of codes) {
      const results = await this.searchByCode(code);
      filters.push(...results);
    }

    // Remove duplicates by SKU
    filters = filters.filter((f, i, arr) =>
      arr.findIndex(x => x.sku === f.sku) === i
    );

    // Build DB context for Groq
    let dbContext = '';
    if (filters.length > 0) {
      dbContext = '\n\nDATA FROM ELIMFILTERS DATABASE (USE ONLY THIS DATA - DO NOT INVENT):\n';
      filters.forEach(f => {
        dbContext += JSON.stringify(this.formatFilterData(f, requestType)) + '\n';
      });
    } else if (codes.length > 0) {
      dbContext = `\n\nNo se encontró ningún filtro ELIMFILTERS para los códigos: ${codes.join(', ')}`;
    }

    const systemPrompt = `You are ELIMFILTERS technical support assistant. ELIMFILTERS is an industrial filter brand.

CRITICAL RULES:
1. Respond in the EXACT SAME LANGUAGE as the user's message. If Spanish → respond in Spanish. If English → respond in English. If Portuguese → respond in Portuguese. NEVER change language.
2. ONLY use data provided in the DATABASE section below. NEVER invent SKUs, codes, or specs.
3. NEVER mention Donaldson, FRAM, Fleetguard, or any competitor brand as if they are us. They are cross-references only.
4. SKU format: always show as single code (e.g., EL82100), never split prefix.
5. Response format:
   - If filter found: "El equivalente ELIMFILTERS es [SKU]. Especificaciones: [specs from DB]"
   - If OEM/cross-ref requested: list them from DB only
   - If equipment requested: list from DB only
   - If not found: "No encontramos equivalente para [code]. Contacte soporte@elimfilters.com"
6. Keep responses concise. Max 5 lines unless customer asks for full details.
7. Never say "STANDARD", show it only if customer asks about variants.
${dbContext}`;

    try {
      const completion = await this.groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2,
        max_tokens: 400
      });

      return {
        message: completion.choices[0].message.content,
        filters,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Groq error:', error.message);
      return {
        message: '❌ Error procesando consulta. Intente nuevamente o contacte soporte@elimfilters.com',
        filters: [],
        error: true
      };
    }
  }

  async close() {
    await this.db.end();
  }
}

module.exports = new ChatbotService();
