export class Orchestrator {
  deploy(service) {
    console.log('[DEPLOY]', service.name);

    return {
      status: 'deployed',
      region: service.region || 'global',
      version: service.version
    };
  }

  rollback(service) {
    console.log('[ROLLBACK]', service.name);
    return { status: 'rolled-back' };
  }
}
