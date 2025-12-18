import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Profil from '../pages/Profil';
import Dashboard from '../pages/Dashboard';
import ClientDashboard from '../pages/ClientDashboard';
import ClientDaftarLaporan from '../pages/ClientDaftarLaporan';
import ClientTambahLaporan from '../pages/ClientTambahLaporan';
import ClientPilihJenisLaporan from '../pages/ClientPilihJenisLaporan';
import KelolaUser from '../pages/KelolaUser';
import KelolaBerita from '../pages/KelolaBerita';
import KelolaBanner from '../pages/KelolaBanner';
import DaftarSemuaLaporan from '../pages/DaftarSemuaLaporan';
import DetailLaporan from '../pages/DetailLaporan';
import MenungguHakAkses from '../pages/MenungguHakAkses';
import Analisis from '../pages/Analisis';
import AdminAnalisis from '../pages/AdminAnalisis';
import ListKelompok from '../pages/ListKelompok';
import PetaSebaranKelompok from '../pages/PetaSebaranKelompok';
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

          <Route
            path="/laporan"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={[ 'admin', 'kelompok' ]}>
                  <AppLayout>
                    <DaftarSemuaLaporan />
                  </AppLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/kelompok"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={[ 'admin' ]}>
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

          <Route
            path="/analisis"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={[ 'admin', 'kelompok' ]}>
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
            path="/klg-tambah-laporan"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={[ 'kelompok' ]}>
                  <AppLayout>
                    <ClientTambahLaporan />
                  </AppLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/klg-analisis"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={[ 'kelompok' ]}>
                  <AppLayout>
                    <Analisis />
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

          <Route
            path="/laporan/:id"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={[ 'admin', 'kelompok', 'client' ]}>
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
