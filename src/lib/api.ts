export function getApiBaseUrl(): string {
  const rawApiUrl = import.meta.env.VITE_API_URL || 'https://comprahorro-backend-1.onrender.com/api';
  return rawApiUrl.replace(/\/+$/, '');
}

export function getAhorrosApiUrl(): string {
  const baseUrl = getApiBaseUrl();
  return baseUrl.endsWith('/ahorros') ? baseUrl : `${baseUrl}/ahorros`;
}

export function buildAhorrosEndpoint(path: string): string {
  const normalizedPath = path.replace(/^\/+/, '');
  return `${getAhorrosApiUrl()}/${normalizedPath}`;
}
