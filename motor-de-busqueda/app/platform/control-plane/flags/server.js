class FeatureFlags {
  constructor() {
    this.flags = {
      home_redesign: true,
      new_stats: true,
      edge_render: false
    };
  }

  isEnabled(flag, context = {}) {
    return !!this.flags[flag];
  }

  set(flag, value) {
    this.flags[flag] = value;
  }

  getAll() {
    return this.flags;
  }
}

export const featureFlags = new FeatureFlags();
