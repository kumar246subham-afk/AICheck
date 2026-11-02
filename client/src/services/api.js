/**
 * AICheck API Client Helper
 * Resolves base API URL dynamically from VITE_API_URL or defaults to local Vite proxy (/api/v1)
 */

export const API_BASE_URL = (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim() !== '')
  ? import.meta.env.VITE_API_URL.replace(/\/+$/, '')
  : '/api/v1';

export function apiUrl(endpoint) {
  const clean = endpoint.replace(/^\/+/, '').replace(/^api\/v1\/?/, '');
  return `${API_BASE_URL}/${clean}`;
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export default {
  API_BASE_URL,
  apiUrl,
  getApiBaseUrl,
};
