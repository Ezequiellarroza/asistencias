import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Home,
  Search,
  Plus,
  Edit,
  Trash2,
  Building2,
  RefreshCw,
  Filter,
  X,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Wrench
} from 'lucide-react';
import adminService from '../../services/adminService';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';

function Espacios() {
  const navigate = useNavigate();

  // Estados principales
  const [espacios, setEspacios] = useState([]);
  const [pagination, setPagination] = useState({});
  const [oficinas, setOficinas] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);

  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Estados de filtros
  const [filtros, setFiltros] = useState({
    oficina_id: '',
    tipo: '',
    estado: '',
    busqueda: '',
    page: 1,
    limit: 50
  });

  // Estados del modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoModal, setModoModal] = useState('crear');
  const [espacioSeleccionado, setEspacioSeleccionado] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Estado para modal de eliminación
  const [modalEliminar, setModalEliminar] = useState(false);
  const [espacioAEliminar, setEspacioAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  // Estado para notificaciones
  const [notificacion, setNotificacion] = useState(null);

  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    oficina_id: '',
    tipo: '',
    observaciones: '',
    estado: 'activo'
  });
  const [erroresForm, setErroresForm] = useState({});

  // Cargar espacios
  const cargarEspacios = async () => {
    try {
      setError('');
      const data = await adminService.getEspacios(filtros);
      setEspacios(data.espacios || []);
      setPagination(data.pagination || {});
      setEstadisticas(data.estadisticas || null);
    } catch (err) {
      console.error('Error al cargar espacios:', err);
      setError(err.message || 'Error al cargar espacios');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Cargar oficinas
  const cargarOficinas = async () => {
    try {
      const data = await adminService.getOficinas(false);
      setOficinas(data.oficinas || []);
    } catch (err) {
      console.error('Error al cargar oficinas:', err);
    }
  };

  useEffect(() => {
    cargarEspacios();
    cargarOficinas();
  }, []);

  useEffect(() => {
    if (!loading) {
      cargarEspacios();
    }
  }, [filtros]);

  const handleFiltroChange = (key, value) => {
    setFiltros(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      oficina_id: '',
      tipo: '',
      estado: '',
      busqueda: '',
      page: 1,
      limit: 50
    });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    cargarEspacios();
  };

  const handlePageChange = (newPage) => {
    setFiltros(prev => ({ ...prev, page: newPage }));
  };

  const handleItemsPerPageChange = (newLimit) => {
    setFiltros(prev => ({ ...prev, limit: newLimit, page: 1 }));
  };

  const mostrarNotificacion = (mensaje, tipo = 'success') => {
    setNotificacion({ mensaje, tipo });
    setTimeout(() => setNotificacion(null), 3000);
  };

  const handleAbrirModalCrear = () => {
    setModoModal('crear');
    setEspacioSeleccionado(null);
    setFormData({
      nombre: '',
      oficina_id: '',
      tipo: '',
      observaciones: '',
      estado: 'activo'
    });
    setErroresForm({});
    setModalAbierto(true);
  };

  const handleAbrirModalEditar = (espacio) => {
    setModoModal('editar');
    setEspacioSeleccionado(espacio);
    setFormData({
      nombre: espacio.nombre,
      oficina_id: espacio.oficina.id,
      tipo: espacio.tipo || '',
      observaciones: espacio.observaciones || '',
      estado: espacio.estado
    });
    setErroresForm({});
    setModalAbierto(true);
  };

  const handleCerrarModal = () => {
    setModalAbierto(false);
    setEspacioSeleccionado(null);
    setFormData({
      nombre: '',
      oficina_id: '',
      tipo: '',
      observaciones: '',
      estado: 'activo'
    });
    setErroresForm({});
  };

  const validarFormulario = () => {
    const errores = {};
    if (!formData.nombre.trim()) errores.nombre = 'El nombre es requerido';
    if (!formData.oficina_id) errores.oficina_id = 'La oficina es requerida';
    setErroresForm(errores);
    return Object.keys(errores).length === 0;
  };

  const handleGuardar = async () => {
    if (!validarFormulario()) return;

    setGuardando(true);
    try {
      const datos = {
        nombre: formData.nombre.trim(),
        oficina_id: parseInt(formData.oficina_id),
        tipo: formData.tipo.trim() || null,
        observaciones: formData.observaciones.trim() || null,
        estado: formData.estado
      };

      if (modoModal === 'crear') {
        await adminService.crearEspacio(datos);
        mostrarNotificacion('Espacio creado exitosamente', 'success');
      } else {
        await adminService.actualizarEspacio(espacioSeleccionado.id, datos);
        mostrarNotificacion('Espacio actualizado exitosamente', 'success');
      }

      handleCerrarModal();
      cargarEspacios();
    } catch (err) {
      setErroresForm({ general: err.message || 'Error al guardar espacio' });
    } finally {
      setGuardando(false);
    }
  };

  const handleAbrirModalEliminar = (espacio) => {
    setEspacioAEliminar(espacio);
    setModalEliminar(true);
  };

  const handleCerrarModalEliminar = () => {
    setModalEliminar(false);
    setEspacioAEliminar(null);
  };

  const handleConfirmarEliminar = async () => {
    if (!espacioAEliminar) return;

    setEliminando(true);
    try {
      const resultado = await adminService.eliminarEspacio(espacioAEliminar.id);
      
      if (resultado.accion === 'eliminado') {
        mostrarNotificacion(`${espacioAEliminar.nombre} eliminado permanentemente`, 'success');
      } else {
        mostrarNotificacion(`${espacioAEliminar.nombre} desactivado (tiene tareas)`, 'success');
      }
      
      handleCerrarModalEliminar();
      cargarEspacios();
    } catch (err) {
      mostrarNotificacion(err.message || 'Error al eliminar espacio', 'error');
    } finally {
      setEliminando(false);
    }
  };

  const handleVolver = () => {
    navigate('/admin/dashboard');
  };

  const getEstadoColor = (estado) => {
    const colores = {
      activo: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      inactivo: 'bg-gray-100 text-gray-700 border-gray-200',
      en_mantenimiento: 'bg-amber-100 text-amber-700 border-amber-200'
    };
    return colores[estado] || colores.activo;
  };

  const getEstadoIcono = (estado) => {
    const iconos = {
      activo: <CheckCircle className="w-3 h-3 inline mr-1" />,
      inactivo: <XCircle className="w-3 h-3 inline mr-1" />,
      en_mantenimiento: <Wrench className="w-3 h-3 inline mr-1" />
    };
    return iconos[estado] || null;
  };

  const getEstadoTexto = (estado) => {
    const textos = {
      activo: 'Activo',
      inactivo: 'Inactivo',
      en_mantenimiento: 'En Mantenimiento'
    };
    return textos[estado] || estado;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <RefreshCw className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando espacios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button onClick={handleVolver} className="btn-glass p-2">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Gestión de Espacios</h1>
                <p className="text-sm text-gray-600">{pagination.total_items || 0} espacios registrados</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleRefresh} disabled={refreshing} className="btn-glass px-4 py-2 flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Actualizar</span>
              </button>
              <button onClick={handleAbrirModalCrear} className="btn-glass-primary px-4 py-2 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nuevo Espacio
              </button>
            </div>
          </div>

          {/* Estadísticas */}
          {estadisticas && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800">{estadisticas.total}</p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">{estadisticas.activos}</p>
                <p className="text-sm text-gray-600">Activos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{estadisticas.en_mantenimiento}</p>
                <p className="text-sm text-gray-600">En Mantenimiento</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-600">{estadisticas.inactivos}</p>
                <p className="text-sm text-gray-600">Inactivos</p>
              </div>
            </div>
          )}
        </div>

        {/* Filtros */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="font-semibold text-gray-800">Filtros</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filtros.busqueda}
                  onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
                  placeholder="Nombre o observaciones..."
                  className="input-glass pl-10 w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Oficina</label>
              <select
                value={filtros.oficina_id}
                onChange={(e) => handleFiltroChange('oficina_id', e.target.value)}
                className="input-glass w-full"
              >
                <option value="">Todas</option>
                {oficinas.map(ofi => (
                  <option key={ofi.id} value={ofi.id}>{ofi.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <input
                type="text"
                value={filtros.tipo}
                onChange={(e) => handleFiltroChange('tipo', e.target.value)}
                placeholder="Ej: cabaña, habitación..."
                className="input-glass w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                value={filtros.estado}
                onChange={(e) => handleFiltroChange('estado', e.target.value)}
                className="input-glass w-full"
              >
                <option value="">Todos</option>
                <option value="activo">Activo</option>
                <option value="en_mantenimiento">En Mantenimiento</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button onClick={handleLimpiarFiltros} className="btn-glass px-4 py-2 text-sm flex items-center gap-2">
              <X className="w-4 h-4" />
              Limpiar Filtros
            </button>
          </div>
        </div>

        {error && (
          <div className="glass-card p-4 mb-6 border-l-4 border-red-500">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Lista de espacios */}
        {espacios.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No hay espacios</h3>
            <p className="text-gray-600 mb-4">No se encontraron espacios con los filtros aplicados</p>
            <button onClick={handleAbrirModalCrear} className="btn-glass-primary px-6 py-2">
              Crear Primer Espacio
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {espacios.map(espacio => (
                <div key={espacio.id} className="glass-card p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 mb-1">{espacio.nombre}</h3>
                      {espacio.tipo && <p className="text-sm text-gray-500 mb-2">{espacio.tipo}</p>}
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button onClick={() => handleAbrirModalEditar(espacio)} className="btn-glass p-2" title="Editar">
                        <Edit className="w-4 h-4 text-blue-600" />
                      </button>
                      <button onClick={() => handleAbrirModalEliminar(espacio)} className="btn-glass p-2" title="Eliminar">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getEstadoColor(espacio.estado)}`}>
                      {getEstadoIcono(espacio.estado)}
                      {getEstadoTexto(espacio.estado)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Building2 className="w-4 h-4" />
                    <span>{espacio.oficina.nombre}</span>
                  </div>

                  {espacio.observaciones && (
                    <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                      {espacio.observaciones}
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tareas asociadas:</span>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-800">{espacio.total_tareas || 0}</span>
                      {espacio.tareas_activas > 0 && (
                        <span className="text-xs text-amber-600 font-semibold">({espacio.tareas_activas} activas)</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              currentPage={pagination.page || 1}
              totalPages={pagination.total_pages || 1}
              totalItems={pagination.total_items || 0}
              itemsPerPage={filtros.limit}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        )}

        {/* Modal Crear/Editar */}
        <Modal
          isOpen={modalAbierto}
          onClose={handleCerrarModal}
          title={modoModal === 'crear' ? 'Nuevo Espacio' : 'Editar Espacio'}
          size="md"
          footer={
            <>
              <button onClick={handleCerrarModal} className="btn-glass px-4 py-2" disabled={guardando}>
                Cancelar
              </button>
              <button onClick={handleGuardar} disabled={guardando} className="btn-glass-primary px-4 py-2 flex items-center gap-2">
                {guardando ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar'
                )}
              </button>
            </>
          }
        >
          <div className="space-y-4">
            {erroresForm.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {erroresForm.general}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Espacio *</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Cabaña 4, Habitación 56..."
                className={`input-glass w-full ${erroresForm.nombre ? 'border-red-500' : ''}`}
              />
              {erroresForm.nombre && <p className="text-red-600 text-sm mt-1">{erroresForm.nombre}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Oficina *</label>
              <select
                value={formData.oficina_id}
                onChange={(e) => setFormData({ ...formData, oficina_id: e.target.value })}
                className={`input-glass w-full ${erroresForm.oficina_id ? 'border-red-500' : ''}`}
                disabled={modoModal === 'editar' && espacioSeleccionado?.total_tareas > 0}
              >
                <option value="">Seleccionar oficina...</option>
                {oficinas.map(ofi => (
                  <option key={ofi.id} value={ofi.id}>{ofi.nombre}</option>
                ))}
              </select>
              {erroresForm.oficina_id && <p className="text-red-600 text-sm mt-1">{erroresForm.oficina_id}</p>}
              {modoModal === 'editar' && espacioSeleccionado?.total_tareas > 0 && (
                <p className="text-amber-600 text-xs mt-1">No se puede cambiar la oficina (tiene tareas asociadas)</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo (opcional)</label>
              <input
                type="text"
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                placeholder="Ej: cabaña, habitación, sala..."
                className="input-glass w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones (opcional)</label>
              <textarea
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                placeholder="Detalles adicionales del espacio..."
                rows="3"
                className="input-glass w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                className="input-glass w-full"
              >
                <option value="activo">Activo</option>
                <option value="en_mantenimiento">En Mantenimiento</option>
                <option value="inactivo">Inactivo</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Los espacios inactivos no aparecerán en las tareas</p>
            </div>
          </div>
        </Modal>

        {/* Modal Eliminar */}
        <Modal
          isOpen={modalEliminar}
          onClose={handleCerrarModalEliminar}
          title="Confirmar Eliminación"
          size="sm"
          footer={
            <>
              <button onClick={handleCerrarModalEliminar} className="btn-glass px-4 py-2" disabled={eliminando}>
                Cancelar
              </button>
              <button
                onClick={handleConfirmarEliminar}
                disabled={eliminando}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                {eliminando ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </>
                )}
              </button>
            </>
          }
        >
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">¿Eliminar espacio?</h3>
            <p className="text-gray-600 mb-4">
              ¿Está seguro de eliminar <strong>{espacioAEliminar?.nombre}</strong>?
            </p>
            
            {espacioAEliminar?.total_tareas > 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                <AlertTriangle className="w-5 h-5 inline mr-2" />
                <p className="font-semibold mb-1">Tiene {espacioAEliminar.total_tareas} tarea(s) asociada(s)</p>
                <p>Se desactivará en lugar de eliminarse. Podrás reactivarlo editándolo.</p>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                <p>Esta acción no se puede deshacer. El espacio será eliminado permanentemente.</p>
              </div>
            )}
          </div>
        </Modal>

        {/* Toast */}
        {notificacion && (
          <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
            <div className={`glass-card p-4 flex items-center gap-3 shadow-lg ${
              notificacion.tipo === 'success' ? 'border-l-4 border-emerald-500' : 'border-l-4 border-red-500'
            }`}>
              {notificacion.tipo === 'success' ? (
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
              <p className="text-gray-800 font-medium">{notificacion.mensaje}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Espacios;