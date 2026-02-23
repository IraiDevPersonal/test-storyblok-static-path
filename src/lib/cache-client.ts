export type CacheEntry<T> = {
  value: T;
  expiresAtMs: number;
};

const globalStore = new Map<string, CacheEntry<unknown>>();

export class MemoryCacheClient {
  private readonly namespace: string;

  constructor(namespace: string) {
    this.namespace = namespace;
  }

  get<T>(key: string): T | null {
    const entry = globalStore.get(this.qualifyKey(key));
    if (!entry) return null;

    if (Date.now() >= entry.expiresAtMs) {
      globalStore.delete(this.qualifyKey(key));
      return null;
    }

    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    globalStore.set(this.qualifyKey(key), {
      value,
      expiresAtMs: Date.now() + ttlMs,
    });
  }

  private qualifyKey(key: string): string {
    return `${this.namespace}:${key}`;
  }
}
