class StateGraph {
  constructor() {
    this.state = {};
    this.subscribers = [];
  }

  set(key, value) {
    this.state[key] = value;
    this.notify();
  }

  get(key) {
    return this.state[key];
  }

  subscribe(fn) {
    this.subscribers.push(fn);
  }

  notify() {
    this.subscribers.forEach(fn => fn(this.state));
  }
}

export const store = new StateGraph();
