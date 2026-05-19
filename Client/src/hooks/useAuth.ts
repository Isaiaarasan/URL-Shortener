import { useState, useEffect } from 'react';

export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

const API_URL = import.meta.env.PROD 
  ? 'https://url-shortener-78wi.onrender.com/api' 
  : 'http://localhost:5000/api';

export const useAuth = (showToast: (msg: string, type?: 'success' | 'error') => void) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Load and validate token on init
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('linksnap_token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const res = await fetch(`${API_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });
          const data = await res.json();
          if (res.ok && data.success) {
            setUser(data.data.user);
          } else {
            localStorage.removeItem('linksnap_token');
            setToken(null);
          }
        } catch (error) {
          console.error("Auth validation failed", error);
        }
      }
      setAuthLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('linksnap_token', data.data.token);
        setToken(data.data.token);
        setUser(data.data.user);
        showToast('Welcome to LinkSnap!', 'success');
        window.location.hash = '#/dashboard';
        return true;
      } else {
        showToast(data.message || 'Login failed', 'error');
        return false;
      }
    } catch (err) {
      showToast('Network error, login failed', 'error');
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('linksnap_token', data.data.token);
        setToken(data.data.token);
        setUser(data.data.user);
        showToast('Account registered successfully!', 'success');
        window.location.hash = '#/dashboard';
        return true;
      } else {
        showToast(data.message || 'Signup failed', 'error');
        return false;
      }
    } catch (err) {
      showToast('Network error, signup failed', 'error');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('linksnap_token');
    setToken(null);
    setUser(null);
    showToast('Logged out successfully', 'success');
    window.location.hash = '#/';
  };

  return {
    user,
    token,
    authLoading,
    login,
    signup,
    logout
  };
};
