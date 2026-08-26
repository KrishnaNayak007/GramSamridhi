import { apiFetch } from '../shared/lib/api';

export const agricultureApi = {
  async getPickups() {
    const res = await apiFetch('/api/v1/agriculture/pickups/');
    return res.json();
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
    return res.json();
  },

  async getComplaints() {
    const res = await apiFetch('/api/v1/agriculture/complaints/');
    return res.json();
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
