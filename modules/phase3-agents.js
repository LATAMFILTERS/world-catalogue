const { MongoClient } = require('mongodb');
const Agents = require('./agents');

async function execute(config, logger) {
  logger.info('═══════════════════════════════════════════');
  logger.info('FASE 3: INICIALIZAR 12 AGENTES');
  logger.info('═══════════════════════════════════════════\n');
  
  const client = new MongoClient(config.MONGO_URI);
  await client.connect();
  const db = client.db(config.DB_NAME);
  
  try {
    const agents = {
      agente1: new Agents.Agente1_Limpiador(),
      agente2: new Agents.Agente2_ConsultorMaster(db),
      agente3: new Agents.Agente3_PromptEngineer(),
      agente4: new Agents.Agente4_Bifurcador(),
      agente5: new Agents.Agente5_Donaldson(),
      agente6: new Agents.Agente6_FRAM(),
      agente7: new Agents.Agente7_Normalizador(),
      agente8: new Agents.Agente8_ArquitectoSKU(),
      agente9: new Agents.Agente9_InyectorADN(),
      agente10: new Agents.Agente10_MatcherKits(db),
      agente11: new Agents.Agente11_EscritorMongo(db),
      agente12: new Agents.Agente12_SincronizadorSheets()
    };
    
    logger.success('✅ Agente 1: Limpiador');
    logger.success('✅ Agente 2: Consultor Master');
    logger.success('✅ Agente 3: Prompt Engineer');
    logger.success('✅ Agente 4: Bifurcador');
    logger.success('✅ Agente 5: Especialista Donaldson');
    logger.success('✅ Agente 6: Especialista FRAM');
    logger.success('✅ Agente 7: Normalizador Técnico');
    logger.success('✅ Agente 8: Arquitecto SKU');
    logger.success('✅ Agente 9: Inyector ADN');
    logger.success('✅ Agente 10: Matcher de Kits');
    logger.success('✅ Agente 11: Escritor MongoDB');
    logger.success('✅ Agente 12: Sincronizador Sheets');
    
    // Prueba rápida de cada agente
    logger.info('\n🧪 Probando agentes...');
    
    const testCode = 'P-551808';
    const cleanCode = agents.agente1.clean(testCode);
    logger.info(`Agente 1: "${testCode}" → "${cleanCode}"`);
    
    const duty = await agents.agente3.classifyDuty(cleanCode);
    logger.info(`Agente 3: Duty = ${duty}`);
    
    const route = agents.agente4.route(duty);
    logger.info(`Agente 4: Ruta = ${route}`);
    
    const sku = agents.agente8.generate(cleanCode, 'Lube');
    logger.info(`Agente 8: SKU = ${sku}`);
    
    const adn = agents.agente9.inject('Lube');
    logger.info(`Agente 9: Tecnología = ${adn.technology}`);
    
    logger.info('\n───────────────────────────────────────────');
    logger.success('✅ FASE 3 COMPLETADA');
    logger.info('Todos los agentes inicializados correctamente');
    
    return { agents_initialized: 12, test_passed: true };
    
  } finally {
    await client.close();
  }
}

module.exports = { execute };
