import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import ClientDashboard from '../pages/ClientDashboard';
import KelolaUser from '../pages/KelolaUser';
import DaftarSemuaLaporan from '../pages/DaftarSemuaLaporan';
import ClientLihatLaporan from '../pages/ClientLihatLaporan';
import ClientPilihJenisLaporan from '../pages/ClientPilihJenisLaporan';
import MenungguHakAkses from '../pages/MenungguHakAkses';
import Analisis from '../pages/Analisis';
import ListKelompok from '../pages/ListKelompok';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import RoleGuard from '../components/auth/RoleGuard';
import AppLayout from '../components/layout/AppLayout';

export default function AppRouter() {
  return (
    <main>
      <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* Admin routes */}
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
            path="/laporan"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={[ 'admin' ]}>
                  <AppLayout>
                    <DaftarSemuaLaporan />
                  </AppLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/analisis"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={[ 'admin' ]}>
                  <AppLayout>
                    <Analisis />
                  </AppLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* Kelompok routes - /client maps to ListKelompok for admin view */}
          <Route
            path="/client"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={[ 'admin', 'kelompok' ]}>
                  <AppLayout>
                    {/* Will render based on role logic in page */}
                    <ClientDashboard />
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
                <RoleGuard allowedRoles={[ 'admin', 'kelompok' ]}>
                  <AppLayout>
                    <ClientLihatLaporan />
                  </AppLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route path="/menunggu" element={<MenungguHakAkses />} />
        </Routes>
    </main>
  );
}
