import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import type { ReactNode } from 'react';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

export function AdminRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}
