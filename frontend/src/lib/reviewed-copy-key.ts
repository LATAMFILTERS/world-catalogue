export function reviewedCopyKey(text: string): string {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) hash = Math.imul(hash ^ text.charCodeAt(index), 16777619);
  return 'reviewedCopy.copy' + (hash >>> 0).toString(16) + '_' + text.length;
}
