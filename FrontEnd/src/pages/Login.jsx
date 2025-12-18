import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppLogo from '../components/branding/AppLogo';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // If already logged in, redirect to the correct area instead of showing the "Sudah Masuk" card
  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') {
        navigate('/dashboard', { replace: true });
      } else if (user.role === 'kelompok') {
        navigate('/client', { replace: true });
      }
    }
  }, [loading, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    const result = await login(username, password);
    if (result.success) {
      // Redirect based on role
      if (result.user.role === 'admin') {
        navigate('/dashboard');
      } else if (result.user.role === 'kelompok') {
        navigate('/client');
      }
    } else {
      // Show specific error message for invalid credentials
      setLoginError(result.error?.includes('401') || result.error?.includes('Invalid') 
        ? 'Username atau password salah.' 
        : (result.error || 'Login gagal'));
    }
    setIsLoggingIn(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <AppLogo size="3xl" variant="icon" className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Rukun Ternak</h1>
          <p className="text-gray-600 mt-2 text-sm">Kelola data ternak dengan mudah</p>
        </div>

        {loginError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm font-medium flex items-start gap-3">
            <span className="text-lg mt-0.5">⚠️</span>
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              disabled={isLoggingIn}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              disabled={isLoggingIn}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full px-4 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md"
          >
            {isLoggingIn ? '⏳ Sedang Login...' : '🔐 Login'}
          </button>
        </form>

        {/* Demo accounts removed — use real credentials */}

        <div className="mt-6 text-center">
          <Link to="/" className="text-emerald-600 font-medium hover:text-emerald-700 transition text-sm">← Kembali ke Beranda</Link>
        </div>
      </div>
    </div>
  );
}
