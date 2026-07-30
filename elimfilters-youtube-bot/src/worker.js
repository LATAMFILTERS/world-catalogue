import { createLogger } from "./logger.js";
import { buildProductResponse, buildFallbackResponse, buildNoMatchResponse, buildGreetingResponse } from "./response-builder.js";
import { createYoutubeClient } from "./youtube-client.js";
import { createNvidiaClient } from "./nvidia.js";

const logger = createLogger("YouTube-Bot");

export function createWorker({ config, db, knowledgeSystem }) {
  const youtubeClient = createYoutubeClient({ channelId: config.youtubeChannelId, apiKey: config.youtubeApiKey });
  const nvidia = createNvidiaClient({ apiKey: config.nvidiaApiKey, model: config.nvidiaModel, pool: db.pool });

  const extractEntities = (messageText) => {
    const text = messageText.trim().toUpperCase();
    const entities = {};

    const motorMatch = text.match(/\b(DD|C|6BT|ISX|MP8|S)\d{1,4}\b/i);
    if (motorMatch) entities.motor_code = motorMatch[0];

    const brands = ['FREIGHTLINER', 'MACK', 'VOLVO', 'CUMMINS', 'DURAMAX', 'FORD', 'CHEVROLET', 'DODGE', 'RAM'];
    for (const brand of brands) {
      if (text.includes(brand)) {
        entities.brand = brand;
        break;
      }
    }

    const oemMatch = text.match(/[A-Z]\d{6,10}/);
    if (oemMatch) entities.oem_code = oemMatch[0];

    const skuMatch = text.match(/EL\d{3,10}/);
    if (skuMatch) entities.sku = skuMatch[0];

    if (/^(hola|hi|hey|buenos|buenas)/i.test(text)) {
      entities.is_greeting = true;
    }

    return entities;
  };

  const transitionState = (currentState, extractedEntities) => {
    if (extractedEntities.brand || extractedEntities.motor_code || extractedEntities.oem_code || extractedEntities.sku) {
      return 'catalog_search';
    }
    if (Object.keys(extractedEntities).length > 0 && !extractedEntities.is_greeting) {
      return 'entity_verification';
    }
    return 'extraction';
  };

  const executeCatalogSearch = async (session, entities) => {
    let products = [];

    if (entities.motor_code) {
      logger.debug('Searching by motor', { motor: entities.motor_code, sessionId: session.session_id });
      products = await db.searchByMotor(entities.motor_code);
    }

    if (!products.length && entities.oem_code) {
      logger.debug('Searching by OEM code', { oemCode: entities.oem_code, sessionId: session.session_id });
      products = await db.searchByOemCode(entities.oem_code);
    }

    if (!products.length && entities.sku) {
      logger.debug('Searching by SKU', { sku: entities.sku, sessionId: session.session_id });
      const product = await db.searchBySku(entities.sku);
      if (product) products = [product];
    }

    if (!products.length && (entities.brand || entities.motor_code)) {
      logger.debug('Searching by keyword', { keyword: entities.brand || entities.motor_code, sessionId: session.session_id });
      const keyword = `${entities.brand || ''} ${entities.motor_code || ''}`.trim();
      products = await db.searchByKeyword(keyword);
    }

    return products;
  };

  return {
    async run() {
      const jobs = await db.claim(5);
      if (!jobs.length) return;

      const expiredCount = await db.cleanupExpiredSessions();
      if (expiredCount > 0) {
        logger.info(`Cleaned up ${expiredCount} expired sessions`, { action: 'cleanup' });
      }

      for (const job of jobs) {
        const logContext = { jobId: job.event_id, messageLength: job.message_text?.length || 0 };

        try {
          logger.info(`Processing message`, logContext, { messagePreview: job.message_text?.slice(0, 80) });

          const session = await db.getOrCreateSession(job.author_channel_id || job.author_id, 'youtube');
          logContext.sessionId = session.session_id;

          const entities = extractEntities(job.message_text);
          logContext.extractedEntities = entities;

          const nextState = transitionState(session.state, entities);

          let responseText;

          if (entities.is_greeting) {
            responseText = buildGreetingResponse();
            logger.info('Greeting detected', logContext);
            await db.logConversationTurn(session.session_id, {
              messageText: job.message_text,
              extractedEntities: entities,
              action: 'greeting',
              responseText
            });
          } else if (nextState === 'catalog_search') {
            const products = await executeCatalogSearch(session, entities);
            logContext.productsFound = products.length;

            if (products.length > 0) {
              await db.updateSession(session.session_id, {
                state: 'response',
                brand: entities.brand || session.brand,
                motor_code: entities.motor_code || session.motor_code,
                last_recommended_sku: products[0].sku,
                extracted_entities: { ...session.extracted_entities, ...entities }
              });

              responseText = buildProductResponse(products[0], {
                brand: entities.brand || session.brand,
                motor_code: entities.motor_code || session.motor_code
              });

              logger.info('Product found and recommended', logContext, { sku: products[0].sku });
              await db.logConversationTurn(session.session_id, {
                messageText: job.message_text,
                extractedEntities: entities,
                action: 'product_found',
                responseText
              });
            } else {
              responseText = buildNoMatchResponse({
                brand: entities.brand || session.brand,
                motor_code: entities.motor_code || session.motor_code
              });

              await db.updateSession(session.session_id, {
                state: 'no_match',
                extracted_entities: { ...session.extracted_entities, ...entities }
              });

              logger.warn('No products found', logContext);
              await db.logConversationTurn(session.session_id, {
                messageText: job.message_text,
                extractedEntities: entities,
                action: 'no_match',
                responseText
              });
            }
          } else if (nextState === 'entity_verification') {
            responseText = buildFallbackResponse({
              brand: entities.brand || session.brand,
              motor_code: entities.motor_code || session.motor_code
            });

            await db.updateSession(session.session_id, {
              state: 'entity_verification',
              extracted_entities: { ...session.extracted_entities, ...entities }
            });

            logger.info('Requesting entity verification', logContext);
            await db.logConversationTurn(session.session_id, {
              messageText: job.message_text,
              extractedEntities: entities,
              action: 'ask_for_details',
              responseText
            });
          } else {
            responseText = buildFallbackResponse({
              brand: session.brand,
              motor_code: session.motor_code
            });

            await db.updateSession(session.session_id, {
              state: 'extraction',
              extracted_entities: { ...session.extracted_entities, ...entities }
            });

            logger.info('Initiating extraction', logContext);
            await db.logConversationTurn(session.session_id, {
              messageText: job.message_text,
              extractedEntities: entities,
              action: 'extract_entities',
              responseText
            });
          }

          if (config.dryRun) {
            logger.info(`DRY_RUN: Draft response`, logContext, { responseLength: responseText.length });
            await db.complete(job.event_id, `[DRY_RUN] ${responseText}`);
            continue;
          }

          try {
            await youtubeClient.sendMessage(job.video_id, responseText);
            await db.complete(job.event_id, responseText);
            logger.info('Message sent successfully', logContext);
          } catch (sendErr) {
            logger.error('Failed to send YouTube comment', logContext, { error: sendErr.message });
            await db.fail(job.event_id, `Send failed: ${sendErr.message}`);
            throw sendErr;
          }
        } catch (err) {
          logger.logError(logContext, err, { stage: 'processing' });
          await db.fail(job.event_id, err.message);
        }
      }
    }
  };
}
