import React, { useState } from 'react';
import { authApi } from '../../services/authApi';

export default function LoginPage({ onLoginSuccess, switchToSignup }) {
  const [username, setUsername] = useState('odisha_citizen');
  const [password, setPassword] = useState('citizen123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await authApi.login(username, password);
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user || { username }));
      onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg)',
      padding: '20px',
      fontFamily: 'var(--font-body)'
    }}>
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border-soft)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        width: '100%',
        maxWidth: '400px',
        padding: '30px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '24px',
            color: 'var(--ink-950)'
          }}>
            Swachsahyog
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ink-500)', marginTop: '5px' }}>
            Civic Waste & Circularity Platform
          </p>
        </div>

        {error && (
          <div style={{
            padding: '10px',
            borderRadius: '6px',
            backgroundColor: '#fff2f0',
            border: '1px solid #ffccc7',
            color: 'var(--red)',
            fontSize: '13px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-700)' }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg)',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink-700)' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg)',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px',
              borderRadius: '9px',
              border: 'none',
              backgroundColor: 'var(--green-700)',
              color: '#fff',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              marginTop: '10px',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = 'var(--green-900)'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'var(--green-700)'}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          fontSize: '13px',
          color: 'var(--ink-500)',
          borderTop: '1px solid var(--border-soft)',
          paddingTop: '15px',
          marginTop: '5px'
        }}>
          Don't have an account?{' '}
          <button
            onClick={switchToSignup}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--green-700)',
              fontWeight: '700',
              cursor: 'pointer',
              padding: 0
            }}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
