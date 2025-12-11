import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import NotificationBell from '../notification/NotificationBell';
import { useAuth } from '../../hooks/useAuth';
import { Menu, X, LogOut, Home, FileText, Users, BarChart3, User } from 'lucide-react';

export default function AppLayout({ children }) {
  const { user, appRole, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const adminMenu = [
    { key: 'dashboard', label: 'Dashboard', to: '/dashboard', icon: Home },
    { key: 'laporan', label: 'Semua Laporan', to: '/laporan', icon: FileText },
    { key: 'kelompok', label: 'Kelompok', to: '/kelompok', icon: Users },
    { key: 'analisis', label: 'Analisis', to: '/analisis', icon: BarChart3 },
    { key: 'pengguna', label: 'Pengguna', to: '/kelola-user', icon: User },
  ];

  const kelompokMenu = [
    { key: 'client', label: 'Dashboard', to: '/client', icon: Home },
    { key: 'buat', label: 'Buat Laporan', to: '/pilih-jenis', icon: FileText },
    { key: 'mylaporan', label: 'Laporan Saya', to: '/laporan', icon: FileText },
  ];

  const menu = appRole === 'admin' ? adminMenu : kelompokMenu;
  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative w-64 h-screen bg-white border-r border-gray-200 z-40 transition-transform duration-300 flex flex-col`}>
        {/* Logo Section */}
        <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-6 text-white">
          <Link to="/" className="font-bold text-2xl flex items-center gap-3 hover:opacity-90 transition">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center text-xl font-bold backdrop-blur-sm">RT</div>
            <span>Rukun Ternak</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menu.map((m) => {
            const Icon = m.icon;
            const active = isActive(m.to);
            return (
              <Link
                key={m.key}
                to={m.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  active
                    ? 'bg-emerald-100 text-emerald-700 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} />
                <span>{m.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info Section */}
        <div className="p-4 border-t border-gray-200 space-y-4 bg-gray-50">
          <div className="px-3 py-3 bg-white rounded-lg border border-gray-200">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.full_name || user?.name || 'User'}</p>
            <p className="text-xs text-gray-600 mt-1 truncate">{user?.username || 'username'}</p>
            <div className="mt-2">
              <span className={`inline-block px-2.5 py-1 rounded-full text-white text-xs font-bold ${
                appRole === 'admin' ? 'bg-purple-600' : 'bg-emerald-600'
              }`}>
                {appRole === 'admin' ? '👤 Admin' : '🐑 Kelompok'}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition font-medium text-sm"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              <h1 className="text-xl font-bold text-gray-900 hidden md:block">
                {appRole === 'admin' ? '📊 Dashboard Admin' : '🐑 Dashboard Kelompok'}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {isAdmin && <NotificationBell />}
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 text-sm font-medium text-emerald-700">
                <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                {user?.full_name || user?.name || 'User'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 bg-gradient-to-br from-gray-50 to-gray-50">{children}</main>
      </div>

      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
