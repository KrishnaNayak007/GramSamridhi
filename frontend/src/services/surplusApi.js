import { apiFetch } from '../shared/lib/api';

export const surplusApi = {
  async getAll() {
    const res = await apiFetch('/api/v1/surplus/listings/');
    return res.json();
  },

  async create(payload) {
    const res = await apiFetch('/api/v1/surplus/listings/', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async getCategories() {
    const res = await apiFetch('/api/v1/surplus/categories/');
    return res.json();
  },

  async claim(id) {
    const res = await apiFetch(`/api/v1/surplus/listings/${id}/events/`, {
      method: 'POST',
      body: JSON.stringify({ event_type: 'claim' })
    });
    return res.json();
  }
};
