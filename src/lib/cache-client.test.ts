import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryCacheClient } from "./cache-client";

describe("MemoryCacheClient", () => {
  // Estos tests validan un cache en memoria con TTL (time-to-live).
  // La clase guarda valores en un Map global y usa Date.now() para decidir expiración.
  // Por eso, usamos fake timers y setSystemTime para controlar el tiempo sin esperar en la vida real.

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("devuelve null cuando no existe la key", () => {
    const cache = new MemoryCacheClient("test");

    // Si la key no está en el store, get debe devolver null.
    expect(cache.get("missing")).toBeNull();
  });

  it("guarda y recupera un valor antes de expirar", () => {
    const cache = new MemoryCacheClient("test");

    cache.set("user", { id: 1 }, 10_000);

    // Sin avanzar el tiempo, el valor aún no expira.
    expect(cache.get<{ id: number }>("user")).toEqual({ id: 1 });
  });

  it("devuelve null cuando la entrada está expirada", () => {
    const cache = new MemoryCacheClient("test");

    cache.set("token", "abc", 1_000);

    // Avanzamos el tiempo más allá del TTL.
    vi.advanceTimersByTime(1_001);

    expect(cache.get<string>("token")).toBeNull();
  });

  it("no choca entre namespaces aunque la key sea la misma", () => {
    // El store es global, pero qualifyKey aplica namespace:key.
    const cacheA = new MemoryCacheClient("a");
    const cacheB = new MemoryCacheClient("b");

    cacheA.set("shared", "value-a", 10_000);
    cacheB.set("shared", "value-b", 10_000);

    expect(cacheA.get<string>("shared")).toBe("value-a");
    expect(cacheB.get<string>("shared")).toBe("value-b");
  });

  it("si vuelves a setear la misma key, se actualiza valor y expiración", () => {
    const cache = new MemoryCacheClient("test");

    cache.set("k", "v1", 1_000);

    // Avanzamos el tiempo, pero aún no expira.
    vi.advanceTimersByTime(500);

    // Reescribimos con un TTL nuevo a partir del "ahora".
    cache.set("k", "v2", 2_000);

    expect(cache.get<string>("k")).toBe("v2");

    // Avanzamos 1.6s más (total 2.1s desde el primer set),
    // pero solo 1.6s desde el segundo set => aún debe existir.
    vi.advanceTimersByTime(1_600);
    expect(cache.get<string>("k")).toBe("v2");

    // Avanzamos hasta pasar el TTL del segundo set (2_000ms).
    vi.advanceTimersByTime(401);
    expect(cache.get<string>("k")).toBeNull();
  });
});
