import { SYSTEM_PROMPT, ELIMFILTERS_KNOWLEDGE } from "./knowledge.js";

export function createNvidiaClient({ apiKey, model, pool }) {
  return {
    async generateReply(userMessage) {
      let catalogContext = "";

      // 1. Live Catalog Lookup - Cliente busca por códigos OEM/Competitor que CONOCE
      // Objetivo: Traducir "Donaldson P552100" → "SKU EA10695"
      if (pool && typeof userMessage === "string") {
        const cleanedMsg = userMessage.trim().toUpperCase();
        const codeMatches = cleanedMsg.match(/\b[A-Z0-9\-]{3,15}\b/g) || [];

        if (codeMatches.length > 0) {
          try {
            const searchTerms = codeMatches.slice(0, 3);
            const foundMatches = [];

            for (const term of searchTerms) {
              // Búsqueda 1: Por SKU de ELIMFILTERS directo
              let res = await pool.query(
                `SELECT sku, duty, oem_codes, competitor_codes, height_mm, outer_diameter_mm
                 FROM elimfilters_catalog
                 WHERE UPPER(sku) = $1 OR UPPER(sku) LIKE $2
                 LIMIT 1`,
                [term, `%${term}%`]
              );

              if (res.rows.length > 0) {
                foundMatches.push({
                  matchType: 'ELIMFILTERS_SKU',
                  searchedTerm: term,
                  row: res.rows[0]
                });
                continue;
              }

              // Búsqueda 2: Por OEM codes (lo que el cliente REALMENTE conoce)
              res = await pool.query(
                `SELECT sku, duty, oem_codes, competitor_codes, height_mm, outer_diameter_mm
                 FROM elimfilters_catalog
                 WHERE oem_codes::text ILIKE $1
                 LIMIT 2`,
                [`%${term}%`]
              );

              if (res.rows.length > 0) {
                // Detectar CUÁL OEM code fue encontrado
                const matchedOemBrand = (Array.isArray(res.rows[0].oem_codes) ? res.rows[0].oem_codes : [])
                  .find(item => item.code && item.code.toUpperCase().includes(term))?.manufacturer || 'OEM';

                foundMatches.push({
                  matchType: 'OEM_CODE',
                  searchedTerm: term,
                  oemBrand: matchedOemBrand,
                  row: res.rows[0]
                });
                continue;
              }

              // Búsqueda 3: Por Competitor codes (cross-references)
              res = await pool.query(
                `SELECT sku, duty, oem_codes, competitor_codes, height_mm, outer_diameter_mm
                 FROM elimfilters_catalog
                 WHERE competitor_codes::text ILIKE $1
                 LIMIT 2`,
                [`%${term}%`]
              );

              if (res.rows.length > 0) {
                // Detectar CUÁL competitor code fue encontrado
                const matchedCompetitorBrand = (Array.isArray(res.rows[0].competitor_codes) ? res.rows[0].competitor_codes : [])
                  .find(item => item.code && item.code.toUpperCase().includes(term))?.manufacturer || 'Cross-reference';

                foundMatches.push({
                  matchType: 'COMPETITOR_CODE',
                  searchedTerm: term,
                  competitorBrand: matchedCompetitorBrand,
                  row: res.rows[0]
                });
              }
            }

            if (foundMatches.length > 0) {
              const itemsText = foundMatches.map(m => {
                const r = m.row;
                if (m.matchType === 'ELIMFILTERS_SKU') {
                  return `✓ SKU ELIMFILTERS: ${r.sku} (${r.duty || 'Standard'}) | Dimensiones: ${r.height_mm || 'N/A'}mm altura × ${r.outer_diameter_mm || 'N/A'}mm DE`;
                } else if (m.matchType === 'OEM_CODE') {
                  return `✓ Tu código ${m.oemBrand} ${m.searchedTerm} equivale a SKU ELIMFILTERS: ${r.sku} (${r.duty || 'Standard'}) | Dimensiones: ${r.height_mm || 'N/A'}mm × ${r.outer_diameter_mm || 'N/A'}mm`;
                } else {
                  return `✓ Tu código ${m.competitorBrand} ${m.searchedTerm} equivale a SKU ELIMFILTERS: ${r.sku} (${r.duty || 'Standard'}) | Dimensiones: ${r.height_mm || 'N/A'}mm × ${r.outer_diameter_mm || 'N/A'}mm`;
                }
              }).join("\n");
              catalogContext = `\n\n[BÚSQUEDA EN TIEMPO REAL - BASE DE DATOS CATÁLOGO ELIMFILTERS]:\n${itemsText}\n\nInstrucción: Menciona el SKU ELIMFILTERS equivalente y confirma la compatibilidad con el código que el usuario mencionó.`;
            }
          } catch (err) {
            console.error("[catalog-lookup-error]", err.message);
          }
        }
      }

      if (!apiKey) {
        if (catalogContext) {
          return `Estimado contacto, gracias por escribir a ELIMFILTERS. ${catalogContext.replace(/\n+/g, ' ')} Para más información visite https://part-search.elimfilters.com.`;
        }
        return `Estimado contacto, gracias por escribir a ELIMFILTERS. Para consultar compatibilidad y números de parte, por favor use nuestro buscador oficial: https://part-search.elimfilters.com. Para solicitudes de distribución, visite https://elimfilters.com.`;
      }

      const prompt = `${SYSTEM_PROMPT}\n\n[CONOCIMIENTO BASE OFICIAL]:\n${ELIMFILTERS_KNOWLEDGE}${catalogContext}\n\n[MENSAJE EN LINKEDIN]: "${userMessage}"\n\nResponde en español de manera ejecutiva y profesional:`;

      try {
        const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: model || "nvidia/nemotron-3-super-120b-a12b",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2,
            max_tokens: 300
          })
        });

        if (!res.ok) {
          throw new Error(`NVIDIA NIM API error status ${res.status}`);
        }

        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content?.trim();
        return reply || `Estimado contacto, gracias por su mensaje a ELIMFILTERS. Puede consultar nuestro catálogo en https://part-search.elimfilters.com.`;
      } catch (err) {
        console.error("[nvidia-nim]", err.message);
        return `Estimado contacto, gracias por su mensaje a ELIMFILTERS. Puede consultar nuestro catálogo en https://part-search.elimfilters.com.`;
      }
    }
  };
}
