import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckSquare,
  Search,
  Plus,
  Edit,
  Clock,
  AlertCircle,
  RefreshCw,
  Filter,
  X,
  User,
  Calendar,
  Flag,
  Briefcase,
  MapPin
} from 'lucide-react';
import adminService from '../../services/adminService';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';

function Tareas() {
  const navigate = useNavigate();

  // Estados principales
  const [tareas, setTareas] = useState([]);
  const [pagination, setPagination] = useState({});
  const [empleados, setEmpleados] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [espacios, setEspacios] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);

  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Estados de filtros
  const [filtros, setFiltros] = useState({
    estado: '',
    prioridad: '',
    empleado_id: '',
    departamento_id: '',
    vencidas: '',
    busqueda: '',
    archivada: '',
    page: 1,
    limit: 20
  });

  // Estados del modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoModal, setModoModal] = useState('crear');
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [modalConfirmarArchivar, setModalConfirmarArchivar] = useState(false);
  const [tareaParaArchivar, setTareaParaArchivar] = useState(null);

  // Estados del formulario
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    prioridad: 'media',
    tipoAsignacion: 'empleado',
    empleado_id: '',
    departamento_id: '',
    espacio_id: '',
    fecha_limite: ''
  });
  const [erroresForm, setErroresForm] = useState({});

  // Estado para notificaciones toast
  const [notificacion, setNotificacion] = useState(null);

  // Cargar tareas
  const cargarTareas = async () => {
    try {
      setError('');
      const data = await adminService.getTareas(filtros);
      setTareas(data.tareas || []);
      setPagination(data.pagination || {});
    } catch (err) {
      console.error('Error al cargar tareas:', err);
      if (err.message === 'No autenticado') {
        setError('Tu sesión ha expirado. Redirigiendo al login...');
      } else {
        setError(err.message || 'Error al cargar tareas');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Cargar estadísticas
  const cargarEstadisticas = async () => {
    try {
      const data = await adminService.getEstadisticasTareas();
      setEstadisticas(data);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    }
  };

  // Cargar empleados para el select
  const cargarEmpleados = async () => {
    try {
      const data = await adminService.getEmpleados({ activo: 1, limit: 100 });
      setEmpleados(data.empleados || []);
    } catch (err) {
      console.error('Error al cargar empleados:', err);
    }
  };

  // Cargar departamentos para el select
  const cargarDepartamentos = async () => {
    try {
      const data = await adminService.getDepartamentos(false);
      setDepartamentos(data.departamentos || []);
    } catch (err) {
      console.error('Error al cargar departamentos:', err);
    }
  };

  // Cargar espacios para el select
  const cargarEspacios = async () => {
    try {
      const data = await adminService.getEspacios({ estado: 'activo', limit: 100 });
      setEspacios(data.espacios || []);
    } catch (err) {
      console.error('Error al cargar espacios:', err);
    }
  };

  // Cargar al montar
  useEffect(() => {
    cargarTareas();
    cargarEstadisticas();
    cargarEmpleados();
    cargarDepartamentos();
    cargarEspacios();
  }, []);

  // Recargar cuando cambien los filtros
  useEffect(() => {
    if (!loading) {
      cargarTareas();
    }
  }, [filtros]);

  // Handlers de filtros
  const handleFiltroChange = (key, value) => {
    setFiltros(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      estado: '',
      prioridad: '',
      empleado_id: '',
      departamento_id: '',
      vencidas: '',
      busqueda: '',
      archivada: '',
      page: 1,
      limit: 20
    });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    cargarTareas();
    cargarEstadisticas();
  };

  // Handlers de paginación
  const handlePageChange = (newPage) => {
    setFiltros(prev => ({ ...prev, page: newPage }));
  };

  const handleItemsPerPageChange = (newLimit) => {
    setFiltros(prev => ({ ...prev, limit: newLimit, page: 1 }));
  };

  // Mostrar notificación toast
  const mostrarNotificacion = (mensaje, tipo = 'success') => {
    setNotificacion({ mensaje, tipo });
    setTimeout(() => setNotificacion(null), 3000);
  };

  // Handlers del modal
  const handleAbrirModalCrear = () => {
    setModoModal('crear');
    setTareaSeleccionada(null);
    setFormData({
      titulo: '',
      descripcion: '',
      prioridad: 'media',
      tipoAsignacion: 'empleado',
      empleado_id: '',
      departamento_id: '',
      espacio_id: '',
      fecha_limite: ''
    });
    setErroresForm({});
    setModalAbierto(true);
  };

  const handleAbrirModalEditar = (tarea) => {
    setModoModal('editar');
    setTareaSeleccionada(tarea);
    
    let fechaLimiteFormateada = '';
    if (tarea.fecha_limite) {
      const fecha = new Date(tarea.fecha_limite);
      fechaLimiteFormateada = fecha.toISOString().slice(0, 16);
    }

    let tipoAsignacion = 'empleado';
    let empleadoId = '';
    let departamentoId = '';

    if (tarea.departamento_asignado) {
      tipoAsignacion = 'departamento';
      departamentoId = tarea.departamento_asignado.id;
    } else if (tarea.empleado_asignado) {
      tipoAsignacion = 'empleado';
      empleadoId = tarea.empleado_asignado.id;
    }
    
    setFormData({
      titulo: tarea.titulo,
      descripcion: tarea.descripcion || '',
      prioridad: tarea.prioridad,
      tipoAsignacion: tipoAsignacion,
      empleado_id: empleadoId,
      departamento_id: departamentoId,
      espacio_id: tarea.espacio_asignado?.id || '',
      fecha_limite: fechaLimiteFormateada,
      estado: tarea.estado
    });
    setErroresForm({});
    setModalAbierto(true);
  };

  const handleCerrarModal = () => {
    setModalAbierto(false);
    setTareaSeleccionada(null);
    setFormData({
      titulo: '',
      descripcion: '',
      prioridad: 'media',
      tipoAsignacion: 'empleado',
      empleado_id: '',
      departamento_id: '',
      espacio_id: '',
      fecha_limite: ''
    });
    setErroresForm({});
  };

  // Validar formulario
  const validarFormulario = () => {
    const errores = {};

    if (!formData.titulo.trim()) {
      errores.titulo = 'El título es requerido';
    }

    setErroresForm(errores);
    return Object.keys(errores).length === 0;
  };

  // Guardar tarea
  const handleGuardar = async () => {
    if (!validarFormulario()) {
      return;
    }

    setGuardando(true);

    try {
      const datos = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        prioridad: formData.prioridad,
        espacio_id: formData.espacio_id || null,
        fecha_limite: formData.fecha_limite || null
      };

      if (formData.tipoAsignacion === 'empleado') {
        datos.empleado_id = formData.empleado_id || null;
        datos.departamento_id = null;
      } else {
        datos.empleado_id = null;
        datos.departamento_id = formData.departamento_id || null;
      }

      if (modoModal === 'editar' && formData.estado) {
        datos.estado = formData.estado;
      }

      if (modoModal === 'crear') {
        await adminService.crearTarea(datos);
        mostrarNotificacion('Tarea creada exitosamente', 'success');
      } else {
        await adminService.actualizarTarea(tareaSeleccionada.id, datos);
        mostrarNotificacion('Tarea actualizada exitosamente', 'success');
      }

      handleCerrarModal();
      cargarTareas();
      cargarEstadisticas();
    } catch (err) {
      console.error('Error al guardar tarea:', err);
      setErroresForm({ general: err.message || 'Error al guardar tarea' });
    } finally {
      setGuardando(false);
    }
  };

  // Cambiar estado de tarea
  const handleCambiarEstado = async (tarea, nuevoEstado) => {
    try {
      await adminService.cambiarEstadoTarea(tarea.id, nuevoEstado);
      mostrarNotificacion(`Tarea marcada como ${nuevoEstado.replace('_', ' ')}`, 'success');
      cargarTareas();
      cargarEstadisticas();
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      mostrarNotificacion(err.message || 'Error al cambiar estado', 'error');
    }
  };

  // Archivar/Desarchivar tarea
// Abrir modal de confirmación para archivar/desarchivar
const handleAbrirConfirmarArchivar = (tarea) => {
  setTareaParaArchivar(tarea);
  setModalConfirmarArchivar(true);
};

// Cerrar modal de confirmación
const handleCerrarConfirmarArchivar = () => {
  setModalConfirmarArchivar(false);
  setTareaParaArchivar(null);
};

// Archivar/Desarchivar tarea (ejecuta después de confirmar en modal)
const handleArchivarTarea = async () => {
  if (!tareaParaArchivar) return;

  const nuevoEstado = !tareaParaArchivar.archivada;

  try {
    await adminService.actualizarTarea(tareaParaArchivar.id, { archivada: nuevoEstado ? 1 : 0 });
    mostrarNotificacion(`Tarea ${nuevoEstado ? 'archivada' : 'desarchivada'} exitosamente`, 'success');
    handleCerrarConfirmarArchivar();
    cargarTareas();
    cargarEstadisticas();
  } catch (err) {
    console.error('Error al archivar tarea:', err);
    mostrarNotificacion(err.message || 'Error al archivar tarea', 'error');
  }
};

  const handleVolver = () => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        navigate('/admin/dashboard');
      });
    } else {
      navigate('/admin/dashboard');
    }
  };

  const getPrioridadColor = (prioridad) => {
    const colores = {
      alta: 'bg-red-100 text-red-700 border-red-200',
      media: 'bg-amber-100 text-amber-700 border-amber-200',
      baja: 'bg-blue-100 text-blue-700 border-blue-200'
    };
    return colores[prioridad] || colores.media;
  };

  const getEstadoColor = (estado) => {
  const colores = {
    pendiente: 'bg-gray-100 text-gray-700 border-gray-200',
    en_progreso: 'bg-amber-100 text-amber-700 border-amber-200',
    completada: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    no_realizable: 'bg-red-100 text-red-700 border-red-200'
  };
  return colores[estado] || colores.pendiente;
};

  // Agregar función para obtener texto legible del estado
  const getEstadoTexto = (estado) => {
    const textos = {
      pendiente: 'Pendiente',
      en_progreso: 'En Progreso',
      completada: 'Completada',
      no_realizable: 'No Realizable'
    };
    return textos[estado] || estado;
  };

  const getTiempoRestante = (fechaLimite) => {
    if (!fechaLimite) return null;
    
    const ahora = new Date();
    const limite = new Date(fechaLimite);
    const diff = limite - ahora;
    
    if (diff < 0) return 'Vencida';
    
    const horas = Math.floor(diff / (1000 * 60 * 60));
    const dias = Math.floor(horas / 24);
    
    if (dias > 0) return `${dias}d restantes`;
    if (horas > 0) return `${horas}h restantes`;
    return 'Menos de 1h';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <RefreshCw className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando tareas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button onClick={handleVolver} className="btn-glass p-2" aria-label="Volver">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Gestión de Tareas</h1>
                <p className="text-sm text-gray-600">{pagination.total_items || 0} tareas registradas</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleRefresh} disabled={refreshing} className="btn-glass px-4 py-2 flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Actualizar</span>
              </button>
              <button onClick={handleAbrirModalCrear} className="btn-glass-primary px-4 py-2 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nueva Tarea
              </button>
            </div>
          </div>

          {estadisticas && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800">{estadisticas.por_estado.total}</p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-600">{estadisticas.por_estado.pendiente}</p>
                <p className="text-sm text-gray-600">Pendientes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{estadisticas.por_estado.en_progreso}</p>
                <p className="text-sm text-gray-600">En Progreso</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">{estadisticas.por_estado.completada}</p>
                <p className="text-sm text-gray-600">Completadas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{estadisticas.vencidas}</p>
                <p className="text-sm text-gray-600">Vencidas</p>
              </div>
            </div>
          )}
        </div>

        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="font-semibold text-gray-800">Filtros</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filtros.busqueda}
                  onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
                  placeholder="Título o descripción..."
                  className="input-glass pl-10 w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select value={filtros.estado} onChange={(e) => handleFiltroChange('estado', e.target.value)} className="input-glass w-full">
                <option value="">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="en_progreso">En Progreso</option>
                <option value="completada">Completada</option>
                <option value="no_realizable">No Realizable</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
              <select value={filtros.prioridad} onChange={(e) => handleFiltroChange('prioridad', e.target.value)} className="input-glass w-full">
                <option value="">Todas</option>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Empleado</label>
              <select value={filtros.empleado_id} onChange={(e) => handleFiltroChange('empleado_id', e.target.value)} className="input-glass w-full">
                <option value="">Todos</option>
                {empleados.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.nombre_completo}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Departamento</label>
              <select value={filtros.departamento_id} onChange={(e) => handleFiltroChange('departamento_id', e.target.value)} className="input-glass w-full">
                <option value="">Todos</option>
                {departamentos.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filtros.vencidas === '1'}
                  onChange={(e) => handleFiltroChange('vencidas', e.target.checked ? '1' : '')}
                  className="w-4 h-4 text-red-600 rounded"
                />
                <span className="text-sm text-gray-700">Solo mostrar vencidas</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filtros.archivada === '1'}
                  onChange={(e) => handleFiltroChange('archivada', e.target.checked ? '1' : '')}
                  className="w-4 h-4 text-gray-600 rounded"
                />
                <span className="text-sm text-gray-700">Mostrar archivadas</span>
              </label>
            </div>
            
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

        {tareas.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <CheckSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No hay tareas</h3>
            <p className="text-gray-600 mb-4">No se encontraron tareas con los filtros aplicados</p>
            <button onClick={handleAbrirModalCrear} className="btn-glass-primary px-6 py-2">
              Crear Primera Tarea
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 mb-6">
              {tareas.map(tarea => (
                <div key={tarea.id} className="glass-card p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg font-bold text-gray-800">{tarea.titulo}</h3>
                        
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getEstadoColor(tarea.estado)}`}>
                          {getEstadoTexto(tarea.estado)}
                        </span>
                        
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getPrioridadColor(tarea.prioridad)}`}>
                          <Flag className="w-3 h-3 inline mr-1" />
                          {tarea.prioridad.charAt(0).toUpperCase() + tarea.prioridad.slice(1)}
                        </span>
                        
                        {tarea.vencida && (
                          <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full border border-red-200">
                            <AlertCircle className="w-3 h-3 inline mr-1" />
                            VENCIDA
                          </span>
                        )}
                      </div>

                      {tarea.descripcion && (
                        <p className="text-sm text-gray-600 mb-3">{tarea.descripcion}</p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        {tarea.empleado_asignado && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <User className="w-4 h-4" />
                            {tarea.empleado_asignado.nombre_completo}
                          </div>
                        )}

                        {tarea.departamento_asignado && (
                          <div className="flex items-center gap-2 text-indigo-600 font-semibold">
                            <Briefcase className="w-4 h-4" />
                            Dpto: {tarea.departamento_asignado.nombre}
                          </div>
                        )}

                        {tarea.espacio_asignado && (
                          <div className="flex items-center gap-2 text-teal-600">
                            <MapPin className="w-4 h-4" />
                            {tarea.espacio_asignado.nombre} ({tarea.espacio_asignado.oficina})
                          </div>
                        )}
                        
                        {tarea.fecha_limite && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {new Date(tarea.fecha_limite).toLocaleDateString('es-AR', { 
                              day: '2-digit', 
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        )}
                        
                        {tarea.fecha_limite && tarea.estado !== 'completada' && (
                          <div className={`flex items-center gap-2 ${tarea.vencida ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                            <Clock className="w-4 h-4" />
                            {getTiempoRestante(tarea.fecha_limite)}
                          </div>
                        )}
                      </div>

                      {tarea.respuesta_empleado && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">Respuesta:</p>
                          <p className="text-sm text-gray-700">{tarea.respuesta_empleado}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button onClick={() => handleAbrirModalEditar(tarea)} className="btn-glass p-2" title="Editar">
                        <Edit className="w-4 h-4 text-blue-600" />
                      </button>
                      
                      {tarea.estado === 'pendiente' && (
                        <button onClick={() => handleCambiarEstado(tarea, 'en_progreso')} className="btn-glass p-2" title="Iniciar">
                          <Clock className="w-4 h-4 text-amber-600" />
                        </button>
                      )}
                      
                      {tarea.estado === 'en_progreso' && (
                        <button onClick={() => handleCambiarEstado(tarea, 'completada')} className="btn-glass p-2" title="Completar">
                          <CheckSquare className="w-4 h-4 text-emerald-600" />
                        </button>
                      )}
                      
                     {(tarea.estado === 'completada' || tarea.estado === 'no_realizable') && (
                      <button 
                        onClick={() => handleAbrirConfirmarArchivar(tarea)} 
                        className="btn-glass p-2" 
                        title={tarea.archivada ? "Desarchivar" : "Archivar"}
                      >
                        <X className={`w-4 h-4 ${tarea.archivada ? 'text-green-600' : 'text-gray-600'}`} />
                      </button>
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

        <Modal
          isOpen={modalAbierto}
          onClose={handleCerrarModal}
          title={modoModal === 'crear' ? 'Nueva Tarea' : 'Editar Tarea'}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Título *</label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ej: Reparar aire acondicionado habitación 5"
                className={`input-glass w-full ${erroresForm.titulo ? 'border-red-500' : ''}`}
              />
              {erroresForm.titulo && <p className="text-red-600 text-sm mt-1">{erroresForm.titulo}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Detalles adicionales de la tarea..."
                rows="3"
                className="input-glass w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
              <select
                value={formData.prioridad}
                onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
                className="input-glass w-full"
              >
                <option value="baja">Baja (72 horas)</option>
                <option value="media">Media (24 horas)</option>
                <option value="alta">Alta (8 horas)</option>
              </select>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">Asignar tarea a:</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="tipoAsignacion"
                    value="empleado"
                    checked={formData.tipoAsignacion === 'empleado'}
                    onChange={(e) => setFormData({ ...formData, tipoAsignacion: e.target.value, departamento_id: '' })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Empleado individual</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="tipoAsignacion"
                    value="departamento"
                    checked={formData.tipoAsignacion === 'departamento'}
                    onChange={(e) => setFormData({ ...formData, tipoAsignacion: e.target.value, empleado_id: '' })}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-medium text-gray-700">Departamento completo</span>
                  </div>
                </label>
              </div>
            </div>

            {formData.tipoAsignacion === 'empleado' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar empleado</label>
                <select
                  value={formData.empleado_id}
                  onChange={(e) => setFormData({ ...formData, empleado_id: e.target.value })}
                  className="input-glass w-full"
                >
                  <option value="">Sin asignar</option>
                  {empleados.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.nombre_completo}</option>
                  ))}
                </select>
              </div>
            )}

            {formData.tipoAsignacion === 'departamento' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar departamento</label>
                <select
                  value={formData.departamento_id}
                  onChange={(e) => setFormData({ ...formData, departamento_id: e.target.value })}
                  className="input-glass w-full"
                >
                  <option value="">Sin asignar</option>
                  {departamentos.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.nombre}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Todos los empleados del departamento verán esta tarea</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Ubicación/Espacio (opcional)
              </label>
              <select
                value={formData.espacio_id}
                onChange={(e) => setFormData({ ...formData, espacio_id: e.target.value })}
                className="input-glass w-full"
              >
                <option value="">Sin asignar</option>
                {espacios.map(esp => (
                  <option key={esp.id} value={esp.id}>
                    {esp.nombre} - {esp.oficina.nombre}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Especifica el lugar donde se debe realizar la tarea</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha límite (opcional)</label>
              <input
                type="datetime-local"
                value={formData.fecha_limite}
                onChange={(e) => setFormData({ ...formData, fecha_limite: e.target.value })}
                className="input-glass w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Si no se especifica, se calculará automáticamente según la prioridad
              </p>
            </div>

           {modoModal === 'editar' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  className="input-glass w-full"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="en_progreso">En Progreso</option>
                  <option value="completada">Completada</option>
                  <option value="no_realizable">No Realizable</option>
                </select>
              </div>
            )}
          </div>
        </Modal>

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

        {/* Modal de confirmación para archivar/desarchivar */}
{modalConfirmarArchivar && tareaParaArchivar && (
  <Modal
    isOpen={modalConfirmarArchivar}
    onClose={handleCerrarConfirmarArchivar}
    title={tareaParaArchivar.archivada ? "Desarchivar Tarea" : "Archivar Tarea"}
    size="sm"
    footer={
      <>
        <button 
          onClick={handleCerrarConfirmarArchivar} 
          className="btn-glass px-4 py-2"
        >
          Cancelar
        </button>
        <button 
          onClick={handleArchivarTarea} 
          className={`px-4 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2 ${
            tareaParaArchivar.archivada 
              ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' 
              : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          {tareaParaArchivar.archivada ? 'Desarchivar' : 'Archivar'}
        </button>
      </>
    }
  >
    <div className="space-y-4">
      <p className="text-gray-700">
        {tareaParaArchivar.archivada ? (
          <>
            ¿Estás seguro de <strong>desarchivar</strong> esta tarea? Volverá a aparecer en el listado principal.
          </>
        ) : (
          <>
            ¿Estás seguro de <strong>archivar</strong> esta tarea? Se ocultará del listado principal pero podrás verla activando el filtro "Mostrar archivadas".
          </>
        )}
      </p>
      
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm font-semibold text-gray-800 mb-1">{tareaParaArchivar.titulo}</p>
        {tareaParaArchivar.descripcion && (
          <p className="text-sm text-gray-600">{tareaParaArchivar.descripcion}</p>
        )}
      </div>
    </div>
  </Modal>
)}
      </div>
    </div>
  );
}

export default Tareas;