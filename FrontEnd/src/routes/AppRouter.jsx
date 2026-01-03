import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Profil from '../pages/Profil';
import Dashboard from '../pages/Dashboard';
import ViewerDashboard from '../pages/ViewerDashboard';
import ClientDashboard from '../pages/ClientDashboard';
import ClientDaftarLaporan from '../pages/ClientDaftarLaporan';
import ClientPilihJenisLaporan from '../pages/ClientPilihJenisLaporan';
import KelolaUser from '../pages/KelolaUser';
import KelolaBerita from '../pages/KelolaBerita';
import KelolaBanner from '../pages/KelolaBanner';
import DaftarSemuaLaporan from '../pages/DaftarSemuaLaporan';
import DetailLaporan from '../pages/DetailLaporan';
import DetailBerita from '../pages/DetailBerita';
import MenungguHakAkses from '../pages/MenungguHakAkses';
import AdminAnalisis from '../pages/AdminAnalisis';
import ListKelompok from '../pages/ListKelompok';
import PetaSebaranKelompok from '../pages/PetaSebaranKelompok';
import HewanTernakPage from '../pages/HewanTernakPage';
import DetailHewanPage from '../pages/DetailHewanPage';
import FormUpdateTernakPage from '../pages/FormUpdateTernakPage';
import AdminHewanTernakPage from '../pages/AdminHewanTernakPage';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import RoleGuard from '../components/auth/RoleGuard';
import AppLayout from '../components/layout/AppLayout';

export default function AppRouter() {
  return (
    <main>
      <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/menunggu" element={<MenungguHakAkses />} />
          <Route path="/berita/:slug" element={<DetailBerita />} />

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
                <RoleGuard allowedRoles={[ 'admin' ]}>
                  <AppLayout>
                    <KelolaUser />
                  </AppLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/kelola-berita"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={[ 'admin' ]}>
                  <AppLayout>
                    <KelolaBerita />
                  </AppLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/banner"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={[ 'admin' ]}>
                  <AppLayout>
                    <KelolaBanner />
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
                    <AdminAnalisis />
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
    </main>
  );
}
