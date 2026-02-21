import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

// 12 hours in milliseconds
const INACTIVITY_TIMEOUT = 12 * 60 * 60 * 1000;
const ACTIVITY_CHECK_INTERVAL = 60 * 1000; // Check every minute

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [appRole, setAppRole] = useState(null); // 'admin' | 'kelompok' | null
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const lastActivityRef = useRef(Date.now());
  const activityIntervalRef = useRef(null);

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

  // Update last activity time
  const updateActivity = useCallback(() => {
    if (user) {
      lastActivityRef.current = Date.now();
      localStorage.setItem('rukun_last_activity', Date.now().toString());
      console.log('[Auth] Activity updated');
    }
  }, [user]);

  // Check for inactivity
  const checkInactivity = useCallback(() => {
    if (!user) return;

    const lastActivity = parseInt(localStorage.getItem('rukun_last_activity') || Date.now().toString());
    const timeSinceLastActivity = Date.now() - lastActivity;

    console.log('[Auth] Inactivity check - Time since last activity:', Math.floor(timeSinceLastActivity / 1000 / 60), 'minutes');

    if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
      console.log('[Auth] User inactive for 12 hours - logging out');
      alert('Sesi Anda telah berakhir karena tidak ada aktivitas selama 12 jam. Silakan login kembali.');
      logout();
      window.location.href = '/login?reason=inactivity';
    }
  }, [user]);

  // Setup activity tracking
  useEffect(() => {
    if (!user) return;

    // Initialize last activity
    localStorage.setItem('rukun_last_activity', Date.now().toString());
    lastActivityRef.current = Date.now();

    // Track user activity events
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Check for inactivity every minute
    activityIntervalRef.current = setInterval(checkInactivity, ACTIVITY_CHECK_INTERVAL);

    console.log('[Auth] Activity tracking started');

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
      
      if (activityIntervalRef.current) {
        clearInterval(activityIntervalRef.current);
      }
      
      console.log('[Auth] Activity tracking stopped');
    };
  }, [user, updateActivity, checkInactivity]);

  // Check inactivity on app focus
  useEffect(() => {
    if (!user) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkInactivity();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, checkInactivity]);

  const login = async (username, password) => {
    setLoading(true);
    console.log('[Auth] Login attempt for user:', username);
    try {
      setError(null);

      // Call backend login endpoint
      const response = await client.post('/auth/login', {
        username,
        password,
      });

      console.log('[Auth] Login response:', { success: response.data?.success, hasToken: !!response.data?.data?.token, hasUser: !!response.data?.data?.user });

      if (response.data && response.data.success) {
        const { token: authToken, user: userData } = response.data.data;

        // Save token and user to localStorage
        localStorage.setItem('rukun_token', authToken);
        localStorage.setItem('rukun_user', JSON.stringify(userData));
        localStorage.setItem('rukun_last_activity', Date.now().toString());

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
    localStorage.removeItem('rukun_last_activity');
    setToken(null);
    setUser(null);
    setAppRole(null);
    delete client.defaults.headers.common['Authorization'];
    setError(null);
    
    // Clear activity interval
    if (activityIntervalRef.current) {
      clearInterval(activityIntervalRef.current);
    }
  };

  const isAdmin = appRole === 'admin';
  const isKelompok = appRole === 'kelompok';
  const isMitraKelompok = appRole === 'mitra_kelompok';
  const isRoleDetermined = appRole && appRole !== 'belum ditentukan' && appRole !== 'pending';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        appRole,
        isAdmin,
        isKelompok,
        isMitraKelompok,
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
