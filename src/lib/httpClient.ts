export type HttpGetOptions = {
  timeoutMs: number;
  headers?: Record<string, string>;
};

// para el nombre de archivos .ts utiliza siempre kebab case y ademas refactoriza http client y cache client, que sean clases
// tambien que http cient pueda recibir en su constructor la baseUrl, que cache client pueda recibir una key para almacenar el cache y asi distinguirlo de otros caches que se almacenen, si el algo no estoy en lo correcto hazmelo saber

export type HttpClient = {
  getJson<T>(url: string, options: HttpGetOptions): Promise<T>;
};

export function createFetchHttpClient(): HttpClient {
  return {
    async getJson<T>(url: string, options: HttpGetOptions): Promise<T> {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs);

      try {
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            accept: "application/json",
            ...options.headers,
          },
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        return (await response.json()) as T;
      } finally {
        clearTimeout(timeoutId);
      }
    },
  };
}
