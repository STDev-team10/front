const API_ORIGINS = ['http://localhost:8080', 'http://3.34.140.204:8080'] as const;

function buildUrl(origin: string, path: string) {
  return new URL(path, origin).toString();
}

export async function fetchWithApiFallback(path: string, init?: RequestInit): Promise<Response> {
  let lastError: unknown = null;

  for (const origin of API_ORIGINS) {
    try {
      return await fetch(buildUrl(origin, path), init);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('API 서버에 연결할 수 없어요.');
}
