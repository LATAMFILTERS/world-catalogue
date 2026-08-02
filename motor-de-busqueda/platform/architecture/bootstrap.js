import { EdgeRouter } from './edge/router';
import { CDN } from './cdn';
import { RuntimeFederation } from './runtime/federation';
import { Orchestrator } from './orchestrator';
import { DataLayer } from './data/store';
import { Observability } from './observability';
import { BuildSystem } from './build';

export function bootstrapPlatform() {
  return {
    edge: new EdgeRouter(),
    cdn: CDN,
    runtime: new RuntimeFederation(),
    orchestrator: new Orchestrator(),
    data: new DataLayer(),
    observability: new Observability(),
    build: new BuildSystem()
  };
}
