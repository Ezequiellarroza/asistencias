import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckSquare,
  Clock,
  AlertCircle,
  Loader2,
  Flag,
  Calendar,
  CheckCircle,
  XCircle,
  PlayCircle,
  Briefcase,
  Plus,
  User,
  MapPin
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import empleadoService from '../../services/empleadoService';

function Tareas() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Estados principales
  const [tareas, setTareas] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [pagination, setPagination] = useState({});
  const [empleado, setEmpleado] = useState(null);
  const [departamentos, setDepartamentos] = useState([]);
  const [espacios, setEspacios] = useState([]);

  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados de filtros
  const [filtros, setFiltros] = useState({
    estado: '',
    prioridad: '',
    vencidas: '',
    page: 1,
    limit: 20
  });

  // Estados del modal de completar
  const [modalCompletarAbierto, setModalCompletarAbierto] = useState(false);
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
  const [respuestaEmpleado, setRespuestaEmpleado] = useState('');

  // Estados del modal de crear tarea
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    prioridad: 'media',
    tipo_asignacion: 'departamento',
    departamento_id: '',
    espacio_id: '',
    fecha_limite: ''
  });

  // Cargar datos del empleado
  useEffect(() => {
    const empleadoData = localStorage.getItem('empleado');
    if (empleadoData) {
      setEmpleado(JSON.parse(empleadoData));
    }
  }, []);

  // Cargar departamentos
  const cargarDepartamentos = async () => {
    try {
      const response = await empleadoService.getDepartamentos();
      setDepartamentos(response.departamentos || []);
    } catch (err) {
      console.error('Error al cargar departamentos:', err);
    }
  };

  // Cargar espacios
  const cargarEspacios = async () => {
    try {
      const response = await empleadoService.getEspacios();
      setEspacios(response.espacios || []);
    } catch (err) {
      console.error('Error al cargar espacios:', err);
    }
  };

  // Cargar al montar
  useEffect(() => {
    cargarDepartamentos();
    cargarEspacios();
  }, []);

  // Cargar tareas
  const cargarTareas = async () => {
    try {
      setError('');
      const data = await empleadoService.getTareas(filtros);
      setTareas(data.tareas || []);
      setEstadisticas(data.estadisticas || null);
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
    }
  };

  // Cargar al montar y cuando cambien filtros
  useEffect(() => {
    cargarTareas();
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
      vencidas: '',
      page: 1,
      limit: 20
    });
  };

  // Cambiar estado directo (sin modal)
  const handleCambiarEstadoDirecto = async (tarea, nuevoEstado) => {
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await empleadoService.cambiarEstadoTarea(tarea.id, nuevoEstado);
      setSuccess(`Tarea marcada como ${nuevoEstado.replace('_', ' ')}`);
      await cargarTareas();
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      if (err.message === 'No autenticado') {
        setError('Tu sesión ha expirado. Redirigiendo al login...');
      } else {
        setError(err.message || 'Error al cambiar estado');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Abrir modal de completar con comentario
  const handleAbrirModalCompletar = (tarea) => {
    setTareaSeleccionada(tarea);
    setRespuestaEmpleado('');
    setModalCompletarAbierto(true);
  };

  const handleCerrarModalCompletar = () => {
    setModalCompletarAbierto(false);
    setTareaSeleccionada(null);
    setRespuestaEmpleado('');
  };

  // Completar tarea con comentario
  const handleCompletarConComentario = async () => {
    if (!tareaSeleccionada) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await empleadoService.cambiarEstadoTarea(
        tareaSeleccionada.id,
        'completada',
        respuestaEmpleado.trim() || null
      );
      
      // ✅ CAMBIO: Recargar tareas ANTES de cerrar modal
      await cargarTareas();
      
      setSuccess('¡Tarea completada exitosamente!');
      handleCerrarModalCompletar();
    } catch (err) {
      console.error('Error al completar tarea:', err);
      if (err.message === 'No autenticado') {
        setError('Tu sesión ha expirado. Redirigiendo al login...');
      } else {
        setError(err.message || 'Error al completar tarea');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ NUEVA FUNCIÓN: Marcar como no realizable
  const handleMarcarNoRealizable = async () => {
    if (!tareaSeleccionada) return;

    // Validar que haya escrito un motivo
    if (!respuestaEmpleado.trim()) {
      setError('Debes especificar el motivo por el cual no se pudo completar la tarea');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await empleadoService.cambiarEstadoTarea(
        tareaSeleccionada.id,
        'no_realizable',
        respuestaEmpleado.trim()
      );
      
      // Recargar tareas ANTES de cerrar modal
      await cargarTareas();
      
      setSuccess('Tarea marcada como no realizable. El administrador será notificado.');
      handleCerrarModalCompletar();
    } catch (err) {
      console.error('Error al marcar como no realizable:', err);
      if (err.message === 'No autenticado') {
        setError('Tu sesión ha expirado. Redirigiendo al login...');
      } else {
        setError(err.message || 'Error al actualizar tarea');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handlers del modal de crear tarea
  const handleAbrirModalCrear = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      prioridad: 'media',
      tipo_asignacion: 'departamento',
      departamento_id: '',
      espacio_id: '',
      fecha_limite: ''
    });
    setModalCrearAbierto(true);
  };

  const handleCerrarModalCrear = () => {
    setModalCrearAbierto(false);
  };

  const handleCrearTarea = async () => {
    // Validaciones
    if (!formData.titulo.trim()) {
      setError('El título es obligatorio');
      return;
    }

    if (formData.tipo_asignacion === 'departamento' && !formData.departamento_id) {
      setError('Debes seleccionar un departamento');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const datos = {
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim() || null,
        prioridad: formData.prioridad,
        tipo_asignacion: formData.tipo_asignacion,
        espacio_id: formData.espacio_id || null,
        fecha_limite: formData.fecha_limite || null
      };

      // Agregar ID según tipo de asignación
      if (formData.tipo_asignacion === 'departamento') {
        datos.departamento_id = parseInt(formData.departamento_id);
      }

      await empleadoService.crearTarea(datos);
      
      setSuccess('¡Tarea creada exitosamente!');
      handleCerrarModalCrear();
      cargarTareas();
    } catch (err) {
      console.error('Error al crear tarea:', err);
      if (err.message === 'No autenticado') {
        setError('Tu sesión ha expirado. Redirigiendo al login...');
      } else {
        setError(err.message || 'Error al crear tarea');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Función para obtener color de prioridad
  const getPrioridadColor = (prioridad) => {
    const colores = {
      alta: 'bg-red-100 text-red-700 border-red-200',
      media: 'bg-amber-100 text-amber-700 border-amber-200',
      baja: 'bg-blue-100 text-blue-700 border-blue-200'
    };
    return colores[prioridad] || colores.media;
  };

  // Función para obtener color de estado
  const getEstadoColor = (estado) => {
    const colores = {
      pendiente: 'bg-gray-100 text-gray-700 border-gray-200',
      en_progreso: 'bg-amber-100 text-amber-700 border-amber-200',
      completada: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      no_realizable: 'bg-red-100 text-red-700 border-red-200'
    };
    return colores[estado] || colores.pendiente;
  };

  // ✅ NUEVA FUNCIÓN: Obtener texto legible del estado
  const getEstadoTexto = (estado) => {
    const textos = {
      pendiente: 'Pendiente',
      en_progreso: 'En Progreso',
      completada: 'Completada',
      no_realizable: 'No Realizable'
    };
    return textos[estado] || estado;
  };

  // Función para calcular tiempo restante
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando tareas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-amber-50 p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/empleado/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Mis Tareas</h1>
                <p className="text-gray-600 text-sm">
                  {empleado?.nombre} {empleado?.apellido}
                </p>
              </div>
            </div>
            
            {/* Botón Nueva Tarea */}
            <button
              onClick={handleAbrirModalCrear}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nueva Tarea
            </button>
          </div>

          {/* Estadísticas */}
          {estadisticas && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800">{estadisticas.total}</p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-600">{estadisticas.pendientes}</p>
                <p className="text-sm text-gray-600">Pendientes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{estadisticas.en_progreso}</p>
                <p className="text-sm text-gray-600">En Progreso</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">{estadisticas.completadas}</p>
                <p className="text-sm text-gray-600">Completadas</p>
              </div>
            </div>
          )}

          {/* Alertas de vencidas */}
          {estadisticas && estadisticas.vencidas > 0 && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-semibold">
                Tienes {estadisticas.vencidas} tarea{estadisticas.vencidas > 1 ? 's' : ''} vencida{estadisticas.vencidas > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Filtros */}
        <div className="glass-card p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                value={filtros.estado}
                onChange={(e) => handleFiltroChange('estado', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">Todas</option>
                <option value="pendiente">Pendiente</option>
                <option value="en_progreso">En Progreso</option>
                <option value="completada">Completada</option>
                <option value="no_realizable">No Realizable</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
              <select
                value={filtros.prioridad}
                onChange={(e) => handleFiltroChange('prioridad', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">Todas</option>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filtros.vencidas === '1'}
                  onChange={(e) => handleFiltroChange('vencidas', e.target.checked ? '1' : '')}
                  className="w-4 h-4 text-red-600 rounded"
                />
                <span className="text-sm text-gray-700">Solo vencidas</span>
              </label>
            </div>
          </div>

          {(filtros.estado || filtros.prioridad || filtros.vencidas) && (
            <div className="mt-4">
              <button onClick={handleLimpiarFiltros} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        {/* Mensajes */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
            <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Lista de tareas */}
        {tareas.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <CheckSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No tienes tareas asignadas</h3>
            <p className="text-gray-600">
              {filtros.estado || filtros.prioridad || filtros.vencidas
                ? 'No se encontraron tareas con los filtros aplicados'
                : 'Cuando te asignen tareas, aparecerán aquí'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tareas.map(tarea => (
              <div key={tarea.id} className="glass-card p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-bold text-gray-800">{tarea.titulo}</h3>
                      
                      {/* ✅ CAMBIO: Usar getEstadoTexto() y getEstadoColor() */}
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getEstadoColor(tarea.estado)}`}>
                        {getEstadoTexto(tarea.estado)}
                      </span>
                      
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getPrioridadColor(tarea.prioridad)}`}>
                        <Flag className="w-3 h-3 inline mr-1" />
                        {tarea.prioridad.charAt(0).toUpperCase() + tarea.prioridad.slice(1)}
                      </span>

                      {tarea.es_de_departamento && (
                        <span className="px-2 py-1 text-xs font-semibold bg-indigo-100 text-indigo-700 rounded-full border border-indigo-200 flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          Tarea de {tarea.departamento_nombre}
                        </span>
                      )}
                      
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

                    <div className="space-y-2 text-sm">
                      {tarea.espacio_asignado && (
                        <div className="flex items-center gap-2 text-teal-600">
                          <MapPin className="w-4 h-4" />
                          <span>{tarea.espacio_asignado.nombre} ({tarea.espacio_asignado.oficina})</span>
                        </div>
                      )}

                      {tarea.fecha_limite && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Vencimiento: {new Date(tarea.fecha_limite).toLocaleDateString('es-AR', { 
                              day: '2-digit', 
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      )}
                      
                      {tarea.fecha_limite && tarea.estado !== 'completada' && tarea.estado !== 'no_realizable' && (
                        <div className={`flex items-center gap-2 ${tarea.vencida ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                          <Clock className="w-4 h-4" />
                          <span>{getTiempoRestante(tarea.fecha_limite)}</span>
                        </div>
                      )}

                      {tarea.creado_por && (
                        <div className="text-xs text-gray-500">
                          {tarea.tipo_creador === 'empleado' ? 'Creado por' : 'Asignado por'}: {tarea.creado_por}
                        </div>
                      )}
                    </div>

                    {tarea.respuesta_empleado && (
                      <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                        <p className="text-xs text-emerald-600 mb-1 font-semibold">Mi respuesta:</p>
                        <p className="text-sm text-gray-700">{tarea.respuesta_empleado}</p>
                      </div>
                    )}

                    {tarea.tiempo_resolucion_minutos && tarea.estado === 'completada' && (
                      <div className="mt-2 text-xs text-gray-500">
                        Completada en: {tarea.tiempo_resolucion_minutos} minutos
                      </div>
                    )}
                  </div>

                  {/* ✅ CAMBIO: No mostrar botones si está completada O no_realizable */}
                  {tarea.estado !== 'completada' && tarea.estado !== 'no_realizable' && (
                    <div className="flex flex-col gap-2 ml-4">
                      {tarea.estado === 'pendiente' && (
                        <button
                          onClick={() => handleCambiarEstadoDirecto(tarea, 'en_progreso')}
                          disabled={submitting}
                          className="glass-card p-3 hover:shadow-lg transition-all disabled:opacity-50"
                          title="Iniciar"
                        >
                          <PlayCircle className="w-5 h-5 text-amber-600" />
                        </button>
                      )}
                      
                      {tarea.estado === 'en_progreso' && (
                        <button
                          onClick={() => handleAbrirModalCompletar(tarea)}
                          disabled={submitting}
                          className="glass-card p-3 hover:shadow-lg transition-all disabled:opacity-50"
                          title="Completar"
                        >
                          <CheckSquare className="w-5 h-5 text-emerald-600" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de crear tarea */}
        {modalCrearAbierto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="glass-card max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Nueva Tarea</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    placeholder="Ej: Revisar equipos de climatización"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="Descripción detallada de la tarea..."
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
                  <select
                    value={formData.prioridad}
                    onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Asignar a</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 border border-gray-200">
                      <input
                        type="radio"
                        name="tipo_asignacion"
                        value="empleado"
                        checked={formData.tipo_asignacion === 'empleado'}
                        onChange={(e) => setFormData({ ...formData, tipo_asignacion: e.target.value, departamento_id: '' })}
                        className="w-4 h-4 text-emerald-600"
                      />
                      <User className="w-4 h-4 text-emerald-600" />
                      <div>
                        <span className="font-medium">Asignarme a mí mismo</span>
                        <p className="text-xs text-gray-500">Esta tarea será visible solo para ti</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 border border-gray-200">
                      <input
                        type="radio"
                        name="tipo_asignacion"
                        value="departamento"
                        checked={formData.tipo_asignacion === 'departamento'}
                        onChange={(e) => setFormData({ ...formData, tipo_asignacion: e.target.value })}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <Briefcase className="w-4 h-4 text-indigo-600" />
                      <div>
                        <span className="font-medium">Asignar a un departamento</span>
                        <p className="text-xs text-gray-500">Todos los empleados del departamento verán esta tarea</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 border border-gray-200">
                      <input
                        type="radio"
                        name="tipo_asignacion"
                        value="sin_asignar"
                        checked={formData.tipo_asignacion === 'sin_asignar'}
                        onChange={(e) => setFormData({ ...formData, tipo_asignacion: e.target.value, departamento_id: '' })}
                        className="w-4 h-4 text-gray-600"
                      />
                      <AlertCircle className="w-4 h-4 text-gray-600" />
                      <div>
                        <span className="font-medium">Sin asignar</span>
                        <p className="text-xs text-gray-500">La tarea quedará pendiente de asignación</p>
                      </div>
                    </label>
                  </div>
                </div>

                {formData.tipo_asignacion === 'departamento' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Departamento <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.departamento_id}
                      onChange={(e) => setFormData({ ...formData, departamento_id: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar departamento...</option>
                      {departamentos.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.nombre}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Todos los empleados del departamento verán esta tarea
                    </p>
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Si no se especifica, se asignará automáticamente según la prioridad
                  </p>
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-6">
                <button
                  onClick={handleCerrarModalCrear}
                  disabled={submitting}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCrearTarea}
                  disabled={submitting}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Crear Tarea
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ✅ MODAL DE COMPLETAR ACTUALIZADO */}
        {modalCompletarAbierto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="glass-card max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Finalizar Tarea</h3>
              
              <p className="text-sm text-gray-600 mb-4">
                ¿Pudiste completar la tarea o hubo algún inconveniente?
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones {!respuestaEmpleado.trim() && <span className="text-gray-400">(opcional para completar)</span>}
                </label>
                <textarea
                  value={respuestaEmpleado}
                  onChange={(e) => setRespuestaEmpleado(e.target.value)}
                  placeholder="Ej: Reparado el aire acondicionado, reemplazado el filtro..."
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  * Si marcas como "No se pudo completar", debes especificar el motivo
                </p>
              </div>

              {/* ✅ Mostrar error en el modal */}
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex flex-col gap-2">
                {/* Botón Completar (Verde) */}
                <button
                  onClick={handleCompletarConComentario}
                  disabled={submitting}
                  className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CheckSquare className="w-5 h-5" />
                      Completar Tarea
                    </>
                  )}
                </button>

                {/* ✅ NUEVO: Botón No se pudo completar (Rojo) */}
                <button
                  onClick={handleMarcarNoRealizable}
                  disabled={submitting}
                  className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5" />
                      No se pudo completar
                    </>
                  )}
                </button>

                {/* Botón Cancelar */}
                <button
                  onClick={handleCerrarModalCompletar}
                  disabled={submitting}
                  className="w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Tareas;