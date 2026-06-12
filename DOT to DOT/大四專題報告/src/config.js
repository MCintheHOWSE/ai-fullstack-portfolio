/** API base URL — empty string uses same-origin /api (Vite dev proxy or production). */
export const API_URL = import.meta.env.VITE_API_URL || '';

/** Socket.io server — dev uses :3000; production uses same origin unless overridden. */
export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  API_URL ||
  (import.meta.env.DEV ? 'http://localhost:3000' : '');

export function api(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${normalized}`;
}

export function socketServerUrl() {
  if (SOCKET_URL) return SOCKET_URL;
  if (typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost:3000';
}
