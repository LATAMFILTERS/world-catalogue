class EventBus {
  constructor() {
    this.events = {};
  }

  on(event, handler) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(handler);
  }

  emit(event, payload) {
    (this.events[event] || []).forEach(fn => fn(payload));
  }
}

export const bus = new EventBus();
