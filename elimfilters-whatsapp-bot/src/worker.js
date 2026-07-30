import { createLogger } from "./logger.js";
import { buildProductResponse, buildFallbackResponse, buildNoMatchResponse, buildGreetingResponse } from "./response-builder.js";
import { createNvidiaClient } from "./nvidia.js";
import { createWhatsAppClient } from "./whatsapp-client.js";

const logger = createLogger("WhatsApp-Bot");

export function createWorker({ config, db, knowledgeSystem }) {
  const nvidia = createNvidiaClient({ apiKey: config.nvidiaApiKey, model: config.nvidiaModel, pool: db.pool });
  const whatsappClient = createWhatsAppClient({
    phoneNumberId: config.whatsappPhoneNumberId,
    accessToken: config.whatsappAccessToken,
    businessAccountId: config.whatsappBusinessAccountId
  });

  // Entity extraction (NLU)
  const extractEntities = (messageText) => {
    const text = messageText.trim().toUpperCase();
    const entities = {};

    // Motor codes
    const motorMatch = text.match(/\b(DD|C|6BT|ISX|MP8|S)\d{1,4}\b/i);
    if (motorMatch) entities.motor_code = motorMatch[0];

    // Brands
    const brands = ['FREIGHTLINER', 'MACK', 'VOLVO', 'CUMMINS', 'DURAMAX', 'FORD', 'CHEVROLET', 'DODGE', 'RAM'];
    for (const brand of brands) {
      if (text.includes(brand)) {
        entities.brand = brand;
        break;
      }
    }

    // OEM codes
    const oemMatch = text.match(/[A-Z]\d{6,10}/);
    if (oemMatch) entities.oem_code = oemMatch[0];

    // SKU codes
    const skuMatch = text.match(/EL\d{3,10}/);
    if (skuMatch) entities.sku = skuMatch[0];

    // Greetings
    if (/^(hola|hi|hey|buenos|buenas)/i.test(text)) {
      entities.is_greeting = true;
    }

    return entities;
  };

  // State machine transition logic
  const transitionState = (currentState, extractedEntities, existingSession) => {
    // If we have brand + motor, we can search catalog
    if (extractedEntities.brand || extractedEntities.motor_code || extractedEntities.oem_code || extractedEntities.sku) {
      return 'catalog_search';
    }

    // If we have some entities but not enough, ask for more
    if (Object.keys(extractedEntities).length > 0 && !extractedEntities.is_greeting) {
      return 'entity_verification';
    }

    // Default to extraction
    return 'extraction';
  };

  // Execute catalog search
  const executeCatalogSearch = async (session, entities) => {
    let products = [];

    // Priority: motor → OEM code → competitor → SKU → keyword
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

      // Cleanup expired sessions every run
      const expiredCount = await db.cleanupExpiredSessions();
      if (expiredCount > 0) {
        logger.info(`Cleaned up ${expiredCount} expired sessions`, { action: 'cleanup' });
      }

      for (const job of jobs) {
        const logContext = { jobId: job.event_id, messageLength: job.message_text?.length || 0 };

        try {
          logger.info(`Processing message`, logContext, { messagePreview: job.message_text?.slice(0, 80) });

          // Get or create conversation session
          const session = await db.getOrCreateSession(job.phone_number_id, 'whatsapp');
          logContext.sessionId = session.session_id;

          // Extract entities from message
          const entities = extractEntities(job.message_text);
          logContext.extractedEntities = entities;

          // Determine next state
          const nextState = transitionState(session.state, entities, session);

          let responseText;

          // Handle greeting
          if (entities.is_greeting) {
            responseText = buildGreetingResponse();
            logger.info('Greeting detected', logContext);
            await db.logConversationTurn(session.session_id, {
              messageText: job.message_text,
              extractedEntities: entities,
              action: 'greeting',
              responseText
            });
          }
          // Handle catalog search
          else if (nextState === 'catalog_search') {
            const products = await executeCatalogSearch(session, entities);
            logContext.productsFound = products.length;

            if (products.length > 0) {
              // Update session with found product
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
              // No products found - provide helpful fallback
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
          }
          // Handle entity verification (need more info)
          else if (nextState === 'entity_verification') {
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
          }
          // Default extraction state
          else {
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

          // Send response via WhatsApp API
          if (config.dryRun) {
            logger.info(`DRY_RUN: Draft response`, logContext, { responseLength: responseText.length });
            await db.complete(job.event_id, `[DRY_RUN] ${responseText}`);
            continue;
          }

          try {
            await whatsappClient.sendMessage(job.phone_number_id, responseText);
            await db.complete(job.event_id, responseText);
            logger.info('Message sent successfully', logContext);
          } catch (sendErr) {
            logger.error('Failed to send WhatsApp message', logContext, { error: sendErr.message });
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
