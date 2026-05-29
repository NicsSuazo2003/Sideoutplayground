import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminRoute } from './components/auth/ProtectedRoute';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { AdminPriceRules } from './pages/admin/AdminPriceRules';


import { BookingPage } from './pages/booking/BookingPage';
import { CheckoutPage } from './pages/booking/CheckoutPage';
import { BookingSuccessPage } from './pages/booking/BookingSuccessPage';
import { TrackBookingPage } from './pages/booking/TrackBookingPage';

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminBookings } from './pages/admin/AdminBookings';
import { AdminCustomers } from './pages/admin/AdminCustomers';
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
          <Route path="/book" element={<BookingPage />} />
          <Route path="/book/checkout" element={<CheckoutPage />} />
          <Route path="/book/success" element={<BookingSuccessPage />} />
          <Route path="/track" element={<TrackBookingPage />} />
          
        </Route>

        {/* Admin */}
<Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
  <Route index element={<AdminDashboard />} />
  <Route path="bookings" element={<AdminBookings />} />
  <Route path="customers" element={<AdminCustomers />} />
  <Route path="court" element={<AdminCourt />} />
  <Route path="pricing" element={<AdminPriceRules />} />
  <Route path="reports" element={<AdminReports />} />
</Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}