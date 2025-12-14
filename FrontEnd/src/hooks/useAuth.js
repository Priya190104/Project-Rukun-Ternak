import React, { createContext, useContext, useEffect, useState } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [appRole, setAppRole] = useState(null); // 'admin' | 'kelompok' | null
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);

  // Initialize auth from localStorage on app load
  useEffect(() => {
    const savedToken = localStorage.getItem('rukun_token');
    const savedUser = localStorage.getItem('rukun_user');

    console.log('[Auth] Initializing from localStorage:', { token: !!savedToken, user: !!savedUser });

    if (savedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        // Set token in axios headers for API calls
        client.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        // Restore user state
        setToken(savedToken);
        setUser(userData);
        setAppRole(userData.role);
        console.log('[Auth] Session restored:', { userId: userData.id, role: userData.role });
      } catch (err) {
        console.error('[Auth] Failed to restore session:', err);
        localStorage.removeItem('rukun_token');
        localStorage.removeItem('rukun_user');
        delete client.defaults.headers.common['Authorization'];
      }
    } else if (savedToken) {
      // Token exists but user data missing - this is inconsistent, clear both
      console.warn('[Auth] Token exists but user data missing, clearing both');
      localStorage.removeItem('rukun_token');
      localStorage.removeItem('rukun_user');
      delete client.defaults.headers.common['Authorization'];
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    console.log('[Auth] Login attempt for user:', username);
    try {
      setError(null);

      // Call backend login endpoint
      const response = await client.post('/api/auth/login', {
        username,
        password,
      });

      console.log('[Auth] Login response:', { success: response.data?.success, hasToken: !!response.data?.data?.token, hasUser: !!response.data?.data?.user });

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

        console.log('[Auth] Login successful:', { userId: userData.id, role: userData.role });
        return { success: true, user: userData };
      } else {
        throw new Error('Login failed');
      }
    } catch (err) {
      console.error('[Auth] Login error:', { status: err.response?.status, message: err.message });
      const errorMsg = err.response?.data?.message || err.message || 'Login gagal';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('[Auth] Logout');
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
  const isRoleDetermined = appRole && appRole !== 'belum ditentukan' && appRole !== 'pending';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        appRole,
        isAdmin,
        isKelompok,
        isRoleDetermined,
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
