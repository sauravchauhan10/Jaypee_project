// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, fetchMe } from '../services/auth.service';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // true while verifying stored token
  const [error, setError]     = useState(null);

  // ─── Restore session from localStorage on mount ──────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await fetchMe();
        setUser(data);
      } catch {
        // Token invalid / expired — clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  // ─── Login ───────────────────────────────────────────────────────────────────
  const login = useCallback(async (credentials) => {
    setError(null);
    const result = await loginUser(credentials);
    localStorage.setItem('token', result.data.token);
    localStorage.setItem('user', JSON.stringify(result.data.user));
    setUser(result.data.user);
    return result.data.user; // return so caller can redirect based on role
  }, []);

  // ─── Register ────────────────────────────────────────────────────────────────
  const register = useCallback(async (formData) => {
    setError(null);
    const result = await registerUser(formData);
    localStorage.setItem('token', result.data.token);
    localStorage.setItem('user', JSON.stringify(result.data.user));
    setUser(result.data.user);
    return result.data.user;
  }, []);

  // ─── Logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const value = { user, loading, error, setError, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
