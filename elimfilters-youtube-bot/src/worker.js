import { createYouTubeClient } from "./youtube.js";
import { createNvidiaClient } from "./nvidia.js";

export function createWorker({ config, db, knowledgeSystem }) {
  const youtube = createYouTubeClient({
    apiKey: config.youtubeApiKey
  });

  const nvidia = createNvidiaClient({ apiKey: config.nvidiaApiKey, model: config.nvidiaModel, pool: db.pool });

  return {
    async run() {
      const jobs = await db.claim(5);
      if (!jobs.length) return;

      for (const job of jobs) {
        try {
          console.log(`[YouTube Worker] Processing job ${job.event_id}: "${job.message_text.slice(0, 50)}..."`);

          // Buscar productos en la BD
          let products = [];
          const text = job.message_text.trim().toUpperCase();
          console.log(`[Worker] Processing message: "${text.slice(0, 80)}..."`);

          // Extraer códigos del mensaje (permite mensajes como "P552100" o "Donaldson P552100")
          const oemCodeMatch = text.match(/[A-Z]\d{3,10}/);
          const competitorCodeMatch = text.match(/[A-Z]{2,}\d{3,10}/);
          const skuMatch = text.match(/EL\d{3,10}/);

          console.log(`[Worker] Regex matches - OEM: ${oemCodeMatch?.[0]}, Competitor: ${competitorCodeMatch?.[0]}, SKU: ${skuMatch?.[0]}`);

          // Intentar búsqueda por código OEM (P552100, etc.)
          if (oemCodeMatch) {
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

          // Si aún sin resultados, buscar por motor (DD60, 6BT, etc.)
          if (!products.length) {
            console.log(`[Worker] Attempting motor/application search`);
            products = await db.searchByMotor(text.slice(0, 50));
          }

          console.log(`[Worker] Search complete - found ${products.length} products`);

          let replyText;
          if (products.length > 0) {
            // Construir respuesta técnica con productos encontrados
            const product = products[0];
            replyText = `✅ Filtro ELIMFILTERS encontrado\n\n` +
              `SKU: ${product.sku}\n` +
              `Producto: ${product.product_name}\n` +
              `Tipo: ${product.filter_type}\n`;

            if (product.oem_codes && product.oem_codes.length > 0) {
              replyText += `Códigos OEM: ${product.oem_codes.join(", ")}\n`;
            }

            if (product.competitor_codes && product.competitor_codes.length > 0) {
              replyText += `Referencias: ${product.competitor_codes.join(", ")}\n`;
            }

            if (product.description) {
              replyText += `Descripción: ${product.description}\n`;
            }

            replyText += `\n¿Necesitas más información técnica? Contáctanos.`;
          } else {
            // Fallback a NVIDIA si no encuentra en BD
            if (knowledgeSystem && job.message_text) {
              const knowledgeResponse = await knowledgeSystem.getKnowledgeResponse(job.message_text, job.event_id);
              if (knowledgeResponse.success && knowledgeResponse.answer) {
                replyText = knowledgeResponse.answer;
              } else {
                replyText = await nvidia.generateReply(job.message_text);
              }
            } else {
              replyText = await nvidia.generateReply(job.message_text);
            }
          }

          if (config.dryRun) {
            console.log(`[YouTube Worker] DRY_RUN=true: Draft reply for ${job.event_id} -> "${replyText}"`);
            await db.complete(job.event_id, `[DRY_RUN DRAFT] ${replyText}`);
            continue;
          }

          // Enviar por YouTube
          await youtube.replyToComment(job.event_id, replyText);
          await db.complete(job.event_id, replyText);
          console.log(`[YouTube Worker] Sent reply to comment ${job.event_id}`);
        } catch (err) {
          console.error(`[YouTube Worker] Error processing ${job.event_id}:`, err.message);
          await db.fail(job.event_id, err.message);
        }
      }
    }
  };
}
