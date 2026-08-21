import { apiFetch } from '../shared/lib/api';

export const impactApi = {
  async getStats() {
    const res = await apiFetch('/api/v1/surplus/impact/');
    return res.json();
  }
};
