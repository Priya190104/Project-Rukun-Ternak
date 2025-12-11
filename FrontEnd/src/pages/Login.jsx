import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { user, loading, appRole, login, logout } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

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
      setLoginError(result.error || 'Login gagal');
    }
    setIsLoggingIn(false);
  };

  const handleLogout = () => {
    logout();
    setUsername('');
    setPassword('');
    setLoginError('');
  };

  // Quick login buttons for testing
  const handleQuickLogin = async (testUsername, testPassword) => {
    setUsername(testUsername);
    setPassword(testPassword);
    setLoginError('');
    setIsLoggingIn(true);

    const result = await login(testUsername, testPassword);
    if (result.success) {
      if (result.user.role === 'admin') {
        navigate('/dashboard');
      } else if (result.user.role === 'kelompok') {
        navigate('/client');
      }
    } else {
      setLoginError(result.error || 'Login gagal');
    }
    setIsLoggingIn(false);
  };

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md border border-gray-100">
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-lg mb-3">RT</div>
            <h2 className="text-3xl font-bold text-gray-900">Sudah Masuk</h2>
          </div>

          {loading ? (
            <p className="text-center text-emerald-700">Loading...</p>
          ) : (
            <>
              <div className="bg-emerald-50 p-5 rounded-lg mb-6 space-y-3 border border-emerald-200">
                <div>
                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Nama</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{user?.full_name || user?.name || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Username</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{user?.username || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Role</p>
                  <p className="inline-block mt-1 px-3 py-1 bg-emerald-600 text-white text-sm font-semibold rounded-full">{appRole === 'admin' ? 'Administrator' : 'Kelompok'}</p>
                </div>
              </div>

              <button
                className="w-full px-4 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition shadow-md"
                onClick={handleLogout}
              >
                Logout
              </button>

              <div className="mt-6 text-center">
                <Link to="/" className="text-emerald-600 font-medium hover:text-emerald-700 transition">← Kembali ke Beranda</Link>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mb-4">RT</div>
          <h1 className="text-3xl font-bold text-gray-900">Rukun Ternak</h1>
          <p className="text-gray-600 mt-2 text-sm">Kelola data ternak dengan mudah</p>
        </div>

        {loginError && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm font-medium">
            ⚠️ {loginError}
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

        <div className="border-t border-gray-200 pt-6">
          <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-widest">Demo Akun</p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin', 'adminpass')}
              disabled={isLoggingIn}
              className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              👤 Admin (admin/adminpass)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('client1', 'clientpass')}
              disabled={isLoggingIn}
              className="w-full px-4 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              🐑 Kelompok (client1/clientpass)
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-emerald-600 font-medium hover:text-emerald-700 transition text-sm">← Kembali ke Beranda</Link>
        </div>
      </div>
    </div>
  );
}
