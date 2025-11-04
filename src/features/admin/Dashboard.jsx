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
  RefreshCw
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
      setError(err.message || 'Error al cargar las estadísticas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Cargar al montar
  useEffect(() => {
    cargarEstadisticas();
  }, []);

  // Refrescar datos
  const handleRefresh = () => {
    setRefreshing(true);
    cargarEstadisticas();
  };

  // Obtener color del icono según tipo de alerta
  const getAlertColor = (tipo) => {
    const colors = {
      'gps_fuera_rango': 'text-orange-600',
      'doble_entrada': 'text-yellow-600',
      'salida_sin_entrada': 'text-red-600',
      'turno_largo': 'text-purple-600',
      'dispositivo_compartido': 'text-blue-600'
    };
    return colors[tipo] || 'text-gray-600';
  };

  // Loading state
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

  // Error state
  if (error && !estadisticas) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error al cargar</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={cargarEstadisticas}
            className="btn-glass-primary px-6 py-2"
          >
            Reintentar
          </button>
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
            <h1 className="text-2xl font-bold text-gray-800">
              Panel de Administración
            </h1>
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
            <button
              onClick={logout}
              className="btn-glass px-4 py-2 flex items-center gap-2 text-red-600"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </div>
        </div>

        {/* Cards de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="glass-card p-6">
            <Users className="w-8 h-8 text-emerald-600 mb-2" />
            <h3 className="text-2xl font-bold text-gray-800">
              {estadisticas?.empleados?.total_activos || 0}
            </h3>
            <p className="text-sm text-gray-600">Empleados Activos</p>
          </div>

          <div className="glass-card p-6">
            <Clock className="w-8 h-8 text-amber-600 mb-2" />
            <h3 className="text-2xl font-bold text-gray-800">
              {estadisticas?.empleados?.presentes_hoy || 0}
            </h3>
            <p className="text-sm text-gray-600">Presentes Hoy</p>
          </div>

          <div className="glass-card p-6">
            <MapPin className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="text-2xl font-bold text-gray-800">
              {estadisticas?.oficinas?.total_activas || 0}
            </h3>
            <p className="text-sm text-gray-600">Oficinas</p>
          </div>

          <div className="glass-card p-6">
            <FileText className="w-8 h-8 text-purple-600 mb-2" />
            <h3 className="text-2xl font-bold text-gray-800">
              {estadisticas?.marcaciones?.total_hoy || 0}
            </h3>
            <p className="text-sm text-gray-600">Marcaciones Hoy</p>
          </div>
        </div>

        {/* Alertas Pendientes */}
        {estadisticas?.alertas?.total_pendientes > 0 && (
          <div className="glass-card p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h2 className="text-xl font-bold text-gray-800">
                  Alertas Pendientes ({estadisticas.alertas.total_pendientes})
                </h2>
              </div>
              <button
                onClick={() => navigate('/admin/alertas')}
                className="btn-glass-primary px-4 py-2 text-sm"
              >
                Ver todas
              </button>
            </div>

            <div className="space-y-2">
              {estadisticas?.alertas?.ultimas_alertas?.map((alerta) => (
                <div
                  key={alerta.id}
                  className="bg-white bg-opacity-50 rounded-lg p-4 flex items-start gap-3 hover:bg-opacity-70 transition-colors cursor-pointer"
                  onClick={() => navigate('/admin/alertas')}
                >
                  <AlertTriangle className={`w-5 h-5 ${getAlertColor(alerta.tipo)} flex-shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">
                      {alerta.empleado_nombre_completo}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {alerta.mensaje}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(alerta.creado_en).toLocaleString('es-AR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Menú de acciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button 
            onClick={() => navigate('/admin/alertas')}
            className="glass-card p-8 hover:scale-105 transition-transform duration-200 text-left"
          >
            <AlertTriangle className="w-10 h-10 text-red-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Alertas
            </h3>
            <p className="text-sm text-gray-600">
              {estadisticas?.alertas?.total_pendientes || 0} alertas pendientes
            </p>
          </button>

          <button 
            disabled
            className="glass-card p-8 opacity-50 cursor-not-allowed text-left"
          >
            <Users className="w-10 h-10 text-emerald-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Gestión de Empleados
            </h3>
            <p className="text-sm text-gray-600">
              Próximamente
            </p>
          </button>

          <button 
            disabled
            className="glass-card p-8 opacity-50 cursor-not-allowed text-left"
          >
            <FileText className="w-10 h-10 text-amber-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Reportes
            </h3>
            <p className="text-sm text-gray-600">
              Próximamente
            </p>
          </button>

          <button 
            disabled
            className="glass-card p-8 opacity-50 cursor-not-allowed text-left"
          >
            <MapPin className="w-10 h-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Oficinas
            </h3>
            <p className="text-sm text-gray-600">
              Próximamente
            </p>
          </button>

          <button 
            disabled
            className="glass-card p-8 opacity-50 cursor-not-allowed text-left"
          >
            <Clock className="w-10 h-10 text-purple-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Marcación Manual
            </h3>
            <p className="text-sm text-gray-600">
              Próximamente
            </p>
          </button>

          <button 
            disabled
            className="glass-card p-8 opacity-50 cursor-not-allowed text-left"
          >
            <Settings className="w-10 h-10 text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Configuración
            </h3>
            <p className="text-sm text-gray-600">
              Próximamente
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;