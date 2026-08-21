import { apiFetch } from '../shared/lib/api';

export const activityApi = {
  async getFeed() {
    const res = await apiFetch('/api/v1/activity/');
    return res.json();
  }
};
