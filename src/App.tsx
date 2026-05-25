import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { ProtectedRoute, AdminRoute } from './components/auth/ProtectedRoute';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

import { DashboardOverview } from './pages/dashboard/DashboardOverview';
import { MyBookingsPage } from './pages/dashboard/MyBookingsPage';
import { ProfilePage } from './pages/dashboard/ProfilePage';
import { NotificationsPage } from './pages/dashboard/NotificationsPage';

import { BookingPage } from './pages/booking/BookingPage';
import { CheckoutPage } from './pages/booking/CheckoutPage';
import { BookingSuccessPage } from './pages/booking/BookingSuccessPage';

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminBookings } from './pages/admin/AdminBookings';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminCourt } from './pages/admin/AdminCourt';
import { AdminReports } from './pages/admin/AdminReports';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1A1A1A', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' },
          success: { iconTheme: { primary: '#7CFC00', secondary: '#000' } },
          error: { iconTheme: { primary: '#FF1493', secondary: '#fff' } },
        }}
      />
      <Routes>
        {/* Public */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* Booking — public view, login required only at checkout */}
<Route element={<PublicLayout />}>
  <Route path="/book" element={<BookingPage />} />
  <Route path="/book/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
  <Route path="/book/success" element={<ProtectedRoute><BookingSuccessPage /></ProtectedRoute>} />
</Route>

        {/* Dashboard */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<DashboardOverview />} />
          <Route path="my-bookings" element={<MyBookingsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="court" element={<AdminCourt />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
