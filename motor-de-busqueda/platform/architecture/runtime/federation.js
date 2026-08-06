export class RuntimeFederation {
  constructor() {
    this.modules = {};
  }

  async load(remote) {
    if (this.modules[remote]) return this.modules[remote];

    const module = await import(remote);
    this.modules[remote] = module;

    return module;
  }
}
