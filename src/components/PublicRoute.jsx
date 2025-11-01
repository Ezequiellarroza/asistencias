import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = ({ children }) => {
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

  if (user) {
    // Si ya está autenticado, redirigir al dashboard correspondiente
    return <Navigate to={user.tipo === 'admin' ? '/admin/dashboard' : '/empleado/dashboard'} replace />;
  }

  return children;
};

export default PublicRoute;