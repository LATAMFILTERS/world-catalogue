import { createWhatsAppClient } from "./whatsapp.js";
import { createNvidiaClient } from "./nvidia.js";

export function createWorker({ config, db, knowledgeSystem }) {
  const whatsapp = createWhatsAppClient({
    accessToken: config.metaAccessToken,
    phoneNumberId: config.whatsappPhoneNumberId,
    graphApiVersion: config.metaGraphApiVersion
  });

  const nvidia = createNvidiaClient({ apiKey: config.nvidiaApiKey, model: config.nvidiaModel, pool: db.pool });

  return {
    async run() {
      const jobs = await db.claim(5);
      if (!jobs.length) return;

      for (const job of jobs) {
        try {
          console.log(`[WhatsApp Worker] Processing job ${job.event_id}: "${job.message_text.slice(0, 50)}..."`);

          // Crear o actualizar sesión
          await db.createOrUpdateSession(job.from, 'whatsapp');

          // Recuperar historial de conversación para contexto
          const conversationHistory = await db.getConversationHistory(job.from, 'whatsapp', 10);
          const conversationContext = conversationHistory.length > 0
            ? `HISTORIAL DE CONVERSACIÓN ANTERIOR:\n${conversationHistory.map(h => `${h.role === 'user' ? 'USUARIO' : 'ASISTENTE'}: ${h.message}`).join('\n')}\n\nNUEVO MENSAJE DEL USUARIO:\n`
            : '';

          // Guardar mensaje del usuario en historial
          await db.saveConversation(job.from, 'whatsapp', 'user', job.message_text);

          // Buscar productos en la BD
          let products = [];
          const text = job.message_text.trim().toUpperCase();
          console.log(`[Worker] Processing message: "${text.slice(0, 80)}..."`);

          // Extraer códigos del mensaje
          const motorMatch = text.match(/\b(DD|C|6BT|ISX)\d{1,4}\b/i);  // Motor codes: DD60, C15, 6BT, ISX500
          const oemCodeMatch = text.match(/[A-Z]\d{3,10}/);
          const competitorCodeMatch = text.match(/[A-Z]{2,}\d{3,10}/);
          const skuMatch = text.match(/EL\d{3,10}/);

          console.log(`[Worker] Regex matches - Motor: ${motorMatch?.[0]}, OEM: ${oemCodeMatch?.[0]}, Competitor: ${competitorCodeMatch?.[0]}, SKU: ${skuMatch?.[0]}`);

          // Intentar búsqueda por motor PRIMERO (DD60, C15, 6BT, etc.) - más probable
          if (motorMatch) {
            console.log(`[Worker] Attempting motor search for: ${motorMatch[0]}`);
            products = await db.searchByMotor(motorMatch[0]);
          }

          // Si no hay resultados, intentar por código OEM (P552100, etc.)
          if (!products.length && oemCodeMatch) {
            console.log(`[Worker] Attempting OEM search for: ${oemCodeMatch[0]}`);
            products = await db.searchByOemCode(oemCodeMatch[0]);
          }

          // Si no hay resultados, intentar por código de competidor
          if (!products.length && competitorCodeMatch) {
            console.log(`[Worker] Attempting competitor search for: ${competitorCodeMatch[0]}`);
            products = await db.searchByCompetitorCode(competitorCodeMatch[0]);
          }

          // Si no hay resultados, intentar por SKU (EL82100, etc.)
          if (!products.length && skuMatch) {
            console.log(`[Worker] Attempting SKU search for: ${skuMatch[0]}`);
            const product = await db.searchBySku(skuMatch[0]);
            if (product) products = [product];
          }

          // Si no hay resultados, búsqueda por palabra clave
          if (!products.length) {
            console.log(`[Worker] Falling back to keyword search`);
            products = await db.searchByKeyword(text.slice(0, 50));
          }

          console.log(`[Worker] Search complete - found ${products.length} products`);

          let replyText;
          if (products.length > 0) {
            // Construir respuesta técnica profesional - Protección de Activos
            const product = products[0];

            // Extraer tecnología del nombre del producto (SYNTRAX, NANOFORCE, etc.)
            const techName = product.product_name?.match(/(SYNTRAX|NANOFORCE|MACROCORE|HYDROCORE|DRYCORE|MICROKAPPA)/)?.[1] || 'tecnología ELIMFILTERS';

            // Extraer homologación OEM si existe
            const oemCodes = product.oem_codes ?
              (Array.isArray(product.oem_codes) ?
                product.oem_codes.map(o => typeof o === 'object' ? o.code : o).join(', ') :
                String(product.oem_codes).replace(/[\[\]"']/g, '')) : '';

            replyText = `✅ *PROTECCIÓN DE ACTIVOS: RECOMENDACIÓN TÉCNICA*\n\n` +
              `*SKU ELIMFILTERS:* ${product.sku}\n` +
              `*Aplicación:* ${product.product_name}\n` +
              `*Tipo de filtración:* ${product.filter_type}\n`;

            if (oemCodes) {
              replyText += `*Homologación:* ${oemCodes}\n`;
            }

            replyText += `\n*¿POR QUÉ LO RECOMENDAMOS?*\n`;
            replyText += `Nuestra media filtrante patentada ${techName} está desarrollada bajo formulaciones avanzadas, con una relación Beta de 200/75/20. Esto significa que puede retener partículas de hasta 20 micrones con una eficiencia del 75%, asegurando:\n\n` +
              `• Reducción del desgarre abrasivo en componentes del motor\n` +
              `• Prolongación de la vida útil del activo\n` +
              `• Cumplimiento con normas ISO 16889 y especificaciones del fabricante\n\n`;

            if (product.description) {
              replyText += `*Especificación técnica:* ${product.description}\n\n`;
            }

            replyText += `*IMPORTANTE:* Esta recomendación se basa en especificaciones que exige el fabricante del motor. Verificar siempre el manual del fabricante para políticas de mantenimiento y reemplazo.\n\n` +
              `¿Necesitas detalles técnicos adicionales o cotización?`;
          } else {
            // Quick responses for greetings/common phrases (avoid NVIDIA delay)
            const greeting_patterns = [
              /^(hola|hi|hey|buenos días|buenas tardes|buenas noches|ola|oye|hey there)/i,
              /^(gracias|thank you|thanks)/i,
              /^(ayuda|help|soporte|support)/i
            ];

            const isGreeting = greeting_patterns.some(p => p.test(text));

            if (isGreeting) {
              console.log(`[Worker] Detected greeting, quick response`);
              replyText = `¡Hola! Bienvenido a ELIMFILTERS.\n\nPuedo ayudarte a encontrar filtros compatibles. Comparte:\n• Código OEM o modelo del filtro que usas\n• Marca/modelo de tu equipo (ej: Freightliner, Peterbilt)\n• Motor (ej: DD60, C13, Cummins)\n\n¿Cuál es tu consulta?`;
            } else {
              // Fallback a NVIDIA si no encuentra en BD
              const messageWithContext = conversationContext + job.message_text;
              if (knowledgeSystem && job.message_text) {
                const knowledgeResponse = await knowledgeSystem.getKnowledgeResponse(messageWithContext, job.event_id);
                if (knowledgeResponse.success && knowledgeResponse.answer) {
                  replyText = knowledgeResponse.answer;
                } else {
                  replyText = await nvidia.generateReply(messageWithContext);
                }
              } else {
                replyText = await nvidia.generateReply(messageWithContext);
              }
            }
          }

          if (config.dryRun) {
            console.log(`[WhatsApp Worker] DRY_RUN=true: Draft reply for ${job.event_id} -> "${replyText}"`);
            await db.complete(job.event_id, `[DRY_RUN DRAFT] ${replyText}`);
            continue;
          }

          // Enviar por WhatsApp
          await whatsapp.sendMessage(job.from, replyText);
          await db.complete(job.event_id, replyText);
          await db.saveConversation(job.from, 'whatsapp', 'assistant', replyText);
          console.log(`[WhatsApp Worker] Sent reply to ${job.from}`);
        } catch (err) {
          console.error(`[WhatsApp Worker] Error processing ${job.event_id}:`, err.message);
          await db.fail(job.event_id, err.message);
        }
      }
    }
  };
}
