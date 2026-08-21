import { apiFetch } from '../shared/lib/api';

export const incidentsApi = {
  async getAll() {
    const res = await apiFetch('/api/v1/incidents/');
    return res.json();
  },

  async get(id) {
    const res = await apiFetch(`/api/v1/incidents/${id}/`);
    return res.json();
  },

  async assign(id, teamName) {
    const res = await apiFetch(`/api/v1/incidents/${id}/assign/`, {
      method: 'POST',
      body: JSON.stringify({ team_name: teamName })
    });
    return res.json();
  },

  async updateStatus(id, nextStatus) {
    const res = await apiFetch(`/api/v1/incidents/${id}/status/`, {
      method: 'POST',
      body: JSON.stringify({ status: nextStatus })
    });
    return res.json();
  }
};
