import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LogOut, 
  Users, 
  FileText, 
  MapPin, 
  Settings, 
  Clock,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Bell,
  CheckSquare,
  Briefcase,
  Home
} from 'lucide-react';
import adminService from '../../services/adminService';

function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Estados
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Cargar estadísticas
  const cargarEstadisticas = async () => {
    try {
      setError('');
      const data = await adminService.getEstadisticas();
      setEstadisticas(data);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
      if (err.message === 'No autenticado') {
        setError('Tu sesión ha expirado. Redirigiendo al login...');
      } else {
        setError(err.message || 'Error al cargar las estadísticas');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    cargarEstadisticas();
  };

  const handleNavigateWithTransition = (path) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        navigate(path);
      });
    } else {
      navigate(path);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <Loader2 className="w-12 h-12 text-amber-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (error && !estadisticas) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error al cargar</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          {error !== 'Tu sesión ha expirado. Redirigiendo al login...' && (
            <button onClick={cargarEstadisticas} className="btn-glass-primary px-6 py-2">
              Reintentar
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="glass-card p-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Panel de Administración</h1>
            <p className="text-sm text-gray-600">
              Usuario: {user?.username} • {estadisticas?.timestamp}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-glass px-4 py-2 flex items-center gap-2 text-gray-600"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
            <button onClick={logout} className="btn-glass px-4 py-2 flex items-center gap-2 text-red-600">
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </div>
        </div>

        {/* Cards de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          
          <button
            onClick={() => handleNavigateWithTransition('/admin/empleados')}
            className="glass-card p-6 hover:scale-105 transition-transform duration-200 text-left"
          >
            <Users className="w-8 h-8 text-emerald-600 mb-2" />
            <h3 className="text-2xl font-bold text-gray-800">
              {estadisticas?.empleados?.total_activos || 0}
            </h3>
            <p className="text-sm text-gray-600">Gestión de Empleados</p>
          </button>

          <button
            onClick={() => handleNavigateWithTransition('/admin/empleados/presentes')}
            className="glass-card p-6 hover:scale-105 transition-transform duration-200 text-left"
          >
            <Clock className="w-8 h-8 text-amber-600 mb-2" />
            <h3 className="text-2xl font-bold text-gray-800">
              {estadisticas?.empleados?.presentes_hoy || 0}
            </h3>
            <p className="text-sm text-gray-600">Presentes Hoy</p>
          </button>

          <button
            onClick={() => handleNavigateWithTransition('/admin/oficinas')}
            className="glass-card p-6 hover:scale-105 transition-transform duration-200 text-left"
          >
            <MapPin className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="text-2xl font-bold text-gray-800">
              {estadisticas?.oficinas?.total_activas || 0}
            </h3>
            <p className="text-sm text-gray-600">Oficinas</p>
          </button>

          <button
            onClick={() => handleNavigateWithTransition('/admin/notificaciones')}
            className="glass-card p-6 hover:scale-105 transition-transform duration-200 text-left"
          >
            <Bell className="w-8 h-8 text-purple-600 mb-2" />
            <h3 className="text-2xl font-bold text-gray-800">
              {estadisticas?.alertas?.total_pendientes || 0}
            </h3>
            <p className="text-sm text-gray-600">Notificaciones</p>
          </button>
        </div>

        {/* Menú de acciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <button 
            onClick={() => handleNavigateWithTransition('/admin/alertas')}
            className="glass-card p-8 hover:scale-105 transition-transform duration-200 text-left"
          >
            <AlertTriangle className="w-10 h-10 text-red-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Alertas</h3>
            <p className="text-sm text-gray-600">
              {estadisticas?.alertas?.total_pendientes > 0 
                ? `${estadisticas.alertas.total_pendientes} alertas pendientes`
                : 'No hay alertas pendientes'
              }
            </p>
          </button>

          <button 
            onClick={() => handleNavigateWithTransition('/admin/departamentos')}
            className="glass-card p-8 hover:scale-105 transition-transform duration-200 text-left"
          >
            <Briefcase className="w-10 h-10 text-indigo-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Departamentos</h3>
            <p className="text-sm text-gray-600">Gestionar departamentos y áreas</p>
          </button>

          <button 
            onClick={() => handleNavigateWithTransition('/admin/espacios')}
            className="glass-card p-8 hover:scale-105 transition-transform duration-200 text-left"
          >
            <Home className="w-10 h-10 text-teal-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Espacios</h3>
            <p className="text-sm text-gray-600">Gestionar espacios y ubicaciones</p>
          </button>

          <button 
            onClick={() => handleNavigateWithTransition('/admin/tareas')}
            className="glass-card p-8 hover:scale-105 transition-transform duration-200 text-left"
          >
            <CheckSquare className="w-10 h-10 text-cyan-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Tareas</h3>
            <p className="text-sm text-gray-600">Gestionar tareas y asignaciones</p>
          </button>

          <button 
  onClick={() => handleNavigateWithTransition('/admin/reportes')}
  className="glass-card p-8 hover:scale-105 transition-transform duration-200 text-left"
>
  <FileText className="w-10 h-10 text-amber-600 mb-4" />
  <h3 className="text-xl font-bold text-gray-800 mb-2">Reportes</h3>
  <p className="text-sm text-gray-600">Ver reportes de asistencia</p>
</button>

          <button 
  onClick={() => handleNavigateWithTransition('/admin/marcacion-manual')}
  className="glass-card p-8 hover:scale-105 transition-transform duration-200 text-left"
>
  <Clock className="w-10 h-10 text-purple-600 mb-4" />
  <h3 className="text-xl font-bold text-gray-800 mb-2">Marcación Manual</h3>
  <p className="text-sm text-gray-600">Registrar entradas, salidas y ausencias</p>
</button>
          <button 
  onClick={() => handleNavigateWithTransition('/admin/configuracion')}
  className="glass-card p-8 hover:scale-105 transition-transform duration-200 text-left"
>
  <Settings className="w-10 h-10 text-gray-600 mb-4" />
  <h3 className="text-xl font-bold text-gray-800 mb-2">Configuración</h3>
  <p className="text-sm text-gray-600">Usuarios admin, feriados y más</p>
</button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;