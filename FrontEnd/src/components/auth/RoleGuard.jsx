import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function RoleGuard({ allowedRoles = [], children }) {
  const { appRole, loading } = useAuth();

  console.log('[RoleGuard] Checking access:', { appRole, allowedRoles, allowed: allowedRoles.includes(appRole) });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-emerald-700">Loading...</div>
      </div>
    );
  }

  // Check if user's role is in the allowed roles
  if (allowedRoles.includes(appRole)) {
    console.log('[RoleGuard] Access granted for role:', appRole);
    return children;
  }

  // User role not permitted
  console.warn('[RoleGuard] Access denied for role:', appRole);
  
  // Only redirect to pending page if role is explicitly "belum ditentukan" or "pending"
  // Don't redirect if user has a valid role but it's not allowed for this page
  if (!appRole || appRole === 'belum ditentukan' || appRole === 'pending') {
    console.log('[RoleGuard] Redirecting to pending page - role not determined');
    return <Navigate to="/menunggu" replace />;
  }

  // If user has a role but it's not allowed, don't let them see the page
  // Let the page component handle showing an access denied message
  // OR redirect to a page they CAN access based on their role
  if (appRole === 'kelompok') {
    console.log('[RoleGuard] Kelompok user denied access, redirecting to client dashboard');
    return <Navigate to="/client" replace />;
  }

  if (appRole === 'admin') {
    console.log('[RoleGuard] Admin user denied access, redirecting to admin dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  if (appRole === 'viewer') {
    console.log('[RoleGuard] Viewer user denied access, redirecting to viewer dashboard');
    return <Navigate to="/viewer-dashboard" replace />;
  }

  if (appRole === 'mitra_kelompok') {
    console.log('[RoleGuard] Mitra kelompok user denied access, redirecting to client dashboard');
    return <Navigate to="/client" replace />;
  }

  // Fallback: redirect to login
  console.log('[RoleGuard] Fallback: redirecting to login');
  return <Navigate to="/login" replace />;
}
