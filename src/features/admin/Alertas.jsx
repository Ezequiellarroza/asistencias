import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  ArrowLeft,
  MapPin, 
  Clock, 
  Smartphone, 
  XCircle,
  Loader2,
  RefreshCw,
  Filter
} from 'lucide-react';
import adminService from '../../services/adminService';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';

function Alertas() {
  const navigate = useNavigate();
  
  // Estados principales
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  // Estados de filtros
  const [filtros, setFiltros] = useState({
    tipo: '',
    revisada: '0', // Solo pendientes por default
    empleado_id: '',
    fecha_desde: '',
    fecha_hasta: '',
    page: 1,
    limit: 20
  });
  
  // Estados de paginación
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    total_pages: 0
  });
  
  // Estados de estadísticas
  const [estadisticas, setEstadisticas] = useState({
    total_pendientes: 0,
    por_tipo: {}
  });
  
  // Estados del modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [alertaSeleccionada, setAlertaSeleccionada] = useState(null);
  const [notasModal, setNotasModal] = useState('');
  const [resueltaModal, setResueltaModal] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Cargar alertas
  const cargarAlertas = async () => {
    try {
      setError('');
      const data = await adminService.getAlertas(filtros);
      
      setAlertas(data.alertas || []);
      setPagination(data.pagination || {});
      setEstadisticas(data.estadisticas || {});
    } catch (err) {
      console.error('Error al cargar alertas:', err);
      if (err.message === 'No autenticado') {
        setError('Tu sesión ha expirado. Redirigiendo al login...');
      } else {
        setError(err.message || 'Error al cargar las alertas');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Cargar al montar y cuando cambien filtros
  useEffect(() => {
    cargarAlertas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros]);

  // Manejar cambio de filtro
  const handleFiltroChange = (key, value) => {
    setFiltros(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1 // Resetear a página 1 si cambia otro filtro
    }));
  };

  // Refresh manual
  const handleRefresh = () => {
    setRefreshing(true);
    cargarAlertas();
  };

  // Limpiar filtros
  const handleLimpiarFiltros = () => {
    setFiltros({
      tipo: '',
      revisada: '0',
      empleado_id: '',
      fecha_desde: '',
      fecha_hasta: '',
      page: 1,
      limit: filtros.limit
    });
  };

  // Abrir modal de revisión
  const handleAbrirModal = (alerta) => {
    setAlertaSeleccionada(alerta);
    setNotasModal(alerta.notas_admin || '');
    setResueltaModal(alerta.resuelta === 1);
    setModalAbierto(true);
  };

  // Cerrar modal
  const handleCerrarModal = () => {
    setModalAbierto(false);
    setAlertaSeleccionada(null);
    setNotasModal('');
    setResueltaModal(false);
  };

  // Guardar revisión
  const handleGuardarRevision = async () => {
    if (!alertaSeleccionada) return;

    setGuardando(true);
    try {
      await adminService.revisarAlerta(
        alertaSeleccionada.id,
        notasModal,
        resueltaModal ? 1 : 0
      );

      // Recargar alertas
      await cargarAlertas();
      
      // Cerrar modal
      handleCerrarModal();
    } catch (err) {
      console.error('Error al revisar alerta:', err);
      alert('Error al guardar la revisión: ' + err.message);
    } finally {
      setGuardando(false);
    }
  };

  // Volver al dashboard con transición
  const handleVolver = () => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        navigate('/admin/dashboard');
      });
    } else {
      navigate('/admin/dashboard');
    }
  };

  // Obtener color e ícono según tipo de alerta
  const getAlertaEstilo = (tipo) => {
    const estilos = {
      'gps_fuera_rango': {
        color: 'border-orange-500 bg-orange-50',
        iconColor: 'text-orange-600',
        icon: MapPin,
        label: 'GPS Fuera de Rango'
      },
      'doble_entrada': {
        color: 'border-yellow-500 bg-yellow-50',
        iconColor: 'text-yellow-600',
        icon: AlertTriangle,
        label: 'Doble Entrada'
      },
      'salida_sin_entrada': {
        color: 'border-red-500 bg-red-50',
        iconColor: 'text-red-600',
        icon: XCircle,
        label: 'Salida sin Entrada'
      },
      'turno_largo': {
        color: 'border-purple-500 bg-purple-50',
        iconColor: 'text-purple-600',
        icon: Clock,
        label: 'Turno Prolongado'
      },
      'dispositivo_compartido': {
        color: 'border-blue-500 bg-blue-50',
        iconColor: 'text-blue-600',
        icon: Smartphone,
        label: 'Dispositivo Compartido'
      }
    };
    return estilos[tipo] || estilos['gps_fuera_rango'];
  };

  // Formatear fecha para agrupación
  const formatearFechaGrupo = (fecha) => {
    const date = new Date(fecha);
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    // Normalizar fechas (sin horas)
    const dateStr = date.toDateString();
    const hoyStr = hoy.toDateString();
    const ayerStr = ayer.toDateString();

    if (dateStr === hoyStr) return 'Hoy';
    if (dateStr === ayerStr) return 'Ayer';
    
    // Formato: "2 de Noviembre"
    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
  };

  // Agrupar alertas por día
  const alertasAgrupadas = alertas.reduce((grupos, alerta) => {
    const grupo = formatearFechaGrupo(alerta.creado_en);
    if (!grupos[grupo]) {
      grupos[grupo] = [];
    }
    grupos[grupo].push(alerta);
    return grupos;
  }, {});

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 text-center">
          <Loader2 className="w-12 h-12 text-amber-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando alertas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleVolver}
                className="btn-glass p-2"
                aria-label="Volver al dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Alertas del Sistema
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {estadisticas.total_pendientes} alertas pendientes
                </p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-glass px-4 py-2 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="font-semibold text-gray-800">Filtros</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tipo de alerta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Alerta
              </label>
              <select
                value={filtros.tipo}
                onChange={(e) => handleFiltroChange('tipo', e.target.value)}
                className="input-glass w-full px-4 py-2 text-sm"
              >
                <option value="">Todos los tipos</option>
                <option value="gps_fuera_rango">GPS Fuera de Rango</option>
                <option value="doble_entrada">Doble Entrada</option>
                <option value="salida_sin_entrada">Salida sin Entrada</option>
                <option value="turno_largo">Turno Prolongado</option>
                <option value="dispositivo_compartido">Dispositivo Compartido</option>
              </select>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={filtros.revisada}
                onChange={(e) => handleFiltroChange('revisada', e.target.value)}
                className="input-glass w-full px-4 py-2 text-sm"
              >
                <option value="">Todas</option>
                <option value="0">Pendientes</option>
                <option value="1">Revisadas</option>
              </select>
            </div>

            {/* Fecha desde */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Desde
              </label>
              <input
                type="date"
                value={filtros.fecha_desde}
                onChange={(e) => handleFiltroChange('fecha_desde', e.target.value)}
                className="input-glass w-full px-4 py-2 text-sm"
              />
            </div>

            {/* Fecha hasta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hasta
              </label>
              <input
                type="date"
                value={filtros.fecha_hasta}
                onChange={(e) => handleFiltroChange('fecha_hasta', e.target.value)}
                className="input-glass w-full px-4 py-2 text-sm"
              />
            </div>
          </div>

          {/* Botón limpiar filtros */}
          <div className="mt-4">
            <button
              onClick={handleLimpiarFiltros}
              className="btn-glass px-4 py-2 text-sm"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="glass-card p-4 mb-6 border-l-4 border-red-500">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Lista de alertas agrupadas por día */}
        {Object.keys(alertasAgrupadas).length === 0 ? (
          <div className="glass-card p-12 text-center">
            <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No hay alertas
            </h3>
            <p className="text-gray-600">
              {filtros.revisada === '0' 
                ? '¡Todo en orden! No hay alertas pendientes.'
                : 'No se encontraron alertas con los filtros seleccionados.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6 mb-6">
            {Object.entries(alertasAgrupadas).map(([fecha, alertasDelDia]) => (
              <div key={fecha}>
                {/* Header del grupo */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    {fecha}
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-amber-200 to-transparent"></div>
                </div>

                {/* Alertas del día */}
                <div className="space-y-3">
                  {alertasDelDia.map((alerta) => {
                    const estilo = getAlertaEstilo(alerta.tipo);
                    const Icon = estilo.icon;

                    return (
                      <div
                        key={alerta.id}
                        className={`glass-card p-4 border-l-4 ${estilo.color} hover:shadow-lg transition-shadow`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Icono */}
                          <div className={`p-2 rounded-xl ${estilo.color}`}>
                            <Icon className={`w-6 h-6 ${estilo.iconColor}`} />
                          </div>

                          {/* Contenido */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div>
                                <h3 className="font-semibold text-gray-800">
                                  {alerta.empleado.nombre_completo}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {estilo.label}
                                </p>
                              </div>
                              
                              {/* Badge de estado */}
                              {alerta.revisada === 1 ? (
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                  Revisada
                                </span>
                              ) : (
                                <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                                  Pendiente
                                </span>
                              )}
                            </div>

                            {/* Mensaje */}
                            <p className="text-sm text-gray-700 mb-2">
                              {alerta.mensaje}
                            </p>

                            {/* Footer */}
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>
                                  {new Date(alerta.creado_en).toLocaleString('es-AR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                                {alerta.oficina && (
                                  <span>• {alerta.oficina.nombre}</span>
                                )}
                              </div>

                              {/* Botón revisar (solo si está pendiente) */}
                              {alerta.revisada === 0 && (
                                <button
                                  onClick={() => handleAbrirModal(alerta)}
                                  className="btn-glass-primary px-4 py-1 text-sm"
                                >
                                  Revisar
                                </button>
                              )}
                            </div>

                            {/* Notas del admin (si existen) */}
                            {alerta.notas_admin && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <p className="text-xs font-semibold text-gray-600 mb-1">
                                  Notas del administrador:
                                </p>
                                <p className="text-sm text-gray-700">
                                  {alerta.notas_admin}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginación */}
        {pagination.total > 0 && (
          <Pagination
            currentPage={filtros.page}
            totalPages={pagination.total_pages}
            totalItems={pagination.total}
            itemsPerPage={filtros.limit}
            onPageChange={(newPage) => handleFiltroChange('page', newPage)}
            onItemsPerPageChange={(newLimit) => handleFiltroChange('limit', newLimit)}
          />
        )}

        {/* Modal de revisión */}
        <Modal
          isOpen={modalAbierto}
          onClose={handleCerrarModal}
          title="Revisar Alerta"
          size="lg"
          footer={
            <>
              <button
                onClick={handleCerrarModal}
                className="btn-glass px-4 py-2"
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarRevision}
                className="btn-glass-primary px-4 py-2 flex items-center gap-2"
                disabled={guardando}
              >
                {guardando ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar'
                )}
              </button>
            </>
          }
        >
          {alertaSeleccionada && (
            <div className="space-y-4">
              {/* Info de la alerta */}
              <div className="glass-card p-4">
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Empleado:</span>{' '}
                    <span className="text-gray-800">{alertaSeleccionada.empleado.nombre_completo}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Tipo:</span>{' '}
                    <span className="text-gray-800">{getAlertaEstilo(alertaSeleccionada.tipo).label}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Mensaje:</span>{' '}
                    <span className="text-gray-800">{alertaSeleccionada.mensaje}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Fecha:</span>{' '}
                    <span className="text-gray-800">
                      {new Date(alertaSeleccionada.creado_en).toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notas del admin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas del Administrador
                </label>
                <textarea
                  value={notasModal}
                  onChange={(e) => setNotasModal(e.target.value)}
                  placeholder="Agregar observaciones sobre esta alerta..."
                  rows={4}
                  className="input-glass w-full px-4 py-3 text-sm resize-none"
                />
              </div>

              {/* Checkbox resuelta */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="resuelta"
                  checked={resueltaModal}
                  onChange={(e) => setResueltaModal(e.target.checked)}
                  className="w-5 h-5 rounded border-amber-300 text-emerald-600 focus:ring-amber-400"
                />
                <label htmlFor="resuelta" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Marcar como resuelta
                </label>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}

export default Alertas;