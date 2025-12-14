import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function RoleGuard({ allowedRoles = [], children }) {
  const { appRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-emerald-700">Loading...</div>
      </div>
    );
  }

  // User has no assigned role or role is explicitly "belum ditentukan"
  if (!appRole || appRole === 'belum ditentukan' || appRole === 'pending') {
    return <Navigate to="/menunggu" replace />;
  }

  // Check if user's role is in the allowed roles
  if (allowedRoles.includes(appRole)) {
    return children;
  }

  // Role not permitted
  return <Navigate to="/menunggu" replace />;
}
