export type HttpGetOptions = {
  timeoutMs: number;
  headers?: Record<string, string>;
};

export class HttpClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string = "") {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  async getJson<T>(pathOrUrl: string, options: HttpGetOptions): Promise<T> {
    const url = this.toUrl(pathOrUrl);

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
  }

  private toUrl(pathOrUrl: string): string {
    if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
    if (!this.baseUrl) return pathOrUrl;
    if (pathOrUrl.startsWith("/")) return `${this.baseUrl}${pathOrUrl}`;
    return `${this.baseUrl}/${pathOrUrl}`;
  }
}
