require('dotenv').config();
const Logger = require('./modules/logger');
const config = require('./modules/config');

const logger = new Logger('master');

console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║          ELIMFILTERS SUPER CATÁLOGO 2026                  ║
║          Consolidación Piloto - 1,000 Registros           ║
║                                                            ║
║  Sistema Autónomo con Checkpoints                         ║
║  Puede cerrar PowerShell durante la ejecución             ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);

logger.info('🚀 INICIANDO CONSOLIDACIÓN PILOTO');
logger.info(`Modo: ${config.PILOT_MODE ? 'PILOTO' : 'PRODUCCIÓN'}`);
logger.info(`Tamaño: ${config.PILOT_SIZE} registros`);
logger.info(`MongoDB: ${config.MONGO_URI ? '✅ Configurado' : '❌ NO CONFIGURADO'}`);
logger.info(`Logs: ./logs/`);
logger.info(`Checkpoints: ./checkpoints/\n`);

if (!config.MONGO_URI) {
  logger.error('ERROR: Variable MONGO_URI no configurada');
  logger.error('Ejecuta: $env:MONGO_URI = "tu_connection_string"');
  process.exit(1);
}

async function main() {
  const phases = [
    { name: 'FASE 1: Importar archivos', module: './modules/phase1-import' },
    { name: 'FASE 2: Crear cross-reference', module: './modules/phase2-cross-ref' },
    { name: 'FASE 3: Inicializar agentes', module: './modules/phase3-agents' },
    { name: 'FASE 4: Consolidar filtros', module: './modules/phase4-consolidate' },
    { name: 'FASE 5: Generar kits', module: './modules/phase5-kits' },
    { name: 'FASE 6: Generar reporte', module: './modules/phase6-report' }
  ];
  
  let completedPhases = 0;
  const startTime = Date.now();
  
  try {
    for (let i = 0; i < phases.length; i++) {
      const phase = phases[i];
      
      logger.info(`\n${'═'.repeat(60)}`);
      logger.info(`${phase.name} (${i + 1}/${phases.length})`);
      logger.info(`${'═'.repeat(60)}\n`);
      
      // Verificar checkpoint
      const checkpoint = logger.loadCheckpoint(`phase${i + 1}`);
      if (checkpoint) {
        logger.warn(`⏭️  Fase ${i + 1} ya completada`);
        logger.info(`Completada: ${checkpoint.timestamp}`);
        logger.info(`Tiempo: ${checkpoint.elapsed_seconds}s\n`);
        completedPhases++;
        continue;
      }
      
      // Ejecutar fase
      const phaseModule = require(phase.module);
      const result = await phaseModule.execute(config, logger);
      
      // Guardar checkpoint
      logger.saveCheckpoint(`phase${i + 1}`, result);
      completedPhases++;
    }
    
    const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(2);
    
    logger.info(`\n${'═'.repeat(60)}`);
    logger.success('🎉 CONSOLIDACIÓN PILOTO COMPLETADA');
    logger.info(`${'═'.repeat(60)}\n`);
    logger.info(`✅ Fases completadas: ${completedPhases}/${phases.length}`);
    logger.info(`⏱️  Tiempo total: ${totalTime} minutos`);
    logger.info(`📊 Reporte final: logs/final-report.json`);
    logger.info(`📝 Log completo: logs/master.log\n`);
    
    logger.info('Próximos pasos:');
    logger.info('1. Revisar reporte en logs/final-report.json');
    logger.info('2. Validar datos en MongoDB');
    logger.info('3. Si todo está correcto, escalar a producción\n');
    
  } catch (error) {
    logger.error('\n❌ ERROR CRÍTICO EN CONSOLIDACIÓN');
    logger.error(error.message);
    logger.error(error.stack);
    
    logger.info(`\n📋 Estado al fallar: ${completedPhases}/${phases.length} fases`);
    logger.info('💡 Puedes reiniciar el script y continuará desde el último checkpoint\n');
    
    process.exit(1);
  }
}

// Manejo de señales
process.on('SIGINT', () => {
  logger.warn('\n⚠️  INTERRUPCIÓN DETECTADA (Ctrl+C)');
  logger.info('Cerrando limpiamente...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.warn('\n⚠️  TERMINACIÓN DETECTADA');
  logger.info('Cerrando limpiamente...');
  process.exit(0);
});

// Ejecutar
main().catch(error => {
  logger.error('Error no capturado:', error);
  process.exit(1);
});
