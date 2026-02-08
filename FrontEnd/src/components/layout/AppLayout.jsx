import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AppLogo from '../branding/AppLogo';
import SupportedByLogo from '../branding/SupportedByLogo';
import NotificationBell from '../notification/NotificationBell';
import KelompokBadge from '../kelompok/KelompokBadge';
import { useAuth } from '../../hooks/useAuth';
import { Menu, X, LogOut, Home, FileText, Users, BarChart3, User, Heart } from 'lucide-react';

export default function AppLayout({ children }) {
  const { user, appRole, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAnalisisAlert, setShowAnalisisAlert] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleMenuClick = (e, menuKey) => {
    // Block Analisis menu for admin role
    if (menuKey === 'analisis' && appRole === 'admin') {
      e.preventDefault();
      setShowAnalisisAlert(true);
    }
  };

  const adminMenu = [
    { key: 'dashboard', label: 'Dashboard', to: '/dashboard', icon: Home },
    { key: 'hewan', label: 'Hewan Ternak', to: '/admin/hewan-ternak', icon: Heart },
    { key: 'laporan', label: 'Semua Laporan', to: '/laporan', icon: FileText },
    { key: 'kelompok', label: 'Kelompok', to: '/kelompok', icon: Users },
    { key: 'analisis', label: 'Analisis', to: '/analisis', icon: BarChart3 },
    { key: 'pengguna', label: 'Pengguna', to: '/kelola-user', icon: User },
  ];

  // Viewer menu is same as admin but with viewer-specific dashboard link
  const viewerMenu = [
    { key: 'dashboard', label: 'Dashboard', to: '/viewer-dashboard', icon: Home },
    { key: 'hewan', label: 'Hewan Ternak', to: '/admin/hewan-ternak', icon: Heart },
    { key: 'laporan', label: 'Semua Laporan', to: '/laporan', icon: FileText },
    { key: 'kelompok', label: 'Kelompok', to: '/kelompok', icon: Users },
    { key: 'analisis', label: 'Analisis', to: '/analisis', icon: BarChart3 },
    { key: 'pengguna', label: 'Pengguna', to: '/kelola-user', icon: User },
  ];

  const kelompokMenu = [
    { key: 'client', label: 'Dashboard', to: '/client', icon: Home },
    { key: 'hewan', label: 'Hewan Ternak', to: '/hewan-ternak', icon: Heart },
    { key: 'buat', label: 'Buat Laporan', to: '/pilih-jenis', icon: FileText },
    { key: 'mylaporan', label: 'Laporan Saya', to: '/klg-laporan', icon: FileText },
  ];

  // Viewer uses viewer-specific menu, others use their respective menus
  const menu = 
    appRole === 'admin' ? adminMenu : 
    appRole === 'viewer' ? viewerMenu : 
    kelompokMenu;
  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Sidebar - Fixed positioning */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed left-0 top-0 w-64 h-screen bg-white border-r border-gray-200 z-40 transition-transform duration-300 flex flex-col`}>
        {/* Logo Section */}
        <div className="bg-gradient-to-b from-primary-400 to-primary-100 py-4 px-6 text-white flex flex-col items-center justify-center gap-2 flex-shrink-0">
          <Link to="/" className="hover:opacity-90 transition">
            <AppLogo size="2xl" variant="icon" />
          </Link>
          <SupportedByLogo size="sm" />
        </div>

        {/* Navigation - Independent scroll */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menu.map((m) => {
            const Icon = m.icon;
            const active = isActive(m.to);
            const isAnalisisAdminMenu = m.key === 'analisis' && appRole === 'admin';
            
            return (
              <Link
                key={m.key}
                to={isAnalisisAdminMenu ? '#' : m.to}
                onClick={(e) => handleMenuClick(e, m.key)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  active
                    ? 'bg-primary-100 text-primary-600 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} />
                <span>{m.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-danger-50 text-danger hover:bg-danger-100 hover:text-danger transition font-medium text-sm"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper - Offset by sidebar width */}
      <div className="md:ml-64 flex flex-col min-h-screen">
        {/* Header - Sticky positioning */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
          <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-gray-900">
                  {appRole === 'admin' ? 'Dashboard Admin' : appRole === 'viewer' ? 'Dashboard Viewer (Read-Only)' : 'Dashboard Kelompok'}
                </h1>
                {appRole === 'kelompok' && user?.kelompok && (
                  <div className="mt-1">
                    <KelompokBadge kelompokName={user.kelompok} />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {user && (
                <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">{user.full_name || user.username}</div>
                    <div className="text-xs text-gray-500">
                      {user.username} • {appRole === 'admin' ? 'Admin' : appRole === 'viewer' ? '👁 Viewer' : 'Kelompok'}
                    </div>
                  </div>
                </div>
              )}
              {isAdmin && appRole !== 'admin' && <NotificationBell />}
            </div>
          </div>
        </header>

        {/* Page Content - Independent scroll */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 bg-gradient-to-br from-gray-50 to-gray-50">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Analisis Feature Alert Modal */}
      {showAnalisisAlert && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full">
            <div className="p-6 text-center">
              <div className="text-5xl mb-4">🔧</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Fitur akan segera hadir</h2>
              <p className="text-gray-700 mb-6">Menu Analisis sedang dalam pengembangan. Kami akan menghadirkan fitur ini segera.</p>
              <button
                onClick={() => setShowAnalisisAlert(false)}
                className="w-full px-4 py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

