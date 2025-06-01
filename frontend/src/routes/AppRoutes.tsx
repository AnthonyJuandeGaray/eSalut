import type { ReactNode } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import Login from '../pages/Login';
import Register from '../pages/Register';
import NotFound from '../pages/NotFound';
import UsuarioDashboard from '../pages/usuario/UsuarioDashboard';
import MedicoDashboard from '../pages/medico/MedicoDashboard';
import AdminDashboard from '../pages/admin/AdminDashboard';
import { useAuth } from '../auth/useAuth';

// Middleware para proteger rutas
const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Redirigir automáticamente al dashboard según rol
const RedirectDashboard = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.rol) {
    case 'ADMIN':
      return <Navigate to="/admin/dashboard" replace />;
    case 'MEDICO':
      return <Navigate to="/medico/dashboard" replace />;
    default:
      return <Navigate to="/usuario/dashboard" replace />;
  }
};

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Redirección genérica */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <RedirectDashboard />
            </RequireAuth>
          }
        />

        {/* Dashboards específicos */}
        <Route
          path="/usuario/dashboard"
          element={
            <RequireAuth>
              <UsuarioDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/medico/dashboard"
          element={
            <RequireAuth>
              <MedicoDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <RequireAuth>
              <AdminDashboard />
            </RequireAuth>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
