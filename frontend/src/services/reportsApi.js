import { apiFetch } from '../shared/lib/api';

export const reportsApi = {
  async getAll() {
    const res = await apiFetch('/api/v1/reports/');
    const data = await res.json();
    return Array.isArray(data) ? data : (data?.results || []);
  },

  async create(payload) {
    const res = await apiFetch('/api/v1/reports/', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return res.json();
  }
};
