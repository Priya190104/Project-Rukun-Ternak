import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Check, AlertCircle } from 'lucide-react';
import AppLogo from '../components/branding/AppLogo';
import SupportedByLogo from '../components/branding/SupportedByLogo';
import client from '../api/client';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('Token tidak valid. Silakan minta link reset password baru.');
        setIsVerifying(false);
        return;
      }

      try {
        const response = await client.get(`/auth/verify-reset-token/${token}`);
        if (response.data.success && response.data.valid) {
          setTokenValid(true);
        } else {
          setError(response.data.message || 'Token tidak valid atau sudah kadaluarsa.');
          setTokenValid(false);
        }
      } catch (err) {
        console.error('[ResetPassword] Token verification error:', err);
        setError('Token tidak valid atau sudah kadaluarsa. Silakan minta link reset password baru.');
        setTokenValid(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (newPassword.length < 6) {
      setError('Password harus minimal 6 karakter');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Password dan konfirmasi password tidak sama');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await client.post('/auth/reset-password', {
        token,
        newPassword,
      });

      if (response.data.success) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(response.data.message || 'Terjadi kesalahan. Silakan coba lagi.');
      }
    } catch (err) {
      console.error('[ResetPassword] Error:', err);
      setError(
        err.response?.data?.message || 
        'Terjadi kesalahan saat mereset password. Silakan coba lagi.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md border border-gray-100 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memverifikasi token...</p>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-success-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Berhasil Direset!</h1>
            <p className="text-gray-600 text-sm">
              Password Anda telah berhasil diubah. Anda akan diarahkan ke halaman login...
            </p>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="w-full px-4 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition"
          >
            Login Sekarang
          </button>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-danger-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Token Tidak Valid</h1>
            <p className="text-gray-600 text-sm">
              {error || 'Link reset password tidak valid atau sudah kadaluarsa.'}
            </p>
          </div>

          <div className="space-y-3">
            <Link
              to="/forgot-password"
              className="w-full px-4 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition block text-center"
            >
              Minta Link Baru
            </Link>
            <Link
              to="/login"
              className="w-full px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition block text-center"
            >
              Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <AppLogo size="3xl" variant="icon" className="mx-auto mb-2" />
          <div className="flex justify-center">
            <SupportedByLogo size="md" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Reset Password</h1>
          <p className="text-gray-600 mt-2 text-sm">
            Masukkan password baru untuk akun Anda
          </p>
        </div>

        {error && (
          <div className="bg-danger-50 border border-danger-100 text-danger px-4 py-3 rounded-lg mb-6 text-sm font-medium flex items-start gap-3">
            <span className="text-lg mt-0.5">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password Baru
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                disabled={isSubmitting}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                disabled={isSubmitting}
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Konfirmasi Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ketik ulang password baru"
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                disabled={isSubmitting}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                disabled={isSubmitting}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {newPassword && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs space-y-1">
              <p className="font-semibold text-gray-700">Persyaratan password:</p>
              <ul className="space-y-1 text-gray-600">
                <li className={newPassword.length >= 6 ? 'text-success-600' : ''}>
                  {newPassword.length >= 6 ? '✓' : '○'} Minimal 6 karakter
                </li>
                <li className={newPassword === confirmPassword && confirmPassword ? 'text-success-600' : ''}>
                  {newPassword === confirmPassword && confirmPassword ? '✓' : '○'} Password cocok
                </li>
              </ul>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md"
          >
            {isSubmitting ? '⏳ Mereset Password...' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link 
            to="/login" 
            className="text-primary-600 font-medium hover:text-primary-700 transition text-sm"
          >
            Kembali ke Login
          </Link>
        </div>
      </div>
    </div>
  );
}
