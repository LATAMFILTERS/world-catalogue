// Counts the language menus currently mounted, so the page-level fallback menu
// (GlobalLanguageMenu) only appears on pages whose own header does not have one.

let count = 0;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

/** Called by a mounted menu; returns the cleanup. */
export function registerLanguageMenu(): () => void {
  count += 1;
  notify();
  return () => {
    count -= 1;
    notify();
  };
}

export const languageMenuCount = () => count;

export function subscribeLanguageMenus(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
