import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import RoleGuard from '../components/auth/RoleGuard';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../hooks/useAuth';

// Lazy load all page components
const Landing = lazy(() => import('../pages/Landing'));
const Login = lazy(() => import('../pages/Login'));
const Profil = lazy(() => import('../pages/Profil'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const ViewerDashboard = lazy(() => import('../pages/ViewerDashboard'));
const ClientDashboard = lazy(() => import('../pages/ClientDashboard'));
const ClientDaftarLaporan = lazy(() => import('../pages/ClientDaftarLaporan'));
const ClientPilihJenisLaporan = lazy(() => import('../pages/ClientPilihJenisLaporan'));
const KelolaUser = lazy(() => import('../pages/KelolaUser'));
const DaftarSemuaLaporan = lazy(() => import('../pages/DaftarSemuaLaporan'));
const DetailLaporan = lazy(() => import('../pages/DetailLaporan'));
const MenungguHakAkses = lazy(() => import('../pages/MenungguHakAkses'));
const AdminAnalisis = lazy(() => import('../pages/AdminAnalisis'));
const ViewerAnalisis = lazy(() => import('../pages/ViewerAnalisis'));
const ListKelompok = lazy(() => import('../pages/ListKelompok'));
const PetaSebaranKelompok = lazy(() => import('../pages/PetaSebaranKelompok'));
const HewanTernakPage = lazy(() => import('../pages/HewanTernakPage'));
const DetailHewanPage = lazy(() => import('../pages/DetailHewanPage'));
const FormUpdateTernakPage = lazy(() => import('../pages/FormUpdateTernakPage'));
const AdminHewanTernakPage = lazy(() => import('../pages/AdminHewanTernakPage'));
const DetailKelompok = lazy(() => import('../pages/DetailKelompok'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Wrapper component to conditionally render ViewerAnalisis or AdminAnalisis
function ViewerAnalisisWrapper() {
  const { appRole } = useAuth();
  
  if (appRole === 'viewer') {
    return <ViewerAnalisis />;
  }
  return <AdminAnalisis />;
}

export default function AppRouter() {
  return (
    <main>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/menunggu" element={<MenungguHakAkses />} />

          {/* ADMIN ROUTES */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={[ 'admin' ]}>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* VIEWER ROUTES */}
          <Route
            path="/viewer-dashboard"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={[ 'viewer' ]}>
                  <AppLayout>
                    <ViewerDashboard />
                  </AppLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/kelola-user"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={[ 'admin', 'viewer' ]}>
                  <AppLayout>
                    <KelolaUser />
                  </AppLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* HEWAN TERNAK ROUTES - Accessible by admin, viewer (read-only for viewer) */}
          <Route
            path="/admin/hewan-ternak"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={[ 'admin', 'viewer' ]}>
                  <AppLayout>
                    <AdminHewanTernakPage />
                  </AppLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/hewan-ternak/:id"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={[ 'admin', 'viewer' ]}>
                  <AppLayout>
                    <DetailHewanPage />
                  </AppLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* LAPORAN ROUTES - Accessible by admin, kelompok, viewer (read-only for viewer) */}
          <Route
            path="/laporan"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={[ 'admin', 'kelompok', 'viewer' ]}>
                  <AppLayout>
                    <DaftarSemuaLaporan />
                  </AppLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* KELOMPOK ROUTES - Accessible by admin, viewer (read-only for viewer) */}
          <Route
            path="/kelompok"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={[ 'admin', 'viewer' ]}>
                  <AppLayout>
                    <ListKelompok />
                  </AppLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/kelompok/:id"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={[ 'admin', 'viewer' ]}>
                  <AppLayout>
                    <DetailKelompok />
                  </AppLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/peta-sebaran"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={[ 'admin', 'kelompok' ]}>
                  <AppLayout>
                    <PetaSebaranKelompok />
                  </AppLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* ANALISIS ROUTES - Accessible by admin, kelompok, viewer (read-only for viewer) */}
          <Route
            path="/analisis"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={[ 'admin', 'kelompok', 'viewer' ]}>
                  <AppLayout>
                    {/* Use ViewerAnalisis component for viewer role to show development notice */}
                    <ViewerAnalisisWrapper />
                  </AppLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* KELOMPOK ROUTES - MAIN MENU */}
          <Route
            path="/klg-dashboard"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={[ 'kelompok' ]}>
                  <AppLayout>
                    <ClientDashboard />
                  </AppLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/klg-laporan"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={[ 'kelompok' ]}>
                  <AppLayout>
                    <ClientDaftarLaporan />
                  </AppLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/hewan-ternak"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={[ 'kelompok' ]}>
                  <AppLayout>
                    <HewanTernakPage />
                  </AppLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/hewan-ternak/:id"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={[ 'kelompok' ]}>
                  <AppLayout>
                    <DetailHewanPage />
                  </AppLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/form-update-ternak"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={[ 'kelompok' ]}>
                  <AppLayout>
                    <FormUpdateTernakPage />
                  </AppLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* LEGACY/SHARED ROUTES */}
          <Route
            path="/client"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={[ 'admin', 'kelompok' ]}>
                  <AppLayout>
                    <ClientDashboard />
                  </AppLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/pilih-jenis"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={[ 'kelompok' ]}>
                  <AppLayout>
                    <ClientPilihJenisLaporan />
                  </AppLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* LAPORAN DETAIL - Accessible by admin, kelompok, viewer (read-only for viewer) */}
          <Route
            path="/laporan/:id"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={[ 'admin', 'kelompok', 'viewer' ]}>
                  <AppLayout>
                    <DetailLaporan />
                  </AppLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </main>
  );
}
