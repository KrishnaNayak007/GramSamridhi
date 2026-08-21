import { apiFetch } from '../shared/lib/api';

export const settingsApi = {
  async getPreferences() {
    const res = await apiFetch('/api/v1/accounts/preferences/');
    return res.json();
  },

  async updatePreferences(payload) {
    const res = await apiFetch('/api/v1/accounts/preferences/', {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async changePassword(payload) {
    const res = await apiFetch('/api/v1/accounts/security/change-password/', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return res.json();
  }
};
