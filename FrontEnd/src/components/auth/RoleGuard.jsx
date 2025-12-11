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

  // user has no assigned role
  if (!appRole) {
    return <Navigate to="/menunggu" replace />;
  }

  if (allowedRoles.includes(appRole)) {
    return children;
  }

  // role not permitted
  return <Navigate to="/menunggu" replace />;
}
