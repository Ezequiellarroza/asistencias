import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PublicRoute from './components/PublicRoute';
import ProtectedRoute from './components/ProtectedRoute';

// Auth
import LoginEmpleado from './features/auth/LoginEmpleado';
import LoginAdmin from './features/auth/LoginAdmin';

// Empleado
import EmpleadoDashboard from './features/empleado/Dashboard';

// Admin
import AdminDashboard from './features/admin/Dashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <LoginEmpleado />
              </PublicRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PublicRoute>
                <LoginAdmin />
              </PublicRoute>
            }
          />

          {/* Rutas protegidas - Empleado */}
          <Route
            path="/empleado/dashboard"
            element={
              <ProtectedRoute requiredRole="empleado">
                <EmpleadoDashboard />
              </ProtectedRoute>
            }
          />

          {/* Rutas protegidas - Admin */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Ruta 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;