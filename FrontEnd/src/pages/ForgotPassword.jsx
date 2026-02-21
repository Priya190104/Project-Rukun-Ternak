import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Check } from 'lucide-react';
import AppLogo from '../components/branding/AppLogo';
import SupportedByLogo from '../components/branding/SupportedByLogo';
import client from '../api/client';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsSubmitting(true);

    try {
      const response = await client.post('/auth/forgot-password', {
        usernameOrEmail: usernameOrEmail.trim(),
      });

      if (response.data.success) {
        setSuccess(true);
        setMaskedEmail(response.data.email || '');
      } else {
        setError(response.data.message || 'Terjadi kesalahan. Silakan coba lagi.');
      }
    } catch (err) {
      console.error('[ForgotPassword] Error:', err);
      setError(
        err.response?.data?.message || 
        'Terjadi kesalahan saat mengirim email. Silakan coba lagi.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-success-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Terkirim!</h1>
            <p className="text-gray-600 text-sm">
              Link reset password telah dikirim ke email:
            </p>
            <p className="text-primary-600 font-semibold mt-2">
              {maskedEmail}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              <strong>Catatan:</strong>
            </p>
            <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc list-inside">
              <li>Cek folder spam jika email tidak masuk</li>
              <li>Link akan kadaluarsa dalam 1 jam</li>
              <li>Klik link di email untuk mereset password</li>
            </ul>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="w-full px-4 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition"
          >
            Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <AppLogo size="3xl" variant="icon" className="mx-auto mb-2" />
          <div className="flex justify-center">
            <SupportedByLogo size="md" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Lupa Password</h1>
          <p className="text-gray-600 mt-2 text-sm">
            Masukkan username atau email Anda untuk menerima link reset password
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
              Username atau Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="Masukkan username atau email"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md"
          >
            {isSubmitting ? '⏳ Mengirim...' : 'Kirim Link Reset Password'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <Link 
            to="/login" 
            className="text-primary-600 font-medium hover:text-primary-700 transition text-sm inline-flex items-center gap-1"
          >
            <ArrowLeft size={16} />
            Kembali ke Login
          </Link>
        </div>
      </div>
    </div>
  );
}
