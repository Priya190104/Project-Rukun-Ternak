import React, { createContext, useContext, useEffect, useState } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

// Backend API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [appRole, setAppRole] = useState(null); // 'admin' | 'kelompok' | null
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);

  // Initialize auth from localStorage token
  useEffect(() => {
    const savedToken = localStorage.getItem('rukun_token');
    const savedUser = localStorage.getItem('rukun_user');

    if (savedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(userData);
        setAppRole(userData.role);
        // Set token in axios headers
        client.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      } catch (err) {
        console.error('Failed to restore auth:', err);
        localStorage.removeItem('rukun_token');
        localStorage.removeItem('rukun_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      setError(null);
      setLoading(true);

      // Call backend login endpoint
      const response = await client.post(`${API_BASE_URL}/api/auth/login`, {
        username,
        password,
      });

      if (response.data && response.data.success) {
        const { token: authToken, user: userData } = response.data.data;

        // Save token and user to localStorage
        localStorage.setItem('rukun_token', authToken);
        localStorage.setItem('rukun_user', JSON.stringify(userData));

        // Update state
        setToken(authToken);
        setUser(userData);
        setAppRole(userData.role);

        // Set token in axios headers for future requests
        client.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

        return { success: true, user: userData };
      } else {
        throw new Error('Login failed');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('rukun_token');
    localStorage.removeItem('rukun_user');
    setToken(null);
    setUser(null);
    setAppRole(null);
    delete client.defaults.headers.common['Authorization'];
    setError(null);
  };

  const isAdmin = appRole === 'admin';
  const isKelompok = appRole === 'kelompok';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        appRole,
        isAdmin,
        isKelompok,
        token,
        error,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
