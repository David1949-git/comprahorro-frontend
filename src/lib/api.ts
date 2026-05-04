export function getApiBaseUrl(): string {
  const rawApiUrl = import.meta.env.VITE_API_URL || 'https://comprahorro-backend-1.onrender.com';
  return rawApiUrl.replace(/\/+$/, '');
}

export function getAhorrosApiUrl(): string {
  const baseUrl = getApiBaseUrl();
  const apiBaseUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
  return apiBaseUrl.endsWith('/ahorros') ? apiBaseUrl : `${apiBaseUrl}/ahorros`;
}

export function buildAhorrosEndpoint(path: string): string {
  const normalizedPath = path.replace(/^\/+/, '');
  return `${getAhorrosApiUrl()}/${normalizedPath}`;
}
