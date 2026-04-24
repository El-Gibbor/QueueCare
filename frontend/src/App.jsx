import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { NavBar } from '@/components/NavBar';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { AppointmentsPage } from '@/pages/AppointmentsPage';
import { AppointmentDetailPage } from '@/pages/AppointmentDetailPage';
import { AppointmentFormPage } from '@/pages/AppointmentFormPage';

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  // Role-gated routes (e.g. /queue) bounce to /appointments rather than /login
  // so a logged-in patient isn't kicked back to the sign-in screen.
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/appointments" replace />;
  }
  return children;
}

function QueuePlaceholder() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-civic-dark">Today&rsquo;s queue</h1>
      <p className="mt-2 text-civic-muted">Queue UI arrives in chunk 4.</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/appointments"
            element={
              <ProtectedRoute>
                <AppointmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments/new"
            element={
              <ProtectedRoute>
                <AppointmentFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments/:id"
            element={
              <ProtectedRoute>
                <AppointmentDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments/:id/edit"
            element={
              <ProtectedRoute>
                <AppointmentFormPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/queue"
            element={
              <ProtectedRoute allowedRoles={['staff', 'admin']}>
                <QueuePlaceholder />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/appointments" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
