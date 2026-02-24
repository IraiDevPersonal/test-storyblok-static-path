import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Estos tests son unitarios: no hacen requests reales.
// Como fetchPosts crea instancias (httpClient, cacheClient) a nivel de módulo,
// mockeamos los módulos importados (HttpClient y MemoryCacheClient) ANTES de importar fetchPosts.

const getJsonMock = vi.fn();
const cacheGetMock = vi.fn();
const cacheSetMock = vi.fn();

vi.mock("../lib/http-client", () => {
  class HttpClientMock {
    // fetchPosts crea la instancia con new HttpClient(baseUrl)
    // pero en estos tests no necesitamos usar baseUrl.
    constructor(_baseUrl: string = "") {}

    // fetchPosts solo usa getJson, así que mockeamos ese método.
    getJson = getJsonMock;
  }

  return {
    HttpClient: HttpClientMock,
  };
});

vi.mock("../lib/cache-client", () => {
  class MemoryCacheClientMock {
    constructor(_namespace: string) {}

    // fetchPosts usa get para cache hit/miss y set para guardar el resultado.
    get = cacheGetMock;
    set = cacheSetMock;
  }

  return {
    MemoryCacheClient: MemoryCacheClientMock,
  };
});

async function importFetchPosts() {
  // Resetea el cache de módulos para que se re-ejecute la inicialización del módulo post.ts
  // (y por lo tanto se creen nuevas instancias mockeadas).
  vi.resetModules();
  const mod = await import("./post");
  return mod.fetchPosts as typeof mod.fetchPosts;
}

describe("fetchPosts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Por defecto, simulamos cache miss.
    cacheGetMock.mockReturnValue(null);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("si hay cache, devuelve la data sin llamar a http", async () => {
    const cached = [{ userId: 8, id: 1, title: "t", body: "b" }];
    cacheGetMock.mockReturnValueOnce(cached);

    const fetchPosts = await importFetchPosts();

    await expect(fetchPosts()).resolves.toEqual(cached);

    // Si el cache tiene data, no se intenta llamar a la API.
    expect(getJsonMock).not.toHaveBeenCalled();
    expect(cacheSetMock).not.toHaveBeenCalled();
  });

  it("si no hay cache y el primer intento funciona, guarda en cache y devuelve data", async () => {
    const apiData = [{ userId: 8, id: 10, title: "hello", body: "world" }];
    getJsonMock.mockResolvedValueOnce(apiData);

    const fetchPosts = await importFetchPosts();

    await expect(fetchPosts()).resolves.toEqual(apiData);

    // Se llama a getJson con la URL y el timeout hardcodeado en fetchPosts.
    expect(getJsonMock).toHaveBeenCalledWith("/posts?userId=8", { timeoutMs: 6000 });

    // Se guarda el resultado con TTL (60s) usando como key la URL.
    expect(cacheSetMock).toHaveBeenCalledWith("/posts?userId=8", apiData, 60000);
  });

  it("reintenta hasta 3 veces con backoff y si el 3er intento funciona, devuelve data", async () => {
    vi.useFakeTimers();

    const apiData = [{ userId: 8, id: 2, title: "ok", body: "ok" }];

    // 1er intento falla, 2do falla, 3er intento funciona.
    getJsonMock
      .mockRejectedValueOnce(new Error("network"))
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce(apiData);

    const fetchPosts = await importFetchPosts();

    const promise = fetchPosts();

    // fetchPosts espera 250ms después del 1er fallo y 500ms después del 2do.
    await vi.advanceTimersByTimeAsync(250);
    await vi.advanceTimersByTimeAsync(500);

    await expect(promise).resolves.toEqual(apiData);

    expect(getJsonMock).toHaveBeenCalledTimes(3);
    expect(cacheSetMock).toHaveBeenCalledWith("/posts?userId=8", apiData, 60000);
  });

  it("si fallan todos los intentos y hay cache al final, retorna el cache y hace warn", async () => {
    vi.useFakeTimers();

    const lastKnown = [{ userId: 8, id: 99, title: "cached", body: "cached" }];

    // Primer get (antes del loop) -> cache miss.
    // Get dentro del último intento -> lastKnown.
    cacheGetMock.mockReturnValueOnce(null).mockReturnValueOnce(lastKnown);

    getJsonMock
      .mockRejectedValueOnce(new Error("down"))
      .mockRejectedValueOnce(new Error("down"))
      .mockRejectedValueOnce(new Error("down"));

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const fetchPosts = await importFetchPosts();

    const promise = fetchPosts();

    await vi.runAllTimersAsync();

    await expect(promise).resolves.toEqual(lastKnown);

    expect(getJsonMock).toHaveBeenCalledTimes(3);
    expect(warnSpy).toHaveBeenCalledWith(
      "fetchPosts failed; returning cached posts",
      expect.objectContaining({
        url: "/posts?userId=8",
        attempt: 3,
        error: expect.anything(),
      }),
    );
  });

  it("si fallan todos los intentos y no hay cache, retorna [] y hace warn", async () => {
    vi.useFakeTimers();

    cacheGetMock.mockReturnValue(null);

    getJsonMock
      .mockRejectedValueOnce(new Error("down"))
      .mockRejectedValueOnce(new Error("down"))
      .mockRejectedValueOnce(new Error("down"));

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const fetchPosts = await importFetchPosts();

    const promise = fetchPosts();

    await vi.runAllTimersAsync();

    await expect(promise).resolves.toEqual([]);

    expect(getJsonMock).toHaveBeenCalledTimes(3);
    expect(warnSpy).toHaveBeenCalledWith(
      "fetchPosts failed; returning empty list",
      expect.objectContaining({
        url: "/posts?userId=8",
        attempt: 3,
        error: expect.anything(),
      }),
    );
  });
});
