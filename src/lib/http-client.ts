export type HttpGetOptions = {
  /** Tiempo máximo en milisegundos antes de abortar la request. Si no se proporciona, no hay timeout. */
  timeoutMs?: number;
  /** Headers adicionales que se fusionan con los por defecto. */
  headers?: Record<string, string>;
};

export class HttpClient {
  /** URL base que se antepone a los paths relativos. Se limpia de trailing slash. */
  private readonly baseUrl: string;

  /**
   * Crea una instancia de HttpClient.
   * @param baseUrl URL base opcional. Si se pasa "https://api.example.com/" se guardará sin el slash final.
   */
  constructor(baseUrl: string = "") {
    // Elimina el slash final para evitar dobles slashes al concatenar.
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  /**
   * Hace una request GET y devuelve el body parseado como JSON.
   * @param pathOrUrl Path relativo ("/users") o URL absoluta ("https://api.example.com/ping").
   * @param options Opciones de la request, incluyendo timeout y headers adicionales.
   * @returns Promesa que resuelve con el JSON parseado o rechaza con Error/AbortError.
   */
  async getJson<T>(pathOrUrl: string, options: HttpGetOptions): Promise<T> {
    // Construye la URL final usando baseUrl si el path es relativo.
    const url = this.toUrl(pathOrUrl);

    // Si no se proporciona timeout, no se crea AbortController ni setTimeout.
    const controller = options.timeoutMs ? new AbortController() : undefined;
    const timeoutId = options.timeoutMs
      ? setTimeout(() => controller!.abort(), options.timeoutMs)
      : undefined;

    try {
      // Hacemos el fetch. La señal permite al navegador/node abortar la request si se dispara.
      const response = await fetch(url, {
        signal: controller?.signal,
        headers: {
          // Siempre pedimos JSON, pero permitimos sobreescribir o añadir headers.
          accept: "application/json",
          ...options.headers,
        },
      });

      // Si el status no está en el rango 200-299, lanzamos un error con el código.
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      // Parseamos el body como JSON y lo devolvemos con el tipo genérico T.
      return (await response.json()) as T;
    } finally {
      // Limpiamos el timeout solo si fue creado.
      if (timeoutId) clearTimeout(timeoutId);
    }
  }

  /**
   * Construye la URL final a partir de baseUrl y el path/URL proporcionado.
   * @param pathOrUrl Path relativo ("users", "/users") o URL absoluta ("https://example.com").
   * @returns URL completa lista para usar en fetch.
   */
  private toUrl(pathOrUrl: string): string {
    // Si ya es una URL absoluta (empieza con http:// o https://), la usamos tal cual.
    if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
    // Si no hay baseUrl, devolvemos el path tal cual (puede ser relativo al dominio actual).
    if (!this.baseUrl) return pathOrUrl;
    // Si el path empieza con "/", lo concatenamos sin añadir otro slash.
    if (pathOrUrl.startsWith("/")) return `${this.baseUrl}${pathOrUrl}`;
    // En cualquier otro caso, añadimos un slash entre baseUrl y path.
    return `${this.baseUrl}/${pathOrUrl}`;
  }
}
