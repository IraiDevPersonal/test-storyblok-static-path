import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { HttpClient } from "./http-client";

describe("HttpClient", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.useRealTimers();
  });

  // --- URL CONSTRUCTION TESTS ---
  // Estos tests validan que el método privado toUrl() construye URLs correctamente,
  // probando a través de la API pública (getJson) para no romper encapsulamiento.

  it("construye la URL con baseUrl y path relativo", async () => {
    // Mockeamos fetch para que resuelva OK y devuelva JSON vacío.
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ ok: true }),
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const client = new HttpClient("https://api.example.com/");

    await client.getJson("/users", { timeoutMs: 1000 });

    // Verificamos que fetch fue llamado exactamente una vez.
    expect(fetchMock).toHaveBeenCalledTimes(1);
    // El primer argumento debe ser la URL construida: baseUrl + path.
    // fetchMock.mock.calls[0] es el array de llamadas a fetch.
    // fetchMock.mock.calls[0]?.[0] es el primer argumento de la primera llamada a fetch.
    // Es decir, la URL que se le pasó a fetch.
    // El operador ?. es para evitar errores si fetchMock no ha sido llamado.
    // fetchMock.mock.calls[0]?.[0][0] es el primer caracter de la URL.
    console.log("data del fetch", fetchMock.mock.calls)
    // en fetchMock.mock.calls se encuentra el array de llamadas a fetch.
    // por que es un array?
    // porque fetchMock.mock.calls es un array de arrays, donde cada subarray contiene los argumentos de una llamada a fetch.
    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://api.example.com/users");
  });

  it("si recibe una URL absoluta no aplica baseUrl", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ ok: true }),
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const client = new HttpClient("https://api.example.com");

    await client.getJson("https://other.example.com/ping", { timeoutMs: 1000 });

    // La URL debe quedar intacta, sin prepend del baseUrl.
    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://other.example.com/ping");
  });

  // --- HEADERS TESTS ---
  // Validan que siempre se envía accept: application/json y que se fusionan headers extra.

  it("envía accept application/json y mergea headers", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ ok: true }),
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const client = new HttpClient("https://api.example.com");

    await client.getJson("/users", {
      timeoutMs: 1000,
      headers: {
        authorization: "Bearer token",
      },
    });

    // El segundo argumento de fetch es el RequestInit con headers.
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined;
    expect(init?.headers).toEqual({
      accept: "application/json",
      authorization: "Bearer token",
    });
  });

  // --- ERROR HANDLING TESTS ---
  // Verifican que se lanzan errores cuando la response no es ok.

  it("lanza error cuando response.ok es false", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn(),
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const client = new HttpClient("https://api.example.com");

    // Usamos rejects.toThrow para promesas que deben fallar.
    await expect(client.getJson("/users", { timeoutMs: 1000 })).rejects.toThrow(
      "Request failed with status 500",
    );
  });

  // --- SUCCESS TESTS ---
  // Validan que el JSON se parsea y se devuelve con el tipo genérico.

  it("resuelve con el JSON parseado", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ id: 123 }),
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const client = new HttpClient("https://api.example.com");

    // El tipo genérico <{ id: number }> ayuda a TypeScript y al test.
    await expect(client.getJson<{ id: number }>("/user", { timeoutMs: 1000 })).resolves.toEqual({
      id: 123,
    });
  });

  // --- TIMEOUT/ABORT TESTS ---
  // Estos tests usan fake timers para simular el paso del tiempo sin esperar de verdad.
  // También mockean fetch para que escuche el evento 'abort' y rechace la promesa.

  it("aborta la request al pasar el timeout", async () => {
    vi.useFakeTimers(); // Controlamos el tiempo con Vitest.

    // Fetch devuelve una promesa que se queda colgada hasta que se dispare el abort.
    const fetchMock = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
      return new Promise((_resolve, reject) => {
        // Si la señal se dispara, rechazamos con AbortError.
        init?.signal?.addEventListener("abort", () => {
          reject(new DOMException("Aborted", "AbortError"));
        });
      });
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const client = new HttpClient("https://api.example.com");

    const promise = client.getJson("/slow", { timeoutMs: 10 });

    // Enganchamos la aserción inmediatamente para evitar rechazos no manejados.
    const assertion = expect(promise).rejects.toHaveProperty("name", "AbortError");

    // Avanzamos el tiempo más allá del timeout (10ms + 1ms extra).
    await vi.advanceTimersByTimeAsync(11);

    // Esperamos la aserción para que el test falle si no hubo AbortError.
    await assertion;
  });

  // --- RESOURCE CLEANUP TESTS ---
  // Verifican que los timers se limpian para evitar memory leaks.

  it("limpia el timeout cuando fetch resuelve", async () => {
    vi.useFakeTimers();

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ ok: true }),
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const client = new HttpClient("https://api.example.com");

    await client.getJson("/fast", { timeoutMs: 1000 });

    // No debe quedar ningún timer activo después de la request.
    expect(vi.getTimerCount()).toBe(0);
  });
});
