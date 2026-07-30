import { createInstagramClient } from "./instagram.js";
import { createNvidiaClient } from "./nvidia.js";

export function createWorker({ config, db, knowledgeSystem }) {
  const instagram = createInstagramClient({
    accessToken: config.metaAccessToken,
    instagramBusinessAccountId: config.instagramBusinessAccountId,
    graphApiVersion: config.metaGraphApiVersion
  });

  const nvidia = createNvidiaClient({ apiKey: config.nvidiaApiKey, model: config.nvidiaModel, pool: db.pool });

  return {
    async run() {
      const jobs = await db.claim(5);
      if (!jobs.length) return;

      for (const job of jobs) {
        try {
          console.log(`[Instagram Worker] Processing job ${job.event_id}: "${job.message_text.slice(0, 50)}..."`);

          // Buscar productos en la BD
          let products = [];
          const text = job.message_text.trim().toUpperCase();

          // Intentar búsqueda por código OEM (P552100, etc.)
          if (text.match(/^[A-Z]\d+$/)) {
            products = await db.searchByOemCode(text);
          }

          // Si no hay resultados, intentar por código de competidor
          if (!products.length && text.match(/^[A-Z]{2,}\d+$/)) {
            products = await db.searchByCompetitorCode(text);
          }

          // Si no hay resultados, intentar por SKU (EL82100, etc.)
          if (!products.length && text.match(/^EL\d+$/)) {
            const product = await db.searchBySku(text);
            if (product) products = [product];
          }

          // Si no hay resultados, búsqueda por palabra clave
          if (!products.length) {
            products = await db.searchByKeyword(text);
          }

          let replyText;
          if (products.length > 0) {
            // Construir respuesta técnica con productos encontrados
            const product = products[0];
            replyText = `✅ *Filtro ELIMFILTERS encontrado*\n\n` +
              `*SKU:* ${product.sku}\n` +
              `*Producto:* ${product.product_name}\n` +
              `*Tipo:* ${product.filter_type}\n`;

            if (product.oem_codes && product.oem_codes.length > 0) {
              replyText += `*Códigos OEM:* ${product.oem_codes.join(", ")}\n`;
            }

            if (product.competitor_codes && product.competitor_codes.length > 0) {
              replyText += `*Referencias:* ${product.competitor_codes.join(", ")}\n`;
            }

            if (product.description) {
              replyText += `*Descripción:* ${product.description}\n`;
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
            console.log(`[Instagram Worker] DRY_RUN=true: Draft reply for ${job.event_id} -> "${replyText}"`);
            await db.complete(job.event_id, `[DRY_RUN DRAFT] ${replyText}`);
            continue;
          }

          // Enviar por Instagram
          await instagram.sendMessage(job.from, replyText);
          await db.complete(job.event_id, replyText);
          console.log(`[Instagram Worker] Sent reply to ${job.from}`);
        } catch (err) {
          console.error(`[Instagram Worker] Error processing ${job.event_id}:`, err.message);
          await db.fail(job.event_id, err.message);
        }
      }
    }
  };
}
