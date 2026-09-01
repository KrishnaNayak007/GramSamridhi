import { authApi } from '../../services/authApi';

/**
 * Standard fetch wrapper for real backend API calls.
 * Attaches Authorization header, handles JWT token refresh on 401,
 * and surfaces real responses and errors to the caller without faking data.
 */
export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('access_token');
  const headers = { ...(options.headers || {}) };
  const newOptions = { ...options };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  newOptions.headers = headers;

  let response = await fetch(url, newOptions);

  if (response.status === 401 && localStorage.getItem('refresh_token')) {
    try {
      const refresh = localStorage.getItem('refresh_token');
      const data = await authApi.refreshToken(refresh);
      if (data?.access) {
        localStorage.setItem('access_token', data.access);
        headers['Authorization'] = `Bearer ${data.access}`;
        newOptions.headers = headers;
        response = await fetch(url, newOptions);
      }
    } catch (err) {
      console.warn('Auto-token-refresh failed:', err);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.location.reload();
      return new Response(JSON.stringify({ detail: "Session expired. Please log in again." }), { status: 401 });
    }
  }

  return response;
}
