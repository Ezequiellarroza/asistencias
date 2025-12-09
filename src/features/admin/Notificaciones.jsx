import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  AlertTriangle,
  CheckSquare,
  RefreshCw,
  Filter,
  X,
  Clock,
  MapPin,
  Smartphone,
  XCircle,
  Eye
} from 'lucide-react';
import adminService from '../../services/adminService';

function Notificaciones() {
  const navigate = useNavigate();

  // Estados principales
  const [estadisticas, setEstadisticas] = useState(null);
  const [alertasPendientes, setAlertasPendientes] = useState([]);
  
  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Estados de filtros
  const [filtroTipo, setFiltroTipo] = useState('todas'); // 'todas' | 'alertas' | 'tareas'

  // Cargar datos
  const cargarDatos = async () => {
    try {
      setError('');
      
      // Obtener estadísticas
      const stats = await adminService.getEstadisticas();
      setEstadisticas(stats);

      // Obtener alertas pendientes
      const alertasData = await adminService.getAlertas({
        revisada: '0',
        limit: 50
      });
      setAlertasPendientes(alertasData.alertas || []);

      // TODO: Cuando se implemente el módulo de tareas, agregar:
      // const tareasData = await adminService.getTareasPendientes();
      // setTareasPendientes(tareasData.tareas || []);

    } catch (err) {
      console.error('Error al cargar notificaciones:', err);
      if (err.message === 'No autenticado') {
        setError('Tu sesión ha expirado. Redirigiendo al login...');
      } else {
        setError(err.message || 'Error al cargar notificaciones');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Cargar al montar
  useEffect(() => {
    cargarDatos();
  }, []);

  // Handler de refresh
  const handleRefresh = () => {
    setRefreshing(true);
    cargarDatos();
  };

  // Navegar con transición
  const handleVolver = () => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        navigate('/admin/dashboard');
      });
    } else {
      navigate('/admin/dashboard');
    }
  };

  // Navegar a alertas
  const handleVerAlertas = () => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        navigate('/admin/alertas');
      });
    } else {
      navigate('/admin/alertas');
    }
  };

  // Obtener estilo de alerta por tipo
  const getAlertaEstilo = (tipo) => {
    const estilos = {
      'gps_fuera_rango': {
        color: 'orange',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-500',
        textColor: 'text-orange-700',
        icon: MapPin,
        label: 'GPS Fuera de Rango'
      },
      'doble_entrada': {
        color: 'yellow',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-500',
        textColor: 'text-yellow-700',
        icon: AlertTriangle,
        label: 'Doble Entrada'
      },
      'salida_sin_entrada': {
        color: 'red',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-500',
        textColor: 'text-red-700',
        icon: XCircle,
        label: 'Salida sin Entrada'
      },
      'turno_largo': {
        color: 'purple',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-500',
        textColor: 'text-purple-700',
        icon: Clock,
        label: 'Turno Prolongado'
      },
      'dispositivo_compartido': {
        color: 'blue',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-500',
        textColor: 'text-blue-700',
        icon: Smartphone,
        label: 'Dispositivo Compartido'
      }
    };

    return estilos[tipo] || estilos['gps_fuera_rango'];
  };

  // Formatear fecha relativa
  const formatearFechaRelativa = (fecha) => {
    const ahora = new Date();
    const fechaAlerta = new Date(fecha);
    const diffMs = ahora - fechaAlerta;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMs / 3600000);
    const diffDias = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHoras < 24) return `Hace ${diffHoras}h`;
    if (diffDias === 1) return 'Ayer';
    if (diffDias < 7) return `Hace ${diffDias} días`;
    
    return fechaAlerta.toLocaleDateString('es-AR');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <RefreshCw className="w-12 h-12 text-amber-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando notificaciones...</p>
        </div>
      </div>
    );
  }

  // Calcular totales
  const totalAlertas = estadisticas?.alertas?.total_pendientes || 0;
  const totalTareas = 0; // TODO: Implementar cuando esté el módulo de tareas
  const totalNotificaciones = totalAlertas + totalTareas;

  // Filtrar notificaciones según el tipo
  const notificacionesFiltradas = () => {
    if (filtroTipo === 'alertas') {
      return alertasPendientes;
    } else if (filtroTipo === 'tareas') {
      return []; // TODO: return tareasPendientes;
    } else {
      // Mostrar todas (alertas + tareas)
      return alertasPendientes;
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleVolver}
                className="btn-glass p-2"
                aria-label="Volver"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Notificaciones
                </h1>
                <p className="text-sm text-gray-600">
                  {totalNotificaciones} notificaciones pendientes
                </p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-glass px-4 py-2 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
          </div>

          {/* Resumen rápido */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-red-700">
                    {totalAlertas}
                  </p>
                  <p className="text-sm text-red-600">Alertas Pendientes</p>
                </div>
              </div>
            </div>

            <div className="bg-teal-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckSquare className="w-8 h-8 text-teal-600" />
                <div>
                  <p className="text-2xl font-bold text-teal-700">
                    {totalTareas}
                  </p>
                  <p className="text-sm text-teal-600">Tareas Pendientes</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Bell className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-purple-700">
                    {totalNotificaciones}
                  </p>
                  <p className="text-sm text-purple-600">Total</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="glass-card p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-700">Mostrar:</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFiltroTipo('todas')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filtroTipo === 'todas'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-white/50 text-gray-600 hover:bg-white/80'
                }`}
              >
                Todas ({totalNotificaciones})
              </button>
              <button
                onClick={() => setFiltroTipo('alertas')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filtroTipo === 'alertas'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-white/50 text-gray-600 hover:bg-white/80'
                }`}
              >
                Alertas ({totalAlertas})
              </button>
              <button
                onClick={() => setFiltroTipo('tareas')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filtroTipo === 'tareas'
                    ? 'bg-teal-100 text-teal-700'
                    : 'bg-white/50 text-gray-600 hover:bg-white/80'
                }`}
                disabled
              >
                Tareas ({totalTareas}) - Próximamente
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="glass-card p-4 mb-6 border-l-4 border-red-500">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Lista de notificaciones */}
        {totalNotificaciones === 0 ? (
          <div className="glass-card p-12 text-center">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No hay notificaciones
            </h3>
            <p className="text-gray-600">
              ¡Todo en orden! No hay alertas ni tareas pendientes
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Sección de Alertas */}
            {(filtroTipo === 'todas' || filtroTipo === 'alertas') && alertasPendientes.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Alertas del Sistema
                  </h2>
                  <button
                    onClick={handleVerAlertas}
                    className="btn-glass px-3 py-1 text-sm flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Ver todas las alertas
                  </button>
                </div>

                {alertasPendientes.map(alerta => {
                  const estilo = getAlertaEstilo(alerta.tipo);
                  const Icon = estilo.icon;

                  return (
                    <div
                      key={alerta.id}
                      className={`glass-card p-4 border-l-4 ${estilo.borderColor} hover:shadow-lg transition-shadow cursor-pointer`}
                      onClick={handleVerAlertas}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 ${estilo.bgColor} rounded-lg flex-shrink-0`}>
                          <Icon className={`w-6 h-6 ${estilo.textColor}`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-800 mb-1">
                                {alerta.empleado_nombre_completo}
                              </h3>
                              <span className={`inline-block px-2 py-1 text-xs font-medium ${estilo.bgColor} ${estilo.textColor} rounded-full`}>
                                {estilo.label}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {formatearFechaRelativa(alerta.creado_en)}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 mb-2">
                            {alerta.mensaje}
                          </p>

                          {alerta.oficina_nombre && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <MapPin className="w-3 h-3" />
                              {alerta.oficina_nombre}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* Sección de Tareas (Placeholder) */}
            {filtroTipo === 'tareas' && (
              <div className="glass-card p-12 text-center">
                <CheckSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Módulo de Tareas
                </h3>
                <p className="text-gray-600">
                  El módulo de gestión de tareas estará disponible próximamente
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notificaciones;