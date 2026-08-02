import { bus } from '../bus/eventBus';

const registry = {};

export function registerModule(name, module) {
  registry[name] = module;
  bus.emit('module:registered', { name });
}

export function swapModule(name, newModule) {
  registry[name] = newModule;
  bus.emit('module:swapped', { name });
}

export function getModule(name) {
  return registry[name];
}
