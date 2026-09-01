import { apiFetch } from '../shared/lib/api';

export const agricultureApi = {
  async getPickups() {
    const res = await apiFetch('/api/v1/agriculture/pickups/');
    const data = await res.json();
    return Array.isArray(data) ? data : (data?.results || []);
  },

  async createPickup(payload) {
    const res = await apiFetch('/api/v1/agriculture/pickups/', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async getSchemes() {
    const res = await apiFetch('/api/v1/agriculture/schemes/');
    const data = await res.json();
    return Array.isArray(data) ? data : (data?.results || []);
  },

  async getComplaints() {
    const res = await apiFetch('/api/v1/agriculture/complaints/');
    const data = await res.json();
    return Array.isArray(data) ? data : (data?.results || []);
  },

  async createComplaint(payload) {
    const res = await apiFetch('/api/v1/agriculture/complaints/', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async askAssistant(prompt) {
    const res = await apiFetch('/api/v1/agriculture/ai-assistant/', {
      method: 'POST',
      body: JSON.stringify({ prompt })
    });
    return res.json();
  }
};
