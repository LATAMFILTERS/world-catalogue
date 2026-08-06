export class Observability {
  log(event, payload) {
    console.log(JSON.stringify({
      event,
      payload,
      ts: Date.now()
    }));
  }
}
