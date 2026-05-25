import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

export function getApiBaseUrl() {
  const baseURL = api.defaults.baseURL || '/api';
  if (baseURL.startsWith('http')) {
    return baseURL.replace(/\/api\/?$/, '');
  }
  return '';
}

export function getStreamUrl(sessionId) {
  const baseURL = api.defaults.baseURL || '/api';
  if (baseURL.startsWith('http')) {
    return `${baseURL.replace(/\/$/, '')}/sessions/${sessionId}/stream`;
  }
  return `/api/sessions/${sessionId}/stream`;
}
