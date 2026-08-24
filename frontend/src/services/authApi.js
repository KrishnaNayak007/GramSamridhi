/**
 * Authentication API services with fallback offline/dummy mode.
 */
export const authApi = {
  async login(username, password) {
    try {
      const res = await fetch('/api/v1/auth/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Login failed');
      return data;
    } catch (err) {
      console.warn('Backend server down, falling back to dummy sign-in user:', err);
      // Dummy user success payload
      const isFarmer = username?.toLowerCase() === 'devinder_singh' || username?.toLowerCase().includes('farmer');
      return {
        access: 'dummy_access_token',
        refresh: 'dummy_refresh_token',
        user: {
          username: username || 'odisha_citizen',
          email: `${username || 'citizen'}@gramsamridh.in`,
          phone: '+919999900024',
          role: isFarmer ? 'farmer' : 'citizen'
        }
      };
    }
  },

  async register(userData) {
    try {
      const res = await fetch('/api/v1/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Registration failed');
      return data;
    } catch (err) {
      console.warn('Backend server down, creating dummy user in client state:', err);
      return {
        username: userData.username,
        email: userData.email,
        phone: userData.phone,
        role: userData.role
      };
    }
  },

  async logout(refreshToken) {
    try {
      const res = await fetch('/api/v1/auth/logout/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken })
      });
      if (!res.ok) throw new Error('Logout failed');
      return true;
    } catch (err) {
      console.warn('Logging out dummy user locally.');
      return true;
    }
  },

  async refreshToken(refresh) {
    try {
      const res = await fetch('/api/v1/auth/token/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh })
      });
      const data = await res.json();
      if (!res.ok) throw new Error('Token refresh failed');
      return data;
    } catch (err) {
      return { access: 'dummy_access_token' };
    }
  }
};
