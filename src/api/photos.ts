

 import { MemoryCacheClient } from "../lib/cache-client";
 import { HttpClient } from "../lib/http-client";

export type PhotoModel = {
  albumId: number;
  id: number;
  title: string;
  thumbnailUrl: string;
  url: string;
};

const httpClient = new HttpClient("https://jsonplaceholder.typicode.com");
const cacheClient = new MemoryCacheClient("photos");

export async function fetchPhotos() {
  // Endpoint a consultar (se usa también como cache key).
  const url = "/photos?albumId=1";
  // Cantidad máxima de intentos antes de degradar a cache/[]
  const maxAttempts = 3;
  // Timeout de cada request HTTP. Si se supera, HttpClient aborta (AbortError).
  const timeoutMs = 6_000;
  // TTL del cache: cuánto tiempo consideramos válida la respuesta.
  const cacheTtlMs = 60_000;
  // En este caso la key es la URL, pero podría ser cualquier string estable.
  const cacheKey = url;

  // Fast-path: si hay datos en cache y no están expirados, evitamos la request.
  const cached = cacheClient.get<PhotoModel[]>(cacheKey);
  if (cached) return cached;

  // Si no hay cache, intentamos hasta maxAttempts con un backoff simple.
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Request principal: si funciona, guardamos en cache y devolvemos.
      const data = await httpClient.getJson<PhotoModel[]>(url, { timeoutMs });
      cacheClient.set(cacheKey, data, cacheTtlMs);
      return data;
    } catch (error) {
      // En el último intento, degradamos:
      // - si existe un valor cacheado (aunque sea viejo), lo devolvemos
      // - si no hay nada, devolvemos []
      if (attempt === maxAttempts) {
        const lastKnown = cacheClient.get<PhotoModel[]>(cacheKey);
        if (lastKnown) {
          console.warn("fetchPhotos failed; returning cached posts", {
            url,
            attempt,
            error,
          });
          return lastKnown;
        }

        console.warn("fetchPhotos failed; returning empty list", {
          url,
          attempt,
          error,
        });
        return [];
      }

      // Backoff: esperamos un poco antes de reintentar.
      // Esto reduce carga si el error es transitorio.
      await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
    }
  }

  return [];
}
