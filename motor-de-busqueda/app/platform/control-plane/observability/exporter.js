class Observability {
  constructor() {
    this.events = [];
  }

  log(event, payload) {
    const record = {
      event,
      payload,
      timestamp: Date.now()
    };

    this.events.push(record);
    console.log('[OBS]', record);
  }

  export() {
    return JSON.stringify(this.events, null, 2);
  }
}

export const observability = new Observability();
