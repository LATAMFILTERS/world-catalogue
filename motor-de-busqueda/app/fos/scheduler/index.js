class Scheduler {
  constructor() {
    this.queue = [];
  }

  schedule(task, priority = 1) {
    this.queue.push({ task, priority });
    this.queue.sort((a, b) => b.priority - a.priority);
  }

  run() {
    while (this.queue.length) {
      const job = this.queue.shift();
      job.task();
    }
  }
}

export const scheduler = new Scheduler();
