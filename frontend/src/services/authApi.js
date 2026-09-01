/**
 * Authentication API services connecting to backend JWT auth endpoints.
 */
export const authApi = {
  async login(username, password) {
    const res = await fetch("/api/v1/auth/token/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    let data;
    try {
      data = await res.json();
    } catch (e) {
      data = { detail: "Server error occurred. Please try again." };
    }
    if (!res.ok) {
      const errorMsg = data.detail || data.non_field_errors?.[0] || (typeof data === 'object' ? Object.values(data)[0] : null) || "Invalid credentials or login failed.";
      throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    }
    return data;
  },

  async register(userData) {
    const res = await fetch("/api/v1/auth/register/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    let data;
    try {
      data = await res.json();
    } catch (e) {
      data = { detail: "Server error occurred during registration." };
    }
    if (!res.ok) {
      const errorMsg = data.detail || (typeof data === 'object' ? Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ') : null) || "Registration failed.";
      throw new Error(errorMsg);
    }
    return data;
  },

  async logout(refreshToken) {
    try {
      if (refreshToken) {
        await fetch("/api/v1/auth/logout/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh: refreshToken }),
        });
      }
      return true;
    } catch (err) {
      console.warn("Logout request failed on server:", err);
      return true;
    }
  },

  async refreshToken(refresh) {
    const res = await fetch("/api/v1/auth/token/refresh/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Token refresh failed");
    return data;
  },
};
