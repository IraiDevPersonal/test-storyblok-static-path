 import { createMemoryCacheClient } from "../lib/cacheClient";
 import { createFetchHttpClient } from "../lib/httpClient";

export type PostModel = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

const httpClient = createFetchHttpClient();
const cacheClient = createMemoryCacheClient();

export async function fetchPosts() {
  const url = "https://jsonplaceholder.typicode.com/posts?userId=8";
  const maxAttempts = 3;
  const timeoutMs = 6_000;
  const cacheTtlMs = 60_000;
  const cacheKey = `posts:${url}`;

  const cached = cacheClient.get<PostModel[]>(cacheKey);
  if (cached) return cached;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const data = await httpClient.getJson<PostModel[]>(url, { timeoutMs });
      cacheClient.set(cacheKey, data, cacheTtlMs);
      return data;
    } catch (error) {
      if (attempt === maxAttempts) {
        const lastKnown = cacheClient.get<PostModel[]>(cacheKey);
        if (lastKnown) {
          console.warn("fetchPosts failed; returning cached posts", {
            url,
            attempt,
            error,
          });
          return lastKnown;
        }

        console.warn("fetchPosts failed; returning empty list", {
          url,
          attempt,
          error,
        });
        return [];
      }

      await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
    }
  }

  return [];
}
