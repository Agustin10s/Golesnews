/**
 * Global in-memory cache para las respuestas de la API de fútbol.
 * En Railway el proceso Node.js es persistente, por lo que este Map
 * sobrevive entre requests y evita repetir llamadas innecesarias.
 *
 * TTLs recomendados:
 *   live           →  60 s
 *   fixtures hoy   →  10 min
 *   fixtures prox  →  60 min
 *   standings      →  6 h
 *   scorers        →  6 h
 */

interface CacheEntry {
  value: unknown;
  expiresAt: number;
}

// eslint-disable-next-line no-var
declare global { var __apiCache: Map<string, CacheEntry> | undefined }

// Persiste en hot-reload (dev) y entre requests (prod)
const store: Map<string, CacheEntry> =
  globalThis.__apiCache ?? (globalThis.__apiCache = new Map());

export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number,
): Promise<T> {
  const hit = store.get(key);
  if (hit && hit.expiresAt > Date.now()) {
    return hit.value as T;
  }
  const value = await fetcher();
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}

export function cacheStats() {
  let valid = 0;
  const now = Date.now();
  for (const e of store.values()) if (e.expiresAt > now) valid++;
  return { total: store.size, valid };
}
