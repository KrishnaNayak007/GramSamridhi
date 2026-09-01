import { apiFetch } from '../shared/lib/api';

export const chatApi = {
  sendMessage: async ({ message, persona = 'swachh', userId = 'guest_user', location = 'Bhubaneswar, Ward 24' }) => {
    try {
      const res = await apiFetch('/api/v1/chat/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          persona,
          user_id: userId,
          location,
        }),
      });
      return await res.json();
    } catch (err) {
      // Fallback try root /api/chat/
      try {
        const res2 = await apiFetch('/api/chat/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            persona,
            user_id: userId,
            location,
          }),
        });
        return await res2.json();
      } catch (err2) {
        console.error('Chat API Error:', err2);
        throw err2;
      }
    }
  },
};
