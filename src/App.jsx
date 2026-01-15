import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './hooks/useToast';
import ToastContainer from './components/ui/ToastContainer';
import PublicRoute from './components/PublicRoute';
import ProtectedRoute from './components/ProtectedRoute';

// Auth
import LoginEmpleado from './features/auth/LoginEmpleado';
import LoginAdmin from './features/auth/LoginAdmin';

// Empleado
import EmpleadoDashboard from './features/empleado/Dashboard';
import EmpleadoTareas from './features/empleado/Tareas';

// Admin
import AdminDashboard from './features/admin/Dashboard';
import Alertas from './features/admin/Alertas';
import Empleados from './features/admin/Empleados';
import Oficinas from './features/admin/Oficinas';
import Departamentos from './features/admin/Departamentos';
import EmpleadosPresentes from './features/admin/EmpleadosPresentes';
import Notificaciones from './features/admin/Notificaciones';
import AdminTareas from './features/admin/Tareas';
import Espacios from './features/admin/Espacios';
import MarcacionManual from './features/admin/MarcacionManual';
import Reportes from './features/admin/Reportes';
import ReporteDetalle from './features/admin/ReporteDetalle';
import UsuariosAdmin from './features/admin/UsuariosAdmin';
import Configuracion from './features/admin/Configuracion';
import Feriados from './features/admin/Feriados';

function App() {
  // Listener global para manejar errores 401
  useEffect(() => {
    const handleUnauthorized = () => {
      console.log('Sesión expirada, redirigiendo al login...');
      window.location.href = '/valle/';
    };

    window.addEventListener('unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('unauthorized', handleUnauthorized);
    };
  }, []);

  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter basename="/valle">
          <ToastContainer />
          
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

            <Route
              path="/empleado/tareas"
              element={
                <ProtectedRoute requiredRole="empleado">
                  <EmpleadoTareas />
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
            
            <Route
              path="/admin/alertas"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Alertas />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/empleados"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Empleados />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/empleados/presentes"
              element={
                <ProtectedRoute requiredRole="admin">
                  <EmpleadosPresentes />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/oficinas"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Oficinas />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/departamentos"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Departamentos />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/espacios"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Espacios />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/notificaciones"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Notificaciones />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/tareas"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminTareas />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/marcacion-manual"
              element={
                <ProtectedRoute requiredRole="admin">
                  <MarcacionManual />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/reportes"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Reportes />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/reportes/:empleadoId"
              element={
                <ProtectedRoute requiredRole="admin">
                  <ReporteDetalle />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/usuarios-admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <UsuariosAdmin />
                </ProtectedRoute>
              }
            />

            <Route
  path="/admin/configuracion"
  element={
    <ProtectedRoute requiredRole="admin">
      <Configuracion />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/feriados"
  element={
    <ProtectedRoute requiredRole="admin">
      <Feriados />
    </ProtectedRoute>
  }
/>

            {/* Ruta 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;