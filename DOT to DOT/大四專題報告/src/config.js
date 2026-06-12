/** API base URL — empty string uses same-origin /api (Vite dev proxy). */
export const API_URL = import.meta.env.VITE_API_URL || '';

export function api(path) {
  return `${API_URL}${path}`;
}
