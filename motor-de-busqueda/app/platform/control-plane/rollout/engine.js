class RolloutEngine {
  constructor() {
    this.rollouts = {};
  }

  define(flag, percentage) {
    this.rollouts[flag] = percentage;
  }

  evaluate(flag, userId) {
    const pct = this.rollouts[flag] || 0;
    const hash = this.hash(userId);
    return hash % 100 < pct;
  }

  hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (h * 31 + str.charCodeAt(i)) % 100;
    }
    return h;
  }
}

export const rollout = new RolloutEngine();
