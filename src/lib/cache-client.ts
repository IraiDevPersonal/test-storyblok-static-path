export type CacheEntry<T> = {
  /** Valor cacheado. */
  value: T;
  /** Timestamp (ms) en el que el valor deja de ser válido. */
  expiresAtMs: number;
};

// Store global a nivel de módulo: todas las instancias comparten el mismo Map.
// Se usa un namespace por instancia para evitar colisiones entre consumidores.
const globalStore = new Map<string, CacheEntry<unknown>>();

export class MemoryCacheClient {
  /** Prefijo para separar claves de distintos consumidores dentro del store global. */
  private readonly namespace: string;

  /**
   * @param namespace Prefijo que se antepone a cada key (formato: "namespace:key").
   */
  constructor(namespace: string) {
    this.namespace = namespace;
  }

  get<T>(key: string): T | null {
    // Busca la entrada usando una clave calificada por namespace.
    const entry = globalStore.get(this.qualifyKey(key));
    if (!entry) return null;

    // Si expiró, se elimina del store y se trata como cache miss.
    if (Date.now() >= entry.expiresAtMs) {
      globalStore.delete(this.qualifyKey(key));
      return null;
    }

    // Si no expiró, devolvemos el valor tipado.
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    // Guarda el valor junto a su expiración absoluta.
    globalStore.set(this.qualifyKey(key), {
      value,
      expiresAtMs: Date.now() + ttlMs,
    });
  }

  private qualifyKey(key: string): string {
    // Evita colisiones: dos instancias pueden usar la misma key, pero distinto namespace.
    return `${this.namespace}:${key}`;
  }
}
