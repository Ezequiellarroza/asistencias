import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8">
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Si no está autenticado, redirigir al login correspondiente
    return <Navigate to={requiredRole === 'admin' ? '/admin' : '/'} replace />;
  }

  if (requiredRole && user.tipo !== requiredRole) {
    // Si el rol no coincide, redirigir
    return <Navigate to={user.tipo === 'admin' ? '/admin/dashboard' : '/empleado/dashboard'} replace />;
  }

  return children;
};

export default ProtectedRoute;