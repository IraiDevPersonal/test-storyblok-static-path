export type CacheEntry<T> = {
  value: T;
  expiresAtMs: number;
};

export type CacheClient = {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T, ttlMs: number): void;
};

export function createMemoryCacheClient(): CacheClient {
  const store = new Map<string, CacheEntry<unknown>>();

  return {
    get<T>(key: string): T | null {
      const entry = store.get(key);
      if (!entry) return null;
      if (Date.now() >= entry.expiresAtMs) {
        store.delete(key);
        return null;
      }
      return entry.value as T;
    },
    set<T>(key: string, value: T, ttlMs: number): void {
      store.set(key, {
        value,
        expiresAtMs: Date.now() + ttlMs,
      });
    },
  };
}
