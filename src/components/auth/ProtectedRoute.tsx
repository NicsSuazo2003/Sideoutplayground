import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import type { ReactNode } from 'react';

export function AdminRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}