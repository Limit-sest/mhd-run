export function getHash(source: string): number {
  let hash = 0;

  if (source.length == 0) return hash;

  for (let i = 0; i < source.length; i++) {
    const char = source.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return hash;
}
